"use client";

import { motion } from "framer-motion";

import { fadeUp } from "@/components/landing/shared/landing-motion";

export function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <motion.div {...fadeUp()} className="relative z-[1] max-w-2xl">
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="mt-5 font-serif text-[2.8rem] leading-[0.98] tracking-[-0.05em] text-matcha-deep md:text-[3.6rem] lg:text-[4rem]">
        {title}
      </h2>
      {body ? (
        <p className="mt-5 max-w-xl text-[15px] leading-7 text-muted md:text-base">
          {body}
        </p>
      ) : null}
    </motion.div>
  );
}
