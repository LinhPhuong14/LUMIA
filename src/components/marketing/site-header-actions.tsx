"use client";

import type { Route } from "next";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { defaultRegisterNext } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

export function SiteHeaderActions({
  session,
}: {
  session: { name: string } | null;
}) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <ThemeToggle className="hidden sm:flex" />
      {session ? (
        <Link href="/dashboard" className="button-secondary hidden md:inline-flex">
          {session.name}
        </Link>
      ) : (
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="text-sm font-medium" style={{ color: "var(--green-deep)" }}>
            Đăng nhập
          </Link>
          <Link href={`/register?next=${defaultRegisterNext}` as Route} className="button-primary">
            Tạo tài khoản
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
      className={cn("text-sm font-medium transition hover:opacity-80", className)}
      style={{ color: "var(--muted)" }}
    >
      {label}
    </Link>
  );
}
