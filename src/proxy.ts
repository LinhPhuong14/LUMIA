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

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  return {
    user,
    role: (profile?.role as string | undefined) ?? "user",
    response: getResponse(),
    supabase,
  };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSessionFromRequest(request);

  if (authRoutes.some((route) => pathname.startsWith(route)) && !session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (adminRoutes.some((route) => pathname.startsWith(route)) && session?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (session?.user && session.supabase && pathname === "/onboarding") {
    const { data: profile } = await session.supabase
      .from("profiles")
      .select("onboarding_goal")
      .eq("id", session.user.id)
      .single();
    if (profile?.onboarding_goal) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/subscription") || pathname.startsWith("/dashboard/boxes")) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  if (pathname.startsWith("/history") || pathname.startsWith("/reports")) {
    return NextResponse.redirect(new URL("/journey", request.url));
  }

  if (pathname.startsWith("/chat")) {
    return NextResponse.redirect(new URL("/ai", request.url));
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
