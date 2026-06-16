"use client";

import { Crown } from "lucide-react";

import { NotificationCenter } from "@/components/dashboard/notification-center";
import { CartButton } from "@/components/store/cart-button";
import type { PlanBadgeVariant } from "@/lib/subscription-labels";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function TopBar({
  title,
  subtitle,
  planLabel,
  sessionName,
}: {
  title: string;
  subtitle?: string;
  planLabel: string;
  badgeVariant?: PlanBadgeVariant;
  sessionName: string;
}) {
  return (
    <header className="dashboard-topbar flex items-center justify-between px-1 py-3">
      <div>
        <h1 className="font-serif text-[27px] font-medium tracking-[-0.02em] text-[var(--foreground)]">
          {title}
        </h1>
        {subtitle ? <p className="mt-1 text-[13.5px] text-[var(--muted)]">{subtitle}</p> : null}
      </div>
      <div className="flex items-center gap-3">
        <CartButton />
        <NotificationCenter />
        <div className="dash-plan-pill py-1.5 pl-3.5 pr-1.5">
          <Crown className="h-3.5 w-3.5 text-[var(--honey-dark)]" />
          <span className="text-[12.5px] font-semibold text-[var(--green-deep)]">{planLabel}</span>
          <div
            className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-[12px] font-bold dash-ink-on-light"
            style={{ background: "var(--gradient-jade)" }}
          >
            {getInitials(sessionName)}
          </div>
        </div>
      </div>
    </header>
  );
}
