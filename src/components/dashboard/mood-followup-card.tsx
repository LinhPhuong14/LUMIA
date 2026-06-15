"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Route } from "next";

export type FollowUp = {
  message: string;
  cta: { label: string; href: string };
};

export function MoodFollowUpCard({ followUp }: { followUp: FollowUp }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-[20px] border border-[var(--green)]/20 bg-[var(--green-wash)] px-5 py-4"
    >
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--green)]/15">
          <Sparkles className="h-3.5 w-3.5 text-[var(--green-deep)]" />
        </div>
        <div className="flex-1">
          <p className="text-[13.5px] leading-relaxed text-[var(--green-deep)]">{followUp.message}</p>
          <Link
            href={followUp.cta.href as Route}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--green)] px-4 py-2 text-[12.5px] font-semibold text-white shadow-[0_4px_12px_rgba(95,111,82,0.25)] transition hover:opacity-90"
          >
            {followUp.cta.label}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
