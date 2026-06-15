"use client";

import type { Route } from "next";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { MobileNavSheet } from "@/components/ui/mobile-nav-sheet";
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
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" style={{ color: "var(--green-deep)" }} />
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
      </MobileNavSheet>
    </>
  );
}
