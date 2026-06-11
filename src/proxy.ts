import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { env, hasSupabaseConfig } from "@/lib/env";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";

const authRoutes = [
  "/dashboard",
  "/subscription",
  "/journal",
  "/ai",
  "/chat",
  "/history",
  "/settings",
  "/onboarding",
  "/mood",
  "/mood-test",
  "/reports",
  "/journey",
  "/audio",
];
const adminRoutes = ["/admin", "/api/admin"];
const activeOnlyRoutes = ["/chat", "/mood-test", "/reports", "/audio/breathing", "/audio/timer"];

async function getSessionFromRequest(request: NextRequest) {
  if (!hasSupabaseConfig()) {
    return null;
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, role: null, response };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  return {
    user,
    role: (profile?.role as string | undefined) ?? "user",
    response,
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

  if (session?.user && pathname === "/onboarding") {
    const supabase = createServerClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    });
    const { data: profile } = await supabase.from("profiles").select("onboarding_goal").eq("id", session.user.id).single();
    if (profile?.onboarding_goal) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (session?.user && activeOnlyRoutes.some((route) => pathname.startsWith(route))) {
    const snapshot = await getSubscriptionSnapshot(session.user.id);
    if (!snapshot.isActive) {
      const dashboardUrl = new URL("/dashboard", request.url);
      dashboardUrl.searchParams.set("upsell", "1");
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return session?.response ?? NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
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
