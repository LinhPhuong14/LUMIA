import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { PRIVACY_DEFAULTS, type PrivacySettings } from "@/lib/privacy";
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
  /** Công tắc quyền riêng tư — thi hành ở src/lib/privacy.ts. */
  privacy: PrivacySettings;
};

/**
 * Bọc `cache()`: mỗi lượt render chỉ chạy MỘT lần dù được gọi ở bao nhiêu chỗ.
 *
 * Hàm này tốn hai vòng gọi mạng nối tiếp — `auth.getUser()` ra Supabase Auth,
 * rồi một truy vấn `profiles`. Trước đây trang, layout và từng route handler
 * chạy trong cùng một request đều trả giá đó riêng. `cache()` của React gom
 * theo phạm vi một request, nên lần gọi thứ hai trở đi là miễn phí.
 */
export const getSession = cache(async function getSession(): Promise<SessionUser | null> {
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
    .select("full_name, nickname, role, onboarding_goal, onboarding_data, email, save_chats, allow_journal_ai")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    // If this ever fires with "column ... does not exist", a migration hasn't
    // been applied to the DB (see supabase/migrations). A failed profile read
    // collapses role to "user" and hides admin UI.
    console.error("[getSession] profile read failed", { userId: user.id, error: profileError.message });
  }

  const row = profile as Partial<
    Pick<
      Profile,
      | "full_name"
      | "nickname"
      | "role"
      | "onboarding_goal"
      | "onboarding_data"
      | "email"
      | "save_chats"
      | "allow_journal_ai"
    >
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
    // Chỉ dùng để HIỂN THỊ vị trí công tắc trong trang Cài đặt, nên rơi về mặc
    // định của người dùng mới. Chỗ thi hành thật đọc qua getPrivacySettings và
    // dùng PRIVACY_FALLBACK — thận trọng hơn, vì ở đó đoán sai là gửi dữ liệu.
    privacy: {
      saveChats: row?.save_chats ?? PRIVACY_DEFAULTS.saveChats,
      allowJournalAi: row?.allow_journal_ai ?? PRIVACY_DEFAULTS.allowJournalAi,
    },
  };
});

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
