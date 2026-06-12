"use client";

import Link from "next/link";

import { navLinks } from "@/components/landing/data/landing-content";
import { LumiaLogo } from "@/components/ui/logo";

export function FloatingNavbar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[80] px-6">
      <div className="lumia-nav-glass pointer-events-auto mx-auto flex w-full max-w-[1280px] items-center gap-5 rounded-full px-3 py-2 pl-4 md:gap-7 md:pl-5">
        <LumiaLogo compact className="shrink-0" />
        <nav className="hidden flex-1 items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-[var(--muted)] transition hover:text-[var(--green-deep)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <Link href="/login" className="hidden text-sm font-semibold text-[var(--green-deep)] md:inline-flex">
          Đăng nhập
        </Link>
        <Link
          href="/register?next=/dashboard"
          className="rounded-full bg-[var(--green)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(63,158,110,0.34)] transition hover:opacity-95"
        >
          Bắt đầu
        </Link>
      </div>
    </div>
  );
}
