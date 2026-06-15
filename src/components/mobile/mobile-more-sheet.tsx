"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart2, Feather, LogOut, Settings, Shield, X } from "lucide-react";

import { cn } from "@/lib/utils";

const moreLinks = [
  { href: "/journal" as Route, label: "Nhật ký", icon: Feather },
  { href: "/journey" as Route, label: "Hành trình", icon: BarChart2 },
  { href: "/settings" as Route, label: "Cài đặt", icon: Settings },
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
            {userName ? (
              <div className="mb-4 flex shrink-0 items-center gap-3 px-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-matcha-soft text-sm font-semibold text-matcha-deep">
                  {getInitials(userName)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium text-matcha-deep">{userName}</div>
                  {userEmail ? (
                    <div className="truncate text-sm text-muted">{userEmail}</div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="font-serif text-xl text-matcha-deep">Thêm</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="absolute right-4 top-4 touch-target flex items-center justify-center rounded-full text-muted"
            >
              <X className="h-5 w-5" />
            </button>
            <nav className="mobile-nav-sheet-body space-y-1 pb-2">
              {moreLinks.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn("mobile-more-link", active && "bg-matcha-soft/40")}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
              {isAdmin ? (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className={cn(
                    "mobile-more-link",
                    pathname.startsWith("/admin") && "bg-matcha-soft/40",
                  )}
                >
                  <Shield className="h-5 w-5" />
                  Quản trị
                </Link>
              ) : null}
              <button
                type="button"
                onClick={onLogout}
                className="mobile-more-link w-full text-left text-error"
              >
                <LogOut className="h-5 w-5" />
                Đăng xuất
              </button>
            </nav>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
