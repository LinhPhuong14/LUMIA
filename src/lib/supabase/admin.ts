import { createClient } from "@supabase/supabase-js";

import { env, hasSupabaseServiceRole } from "@/lib/env";

export function createAdminClient() {
  if (!hasSupabaseServiceRole()) {
    return null;
  }

  return createClient(env.SUPABASE_URL!, env.SUPABASE_SECRET_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
