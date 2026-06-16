import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { env, hasSupabaseConfig } from "@/lib/env";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/ai",
  "/journal",
  "/audio",
  "/account",
  "/settings",
  "/journey",
  "/feedback",
  "/admin",
  "/onboarding",
];

const AUTH_ONLY_ROUTES = ["/login", "/register"];

const THIRTY_DAYS_S = 60 * 60 * 24 * 30;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!hasSupabaseConfig()) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.SUPABASE_URL!, env.SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, {
            ...options,
            // Extend session cookies to 30 days
            maxAge: name.includes("auth-token") ? THIRTY_DAYS_S : options?.maxAge,
          });
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthRoute = AUTH_ONLY_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user) {
    const next = request.nextUrl.searchParams.get("next") ?? "/dashboard";
    const dest = request.nextUrl.clone();
    dest.pathname = next;
    dest.search = "";
    return NextResponse.redirect(dest);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
