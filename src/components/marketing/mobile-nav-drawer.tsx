"use client";

import type { Route } from "next";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MobileNavSheet } from "@/components/ui/mobile-nav-sheet";
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
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" />
      </button>

      <MobileNavSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Thực đơn"
        footer={
          <div className="flex justify-center pb-1">
            <ThemeToggle />
          </div>
        }
      >
        <nav className="space-y-1 pb-2">
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
      </MobileNavSheet>
    </>
  );
}
