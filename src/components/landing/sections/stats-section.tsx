"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { statsTiles } from "@/components/landing/data/landing-content";
import { fadeUp } from "@/components/landing/shared/landing-motion";

export function StatsSection() {
  return (
    <section className="py-12">
      <div className="landing-frame grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div {...fadeUp()}>
          <span className="lumia-kicker">— Sức mạnh của một nghi thức nhỏ</span>
          <h2 className="lumia-h2">Mỗi tối một chút, đủ để đổi cả giấc ngủ.</h2>
          <p className="mt-4 max-w-[420px] text-base leading-relaxed text-[var(--muted)]">
            Không phải cố gắng nhiều hơn — chỉ là quay lại đều đặn. LUMIA giữ nhịp giúp bạn, dịu dàng và không phán xét.
          </p>
          <Link
            href="/register?next=/dashboard"
            className="mt-6 inline-flex rounded-full bg-[var(--green)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(63,158,110,0.3)]"
          >
            Bắt đầu hành trình
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          {statsTiles.map((tile, index) => (
            <motion.div
              key={tile.l}
              {...fadeUp(index * 0.06)}
              className="lumia-iris lumia-grain lumia-magnetic flex min-h-[150px] flex-col justify-end rounded-[26px] p-6"
              style={{ background: tile.grad }}
            >
              <div
                className="font-serif text-[44px] font-semibold leading-none text-white"
                style={{ textShadow: "0 2px 12px rgba(44,122,82,0.3)" }}
              >
                {tile.n}
                {tile.u ? <span className="ml-1 text-lg font-medium">{tile.u}</span> : null}
              </div>
              <div className="mt-2.5 text-[13px] font-semibold text-white/92">{tile.l}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
