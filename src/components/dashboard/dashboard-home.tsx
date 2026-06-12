"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { HubDesktop } from "@/components/dashboard/hub/hub-desktop";
import { HubMobile } from "@/components/dashboard/hub/hub-mobile";
import { MoodCheckInModal } from "@/components/dashboard/mood-check-in-modal";
import { UpsellBanner } from "@/components/dashboard/upsell-banner";
import type { OrderEntry } from "@/lib/orders";
import { getOrderStatusLabel } from "@/lib/orders";
import type { SubscriptionSnapshot } from "@/lib/subscriptions";

export function DashboardHome({
  planLabel,
  subscription,
  latestOrder,
  userName = "bạn",
}: {
  planLabel: string;
  subscription: SubscriptionSnapshot;
  latestOrder: OrderEntry | null;
  onboardingGoal?: string | null;
  userName?: string;
  userId?: string;
}) {
  const [todayMood, setTodayMood] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [moodIndex, setMoodIndex] = useState(0);
  const [level, setLevel] = useState(3);
  const [pickedMood, setPickedMood] = useState<number | null>(null);
  const isFree = !subscription.isActive;

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
    <div className="flex min-h-0 flex-1 flex-col">
      <MoodCheckInModal onComplete={(score) => setTodayMood(score)} />
      <UpsellBanner show={isFree} />

      <div className="hidden lg:block">
        <HubDesktop
          moodIndex={moodIndex}
          level={level}
          streak={streak}
          todayMood={todayMood}
          onMoodChange={setMoodIndex}
          onLevelChange={setLevel}
        />
      </div>

      <div className="lg:hidden">
        <HubMobile
          userName={userName}
          pickedMood={pickedMood}
          streak={streak}
          todayMood={todayMood}
          onMoodPick={setPickedMood}
        />
      </div>

      {latestOrder?.hasPhysicalBox && subscription.isActive ? (
        <div className="dash-panel mt-4 rounded-[24px] px-4 py-3 text-[13px] text-[var(--muted)] lg:mt-[18px]">
          Hộp quà: {getOrderStatusLabel(latestOrder.status)}
          {latestOrder.status === "paid" && " — đang chuẩn bị giao hàng."}
        </div>
      ) : null}

      {subscription.status === "expired" ? (
        <div className="dash-panel mt-4 rounded-[24px] px-5 py-4 lg:mt-[18px]">
          <p className="text-[13px] text-[var(--green-deep)]">
            Gói LUMIA đã hết hạn. Bạn vẫn có thể xem lại trong Hành trình.
          </p>
          <Link href="/boxes" className="button-primary mt-3 inline-flex text-[13px]">
            Gia hạn gói LUMIA
          </Link>
        </div>
      ) : null}

      {isFree ? (
        <div className="dash-panel mt-4 rounded-[24px] px-5 py-5 lg:hidden">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--green)]">
            {planLabel}
          </span>
          <p className="mt-3 text-[13px] leading-6 text-[var(--muted)]">
            Bạn vẫn có thể check-in, viết ra và trò chuyện cùng LUMIA. Khi muốn đi sâu hơn, đăng ký một gói LUMIA.
          </p>
          <Link href="/boxes" className="button-primary mt-4 inline-flex text-[13px]">
            Xem các gói
          </Link>
        </div>
      ) : null}
    </div>
  );
}
