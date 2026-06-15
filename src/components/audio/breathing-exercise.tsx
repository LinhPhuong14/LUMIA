"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { BreathingParticleRing } from "@/components/audio/breathing-particle-ring";
import { Button } from "@/components/ui/button";
import { GenerativeVisual } from "@/components/ui/generative-visual";

const techniques = {
  "4-7-8": { inhale: 4, hold: 7, exhale: 8, label: "4-7-8", rounds: 4 },
  box: { inhale: 4, hold: 4, exhale: 4, holdAfter: 4, label: "Box Breathing", rounds: 4 },
  coherent: { inhale: 5, hold: 0, exhale: 5, label: "Coherent", rounds: 4 },
} as const;

type TechniqueKey = keyof typeof techniques;
type Phase = "inhale" | "hold" | "exhale" | "holdAfter";

function useBinauralTone(active: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!active) {
      gainRef.current?.gain.setTargetAtTime(0, ctxRef.current?.currentTime ?? 0, 0.5);
      return;
    }

    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const osc = ctx.createOscillator();
    osc.frequency.value = 432;
    osc.type = "sine";
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gainRef.current = gain;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    void ctx.resume();
    gain.gain.setTargetAtTime(0.04, ctx.currentTime, 2);

    return () => {
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
      window.setTimeout(() => void ctx.close(), 400);
    };
  }, [active]);
}

