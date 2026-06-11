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
  { href: "/account", label: "Tài khoản", icon: Package },
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
}: {
  href: Route;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-[22px] px-4 py-3 text-[13px] font-medium transition",
        active
          ? "bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(255,253,245,0.88),rgba(255,243,199,0.48))] text-matcha-deep shadow-[0_16px_36px_rgba(244,216,120,0.14)]"
          : "text-muted hover:bg-white/62 hover:text-matcha-deep",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="sidebar dashboard-glass hidden w-[262px] flex-col rounded-[32px] px-5 py-5 lg:flex">
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

    </>
  );
}
