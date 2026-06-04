"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

const prompts = [
  "Điều gì khiến bạn mệt nhất hôm nay?",
  "Điều gì đã giúp bạn đi qua ngày hôm nay?",
  "Bạn đang cần điều gì mà chưa nói ra?",
  "Nếu dịu lại 1%, bạn sẽ làm gì trước?",
] as const;

const moods = ["Bình yên", "Mệt", "Lo", "Buồn", "Căng", "Trống rỗng"] as const;
const reasons = ["Công việc", "Học tập", "Gia đình", "Tình cảm", "Sức khỏe", "Tài chính", "Không rõ"] as const;

type JournalMode = "release" | "journal" | "mood";

export function JournalStudio({ initialMode = "release" }: { initialMode?: JournalMode }) {
  const [mode, setMode] = useState<JournalMode>(initialMode);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState("Mệt");
  const [selectedReason, setSelectedReason] = useState("Không rõ");
  const [intensity, setIntensity] = useState(3);

  const particles = useMemo(() => Array.from({ length: 9 }), []);

  function onSoftSave(message: string) {
    setSavedMessage(message);
    window.setTimeout(() => setSavedMessage(null), 2200);
  }

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-full border border-white/70 bg-white/84 p-1 shadow-sm">
        {[
          { key: "release", label: "Xả nhanh" },
          { key: "journal", label: "Nhật ký có gợi mở" },
          { key: "mood", label: "Ghi nhận cảm xúc" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setMode(item.key as JournalMode)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              mode === item.key ? "bg-matcha text-white" : "text-muted"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === "release" ? (
        <section className="hero-card relative overflow-hidden p-8 md:p-10">
          <span className="eyebrow">Xả nhanh</span>
          <h2 className="mt-4 font-serif text-5xl leading-tight text-matcha-deep">Cứ viết ra. Không cần đúng. Không cần hay.</h2>
          <textarea
            className="mt-8 min-h-72 w-full rounded-[30px] border border-white/70 bg-white/84 p-6 text-base leading-8 outline-none ring-matcha/20 focus:ring-4"
            placeholder="Hôm nay có điều gì bạn muốn đặt xuống không?"
          />
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="relative h-14">
              {savedMessage ? (
                <div className="absolute inset-0 flex items-center gap-2 text-sm text-matcha-deep">
                  {particles.map((_, index) => (
                    <span
                      key={index}
                      className="absolute h-2.5 w-2.5 rounded-full bg-[#F4D878] animate-particle-rise"
                      style={{ left: `${index * 12}px`, animationDelay: `${index * 0.06}s` }}
                    />
                  ))}
                  <span className="relative z-10">{savedMessage}</span>
                </div>
              ) : (
                <p className="text-sm text-muted">Viết ra vừa đủ thôi, mình không cần cố trọn vẹn ngay.</p>
              )}
            </div>
            <button type="button" onClick={() => onSoftSave("Bạn đã đặt cảm xúc này xuống một chút rồi.")} className="button-primary">
              Xả đi
            </button>
          </div>
        </section>
      ) : null}

      {mode === "journal" ? (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hero-card p-8 md:p-10">
            <span className="eyebrow">Nhật ký có gợi mở</span>
            <h2 className="mt-4 font-serif text-5xl leading-tight text-matcha-deep">Một câu hỏi nhỏ cho hôm nay.</h2>
            <textarea
              className="mt-8 min-h-72 w-full rounded-[30px] border border-white/70 bg-white/84 p-6 text-base leading-8 outline-none ring-matcha/20 focus:ring-4"
              placeholder="Bắt đầu từ câu hỏi khiến bạn muốn viết nhất..."
            />
            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="text-sm text-muted">{savedMessage ?? "Không cần viết dài. Một dòng thật cũng đủ."}</p>
              <button type="button" onClick={() => onSoftSave("Nhật ký hôm nay đã được lưu nhẹ nhàng.")} className="button-primary">
                Lưu nhật ký
              </button>
            </div>
          </section>
          <aside className="grid gap-4">
            {prompts.map((prompt, index) => (
              <motion.article
                key={prompt}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                className="soft-card p-6"
              >
                <p className="text-base leading-7 text-matcha-deep">{prompt}</p>
              </motion.article>
            ))}
          </aside>
        </div>
      ) : null}

      {mode === "mood" ? (
        <section className="soft-card p-8 md:p-10">
          <span className="eyebrow">Ghi nhận cảm xúc</span>
          <h2 className="mt-4 font-serif text-5xl leading-tight text-matcha-deep">Ghi nhận cảm xúc hiện tại.</h2>

          <div className="mt-7 flex flex-wrap gap-3">
            {moods.map((mood) => (
              <button
                key={mood}
                type="button"
                onClick={() => setSelectedMood(mood)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  selectedMood === mood ? "bg-matcha text-white" : "border border-matcha-soft bg-white text-matcha-deep"
                }`}
              >
                {mood}
              </button>
            ))}
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Mức độ cảm xúc</span>
              <span>{intensity}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={intensity}
              onChange={(event) => setIntensity(Number(event.target.value))}
              className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-[linear-gradient(90deg,#DDE8D2,#FFF3C7)]"
            />
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {reasons.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setSelectedReason(reason)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  selectedReason === reason ? "bg-[#FFF3C7] text-matcha-deep" : "border border-white/70 bg-white text-muted"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>

          <textarea
            className="mt-7 min-h-32 w-full rounded-[30px] border border-white/70 bg-white/84 p-6 text-base leading-8 outline-none ring-matcha/20 focus:ring-4"
            placeholder="Một ghi chú ngắn cho chính mình..."
          />

          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-muted">{savedMessage ?? "Chỉ cần đủ để bạn nhìn lại mình rõ hơn một chút."}</p>
            <button type="button" onClick={() => onSoftSave("Đã lưu cảm xúc hiện tại của bạn.")} className="button-primary">
              Lưu cảm xúc
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
