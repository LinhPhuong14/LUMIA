"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isNavActive, mobileTabs } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

const moreRoutes = ["/journal", "/settings", "/admin", "/audio/sleep"];

export function isMoreRouteActive(pathname: string) {
  return moreRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav className="mobile-tab-bar-floating lg:hidden" aria-label="Điều hướng chính">
      {mobileTabs.map((item) => {
        const active = isNavActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            href={item.href}
            className="mobile-tab-floating-item"
            aria-current={active ? "page" : undefined}
          >
            <span
              className={cn(
                "mobile-tab-floating-chip",
                active ? "bg-[var(--matcha-soft)]" : "bg-transparent",
              )}
            >
              <Icon
                className="h-[18px] w-[18px]"
                strokeWidth={active ? 2 : 1.6}
                style={{ color: active ? "var(--green-deep)" : undefined }}
              />
            </span>
            <span
              className={cn(
                "text-[10px]",
                active ? "font-bold text-[var(--green-deep)]" : "font-medium text-[var(--foreground)] opacity-60",
              )}
            >
              {item.mobileLabel ?? item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
