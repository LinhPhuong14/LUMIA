"use client";

import Link from "next/link";
import { CalendarCheck, Flame, TrendingUp } from "lucide-react";

import { StatDisc } from "@/components/dashboard/shell/stat-disc";
import type { DashboardInsights } from "@/lib/dashboard-insights";

function formatTrend(trend: number | null): string {
  if (trend == null) return "Chưa đủ dữ liệu";
  if (trend > 0) return `+${trend}% so với tuần trước`;
  if (trend < 0) return `${trend}% so với tuần trước`;
  return "Ổn định so với tuần trước";
}

function buildInsightCards(insights: DashboardInsights) {
  return [
    {
      title: "Streak",
      value: insights.streak.current > 0 ? String(insights.streak.current) : "0",
      unit: insights.streak.current > 0 ? "ngày" : undefined,
      sub:
        insights.streak.longest > 0
          ? `Kỷ lục ${insights.streak.longest} ngày`
          : "Check-in để giữ nhịp",
      accent: "var(--honey-dark)",
    },
    {
      title: "Cảm xúc",
      value:
        insights.week.average != null
          ? insights.week.average.toFixed(1)
          : String(insights.week.checkInDays),
      unit: insights.week.average != null ? "/5" : "/7 ngày",
      sub: formatTrend(insights.week.trendPercent),
      accent: "var(--green-deep)",
    },
    {
      title: "Điểm danh",
      value: String(insights.week.checkInDays),
      unit: "/7",
      sub: insights.week.checkInDays >= 5
        ? "Tuần xuất sắc! 🎉"
        : insights.week.checkInDays > 0
          ? `Còn ${7 - insights.week.checkInDays} ngày nữa`
          : "Bắt đầu check-in",
      accent: "var(--rose-deep)",
    },
  ] as const;
}

export function HubInsightsStatRow({ insights }: { insights: DashboardInsights }) {
  const cards = buildInsightCards(insights);
  const icons = [Flame, TrendingUp, CalendarCheck];

  return (
    <div>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
        Nhịp của bạn
      </p>
      <div className="grid grid-cols-3 gap-2.5">
        {cards.map((card, i) => {
          const Icon = icons[i]!;
          return (
            <div
              key={card.title}
              className="flex flex-col gap-2 rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] p-3.5"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-[10px]"
                style={{ background: `color-mix(in srgb, ${card.accent} 15%, transparent)` }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: card.accent }} />
              </div>
              <div>
                <p className="font-serif text-[20px] font-semibold leading-tight text-[var(--foreground)]">
                  {card.value}
                  {card.unit && <span className="ml-0.5 text-[12px] font-normal text-[var(--muted)]">{card.unit}</span>}
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-[var(--muted)]">{card.title}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function HubInsightsRow({ insights }: { insights: DashboardInsights }) {
  const cards = [
    {
      icon: Flame,
      title: "Streak",
      value: insights.streak.current > 0 ? `${insights.streak.current} ngày` : "Bắt đầu",
      sub:
        insights.streak.longest > 0
          ? `Kỷ lục ${insights.streak.longest} ngày`
          : "Check-in để giữ nhịp",
      accent: "var(--honey-dark)",
    },
    {
      icon: TrendingUp,
      title: "Cảm xúc tuần",
      value:
        insights.week.average != null
          ? `${insights.week.average.toFixed(1)}/5`
          : `${insights.week.checkInDays}/7`,
      sub: formatTrend(insights.week.trendPercent),
      accent: "var(--green-deep)",
    },
    {
      icon: CalendarCheck,
      title: "Điểm danh",
      value: `${insights.week.checkInDays}/7`,
      sub: insights.week.checkInDays >= 5
        ? "Tuần xuất sắc! 🎉"
        : insights.week.checkInDays > 0
          ? `Còn ${7 - insights.week.checkInDays} ngày nữa`
          : "Bắt đầu check-in",
      accent: "var(--rose-deep)",
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="dash-panel flex flex-col justify-between !p-4 sm:!p-5"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--green-wash)]">
              <card.icon className="h-4 w-4" style={{ color: card.accent }} />
            </div>
            <span className="text-[11px] font-semibold text-[var(--muted)] sm:text-[12.5px]">
              {card.title}
            </span>
          </div>
          <div className="mt-2.5 font-serif text-xl font-semibold text-[var(--foreground)] sm:mt-3.5 sm:text-2xl">
            {card.value}
          </div>
          <div className="mt-1 text-[11px] text-[var(--muted)] sm:text-[12.5px]">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}

export function HubSuggestionCard({
  suggestion,
}: {
  suggestion: string;
}) {
  return (
    <div
      className="lumia-grain relative rounded-[18px] p-4 sm:p-[18px]"
      style={{ background: "var(--gradient-honeyjade)" }}
    >
      <p className="text-sm leading-relaxed text-[var(--ink-on-light)]">{suggestion}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/audio/sleep" className="dash-accent-btn text-[13px]">
          Routine tối nay
        </Link>
        <Link
          href="/ai"
          className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2.5 text-[13px] font-semibold text-[var(--green-deep)]"
        >
          LUMIA lắng nghe
        </Link>
      </div>
    </div>
  );
}
