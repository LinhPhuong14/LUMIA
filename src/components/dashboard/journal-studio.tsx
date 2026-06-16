"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, Bold, ChevronLeft, Clock, FilePlus, Highlighter,
  Italic, Palette, Smile, Trash2, Type, X as XIcon,
} from "lucide-react";

import { UpsellOverlay } from "@/components/ui/upsell-overlay";
import { cn } from "@/lib/utils";

type JournalEntry = {
  id: string;
  date: string;
  content: string;
  prompt_used?: string | null;
  meta?: { title?: string; stickers?: StickerItem[] } | null;
  created_at?: string;
};

type StickerItem = { id: string; emoji: string; imageUrl?: string; x: number; y: number; size: number };

const TEXT_COLORS = [
  { label: "Mặc định", value: "" },
  { label: "Xanh lá", value: "#4ade80" },
  { label: "Xanh dương", value: "#60a5fa" },
  { label: "Tím", value: "#c084fc" },
  { label: "Hồng", value: "#f472b6" },
  { label: "Cam", value: "#fb923c" },
  { label: "Đỏ", value: "#f87171" },
];

const HIGHLIGHT_COLORS = [
  { label: "Không", value: "" },
  { label: "Vàng", value: "#fef08a" },
  { label: "Xanh", value: "#bbf7d0" },
  { label: "Hồng", value: "#fce7f3" },
  { label: "Xanh dương", value: "#bfdbfe" },
  { label: "Tím", value: "#e9d5ff" },
];

const FONTS = [
  { label: "Mặc định", value: "" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Mono", value: "'Courier New', monospace" },
  { label: "Sans", value: "Arial, sans-serif" },
];

const STICKER_EMOJIS = [
  "🌸", "🌺", "🌻", "🌹", "🌷", "🌼",
  "🌙", "⭐", "🌟", "💫", "✨", "☀️",
  "🦋", "🐝", "🌈", "🎵", "🎶", "🎯",
  "❤️", "💚", "💙", "🧡", "💜", "🤍",
  "🍃", "🌿", "🍀", "🌱", "🌾", "🍂",
  "🎀", "🎁", "🎈", "🎊", "🎉", "🧸",
];

function getTitle(entry: JournalEntry) {
  if (entry.meta?.title?.trim()) return entry.meta.title.trim();
  const first = entry.content.replace(/<[^>]+>/g, "").trim().split("\n")[0] ?? "";
  return first.slice(0, 60) || "Ghi chú không tiêu đề";
}

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "long" });
}

function formatDateLabel(dateStr: string) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return "Hôm nay";
  if (dateStr === yesterday) return "Hôm qua";
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("vi-VN", { day: "numeric", month: "long" });
}

