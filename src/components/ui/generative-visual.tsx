"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import { useIsClient } from "@/hooks/use-is-client";
import { hashSeed, seededRandom } from "@/lib/generative-seed";

const PALETTES = {
  matcha: ["#8d9d76", "#b8cba8", "#dce8d4"],
  morning: ["#f0c94e", "#f4ead2", "#e8d8a0"],
  night: ["#6480a0", "#8090b0", "#b0c0d8"],
  neutral: ["#a0a090", "#c0b8a8", "#d8d0c0"],
} as const;

export interface GenerativeVisualProps {
  seed: string;
  variant: "aura" | "constellation" | "garden" | "wave";
  size?: number;
  palette?: keyof typeof PALETTES;
  animated?: boolean;
  moodData?: number[];
  streakCount?: number;
  className?: string;
  breathingPhase?: "inhale" | "hold" | "exhale" | "holdAfter" | null;
  audioPlaying?: boolean;
}

function AuraCanvas({
  seed,
  palette,
  size,
  moodData,
  streakCount,
}: {
  seed: string;
  palette: keyof typeof PALETTES;
  size: number;
  moodData?: number[];
  streakCount?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1;
    const w = size;
    const h = size;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const rng = seededRandom(hashSeed(seed));
    const colors = [...PALETTES[palette]];
    const avgMood = moodData?.length
      ? moodData.reduce((a, b) => a + b, 0) / moodData.length
      : 3;
    const intensity = 0.12 + (avgMood / 5) * 0.13;
    const pointCount = 3 + Math.min(streakCount ?? 0, 5);

    for (let i = 0; i < pointCount; i++) {
      const cx = rng() * w;
      const cy = rng() * h;
      const radius = (0.25 + rng() * 0.35) * Math.min(w, h);
      const color = colors[Math.floor(rng() * colors.length)];
      const hex = color.replace("#", "");
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, `rgba(${r},${g},${b},${intensity + 0.08})`);
      grad.addColorStop(0.6, `rgba(${r},${g},${b},${intensity * 0.5})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [seed, palette, size, moodData, streakCount]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}

function ConstellationSvg({
  seed,
  size,
  moodData,
  activeDays,
}: {
  seed: string;
  size: { w: number; h: number };
  moodData?: number[];
  activeDays?: boolean[];
}) {
  const rng = seededRandom(hashSeed(seed));
  const points = Array.from({ length: 21 }, (_, i) => ({
    x: 20 + rng() * (size.w - 40),
    y: 20 + rng() * (size.h - 40),
    active: activeDays?.[i] ?? rng() > 0.3,
    mood: moodData?.[i] ?? 3,
    i,
  }));

  const lines: [number, number][] = [];
  const threshold = 80;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < threshold && points[i].active && points[j].active) {
        lines.push([i, j]);
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size.w} ${size.h}`}
      className="h-full w-full"
      aria-hidden
    >
      {lines.map(([a, b], idx) => (
        <line
          key={idx}
          x1={points[a].x}
          y1={points[a].y}
          x2={points[b].x}
          y2={points[b].y}
          stroke="rgba(141,157,118,0.15)"
          strokeWidth="0.5"
        />
      ))}
      {points.map((p) => (
        <circle
          key={p.i}
          cx={p.x}
          cy={p.y}
          r={p.mood >= 4 ? 3 : p.mood >= 3 ? 2 : 1.5}
          fill={p.active ? "#8d9d76" : "rgba(141,157,118,0.3)"}
          opacity={p.active ? 0.8 : 0.2}
        />
      ))}
    </svg>
  );
}

function GardenSvg({ seed, moodData }: { seed: string; moodData?: number[] }) {
  const rng = seededRandom(hashSeed(seed));
  const plants = Array.from({ length: 21 }, (_, i) => {
    const mood = moodData?.[i];
    const hasData = moodData !== undefined;
    if (hasData && mood === undefined) return null;
    const score = mood ?? 3;
    return {
      x: 10 + (i % 7) * 13 + rng() * 4,
      y: 15 + Math.floor(i / 7) * 28 + rng() * 4,
      type: score >= 4 ? "flower" : score >= 3 ? "leaf" : "grass",
      size: 0.8 + (score / 5) * 0.6,
      i,
    };
  }).filter(Boolean) as { x: number; y: number; type: string; size: number; i: number }[];

  return (
    <svg viewBox="0 0 100 90" className="h-full w-full" aria-hidden>
      {plants.map((p) => (
        <motion.g
          key={p.i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: p.size, opacity: 0.1 }}
          transition={{ delay: p.i * 0.05, duration: 0.4 }}
          style={{ transformOrigin: `${p.x}% ${p.y}%` }}
        >
          {p.type === "flower" ? (
            <circle cx={`${p.x}%`} cy={`${p.y}%`} r="3" fill="#8d9d76" />
          ) : p.type === "leaf" ? (
            <ellipse cx={`${p.x}%`} cy={`${p.y}%`} rx="2" ry="4" fill="#7d8f68" transform={`rotate(${p.i * 15} ${p.x} ${p.y})`} />
          ) : (
            <line x1={`${p.x}%`} y1={`${p.y}%`} x2={`${p.x}%`} y2={`${p.y - 4}%`} stroke="#b8cba8" strokeWidth="1" />
          )}
        </motion.g>
      ))}
    </svg>
  );
}

