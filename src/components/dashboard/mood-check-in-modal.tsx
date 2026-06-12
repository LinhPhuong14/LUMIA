"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

import { getMoodPlaceholder, MoodFace } from "@/components/ui/mood-faces";

const moods = [
  { score: 1 as const, label: "Rất buồn" },
  { score: 2 as const, label: "Buồn" },
  { score: 3 as const, label: "Bình thường" },
  { score: 4 as const, label: "Vui" },
  { score: 5 as const, label: "Rất vui" },
];

export function MoodCheckInModal({
  onComplete,
}: {
  onComplete?: (score: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    fetch(`/api/mood/history?days=1`)
      .then((r) => r.json())
      .then((data: { date: string }[]) => {
        const checkedIn = Array.isArray(data) && data.some((e) => e.date === today);
        setOpen(!checkedIn);
      })
      .catch(() => setOpen(true))
      .finally(() => setLoading(false));
  }, []);

  async function submit() {
    setSubmitting(true);
    const response = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, note: note || undefined }),
    });
    setSubmitting(false);
    if (response.ok) {
      await fetch("/api/streak/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityType: "mood" }),
      }).catch(() => null);
      onComplete?.(score);
      setOpen(false);
    }
  }

  if (!mounted || loading || !open) {
    return null;
  }

  return createPortal(
    <div
      className="modal-backdrop flex items-center justify-center bg-black/25 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mood-check-in-title"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="glass-card-elevated w-full max-w-md rounded-[28px] p-6 shadow-[0_24px_60px_rgba(95,111,82,0.2)]"
      >
        <span className="eyebrow">Check-in hôm nay</span>
        <h2 id="mood-check-in-title" className="mt-3 font-sans text-xl font-medium text-matcha-text">
          Bạn đang cảm thấy thế nào?
        </h2>
        <div className="mt-6 flex justify-between gap-2">
          {moods.map((mood) => (
            <button
              key={mood.score}
              type="button"
              onClick={() => setScore(mood.score)}
              className={`group flex flex-col items-center gap-1 rounded-2xl p-2 transition hover:scale-110 ${
                score === mood.score ? "bg-matcha-soft ring-2 ring-matcha-deep" : ""
              }`}
              title={mood.label}
            >
              <MoodFace score={mood.score} selected={score === mood.score} />
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={getMoodPlaceholder(score)}
          className="mt-5 min-h-20 w-full rounded-[20px] border border-white/70 bg-white/84 p-4 text-sm outline-none focus:ring-2 focus:ring-matcha-soft"
        />
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="button-primary mt-5 w-full justify-center disabled:opacity-50"
        >
          {submitting ? "Đang lưu..." : "Lưu check-in"}
        </button>
      </motion.div>
    </div>,
    document.body,
  );
}
