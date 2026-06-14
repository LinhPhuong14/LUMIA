"use client";

import type { Route } from "next";
import Link from "next/link";

import { LandingMobileDrawer } from "@/components/landing/shared/landing-mobile-drawer";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ThemeAwareLogo } from "@/components/ui/theme-aware-logo";
import { defaultRegisterNext, landingAnchorLinks } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

export function FloatingNavbar() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] px-3 pt-[max(0.5rem,env(safe-area-inset-top))] md:px-5"
    >
      <div className="lumia-nav-glass pointer-events-auto mx-auto flex w-full max-w-[1280px] items-center gap-3 overflow-hidden rounded-full border bg-white/10 px-3 py-2 pl-4 backdrop-blur-2xl md:gap-5 md:pl-5">
        <ThemeAwareLogo compact className="shrink-0" />
        <nav className="hidden flex-1 items-center gap-6 lg:flex">
          {landingAnchorLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className="lumia-nav-link whitespace-nowrap text-sm font-medium transition hover:opacity-90"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <LandingMobileDrawer />
          <ThemeToggle className="hidden sm:flex" />
          <Link href="/login" className="lumia-nav-link hidden text-sm font-semibold sm:inline-flex">
            Đăng nhập
          </Link>
          <Link
            href={`/register?next=${defaultRegisterNext}` as Route}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 md:px-5 md:py-2.5",
            )}
            style={{ background: "var(--green)", boxShadow: "var(--glass-shadow)" }}
          >
            Bắt đầu
          </Link>
        </div>
      </div>
    </div>
  );
}
