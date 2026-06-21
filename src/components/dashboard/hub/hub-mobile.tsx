"use client";

import Link from "next/link";
import { ClipboardList, Feather, MessageCircle, Music, SmilePlus, Wind } from "lucide-react";

import { MoodCheckInPanel } from "@/components/dashboard/mood-check-in-panel";
import { MoodTrendChart } from "@/components/dashboard/mood-trend-chart";
import { HubInsightsStatRow } from "@/components/dashboard/hub/hub-insights";
import { MistyScene } from "@/components/dashboard/shell/misty-scene";
import { StoreWidget } from "@/components/dashboard/store-widget";
import type { ChartPoint, DashboardInsights } from "@/lib/dashboard-insights";
import type { MoodScore } from "@/lib/mood-constants";
import { getDashboardGreeting } from "@/lib/time-greeting";

const quickActions = [
  {
    href: "/journal",
    label: "Nhật ký",
    sub: "Viết suy nghĩ của bạn",
    icon: Feather,
    discClass: "bg-emerald-100 dark:bg-emerald-900/40",
    iconClass: "text-emerald-700 dark:text-emerald-300",
  },
  {
    href: "/ai",
    label: "Lắng nghe",
    sub: "LUMIA ở đây với bạn",
    icon: MessageCircle,
    discClass: "bg-blue-100 dark:bg-blue-900/40",
    iconClass: "text-blue-700 dark:text-blue-300",
  },
  {
    href: "/audio/breathing",
    label: "Hơi thở",
    sub: "Kỹ thuật thở 4-7-8",
    icon: Wind,
    discClass: "bg-pink-100 dark:bg-pink-900/40",
    iconClass: "text-pink-700 dark:text-pink-300",
  },
  {
    href: "/audio",
    label: "Âm thanh",
    sub: "Nhạc thư giãn & ngủ",
    icon: Music,
    discClass: "bg-amber-100 dark:bg-amber-900/40",
    iconClass: "text-amber-700 dark:text-amber-300",
  },
] as const;

function firstName(name: string) {
  return name.split(" ").filter(Boolean)[0] ?? name;
}

type HubProps = {
  userName: string;
  insights: DashboardInsights | null;
  chartDays: ChartPoint[];
  chartAverage: number | null;
  suggestion?: string;
  selectedScore: MoodScore | null;
  savedScore: number | null;
  savedNote?: string | null;
  onSelectScore: (score: MoodScore) => void;
  onCheckIn: (score: MoodScore, note?: string) => Promise<void>;
  submitting: boolean;
};

export function HubMobile({
  userName,
  insights,
  chartDays,
  chartAverage,
  suggestion,
  selectedScore,
  savedScore,
  savedNote,
  onSelectScore,
  onCheckIn,
  submitting,
}: HubProps) {
  const greeting = getDashboardGreeting(userName);
  const streak = insights?.streak.current ?? 0;

  return (
    <div className="space-y-4 pb-2">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-[var(--muted)]">{greeting}</p>
          <h1 className="mt-0.5 font-serif text-[26px] font-normal leading-[1.15] tracking-[-0.02em] text-[var(--foreground)]">
            Hãy để hôm nay{" "}
            <span className="italic text-[var(--matcha-deep)]">lắng lại</span>.
          </h1>
        </div>
        {streak > 0 && (
          <div className="mt-1 flex shrink-0 flex-col items-center rounded-[14px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2 shadow-sm">
            <span className="text-[18px] leading-none">🔥</span>
            <span className="mt-1 text-[11px] font-bold text-[var(--foreground)]">{streak}</span>
            <span className="text-[9px] text-[var(--muted)]">ngày</span>
          </div>
        )}
      </div>

      {/* Hero */}
      <div className="mobile-hero-misty relative overflow-hidden" style={{ height: 340 }}>
        <MistyScene />
        <div className="absolute inset-0 flex flex-col justify-between p-[22px]">
          <span className="dash-scene-chip self-start rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md">
            Nghi thức tối
          </span>
          {savedScore !== null ? (
            /* Has check-in → show audio recommendation */
            <div>
              {suggestion && (
                <p className="mb-2 w-fit rounded-full bg-black/25 px-2.5 py-1 text-[10px] leading-snug text-white/85 backdrop-blur-sm">
                  {suggestion}
                </p>
              )}
              <h2 className="font-serif text-[26px] font-normal tracking-[-0.02em] text-white">
                Thung lũng sương
              </h2>
              <p className="mt-1 text-[13px] text-white/80">Soundscape · 18 phút</p>
              <Link
                href="/audio/sleep"
                className="dash-accent-btn mt-4 w-full py-3.5"
                style={{ background: "var(--gradient-primary)" }}
              >
                ▶ Bắt đầu nghi thức
              </Link>
            </div>
          ) : (
            /* No check-in → CTA */
            <div>
              <p className="text-[12px] text-white/70">Gợi ý âm thanh hôm nay</p>
              <h2 className="mt-1 font-serif text-[20px] font-normal tracking-[-0.01em] text-white">
                Check-in để nhận gợi ý<br />phù hợp tâm trạng
              </h2>
              <div className="mt-4 flex gap-2">
                <Link
                  href="/journey?tab=reports"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/20 py-2.5 text-[12px] font-semibold text-white backdrop-blur-sm"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  Làm bài test
                </Link>
                <Link
                  href="#mood-checkin"
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/20 py-2.5 text-[12px] font-semibold text-white backdrop-blur-sm"
                >
                  <SmilePlus className="h-3.5 w-3.5" />
                  Check-in mood
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions 2×2 */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          Khám phá
        </p>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group flex flex-col gap-3 rounded-[22px] border border-[var(--border)] bg-[var(--surface-card)] p-4 transition active:scale-[0.97]"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${action.discClass}`}>
                  <Icon className={`h-5 w-5 ${action.iconClass}`} />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[var(--foreground)]">{action.label}</p>
                  <p className="mt-0.5 text-[11px] leading-snug text-[var(--muted)]">{action.sub}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mood check-in */}
      <div className="mobile-app-card">
        <MoodTrendChart data={chartDays} average={chartAverage} className="mb-4" />
        <MoodCheckInPanel
          selectedScore={selectedScore}
          savedScore={savedScore}
          savedNote={savedNote}
          onSelectScore={onSelectScore}
          onSubmit={onCheckIn}
          submitting={submitting}
          compact
        />
      </div>

      {insights ? (
        <HubInsightsStatRow insights={insights} />
      ) : (
        <div className="animate-pulse">
          <div className="mb-3 h-3 w-24 rounded-full bg-[var(--surface)]" />
          <div className="grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[88px] rounded-[20px] bg-[var(--surface)]" />
            ))}
          </div>
        </div>
      )}

      <StoreWidget />
    </div>
  );
}
