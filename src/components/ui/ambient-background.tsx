"use client";

import { useIsClient } from "@/hooks/use-is-client";

interface AmbientOrb {
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

const orbs: AmbientOrb[] = [
  { x: 50, y: -10, size: 65, color: "rgba(141,157,118,0.15)", duration: 120, delay: 0 },
  { x: 80, y: 70, size: 40, color: "rgba(240,195,100,0.08)", duration: 90, delay: 30 },
  { x: 15, y: 40, size: 30, color: "rgba(100,130,80,0.07)", duration: 100, delay: 15 },
];

export function AmbientBackground({
  timeAware = true,
  accentColor,
}: {
  timeAware?: boolean;
  accentColor?: string | null;
}) {
  const isClient = useIsClient();
  // Neutral hour on SSR so orb colors match during hydration
  const hour = isClient ? new Date().getHours() : 12;
  const isEvening = hour >= 20 || hour < 6;
  const isMorning = hour >= 6 && hour < 12;

  const adjustedOrbs = orbs.map((orb, i) => {
    let color = orb.color;
    if (accentColor && i === 0) {
      const hex = accentColor.replace("#", "");
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      color = `rgba(${r},${g},${b},0.12)`;
    } else if (timeAware && isEvening) {
      color = orb.color.replace("141,157,118", "100,130,160");
    } else if (timeAware && isMorning) {
      color = orb.color.replace("141,157,118", "160,145,100");
    }
    return { ...orb, color };
  });

  return (
    <div
      aria-hidden="true"
      className="ambient-background"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
        transition: "opacity 2s ease",
      }}
    >
      {adjustedOrbs.map((orb, i) => (
        <div
          key={i}
          className={`ambient-orb ambient-orb-${i}`}
          style={{
            position: "absolute",
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}vw`,
            height: `${orb.size}vw`,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 68%)`,
            animation: `ambientDrift${i} ${orb.duration}s ${orb.delay}s ease-in-out infinite alternate`,
            transition: "background 2s ease",
          }}
        />
      ))}
      <style>{`
        @keyframes ambientDrift0 {
          from { transform: translate(-50%, -50%) scale(1); }
          to   { transform: translate(-48%, -52%) scale(1.08); }
        }
        @keyframes ambientDrift1 {
          from { transform: translate(-50%, -50%) scale(1); }
          to   { transform: translate(-52%, -48%) scale(0.95); }
        }
        @keyframes ambientDrift2 {
          from { transform: translate(-50%, -50%) scale(1); }
          to   { transform: translate(-46%, -52%) scale(1.05); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ambient-orb { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
