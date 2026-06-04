"use client";

import { motion } from "framer-motion";

const conversations = [
  "Tối nay mình thấy hơi quá tải",
  "Mình đang không biết bắt đầu từ đâu",
  "Hôm nay mình mệt vì công việc",
] as const;

const suggestions = ["Viết tiếp nhật ký", "Xả cảm xúc", "Ghi nhận cảm xúc", "Nghỉ một chút"] as const;

export function AiStudio() {
  return (
    <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
      <section className="soft-card p-5">
        <span className="eyebrow">Cuộc trò chuyện</span>
        <div className="mt-5 space-y-3">
          {conversations.map((conversation, index) => (
            <motion.button
              key={conversation}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className={`w-full rounded-[22px] px-4 py-4 text-left text-sm leading-6 ${
                index === 0 ? "bg-[#FFF3C7] text-matcha-deep" : "border border-white/70 bg-white text-muted"
              }`}
            >
              {conversation}
            </motion.button>
          ))}
        </div>
      </section>

      <section className="soft-card flex min-h-[640px] flex-col p-6">
        <div>
          <span className="eyebrow">LUMIA lắng nghe</span>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-matcha-deep">Hôm nay bạn muốn LUMIA lắng nghe điều gì?</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            LUMIA không thay thế chuyên gia y tế hoặc chuyên gia tâm lý.
          </p>
        </div>

        <div className="mt-8 flex-1 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-[82%] rounded-[28px] rounded-bl-md bg-[#FFFDF5] px-5 py-4 text-sm leading-7 text-matcha-deep"
          >
            Hôm nay bạn muốn LUMIA lắng nghe điều gì?
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="ml-auto max-w-[82%] rounded-[28px] rounded-br-md bg-[#DDE8D2] px-5 py-4 text-sm leading-7 text-matcha-deep"
          >
            Hôm nay mình thấy hơi nặng lòng.
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.22 }}
            className="max-w-[86%] rounded-[28px] rounded-bl-md bg-white px-5 py-4 text-sm leading-7 text-matcha-deep shadow-[0_18px_44px_rgba(143,168,120,0.08)]"
          >
            Mình nghe thấy hôm nay có điều gì đó đang làm bạn mệt. Bạn không cần kể mọi thứ ngay. Mình có thể bắt đầu bằng một câu hỏi nhỏ: điều gì khiến bạn thấy nặng nhất lúc này?
          </motion.div>

          <div className="flex items-center gap-2 pl-2">
            {[0, 1, 2].map((item) => (
              <span
                key={item}
                className="h-2.5 w-2.5 rounded-full bg-matcha animate-breathe-glow"
                style={{ animationDelay: `${item * 0.2}s` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-matcha-soft bg-white px-4 py-3 shadow-[0_14px_34px_rgba(143,168,120,0.08)]">
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            placeholder="Viết điều đang ở trong lòng bạn…"
          />
        </div>
      </section>

      <aside className="space-y-6">
        <section className="soft-card p-5">
          <span className="eyebrow">Gợi ý nhỏ</span>
          <div className="mt-5 space-y-3">
            {suggestions.map((item, index) => (
              <motion.button
                key={item}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.07 }}
                className="w-full rounded-[24px] border border-white/70 bg-white/84 px-4 py-4 text-left text-sm text-matcha-deep shadow-[0_14px_34px_rgba(143,168,120,0.06)]"
              >
                {item}
              </motion.button>
            ))}
          </div>
        </section>

        <section className="soft-card p-5 text-sm leading-6 text-muted">
          Không có câu trả lời hoàn hảo ở đây. Chỉ có một chỗ để bạn được nói ra theo nhịp riêng của mình.
        </section>
      </aside>
    </div>
  );
}
