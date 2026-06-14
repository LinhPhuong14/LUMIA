"use client";

import type { Route } from "next";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { landingAnchorLinks, marketingNavLinks } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

export function LandingMobileDrawer() {
  const [open, setOpen] = useState(false);
  const links = [...landingAnchorLinks, ...marketingNavLinks];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="touch-target flex h-10 w-10 items-center justify-center rounded-full border lg:hidden"
        style={{ borderColor: "var(--glass-border)", background: "var(--glass-control)" }}
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5" style={{ color: "var(--green-deep)" }} />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Đóng menu"
            className="mobile-more-sheet-backdrop lg:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="mobile-more-sheet lg:hidden" role="dialog" aria-modal="true">
            <div className="mobile-more-sheet-handle" />
            <div className="mb-4 flex items-center justify-between px-1">
              <span className="font-serif text-xl" style={{ color: "var(--green-deep)" }}>
                Menu
              </span>
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
                <a
                  key={link.id}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="mobile-more-link"
                >
                  {link.label}
                </a>
              ))}
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
            </nav>
          </div>
        </>
      ) : null}
    </>
  );
}
