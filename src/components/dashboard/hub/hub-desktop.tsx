"use client";

import Link from "next/link";
import { Play } from "lucide-react";

import { MoodCheckInPanel } from "@/components/dashboard/mood-check-in-panel";
import { MoodTrendChart } from "@/components/dashboard/mood-trend-chart";
import { HubInsightsRow } from "@/components/dashboard/hub/hub-insights";
import { Panel } from "@/components/dashboard/shell/panel";
import { MistyScene } from "@/components/dashboard/shell/misty-scene";
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

  selectedScore,
  savedScore,
  savedNote,
  onSelectScore,
  onCheckIn,
  submitting,
}: HubProps) {
  return (
    <div className="space-y-[18px]">
      <div className="hub-bento-grid gap-[18px]">
        <div className="hub-bento-ritual lumia-grain relative min-h-[240px] overflow-hidden rounded-[24px] shadow-[var(--shadow-ritual)]">
          <MistyScene />
          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-7">
            <span className="dash-scene-chip inline-flex w-fit rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] backdrop-blur-sm">
              Nghi thức tối nay
            </span>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
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

      {insights ? <HubInsightsRow insights={insights} /> : null}
    </div>
  );
}
