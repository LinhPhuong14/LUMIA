"use client";

import type { Route } from "next";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { CartButton } from "@/components/store/cart-button";
import { defaultRegisterNext } from "@/lib/site-nav";
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
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-[13px] font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
          >
            Đăng nhập
          </Link>
          <Link href={`/register?next=${defaultRegisterNext}` as Route} className="button-primary py-2 text-[13px]">
            Bắt đầu
          </Link>
        </div>
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
