"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart2,
  Home,
  MessageCircle,
  Music,
  Package,
  PenLine,
  Settings,
  Shield,
} from "lucide-react";

import { LumiaLogo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Trang chủ", icon: Home },
  { href: "/journal", label: "Nhật ký", icon: PenLine },
  { href: "/audio", label: "Âm thanh", icon: Music },
  { href: "/ai", label: "Lắng nghe", icon: MessageCircle },
  { href: "/journey", label: "Hành trình", icon: BarChart2 },
  { href: "/account", label: "Account", icon: Package },
  { href: "/settings", label: "Cài đặt", icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  compact,
}: {
  href: Route;
  label: string;
  icon: typeof Home;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center transition",
        compact
          ? cn(
              "flex-col gap-1 rounded-[18px] px-2 py-2 text-[10px] font-medium",
              active ? "text-matcha-deep" : "text-muted",
            )
          : cn(
              "gap-3 rounded-[22px] px-4 py-3 text-[13px] font-medium",
              active
                ? "bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(255,253,245,0.88),rgba(255,243,199,0.48))] text-matcha-deep shadow-[0_16px_36px_rgba(244,216,120,0.14)]"
                : "text-muted hover:bg-white/62 hover:text-matcha-deep",
            ),
      )}
    >
      <Icon className={compact ? "h-5 w-5" : "h-4 w-4"} />
      <span className={compact ? "leading-none" : undefined}>{label}</span>
    </Link>
  );
}

export function Sidebar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="dashboard-glass sticky top-5 hidden h-[calc(100vh-2.5rem)] w-[262px] shrink-0 flex-col rounded-[32px] px-5 py-5 lg:flex">
        <LumiaLogo />
        <nav className="mt-7 flex flex-1 flex-col gap-2">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActive(pathname, item.href)}
            />
          ))}
          {isAdmin ? (
            <NavLink
              href="/admin"
              label="Quản trị"
              icon={Shield}
              active={isActive(pathname, "/admin")}
            />
          ) : null}
        </nav>
      </aside>

      <nav className="dashboard-glass fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-white/70 px-2 py-2 lg:hidden">
        {navigation.slice(0, 5).map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(pathname, item.href)}
            compact
          />
        ))}
      </nav>
    </>
  );
}
