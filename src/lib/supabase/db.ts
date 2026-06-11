import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/** Prefer secret-key admin client; fall back to session-scoped client (RLS). */
export async function getServiceOrUserClient(): Promise<SupabaseClient | null> {
  return createAdminClient() ?? (await createClient());
}
