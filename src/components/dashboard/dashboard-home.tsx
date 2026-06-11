"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { MoodCheckInModal } from "@/components/dashboard/mood-check-in-modal";
import { StartJourneyButton } from "@/components/dashboard/start-journey-button";
import { UpsellBanner } from "@/components/dashboard/upsell-banner";
import type { OrderEntry } from "@/lib/orders";
import { getOrderStatusLabel } from "@/lib/orders";
import type { SubscriptionSnapshot } from "@/lib/subscriptions";

const quickActions = [
  { href: "/journal#release", label: "Viết ra", copy: "Đặt cảm xúc xuống một chút" },
  { href: "/journal#journal", label: "Viết nhật ký", copy: "Ghi lại ngày hôm nay" },
  { href: "/audio/meditation", label: "Nghe thiền", copy: "Guided meditation ngắn" },
  { href: "/audio/sleep", label: "Sleep sounds", copy: "Âm thanh cho giấc ngủ" },
  { href: "/audio/breathing", label: "Bài thở", copy: "Thở cùng LUMIA" },
  { href: "/ai", label: "Nói chuyện", copy: "LUMIA lắng nghe bạn" },
] as const;

const goalSuggestions: Record<string, string> = {
  sleep: "Tối nay thử wind-down 10 phút trước khi ngủ.",
  stress: "Bắt đầu bằng 3 dòng viết ra — không cần giải thích.",
  meditation: "Một bài thiền mini 3 phút có thể đủ cho hôm nay.",
};

export function DashboardHome({
  planLabel,
  subscription,
  latestOrder,
  onboardingGoal,
}: {
  planLabel: string;
  subscription: SubscriptionSnapshot;
  latestOrder: OrderEntry | null;
  onboardingGoal?: string | null;
}) {
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const isFree = !subscription.isActive;
  const canStartJourney =
    latestOrder?.status === "delivered" &&
    subscription.status === "active" &&
    !subscription.startedAt;

  useEffect(() => {
    fetch("/api/streak")
      .then((r) => r.json())
      .then((data: { current_streak?: number }) => setStreak(data.current_streak ?? 0))
      .catch(() => null);

    const today = new Date().toISOString().slice(0, 10);
    fetch("/api/mood/history?days=1")
      .then((r) => r.json())
      .then((data: { date: string; score: number }[]) => {
        const entry = Array.isArray(data) ? data.find((e) => e.date === today) : null;
        if (entry) setTodayMood(entry.score);
      })
      .catch(() => null);
  }, []);

  return (
    <>
      <MoodCheckInModal onComplete={(score) => setTodayMood(score)} />
      <UpsellBanner show={isFree} />

      <div className="space-y-4 lg:space-y-4">
        <div className="lg:hidden">
          <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-muted">Hôm nay</p>
          <h2 className="mt-1 font-serif text-2xl text-matcha-deep">Chào buổi tối 👋</h2>
        </div>
        {latestOrder && !subscription.isActive ? (
          <div className="rounded-[24px] border border-white/70 bg-white/78 px-4 py-3 text-[13px] text-muted">
            Đơn hàng: {getOrderStatusLabel(latestOrder.status)}
            {latestOrder.status === "paid" && " — đang chuẩn bị giao hàng."}
          </div>
        ) : null}

        {subscription.isActive && subscription.currentDay ? (
          <div className="dashboard-glass rounded-[24px] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="eyebrow">Hành trình 21 ngày</span>
                <p className="mt-2 font-serif text-2xl text-matcha-deep">
                  Ngày {subscription.currentDay}/21
                </p>
              </div>
              <div className="text-right">
                <div className="text-[13px] text-muted">Streak</div>
                <div className="font-serif text-3xl text-matcha-deep">{streak}</div>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-matcha-soft/40">
              <div
                className="h-full rounded-full bg-matcha transition-all"
                style={{ width: `${(subscription.currentDay / 21) * 100}%` }}
              />
            </div>
          </div>
        ) : null}

        {canStartJourney ? (
          <div className="dashboard-glass rounded-[24px] px-5 py-4 text-center">
            <p className="text-[13px] text-matcha-deep">Hộp đã giao — sẵn sàng bắt đầu hành trình!</p>
            <StartJourneyButton />
          </div>
        ) : null}

        {subscription.status === "expired" ? (
          <div className="dashboard-glass rounded-[24px] px-5 py-4">
            <p className="text-[13px] text-matcha-deep">Hành trình 21 ngày đã kết thúc. Bạn vẫn có thể xem lại trong Hành trình.</p>
            <Link href="/boxes" className="button-primary mt-3 inline-flex text-[13px]">
              Bắt đầu hành trình mới
            </Link>
          </div>
        ) : null}

        {todayMood ? (
          <div className="rounded-[24px] border border-white/70 bg-white/78 px-4 py-3 text-[13px] text-matcha-deep">
            Cảm xúc hôm nay: {todayMood}/5
          </div>
        ) : null}

        {subscription.isActive && onboardingGoal ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="dashboard-glass rounded-[30px] px-5 py-5"
          >
            <span className="eyebrow">Gợi ý cho hôm nay</span>
            <p className="mt-3 text-[13px] leading-6 text-muted">
              {goalSuggestions[onboardingGoal] ?? "Hãy chọn một hoạt động nhẹ bên dưới."}
            </p>
          </motion.section>
        ) : null}

        <section className="dashboard-glass rounded-[24px] px-4 py-4 lg:rounded-[30px] lg:px-5 lg:py-5">
          <span className="eyebrow">Hoạt động nhanh</span>
          <div className="mobile-h-scroll mt-4 -mx-1 px-1 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-3 lg:overflow-visible lg:px-0">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="card-primary mobile-snap-card p-4 transition active:scale-[0.98] lg:w-auto lg:hover:shadow-[0_14px_32px_rgba(143,168,120,0.1)]"
              >
                <div className="font-medium text-matcha-deep">{action.label}</div>
                <div className="mt-1 text-[12px] leading-5 text-muted">{action.copy}</div>
              </Link>
            ))}
          </div>
        </section>

        {isFree ? (
          <section className="dashboard-glass rounded-[30px] px-5 py-5">
            <span className="eyebrow">{planLabel}</span>
            <p className="mt-3 text-[13px] leading-6 text-muted">
              Bạn vẫn có thể check-in, viết ra và trò chuyện cùng LUMIA. Khi muốn đi sâu hơn, chỉ cần chọn một chiếc hộp.
            </p>
            <Link href="/boxes" className="button-primary mt-4 inline-flex text-[13px]">
              Mua hộp LUMIA
            </Link>
          </section>
        ) : null}
      </div>
    </>
  );
}
