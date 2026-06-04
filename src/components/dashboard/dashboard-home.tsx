"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpenText, MessageCircleHeart, Sparkles } from "lucide-react";

const moods = ["Bình yên", "Mệt", "Lo", "Buồn", "Căng", "Trống rỗng"] as const;
const reasons = ["Công việc", "Học tập", "Gia đình", "Tình cảm", "Sức khỏe", "Tài chính", "Không rõ"] as const;

const actionCards = [
  {
    title: "Xả cảm xúc",
    copy: "Viết tự do vài phút để đặt bớt điều đang nặng xuống.",
    cta: "Xả ngay",
    href: "/journal?mode=release",
    icon: Sparkles,
  },
  {
    title: "Viết journal",
    copy: "Trả lời một câu hỏi ngắn để hiểu mình hơn hôm nay.",
    cta: "Viết một dòng",
    href: "/journal?mode=journal",
    icon: BookOpenText,
  },
  {
    title: "LUMIA lắng nghe",
    copy: "Mở cuộc trò chuyện khi bạn muốn được ở cạnh thêm một chút.",
    cta: "Mở ngay",
    href: "/ai",
    icon: MessageCircleHeart,
  },
] as const;

function fadeMotion(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
  } as const;
}

export function DashboardHome({ planLabel, tier }: { planLabel: string; tier: string }) {
  const [selectedMood, setSelectedMood] = useState<string>("Mệt");
  const [selectedReason, setSelectedReason] = useState<string>("Công việc");
  const [intensity, setIntensity] = useState(3);
  const [saved, setSaved] = useState(false);
  const isFree = tier === "free";

  return (
    <div className="grid gap-3 lg:h-full lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.82fr)] lg:overflow-hidden">
      <div className="grid gap-3 lg:min-h-0 lg:grid-rows-[auto_1fr] lg:overflow-hidden">
        <motion.section {...fadeMotion()} className="dashboard-glass rounded-[28px] px-4 py-4 lg:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <span className="eyebrow">{isFree ? "Dùng thử miễn phí" : "Không gian premium"}</span>
              <h2 className="mt-3 font-serif text-[2rem] leading-[0.96] tracking-[-0.04em] text-matcha-deep lg:text-[2.3rem]">
                {isFree
                  ? "Bạn có thể bắt đầu rất nhẹ, rồi nâng cấp khi đã sẵn sàng."
                  : "Không gian của bạn đã mở thêm nhiều lớp dịu và sâu hơn."}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                {isFree
                  ? "Vẫn có thể ghi nhận cảm xúc, viết ra và trò chuyện cùng LUMIA. Khi muốn đi sâu hơn, chỉ cần chọn một chiếc hộp."
                  : "Hôm nay bạn có thể check-in, viết ra điều đang nặng hoặc để LUMIA ở cạnh thêm một chút."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <div className="rounded-full border border-white/80 bg-white/74 px-3.5 py-2 text-sm font-medium text-matcha-deep">
                {planLabel}
              </div>
              <Link href={isFree ? "/boxes?onboarding=1" : "/subscription"} className="button-primary px-5 py-2.5 text-sm">
                {isFree ? "Chọn hộp để nâng cấp" : "Xem gói hiện tại"}
              </Link>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-3 lg:min-h-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] lg:overflow-hidden">
          <motion.section
            {...fadeMotion(0.05)}
            className="dashboard-glass rounded-[28px] px-4 py-4 lg:flex lg:min-h-0 lg:flex-col lg:px-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="eyebrow">Check-in nhanh</span>
                <h3 className="mt-3 font-serif text-[1.95rem] leading-[0.98] tracking-[-0.04em] text-matcha-deep">
                  Bạn đang cảm thấy thế nào?
                </h3>
              </div>
              <div className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-sm font-medium text-matcha-deep">
                {intensity}/5
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {moods.map((mood, index) => (
                <motion.button
                  key={mood}
                  type="button"
                  {...fadeMotion(index * 0.03)}
                  onClick={() => setSelectedMood(mood)}
                  className={`rounded-full px-3.5 py-2 text-sm transition ${
                    selectedMood === mood
                      ? "bg-matcha text-white shadow-[0_14px_30px_rgba(143,168,120,0.24)]"
                      : "border border-white/80 bg-white/72 text-matcha-deep hover:bg-white"
                  }`}
                >
                  {mood}
                </motion.button>
              ))}
            </div>

            <div className="mt-4">
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
                className="mt-2.5 h-2 w-full cursor-pointer appearance-none rounded-full bg-[linear-gradient(90deg,#DDE8D2,#FFF3C7)]"
              />
            </div>

            <div className="mt-4">
              <div className="text-sm text-muted">Điều gì đang ảnh hưởng nhiều nhất?</div>
              <div className="mt-2.5 flex flex-wrap gap-2.5">
                {reasons.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`rounded-full px-3.5 py-2 text-sm transition ${
                      selectedReason === reason
                        ? "bg-[#FFF3C7] text-matcha-deep shadow-[0_14px_30px_rgba(244,216,120,0.18)]"
                        : "border border-white/80 bg-white/68 text-muted"
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => setSaved(true)} className="button-primary px-5 py-2.5 text-sm">
                Lưu check-in
              </button>
              {saved ? <p className="text-sm text-matcha-deep">Đã lưu cảm xúc hiện tại của bạn.</p> : null}
            </div>
          </motion.section>

          <div className="grid gap-3 lg:min-h-0 lg:grid-rows-[auto_auto_1fr] lg:overflow-hidden">
            <motion.section {...fadeMotion(0.1)} className="dashboard-glass rounded-[28px] px-4 py-4 lg:px-5">
              <span className="eyebrow">Gợi ý cho hôm nay</span>
              <p className="mt-3 text-sm leading-6 text-muted">
                Nếu hôm nay hơi quá tải, hãy bắt đầu bằng 3 dòng ngắn. Không cần giải thích mọi thứ.
              </p>
            </motion.section>

            <motion.section {...fadeMotion(0.14)} className="dashboard-glass rounded-[28px] px-4 py-4 lg:px-5">
              <span className="eyebrow">Nhịp riêng của bạn</span>
              <p className="mt-3 text-sm leading-6 text-muted">
                Gần đây bạn thường quay lại vào buổi tối. LUMIA sẽ ưu tiên gợi ý các bước ngắn và ít áp lực hơn.
              </p>
            </motion.section>

            <motion.section
              {...fadeMotion(0.18)}
              className="dashboard-glass rounded-[28px] px-4 py-4 lg:flex lg:min-h-0 lg:flex-col lg:px-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="eyebrow">Nhìn lại nhẹ nhàng</span>
                  <h3 className="mt-3 font-serif text-[1.85rem] leading-[1] tracking-[-0.04em] text-matcha-deep">
                    7 ngày gần đây
                  </h3>
                </div>
                <Link href="/history" className="text-sm font-semibold text-matcha-deep">
                  Xem lịch sử
                </Link>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  { day: "T2", tone: "bg-[#DDE8D2]" },
                  { day: "T3", tone: "bg-[#F8E7A1]" },
                  { day: "T4", tone: "bg-[#B8CFA6]" },
                  { day: "T5", tone: "bg-[#FFF3C7]" },
                  { day: "T6", tone: "bg-[#DDE8D2]" },
                  { day: "T7", tone: "bg-[#F7EFCB]" },
                ].map((item, index) => (
                  <motion.div
                    key={item.day}
                    initial={{ opacity: 0, scale: 0.88 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.34, delay: index * 0.04 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className={`h-4.5 w-4.5 rounded-full ${item.tone} shadow-[0_8px_22px_rgba(244,216,120,0.18)]`} />
                    <span className="text-[11px] uppercase tracking-[0.22em] text-muted">{item.day}</span>
                  </motion.div>
                ))}
              </div>

              <p className="mt-4 text-sm leading-6 text-muted">
                Tuần này bạn có nhiều ngày ở trạng thái mệt và lo. Việc nhận ra điều đó đã là một bước bắt đầu rồi.
              </p>
            </motion.section>
          </div>
        </div>
      </div>

      <aside className="grid gap-3 lg:h-full lg:grid-rows-[auto_1fr] lg:overflow-hidden">
        <motion.section {...fadeMotion(0.12)} className="dashboard-glass rounded-[28px] px-4 py-4 lg:px-5">
          <span className="eyebrow">Lộ trình tối nay</span>
          <div className="mt-3 grid gap-2.5">
            {[
              "Ghi nhận cảm xúc hiện tại",
              "Viết ra 3 dòng ngắn",
              "Mở LUMIA lắng nghe nếu muốn được ở cạnh thêm",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[20px] border border-white/80 bg-white/66 px-3.5 py-3 text-sm leading-6 text-matcha-deep"
              >
                {item}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          {...fadeMotion(0.18)}
          className="dashboard-glass rounded-[28px] px-4 py-4 lg:flex lg:min-h-0 lg:flex-col lg:justify-between lg:px-5"
        >
          <div>
            <span className="eyebrow">{isFree ? "Mở thêm khi sẵn sàng" : "Bắt đầu bằng điều nhỏ nhất"}</span>
            <p className="mt-3 text-sm leading-6 text-muted">
              {isFree
                ? "Chọn một chiếc hộp bất cứ lúc nào để mở thêm lịch sử dài hơn và không gian lắng nghe sâu hơn."
                : "Workspace này không yêu cầu bạn phải làm nhiều trong một tối. Chỉ cần bắt đầu từ điều nhỏ nhất."}
            </p>
          </div>

          <div className="mt-4 grid gap-2.5">
            {actionCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  href={card.href}
                  className="rounded-[22px] border border-white/80 bg-white/66 px-4 py-3.5 text-sm transition hover:-translate-y-0.5 hover:bg-white/76"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#FFFDF5,#DDE8D2)] text-matcha-deep">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-matcha-deep">{card.title}</div>
                      <div className="mt-1 text-muted">{card.copy}</div>
                      <div className="mt-2 font-medium text-matcha-deep">{card.cta}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.section>
      </aside>
    </div>
  );
}
