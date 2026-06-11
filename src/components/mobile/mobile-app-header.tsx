"use client";

import Link from "next/link";

import { PlanBadge } from "@/components/ui/plan-badge";
import type { PlanBadgeVariant } from "@/lib/subscription-labels";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function MobileAppHeader({
  title,
  subtitle,
  planLabel,
  badgeVariant,
  sessionName,
}: {
  title: string;
  subtitle?: string;
  planLabel?: string;
  badgeVariant?: PlanBadgeVariant;
  sessionName: string;
}) {
  return (
    <header className="mobile-app-header sticky top-0 z-40 lg:hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-[1.35rem] leading-tight tracking-[-0.03em] text-matcha-deep">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 truncate text-[12px] leading-5 text-muted">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {planLabel && badgeVariant ? (
            <PlanBadge label={planLabel} variant={badgeVariant} className="hidden max-w-[7rem] sm:inline-flex" />
          ) : null}
          <Link
            href="/account"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(145deg,var(--champagne),var(--matcha-soft))] text-[12px] font-semibold text-matcha-deep shadow-[0_8px_20px_rgba(244,216,120,0.14)]"
            aria-label="Tài khoản"
          >
            {getInitials(sessionName)}
          </Link>
        </div>
      </div>
    </header>
  );
}
