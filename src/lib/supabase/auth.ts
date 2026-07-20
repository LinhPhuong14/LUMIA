import "server-only";

import { redirect } from "next/navigation";

import type { OnboardingData, OnboardingGoal, Profile, UserRole } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type SessionUser = {
  id: string;
  email: string;
  /** Display name used everywhere (greetings, chatbot, sidebar). Prefers the onboarding nickname. */
  name: string;
  /** The formal account name (profiles.full_name) — used only on the account/settings screen. */
  fullName: string;
  /** The nickname the user chose in onboarding ("LUMIA gọi bạn là gì"). */
  nickname: string | null;
  role: UserRole;
  onboardingGoal: OnboardingGoal | null;
  /** Full onboarding answers, editable from the settings panel. */
  onboardingData: OnboardingData | null;
};

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Read the profile with the SERVICE ROLE client (bypasses RLS). Identity is
  // already validated by getUser() above, so reading by that trusted id is
  // safe. In a Server Component the RLS-scoped read can silently come back
  // empty (the request client isn't always attached as the authenticated user),
  // which collapsed role to "user" — hiding the admin sidebar and 307'ing
  // requireRole off /admin even for real admins. Fall back to the RLS client
  // when no service key is configured.
  const admin = createAdminClient();
  const db = admin ?? supabase;
  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("full_name, nickname, role, onboarding_goal, onboarding_data, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    // If this ever fires with "column ... does not exist", a migration hasn't
    // been applied to the DB (see supabase/migrations). A failed profile read
    // collapses role to "user" and hides admin UI.
    console.error("[getSession] profile read failed", { userId: user.id, error: profileError.message });
  }

  const row = profile as Pick<
    Profile,
    "full_name" | "nickname" | "role" | "onboarding_goal" | "onboarding_data" | "email"
  > | null;

  const fullName =
    row?.full_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Bạn";
  const nickname = row?.nickname?.trim() ? row.nickname.trim() : null;

  return {
    id: user.id,
    email: row?.email ?? user.email ?? "",
    // Nickname wins for all casual displays; fall back to the account name.
    name: nickname ?? fullName,
    fullName,
    nickname,
    role: row?.role ?? "user",
    onboardingGoal: row?.onboarding_goal ?? null,
    onboardingData: row?.onboarding_data ?? null,
  };
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(roles: UserRole[]): Promise<SessionUser> {
  const session = await requireSession();
  if (!roles.includes(session.role)) {
    redirect("/dashboard");
  }
  return session;
}
