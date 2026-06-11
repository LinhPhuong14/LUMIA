"use client";

import { useEffect, useState } from "react";

import { TabPills } from "@/components/ui/tab-pills";
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

export function JourneyPanel({ isActive }: { isActive: boolean }) {
  const [tab, setTab] = useState<Tab>("history");
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isActive) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch("/api/streak").then((r) => r.json()),
      fetch("/api/mood/history?days=21").then((r) => r.json()),
      fetch("/api/activity-logs?days=21").then((r) => r.json()),
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
  }, [isActive]);

  const avgMood =
    moods.length > 0
      ? (moods.reduce((sum, m) => sum + m.score, 0) / moods.length).toFixed(1)
      : "—";

  const activityCounts = activities.reduce<Record<string, number>>((acc, a) => {
    acc[a.activity_type] = (acc[a.activity_type] ?? 0) + 1;
    return acc;
  }, {});
  const topActivity = Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const days = Array.from({ length: 21 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (20 - i));
    return d.toISOString().slice(0, 10);
  });

  function moodColor(date: string) {
    const entry = moods.find((m) => m.date === date);
    if (!entry) return "bg-white/60";
    if (entry.score <= 2) return "bg-matcha-soft";
    if (entry.score === 3) return "bg-mood-mid";
    return "bg-mood-high";
  }

  const content = (
    <div className="space-y-6">
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
            <div className="soft-card p-5 text-center">
              <div className="text-[12px] text-muted">Streak</div>
              <div className="font-serif text-3xl text-matcha-deep">{streak.current_streak}</div>
            </div>
            <div className="soft-card p-5 text-center">
              <div className="text-[12px] text-muted">Mood TB</div>
              <div className="font-serif text-3xl text-matcha-deep">{avgMood}</div>
            </div>
            <div className="soft-card p-5 text-center">
              <div className="text-[12px] text-muted">Hoạt động nhiều</div>
              <div className="font-serif text-xl text-matcha-deep">{topActivity}</div>
            </div>
          </div>

          <section className="soft-card p-6">
            <span className="eyebrow">Lịch 21 ngày</span>
            <div className="mt-5 grid grid-cols-7 gap-2">
              {days.map((date) => (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDay(date)}
                  className="flex flex-col items-center gap-2 rounded-[16px] border border-white/60 p-2 transition hover:bg-white/80"
                >
                  <div className={`h-4 w-4 rounded-full ${moodColor(date)}`} />
                  <span className="text-[10px] text-muted">{date.slice(8)}</span>
                </button>
              ))}
            </div>
          </section>

          {selectedDay ? (
            <section className="soft-card p-6">
              <h3 className="font-medium text-matcha-deep">{selectedDay}</h3>
              <p className="mt-2 text-sm text-muted">
                Mood: {moods.find((m) => m.date === selectedDay)?.score ?? "Chưa có"}
              </p>
              <p className="mt-2 text-sm text-muted">
                Hoạt động:{" "}
                {activities
                  .filter((a) => a.date === selectedDay)
                  .map((a) => a.activity_type)
                  .join(", ") || "Chưa có"}
              </p>
              <button type="button" onClick={() => setSelectedDay(null)} className="button-secondary mt-4 text-[13px]">
                Đóng
              </button>
            </section>
          ) : null}
        </>
      ) : null}

      {tab === "reports" ? (
        <section className="soft-card p-6">
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
                <article key={report.id} className="rounded-[22px] border border-white/70 bg-white/78 p-4">
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
            <p className="mt-4 text-sm text-muted">Chưa có báo cáo. Nhấn Generate để tạo.</p>
          )}
        </section>
      ) : null}
    </div>
  );

  return (
    <UpsellOverlay
      featureName="Hành trình"
      description="Xem lịch sử 21 ngày, mood và báo cáo AI."
      locked={!isActive}
    >
      {content}
    </UpsellOverlay>
  );
}
