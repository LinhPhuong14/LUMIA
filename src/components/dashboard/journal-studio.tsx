"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, Clock, FilePlus, Sparkles, Trash2 } from "lucide-react";

import { UpsellOverlay } from "@/components/ui/upsell-overlay";
import { cn } from "@/lib/utils";

type JournalEntry = {
  id: string;
  date: string;
  content: string;
  prompt_used?: string | null;
  meta?: { title?: string } | null;
  created_at?: string;
};

function getTitle(entry: JournalEntry) {
  if (entry.meta?.title?.trim()) return entry.meta.title.trim();
  const first = entry.content.trim().split("\n")[0] ?? "";
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

export function JournalStudio({ isActive = false }: { isActive?: boolean }) {
  const today = new Date().toISOString().slice(0, 10);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<"gallery" | "editor">("gallery");
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
      .then((list) => {
        setEntries(list);
      })
      .finally(() => setLoading(false));
  }, [loadEntries]);

  useEffect(() => {
    if (!isActive) return;
    fetch("/api/journal/prompts")
      .then((r) => r.json())
      .then((data: { all?: string[]; prompts?: string[] }) => {
        setPrompts(data.all ?? data.prompts ?? []);
      })
      .catch(() => null);
  }, [isActive]);

  function openEntry(entry: JournalEntry) {
    setActiveId(entry.id);
    setTitle(entry.meta?.title ?? "");
    setContent(entry.content);
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
            meta: { title },
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
  }, [title, content, activeId]);

  async function deleteEntry() {
    if (!activeId) return;
    const res = await fetch(`/api/journal?id=${activeId}`, { method: "DELETE" });
    if (!res.ok) return;
    const remaining = entries.filter((e) => e.id !== activeId);
    setEntries(remaining);
    setActiveId(null);
    setTitle("");
    setContent("");
    setDeleteConfirm(false);
    setView("gallery");
  }

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
        {/* Top bar */}
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

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                  <p
                    className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em]"
                    style={{ color: "var(--muted)" }}
                  >
                    {formatDateLabel(date)}
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {dayEntries.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => openEntry(entry)}
                        className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] p-4 cursor-pointer hover:border-[var(--green)]/40 hover:shadow-md transition text-left"
                      >
                        <p className="font-serif text-[15px] font-semibold text-[var(--foreground)] truncate">
                          {getTitle(entry)}
                        </p>
                        {entry.content.trim() && (
                          <p
                            className="text-[13px] mt-1 line-clamp-3"
                            style={{ color: "var(--muted)" }}
                          >
                            {entry.content.trim()}
                          </p>
                        )}
                        {entry.created_at && (
                          <p
                            className="mt-3 flex items-center gap-1 text-[11px]"
                            style={{ color: "var(--muted)" }}
                          >
                            <Clock className="h-3 w-3" />
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
      {/* New entry button */}
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

      {/* Entry list grouped by date */}
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
              <p
                className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ color: "var(--muted)" }}
              >
                {formatDate(date)}
              </p>
              {dayEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => openEntry(entry)}
                  className={cn(
                    "w-full rounded-xl px-3 py-2.5 text-left transition",
                    entry.id === activeId
                      ? "bg-[var(--green-wash)]"
                      : "hover:bg-[var(--surface-card)]",
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
                <span className="text-[14px] font-semibold" style={{ color: "var(--foreground)" }}>
                  Nhật ký
                </span>
                <button type="button" onClick={() => setSidebarOpen(false)}>
                  <ChevronLeft className="h-5 w-5" style={{ color: "var(--muted)" }} />
                </button>
              </div>
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Editor */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Toolbar */}
        <div
          className="flex shrink-0 items-center gap-2 border-b px-4 py-2.5"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          {/* Back to gallery button */}
          <button
            type="button"
            onClick={() => setView("gallery")}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-3 py-1.5 text-[13px] font-medium transition hover:text-[var(--foreground)]"
            style={{ color: "var(--muted)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Nhật ký
          </button>

          {/* Mobile sidebar toggle */}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-[var(--surface-card)] lg:hidden"
            style={{ color: "var(--muted)" }}
          >
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </button>

          <div className="flex-1" />

          {/* Save indicator */}
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

          {/* Delete */}
          {activeId && (
            deleteConfirm ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[12px]" style={{ color: "var(--muted)" }}>Xóa?</span>
                <button
                  type="button"
                  onClick={deleteEntry}
                  className="rounded-lg px-2.5 py-1 text-[12px] font-semibold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Xác nhận
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className="rounded-lg px-2.5 py-1 text-[12px]"
                  style={{ color: "var(--muted)" }}
                >
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

          {/* New entry (mobile) */}
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

        {/* Main editor area */}
        {activeId ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-2xl px-6 py-8 lg:px-8 lg:py-12">
              {/* Entry date */}
              {activeEntry && (
                <p className="mb-3 text-[11.5px]" style={{ color: "var(--muted)" }}>
                  {formatDate(activeEntry.date)}
                  {activeEntry.created_at && ` · ${formatTime(activeEntry.created_at)}`}
                </p>
              )}

              {/* Title */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề..."
                className="mb-4 w-full bg-transparent font-serif text-[26px] font-semibold leading-tight outline-none placeholder:opacity-30 lg:text-[30px]"
                style={{ color: "var(--foreground)" }}
              />

              {/* Content */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Bắt đầu viết... Hôm nay bạn cảm thấy thế nào?"
                className="min-h-[50vh] w-full resize-none bg-transparent text-[15px] leading-[1.85] outline-none placeholder:opacity-30"
                style={{ color: "var(--foreground)" }}
              />

              {/* Prompts */}
              {prompts.length > 0 && !content.trim() && (
                <div className="mt-8 border-t pt-6" style={{ borderColor: "var(--border)" }}>
                  <div className="mb-3 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" style={{ color: "var(--green)" }} />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--green)" }}>
                      Gợi ý hôm nay
                    </span>
                  </div>
                  <div className="space-y-2">
                    {prompts.slice(0, 3).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setContent(p + "\n")}
                        className="block w-full rounded-xl border px-4 py-3 text-left text-[13px] leading-relaxed transition hover:border-[var(--green)]/40 hover:bg-[var(--green-wash)]"
                        style={{ borderColor: "var(--border)", color: "var(--muted)" }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Empty state */
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
