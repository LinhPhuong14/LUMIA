"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const techniques = {
  "4-7-8": { inhale: 4, hold: 7, exhale: 8, label: "4-7-8" },
  box: { inhale: 4, hold: 4, exhale: 4, holdAfter: 4, label: "Box Breathing" },
  coherent: { inhale: 5, hold: 0, exhale: 5, label: "Coherent" },
} as const;

type TechniqueKey = keyof typeof techniques;

export function BreathingExercise() {
  const [technique, setTechnique] = useState<TechniqueKey>("4-7-8");
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "holdAfter">("inhale");
  const [scale, setScale] = useState(1);

  const config = techniques[technique];
  const phaseLabel =
    phase === "inhale" ? "Hít vào" : phase === "hold" || phase === "holdAfter" ? "Giữ" : "Thở ra";

  useEffect(() => {
    const durations: Record<string, number> = {
      inhale: config.inhale * 1000,
      hold: (config.hold ?? 0) * 1000,
      exhale: config.exhale * 1000,
      holdAfter: ("holdAfter" in config ? config.holdAfter : 0) * 1000,
    };

    setScale(phase === "inhale" ? 1.35 : phase === "exhale" ? 0.75 : 1);

    const ms = durations[phase] || 1000;
    const timer = window.setTimeout(() => {
      if (phase === "inhale") setPhase(config.hold ? "hold" : "exhale");
      else if (phase === "hold") setPhase("exhale");
      else if (phase === "exhale" && "holdAfter" in config && config.holdAfter) setPhase("holdAfter");
      else setPhase("inhale");
    }, ms);

    return () => window.clearTimeout(timer);
  }, [phase, config, technique]);

  useEffect(() => {
    fetch("/api/streak/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityType: "breathing" }),
    }).catch(() => null);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex gap-2">
        {(Object.keys(techniques) as TechniqueKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTechnique(key);
              setPhase("inhale");
            }}
            className={`rounded-full px-4 py-2 text-sm ${technique === key ? "bg-matcha text-white" : "bg-white text-muted"}`}
          >
            {techniques[key].label}
          </button>
        ))}
      </div>

      <motion.div
        animate={{ scale }}
        transition={{ duration: config.inhale, ease: "easeInOut" }}
        className="flex h-56 w-56 items-center justify-center rounded-full bg-[linear-gradient(135deg,#DDE8D2,#FFF3C7)] shadow-lg"
      >
        <span className="font-serif text-2xl text-matcha-deep">{phaseLabel}</span>
      </motion.div>
    </div>
  );
}
