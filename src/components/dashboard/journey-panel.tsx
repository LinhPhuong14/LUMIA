"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { GenerativeVisual } from "@/components/ui/generative-visual";
import { EmptyState } from "@/components/ui/empty-state";
import { TabPills } from "@/components/ui/tab-pills";
import { UpsellOverlay } from "@/components/ui/upsell-overlay";
import { staggerContainer, staggerItem } from "@/lib/motion-variants";

type Tab = "history" | "reports";

type MoodEntry = { date: string; score: number; note?: string };
type ActivityLog = { date: string; activity_type: string };
type Report = {
  id: string;
  type: string;
  content: Record<string, unknown>;
  period_start: string;
  period_end: string;
  created_at: string;
};

function buildCalendarDays(totalDays: number): string[] {
  const count = Math.min(Math.max(totalDays, 7), 90);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (count - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

function moodCellBg(score: number | undefined) {
  if (!score) return "rgba(255,255,255,0.5)";
  const map: Record<number, string> = {
    1: "rgba(180,80,80,0.15)",
    2: "rgba(200,150,80,0.15)",
    3: "rgba(180,180,80,0.15)",
    4: "rgba(130,170,100,0.15)",
    5: "rgba(80,150,100,0.15)",
  };
  return map[score] ?? map[3];
}

function MoodSparkline({ scores }: { scores: number[] }) {
  if (!scores.length) return null;
  const w = 80;
  const h = 24;
  const max = 5;
  const points = scores
    .map((s, i) => `${(i / (scores.length - 1 || 1)) * w},${h - (s / max) * h}`)
    .join(" ");
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const color = avg >= 4 ? "#8d9d76" : avg >= 3 ? "#b8cba8" : "#c9a82e";

  return (
    <svg width={w} height={h} className="mx-auto mt-2" aria-hidden>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ActivityBars({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(counts).slice(0, 5);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  const colors = ["#8d9d76", "#7d9a8a", "#9a8d76", "#6a7d9a", "#b8cba8"];

  return (
    <div className="mt-2 flex items-end justify-center gap-1" style={{ height: 28 }}>
      {entries.map(([, count], i) => (
        <div
          key={i}
          className="w-2 rounded-t-sm"
          style={{
            height: `${(count / max) * 100}%`,
            minHeight: 4,
            background: colors[i % colors.length],
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}

function StreakFlame({ streak }: { streak: number }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" className={`mx-auto mt-1 ${streak >= 7 ? "animate-breathe-glow" : ""}`} aria-hidden>
      <path
        d="M14 4C12 10 8 14 8 18c0 3 2.5 6 6 6s6-3 6-6c0-4-4-8-6-14z"
        fill={streak >= 7 ? "#f0c94e" : "#8d9d76"}
        opacity="0.8"
      />
    </svg>
  );
}

export function JourneyPanel({
  isActive,
  calendarDays = 30,
  userId = "journey",
}: {
  isActive: boolean;
  calendarDays?: number;
  userId?: string;
}) {
  const [tab, setTab] = useState<Tab>("history");
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [hoverDay, setHoverDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch("/api/streak").then((r) => r.json()),
      fetch(`/api/mood/history?days=${calendarDays}`).then((r) => r.json()),
      fetch(`/api/activity-logs?days=${calendarDays}`).then((r) => r.json()),
      fetch("/api/reports").then((r) => r.json()),
    ])
      .then(([streakData, moodData, activityData, reportData]) => {
        setStreak(streakData);
        setMoods(Array.isArray(moodData) ? moodData : []);
        setActivities(Array.isArray(activityData) ? activityData : []);
        setReports(Array.isArray(reportData) ? reportData : []);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [isActive, calendarDays]);

  const avgMood =
    moods.length > 0
      ? (moods.reduce((sum, m) => sum + m.score, 0) / moods.length).toFixed(1)
      : "-";

  const activityCounts = activities.reduce<Record<string, number>>((acc, a) => {
    acc[a.activity_type] = (acc[a.activity_type] ?? 0) + 1;
    return acc;
  }, {});
  const topActivity = Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

  const days = buildCalendarDays(calendarDays);
  const today = new Date().toISOString().slice(0, 10);
  const recentMoodScores = moods.slice(-7).map((m) => m.score);
  const moodDataForGarden = days.map((d) => moods.find((m) => m.date === d)?.score);

  const content = (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="journey-content space-y-6">
      <GenerativeVisual
        seed={userId}
        variant="constellation"
        moodData={moodDataForGarden.filter((s): s is number => s !== undefined)}
        className="mb-2"
      />

      <TabPills
        tabs={[
          { id: "history", label: "Lịch sử" },
          { id: "reports", label: "Báo cáo" },
        ]}
        activeTab={tab}
        onChange={(id) => setTab(id as Tab)}
      />

      {loading ? <p className="text-sm text-muted">Đang tải...</p> : null}

      {tab === "history" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <motion.div variants={staggerItem} className="glass-card p-5 text-center">
              <div className="text-[12px] text-muted">Streak</div>
              <div className="font-sans text-3xl font-semibold text-matcha-text">{streak.current_streak}</div>
              <StreakFlame streak={streak.current_streak} />
            </motion.div>
            <motion.div variants={staggerItem} className="glass-card p-5 text-center">
              <div className="text-[12px] text-muted">Mood TB</div>
              <div className="font-sans text-3xl font-semibold text-matcha-text">{avgMood}</div>
              <MoodSparkline scores={recentMoodScores} />
            </motion.div>
            <motion.div variants={staggerItem} className="glass-card p-5 text-center">
              <div className="text-[12px] text-muted">Hoạt động nhiều</div>
              <div className="font-sans text-base font-medium text-matcha-text">{topActivity}</div>
              <ActivityBars counts={activityCounts} />
            </motion.div>
          </div>

          <section className="glass-card relative overflow-hidden p-6">
            <span className="eyebrow">Lịch hành trình</span>
            <GenerativeVisual seed={userId} variant="garden" moodData={moodDataForGarden.filter((s): s is number => s !== undefined)} />
            <div ref={calendarRef} className="relative mt-5 grid grid-cols-7 gap-2">
              {days.map((date) => {
                const moodEntry = moods.find((m) => m.date === date);
                const dayActivities = activities.filter((a) => a.date === date);
                const isToday = date === today;

                return (
                  <div key={date} className="relative">
                    <button
                      type="button"
                      onMouseEnter={() => setHoverDay(date)}
                      onMouseLeave={() => setHoverDay(null)}
                      className={`flex h-9 w-full flex-col items-center justify-center rounded-[14px] border transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] sm:h-11 ${
                        isToday ? "ring-2 ring-matcha-deep ring-offset-1" : "border-white/50"
                      }`}
                      style={{ background: moodCellBg(moodEntry?.score) }}
                    >
                      {dayActivities.length > 0 ? (
                        <span className="absolute right-1 top-1 h-0.5 w-0.5 rounded-full bg-matcha-deep" />
                      ) : null}
                      <span className="text-[10px] text-muted sm:text-[11px]">{date.slice(8)}</span>
                    </button>
                    {hoverDay === date ? (
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass-card-elevated absolute bottom-full left-1/2 z-20 mb-2 w-40 -translate-x-1/2 rounded-[16px] p-3 text-left text-[11px] shadow-lg"
                      >
                        <div className="font-medium text-matcha-deep">{date}</div>
                        <div className="mt-1 text-muted">
                          Mood: {moodEntry?.score ?? "-"}/5
                        </div>
                        <div className="text-muted">{dayActivities.length} hoạt động</div>
                        {moodEntry?.note ? (
                          <div className="mt-1 truncate text-muted">{moodEntry.note.slice(0, 20)}...</div>
                        ) : null}
                      </motion.div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>

          {!moods.length && !loading ? (
            <EmptyState
              scene="journey"
              title="Hành trình đang chờ bạn"
              description="Check-in mood và hoạt động mỗi ngày để thấy lịch sử ở đây."
              action={{ label: "Về trang chủ", href: "/dashboard" }}
            />
          ) : null}
        </>
      ) : null}

      {tab === "reports" ? (
        <section className="glass-card p-6">
          <div className="flex items-center justify-between gap-4">
            <span className="eyebrow">Báo cáo</span>
            <button
              type="button"
              onClick={() =>
                fetch("/api/reports/generate", { method: "POST", body: "{}" })
                  .then(() => fetch("/api/reports").then((r) => r.json()))
                  .then((data) => setReports(Array.isArray(data) ? data : []))
              }
              className="button-secondary text-[13px]"
            >
              Generate ngay
            </button>
          </div>
          {reports.length ? (
            <div className="mt-5 space-y-3">
              {reports.map((report) => (
                <article key={report.id} className="glass-card rounded-[22px] p-4">
                  <button
                    type="button"
                    onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                    className="w-full text-left"
                  >
                    <div className="font-medium text-matcha-deep">
                      {report.type === "weekly" ? "Báo cáo tuần" : "Báo cáo 21 ngày"}
                    </div>
                    <div className="text-[12px] text-muted">
                      {report.period_start} → {report.period_end}
                    </div>
                  </button>
                  {expandedReport === report.id ? (
                    <pre className="mt-3 overflow-auto rounded-[16px] bg-white/90 p-4 text-[12px] text-muted">
                      {JSON.stringify(report.content, null, 2)}
                    </pre>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              scene="reports"
              title="Chưa có báo cáo"
              description="Nhấn Generate để tạo báo cáo từ dữ liệu hành trình của bạn."
            />
          )}
        </section>
      ) : null}
    </motion.div>
  );

  return (
    <UpsellOverlay
      featureName="Hành trình"
      description="Xem lịch sử hành trình, mood và báo cáo AI."
      locked={!isActive}
    >
      {content}
    </UpsellOverlay>
  );
}
