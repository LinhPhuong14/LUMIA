import type { ReactNode } from "react";

const TEMPLATES: Record<string, ReactNode> = {
  sleep_sound: (
    <svg viewBox="0 0 200 80" className="h-full w-full" aria-hidden>
      <circle cx="160" cy="20" r="12" fill="rgba(255,240,180,0.4)" />
      <path d="M0 60 Q50 50 100 55 T200 50 L200 80 L0 80Z" fill="rgba(141,157,118,0.15)" />
      <path d="M0 65 Q40 58 80 62 T160 58" stroke="rgba(100,130,160,0.2)" fill="none" />
      <line x1="170" y1="50" x2="170" y2="70" stroke="#7d8f68" strokeWidth="1" opacity="0.4" />
      <line x1="175" y1="52" x2="175" y2="68" stroke="#7d8f68" strokeWidth="1" opacity="0.3" />
    </svg>
  ),
  sleep_cast: (
    <svg viewBox="0 0 200 80" className="h-full w-full" aria-hidden>
      <rect x="60" y="25" width="50" height="35" rx="3" fill="#eaf0df" opacity="0.6" transform="rotate(-5 85 42)" />
      <circle cx="30" cy="15" r="2" fill="rgba(255,240,180,0.5)" />
      <circle cx="45" cy="10" r="1.5" fill="rgba(255,240,180,0.4)" />
      <circle cx="55" cy="18" r="1" fill="rgba(255,240,180,0.3)" />
      <path d="M140 60 C145 50 155 48 160 55" stroke="#8d9d76" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  guided_meditation: (
    <svg viewBox="0 0 200 80" className="h-full w-full" aria-hidden>
      <ellipse cx="100" cy="55" rx="20" ry="8" fill="#d2dcba" opacity="0.5" />
      <path d="M100 30 C90 40 85 50 90 55 C95 48 100 45 110 55 C115 50 110 38 100 30Z" fill="#8d9d76" opacity="0.4" />
      <circle cx="100" cy="25" r="15" fill="rgba(141,157,118,0.12)" />
    </svg>
  ),
  breathing: (
    <svg viewBox="0 0 200 80" className="h-full w-full" aria-hidden>
      <circle cx="100" cy="40" r="25" fill="none" stroke="rgba(141,157,118,0.15)" strokeWidth="1" />
      <circle cx="100" cy="40" r="18" fill="none" stroke="rgba(141,157,118,0.2)" strokeWidth="1" />
      <circle cx="100" cy="40" r="10" fill="rgba(141,157,118,0.25)" />
      <path d="M160 50 C165 42 172 40 175 48" stroke="#7d8f68" strokeWidth="1" fill="none" opacity="0.4" />
    </svg>
  ),
  mini_meditation: (
    <svg viewBox="0 0 200 80" className="h-full w-full" aria-hidden>
      <path d="M100 65 C95 55 98 45 100 35 C102 45 105 55 100 65Z" fill="#7d8f68" opacity="0.35" />
      <ellipse cx="100" cy="68" rx="8" ry="3" fill="#d2dcba" opacity="0.4" />
    </svg>
  ),
  wind_down: (
    <svg viewBox="0 0 200 80" className="h-full w-full" aria-hidden>
      <rect x="70" y="30" width="60" height="40" rx="4" fill="rgba(100,130,160,0.1)" />
      <circle cx="160" cy="25" r="10" fill="rgba(255,240,180,0.3)" />
    </svg>
  ),
  sleep_music: (
    <svg viewBox="0 0 200 80" className="h-full w-full" aria-hidden>
      <circle cx="80" cy="45" r="25" fill="none" stroke="#8d9d76" strokeWidth="1" opacity="0.3" />
      <circle cx="80" cy="45" r="8" fill="#7d8f68" opacity="0.3" />
      <line x1="120" y1="35" x2="120" y2="55" stroke="#7d8f68" strokeWidth="2" opacity="0.3" />
    </svg>
  ),
};

export const CATEGORY_ACCENT: Record<string, string> = {
  sleep_sound: "#7d9a8a",
  sleep_cast: "#6a7d9a",
  guided_meditation: "#8d9d76",
  breathing: "#9a8d76",
  mini_meditation: "#7d8d6a",
  wind_down: "#6a7d9a",
  sleep_music: "#7d9a8a",
};

export function BotanicalArtwork({ category }: { category: string }) {
  const template = TEMPLATES[category] ?? TEMPLATES.guided_meditation;
  const accent = CATEGORY_ACCENT[category] ?? "#8d9d76";

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${accent}22 0%, ${accent}08 100%)`,
      }}
    >
      {template}
    </div>
  );
}
