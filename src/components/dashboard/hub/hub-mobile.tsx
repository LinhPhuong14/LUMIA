"use client";

import Link from "next/link";
import { Feather, MessageCircle, Music, Play, Wind } from "lucide-react";

import { MoodCheckInPanel } from "@/components/dashboard/mood-check-in-panel";
import { MoodTrendChart } from "@/components/dashboard/mood-trend-chart";
import { HubInsightsRow, HubSuggestionCard } from "@/components/dashboard/hub/hub-insights";
import { MistyScene } from "@/components/dashboard/shell/misty-scene";
import type { ChartPoint, DashboardInsights } from "@/lib/dashboard-insights";
import type { MoodScore } from "@/lib/mood-constants";

const quickActions = [
  { href: "/journal", label: "Nhật ký", icon: Feather },
  { href: "/audio/breathing", label: "Hơi thở", icon: Wind },
  { href: "/audio", label: "Âm thanh", icon: Music },
  { href: "/ai", label: "Lắng nghe", icon: MessageCircle },
] as const;

type HubProps = {
  userName: string;
  insights: DashboardInsights | null;
  chartDays: ChartPoint[];
  chartAverage: number | null;
  suggestion: string;
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
  return (
    <div className="-mx-1 space-y-4 pb-2">
      <div className="relative mx-0 h-[260px] overflow-hidden rounded-[28px] shadow-[var(--shadow-ritual)]">
        <MistyScene />
        <div className="absolute inset-0 flex flex-col justify-between p-5">
          <span className="dash-scene-chip self-start rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md">
            Nghi thức tối
          </span>
          <div>
            <p className="text-[12px] text-[var(--scene-ink-muted)]">Chào {userName}</p>
            <h2 className="font-serif text-[24px] font-normal tracking-[-0.02em] text-white">
              Thung lũng sương
            </h2>
            <Link
              href="/audio/sleep"
              className="dash-accent-btn mt-3 w-full py-3"
              style={{ background: "var(--gradient-emerald)" }}
            >
              <Play className="h-4 w-4" fill="currentColor" />
              Bắt đầu nghi thức
            </Link>
          </div>
        </div>
      </div>

      <div className="dash-panel rounded-[24px] p-[18px]">
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
        <div className="space-y-3">
          <HubInsightsRow insights={insights} />
        </div>
      ) : null}

      <div className="grid grid-cols-4 gap-2.5">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col items-center gap-1.5 rounded-[18px] border border-[var(--border)] bg-[var(--surface-card)] px-1.5 py-3.5"
          >
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[var(--green-wash)]">
              <action.icon className="h-[18px] w-[18px] text-[var(--green-deep)]" />
            </div>
            <span className="text-[11px] font-semibold text-[var(--foreground)]">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="dash-panel rounded-[24px] p-[18px]">
        <h3 className="font-serif text-base text-[var(--foreground)]">Gợi ý cho hôm nay</h3>
        <div className="mt-3">
          <HubSuggestionCard suggestion={suggestion} />
        </div>
      </div>
    </div>
  );
}
