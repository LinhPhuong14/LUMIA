"use client";

import { cn } from "@/lib/utils";

import type { JournalEntry } from "./journal-types";
import { formatJournalDate, isToday } from "./journal-types";

export function JournalHistory({
  entries,
  activeDate,
  onSelect,
  onNewToday,
}: {
  entries: JournalEntry[];
  activeDate: string | null;
  onSelect: (entry: JournalEntry) => void;
  onNewToday: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const hasToday = entries.some((e) => e.date === today);

  return (
    <aside className="journal-history flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-serif text-lg font-medium text-[var(--foreground)]">Lịch sử</h2>
        {!hasToday ? (
          <button
            type="button"
            onClick={onNewToday}
            className="rounded-full bg-[var(--green-wash)] px-3 py-1 text-[11px] font-semibold text-[var(--green-deep)] transition hover:bg-[var(--green)]/15"
          >
            + Hôm nay
          </button>
        ) : null}
      </div>

      <div className="journal-history-list lumia-scroll flex-1 space-y-2 overflow-y-auto pr-1">
        {entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border)] bg-white/40 px-4 py-8 text-center text-[13px] leading-relaxed text-[var(--muted)]">
            Chưa có trang nào. Bắt đầu viết hôm nay - mỗi ngày một trang riêng.
          </p>
        ) : (
          entries.map((entry) => {
            const active = entry.date === activeDate;
            const preview = entry.content.trim().slice(0, 72) || "Trang trống…";
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelect(entry)}
                className={cn(
                  "journal-history-item w-full rounded-[18px] border px-4 py-3.5 text-left transition",
                  active
                    ? "border-[var(--green)]/50 bg-white/90 shadow-[0_8px_24px_rgba(122,140,82,0.12)]"
                    : "border-[var(--border)]/70 bg-white/55 hover:bg-white/80",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold text-[var(--green-deep)]">
                    {isToday(entry.date) ? "Hôm nay" : formatJournalDate(entry.date)}
                  </span>
                  {entry.meta?.stickers?.length ? (
                    <span className="text-sm" aria-hidden>
                      {entry.meta.stickers[0]?.emoji}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--muted)]">{preview}</p>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
