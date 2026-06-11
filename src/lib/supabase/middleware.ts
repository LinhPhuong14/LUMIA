import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { env, hasSupabaseConfig } from "@/lib/env";

/** Supabase quickstart pattern — refresh session cookies on each matched request. */
export function createClientFromRequest(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  if (!hasSupabaseConfig()) {
    return { supabase: null, getResponse: () => supabaseResponse };
  }

  const supabase = createServerClient(env.SUPABASE_URL!, env.SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, getResponse: () => supabaseResponse };
}

export async function updateSession(request: NextRequest) {
  const { supabase, getResponse } = createClientFromRequest(request);
  if (supabase) {
    await supabase.auth.getUser();
  }
  return getResponse();
}