function CenterLeaf({ phase }: { phase: Phase }) {
  const scale = phase === "inhale" ? 1.3 : phase === "exhale" ? 0.8 : 1.1;
  return (
    <motion.svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      animate={{ scale, rotate: phase === "inhale" ? 15 : 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      aria-hidden
    >
      <path d="M20 4C14 14 10 22 8 32c6-3 10-3 12 0 2-8 6-14 12-24-6 6-9 12-9 18s3 14 9 20c-3-10-3-18 0-26z" fill="#8d9d76" opacity="0.7" />
    </motion.svg>
  );
}

export function BreathingExercise({ enabled = true }: { enabled?: boolean }) {
  const [technique, setTechnique] = useState<TechniqueKey | null>(null);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [round, setRound] = useState(1);
  const [secondsInPhase, setSecondsInPhase] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [logged, setLogged] = useState(false);

  const config = technique ? techniques[technique] : null;
  useBinauralTone(Boolean(technique && !completed));

  const phaseLabel =
    phase === "inhale" ? "Hít vào" : phase === "hold" || phase === "holdAfter" ? "Giữ" : "Thở ra";

  const advancePhase = useCallback(() => {
    if (!config) return;
    if (phase === "inhale") {
      setPhase(config.hold ? "hold" : "exhale");
    } else if (phase === "hold") {
      setPhase("exhale");
    } else if (phase === "exhale") {
      if ("holdAfter" in config && config.holdAfter) {
        setPhase("holdAfter");
      } else {
        if (round >= config.rounds) {
          setCompleted(true);
          if (!logged) {
            setLogged(true);
            fetch("/api/streak/log", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ activityType: "breathing" }),
            }).catch(() => null);
          }
        } else {
          setRound((r) => r + 1);
          setPhase("inhale");
        }
      }
    } else if (phase === "holdAfter") {
      if (round >= config.rounds) {
        setCompleted(true);
        if (!logged) {
          setLogged(true);
          fetch("/api/streak/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ activityType: "breathing" }),
          }).catch(() => null);
        }
      } else {
        setRound((r) => r + 1);
        setPhase("inhale");
      }
    }
    setSecondsInPhase(0);
  }, [config, phase, round, logged]);

  useEffect(() => {
    if (!technique || completed || !config) return;
    const phaseDuration =
      phase === "inhale"
        ? config.inhale
        : phase === "hold" || phase === "holdAfter"
          ? ("holdAfter" in config && phase === "holdAfter" ? config.holdAfter : config.hold) ?? 0
          : config.exhale;

    if (phaseDuration === 0) {
      advancePhase();
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsInPhase((s) => {
        if (s + 1 >= phaseDuration) {
          advancePhase();
          return 0;
        }
        return s + 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [technique, phase, completed, config, advancePhase]);

  if (!enabled) {
    return <div className="glass-card min-h-[300px] p-8" />;
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <h2 className="font-serif text-3xl text-matcha-deep">Bạn đã hoàn thành {config?.rounds} vòng</h2>
        <Button
          type="button"
          onClick={() => {
            setTechnique(null);
            setCompleted(false);
            setRound(1);
            setPhase("inhale");
            setLogged(false);
          }}
          className="mt-6"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  if (technique && config) {
    const phaseDuration =
      phase === "inhale"
        ? config.inhale
        : phase === "hold" || phase === "holdAfter"
          ? ("holdAfter" in config && phase === "holdAfter" ? config.holdAfter : config.hold) ?? 0
          : config.exhale;

    return (
      <div
        className="fixed inset-0 z-50 flex flex-col"
        style={{ background: "rgba(38, 52, 30, 0.97)" }}
      >
        {/* Ambient particles */}
        <div className="pointer-events-none absolute inset-0 opacity-15" aria-hidden>
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-0.5 w-0.5 rounded-full bg-white"
              style={{ left: `${(i * 17) % 100}%`, top: `${(i * 23) % 100}%` }}
            />
          ))}
        </div>
        {/* Ambient glow behind ring */}
        <motion.div
          animate={{ scale: phase === "inhale" ? 1.15 : phase === "exhale" ? 0.9 : 1.05, opacity: phase === "inhale" ? 0.22 : 0.12 }}
          transition={{ duration: phaseDuration || 1, ease: "easeInOut" }}
          className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(141,157,118,0.5) 0%, transparent 70%)" }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-2 sm:px-8 sm:pt-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">{config.label}</p>
            <p className="mt-0.5 text-lg font-serif text-white/80">Thở cùng LUMIA</p>
          </div>
          <button
            type="button"
            onClick={() => setTechnique(null)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition"
            aria-label="Dừng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main centered content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6">
          {/* Ring + center content */}
          <div className="relative flex h-72 w-72 items-center justify-center">
            <BreathingParticleRing phase={phase} />
            <div className="relative z-10 flex flex-col items-center text-center text-white">
              <CenterLeaf phase={phase} />
              <span className="mt-4 font-serif text-2xl tracking-wide">{phaseLabel}</span>
              <div className="mt-1.5 font-sans text-sm tabular-nums text-white/60">{secondsInPhase}s</div>
            </div>
          </div>

          {/* Round indicator */}
          <div className="flex items-center gap-2">
            {Array.from({ length: config.rounds }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i < round - 1 ? "w-6 bg-white/60" : i === round - 1 ? "w-8 bg-white" : "w-4 bg-white/20"
                }`}
              />
            ))}
          </div>
          <p className="text-[13px] text-white/40">Vòng {round}/{config.rounds}</p>
        </div>

        {/* Bottom hint */}
        <div className="relative z-10 pb-8 text-center">
          <p className="text-[12px] text-white/30">
            {phase === "inhale" ? "Hít thật chậm và sâu" : phase === "exhale" ? "Thở ra nhẹ nhàng" : "Giữ và cảm nhận"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {(Object.keys(techniques) as TechniqueKey[]).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => {
            setTechnique(key);
            setPhase("inhale");
            setRound(1);
            setSecondsInPhase(0);
            setCompleted(false);
          }}
          className="glass-card p-6 text-left transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
        >
          <div className="font-serif text-2xl text-matcha-deep">{techniques[key].label}</div>
          <p className="mt-2 text-sm text-muted">
            {key === "4-7-8" && "Hít 4s - Giữ 7s - Thở 8s"}
            {key === "box" && "Hít 4s - Giữ 4s - Thở 4s - Giữ 4s"}
            {key === "coherent" && "Hít 5s - Thở 5s"}
          </p>
        </button>
      ))}
    </div>
  );
}
