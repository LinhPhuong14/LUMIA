"use client";

import { useEffect, useRef } from "react";

import { useIsClient } from "@/hooks/use-is-client";

type Phase = "inhale" | "hold" | "exhale" | "holdAfter";

export function BreathingParticleRing({
  phase,
  particleCount = 48,
}: {
  phase: Phase;
  particleCount?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);

  const isClient = useIsClient();
  const isMobile = isClient && window.innerWidth < 768;
  const count = isMobile ? Math.min(32, particleCount) : particleCount;

  const radiusScale =
    phase === "inhale" ? 1.4 : phase === "exhale" ? 1 : phase === "hold" || phase === "holdAfter" ? 1.35 : 1.2;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!canvas || !ctx) return;

    const size = 280;
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    let frameId = 0;
    const baseRadius = 100 * radiusScale;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);
      angleRef.current += 0.008;
      const cx = size / 2;
      const cy = size / 2;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + angleRef.current;
        const r = baseRadius + Math.sin(angle * 3 + angleRef.current) * 4;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / baseRadius;
        const opacity = 0.3 + (1 - dist) * 0.5;
        const particleR = 2 + (i % 3);

        ctx.beginPath();
        ctx.arc(x, y, particleR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(141, 157, 118, ${opacity})`;
        ctx.fill();
      }

      frameId = requestAnimationFrame(draw);
    }

    frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, [count, radiusScale]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 m-auto"
      style={{ filter: "blur(0.5px)" }}
      aria-hidden
    />
  );
}
