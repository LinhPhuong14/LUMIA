"use client";

import type { Route } from "next";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { CartButton } from "@/components/store/cart-button";
import { cn } from "@/lib/utils";

export function SiteHeaderActions({
  session,
}: {
  session: { name: string } | null;
}) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <CartButton />
      <ThemeToggle className="hidden sm:flex" />
      {session ? (
        <Link
          href="/dashboard"
          className="hidden h-9 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-card)] pl-3 pr-1.5 text-[13px] font-medium text-[var(--foreground)] transition hover:border-[var(--green)]/40 md:inline-flex"
        >
          {session.name.split(" ").slice(-1)[0]}
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--green)] text-[11px] font-bold text-white">
            {session.name.trim()[0]?.toUpperCase()}
          </span>
        </Link>
      ) : (
        <Link
          href="/login"
          className="hidden rounded-full px-5 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 md:inline-flex"
          style={{ background: "var(--green)", boxShadow: "var(--glass-shadow)" }}
        >
          Đăng nhập
        </Link>
      )}
    </div>
  );
}

export function SiteHeaderNavLink({
  href,
  label,
  className,
}: {
  href: Route;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("text-[13.5px] font-medium transition-colors hover:text-[var(--foreground)]", className)}
      style={{ color: "var(--muted)" }}
    >
      {label}
    </Link>
  );
}
