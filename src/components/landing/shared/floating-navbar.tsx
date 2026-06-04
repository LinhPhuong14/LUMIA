"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { LumiaLogo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const links = [
  { href: "#dong-hanh", label: "Nghi thức" },
  { href: "#hop-lumia", label: "LUMIA's box" },
  { href: "#testimonials", label: "Feedback" },
] as const;

export function FloatingNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-[80]">
      <motion.div
        layout
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={cn(scrolled ? "landing-frame px-2 pt-3" : "w-full px-0 pt-0")}
      >
        <motion.div
          layout
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "pointer-events-auto flex items-center justify-between",
            scrolled
              ? "h-16 rounded-full border border-white/70 bg-white/40 px-4 shadow-[0_14px_34px_rgba(42,51,69,0.08)] backdrop-blur-xl md:px-5"
              : "h-20 border-b border-white/40 bg-white/18 px-8 py-4 backdrop-blur-md md:px-10 lg:px-14",
          )}
        >
          <LumiaLogo className={cn(scrolled ? "scale-[0.35]" : "scale-[0.5]")} />

          <nav className="hidden items-center gap-6 text-[12px] tracking-[0.02em] text-muted md:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-matcha-deep"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="hidden text-[12px] font-medium text-matcha-deep md:inline-flex"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register?next=/boxes?onboarding=1"
              className={cn(
                "button-primary text-[12px]",
                scrolled ? "px-4 py-2" : "px-5 py-2.5",
              )}
            >
              Bắt đầu
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </header>
  );
}
