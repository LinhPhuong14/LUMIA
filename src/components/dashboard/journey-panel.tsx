"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, TrendingUp, CalendarDays, Zap, ChevronRight, FileText, RefreshCw } from "lucide-react";

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

  // Group into weeks
  const weeks: string[][] = [];
  let week: string[] = [];
  days.forEach((d, i) => {
    week.push(d);
    if (week.length === 7 || i === days.length - 1) {
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

function WeekChart({ moods }: { moods: MoodEntry[] }) {
  const last7 = [...moods].slice(-7);
  if (last7.length < 2) return null;

  const W = 100, H = 40, max = 5;
  const pts = last7.map((m, i) => ({
    x: (i / (last7.length - 1)) * W,
    y: H - (m.score / max) * H,
    score: m.score,
    date: m.date,
  }));

  const polyline = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pts[0].x},${H} ${polyline} ${pts[pts.length - 1].x},${H}`;
  const avg = last7.reduce((s, m) => s + m.score, 0) / last7.length;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 56 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="mood-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--green)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#mood-grad)" />
        <polyline points={polyline} fill="none" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill="var(--green)" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between">
        {last7.map((m) => (
          <span key={m.date} className="text-[9px] text-[var(--muted)]">{m.date.slice(8)}</span>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-[var(--muted)]">
        Trung bình 7 ngày: <span className="font-semibold text-[var(--foreground)]">{avg.toFixed(1)}/5</span>
      </p>
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
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {[3, 7, 14, 21, 30, 60, 90].map((milestone) => {
            const reached = streak.longest_streak >= milestone;
            return (
              <div
                key={milestone}
                className={`flex shrink-0 flex-col items-center rounded-[12px] border px-3 py-2 text-center transition ${
                  reached
                    ? "border-[var(--green)]/40 bg-[var(--green-wash)]"
                    : "border-[var(--border)] opacity-40"
                }`}
              >
                <span className="text-base">{milestone >= 30 ? "🏆" : milestone >= 14 ? "⭐" : "🔥"}</span>
                <span className="mt-0.5 text-[10px] font-semibold text-[var(--foreground)]">{milestone}d</span>
              </div>
            );
          })}
        </div>
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
                { icon: TrendingUp, label: "Mood trung bình", value: avgMood ?? "-", sub: `trong ${calendarDays} ngày` },
                { icon: CalendarDays, label: "Tổng check-in", value: `${checkedDays}`, sub: `/ ${calendarDays} ngày` },
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
                <p className="mb-3 text-[13px] font-semibold text-[var(--foreground)]">Xu hướng mood 7 ngày</p>
                <WeekChart moods={moods} />
              </div>
            ) : null}

            {/* Heatmap calendar */}
            <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[13px] font-semibold text-[var(--foreground)]">Lịch hành trình</p>
                <span className="text-[11px] text-[var(--muted)]">{calendarDays} ngày gần nhất</span>
              </div>
              <MoodHeatmap days={days} moods={moods} />
            </div>

            {/* Activity breakdown */}
            {sortedActivities.length > 0 ? (
              <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] p-5">
                <p className="mb-3 text-[13px] font-semibold text-[var(--foreground)]">Hoạt động của bạn</p>
                <div className="space-y-2">
                  {sortedActivities.slice(0, 5).map(([type, count]) => {
                    const pct = Math.round((count / activities.length) * 100);
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <span className="w-20 shrink-0 text-[12px] text-[var(--muted)]">
                          {ACTIVITY_LABELS[type] ?? type}
                        </span>
                        <div className="flex-1 overflow-hidden rounded-full bg-[var(--surface)]" style={{ height: 6 }}>
                          <motion.div
                            className="h-full rounded-full bg-[var(--green)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        </div>
                        <span className="w-8 text-right text-[11px] font-semibold text-[var(--foreground)]">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

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
