"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";

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
      className={cn(
        "flex items-center gap-3 rounded-[16px] px-3.5 py-[11px] text-[13.5px] font-medium transition",
        active
          ? "bg-[linear-gradient(140deg,rgba(255,255,255,0.95),var(--green-wash))] font-semibold text-[var(--green-deep)] shadow-[0_8px_20px_rgba(122,140,82,0.12)]"
          : "text-[var(--muted)] hover:bg-white/40 hover:text-[var(--green-deep)]",
      )}
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

  return (
    <aside className="dash-sidebar hidden h-full min-h-0 w-full flex-col p-5 lg:flex">
      <div className="flex shrink-0 items-center gap-2 px-2 pb-[18px] pt-1.5">
        <div
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px]"
          style={{ background: "var(--gradient-emerald)" }}
        >
          <span className="font-serif text-sm font-semibold text-white">L</span>
        </div>
        <span className="font-serif text-[21px] font-semibold tracking-[-0.01em] text-[var(--green-deep)]">
          lumia
        </span>
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

      <div className="mt-4 flex shrink-0 items-center gap-2.5 rounded-2xl bg-white/50 p-2.5">
        <div
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
          style={{ background: "var(--gradient-jade)" }}
        >
          {getInitials(sessionName)}
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[13px] font-semibold text-[var(--foreground)]">{sessionName}</div>
          <div className="truncate text-[11px] text-[var(--muted)]">{planLabel}</div>
        </div>
      </div>
    </aside>
  );
}
