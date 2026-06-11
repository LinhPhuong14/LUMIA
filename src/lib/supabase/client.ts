import { createBrowserClient } from "@supabase/ssr";

import { env, hasSupabaseConfig } from "@/lib/env";

export function createClient() {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase is not configured.");
  }

  return createBrowserClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!);
}
