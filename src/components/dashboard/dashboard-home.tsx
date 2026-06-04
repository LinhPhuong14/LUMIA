"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpenText, MessageCircleHeart, Sparkles } from "lucide-react";

const moods = ["Bình yên", "Mệt", "Lo", "Buồn", "Căng", "Trống rỗng"] as const;
const reasons = ["Công việc", "Học tập", "Gia đình", "Tình cảm", "Sức khỏe", "Tài chính", "Không rõ"] as const;

const actionCards = [
  {
    title: "Xả cảm xúc",
    copy: "Viết tự do trong vài phút để đặt bớt điều đang nặng xuống.",
    cta: "Xả ngay",
    href: "/journal?mode=release",
    icon: Sparkles,
  },
  {
    title: "Viết nhật ký",
    copy: "Trả lời một câu hỏi nhỏ để hiểu mình hơn hôm nay.",
    cta: "Viết một dòng",
    href: "/journal?mode=journal",
    icon: BookOpenText,
  },
  {
    title: "LUMIA lắng nghe",
    copy: "Để LUMIA lắng nghe điều bạn chưa biết nói với ai.",
    cta: "Mở cuộc trò chuyện",
    href: "/ai",
    icon: MessageCircleHeart,
  },
] as const;

export function DashboardHome({ planLabel, tier }: { planLabel: string; tier: string }) {
  const [selectedMood, setSelectedMood] = useState<string>("Mệt");
  const [selectedReason, setSelectedReason] = useState<string>("Công việc");
  const [intensity, setIntensity] = useState(3);
  const [saved, setSaved] = useState(false);
  const isFree = tier === "free";

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="soft-card overflow-hidden p-6 md:p-7"
        >
          <span className="eyebrow">{isFree ? "Dùng thử miễn phí" : "Không gian premium"}</span>
          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-serif text-4xl leading-tight text-matcha-deep">
                {isFree ? "Bạn có thể bắt đầu thật nhẹ trước, rồi nâng cấp khi đã sẵn sàng." : "Không gian của bạn đã được mở sâu hơn và dịu hơn."}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                {isFree
                  ? "Bạn đang ở chế độ dùng thử. Hôm nay vẫn có thể ghi nhận cảm xúc, viết ra và trò chuyện cùng LUMIA. Khi muốn đi sâu hơn, chỉ cần chọn một chiếc hộp."
                  : "Bạn đang dùng gói có quyền truy cập sâu hơn. Hãy bắt đầu từ check-in, viết ra điều đang nặng hoặc để LUMIA lắng nghe bạn."}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {isFree ? (
                <Link href="/boxes?onboarding=1" className="button-primary">
                  Chọn hộp để nâng cấp
                </Link>
              ) : (
                <Link href="/subscription" className="button-secondary">
                  Xem gói hiện tại
                </Link>
              )}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.06 }}
          className="soft-card p-6 md:p-7"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="eyebrow">Check-in nhanh</span>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-matcha-deep">Bạn đang cảm thấy thế nào?</h2>
            </div>
            <div className="rounded-full bg-[#FFF3C7] px-4 py-2 text-sm font-medium text-matcha-deep">{planLabel}</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {moods.map((mood, index) => (
              <motion.button
                key={mood}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                onClick={() => setSelectedMood(mood)}
                className={`rounded-full px-4 py-2 text-sm transition ${
                  selectedMood === mood
                    ? "bg-matcha text-white shadow-[0_18px_40px_rgba(143,168,120,0.24)]"
                    : "border border-matcha-soft bg-white text-matcha-deep hover:shadow-[0_12px_28px_rgba(143,168,120,0.12)]"
                }`}
              >
                {mood}
              </motion.button>
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

          <div className="mt-7">
            <div className="text-sm text-muted">Điều gì đang ảnh hưởng nhiều nhất?</div>
            <div className="mt-3 flex flex-wrap gap-3">
              {reasons.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    selectedReason === reason
                      ? "bg-[#FFF3C7] text-matcha-deep shadow-[0_16px_36px_rgba(244,216,120,0.18)]"
                      : "border border-white/70 bg-white text-muted"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <button type="button" onClick={() => setSaved(true)} className="button-primary">
              Lưu check-in
            </button>
            {saved ? <p className="text-sm text-matcha-deep">Đã lưu cảm xúc hiện tại của bạn.</p> : null}
          </div>
        </motion.section>

        <section className="soft-card p-6 md:p-7">
          <span className="eyebrow">Workspace tối nay</span>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-matcha-deep">Chọn một việc nhỏ để bắt đầu.</h2>
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {actionCards.map((card, index) => (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                className="rounded-[28px] border border-white/70 bg-white/78 p-5 shadow-[0_18px_44px_rgba(143,168,120,0.08)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#FFFDF5,#DDE8D2)] text-matcha-deep">
                  <card.icon className="h-4 w-4" />
                </div>
                <h3 className="mt-5 font-serif text-3xl leading-tight text-matcha-deep">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{card.copy}</p>
                <Link href={card.href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-matcha-deep">
                  {card.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="soft-card p-6 md:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="eyebrow">Nhìn lại nhẹ nhàng</span>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-matcha-deep">5 ngày gần đây của bạn</h2>
            </div>
            <Link href="/history" className="text-sm font-semibold text-matcha-deep">
              Xem lịch sử
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            {[
              { day: "T2", tone: "bg-[#DDE8D2]" },
              { day: "T3", tone: "bg-[#F8E7A1]" },
              { day: "T4", tone: "bg-[#B8CFA6]" },
              { day: "T5", tone: "bg-[#FFF3C7]" },
              { day: "T6", tone: "bg-[#DDE8D2]" },
            ].map((item, index) => (
              <motion.div
                key={item.day}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.38, delay: index * 0.05 }}
                className="flex flex-col items-center gap-3"
              >
                <div className={`h-5 w-5 rounded-full ${item.tone} shadow-[0_10px_24px_rgba(244,216,120,0.16)]`} />
                <span className="text-xs uppercase tracking-[0.2em] text-muted">{item.day}</span>
              </motion.div>
            ))}
          </div>
          <p className="mt-6 text-sm leading-7 text-muted">
            Tuần này bạn có nhiều ngày ở trạng thái mệt và lo. Không sao, chỉ cần nhận ra điều đó cũng đã là một bước bắt đầu rồi.
          </p>
        </section>
      </div>

      <aside className="space-y-6">
        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="soft-card p-6"
        >
          <span className="eyebrow">Lộ trình tối nay</span>
          <div className="mt-4 space-y-3">
            {["Ghi nhận cảm xúc hiện tại", "Viết ra 3 dòng ngắn", "Mở LUMIA lắng nghe nếu muốn được ở cạnh thêm"].map((item) => (
              <div key={item} className="rounded-[22px] border border-white/70 bg-white/82 px-4 py-3 text-sm text-matcha-deep">
                {item}
              </div>
            ))}
          </div>
        </motion.section>

        <section className="soft-card p-6">
          <span className="eyebrow">{isFree ? "Mở thêm khi sẵn sàng" : "Nhịp riêng của bạn"}</span>
          <p className="mt-4 text-sm leading-7 text-muted">
            {isFree
              ? "Bạn đang dùng bản nhẹ. Chọn một chiếc hộp bất cứ lúc nào để mở thêm lịch sử dài hơn, AI lắng nghe sâu hơn và nhiều lớp gợi ý hơn."
              : "Gần đây bạn thường quay lại vào buổi tối. LUMIA sẽ ưu tiên gợi ý các hoạt động nhẹ và ngắn hơn."}
          </p>
          {isFree ? (
            <Link href="/boxes?onboarding=1" className="button-primary mt-5">
              Xem các hộp
            </Link>
          ) : null}
        </section>
      </aside>
    </div>
  );
}
