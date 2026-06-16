/**
 * Rich illustrated mood faces for scores 1–5.
 * Each face has a unique color palette, expressive eyes, and mouth.
 */

type MoodConfig = {
  bg: string;
  bgSelected: string;
  stroke: string;
  strokeSelected: string;
  cheekColor: string;
  eyeConfig: { type: "normal" | "sad" | "happy" | "veryhappy"; pupilY: number };
  mouthPath: string;
  hasCheeks: boolean;
};

const MOODS: MoodConfig[] = [
  // 1 — Buồn nhiều (deep blue-purple, tears)
  {
    bg: "rgba(219,224,255,0.9)",
    bgSelected: "#c7d0ff",
    stroke: "#8b95e0",
    strokeSelected: "#5a66cc",
    cheekColor: "#a0aaee",
    eyeConfig: { type: "sad", pupilY: 24 },
    mouthPath: "M22 40 Q28 35 34 40",
    hasCheeks: false,
  },
  // 2 — Hơi buồn (soft lavender)
  {
    bg: "rgba(230,225,255,0.9)",
    bgSelected: "#d8d2f8",
    stroke: "#9e96d8",
    strokeSelected: "#6e66b8",
    cheekColor: "#c4bcf0",
    eyeConfig: { type: "sad", pupilY: 25 },
    mouthPath: "M22 39 Q28 35 34 39",
    hasCheeks: false,
  },
  // 3 — Ổn (warm sand/neutral)
  {
    bg: "rgba(255,242,210,0.9)",
    bgSelected: "#ffe8b0",
    stroke: "#c8a84b",
    strokeSelected: "#a08030",
    cheekColor: "#f5cc70",
    eyeConfig: { type: "normal", pupilY: 25 },
    mouthPath: "M22 37 L34 37",
    hasCheeks: false,
  },
  // 4 — Khá tốt (soft green)
  {
    bg: "rgba(210,245,220,0.9)",
    bgSelected: "#b8eeca",
    stroke: "#5aad72",
    strokeSelected: "#3a8a52",
    cheekColor: "#f0b8b8",
    eyeConfig: { type: "happy", pupilY: 24 },
    mouthPath: "M20 35 Q28 43 36 35",
    hasCheeks: true,
  },
  // 5 — Rất tốt (sunny yellow-green, big smile)
  {
    bg: "rgba(220,252,210,0.9)",
    bgSelected: "#b6f0a8",
    stroke: "#4a9e58",
    strokeSelected: "#2e7a3e",
    cheekColor: "#ffb3b3",
    eyeConfig: { type: "veryhappy", pupilY: 23 },
    mouthPath: "M18 34 Q28 46 38 34",
    hasCheeks: true,
  },
];

function SadEye({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      {/* Droopy eyelid */}
      <ellipse cx={cx} cy={cy + 1} rx={3.5} ry={2.8} fill={color} />
      {/* Tear */}
      <ellipse cx={cx + 0.5} cy={cy + 6} rx={1.2} ry={2} fill="#90b8f0" opacity={0.8} />
    </g>
  );
}

function HappyEye({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={3.2} ry={3.8} fill={color} />
      <ellipse cx={cx + 1} cy={cy - 1} rx={1} ry={1} fill="white" opacity={0.7} />
    </g>
  );
}

function VeryHappyEye({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  // Squinting happy eye — arc shape
  return (
    <path
      d={`M${cx - 3.5} ${cy} Q${cx} ${cy - 5} ${cx + 3.5} ${cy}`}
      stroke={color}
      strokeWidth="2.2"
      fill="none"
      strokeLinecap="round"
    />
  );
}

function NormalEye({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return <ellipse cx={cx} cy={cy} rx={2.8} ry={3.2} fill={color} />;
}

export function MoodFace({
  score,
  selected,
  size = 48,
}: {
  score: 1 | 2 | 3 | 4 | 5;
  selected?: boolean;
  size?: number;
}) {
  const mood = MOODS[score - 1]!;
  const { eyeConfig, mouthPath, hasCheeks, cheekColor } = mood;
  const bg = selected ? mood.bgSelected : mood.bg;
  const strokeColor = selected ? mood.strokeSelected : mood.stroke;
  const eyeColor = strokeColor;
  const leftEyeX = 21;
  const rightEyeX = 35;
  const { pupilY, type } = eyeConfig;

  function Eyes() {
    if (type === "sad")
      return (
        <>
          <SadEye cx={leftEyeX} cy={pupilY} color={eyeColor} />
          <SadEye cx={rightEyeX} cy={pupilY} color={eyeColor} />
        </>
      );
    if (type === "happy")
      return (
        <>
          <HappyEye cx={leftEyeX} cy={pupilY} color={eyeColor} />
          <HappyEye cx={rightEyeX} cy={pupilY} color={eyeColor} />
        </>
      );
    if (type === "veryhappy")
      return (
        <>
          <VeryHappyEye cx={leftEyeX} cy={pupilY} color={eyeColor} />
          <VeryHappyEye cx={rightEyeX} cy={pupilY} color={eyeColor} />
        </>
      );
    return (
      <>
        <NormalEye cx={leftEyeX} cy={pupilY} color={eyeColor} />
        <NormalEye cx={rightEyeX} cy={pupilY} color={eyeColor} />
      </>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 56 56" aria-hidden>
      {/* Shadow */}
      <ellipse cx="28" cy="51" rx="18" ry="3" fill="rgba(0,0,0,0.07)" />

      {/* Face circle */}
      <circle
        cx="28"
        cy="27"
        r="24"
        fill={bg}
        stroke={strokeColor}
        strokeWidth={selected ? 2.2 : 1.2}
      />

      {/* Cheeks */}
      {hasCheeks && (
        <>
          <ellipse cx="16" cy="35" rx="5" ry="3.5" fill={cheekColor} opacity="0.5" />
          <ellipse cx="40" cy="35" rx="5" ry="3.5" fill={cheekColor} opacity="0.5" />
        </>
      )}

      {/* Eyes */}
      <Eyes />

      {/* Mouth */}
      <path
        d={mouthPath}
        stroke={strokeColor}
        strokeWidth="2.2"
        fill={type === "veryhappy" ? strokeColor + "33" : "none"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Score dot indicator when selected */}
      {selected && (
        <circle cx="28" cy="51" r="2.5" fill={strokeColor} opacity="0.6" />
      )}
    </svg>
  );
}

export function getMoodPlaceholder(score: number): string {
  if (score <= 2) return "Có chuyện gì không? Bạn muốn kể không...";
  if (score === 3) return "Hôm nay thế nào bạn ơi?";
  return "Tuyệt! Điều gì làm bạn vui vậy?";
}
