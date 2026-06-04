"use client";

import { motion } from "framer-motion";

import { ritualCards } from "@/components/landing/data/landing-content";
import { fadeUp } from "@/components/landing/shared/landing-motion";
import { SectionHeading } from "@/components/landing/shared/section-heading";

export function RitualStepsSection() {
  return (
    <section
      id="dong-hanh"
      className="relative bg-[#F8F6EF] px-8 py-32 md:px-10 md:py-40 lg:px-14"
    >
      <div className="landing-frame">
        <SectionHeading
          eyebrow="Cách LUMIA đồng hành"
          title="Ba bước rất nhỏ, đủ để buổi tối nhẹ hơn."
        />

        <div className="relative z-[1] mt-12 grid gap-5 md:grid-cols-3">
          {ritualCards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.article
                key={card.title}
                {...fadeUp(index * 0.07)}
                whileHover={{ y: -6 }}
                className="liquid-panel p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#FFFDF5,#DDE8D2)] text-matcha-deep shadow-[0_16px_36px_rgba(143,168,120,0.14)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-serif text-[2rem] leading-none text-matcha-deep">
                  {card.title}
                </h3>
                <p className="mt-4 max-w-sm text-[14px] leading-7 text-muted">
                  {card.copy}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
