import { getMoodShortLabel } from "@/lib/mood-constants";
import { buildLocalLastNDays, localDateString } from "@/lib/local-date";

export type MoodEntry = { date: string; score: number; note?: string | null };

export type ChartPoint = {
  date: string;
  label: string;
  score: number | null;
};

export type DashboardInsights = {
  moodHistory: MoodEntry[];
  chartDays: ChartPoint[];
  today: MoodEntry | null;
  streak: { current: number; longest: number };
  week: {
    checkInDays: number;
    average: number | null;
    trendPercent: number | null;
    topMoodLabel: string | null;
  };
  activity: {
    totalThisWeek: number;
    topType: string | null;
    topTypeLabel: string | null;
  };
  suggestion: string;
};

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] as const;

const ACTIVITY_LABELS: Record<string, string> = {
  mood: "Check-in",
  journal: "Nhật ký",
  audio: "Âm thanh",
  chat: "Lắng nghe",
  breathing: "Hơi thở",
  timer: "Timer",
};

export function formatChartDayLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return DAY_LABELS[d.getDay()] ?? dateStr.slice(5);
}

export function buildLastNDays(n: number, end = new Date()): string[] {
  return buildLocalLastNDays(n, end);
}

export function buildChartDays(
  moods: MoodEntry[],
  days = 7,
  previewScore?: number | null,
): ChartPoint[] {
  const dayKeys = buildLastNDays(days);
  const moodMap = new Map(moods.map((m) => [m.date, m.score]));
  const today = dayKeys[dayKeys.length - 1];

  return dayKeys.map((date) => {
    let score = moodMap.get(date) ?? null;
    if (date === today && previewScore != null) {
      score = previewScore;
    }
    return { date, label: formatChartDayLabel(date), score };
  });
}

function averageScores(entries: MoodEntry[]): number | null {
  if (!entries.length) return null;
  return entries.reduce((sum, e) => sum + e.score, 0) / entries.length;
}

function filterMoodsInRange(moods: MoodEntry[], start: string, end: string): MoodEntry[] {
  return moods.filter((m) => m.date >= start && m.date <= end);
}

export function applyPreview(chartDays: ChartPoint[], preview: number | null): ChartPoint[] {
  if (preview == null || !chartDays.length) return chartDays;
  const today = localDateString();
  return chartDays.map((d) => (d.date === today ? { ...d, score: preview } : d));
}

export function buildSuggestion(
  todayScore: number | null,
  weekCheckIns: number,
  streak: number,
): string {
  if (todayScore === null) {
    return "Ghi nhận cảm xúc hôm nay giúp LUMIA đọc nhịp của bạn chính xác hơn - chỉ mất vài giây.";
  }
  if (todayScore <= 2) {
    return "Hôm nay có vẻ nặng. Thử 3 phút thở sâu, viết một dòng journal, hoặc mở LUMIA lắng nghe khi bạn sẵn sàng.";
  }
  if (todayScore === 3) {
    return "Một ngày ổn. Routine nhẹ buổi tối - soundscape 10 phút và check-in trước khi ngủ - có thể giúp bạn giữ nhịp ổn định.";
  }
  if (weekCheckIns < 4) {
    return `Bạn đã check-in ${weekCheckIns}/7 ngày tuần này. Giữ streak ${streak > 0 ? `${streak} ngày` : "mới"} bằng một ghi nhận ngắn mỗi tối.`;
  }
  return "Nhịp của bạn đang ổn định tuần này. Tiếp tục ritual tối nay để duy trì giấc ngủ đều hơn.";
}

export function computeDashboardInsights(input: {
  moods: MoodEntry[];
  activities: { date: string; activity_type: string }[];
  streak: { current_streak: number; longest_streak: number };
  previewScore?: number | null;
}): DashboardInsights {
  const today = buildLastNDays(1)[0];
  const weekDays = buildLastNDays(7);
  const prevWeekDays = buildLastNDays(7, new Date(Date.now() - 7 * 86400000));

  const moodMap = new Map(input.moods.map((m) => [m.date, m]));
  const todayEntry = moodMap.get(today) ?? null;

  const weekMoods = weekDays.map((d) => moodMap.get(d)).filter(Boolean) as MoodEntry[];
  const prevWeekMoods = prevWeekDays
    .map((d) => moodMap.get(d))
    .filter(Boolean) as MoodEntry[];

  const weekAvg = averageScores(weekMoods);
  const prevWeekAvg = averageScores(prevWeekMoods);
  let trendPercent: number | null = null;
  if (weekAvg != null && prevWeekAvg != null && prevWeekAvg > 0) {
    trendPercent = Math.round(((weekAvg - prevWeekAvg) / prevWeekAvg) * 100);
  }

  const scoreCounts = weekMoods.reduce<Record<number, number>>((acc, m) => {
    acc[m.score] = (acc[m.score] ?? 0) + 1;
    return acc;
  }, {});
  const topScore = Object.entries(scoreCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const weekStart = weekDays[0];
  const weekActivities = input.activities.filter((a) => a.date >= weekStart);
  const activityCounts = weekActivities.reduce<Record<string, number>>((acc, a) => {
    acc[a.activity_type] = (acc[a.activity_type] ?? 0) + 1;
    return acc;
  }, {});
  const topActivity = Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0];

  const effectiveTodayScore =
    input.previewScore ?? todayEntry?.score ?? null;

  return {
    moodHistory: filterMoodsInRange(input.moods, weekDays[0], today),
    chartDays: buildChartDays(input.moods, 7, input.previewScore),
    today: todayEntry,
    streak: {
      current: input.streak.current_streak,
      longest: input.streak.longest_streak,
    },
    week: {
      checkInDays: weekMoods.length,
      average: weekAvg,
      trendPercent,
      topMoodLabel: topScore ? getMoodShortLabel(Number(topScore)) : null,
    },
    activity: {
      totalThisWeek: weekActivities.length,
      topType: topActivity?.[0] ?? null,
      topTypeLabel: topActivity ? (ACTIVITY_LABELS[topActivity[0]] ?? topActivity[0]) : null,
    },
    suggestion: buildSuggestion(effectiveTodayScore, weekMoods.length, input.streak.current_streak),
  };
}
