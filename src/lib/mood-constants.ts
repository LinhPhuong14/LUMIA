export const MOOD_OPTIONS = [
  { score: 1 as const, label: "Rất buồn", shortLabel: "Buồn nhiều" },
  { score: 2 as const, label: "Buồn", shortLabel: "Hơi buồn" },
  { score: 3 as const, label: "Bình thường", shortLabel: "Ổn" },
  { score: 4 as const, label: "Vui", shortLabel: "Khá tốt" },
  { score: 5 as const, label: "Rất vui", shortLabel: "Rất tốt" },
] as const;

export type MoodScore = (typeof MOOD_OPTIONS)[number]["score"];

export function getMoodLabel(score: number): string {
  return MOOD_OPTIONS.find((m) => m.score === score)?.label ?? "Chưa rõ";
}

export function getMoodShortLabel(score: number): string {
  return MOOD_OPTIONS.find((m) => m.score === score)?.shortLabel ?? "—";
}
