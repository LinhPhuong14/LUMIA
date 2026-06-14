"use client";

import { motion } from "framer-motion";

import { fadeUp } from "@/components/landing/shared/landing-motion";
import { MobileHubPreview, MobileListenPreview, PhoneFrame } from "@/components/landing/shared/mobile-preview";

export function MobileDemoSection() {
  return (
    <section className="relative mt-6 overflow-hidden">
      <div className="landing-frame grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-x-20 xl:gap-x-24">
        <motion.div {...fadeUp()} className="lg:pr-6 xl:pr-10">
          <span className="lumia-kicker">- LUMIA trong túi bạn</span>
          <h2 className="lumia-h2">Mang nghi thức dịu lành theo mỗi tối.</h2>
          <p className="mt-4 max-w-[420px] text-base leading-relaxed text-[var(--muted)]">
            Giao diện mobile thật của LUMIA - tab bar nổi, hub tối nay và lắng nghe - đồng bộ với
            dashboard web và hệ sinh thái của bạn.
          </p>
        </motion.div>
        <div className="flex items-center justify-center gap-5 lg:pl-6 xl:pl-10">
          <PhoneFrame tilt="translateY(16px) rotate(-4deg)">
            <MobileHubPreview />
          </PhoneFrame>
          <PhoneFrame tilt="translateY(-12px) rotate(3deg)">
            <MobileListenPreview />
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}
