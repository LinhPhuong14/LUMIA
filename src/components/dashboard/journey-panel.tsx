"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, TrendingUp, CalendarDays, Zap, ChevronRight, FileText, RefreshCw } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/ui/empty-state";
import { UpsellOverlay } from "@/components/ui/upsell-overlay";

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

const MOOD_COLORS: Record<number, { bg: string; label: string }> = {
  1: { bg: "#ef444420", label: "Rất tệ" },
  2: { bg: "#f9731620", label: "Tệ" },
  3: { bg: "#eab30820", label: "Ổn" },
  4: { bg: "#4ade8030", label: "Tốt" },
  5: { bg: "#22c55e40", label: "Rất tốt" },
};
const MOOD_DOT: Record<number, string> = {
  1: "#ef4444", 2: "#f97316", 3: "#eab308", 4: "#4ade80", 5: "#22c55e",
};

const ACTIVITY_LABELS: Record<string, string> = {
  journal: "Nhật ký",
  meditation: "Thiền",
  audio: "Âm thanh",
  breathing: "Hơi thở",
  mood: "Check-in",
  chat: "Trò chuyện",
};

function MoodHeatmap({ days, moods }: { days: string[]; moods: MoodEntry[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const moodMap = Object.fromEntries(moods.map((m) => [m.date, m]));

  // Group into weeks, newest day first
  const reversed = [...days].reverse();
  const weeks: string[][] = [];
  let week: string[] = [];
  reversed.forEach((d, i) => {
    week.push(d);
    if (week.length === 7 || i === reversed.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  return (
    <div className="relative">
      <div className="flex flex-col gap-1.5">
        {weeks.map((wk, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1.5">
            {wk.map((date) => {
              const entry = moodMap[date];
              const isToday = date === today;
              const score = entry?.score;
              return (
                <div key={date} className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setHovered(date)}
                    onMouseLeave={() => setHovered(null)}
                    className={`group relative flex h-9 w-full items-center justify-center rounded-xl border transition-all duration-150 hover:scale-105 sm:h-10 ${
                      isToday
                        ? "ring-2 ring-[var(--green)] ring-offset-2 ring-offset-[var(--bg)]"
                        : ""
                    }`}
                    style={{
                      background: score ? MOOD_COLORS[score].bg : "var(--surface)",
                      borderColor: score ? MOOD_DOT[score] + "30" : "var(--border)",
                    }}
                  >
                    {score ? (
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: MOOD_DOT[score] }}
                      />
                    ) : (
                      <span className="text-[10px] text-[var(--muted)]/50">{date.slice(8)}</span>
                    )}
                  </button>

                  <AnimatePresence>
                    {hovered === date && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.12 }}
                        className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-30 w-36 -translate-x-1/2 rounded-[14px] border border-[var(--border)] bg-[var(--surface-card)] p-2.5 shadow-lg"
                      >
                        <p className="text-[11px] font-semibold text-[var(--foreground)]">{date}</p>
                        <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                          {score ? `Mood ${score}/5 · ${MOOD_COLORS[score].label}` : "Chưa check-in"}
                        </p>
                        {entry?.note ? (
                          <p className="mt-1 line-clamp-2 text-[10px] text-[var(--muted)]">"{entry.note}"</p>
                        ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-[10px] text-[var(--muted)]">Mood:</span>
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: MOOD_DOT[s] }} />
            <span className="text-[10px] text-[var(--muted)]">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { date: string; label: string } }> }) {
  if (!active || !payload?.length) return null;
  const { value, payload: p } = payload[0];
  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2 shadow-lg">
      <p className="text-[11px] font-semibold text-[var(--foreground)]">{p.date}</p>
      <p className="mt-0.5 text-[11px] text-[var(--muted)]">
        Mood: <span className="font-bold text-[var(--green-deep)]">{value}/5</span> · {p.label}
      </p>
    </div>
  );
}

function WeekChart({ moods }: { moods: MoodEntry[] }) {
  const last7 = [...moods].slice(-7);
  if (last7.length < 2) return null;
  const avg = last7.reduce((s, m) => s + m.score, 0) / last7.length;

  const data = last7.map((m) => ({
    date: m.date.slice(5).replace("-", "/"),
    score: m.score,
    label: MOOD_COLORS[m.score]?.label ?? "",
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] text-[var(--muted)]">
          Trung bình: <span className="font-semibold text-[var(--foreground)]">{avg.toFixed(1)}/5</span>
        </p>
        <div className="flex gap-3">
          {[1,2,3,4,5].map((s) => (
            <div key={s} className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: MOOD_DOT[s] }} />
              <span className="text-[9px] text-[var(--muted)]">{s}</span>
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5F6F52" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#5F6F52" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 10, fill: "var(--muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--green)", strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#5F6F52"
            strokeWidth={2}
            fill="url(#moodGrad)"
            dot={{ r: 4, fill: "#5F6F52", strokeWidth: 2, stroke: "var(--surface-card)" }}
            activeDot={{ r: 6, fill: "#5F6F52", stroke: "var(--surface-card)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StreakRing({ streak }: { streak: number }) {
  const max = Math.max(streak, 7);
  const pct = Math.min(streak / max, 1);
  const r = 38, cx = 44, cy = 44;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <div className="relative flex h-[88px] w-[88px] items-center justify-center">
      <svg width="88" height="88" className="absolute inset-0 -rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="4" />
        <motion.circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={streak >= 7 ? "#f59e0b" : "var(--green)"}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="relative flex flex-col items-center">
        <span className="text-2xl font-bold text-[var(--foreground)]">{streak}</span>
        <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-[var(--muted)]">ngày</span>
      </div>
    </div>
  );
}

const ACTIVITY_ICONS: Record<string, string> = {
  journal: "📓",
  meditation: "🧘",
  audio: "🎵",
  breathing: "🌬️",
  mood: "✅",
  chat: "💬",
};

function CalendarSection({ days, moods }: { days: string[]; moods: MoodEntry[] }) {
  const [offset, setOffset] = useState(0); // 0 = recent 15, 1 = prev 15, etc.
  const CHUNK = 15;
  const total = days.length;
  const end = total - offset * CHUNK;
  const start = Math.max(0, end - CHUNK);
  const visibleDays = days.slice(start, end);
  const canGoBack = end > CHUNK;
  const canGoForward = offset > 0;

  const firstDay = visibleDays[0];
  const lastDay = visibleDays[visibleDays.length - 1];
  function fmtRange(d: string) {
    return new Date(`${d}T12:00:00`).toLocaleDateString("vi-VN", { day: "numeric", month: "short" });
  }

  return (
    <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[var(--foreground)]">Lịch hành trình</p>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[var(--muted)]">
            {firstDay && lastDay ? `${fmtRange(firstDay)} – ${fmtRange(lastDay)}` : ""}
          </span>
          <button
            type="button"
            disabled={!canGoBack}
            onClick={() => setOffset((v) => v + 1)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--surface)] disabled:opacity-30"
          >
            ‹
          </button>
          <button
            type="button"
            disabled={!canGoForward}
            onClick={() => setOffset((v) => v - 1)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--surface)] disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>
      <MoodHeatmap days={visibleDays} moods={moods} />
    </div>
  );
}

function ActivityHabitTracker({
  activities,
  days,
}: {
  activities: ActivityLog[];
  days: string[];
}) {
  const CHUNK = 21;
  const [offset, setOffset] = useState(0);
  const total = days.length;
  const end = total - offset * CHUNK;
  const start = Math.max(0, end - CHUNK);
  const visibleDays = days.slice(start, end);
  const canGoBack = end > CHUNK;
  const canGoForward = offset > 0;

  // Map activity type → set of dates
  const byType: Record<string, Set<string>> = {};
  for (const a of activities) {
    if (!byType[a.activity_type]) byType[a.activity_type] = new Set();
    byType[a.activity_type].add(a.date);
  }

  const types = Object.keys(ACTIVITY_LABELS).filter(
    (t) => byType[t] && byType[t].size > 0,
  );

  if (types.length === 0) return null;

  return (
    <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[var(--foreground)]">Thói quen của bạn</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!canGoBack}
            onClick={() => setOffset((v) => v + 1)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--surface)] disabled:opacity-30"
          >
            ‹
          </button>
          <button
            type="button"
            disabled={!canGoForward}
            onClick={() => setOffset((v) => v - 1)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-[var(--surface)] disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="mb-2 overflow-x-auto">
        <div className="min-w-0">
          {/* Header row: label placeholder + day numbers */}
          <div className="mb-1 flex items-center">
            <div className="w-[90px] shrink-0" />
            <div className="flex flex-1 items-center justify-between">
              {visibleDays.map((d, i) => (
                <div
                  key={d}
                  className="flex-1 text-center text-[9px] font-medium text-[var(--muted)]"
                >
                  {i === 0 || d.slice(8) === "01" ? d.slice(5, 10) : d.slice(8)}
                </div>
              ))}
            </div>
            <div className="w-[34px] shrink-0" />
          </div>

          {/* Activity rows */}
          <div className="space-y-1.5">
            {types.map((type) => {
              const doneSet = byType[type] ?? new Set();
              const doneCount = visibleDays.filter((d) => doneSet.has(d)).length;
              return (
                <div key={type} className="flex items-center">
                  <div className="flex w-[90px] shrink-0 items-center gap-1.5 pr-2">
                    <span className="text-sm">{ACTIVITY_ICONS[type] ?? "•"}</span>
                    <span className="truncate text-[11px] font-medium text-[var(--muted)]">
                      {ACTIVITY_LABELS[type] ?? type}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-0.5">
                    {visibleDays.map((d) => {
                      const done = doneSet.has(d);
                      return (
                        <div
                          key={d}
                          title={done ? `${ACTIVITY_LABELS[type]} – ${d}` : undefined}
                          className={`flex h-6 flex-1 items-center justify-center rounded-md text-[10px] transition ${
                            done
                              ? "bg-[var(--green)] text-white"
                              : "bg-[var(--surface)] text-[var(--muted)]/30"
                          }`}
                        >
                          {done ? "✓" : "·"}
                        </div>
                      );
                    })}
                  </div>
                  <span className="ml-1.5 w-8 shrink-0 text-right text-[10px] font-semibold text-[var(--green-deep)]">
                    {doneCount}/{visibleDays.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
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
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  void userId;

  useEffect(() => {
    if (!isActive) { setLoading(false); return; }
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

  const days = buildCalendarDays(calendarDays);
  const today = new Date().toISOString().slice(0, 10);
  const checkedDays = moods.length;
  const avgMood = moods.length
    ? (moods.reduce((s, m) => s + m.score, 0) / moods.length).toFixed(1)
    : null;

  const activityCounts = activities.reduce<Record<string, number>>((acc, a) => {
    acc[a.activity_type] = (acc[a.activity_type] ?? 0) + 1;
    return acc;
  }, {});
  const sortedActivities = Object.entries(activityCounts).sort((a, b) => b[1] - a[1]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      await fetch("/api/reports/generate", { method: "POST", body: "{}" });
      const data = await fetch("/api/reports").then((r) => r.json());
      setReports(Array.isArray(data) ? data : []);
    } catch { /* noop */ } finally {
      setGenerating(false);
    }
  }

  const todayChecked = moods.some((m) => m.date === today);

  const content = (
    <div className="space-y-5 pb-6">
      {/* ── Streak Hero ── */}
      <section className="relative overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] p-6">
        <div className="flex items-center justify-between gap-4">
          {/* Streak ring */}
          <div className="flex items-center gap-5">
            <StreakRing streak={streak.current_streak} />
            <div>
              <div className="flex items-center gap-2">
                <Flame
                  className="h-5 w-5"
                  style={{ color: streak.current_streak >= 7 ? "#f59e0b" : "var(--green)" }}
                />
                <span className="font-serif text-xl font-medium text-[var(--foreground)]">
                  {streak.current_streak === 0
                    ? "Bắt đầu hành trình"
                    : streak.current_streak === 1
                    ? "Ngày đầu tiên!"
                    : `${streak.current_streak} ngày liên tiếp`}
                </span>
              </div>
              <p className="mt-1 text-[12px] text-[var(--muted)]">
                Kỷ lục: {streak.longest_streak} ngày ·{" "}
                {todayChecked ? (
                  <span className="text-[var(--green)]">✓ Hôm nay đã check-in</span>
                ) : (
                  <span className="text-amber-500">Chưa check-in hôm nay</span>
                )}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="hidden flex-col items-end gap-1 sm:flex">
            <div className="text-right">
              <p className="text-[11px] text-[var(--muted)]">Tổng check-in</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">{checkedDays}</p>
            </div>
            {avgMood ? (
              <div className="text-right">
                <p className="text-[11px] text-[var(--muted)]">Mood TB</p>
                <p className="text-2xl font-bold" style={{ color: "var(--green)" }}>{avgMood}</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Streak milestone badges */}
        <div className="mt-5 grid grid-cols-4 gap-2">
          {[
            { days: 3, label: "Khởi đầu tích cực" },
            { days: 7, label: "Người giữ nhịp" },
            { days: 14, label: "Người bạn của giấc ngủ" },
            { days: 30, label: "Chuyên gia thói quen" },
          ].map(({ days, label }) => {
            const reached = streak.longest_streak >= days;
            return (
              <div
                key={days}
                title={`${days} ngày - ${label}`}
                className={`flex flex-col items-center gap-1 rounded-[14px] border p-2.5 text-center transition ${
                  reached
                    ? "border-[var(--green)]/40 bg-[var(--green-wash)]"
                    : "border-[var(--border)] opacity-35 grayscale"
                }`}
              >
                <img src={`/badges/badge-${days}.svg`} alt={label} className="h-8 w-8" />
                <span className="text-[9px] font-bold text-[var(--green-deep)]">{days} ngày</span>
                <span className="line-clamp-2 text-[9px] leading-tight text-[var(--muted)]">{label}</span>
              </div>
            );
          })}
        </div>
        {/* Next milestone progress */}
        {(() => {
          const next = [3, 7, 14, 30].find((d) => streak.longest_streak < d);
          if (!next) return null;
          const prev = [0, 3, 7, 14].find((_, i, arr) => arr[i + 1] === next) ?? 0;
          const pct = Math.round(((streak.longest_streak - prev) / (next - prev)) * 100);
          return (
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[10px] text-[var(--muted)]">
                <span>Tiến độ đến huy hiệu tiếp theo</span>
                <span>{streak.longest_streak}/{next} ngày</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                <div
                  className="h-full rounded-full bg-[var(--green)] transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })()}
      </section>

      {/* ── Huy hiệu ── */}
      <section className="rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] p-6">
        <p className="mb-4 text-[13px] font-semibold text-[var(--foreground)]">Huy hiệu</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { days: 3, label: "Khởi đầu tích cực" },
            { days: 7, label: "Người giữ nhịp" },
            { days: 14, label: "Người bạn của giấc ngủ" },
            { days: 30, label: "Chuyên gia thói quen" },
          ].map(({ days, label }) => {
            const earned = streak.longest_streak >= days;
            return (
              <div
                key={days}
                className={`flex flex-col items-center rounded-[16px] border p-4 text-center transition ${
                  earned ? "border-[var(--green)]/50 bg-[var(--green-wash)]" : "border-[var(--border)] opacity-40 grayscale"
                }`}
              >
                <img src={`/badges/badge-${days}.svg`} alt={label} className="h-14 w-14" />
                <span className="mt-2 text-[11px] font-semibold text-[var(--foreground)]">{label}</span>
                <span className="mt-0.5 text-[10px] text-[var(--muted)]">{days} ngày</span>
              </div>
            );
          })}
        </div>

        {/* Progress to next badge */}
        {(() => {
          const milestones = [3, 7, 14, 30];
          const next = milestones.find((m) => streak.longest_streak < m);
          if (!next) return null;
          const prev = milestones[milestones.indexOf(next) - 1] ?? 0;
          const pct = Math.min(((streak.longest_streak - prev) / (next - prev)) * 100, 100);
          return (
            <div className="mt-4">
              <div className="flex justify-between text-[11px]" style={{ color: "var(--muted)" }}>
                <span>Tiến độ đến huy hiệu tiếp theo</span>
                <span>{streak.longest_streak}/{next} ngày</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface)]">
                <motion.div
                  className="h-full rounded-full bg-[var(--green)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })()}
      </section>

      {/* ── Tabs ── */}
      <div className="flex gap-1 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-1">
        {(["history", "reports"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-[12px] py-2 text-[13px] font-semibold transition ${
              tab === t
                ? "bg-[var(--surface-card)] text-[var(--foreground)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {t === "history" ? "Lịch sử" : "Báo cáo"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-[20px] bg-[var(--surface)]" />
          ))}
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {!loading && tab === "history" ? (
          <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Flame, label: "Streak hiện tại", value: `${streak.current_streak}`, sub: "ngày liên tiếp" },
                { icon: TrendingUp, label: "Mood trung bình", value: avgMood ?? "-", sub: "15 ngày gần nhất" },
                { icon: CalendarDays, label: "Tổng check-in", value: `${checkedDays}`, sub: "/ 15 ngày" },
                { icon: Zap, label: "Kỷ lục streak", value: `${streak.longest_streak}`, sub: "ngày liên tiếp" },
              ].map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] p-4">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-[var(--green)]" />
                    <span className="text-[11px] text-[var(--muted)]">{label}</span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-[var(--foreground)]">{value}</p>
                  <p className="text-[10px] text-[var(--muted)]">{sub}</p>
                </div>
              ))}
            </div>

            {/* Mood trend chart */}
            {moods.length >= 2 ? (
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] p-5">
                <p className="mb-4 text-[13px] font-semibold text-[var(--foreground)]">Xu hướng tâm trạng 15 ngày</p>
                <WeekChart moods={moods} />
              </div>
            ) : null}

            {/* Heatmap calendar with month navigation */}
            <CalendarSection days={days} moods={moods} />

            {/* Activity habit tracker */}
            <ActivityHabitTracker activities={activities} days={days} />

            {!moods.length ? (
              <EmptyState
                scene="journey"
                title="Hành trình đang chờ bạn"
                description="Check-in mood mỗi ngày để thấy lịch sử ở đây."
                action={{ label: "Về trang chủ", href: "/dashboard" }}
              />
            ) : null}
          </motion.div>
        ) : null}

        {!loading && tab === "reports" ? (
          <motion.div key="reports" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-[var(--muted)]">Báo cáo AI tóm tắt hành trình của bạn</p>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2 text-[12px] font-semibold text-[var(--foreground)] transition hover:border-[var(--green)] hover:text-[var(--green)] disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${generating ? "animate-spin" : ""}`} />
                {generating ? "Đang tạo…" : "Tạo báo cáo"}
              </button>
            </div>

            {reports.length ? (
              <div className="space-y-3">
                {reports.map((report) => {
                  const insight = (report.content as { insight?: string }).insight;
                  const isOpen = expandedReport === report.id;
                  return (
                    <div
                      key={report.id}
                      className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] transition"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedReport(isOpen ? null : report.id)}
                        className="flex w-full items-center justify-between p-5 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--green-wash)]">
                            <FileText className="h-4 w-4 text-[var(--green-deep)]" />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-[var(--foreground)]">
                              {report.type === "weekly" ? "Báo cáo tuần" : "Báo cáo 21 ngày"}
                            </p>
                            <p className="text-[11px] text-[var(--muted)]">
                              {report.period_start} → {report.period_end}
                            </p>
                          </div>
                        </div>
                        <ChevronRight
                          className={`h-4 w-4 text-[var(--muted)] transition-transform ${isOpen ? "rotate-90" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {isOpen ? (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-[var(--border)] px-5 pb-5 pt-4">
                              {insight ? (
                                <p className="text-[13px] leading-[1.7] text-[var(--foreground)]">{insight}</p>
                              ) : (
                                <pre className="overflow-auto text-[11px] text-[var(--muted)]">
                                  {JSON.stringify(report.content, null, 2)}
                                </pre>
                              )}
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                scene="reports"
                title="Chưa có báo cáo"
                description="Nhấn Tạo báo cáo để LUMIA AI tóm tắt hành trình của bạn."
              />
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
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
