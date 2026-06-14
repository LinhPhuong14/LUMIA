"use client";

import { useEffect, useState } from "react";

import { getMoodPlaceholder, MoodFace } from "@/components/ui/mood-faces";
import { MOOD_OPTIONS, type MoodScore } from "@/lib/mood-constants";

export function MoodCheckInPanel({
  selectedScore,
  savedScore,
  savedNote,
  onSelectScore,
  onSubmit,
  submitting,
  compact = false,
}: {
  selectedScore: MoodScore | null;
  savedScore: number | null;
  savedNote?: string | null;
  onSelectScore: (score: MoodScore) => void;
  onSubmit: (score: MoodScore, note?: string) => Promise<void>;
  submitting: boolean;
  compact?: boolean;
}) {
  const [note, setNote] = useState(savedNote ?? "");
  const activeScore = selectedScore ?? (savedScore as MoodScore | null);

  useEffect(() => {
    if (selectedScore == null) {
      setNote(savedNote ?? "");
    }
  }, [savedNote, selectedScore]);
  const hasChanges =
    selectedScore != null && (selectedScore !== savedScore || note.trim() !== (savedNote ?? "").trim());

  async function handleSubmit() {
    if (!activeScore || !hasChanges) return;
    await onSubmit(activeScore, note.trim() || undefined);
  }

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      <div>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-[17px] font-semibold text-[var(--foreground)]">
            Hôm nay bạn thế nào?
          </h3>
          {savedScore != null && selectedScore == null ? (
            <span className="rounded-full border border-[var(--border)] bg-[var(--green-wash)] px-2.5 py-1 text-[10px] font-semibold text-[var(--green-deep)]">
              Đã lưu {savedScore}/5
            </span>
          ) : (
            <span className="text-[11px] text-[var(--muted)]">Chọn rồi nhấn lưu để cập nhật biểu đồ</span>
          )}
        </div>
        <p className="mt-1 text-[12px] text-[var(--muted)]">
          Một lần ghi nhận mỗi ngày — bạn có thể chỉnh lại nếu cảm xúc thay đổi.
        </p>
      </div>

      <div className={compact ? "flex gap-2" : "flex justify-between gap-1.5 sm:gap-2"}>
        {MOOD_OPTIONS.map((mood) => {
          const isActive = activeScore === mood.score;
          return (
            <button
              key={mood.score}
              type="button"
              onClick={() => onSelectScore(mood.score)}
              className={
                compact
                  ? `flex aspect-square min-h-[44px] flex-1 items-center justify-center rounded-2xl border text-[22px] transition ${
                      isActive
                        ? "border-[var(--matcha-deep)] bg-[var(--mood-high)]"
                        : "border-[var(--matcha-soft)] bg-[var(--surface-warm)]"
                    }`
                  : `flex flex-1 flex-col items-center gap-1 rounded-2xl border px-1 py-2 transition sm:py-2.5 ${
                      isActive
                        ? "border-[var(--green)] bg-[var(--green-wash)]"
                        : "border-[var(--border)] bg-[var(--surface)]"
                    }`
              }
              title={mood.label}
            >
              {compact ? (
                <MoodFace score={mood.score} selected={isActive} size={32} />
              ) : (
                <>
                  <MoodFace score={mood.score} selected={isActive} size={44} />
                  <span className="hidden text-[9px] text-[var(--muted)] sm:block">{mood.shortLabel}</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {activeScore ? (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={getMoodPlaceholder(activeScore)}
          rows={compact ? 2 : 3}
          className="w-full resize-none rounded-[18px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none ring-[var(--green)]/15 focus:ring-4"
        />
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!hasChanges || submitting}
        className="dash-accent-btn w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Đang lưu…" : savedScore == null ? "Lưu check-in hôm nay" : "Cập nhật check-in"}
      </button>
    </div>
  );
}
