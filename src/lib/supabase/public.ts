import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { env, hasSupabaseConfig } from "@/lib/env";

/**
 * Client anon không đụng tới cookie — dùng cho các route render tĩnh/ISR
 * (sitemap, feed...) nơi `cookies()` sẽ ép route sang dynamic.
 */
export function createPublicClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  return createSupabaseClient(env.SUPABASE_URL!, env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
