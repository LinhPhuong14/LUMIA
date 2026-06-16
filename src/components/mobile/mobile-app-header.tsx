"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";

import { NotificationBell } from "@/components/mobile/notification-bell";
import { useLumiaTheme } from "@/components/theme/lumia-theme-provider";
import type { PlanBadgeVariant } from "@/lib/subscription-labels";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function UserAvatar({ name, isPremium }: { name: string; isPremium?: boolean }) {
  const initials = getInitials(name);
  if (isPremium) {
    return (
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #c77dff, #ff9f43, #ff6b6b)",
            animation: "spin 3s linear infinite",
          }}
        />
        <Link
          href="/account"
          className="absolute inset-[2.5px] flex items-center justify-center rounded-full bg-[linear-gradient(145deg,var(--champagne),var(--matcha-soft))] text-[11px] font-semibold text-[var(--matcha-deep)]"
          aria-label="Tài khoản"
        >
          {initials}
        </Link>
      </div>
    );
  }
  return (
    <Link
      href="/account"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,var(--champagne),var(--matcha-soft))] text-[11px] font-semibold text-[var(--matcha-deep)] shadow-[var(--shadow-ritual)]"
      aria-label="Tài khoản"
    >
      {initials}
    </Link>
  );
}

function HeaderActions({ sessionName, isPremium }: { sessionName: string; isPremium?: boolean }) {
  const { theme, toggleTheme } = useLumiaTheme();
  const isDark = theme === "dark";
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <NotificationBell />
      <button
        type="button"
        onClick={toggleTheme}
        className="dash-glass-btn"
        aria-label={isDark ? "Chế độ sáng" : "Chế độ tối"}
      >
        {isDark ? (
          <Sun className="h-[18px] w-[18px] text-[var(--foreground)]" />
        ) : (
          <Moon className="h-[18px] w-[18px] text-[var(--foreground)]" />
        )}
      </button>
      <UserAvatar name={sessionName} isPremium={isPremium} />
    </div>
  );
}

export function MobileAppHeader({
  title,
  subtitle,
  planLabel,
  badgeVariant,
  sessionName,
  variant = "default",
  onMoreOpen,
  isPremium,
}: {
  title: string;
  subtitle?: string;
  planLabel?: string;
  badgeVariant?: PlanBadgeVariant;
  sessionName: string;
  variant?: "default" | "hub";
  onMoreOpen?: () => void;
  isPremium?: boolean;
}) {
  if (variant === "hub") {
    const today = new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    return (
      <header
        className="sticky top-0 z-40 px-4 pb-3 pt-[calc(var(--safe-top)+8px)] lg:hidden"
        style={{
          background: "color-mix(in srgb, var(--surface) 90%, transparent)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] capitalize text-[var(--muted)]">{today}</p>
            <span className="font-serif text-[20px] font-medium tracking-[-0.01em] text-[var(--foreground)]">
              {title}
            </span>
          </div>
          <HeaderActions sessionName={sessionName} isPremium={isPremium} />
        </div>
      </header>
    );
  }

  return (
    <header className="mobile-app-header sticky top-0 z-40 lg:hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-[18px] font-medium text-[var(--foreground)]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-0.5 truncate text-[13px] leading-5 text-[var(--muted)]">{subtitle}</p>
          ) : null}
        </div>
        <HeaderActions sessionName={sessionName} isPremium={isPremium} />
      </div>
    </header>
  );
}
