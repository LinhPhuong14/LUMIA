"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, MessageCircle, Music, PenLine } from "lucide-react";

import { cn } from "@/lib/utils";

const primaryTabs = [
  { href: "/dashboard" as Route, label: "Trang chủ", icon: Home },
  { href: "/journal" as Route, label: "Nhật ký", icon: PenLine },
  { href: "/audio" as Route, label: "Âm thanh", icon: Music },
  { href: "/ai" as Route, label: "Lắng nghe", icon: MessageCircle },
] as const;

const moreRoutes = ["/journey", "/account", "/settings", "/admin"];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isMoreActive(pathname: string) {
  return moreRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function MobileTabBar({ onMoreOpen }: { onMoreOpen: () => void }) {
  const pathname = usePathname();
  const moreActive = isMoreActive(pathname);

  return (
    <nav className="mobile-tab-bar lg:hidden" aria-label="Điều hướng chính">
      {primaryTabs.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "mobile-tab-item",
              active ? "mobile-tab-item-active" : "mobile-tab-item-inactive",
            )}
          >
            <span className="mobile-tab-icon-wrap">
              <item.icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.25 : 1.75} />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onMoreOpen}
        className={cn(
          "mobile-tab-item",
          moreActive ? "mobile-tab-item-active" : "mobile-tab-item-inactive",
        )}
        aria-label="Thêm tùy chọn"
      >
        <span className="mobile-tab-icon-wrap">
          <Menu className="h-[18px] w-[18px]" strokeWidth={moreActive ? 2.25 : 1.75} />
        </span>
        <span>Thêm</span>
      </button>
    </nav>
  );
}
