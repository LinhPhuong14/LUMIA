"use client";

import { useCallback, useRef } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

import type { JournalMeta, JournalSticker } from "./journal-types";
import { JOURNAL_FONTS } from "./journal-types";

export function JournalPageCanvas({
  content,
  onContentChange,
  meta,
  onMetaChange,
  promptUsed,
  activeDate,
  placeholder,
}: {
  content: string;
  onContentChange: (value: string) => void;
  meta: JournalMeta;
  onMetaChange: (meta: JournalMeta) => void;
  promptUsed?: string;
  activeDate: string;
  placeholder: string;
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null);

  const fontClass = JOURNAL_FONTS.find((f) => f.id === meta.fontFamily)?.className ?? "font-serif";

  const updateSticker = useCallback(
    (id: string, patch: Partial<JournalSticker>) => {
      onMetaChange({
        ...meta,
        stickers: meta.stickers.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      });
    },
    [meta, onMetaChange],
  );

  const removeSticker = useCallback(
    (id: string) => {
      onMetaChange({ ...meta, stickers: meta.stickers.filter((s) => s.id !== id) });
    },
    [meta, onMetaChange],
  );

  function onStickerPointerDown(e: React.PointerEvent, sticker: JournalSticker) {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      id: sticker.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: sticker.x,
      origY: sticker.y,
    };
  }

  function onStickerPointerMove(e: React.PointerEvent) {
    const drag = dragRef.current;
    const page = pageRef.current;
    if (!drag || !page) return;
    const rect = page.getBoundingClientRect();
    const dx = ((e.clientX - drag.startX) / rect.width) * 100;
    const dy = ((e.clientY - drag.startY) / rect.height) * 100;
    updateSticker(drag.id, {
      x: Math.min(92, Math.max(2, drag.origX + dx)),
      y: Math.min(88, Math.max(2, drag.origY + dy)),
    });
  }

  function onStickerPointerUp() {
    dragRef.current = null;
  }

  const dateLabel = new Date(`${activeDate}T12:00:00`).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      ref={pageRef}
      className="journal-page relative min-h-[min(72vh,640px)] overflow-hidden rounded-[4px] shadow-[0_2px_0_rgba(122,140,82,0.06),0_24px_48px_rgba(95,111,82,0.1)]"
      onPointerMove={onStickerPointerMove}
      onPointerUp={onStickerPointerUp}
      onPointerLeave={onStickerPointerUp}
    >
      <div className="journal-page-lines pointer-events-none absolute inset-0" aria-hidden />
      <div className="journal-page-margin pointer-events-none absolute bottom-0 left-[52px] top-0 w-px bg-[var(--border)]/35" aria-hidden />

      <div className="relative z-[1] px-6 pb-10 pt-8 sm:px-10 sm:pt-10">
        <header className="mb-6 border-b border-[var(--border)]/40 pb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">Nhật ký</p>
          <h1 className="mt-1 font-serif text-[22px] font-medium capitalize text-[var(--foreground)] sm:text-[26px]">
            {dateLabel}
          </h1>
          {promptUsed ? (
            <p className="mt-2 text-[13px] italic text-[var(--muted)]">Gợi ý: {promptUsed}</p>
          ) : null}
        </header>

        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={placeholder}
          style={{ color: meta.textColor }}
          className={cn(
            "journal-page-editor relative z-[2] min-h-[320px] w-full resize-none border-none bg-transparent pl-2 text-[17px] leading-[2] outline-none placeholder:text-[var(--muted)]/70 sm:min-h-[380px] sm:text-[18px]",
            fontClass,
          )}
        />
      </div>

      {meta.stickers.map((sticker) => (
        <div
          key={sticker.id}
          className="journal-sticker group absolute z-[3] touch-none select-none"
          style={{ left: `${sticker.x}%`, top: `${sticker.y}%`, transform: "translate(-50%, -50%)" }}
          onPointerDown={(e) => onStickerPointerDown(e, sticker)}
        >
          <span className="block cursor-grab text-3xl drop-shadow-sm active:cursor-grabbing sm:text-4xl">{sticker.emoji}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeSticker(sticker.id);
            }}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/95 text-[var(--muted)] opacity-0 shadow-sm transition group-hover:opacity-100"
            aria-label="Xóa sticker"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
