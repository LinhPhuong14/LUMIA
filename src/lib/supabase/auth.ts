import "server-only";

import { redirect } from "next/navigation";

import type { OnboardingGoal, Profile, UserRole } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  onboardingGoal: OnboardingGoal | null;
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, onboarding_goal, email")
    .eq("id", user.id)
    .maybeSingle();

  const row = profile as Pick<Profile, "full_name" | "role" | "onboarding_goal" | "email"> | null;

  return {
    id: user.id,
    email: row?.email ?? user.email ?? "",
    name: row?.full_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Bạn",
    role: row?.role ?? "user",
    onboardingGoal: row?.onboarding_goal ?? null,
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
