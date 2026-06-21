"use client";

import Link from "next/link";
import { ClipboardList, Play, SmilePlus } from "lucide-react";

import { MoodCheckInPanel } from "@/components/dashboard/mood-check-in-panel";
import { MoodTrendChart } from "@/components/dashboard/mood-trend-chart";
import { HubInsightsRow } from "@/components/dashboard/hub/hub-insights";
import { Panel } from "@/components/dashboard/shell/panel";
import { MistyScene } from "@/components/dashboard/shell/misty-scene";
import { StoreWidget } from "@/components/dashboard/store-widget";
import type { ChartPoint, DashboardInsights } from "@/lib/dashboard-insights";
import type { MoodScore } from "@/lib/mood-constants";

type HubProps = {
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

export function HubDesktop({
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
  const hasCheckedIn = savedScore !== null;

  return (
    <div className="space-y-[18px]">
      <div className="hub-bento-grid gap-[18px]">
        <div className="hub-bento-ritual lumia-grain relative min-h-[240px] overflow-hidden rounded-[24px] shadow-[var(--shadow-ritual)]">
          <MistyScene />
          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-7">
            <span className="dash-scene-chip inline-flex w-fit rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] backdrop-blur-sm">
              Nghi thức tối nay
            </span>

            {hasCheckedIn ? (
              /* Has check-in → show audio recommendation */
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  {suggestion && (
                    <p className="mb-2 max-w-[260px] rounded-full bg-black/25 px-3 py-1 text-[11px] leading-snug text-white/85 backdrop-blur-sm">
                      {suggestion}
                    </p>
                  )}
                  <h2 className="font-serif text-[24px] font-medium leading-tight tracking-[-0.02em] text-white xl:text-[27px]">
                    Thung lũng sương
                  </h2>
                  <p className="mt-1 text-[13px] text-[var(--scene-ink-muted)]">Soundscape · 18 phút</p>
                </div>
                <Link href="/audio/sleep" className="dash-accent-btn shrink-0">
                  <Play className="h-4 w-4" fill="currentColor" />
                  Bắt đầu
                </Link>
              </div>
            ) : (
              /* No check-in → CTA to check in or take test */
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[13px] text-white/70">Gợi ý âm thanh hôm nay</p>
                  <h2 className="mt-1 font-serif text-[20px] font-medium leading-tight tracking-[-0.01em] text-white xl:text-[22px]">
                    Check-in để nhận gợi ý<br />phù hợp với tâm trạng bạn
                  </h2>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                  <Link
                    href="/journey?tab=reports"
                    className="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-[12px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    Làm bài test
                  </Link>
                  <button
                    onClick={() => document.querySelector<HTMLElement>('[data-mood-checkin]')?.focus()}
                    className="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-[12px] font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
                  >
                    <SmilePlus className="h-3.5 w-3.5" />
                    Check-in mood
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <Panel className="hub-bento-mood h-auto" pad="p-6 sm:p-7">
          <MoodTrendChart data={chartDays} average={chartAverage} className="mb-5" />
          <MoodCheckInPanel
            selectedScore={selectedScore}
            savedScore={savedScore}
            savedNote={savedNote}
            onSelectScore={onSelectScore}
            onSubmit={onCheckIn}
            submitting={submitting}
          />
        </Panel>
      </div>

      {insights ? (
        <HubInsightsRow insights={insights} />
      ) : (
        <div className="grid animate-pulse grid-cols-1 gap-[18px] sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[100px] rounded-[24px] bg-[var(--surface)]" />
          ))}
        </div>
      )}

      <StoreWidget />
    </div>
  );
}
