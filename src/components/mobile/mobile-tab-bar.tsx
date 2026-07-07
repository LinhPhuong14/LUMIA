"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";

import { isNavActive, mobileTabs } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

const moreRoutes = ["/audio", "/audio/sleep", "/ai", "/settings", "/feedback", "/account", "/dashboard/store", "/admin"];

export function isMoreRouteActive(pathname: string) {
  return moreRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function MobileTabBar({ onMoreOpen }: { onMoreOpen?: () => void }) {
  const pathname = usePathname();
  const tabHrefs = mobileTabs.map((t) => t.href as string);
  const moreActive = isMoreRouteActive(pathname) && !mobileTabs.some((t) => isNavActive(pathname, t.href as string, tabHrefs));

  return (
    <nav className="mobile-tab-bar-floating lg:hidden" aria-label="Điều hướng chính">
      {mobileTabs.map((item) => {
        const active = isNavActive(pathname, item.href as string, tabHrefs);
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

      {/* Settings link */}
      <Link
        href="/account?tab=settings"
        className="mobile-tab-floating-item"
        aria-label="Cài đặt"
      >
        <span
          className={cn(
            "mobile-tab-floating-chip",
            moreActive ? "bg-[var(--matcha-soft)]" : "bg-transparent",
          )}
        >
          <Settings
            className="h-[18px] w-[18px]"
            strokeWidth={moreActive ? 2 : 1.6}
            style={{ color: moreActive ? "var(--green-deep)" : undefined }}
          />
        </span>
        <span
          className={cn(
            "text-[10px]",
            moreActive ? "font-bold text-[var(--green-deep)]" : "font-medium text-[var(--foreground)] opacity-60",
          )}
        >
          Cài đặt
        </span>
      </Link>
    </nav>
  );
}
