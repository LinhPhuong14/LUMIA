"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { LandingMobileDrawer } from "@/components/landing/shared/landing-mobile-drawer";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ThemeAwareLogo } from "@/components/ui/theme-aware-logo";
import { landingAnchorLinks } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 12;
const NAV_MORPH_EASE = [0.22, 1, 0.36, 1] as const;

function getLandingScrollTop() {
  const scrollEl = document.querySelector<HTMLElement>(".landing-page.page-scroll-area");
  if (scrollEl) return scrollEl.scrollTop;
  return window.scrollY;
}

export function FloatingNavbar({ isAuthed = false }: { isAuthed?: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const scrollEl = document.querySelector<HTMLElement>(".landing-page.page-scroll-area");

    const onScroll = () => {
      setScrolled(getLandingScrollTop() > SCROLL_THRESHOLD);
    };

    onScroll();
    scrollEl?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      scrollEl?.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[80]",
        scrolled
          ? "px-3 pt-[max(0.5rem,env(safe-area-inset-top))] md:px-5"
          : "px-0 pt-[env(safe-area-inset-top,0px)]",
      )}
    >
      <motion.div
        layout
        initial={false}
        transition={{ layout: { duration: 0.42, ease: NAV_MORPH_EASE } }}
        className={cn(
          "lumia-nav-glass pointer-events-auto flex w-full items-center gap-3 overflow-hidden border bg-white/10 backdrop-blur-lg",
          scrolled
            ? "mx-auto max-w-[1280px] rounded-full px-3 py-2 pl-4 md:gap-5 md:pl-5"
            : "max-w-none rounded-none border-x-0 border-t-0 px-4 py-3 pl-4 md:px-8 md:py-3.5 md:pl-8",
        )}
      >
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
          <Link
            href={isAuthed ? "/dashboard" : "/login"}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 md:px-5 md:py-2.5"
            style={{ background: "var(--green)", boxShadow: "var(--glass-shadow)" }}
          >
            {isAuthed ? "Vào Dashboard" : "Đăng nhập"}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
