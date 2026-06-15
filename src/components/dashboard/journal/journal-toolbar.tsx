"use client";

import { Check, ImagePlus, Palette, Save, Sticker, Type } from "lucide-react";
import { useRef, useEffect, useState } from "react";

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
  onAddImageSticker,
  stickerMode,
  onToggleStickerMode,
  onSave,
  saving,
  saved,
  canSave,
}: {
  meta: JournalMeta;
  onMetaChange: (patch: Partial<JournalMeta>) => void;
  onAddSticker: (emoji: string) => void;
  onAddImageSticker: (dataUrl: string) => void;
  stickerMode: boolean;
  onToggleStickerMode: () => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
  canSave: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.dataset.theme === "dark");
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result;
      if (typeof url === "string") onAddImageSticker(url);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="journal-toolbar flex flex-wrap items-center gap-2 rounded-[18px] border border-[var(--border)]/80 bg-[var(--surface-card)]/90 px-3 py-2.5 backdrop-blur-md sm:gap-3 sm:px-4">
      {/* Font picker */}
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

      {/* Color picker */}
      <div className="flex items-center gap-1.5 border-r border-[var(--border)]/60 pr-2 sm:pr-3">
        <Palette className="h-3.5 w-3.5 text-[var(--muted)]" aria-hidden />
        <div className="flex gap-1.5">
          {JOURNAL_COLORS.map((c) => {
            const colorVal = isDark ? c.dark : c.light;
            const isActive = meta.textColor === colorVal || meta.textColor === c.light || meta.textColor === c.dark;
            return (
              <button
                key={c.id}
                type="button"
                title={c.label}
                onClick={() => onMetaChange({ textColor: colorVal })}
                className={cn(
                  "h-6 w-6 rounded-full border-2 transition hover:scale-110",
                  isActive ? "border-[var(--green-deep)] ring-2 ring-[var(--green)]/30" : "border-[var(--border)]",
                )}
                style={{ backgroundColor: colorVal }}
              />
            );
          })}
          {/* Custom color */}
          <button
            type="button"
            title="Màu tùy chọn"
            onClick={() => colorInputRef.current?.click()}
            className="relative h-6 w-6 overflow-hidden rounded-full border-2 border-dashed border-[var(--muted)]/50 transition hover:scale-110 hover:border-[var(--green)]"
            style={
              !JOURNAL_COLORS.some((c) => meta.textColor === c.light || meta.textColor === c.dark || meta.textColor === "var(--journal-ink)")
                ? { backgroundColor: meta.textColor, borderStyle: "solid", borderColor: "var(--green-deep)" }
                : {}
            }
          >
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] text-[var(--muted)]">+</span>
          </button>
          <input
            ref={colorInputRef}
            type="color"
            className="sr-only"
            value={
              meta.textColor.startsWith("#") ? meta.textColor : isDark ? "#d4e8d0" : "#1e3b2d"
            }
            onChange={(e) => onMetaChange({ textColor: e.target.value })}
          />
        </div>
      </div>

      {/* Stickers */}
      <div className="flex flex-wrap items-center gap-1.5 border-r border-[var(--border)]/60 pr-2 sm:pr-3">
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

        {/* Image sticker upload */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title="Tải ảnh lên làm sticker"
          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-[var(--muted)] transition hover:bg-[var(--green-wash)] hover:text-[var(--green-deep)] sm:text-[12px]"
        >
          <ImagePlus className="h-3.5 w-3.5" />
          Ảnh
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Save button */}
      <button
        type="button"
        onClick={onSave}
        disabled={saving || !canSave}
        className={cn(
          "ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition disabled:opacity-40",
          saved
            ? "bg-[var(--green-wash)] text-[var(--green-deep)]"
            : "bg-[var(--green)] text-white hover:opacity-90",
        )}
      >
        {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
        {saving ? "Đang lưu…" : saved ? "Đã lưu" : "Lưu trang"}
      </button>
    </div>
  );
}
