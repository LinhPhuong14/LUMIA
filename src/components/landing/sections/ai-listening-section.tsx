"use client";

import { motion } from "framer-motion";
import { NotebookPen } from "lucide-react";

import { fadeUp } from "@/components/landing/shared/landing-motion";

export function AiListeningSection() {
  return (
    <section className="relative bg-[#F8F6EF] px-8 py-32 md:px-10 md:py-40 lg:px-14">
      <div className="landing-frame grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <motion.div {...fadeUp()} className="liquid-panel p-8 md:p-9">
          <span className="eyebrow">LUMIA lắng nghe</span>

          <h2 className="mt-5 font-serif text-[3rem] leading-[0.98] tracking-[-0.05em] text-matcha-deep md:text-[3.8rem]">
            Lắng nghe, không phán xét.
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-[28px] bg-white/72 px-5 py-4 text-[14px] leading-7 text-matcha-deep">
              Hôm nay bạn muốn LUMIA lắng nghe điều gì?
            </div>
            <div className="ml-auto max-w-[84%] rounded-[28px] bg-matcha-soft/92 px-5 py-4 text-[14px] leading-7 text-matcha-deep">
              Mình thấy hơi quá tải nhưng không biết nên bắt đầu từ đâu.
            </div>
            <div className="max-w-[88%] rounded-[28px] bg-white/84 px-5 py-4 text-[14px] leading-7 text-matcha-deep shadow-[0_18px_40px_rgba(143,168,120,0.1)]">
              Mình nghe thấy hôm nay bạn đang phải giữ khá nhiều thứ trong lòng.
              Bạn muốn kể thêm một chút về điều nặng nhất không?
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4">
          <motion.article {...fadeUp(0.05)} className="liquid-panel p-7">
            <div className="text-[14px] leading-7 text-muted">
              LUMIA không thay thế chuyên gia y tế hoặc chuyên gia tâm lý.
            </div>
          </motion.article>

          <motion.article {...fadeUp(0.1)} className="liquid-panel p-7">
            <div className="font-serif text-[2rem] leading-none text-matcha-deep">
              Cứ viết ra.
            </div>
            <p className="mt-3 text-[14px] leading-6 text-muted">
              Không cần đúng. Không cần hay. Chỉ cần đủ thật để bạn thấy mình nhẹ
              đi một chút.
            </p>
          </motion.article>

          <motion.article {...fadeUp(0.15)} className="liquid-panel p-7">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#FFFDF5,#DDE8D2)] text-matcha-deep">
                <NotebookPen className="h-4 w-4" />
              </div>
              <p className="text-[14px] leading-6 text-matcha-deep">
                Bạn đã đặt cảm xúc này xuống một chút rồi.
              </p>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
