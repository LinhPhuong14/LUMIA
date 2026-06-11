"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";

const techniques = {
  "4-7-8": { inhale: 4, hold: 7, exhale: 8, label: "4-7-8", rounds: 4 },
  box: { inhale: 4, hold: 4, exhale: 4, holdAfter: 4, label: "Box Breathing", rounds: 4 },
  coherent: { inhale: 5, hold: 0, exhale: 5, label: "Coherent", rounds: 4 },
} as const;

type TechniqueKey = keyof typeof techniques;
type Phase = "inhale" | "hold" | "exhale" | "holdAfter";

export function BreathingExercise({ enabled = true }: { enabled?: boolean }) {
  const [technique, setTechnique] = useState<TechniqueKey | null>(null);
  const [phase, setPhase] = useState<Phase>("inhale");
  const [round, setRound] = useState(1);
  const [secondsInPhase, setSecondsInPhase] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [logged, setLogged] = useState(false);

  const config = technique ? techniques[technique] : null;

  const phaseLabel =
    phase === "inhale" ? "Hít vào" : phase === "hold" || phase === "holdAfter" ? "Giữ" : "Thở ra";

  const targetScale =
    phase === "inhale" ? (technique === "coherent" ? 1.3 : 1.4) : phase === "exhale" ? 1 : 1.4;

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
    return <div className="soft-card min-h-[300px] p-8" />;
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <h2 className="font-serif text-3xl text-matcha-deep">Bạn đã hoàn thành {config?.rounds} vòng</h2>
        <button
          type="button"
          onClick={() => {
            setTechnique(null);
            setCompleted(false);
            setRound(1);
            setPhase("inhale");
            setLogged(false);
          }}
          className="button-primary mt-6"
        >
          Thử lại
        </button>
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f8f4eb]/95 backdrop-blur-md">
        <button
          type="button"
          onClick={() => setTechnique(null)}
          className="absolute right-6 top-6 rounded-full p-2 hover:bg-white/80"
          aria-label="Dừng"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-sm text-muted">
          Vòng {round}/{config.rounds}
        </p>
        <motion.div
          animate={{ scale: targetScale }}
          transition={{
            duration: phaseDuration || 1,
            ease: "easeInOut",
          }}
          className="mt-8 flex h-56 w-56 items-center justify-center rounded-full bg-[linear-gradient(135deg,#DDE8D2,#FFF3C7)] shadow-lg"
        >
          <div className="text-center">
            <span className="font-serif text-2xl text-matcha-deep">{phaseLabel}</span>
            <div className="mt-2 text-sm text-muted">{secondsInPhase}s</div>
          </div>
        </motion.div>
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
          className="soft-card p-6 text-left transition hover:shadow-lg"
        >
          <div className="font-serif text-2xl text-matcha-deep">{techniques[key].label}</div>
          <p className="mt-2 text-sm text-muted">
            {key === "4-7-8" && "Hít 4s — Giữ 7s — Thở 8s"}
            {key === "box" && "Hít 4s — Giữ 4s — Thở 4s — Giữ 4s"}
            {key === "coherent" && "Hít 5s — Thở 5s"}
          </p>
        </button>
      ))}
    </div>
  );
}
