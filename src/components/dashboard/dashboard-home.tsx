"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { HubDesktop } from "@/components/dashboard/hub/hub-desktop";
import { HubMobile } from "@/components/dashboard/hub/hub-mobile";
import { UpsellBanner } from "@/components/dashboard/upsell-banner";
import {
  buildSuggestion,
  type ChartPoint,
  type DashboardInsights,
} from "@/lib/dashboard-insights";
import type { MoodScore } from "@/lib/mood-constants";
import { localDateString } from "@/lib/local-date";
import type { OrderEntry } from "@/lib/orders";
import { getOrderStatusLabel } from "@/lib/orders";
import type { SubscriptionSnapshot } from "@/lib/subscriptions";
import { desktopShellMediaQuery } from "@/lib/breakpoints";
import { useMediaQuery } from "@/lib/use-media-query";

function chartAverage(days: ChartPoint[]): number | null {
  const scores = days.map((d) => d.score).filter((s): s is number => s != null);
  if (!scores.length) return null;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

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
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [selectedScore, setSelectedScore] = useState<MoodScore | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isFree = !subscription.isActive;

  const loadInsights = useCallback(async () => {
    const response = await fetch("/api/dashboard/insights");
    if (!response.ok) return;
    const data = (await response.json()) as DashboardInsights;
    setInsights(data);
  }, []);

  useEffect(() => {
    loadInsights().catch(() => null);
  }, [loadInsights]);

  const savedScore = insights?.today?.score ?? null;
  const savedNote = insights?.today?.note ?? null;

  const chartDays = useMemo(() => insights?.chartDays ?? [], [insights]);
  const chartAvg = useMemo(() => chartAverage(chartDays), [chartDays]);

  const suggestion = useMemo(() => {
    if (!insights) return "Đang tải gợi ý…";
    return buildSuggestion(
      insights.today?.score ?? null,
      insights.week.checkInDays,
      insights.streak.current,
    );
  }, [insights]);

  async function handleCheckIn(score: MoodScore, note?: string) {
    const today = localDateString();
    setSelectedScore(null);

    setInsights((prev) => {
      if (!prev) return prev;
      const hasTodayInChart = prev.chartDays.some((d) => d.date === today);
      const nextChartDays = hasTodayInChart
        ? prev.chartDays.map((d) => (d.date === today ? { ...d, score } : d))
        : [...prev.chartDays, { date: today, label: "Hôm nay", score }];
      const weekScores = nextChartDays
        .map((d) => d.score)
        .filter((s): s is number => s != null);
      const weekAvg =
        weekScores.length > 0
          ? weekScores.reduce((sum, s) => sum + s, 0) / weekScores.length
          : null;

      return {
        ...prev,
        today: { date: today, score, note: note ?? null },
        chartDays: nextChartDays,
        week: {
          ...prev.week,
          average: weekAvg,
          checkInDays: weekScores.length,
        },
        suggestion: buildSuggestion(score, weekScores.length, prev.streak.current),
      };
    });

    setSubmitting(true);
    const response = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, note }),
    });
    setSubmitting(false);

    if (response.ok) {
      await loadInsights();
    }
  }

  function handleSelectScore(score: MoodScore) {
    setSelectedScore(score);
  }

  const hubProps = {
    insights,
    chartDays,
    chartAverage: chartAvg,
    suggestion,
    selectedScore,
    savedScore,
    savedNote,
    onSelectScore: handleSelectScore,
    onCheckIn: handleCheckIn,
    submitting,
  };

  const isDesktop = useMediaQuery(desktopShellMediaQuery);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <UpsellBanner show={isFree} />

      {isDesktop ? (
        <HubDesktop {...hubProps} />
      ) : (
        <HubMobile userName={userName} {...hubProps} />
      )}

      {latestOrder?.hasPhysicalBox && subscription.isActive ? (
        <div className="dash-panel mt-4 rounded-[24px] px-4 py-3 text-[13px] text-[var(--muted)] lg:mt-[18px]">
          Hộp quà: {getOrderStatusLabel(latestOrder.status)}
          {latestOrder.status === "paid" && " - đang chuẩn bị giao hàng."}
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
