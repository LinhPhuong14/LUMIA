"use client";

import { motion } from "framer-motion";

import { fadeUp } from "@/components/landing/shared/landing-motion";
import { SleepQuizFlow } from "@/components/marketing/sleep-quiz-flow";

export function QuizSection() {
  return (
    <section id="quiz" className="py-16 md:py-24">
      <div className="landing-frame">
        <motion.div {...fadeUp()} className="mb-12 text-center">
          <span className="lumia-kicker">- Tìm gói phù hợp</span>
          <h2 className="lumia-h2 mt-2">LUMIA dành riêng cho bạn</h2>
          <p className="mx-auto mt-3 max-w-[480px] text-base leading-relaxed text-[var(--muted)]">
            4 câu hỏi ngắn về giấc ngủ và cảm xúc — LUMIA gợi ý gói phù hợp, không áp lực quyết định.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp(0.1)}
          className="mx-auto max-w-lg"
        >
          <div className="dash-panel p-6 md:p-8">
            <SleepQuizFlow />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
