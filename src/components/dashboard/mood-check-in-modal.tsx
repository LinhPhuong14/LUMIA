"use client";

import { useEffect, useState } from "react";

const moods = [
  { score: 1, label: "Bình yên" },
  { score: 2, label: "Mệt" },
  { score: 3, label: "Lo" },
  { score: 4, label: "Buồn" },
  { score: 5, label: "Căng" },
] as const;

export function MoodCheckInModal({
  onComplete,
}: {
  onComplete?: (score: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(3);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  if (loading || !open) {
    return null;
  }

  return (
    <div className="modal-backdrop flex items-end justify-center bg-black/20 p-4 backdrop-blur-sm sm:items-center">
      <div className="mood-modal w-full max-w-md rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-[0_24px_80px_rgba(143,168,120,0.18)]">
        <span className="eyebrow">Check-in hôm nay</span>
        <h2 className="mt-3 font-sans text-xl font-medium text-matcha-text">Bạn đang cảm thấy thế nào?</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {moods.map((mood) => (
            <button
              key={mood.score}
              type="button"
              onClick={() => setScore(mood.score)}
              className={`rounded-full px-3 py-2 text-[13px] transition ${
                score === mood.score
                  ? "bg-matcha text-white"
                  : "border border-white/80 bg-white/72 text-matcha-deep"
              }`}
            >
              {mood.label}
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú ngắn (tuỳ chọn)"
          className="mt-4 min-h-20 w-full rounded-[20px] border border-white/70 bg-white/84 p-4 text-sm outline-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="button-primary mt-5 w-full justify-center disabled:opacity-50"
        >
          {submitting ? "Đang lưu..." : "Lưu check-in"}
        </button>
      </div>
    </div>
  );
}
