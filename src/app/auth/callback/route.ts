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

  // Try using admin client for profile bootstrap; fall back to session client if unavailable
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

  // New OAuth users go through onboarding first
  const { data: profile } = await db
    .from("profiles")
    .select("onboarding_goal")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.onboarding_goal) {
    return NextResponse.redirect(new URL("/onboarding", origin));
  }

  return NextResponse.redirect(new URL(next, origin));
}
