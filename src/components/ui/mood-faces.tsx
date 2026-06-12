const FACE_PATHS = [
  "M30 38 Q38 32 46 38", // sad curve up (peaceful/low)
  "M32 40 Q38 36 44 40",
  "M34 38 L42 38",
  "M32 36 Q38 42 44 36",
  "M30 34 Q38 44 46 34",
] as const;

export function MoodFace({
  score,
  selected,
  size = 48,
}: {
  score: 1 | 2 | 3 | 4 | 5;
  selected?: boolean;
  size?: number;
}) {
  const mouth = FACE_PATHS[score - 1];
  const eyeY = score <= 2 ? 28 : score === 3 ? 27 : 26;

  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden>
      <circle
        cx="28"
        cy="28"
        r="26"
        fill={selected ? "var(--matcha-soft)" : "rgba(255,255,255,0.8)"}
        stroke={selected ? "var(--matcha-deep)" : "rgba(255,255,255,0.65)"}
        strokeWidth={selected ? 2 : 1}
      />
      <circle cx="20" cy={eyeY} r="2" fill="#7d8f68" />
      <circle cx="36" cy={eyeY} r="2" fill="#7d8f68" />
      <path d={mouth} stroke="#7d8f68" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function getMoodPlaceholder(score: number): string {
  if (score <= 2) return "Có chuyện gì không? Bạn muốn kể không...";
  if (score === 3) return "Hôm nay thế nào bạn ơi?";
  return "Tuyệt! Điều gì làm bạn vui vậy?";
}
