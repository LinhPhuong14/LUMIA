"use client";

import { NotebookPen } from "lucide-react";
import { motion } from "framer-motion";

import { fadeUp } from "@/components/landing/shared/landing-motion";

export function AiListeningSection() {
  return (
    <section id="lang-nghe" className="py-14">
      <div className="landing-frame grid items-stretch gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div {...fadeUp()} className="lumia-glass lumia-grain-soft rounded-[30px] p-8 md:p-9">
          <span className="lumia-kicker">- LUMIA lắng nghe</span>
          <h2 className="lumia-h2 max-w-[460px]">Lắng nghe, không phán xét.</h2>
          <div className="mt-6 flex flex-col gap-3.5">
            <div className="max-w-[88%] self-start rounded-[22px] bg-white/80 px-4 py-3.5 text-sm leading-relaxed text-[var(--foreground)] shadow-[0_10px_26px_rgba(122,140,82,0.08)]">
              Hôm nay bạn muốn LUMIA lắng nghe điều gì?
            </div>
            <div className="max-w-[84%] self-end rounded-[22px] bg-[var(--green-wash)] px-4 py-3.5 text-sm leading-relaxed text-[var(--green-deep)]">
              Mình thấy hơi quá tải nhưng không biết nên bắt đầu từ đâu.
            </div>
            <div className="max-w-[92%] self-start rounded-[22px] bg-white/90 px-4 py-3.5 text-sm leading-relaxed text-[var(--foreground)] shadow-[0_18px_40px_rgba(143,168,120,0.12)]">
              Mình nghe thấy hôm nay bạn đang phải giữ khá nhiều thứ trong lòng. Bạn muốn kể thêm một chút về điều nặng nhất không?
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 lg:grid-rows-[auto_1fr_auto]">
          <motion.article
            {...fadeUp(0.05)}
            className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] p-5 shadow-[0_12px_30px_rgba(95,111,82,0.08)]"
          >
            <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
              LUMIA không thay thế chuyên gia y tế hoặc chuyên gia tâm lý.
            </p>
          </motion.article>

          <motion.article
            {...fadeUp(0.1)}
            className="lumia-grain flex flex-col justify-end rounded-[24px] p-6 shadow-[0_16px_38px_rgba(95,111,82,0.14)]"
            style={{ background: "var(--gradient-honeyjade)" }}
          >
            <h3
              className="font-serif text-[30px] font-semibold tracking-[-0.02em] text-white"
              style={{ textShadow: "0 2px 12px rgba(44,122,82,0.3)" }}
            >
              Cứ viết ra.
            </h3>
            <p className="mt-2 max-w-[360px] text-sm leading-relaxed text-white/94">
              Không cần đúng. Không cần hay. Chỉ cần đủ thật để bạn thấy mình nhẹ đi một chút.
            </p>
          </motion.article>

          <motion.article
            {...fadeUp(0.15)}
            className="flex items-center gap-3.5 rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] p-5 shadow-[0_12px_30px_rgba(95,111,82,0.08)]"
          >
            <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#FFFDF5] to-[#DDE8D2]">
              <NotebookPen className="h-[18px] w-[18px] text-[var(--green-deep)]" />
            </div>
            <p className="text-sm leading-snug text-[var(--foreground)]">Bạn đã đặt cảm xúc này xuống một chút rồi.</p>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
