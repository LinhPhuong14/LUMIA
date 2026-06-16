"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

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
  variant = "default",
  onMoreOpen,
}: {
  title: string;
  subtitle?: string;
  planLabel?: string;
  badgeVariant?: PlanBadgeVariant;
  sessionName: string;
  variant?: "default" | "hub";
  onMoreOpen?: () => void;
}) {
  if (variant === "hub") {
    const today = new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" });
    return (
      <header className="sticky top-0 z-40 px-4 pb-3 pt-[calc(var(--safe-top)+8px)] lg:hidden"
        style={{ background: "color-mix(in srgb, var(--surface) 90%, transparent)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] capitalize text-[var(--muted)]">{today}</p>
            <span className="font-serif text-[20px] font-medium tracking-[-0.01em] text-[var(--foreground)]">
              {title}
            </span>
          </div>
          <button type="button" className="dash-glass-btn" aria-label="Thông báo">
            <Bell className="h-[19px] w-[19px] text-[var(--foreground)]" />
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="mobile-app-header sticky top-0 z-40 lg:hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-[18px] font-medium text-[var(--foreground)]">{title}</h1>
          {subtitle ? (
            <p className="mt-0.5 truncate text-[13px] leading-5 text-[var(--muted)]">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {planLabel && badgeVariant ? (
            <PlanBadge label={planLabel} variant={badgeVariant} className="hidden max-w-[7rem] sm:inline-flex" />
          ) : null}
          <Link
            href="/account"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(145deg,var(--champagne),var(--matcha-soft))] text-[12px] font-semibold text-[var(--matcha-deep)] shadow-[var(--shadow-ritual)]"
            aria-label="Tài khoản"
          >
            {getInitials(sessionName)}
          </Link>
        </div>
      </div>
    </header>
  );
}
