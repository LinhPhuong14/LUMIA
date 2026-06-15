"use client";

import { Palette, Sticker, Type } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  JOURNAL_COLORS,
  JOURNAL_FONTS,
  JOURNAL_STICKER_PACK,
  type JournalFontId,
  type JournalMeta,
} from "./journal-types";

export function JournalToolbar({
  meta,
  onMetaChange,
  onAddSticker,
  stickerMode,
  onToggleStickerMode,
}: {
  meta: JournalMeta;
  onMetaChange: (patch: Partial<JournalMeta>) => void;
  onAddSticker: (emoji: string) => void;
  stickerMode: boolean;
  onToggleStickerMode: () => void;
}) {
  return (
    <div className="journal-toolbar flex flex-wrap items-center gap-2 rounded-[18px] border border-[var(--border)]/80 bg-[var(--surface-card)]/90 px-3 py-2.5 backdrop-blur-md sm:gap-3 sm:px-4">
      <div className="flex items-center gap-1.5 border-r border-[var(--border)]/60 pr-2 sm:pr-3">
        <Type className="h-3.5 w-3.5 text-[var(--muted)]" aria-hidden />
        <div className="flex gap-1">
          {JOURNAL_FONTS.map((font) => (
            <button
              key={font.id}
              type="button"
              title={font.label}
              onClick={() => onMetaChange({ fontFamily: font.id as JournalFontId })}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] font-medium transition sm:text-[12px]",
                meta.fontFamily === font.id
                  ? "bg-[var(--green)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:bg-[var(--green-wash)] hover:text-[var(--green-deep)]",
                font.className,
              )}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 border-r border-[var(--border)]/60 pr-2 sm:pr-3">
        <Palette className="h-3.5 w-3.5 text-[var(--muted)]" aria-hidden />
        <div className="flex gap-1.5">
          {JOURNAL_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.label}
              onClick={() => onMetaChange({ textColor: c.value })}
              className={cn(
                "h-6 w-6 rounded-full border-2 transition hover:scale-110",
                meta.textColor === c.value ? "border-[var(--green-deep)] ring-2 ring-[var(--green)]/30" : "border-white/90",
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleStickerMode}
          className={cn(
            "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition sm:text-[12px]",
            stickerMode
              ? "bg-[var(--green-wash)] text-[var(--green-deep)] ring-1 ring-[var(--green)]/40"
              : "text-[var(--muted)] hover:bg-[var(--green-wash)]",
          )}
        >
          <Sticker className="h-3.5 w-3.5" />
          Sticker
        </button>
        {JOURNAL_STICKER_PACK.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onAddSticker(emoji)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-lg transition hover:scale-110 hover:bg-[var(--green-wash)]"
            title="Thêm sticker"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
