import { NextResponse, type NextRequest } from "next/server";

import { createClientFromRequest } from "@/lib/supabase/middleware";

const authRoutes = [
  "/dashboard",
  "/account",
  "/journal",
  "/ai",
  "/history",
  "/settings",
  "/onboarding",
  "/mood",
  "/mood-test",
  "/reports",
  "/journey",
  "/audio",
  "/subscription",
  "/dashboard/store",
];
const adminRoutes = ["/admin", "/api/admin"];

async function getSessionFromRequest(request: NextRequest) {
  const { supabase, getResponse } = createClientFromRequest(request);
  if (!supabase) {
    return { user: null, role: null, response: getResponse() };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, role: null, response: getResponse() };
  }

  // maybeSingle (not single): a missing/duplicate profile row must not throw —
  // that would collapse role to "user" and 307 an admin off /admin.
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();

  return {
    user,
    role: (profile?.role as string | undefined) ?? "user",
    response: getResponse(),
    supabase,
  };
}

/**
 * Redirect while preserving any Supabase auth cookies that getUser() refreshed
 * on this request. Returning a bare NextResponse.redirect drops those rotated
 * cookies, which logs the user out on the next request — the classic cause of
 * "random 307s" on protected routes. Always carry them over.
 */
function redirectTo(url: URL, carryFrom?: NextResponse) {
  const res = NextResponse.redirect(url);
  carryFrom?.cookies.getAll().forEach((cookie) => res.cookies.set(cookie));
  return res;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  const sbCookies = request.cookies.getAll().map((c) => c.name).filter((n) => n.startsWith("sb-"));
  console.log("[proxy]", {
    pathname,
    host: request.headers.get("host"),
    hasUser: Boolean(session?.user),
    role: session?.role ?? null,
    sbCookies,
  });

  if (authRoutes.some((route) => pathname.startsWith(route)) && !session?.user) {
    console.warn("[proxy] no user on protected route → redirect /login", { pathname, sbCookies });
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return redirectTo(loginUrl, session.response);
  }

  if (adminRoutes.some((route) => pathname.startsWith(route)) && session?.role !== "admin") {
    return redirectTo(new URL("/dashboard", request.url), session.response);
  }

  if (session?.user && session.supabase && pathname === "/onboarding") {
    const { data: profile } = await session.supabase
      .from("profiles")
      .select("onboarding_goal")
      .eq("id", session.user.id)
      .maybeSingle();
    if (profile?.onboarding_goal) {
      return redirectTo(new URL("/dashboard", request.url), session.response);
    }
  }

  if (pathname.startsWith("/subscription") || pathname.startsWith("/dashboard/boxes")) {
    return redirectTo(new URL("/account", request.url), session.response);
  }

  if (pathname.startsWith("/history") || pathname.startsWith("/reports")) {
    return redirectTo(new URL("/journey", request.url), session.response);
  }

  if (pathname.startsWith("/chat")) {
    return redirectTo(new URL("/ai", request.url), session.response);
  }

  return session?.response ?? NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/account/:path*",
    "/subscription/:path*",
    "/journal/:path*",
    "/ai/:path*",
    "/chat/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/mood/:path*",
    "/mood-test/:path*",
    "/reports/:path*",
    "/journey/:path*",
    "/audio/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
