"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Moon, Music, Settings, Shield, ShoppingBag, Sun, User, X } from "lucide-react";

import { useLumiaTheme } from "@/components/theme/lumia-theme-provider";
import { cn } from "@/lib/utils";

const gridLinks = [
  { href: "/audio" as Route, label: "Âm thanh", icon: Music },
  { href: "/dashboard/store" as Route, label: "Cửa hàng", icon: ShoppingBag },
  { href: "/account" as Route, label: "Tôi", icon: User },
  { href: "/account?tab=settings" as Route, label: "Cài đặt", icon: Settings },
] as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

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
  const { theme, toggleTheme } = useLumiaTheme();
  const isDark = theme === "dark";

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Đóng menu"
            className="mobile-more-sheet-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="mobile-more-sheet flex max-h-[min(92dvh,100%)] flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Thêm tùy chọn"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
          >
            <div className="mobile-more-sheet-handle" />

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="absolute right-4 top-4 flex items-center justify-center rounded-full p-1.5 text-[var(--muted)]"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Profile header */}
            {userName && (
              <div className="mb-5 flex shrink-0 items-center gap-3 px-1">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                  style={{ background: "var(--gradient-jade)", color: "var(--foreground)" }}
                >
                  {getInitials(userName)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium text-[var(--foreground)]">{userName}</div>
                  {userEmail && <div className="truncate text-sm text-[var(--muted)]">{userEmail}</div>}
                </div>
              </div>
            )}

            {/* 2-col grid */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              {gridLinks.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href.split("?")[0]}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-[16px] border p-4 transition",
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
                  "mb-3 flex items-center gap-3 rounded-[14px] border px-4 py-3 text-[13px] font-medium transition",
                  pathname.startsWith("/admin")
                    ? "border-[var(--green)] bg-[var(--green-wash)] text-[var(--green-deep)]"
                    : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--foreground)]",
                )}
              >
                <Shield className="h-4 w-4" />
                Quản trị
              </Link>
            )}

            {/* Footer actions */}
            <div className="mt-auto flex gap-3 border-t border-[var(--border)] pt-4">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-card)] py-3 text-[13px] font-medium text-[var(--foreground)] transition hover:border-[var(--green)]"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDark ? "Chế độ sáng" : "Chế độ tối"}
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-card)] py-3 text-[13px] font-medium text-red-500 transition hover:border-red-300"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
