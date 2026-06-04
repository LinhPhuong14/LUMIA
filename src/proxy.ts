import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

const authRoutes = ["/dashboard", "/subscription", "/journal", "/ai", "/activate", "/history", "/settings"];
const adminRoutes = ["/admin", "/api/admin"];

async function getSessionRole(token?: string) {
  if (!token) {
    return null;
  }

  const session = await verifySessionToken(token);
  return session?.role ?? null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const role = await getSessionRole(token);

  if (authRoutes.some((route) => pathname.startsWith(route)) && !role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (adminRoutes.some((route) => pathname.startsWith(route)) && !["admin", "superadmin"].includes(role ?? "")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/subscription/:path*", "/journal/:path*", "/ai/:path*", "/activate/:path*", "/history/:path*", "/settings/:path*", "/admin/:path*", "/api/admin/:path*"],
};
