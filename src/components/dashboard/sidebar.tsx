"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, MoonStar, Shield, Sun } from "lucide-react";

import { useLumiaTheme } from "@/components/theme/lumia-theme-provider";
import { ThemeAwareLogo } from "@/components/ui/theme-aware-logo";
import { desktopNav, isNavActive } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: Route;
  label: string;
  icon: (typeof desktopNav)[number]["icon"];
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("dash-nav-link", active && "dash-nav-link--active")}
      aria-current={active ? "page" : undefined}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2 : 1.7} />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar({
  isAdmin,
  sessionName,
  planLabel,
}: {
  isAdmin?: boolean;
  sessionName: string;
  planLabel: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useLumiaTheme();
  const isDark = theme === "dark";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="dash-sidebar hidden h-full min-h-0 w-full flex-col p-5 lg:flex">
      <div className="flex shrink-0 px-2 pb-[18px] pt-1.5">
        <ThemeAwareLogo compact />
      </div>

      <nav className="lumia-scroll flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {desktopNav.map((item) => (
          <NavLink
            key={item.id}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isNavActive(pathname, item.href)}
          />
        ))}
        {isAdmin ? (
          <NavLink href="/admin" label="Quản trị" icon={Shield} active={isNavActive(pathname, "/admin")} />
        ) : null}
      </nav>

      <button
        type="button"
        onClick={toggleTheme}
        className="dash-nav-link mt-3 shrink-0"
        aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      >
        {isDark ? (
          <Sun className="h-[18px] w-[18px]" strokeWidth={1.7} />
        ) : (
          <MoonStar className="h-[18px] w-[18px]" strokeWidth={1.7} />
        )}
        <span>{isDark ? "Chế độ sáng" : "Chế độ tối"}</span>
      </button>

      <div className="dash-user-card mt-4 flex shrink-0 flex-col gap-2 rounded-2xl p-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold dash-ink-on-light"
            style={{ background: "var(--gradient-jade)" }}
          >
            {getInitials(sessionName)}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[13px] font-semibold text-[var(--foreground)]">{sessionName}</div>
            <div className="truncate text-[11px] text-[var(--muted)]">{planLabel}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="dash-nav-link w-full justify-start text-[12px]"
        >
          <LogOut className="h-[16px] w-[16px]" strokeWidth={1.7} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
