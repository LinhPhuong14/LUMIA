"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { landingBoxCards } from "@/components/landing/data/landing-content";
import { fadeUp } from "@/components/landing/shared/landing-motion";
import { SectionHeading } from "@/components/landing/shared/section-heading";

export function BoxesShowcaseSection() {
  return (
    <section
      id="hop-lumia"
      className="relative bg-[#F8F6EF] px-8 py-32 md:px-10 md:py-40 lg:px-14"
    >
      <div className="landing-frame">
        <div className="relative z-[1] flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Hộp LUMIA"
            title="Chọn chiếc hộp phù hợp với nhịp chăm sóc của bạn."
            body="Mỗi hộp mở một mức trải nghiệm digital khác nhau, từ check-in cảm xúc cơ bản đến không gian lắng nghe sâu hơn."
          />

          <Link href="/boxes" className="button-secondary px-7 py-4 text-[13px]">
            Xem tất cả hộp
          </Link>
        </div>

        <div className="relative z-[1] mt-12 grid gap-5 lg:grid-cols-3">
          {landingBoxCards.map((box, index) => (
            <motion.article
              key={box.title}
              {...fadeUp(index * 0.07)}
              whileHover={{ y: -6 }}
              className={`liquid-panel p-6 ${
                index === 1 ? "ring-1 ring-[#F4D878]/70" : ""
              }`}
            >
              <div className="rounded-[28px] border border-white/75 bg-white/40 p-6 text-[14px] leading-6 text-muted">
                Ảnh box sẽ được cập nhật sau.
              </div>
              <h3 className="mt-5 font-serif text-[2rem] leading-none text-matcha-deep">
                {box.title}
              </h3>
              <p className="mt-2 text-[13px] font-medium text-matcha-deep">
                {box.price}
              </p>
              <p className="mt-3 text-[14px] leading-6 text-muted">{box.copy}</p>
              <Link
                href="/boxes"
                className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-matcha-deep"
              >
                Xem chi tiết <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
