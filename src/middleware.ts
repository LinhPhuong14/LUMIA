import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

// Refresh the Supabase auth session on every navigation so tokens stay valid
// and cookies stay in sync. Required for @supabase/ssr to keep users logged in.
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (build assets)
     * - favicon and common static media/font files
     * - the OAuth callback (it sets its own session cookies)
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|wav|ogg|woff|woff2|ttf)$).*)",
  ],
};
