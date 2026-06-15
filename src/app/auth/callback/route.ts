import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth_missing_code", origin));
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/login?error=oauth_server", origin));
  }

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

  const admin = createAdminClient();
  if (admin) {
    // Ensure profile exists (first OAuth login creates the profile row)
    await admin
      .from("profiles")
      .upsert({ id: user.id, email, full_name: name, role: "user" }, { onConflict: "id" });

    // Create free subscription if not already present
    const { data: sub } = await admin
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (!sub) {
      await admin.from("subscriptions").insert({ user_id: user.id, status: "free" });
    }

    // Create streak row if not present
    const { data: streak } = await admin
      .from("streaks")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!streak) {
      await admin.from("streaks").insert({ user_id: user.id });
    }

    // New OAuth users (no onboarding_goal) go through onboarding first
    const { data: profile } = await admin
      .from("profiles")
      .select("onboarding_goal")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.onboarding_goal) {
      return NextResponse.redirect(new URL("/onboarding", origin));
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}
