import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { env, hasSupabaseConfig } from "@/lib/env";
import { loginSchema } from "@/lib/validators/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    if (!env.DEMO_MODE) {
      return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
    }
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  // Collect the session cookies produced by signInWithPassword so we can attach
  // them to the JSON response explicitly. next/headers cookie writes don't
  // reliably survive a custom NextResponse in a route handler — the same reason
  // the OAuth callback attaches cookies by hand.
  const pendingCookies: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(env.SUPABASE_URL!, env.SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          pendingCookies.push({ name, value, options: options ?? {} });
        });
      },
    },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email.toLowerCase(),
    password: parsed.data.password,
  });

  if (error) {
    return NextResponse.json({ error: "Sai email hoặc mật khẩu." }, { status: 401 });
  }

  // Fetch role to determine redirect destination
  let redirect = "/dashboard";
  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profile?.role === "admin") redirect = "/admin";
  }

  // Honor an explicit, safe relative `next` (e.g. the /oauth/consent flow).
  // Ignore the bare default so admins still land on /admin from a plain login.
  const rawNext = typeof body?.next === "string" ? body.next : null;
  if (rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") && rawNext !== "/dashboard") {
    redirect = rawNext;
  }

  const response = NextResponse.json({ ok: true, redirect });
  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(name, value, options);
  }
  return response;
}