function WaveCanvas({
  size,
  animated,
  breathingPhase,
  audioPlaying,
}: {
  size: { w: number; h: number };
  animated: boolean;
  breathingPhase?: GenerativeVisualProps["breathingPhase"];
  audioPlaying?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;
    ctx.scale(dpr, dpr);

    let phase = 0;
    let lastTime = performance.now();
    const layers = [
      { frequency: 0.008, amplitude: 30, speed: 0.003, color: "rgba(141,157,118,0.08)" },
      { frequency: 0.015, amplitude: 18, speed: 0.006, color: "rgba(141,157,118,0.12)" },
      { frequency: 0.025, amplitude: 10, speed: 0.01, color: "rgba(141,157,118,0.16)" },
    ];

    const breatheMult =
      breathingPhase === "inhale" ? { amp: 1.5, speed: 0.7 }
      : breathingPhase === "exhale" ? { amp: 0.6, speed: 1.3 }
      : { amp: 1, speed: 1 };

    function draw(now: number) {
      if (!ctx) return;
      const dt = now - lastTime;
      lastTime = now;
      if (animated || audioPlaying) {
        phase += dt * 0.001 * breatheMult.speed;
      }

      ctx.clearRect(0, 0, size.w, size.h);

      for (const layer of layers) {
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.moveTo(0, size.h);
        for (let x = 0; x <= size.w; x++) {
          const y =
            size.h * 0.6 +
            Math.sin(x * layer.frequency + phase * layer.speed * 100) *
              layer.amplitude *
              breatheMult.amp;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(size.w, size.h);
        ctx.closePath();
        ctx.fill();
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    if (!animated && !audioPlaying && !breathingPhase) {
      phase = 0;
      draw(performance.now());
      return;
    }

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [size.w, size.h, animated, breathingPhase, audioPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}

export function GenerativeVisual({
  seed,
  variant,
  size = 200,
  palette = "matcha",
  animated = false,
  moodData,
  streakCount,
  className = "",
  breathingPhase,
  audioPlaying,
}: GenerativeVisualProps) {
  const isClient = useIsClient();
  const mobileScale = isClient && window.innerWidth < 768 ? 0.5 : 1;
  const scaledSize = Math.round(size * mobileScale);

  // SSR + first hydration pass: empty shell matching client wrapper (no canvas/SVG yet)
  if (!isClient) {
    if (variant === "aura" || variant === "wave") {
      return (
        <div
          className={`relative overflow-hidden ${className}`}
          style={{ width: "100%", height: "100%" }}
          aria-hidden
        />
      );
    }
    if (variant === "constellation") {
      return (
        <div
          className={`relative ${className}`}
          style={{ width: "100%", height: size * 0.33 }}
          aria-hidden
        />
      );
    }
    return (
      <div
        className={`pointer-events-none absolute inset-0 -z-10 opacity-80 ${className}`}
        aria-hidden
      />
    );
  }

  if (variant === "aura") {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ width: "100%", height: "100%" }}>
        <AuraCanvas seed={seed} palette={palette} size={scaledSize} moodData={moodData} streakCount={streakCount} />
      </div>
    );
  }

  if (variant === "constellation") {
    return (
      <div className={`relative ${className}`} style={{ width: "100%", height: scaledSize * 0.33 }}>
        <ConstellationSvg
          seed={seed}
          size={{ w: 600, h: 200 }}
          moodData={moodData}
          activeDays={moodData?.map((m) => m > 0)}
        />
      </div>
    );
  }

  if (variant === "garden") {
    return (
      <div className={`pointer-events-none absolute inset-0 -z-10 opacity-80 ${className}`}>
        <GardenSvg seed={seed} moodData={moodData} />
      </div>
    );
  }

  if (variant === "wave") {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ width: "100%", height: "100%" }}>
        <WaveCanvas
          size={{ w: scaledSize * 3, h: scaledSize }}
          animated={animated}
          breathingPhase={breathingPhase}
          audioPlaying={audioPlaying}
        />
      </div>
    );
  }

  return null;
}
