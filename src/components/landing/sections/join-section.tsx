"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { fadeUp } from "@/components/landing/shared/landing-motion";

export function JoinSection() {
  return (
    <section className="bg-[#65774A] px-8 py-24 text-white md:px-10 lg:px-14">
      <div className="landing-frame max-w-[980px] text-center">
        <div className="font-serif text-[3.2rem] leading-[0.94] tracking-[-0.05em] md:text-[4.2rem]">
          Tham gia ritual của LUMIA
        </div>
        <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-white/78 md:text-base">
          Nhận ưu đãi sớm, cập nhật về các hộp mới và những gợi ý dịu dàng dành
          riêng cho buổi tối của bạn.
        </p>

        <motion.div
          {...fadeUp(0.08)}
          className="mx-auto mt-10 flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-center"
        >
          <input
            type="email"
            placeholder="Nhập email của bạn"
            className="h-15 min-w-0 flex-1 rounded-full border border-white/16 bg-white/10 px-6 text-[14px] text-white placeholder:text-white/52 outline-none backdrop-blur"
          />
          <button
            type="button"
            className="inline-flex h-15 items-center justify-center gap-2 rounded-full bg-white px-8 text-[14px] font-medium text-[#4f5f3c]"
          >
            Đăng ký nhận tin <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        <p className="mt-6 text-[13px] text-white/68">
          Bạn có thể dừng nhận tin bất cứ lúc nào. LUMIA tôn trọng sự riêng tư
          của bạn.
        </p>
      </div>
    </section>
  );
}
