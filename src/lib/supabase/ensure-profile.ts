import type { SessionUser } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function bootstrapWithAdmin(session: Pick<SessionUser, "id" | "email" | "name">) {
  const admin = createAdminClient();
  if (!admin) return false;

  await admin.from("profiles").upsert(
    { id: session.id, email: session.email, full_name: session.name, role: "user" },
    { onConflict: "id" },
  );

  const { data: sub } = await admin.from("subscriptions").select("id").eq("user_id", session.id).limit(1).maybeSingle();
  if (!sub) {
    await admin.from("subscriptions").insert({ user_id: session.id, status: "free" });
  }

  const { data: streak } = await admin.from("streaks").select("id").eq("user_id", session.id).maybeSingle();
  if (!streak) {
    await admin.from("streaks").insert({ user_id: session.id });
  }

  return true;
}

/** Mood/journal rows FK → profiles. Backfill if auth trigger did not run. */
export async function ensureUserProfile(session: Pick<SessionUser, "id" | "email" | "name">) {
  const client = await createClient();
  if (!client) {
    return { ok: false as const, error: "Supabase not configured" };
  }

  const { data: existing } = await client.from("profiles").select("id").eq("id", session.id).maybeSingle();
  if (existing) {
    return { ok: true as const };
  }

  if (await bootstrapWithAdmin(session)) {
    return { ok: true as const };
  }

  // Production without secret key: RPC runs as SECURITY DEFINER (migration 005).
  const { error: rpcError } = await client.rpc("ensure_my_profile", { p_full_name: session.name });
  if (!rpcError) {
    return { ok: true as const };
  }

  // Fallback if RPC not deployed yet: direct insert (needs migration 004 policy).
  const { error: insertError } = await client.from("profiles").insert({
    id: session.id,
    email: session.email,
    full_name: session.name,
    role: "user",
  });

  if (insertError) {
    return {
      ok: false as const,
      error: `${insertError.message}. Chạy migration 005_ensure_profile_rpc.sql trên Supabase.`,
    };
  }

  return { ok: true as const };
}
