"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { fadeUp } from "@/components/landing/shared/landing-motion";

export function JoinSection() {
  return (
    <section className="py-10">
      <div className="landing-frame">
        <motion.div
          {...fadeUp()}
          className="lumia-grain relative overflow-hidden rounded-[36px] px-8 py-16 text-center md:px-12 md:py-[76px]"
          style={{ background: "var(--gradient-emerald)" }}
        >
          <div
            className="pointer-events-none absolute left-[12%] top-[-36%] h-[360px] w-[360px] rounded-full blur-[24px]"
            style={{ background: "radial-gradient(circle, rgba(214,235,158,0.5), transparent 68%)" }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-[-40%] right-[10%] h-[340px] w-[340px] rounded-full blur-[24px]"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.3), transparent 68%)" }}
            aria-hidden
          />
          <div className="relative mx-auto max-w-[640px]">
            <h2
              className="font-serif text-[clamp(2.125rem,4.2vw,3.375rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white"
              style={{ textShadow: "0 2px 18px rgba(31,86,58,0.35)" }}
            >
              Tham gia ritual của LUMIA
            </h2>
            <p className="mx-auto mt-4 max-w-[480px] text-[15.5px] leading-relaxed text-white/85">
              Nhận ưu đãi sớm, cập nhật về các hộp mới và những gợi ý dịu dàng dành riêng cho buổi tối của bạn.
            </p>
            <div className="mx-auto mt-7 flex max-w-lg flex-col gap-3 sm:flex-row sm:justify-center">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="h-[54px] min-w-0 flex-1 rounded-full border border-white/35 bg-white/16 px-6 text-sm text-white outline-none backdrop-blur-md placeholder:text-white/70"
              />
              <button
                type="button"
                className="inline-flex h-[54px] shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-bold text-[var(--green-deep)] shadow-[0_14px_30px_rgba(31,86,58,0.3)]"
              >
                Đăng ký nhận tin <ArrowRight className="h-[15px] w-[15px]" />
              </button>
            </div>
            <p className="mt-4 text-[12.5px] text-white/70">
              Bạn có thể dừng nhận tin bất cứ lúc nào. LUMIA tôn trọng sự riêng tư của bạn.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
