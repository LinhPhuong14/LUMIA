"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

import { StartJourneyButton } from "@/components/dashboard/start-journey-button";
import type { OrderEntry } from "@/lib/orders";
import type { SubscriptionSnapshot } from "@/lib/subscriptions";
import { getOrderStatusLabel } from "@/lib/orders";

const moods = ["Bình yên", "Mệt", "Lo", "Buồn", "Căng", "Trống rỗng"] as const;
const reasons = [
  "Công việc",
  "Học tập",
  "Gia đình",
  "Tình cảm",
  "Sức khỏe",
  "Tài chính",
  "Không rõ",
] as const;

function fadeMotion(delay = 0) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay },
  } as const;
}

export function DashboardHome({
  planLabel,
  subscription,
  latestOrder,
}: {
  planLabel: string;
  subscription: SubscriptionSnapshot;
  latestOrder: OrderEntry | null;
}) {
  const [selectedMood, setSelectedMood] = useState<string>("Mệt");
  const [selectedReason, setSelectedReason] = useState<string>("Công việc");
  const [intensity, setIntensity] = useState(3);
  const [saved, setSaved] = useState(false);
  const isFree = !subscription.isActive;
  const canStartJourney =
    latestOrder?.status === "delivered" &&
    subscription.status === "active" &&
    !subscription.startedAt;

  return (
    <div className="grid gap-4 lg:min-h-0 lg:grid-cols-[minmax(0,1.06fr)_minmax(320px,0.94fr)] lg:overflow-hidden">
      <motion.section
        {...fadeMotion()}
        className="dashboard-glass rounded-[32px] px-5 py-5 lg:flex lg:min-h-0 lg:flex-col lg:px-6 lg:py-6"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <span className="eyebrow">
              {isFree ? "Dùng thử miễn phí" : "Không gian premium"}
            </span>
            <p className="mt-3 max-w-2xl text-[13px] leading-6 text-muted">
              {isFree
                ? "Bạn vẫn có thể ghi nhận cảm xúc, viết ra và trò chuyện cùng LUMIA. Khi muốn đi sâu hơn, chỉ cần chọn một chiếc hộp."
                : "Hôm nay bạn có thể check-in, viết ra điều đang nặng hoặc để LUMIA ở cạnh thêm một chút."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <div className="rounded-full border border-white/80 bg-white/74 px-3.5 py-2 text-[13px] font-medium text-matcha-deep">
              {planLabel}
            </div>
            {canStartJourney ? (
              <StartJourneyButton />
            ) : (
              <Link
                href={isFree ? "/boxes" : "/subscription"}
                className="button-primary px-5 py-2.5 text-[13px]"
              >
                {isFree ? "Mua hộp LUMIA" : "Xem gói hiện tại"}
              </Link>
            )}
          </div>
        </div>

        {latestOrder && !subscription.isActive ? (
          <div className="mt-4 rounded-[24px] border border-white/70 bg-white/78 px-4 py-3 text-[13px] text-muted">
            Đơn hàng: {getOrderStatusLabel(latestOrder.status)}
            {latestOrder.status === "paid" && " — đang chuẩn bị giao hàng."}
          </div>
        ) : null}

        {subscription.isActive && subscription.currentDay ? (
          <div className="mt-4 rounded-[24px] border border-white/70 bg-white/78 px-4 py-3 text-[13px] text-matcha-deep">
            Ngày {subscription.currentDay}/21 trên hành trình của bạn.
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 lg:min-h-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)] lg:overflow-hidden">
          <section className="dashboard-glass rounded-[30px] px-5 py-5 lg:flex lg:min-h-0 lg:flex-col lg:px-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="eyebrow">Tâm trạng hôm nay</span>
                <h3 className="mt-3 font-serif text-[1.72rem] leading-[0.98] tracking-[-0.04em] text-matcha-deep">
                  Bạn đang cảm thấy thế nào?
                </h3>
              </div>
              <div className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-[13px] font-medium text-matcha-deep">
                {intensity}/5
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {moods.map((mood, index) => (
                <motion.button
                  key={mood}
                  type="button"
                  {...fadeMotion(index * 0.03)}
                  onClick={() => setSelectedMood(mood)}
                  className={`rounded-full px-3 py-2 text-[13px] transition ${
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
              <div className="flex items-center justify-between text-[13px] text-muted">
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

            <div className="mt-4">
              <div className="text-[13px] text-muted">
                Điều gì đang ảnh hưởng nhiều nhất?
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {reasons.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setSelectedReason(reason)}
                    className={`rounded-full px-3 py-2 text-[13px] transition ${
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
              <button
                type="button"
                onClick={() => setSaved(true)}
                className="button-primary px-5 py-2.5 text-[13px]"
              >
                Lưu check-in
              </button>
              {saved ? (
                <p className="text-[13px] text-matcha-deep">
                  Đã lưu cảm xúc hiện tại của bạn.
                </p>
              ) : null}
            </div>
          </section>

          <div className="grid gap-4 lg:min-h-0 lg:grid-rows-[auto_auto_1fr] lg:overflow-hidden">
            <motion.section
              {...fadeMotion(0.1)}
              className="dashboard-glass rounded-[30px] px-5 py-5 lg:px-6"
            >
              <span className="eyebrow">Gợi ý cho hôm nay</span>
              <p className="mt-3 text-[13px] leading-6 text-muted">
                Nếu hôm nay hơi quá tải, hãy bắt đầu bằng 3 dòng ngắn. Không cần giải thích mọi thứ.
              </p>
            </motion.section>

            <motion.section
              {...fadeMotion(0.14)}
              className="dashboard-glass rounded-[30px] px-5 py-5 lg:px-6"
            >
              <span className="eyebrow">Nhịp riêng của bạn</span>
              <p className="mt-3 text-[13px] leading-6 text-muted">
                Gần đây bạn thường quay lại vào buổi tối. LUMIA sẽ ưu tiên gợi ý các bước ngắn và ít áp lực hơn.
              </p>
            </motion.section>

            <motion.section
              {...fadeMotion(0.18)}
              className="dashboard-glass rounded-[30px] px-5 py-5 lg:flex lg:min-h-0 lg:flex-col lg:px-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="eyebrow">Nhìn lại nhẹ nhàng</span>
                  <h3 className="mt-3 font-serif text-[1.62rem] leading-[1] tracking-[-0.04em] text-matcha-deep">
                    7 ngày gần đây
                  </h3>
                </div>
                <Link
                  href="/history"
                  className="text-[13px] font-semibold text-matcha-deep"
                >
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
                    <div
                      className={`h-4 w-4 rounded-full ${item.tone} shadow-[0_8px_22px_rgba(244,216,120,0.18)]`}
                    />
                    <span className="text-[10px] uppercase tracking-[0.22em] text-muted">
                      {item.day}
                    </span>
                  </motion.div>
                ))}
              </div>

              <p className="mt-4 text-[13px] leading-6 text-muted">
                Tuần này bạn có nhiều ngày ở trạng thái mệt và lo. Việc nhận ra điều đó đã là một bước bắt đầu rồi.
              </p>
            </motion.section>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
