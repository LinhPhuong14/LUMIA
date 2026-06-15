"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { HeroVideoBackground } from "@/components/landing/shared/hero-video-background";
import { fadeUp } from "@/components/landing/shared/landing-motion";
import { useLumiaTheme } from "@/components/theme/lumia-theme-provider";
import { cn } from "@/lib/utils";

export function HeroSection() {
  const { isDark } = useLumiaTheme();

  return (
    <section
      data-hero-mode={isDark ? "evening" : "day"}
      className="relative isolate min-h-screen overflow-hidden bg-transparent"
    >
      <HeroVideoBackground key={isDark ? "evening" : "day"} evening={isDark} />

      <div
        className={cn(
          "hero-section-fade pointer-events-none absolute inset-x-0 bottom-0 z-[2]",
          isDark && "hero-section-fade--dark",
        )}
      />

      <div className="landing-frame relative z-[3] flex min-h-screen flex-col items-center justify-start pt-[10vh] text-center md:pt-[12vh] lg:pt-[11vh]">
        <motion.div {...fadeUp()} className="mx-auto w-full max-w-4xl px-5 py-8 md:px-10 md:py-10">
          <p
            className={cn(
              "mb-4 text-sm font-semibold uppercase tracking-[0.18em]",
              isDark ? "text-[var(--green-bright)]" : "text-[var(--lumia-green)]",
            )}
          >
            Hệ sinh thái LUMIA
          </p>
          <h1
            className={cn(
              "font-serif text-[1.65rem] font-bold not-italic leading-snug tracking-[-0.02em] md:text-4xl lg:text-[2.65rem] lg:leading-tight",
              isDark ? "text-white" : "text-[var(--matcha-deep)]",
            )}
          >
            LUMIA - Hệ sinh thái công nghệ thấu hiểu và tái tạo giấc ngủ của bạn.
          </h1>

          <p
            className={cn(
              "mx-auto mt-5 max-w-2xl text-base leading-8 md:mt-6 md:text-lg",
              isDark ? "text-white/88" : "text-[var(--lumia-text-mid)]",
            )}
          >
            Theo dõi cảm xúc, phân tích giấc ngủ và được AI lắng nghe - kết hợp công cụ vật lý khi bạn
            sẵn sàng đi sâu hơn.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4 md:mt-9">
            <Link href="/store" className="button-primary px-8 py-4 text-[13px]">
              Khám phá Hệ sinh thái LUMIA
            </Link>
            <Link
              href="/quiz"
              className={cn(
                "button-secondary px-8 py-4 text-[13px]",
                isDark && "border-white/25 bg-white/10 text-white hover:bg-white/16",
              )}
            >
              Tìm gói phù hợp với bạn
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
