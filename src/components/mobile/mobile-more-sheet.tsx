"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music, Settings, Shield, ShoppingBag } from "lucide-react";

import { MobileNavSheet } from "@/components/ui/mobile-nav-sheet";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const gridLinks = [
  { href: "/audio" as Route, label: "Âm thanh", icon: Music },
  { href: "/dashboard/store" as Route, label: "Cửa hàng", icon: ShoppingBag },
  { href: "/account?tab=settings" as Route, label: "Cài đặt", icon: Settings },
] as const;

export function MobileMoreSheet({
  open,
  onClose,
  isAdmin,
  onLogout,
  userName,
  userEmail,
}: {
  open: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onLogout: () => void;
  userName?: string;
  userEmail?: string;
}) {
  const pathname = usePathname();

  return (
    <MobileNavSheet open={open} onClose={onClose} title="">
      {/* Profile header */}
      {userName && (
        <div className="mb-5 flex items-center gap-3 px-1">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ background: "var(--gradient-jade)", color: "var(--foreground)" }}
          >
            {getInitials(userName)}
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold text-[var(--foreground)]">{userName}</div>
            {userEmail && (
              <div className="truncate text-[13px] text-[var(--muted)]">{userEmail}</div>
            )}
          </div>
        </div>
      )}

      {/* 3-item grid */}
      <div className="mb-2 grid grid-cols-3 gap-2.5">
        {gridLinks.map((item) => {
          const hrefBase = item.href.split("?")[0];
          const active =
            pathname === hrefBase ||
            (hrefBase !== "/" && pathname.startsWith(`${hrefBase}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex flex-col items-start gap-2.5 rounded-[18px] border p-4 transition active:scale-[0.97]",
                active
                  ? "border-[var(--green)] bg-[var(--green-wash)]"
                  : "border-[var(--border)] bg-[var(--surface-card)]",
              )}
            >
              <Icon
                className="h-5 w-5"
                style={{ color: active ? "var(--green-deep)" : "var(--muted)" }}
              />
              <span
                className="text-[13px] font-medium"
                style={{ color: active ? "var(--green-deep)" : "var(--foreground)" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Admin */}
      {isAdmin && (
        <Link
          href="/admin"
          onClick={onClose}
          className={cn(
            "mobile-more-link",
            pathname.startsWith("/admin") && "bg-[var(--green-wash)] text-[var(--green-deep)]",
          )}
        >
          <Shield className="h-5 w-5" />
          Quản trị
        </Link>
      )}
    </MobileNavSheet>
  );
}
