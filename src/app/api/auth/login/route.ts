import { NextResponse } from "next/server";

import { env, hasSupabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validators/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
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

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Không thể kết nối Supabase." }, { status: 503 });
  }

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

  return NextResponse.json({ ok: true, redirect });
}