function formatTime(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function groupByDate(entries: JournalEntry[]) {
  const map = new Map<string, JournalEntry[]>();
  for (const e of entries) {
    const list = map.get(e.date) ?? [];
    list.push(e);
    map.set(e.date, list);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

function nanoid() {
  return Math.random().toString(36).slice(2, 10);
}

export function JournalStudio({ isActive = false }: { isActive?: boolean }) {
  const today = new Date().toISOString().slice(0, 10);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<"gallery" | "editor">("gallery");

  // Formatting toolbar state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  // Selection tooltip
  const [selTooltip, setSelTooltip] = useState<{ x: number; y: number } | null>(null);

  // Drag state for stickers
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, size: 0 });

  const editorRef = useRef<HTMLDivElement>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeEntry = entries.find((e) => e.id === activeId) ?? null;

  const loadEntries = useCallback(async () => {
    if (!isActive) return [];
    const res = await fetch("/api/journal");
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as JournalEntry[]) : [];
  }, [isActive]);

  useEffect(() => {
    setLoading(true);
    loadEntries()
      .then((list) => setEntries(list))
      .finally(() => setLoading(false));
  }, [loadEntries]);

  // Sync contenteditable content when entry changes
  useEffect(() => {
    if (editorRef.current && activeId) {
      editorRef.current.innerHTML = content;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  function openEntry(entry: JournalEntry) {
    setActiveId(entry.id);
    setTitle(entry.meta?.title ?? "");
    setContent(entry.content);
    setStickers(entry.meta?.stickers ?? []);
    setDeleteConfirm(false);
    setSidebarOpen(false);
    setView("editor");
  }

  async function createNewEntry() {
    setSaving(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: " ", date: today, meta: { title: "" } }),
      });
      if (!res.ok) return;
      const newEntry: JournalEntry = await res.json();
      setEntries((prev) => [newEntry, ...prev]);
      setActiveId(newEntry.id);
      setTitle("");
      setContent("");
      setStickers([]);
      setSidebarOpen(false);
      setView("editor");
    } finally {
      setSaving(false);
    }
  }

  // Auto-save with 1.5s debounce
  useEffect(() => {
    if (!activeId || (!title && !content)) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        const res = await fetch("/api/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: activeId,
            content: content || " ",
            date: activeEntry?.date ?? today,
            meta: { title, stickers },
          }),
        });
        if (res.ok) {
          const updated: JournalEntry = await res.json();
          setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
          setShowSaved(true);
          setTimeout(() => setShowSaved(false), 2000);
        }
      } finally {
        setSaving(false);
      }
    }, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, activeId, stickers]);

  async function deleteEntry() {
    if (!activeId) return;
    const res = await fetch(`/api/journal?id=${activeId}`, { method: "DELETE" });
    if (!res.ok) return;
    const remaining = entries.filter((e) => e.id !== activeId);
    setEntries(remaining);
    setActiveId(null);
    setTitle("");
    setContent("");
    setStickers([]);
    setDeleteConfirm(false);
    setView("gallery");
  }

  function execFmt(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value ?? undefined);
    if (editorRef.current) setContent(editorRef.current.innerHTML);
  }

  function insertSticker(emoji: string) {
    const wrapper = editorWrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    const x = 40 + Math.random() * (rect.width - 120);
    const y = 40 + Math.random() * 80;
    setStickers((prev) => [...prev, { id: nanoid(), emoji, x, y, size: 56 }]);
    setShowStickerPicker(false);
  }

  function insertImageSticker(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      const wrapper = editorWrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const x = 40 + Math.random() * (rect.width - 160);
      const y = 40 + Math.random() * 80;
      setStickers((prev) => [...prev, { id: nanoid(), emoji: "", imageUrl, x, y, size: 96 }]);
    };
    reader.readAsDataURL(file);
    setShowStickerPicker(false);
  }

  // Sticker drag
  function onStickerMouseDown(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    const wrapper = editorWrapperRef.current;
    if (!wrapper) return;
    const sticker = stickers.find((s) => s.id === id);
    if (!sticker) return;
    setDraggingId(id);
    setDragOffset({ x: e.clientX - sticker.x, y: e.clientY - sticker.y });
  }

  function onStickerResizeDown(e: React.MouseEvent, id: string, size: number) {
    e.preventDefault();
    e.stopPropagation();
    setResizingId(id);
    setResizeStart({ x: e.clientX, y: e.clientY, size });
  }

  useEffect(() => {
    if (!draggingId && !resizingId) return;
    function onMove(e: MouseEvent) {
      if (draggingId) {
        const wrapper = editorWrapperRef.current;
        if (!wrapper) return;
        const rect = wrapper.getBoundingClientRect();
        const nx = Math.max(0, Math.min(e.clientX - dragOffset.x, rect.width - 80));
        const ny = Math.max(0, e.clientY - dragOffset.y);
        setStickers((prev) => prev.map((s) => s.id === draggingId ? { ...s, x: nx, y: ny } : s));
      }
      if (resizingId) {
        const delta = e.clientX - resizeStart.x + (e.clientY - resizeStart.y);
        const newSize = Math.max(24, Math.min(120, resizeStart.size + delta * 0.5));
        setStickers((prev) => prev.map((s) => s.id === resizingId ? { ...s, size: newSize } : s));
      }
    }
    function onUp() {
      setDraggingId(null);
      setResizingId(null);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [draggingId, dragOffset, resizingId, resizeStart]);

  // Selection tooltip
  useEffect(() => {
    function onSelChange() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount || !editorRef.current) {
        setSelTooltip(null);
        return;
      }
      if (!editorRef.current.contains(sel.anchorNode)) {
        setSelTooltip(null);
        return;
      }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const wrapperRect = editorWrapperRef.current?.getBoundingClientRect();
      if (!wrapperRect) return;
      setSelTooltip({ x: rect.left - wrapperRect.left + rect.width / 2, y: rect.top - wrapperRect.top - 8 });
    }
    document.addEventListener("selectionchange", onSelChange);
    return () => document.removeEventListener("selectionchange", onSelChange);
  }, []);

  const grouped = groupByDate(entries);

  if (!isActive) {
    return (
      <div className="relative flex min-h-[400px] flex-col items-center justify-center">
        <UpsellOverlay featureName="Nhật ký" description="Mở khóa nhật ký với gói Premium" />
      </div>
    );
  }

  // ── GALLERY VIEW ──────────────────────────────────────────────────────────
  if (view === "gallery") {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div
          className="flex shrink-0 items-center justify-between border-b px-4 py-3"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <h2 className="font-serif text-[18px] font-semibold" style={{ color: "var(--foreground)" }}>
            Nhật ký
          </h2>
          <button
            type="button"
            onClick={createNewEntry}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90"
            style={{ background: "var(--green)" }}
          >
            <FilePlus className="h-3.5 w-3.5" />
            Viết mới
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 animate-pulse rounded-[20px] bg-[var(--surface)]" />
              ))}
            </div>
          ) : grouped.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
              <span className="text-5xl">✍️</span>
              <p className="text-[15px] font-medium" style={{ color: "var(--foreground)" }}>
                Chưa có nhật ký nào
              </p>
              <button
                type="button"
                onClick={createNewEntry}
                disabled={saving}
                className="mt-1 flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90"
                style={{ background: "var(--green)" }}
              >
                <FilePlus className="h-4 w-4" />
                Viết nhật ký đầu tiên
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {grouped.map(([date, dayEntries]) => (
                <div key={date}>
                  <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--muted)" }}>
                    {formatDateLabel(date)}
                  </p>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                    {dayEntries.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => openEntry(entry)}
                        className="cursor-pointer rounded-[22px] border border-[var(--border)] bg-[var(--surface-card)] p-4 text-left transition active:scale-[0.98] hover:border-[var(--green)]/40 hover:shadow-md"
                        style={{ minHeight: 120 }}
                      >
                        <p className="mb-2 truncate font-serif text-[15px] font-semibold leading-snug text-[var(--foreground)]">
                          {getTitle(entry)}
                        </p>
                        {entry.content.trim() && (
                          <p className="line-clamp-3 text-[12.5px] leading-relaxed" style={{ color: "var(--muted)" }}
                            dangerouslySetInnerHTML={{ __html: entry.content.replace(/<[^>]+>/g, " ").trim() }}
                          />
                        )}
                        {entry.created_at && (
                          <p className="mt-3 flex items-center gap-1 text-[10.5px]" style={{ color: "var(--muted)" }}>
                            <Clock className="h-2.5 w-2.5" />
                            {formatTime(entry.created_at)}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── EDITOR VIEW ───────────────────────────────────────────────────────────
  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 p-4">
        <button
          type="button"
          onClick={createNewEntry}
          disabled={saving}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition hover:bg-[var(--green-wash)]"
          style={{ color: "var(--green-deep)" }}
        >
          <FilePlus className="h-4 w-4" />
          Thêm ghi chú mới
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        {loading ? (
          <div className="space-y-2 px-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-[var(--surface)]" />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <p className="px-4 py-6 text-center text-[13px]" style={{ color: "var(--muted)" }}>
            Chưa có ghi chú nào.
          </p>
        ) : (
          grouped.map(([date, dayEntries]) => (
            <div key={date} className="mb-3">
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--muted)" }}>
                {formatDate(date)}
              </p>
              {dayEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => openEntry(entry)}
                  className={cn(
                    "w-full rounded-xl px-3 py-2.5 text-left transition",
                    entry.id === activeId ? "bg-[var(--green-wash)]" : "hover:bg-[var(--surface-card)]",
                  )}
                >
                  <p
                    className="truncate text-[13px] font-medium leading-snug"
                    style={{ color: entry.id === activeId ? "var(--green-deep)" : "var(--foreground)" }}
                  >
                    {getTitle(entry)}
                  </p>
                  {entry.created_at && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px]" style={{ color: "var(--muted)" }}>
                      <Clock className="h-2.5 w-2.5" />
                      {formatTime(entry.created_at)}
                    </p>
                  )}
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-1">
      {/* Desktop sidebar */}
      <aside
        className="hidden w-64 shrink-0 flex-col border-r lg:flex"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        {SidebarContent}
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 left-0 z-50 w-72 shadow-2xl lg:hidden"
              style={{ background: "var(--surface)" }}
            >
              <div className="flex items-center justify-between border-b px-4 py-3.5" style={{ borderColor: "var(--border)" }}>
                <span className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>Nhật ký</span>
                <button type="button" onClick={() => setSidebarOpen(false)}>
                  <ChevronLeft className="h-5 w-5" style={{ color: "var(--muted)" }} />
                </button>
              </div>
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Editor column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Nav toolbar */}
        <div
          className="flex shrink-0 items-center gap-2 border-b px-4 py-2.5"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <button
            type="button"
            onClick={() => setView("gallery")}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-3 py-1.5 text-[13px] font-medium transition hover:text-[var(--foreground)]"
            style={{ color: "var(--muted)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Nhật ký
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[var(--surface-card)] lg:hidden"
            style={{ color: "var(--muted)" }}
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </button>

          <div className="flex-1" />

          <AnimatePresence>
            {(saving || showSaved) && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[12px]"
                style={{ color: "var(--muted)" }}
              >
                {saving ? "Đang lưu..." : "✓ Đã lưu"}
              </motion.span>
            )}
          </AnimatePresence>

          {activeId && (
            deleteConfirm ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[12px]" style={{ color: "var(--muted)" }}>Xóa?</span>
                <button type="button" onClick={deleteEntry} className="rounded-lg px-2.5 py-1 text-[12px] font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30">
                  Xác nhận
                </button>
                <button type="button" onClick={() => setDeleteConfirm(false)} className="rounded-lg px-2.5 py-1 text-[12px]" style={{ color: "var(--muted)" }}>
                  Hủy
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDeleteConfirm(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-red-50 dark:hover:bg-red-950/30"
                style={{ color: "var(--muted)" }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )
          )}

          <button
            type="button"
            onClick={createNewEntry}
            disabled={saving}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-semibold transition hover:bg-[var(--green-wash)] lg:hidden"
            style={{ color: "var(--green-deep)" }}
          >
            <FilePlus className="h-3.5 w-3.5" />
            Mới
          </button>
        </div>

        {/* Rich-text formatting toolbar */}
        {activeId && (
          <div
            className="relative flex shrink-0 flex-wrap items-center gap-1 border-b px-3 py-1.5"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            {/* Bold */}
            <button type="button" onClick={() => execFmt("bold")} title="Đậm (Ctrl+B)"
              className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-[var(--surface-card)]"
              style={{ color: "var(--foreground)" }}>
              <Bold className="h-3.5 w-3.5" />
            </button>

            {/* Italic */}
            <button type="button" onClick={() => execFmt("italic")} title="Nghiêng (Ctrl+I)"
              className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-[var(--surface-card)]"
              style={{ color: "var(--foreground)" }}>
              <Italic className="h-3.5 w-3.5" />
            </button>

            <div className="mx-0.5 h-4 w-px bg-[var(--border)]" />

            {/* Text color */}
            <div className="relative">
              <button type="button" onClick={() => { setShowColorPicker((v) => !v); setShowHighlightPicker(false); setShowFontPicker(false); setShowStickerPicker(false); }}
                className="flex h-7 items-center gap-1 rounded-md px-1.5 transition hover:bg-[var(--surface-card)]" title="Màu chữ"
                style={{ color: "var(--foreground)" }}>
                <Palette className="h-3.5 w-3.5" />
                <span className="text-[11px] font-medium">A</span>
              </button>
              {showColorPicker && (
                <div className="absolute left-0 top-8 z-30 flex flex-col gap-1 rounded-[14px] border border-[var(--border)] bg-[var(--surface-card)] p-2 shadow-lg">
                  {TEXT_COLORS.map((c) => (
                    <button key={c.value} type="button"
                      onClick={() => { execFmt("foreColor", c.value || "inherit"); setShowColorPicker(false); }}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] transition hover:bg-[var(--surface)]"
                      style={{ color: c.value || "var(--foreground)" }}>
                      <span className="h-3 w-3 rounded-full border border-[var(--border)]" style={{ background: c.value || "var(--foreground)" }} />
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Highlight */}
            <div className="relative">
              <button type="button" onClick={() => { setShowHighlightPicker((v) => !v); setShowColorPicker(false); setShowFontPicker(false); setShowStickerPicker(false); }}
                className="flex h-7 items-center gap-1 rounded-md px-1.5 transition hover:bg-[var(--surface-card)]" title="Tô sáng"
                style={{ color: "var(--foreground)" }}>
                <Highlighter className="h-3.5 w-3.5" />
              </button>
              {showHighlightPicker && (
                <div className="absolute left-0 top-8 z-30 flex flex-col gap-1 rounded-[14px] border border-[var(--border)] bg-[var(--surface-card)] p-2 shadow-lg">
                  {HIGHLIGHT_COLORS.map((c) => (
                    <button key={c.value} type="button"
                      onClick={() => { execFmt("hiliteColor", c.value || "transparent"); setShowHighlightPicker(false); }}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12px] transition hover:bg-[var(--surface)]"
                      style={{ color: "var(--foreground)" }}>
                      <span className="h-3 w-3 rounded-sm border border-[var(--border)]" style={{ background: c.value || "transparent" }} />
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Font */}
            <div className="relative">
              <button type="button" onClick={() => { setShowFontPicker((v) => !v); setShowColorPicker(false); setShowHighlightPicker(false); setShowStickerPicker(false); }}
                className="flex h-7 items-center gap-1 rounded-md px-1.5 transition hover:bg-[var(--surface-card)]" title="Phông chữ"
                style={{ color: "var(--foreground)" }}>
                <Type className="h-3.5 w-3.5" />
              </button>
              {showFontPicker && (
                <div className="absolute left-0 top-8 z-30 flex flex-col gap-1 rounded-[14px] border border-[var(--border)] bg-[var(--surface-card)] p-2 shadow-lg">
                  {FONTS.map((f) => (
                    <button key={f.value} type="button"
                      onClick={() => { execFmt("fontName", f.value || "inherit"); setShowFontPicker(false); }}
                      className="rounded-lg px-3 py-1.5 text-left text-[13px] transition hover:bg-[var(--surface)]"
                      style={{ fontFamily: f.value || "inherit", color: "var(--foreground)" }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mx-0.5 h-4 w-px bg-[var(--border)]" />

            {/* Sticker picker */}
            <div className="relative">
              <button type="button" onClick={() => { setShowStickerPicker((v) => !v); setShowColorPicker(false); setShowHighlightPicker(false); setShowFontPicker(false); }}
                className="flex h-7 items-center gap-1 rounded-md px-1.5 transition hover:bg-[var(--surface-card)]" title="Sticker"
                style={{ color: "var(--foreground)" }}>
                <Smile className="h-3.5 w-3.5" />
                <span className="text-[11px]">Sticker</span>
              </button>
              {showStickerPicker && (
                <div className="absolute left-0 top-8 z-30 rounded-[14px] border border-[var(--border)] bg-[var(--surface-card)] p-3 shadow-lg">
                  <div className="grid grid-cols-6 gap-1">
                    {STICKER_EMOJIS.map((emoji) => (
                      <button key={emoji} type="button" onClick={() => insertSticker(emoji)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition hover:bg-[var(--green-wash)] hover:scale-110">
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="mt-2 w-full rounded-lg border border-dashed border-[var(--border)] py-1.5 text-[11px] font-medium text-[var(--muted)] transition hover:border-[var(--green)] hover:text-[var(--green-deep)]"
                  >
                    + Upload ảnh
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) insertImageSticker(f); e.target.value = ""; }}
                  />
                </div>
              )}
            </div>

            {/* Click outside to close popovers */}
            {(showColorPicker || showHighlightPicker || showFontPicker || showStickerPicker) && (
              <div className="fixed inset-0 z-20" onClick={() => { setShowColorPicker(false); setShowHighlightPicker(false); setShowFontPicker(false); setShowStickerPicker(false); }} />
            )}
          </div>
        )}

        {/* Main editor area */}
        {activeId ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div ref={editorWrapperRef} className="relative mx-auto max-w-2xl px-6 py-8 lg:px-8 lg:py-12">
              {/* Selection tooltip */}
              {selTooltip && (
                <div
                  className="pointer-events-auto absolute z-50 flex items-center gap-1 rounded-[10px] border border-[var(--border)] bg-[var(--surface-card)] p-1 shadow-xl"
                  style={{ left: selTooltip.x, top: selTooltip.y, transform: "translate(-50%, -100%)" }}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <button type="button" onClick={() => execFmt("bold")} className="flex h-6 w-6 items-center justify-center rounded-md text-[12px] font-bold hover:bg-[var(--surface)] text-[var(--foreground)]">B</button>
                  <button type="button" onClick={() => execFmt("italic")} className="flex h-6 w-6 items-center justify-center rounded-md text-[12px] italic hover:bg-[var(--surface)] text-[var(--foreground)]">I</button>
                  <div className="mx-0.5 h-3 w-px bg-[var(--border)]" />
                  {TEXT_COLORS.slice(1).map((c) => (
                    <button key={c.value} type="button" onClick={() => execFmt("foreColor", c.value)} className="h-4 w-4 rounded-full border border-[var(--border)]" style={{ background: c.value }} title={c.label} />
                  ))}
                  <div className="mx-0.5 h-3 w-px bg-[var(--border)]" />
                  {HIGHLIGHT_COLORS.slice(1).map((c) => (
                    <button key={c.value} type="button" onClick={() => execFmt("hiliteColor", c.value)} className="h-4 w-4 rounded-sm border border-[var(--border)]" style={{ background: c.value }} title={c.label} />
                  ))}
                </div>
              )}

              {/* Floating stickers */}
              {stickers.map((s) => (
                <div
                  key={s.id}
                  className="absolute select-none group"
                  style={{ left: s.x, top: s.y, zIndex: 10, cursor: draggingId === s.id ? "grabbing" : "grab" }}
                  onMouseDown={(e) => onStickerMouseDown(e, s.id)}
                >
                  {s.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.imageUrl} alt="sticker" style={{ width: s.size, height: s.size, objectFit: "contain", display: "block" }} draggable={false} />
                  ) : (
                    <span style={{ fontSize: s.size, lineHeight: 1, display: "block" }}>{s.emoji}</span>
                  )}
                  {/* Delete button */}
                  <button
                    type="button"
                    className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 hover:opacity-100"
                    style={{ fontSize: 10 }}
                    onClick={(e) => { e.stopPropagation(); setStickers((prev) => prev.filter((x) => x.id !== s.id)); }}
                  >
                    <XIcon className="h-2.5 w-2.5" />
                  </button>
                  {/* Resize handle */}
                  <div
                    className="absolute -bottom-1 -right-1 h-3 w-3 cursor-se-resize rounded-sm bg-[var(--green)] opacity-60"
                    onMouseDown={(e) => onStickerResizeDown(e, s.id, s.size)}
                  />
                </div>
              ))}

              {activeEntry && (
                <p className="mb-3 text-[11.5px]" style={{ color: "var(--muted)" }}>
                  {formatDate(activeEntry.date)}
                  {activeEntry.created_at && ` · ${formatTime(activeEntry.created_at)}`}
                </p>
              )}

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề..."
                className="mb-4 w-full bg-transparent font-serif text-[26px] font-semibold leading-tight outline-none placeholder:opacity-30 lg:text-[30px]"
                style={{ color: "var(--foreground)" }}
              />

              {/* Rich contenteditable editor */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                data-placeholder="Bắt đầu viết... Hôm nay bạn cảm thấy thế nào?"
                className="min-h-[50vh] w-full text-[15px] leading-[1.85] outline-none empty:before:pointer-events-none empty:before:opacity-30 empty:before:content-[attr(data-placeholder)]"
                style={{ color: "var(--foreground)" }}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="text-5xl opacity-20">📝</span>
            <p className="text-[15px] font-medium" style={{ color: "var(--foreground)" }}>
              Chưa có ghi chú nào
            </p>
            <p className="text-[13px]" style={{ color: "var(--muted)" }}>
              Bắt đầu ngày mới với một trang nhật ký.
            </p>
            <button
              type="button"
              onClick={createNewEntry}
              disabled={saving}
              className="mt-2 flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90"
              style={{ background: "var(--green)" }}
            >
              <FilePlus className="h-4 w-4" />
              Tạo ghi chú đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
