import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { env, hasSupabaseConfig } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const TAG = "[oauth-callback]";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const providerError = searchParams.get("error");

  console.log(TAG, "incoming", {
    origin,
    host: request.headers.get("host"),
    hasCode: Boolean(code),
    next,
    providerError,
    providerErrorDescription: searchParams.get("error_description"),
    incomingCookies: request.cookies.getAll().map((c) => c.name),
  });

  // Provider-side error (e.g. user cancelled the Google consent screen)
  if (providerError) {
    console.warn(TAG, "provider returned error", providerError);
    const reason = providerError === "access_denied" ? "oauth_denied" : "oauth_failed";
    return NextResponse.redirect(new URL(`/login?error=${reason}`, origin));
  }

  if (!code) {
    console.warn(TAG, "no code in callback URL");
    return NextResponse.redirect(new URL("/login?error=oauth_missing_code", origin));
  }

  if (!hasSupabaseConfig()) {
    console.error(TAG, "Supabase not configured", {
      hasUrl: Boolean(env.SUPABASE_URL),
      hasKey: Boolean(env.SUPABASE_PUBLISHABLE_KEY),
    });
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
    console.error(TAG, "exchangeCodeForSession FAILED", {
      message: error?.message,
      status: error?.status,
      code: error?.code,
      name: error?.name,
      hasUser: Boolean(data?.user),
      // A verifier cookie is required for the PKCE exchange; if it is missing
      // (e.g. cookie set on a different host / SameSite dropped it) the exchange
      // fails with "invalid request" / "code verifier" errors.
      sawVerifierCookie: request.cookies.getAll().some((c) => c.name.includes("code-verifier")),
    });
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

  console.log(TAG, "exchange OK", {
    userId: user.id,
    email,
    cookiesToSet: pendingCookies.map((c) => c.name),
  });

  // Use admin client for profile bootstrap when available; fall back to the
  // authenticated session client (RLS lets the user upsert their own profile).
  const admin = createAdminClient();
  const db = admin ?? supabase;
  console.log(TAG, "db client", { usingAdmin: Boolean(admin) });

  // Ensure profile exists (first OAuth login)
  const { error: profileUpsertError } = await db
    .from("profiles")
    .upsert({ id: user.id, email, full_name: name, role: "user" }, { onConflict: "id" });
  if (profileUpsertError) {
    console.error(TAG, "profile upsert error", profileUpsertError.message);
  }

  // Create free subscription if not present
  const { data: sub } = await db
    .from("subscriptions")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!sub) {
    const { error: subError } = await db.from("subscriptions").insert({ user_id: user.id, status: "free" });
    if (subError) console.error(TAG, "subscription insert error", subError.message);
  }

  // Create streak row if not present
  const { data: streak } = await db
    .from("streaks")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!streak) {
    const { error: streakError } = await db.from("streaks").insert({ user_id: user.id });
    if (streakError) console.error(TAG, "streak insert error", streakError.message);
  }

  // Decide destination: new users onboard first, admins go to /admin.
  const { data: profile, error: profileReadError } = await db
    .from("profiles")
    .select("onboarding_goal, role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileReadError) {
    console.error(TAG, "profile read error", profileReadError.message);
  }

  let destination = next;
  if (!profile?.onboarding_goal) {
    destination = "/onboarding";
  } else if (profile.role === "admin") {
    destination = "/admin";
  }

  console.log(TAG, "redirecting", {
    destination,
    onboardingGoal: profile?.onboarding_goal ?? null,
    role: profile?.role ?? null,
    settingCookies: pendingCookies.map((c) => c.name),
  });

  // Attach the session cookies to the redirect so the browser is actually logged in.
  const response = NextResponse.redirect(new URL(destination, origin));
  for (const { name, value, options } of pendingCookies) {
    response.cookies.set(name, value, options);
  }
  return response;
}
