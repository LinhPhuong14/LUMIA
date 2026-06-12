"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { HeroVideoBackground } from "@/components/landing/shared/hero-video-background";
import { fadeUp } from "@/components/landing/shared/landing-motion";

export function HeroSection() {
  return (
    <section className="relative isolate min-h-screen overflow-hidden bg-transparent">
      <HeroVideoBackground />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-48 bg-gradient-to-b from-transparent via-surface-warm/90 to-surface-warm md:h-64" />

      <div className="landing-frame relative z-[3] flex min-h-screen flex-col items-center justify-center pt-20 text-center">
        <motion.div {...fadeUp()} className="mx-auto max-w-4xl">
          <h1 className="font-serif text-4xl leading-tight tracking-[-0.05em] text-matcha-deep md:text-5xl xl:text-6xl">
            Một ritual dịu dàng cho những ngày bạn cần{" "}
            <span className="text-accent-light">nhẹ lại.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl pb-[12vh] text-base leading-8 text-muted md:text-lg">
            LUMIA kết hợp healing box vật lý và không gian digital để bạn ghi nhận
            cảm xúc, viết ra và được lắng nghe theo cách thật nhẹ.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="/boxes" className="button-primary px-8 py-4 text-[13px]">
              Khám phá hộp LUMIA
            </Link>
            <Link
              href="/register?next=/dashboard"
              className="button-secondary px-8 py-4 text-[13px]"
            >
              Bắt đầu hành trình của bạn
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
