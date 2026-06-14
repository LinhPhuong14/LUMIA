"use client";

import type { Route } from "next";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

export function MobileNavDrawer({
  links,
  session,
}: {
  links: { href: Route; label: string }[];
  session: { name: string } | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="touch-target flex items-center justify-center rounded-full border border-white/70 bg-white/80 text-matcha-deep md:hidden"
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Đóng menu"
            className="mobile-more-sheet-backdrop md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="mobile-more-sheet md:hidden" role="dialog" aria-modal="true">
            <div className="mobile-more-sheet-handle" />
            <div className="mb-4 flex items-center justify-between px-1">
              <span className="font-serif text-xl text-matcha-deep">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="touch-target flex items-center justify-center rounded-full text-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="mobile-more-link"
                >
                  {link.label}
                </Link>
              ))}
              {session ? (
                <Link href="/dashboard" onClick={() => setOpen(false)} className="mobile-more-link">
                  {session.name}
                </Link>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="mobile-more-link">
                    Đăng nhập
                  </Link>
                  <Link
                    href={"/register?next=/onboarding" as Route}
                    onClick={() => setOpen(false)}
                    className={cn("button-primary mx-1 mt-3 w-[calc(100%-0.5rem)] justify-center")}
                  >
                    Tạo tài khoản
                  </Link>
                </>
              )}
            </nav>
            <div className="mt-4 flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
