import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { env, hasSupabaseConfig } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Provider-side error (e.g. user cancelled the Google consent screen)
  const providerError = searchParams.get("error");
  if (providerError) {
    const reason = providerError === "access_denied" ? "oauth_denied" : "oauth_failed";
    return NextResponse.redirect(new URL(`/login?error=${reason}`, origin));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth_missing_code", origin));
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.redirect(new URL("/login?error=oauth_server", origin));
  }

  // Collect the auth cookies produced by exchangeCodeForSession so we can attach
  // them to the FINAL redirect response — this is what actually persists the
  // session in the browser. (next/headers cookie writes don't reliably survive a
  // NextResponse.redirect in a route handler.)
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

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", origin));
  }

  const user = data.user;
  const email = user.email ?? "";
  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.user_metadata?.user_name ??
    email.split("@")[0] ??
    "Bạn";

  // Use admin client for profile bootstrap when available; fall back to the
  // authenticated session client (RLS lets the user upsert their own profile).
  const admin = createAdminClient();
  const db = admin ?? supabase;

  // Ensure profile exists (first OAuth login)
  await db
    .from("profiles")
    .upsert({ id: user.id, email, full_name: name, role: "user" }, { onConflict: "id" });

  // Create free subscription if not present
  const { data: sub } = await db
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!sub) {
    await db.from("subscriptions").insert({ user_id: user.id, status: "free" });
  }

  // Create streak row if not present
  const { data: streak } = await db
    .from("streaks")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!streak) {
    await db.from("streaks").insert({ user_id: user.id });
  }

  // Decide destination: new users onboard first, admins go to /admin.
  const { data: profile } = await db
    .from("profiles")
    .select("onboarding_goal, role")
    .eq("id", user.id)
    .maybeSingle();

  let destination = next;
  if (!profile?.onboarding_goal) {
    destination = "/onboarding";
  } else if (profile.role === "admin") {
    destination = "/admin";
  }

  // Attach the session cookies to the redirect so the browser is actually logged in.
  const response = NextResponse.redirect(new URL(destination, origin));
  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(name, value, options);
  }
  return response;
}
