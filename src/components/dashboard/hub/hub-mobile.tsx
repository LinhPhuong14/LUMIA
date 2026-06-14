"use client";

import Link from "next/link";
import { Feather, MessageCircle, Music, Play, Wind } from "lucide-react";

import { MoodCheckInPanel } from "@/components/dashboard/mood-check-in-panel";
import { MoodTrendChart } from "@/components/dashboard/mood-trend-chart";
import { HubInsightsStatRow, HubSuggestionCard } from "@/components/dashboard/hub/hub-insights";
import { MistyScene } from "@/components/dashboard/shell/misty-scene";
import type { ChartPoint, DashboardInsights } from "@/lib/dashboard-insights";
import type { MoodScore } from "@/lib/mood-constants";
import { getTimeGreeting } from "@/lib/time-greeting";

const quickActions = [
  { href: "/journal", label: "Nhật ký", icon: Feather },
  { href: "/audio/breathing", label: "Hơi thở", icon: Wind },
  { href: "/audio", label: "Âm thanh", icon: Music },
  { href: "/ai", label: "Lắng nghe", icon: MessageCircle },
] as const;

function firstName(name: string) {
  return name.split(" ").filter(Boolean)[0] ?? name;
}

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
  const greeting = `${getTimeGreeting()}, ${firstName(userName)}`;

  return (
    <div className="space-y-4 pb-2">
      <div className="px-0 pb-1">
        <p className="text-[13px] text-[var(--muted)]">{greeting}</p>
        <h1 className="mt-0.5 font-serif text-[27px] font-normal leading-[1.15] tracking-[-0.02em] text-[var(--foreground)]">
          Hãy để hôm nay{" "}
          <span className="italic text-[var(--matcha-deep)]">lắng lại</span>.
        </h1>
      </div>

      <div className="mobile-hero-misty relative h-[300px] overflow-hidden">
        <MistyScene />
        <div className="absolute inset-0 flex flex-col justify-between p-[22px]">
          <span className="dash-scene-chip self-start rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md">
            Nghi thức tối
          </span>
          <div>
            <h2 className="font-serif text-[26px] font-normal tracking-[-0.02em] text-white">
              Thung lũng sương
            </h2>
            <p className="mt-1 text-[13px] text-white/80">Soundscape · 18 phút</p>
            <Link
              href="/audio/sleep"
              className="dash-accent-btn mt-4 w-full py-3.5"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Play className="h-4 w-4" fill="currentColor" />
              Bắt đầu nghi thức
            </Link>
          </div>
        </div>
      </div>

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

      {insights ? <HubInsightsStatRow insights={insights} /> : null}

      <div className="grid grid-cols-4 gap-2.5">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="mobile-quick-action"
          >
            <div className="mobile-quick-action-disc">
              <action.icon className="h-[18px] w-[18px] text-[var(--matcha-deep)]" />
            </div>
            <span className="text-[9.5px] font-semibold leading-tight text-[var(--foreground)] sm:text-[11px]">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="mobile-app-card">
        <h3 className="font-serif text-[17px] text-[var(--foreground)]">Gợi ý cho hôm nay</h3>
        <div className="mt-3">
          <HubSuggestionCard suggestion={suggestion} />
        </div>
      </div>
    </div>
  );
}
