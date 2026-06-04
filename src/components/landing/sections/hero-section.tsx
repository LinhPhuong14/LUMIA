"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { HeroVideoBackground } from "@/components/landing/shared/hero-video-background";
import { fadeUp } from "@/components/landing/shared/landing-motion";

export function HeroSection() {
  return (
    <section className="relative isolate min-h-screen overflow-visible bg-[#F8F6EF]">
      <HeroVideoBackground />

      <div className="pointer-events-none absolute inset-x-0 -bottom-44 z-30 h-[34rem] bg-gradient-to-b from-transparent via-[#F8F6EF]/95 to-[#F8F6EF]" />

      <div className="landing-frame relative z-50 flex min-h-screen flex-col items-center justify-center px-2 pt-12 text-center">
        <motion.div {...fadeUp()} className="mx-auto max-w-4xl">
          <h1 className="font-serif text-[2.9rem] leading-[0.9] tracking-[-0.07em] text-matcha-deep md:text-[3.9rem] xl:text-[4.5rem]">
            Một ritual dịu dàng cho những ngày bạn cần{" "}
            <span className="text-[#b3c19b]">nhẹ lại.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl pb-[12vh] text-[15px] leading-8 text-lime-900 md:text-base">
            LUMIA kết hợp healing box vật lý và không gian digital để bạn ghi nhận
            cảm xúc, viết ra và được lắng nghe theo cách thật nhẹ.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="/boxes" className="button-primary px-8 py-4 text-[13px]">
              Khám phá LUMIA's Box
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
