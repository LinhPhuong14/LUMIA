"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, History, Sparkles } from "lucide-react";

import { JournalHistory } from "@/components/dashboard/journal/journal-history";
import { JournalPageCanvas } from "@/components/dashboard/journal/journal-page-canvas";
import { JournalToolbar } from "@/components/dashboard/journal/journal-toolbar";
import {
  DEFAULT_JOURNAL_META,
  type JournalEntry,
  type JournalMeta,
  parseJournalMeta,
} from "@/components/dashboard/journal/journal-types";
import { UpsellOverlay } from "@/components/ui/upsell-overlay";
import { cn } from "@/lib/utils";

function newStickerId() {
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function JournalStudio({ isActive = false }: { isActive?: boolean }) {
  const today = new Date().toISOString().slice(0, 10);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeDate, setActiveDate] = useState<string>(today);
  const [content, setContent] = useState("");
  const [meta, setMeta] = useState<JournalMeta>({ ...DEFAULT_JOURNAL_META });
  const [promptUsed, setPromptUsed] = useState("");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [stickerMode, setStickerMode] = useState(false);

  const loadEntries = useCallback(async () => {
    if (!isActive) return [];
    const res = await fetch("/api/journal");
    if (!res.ok) return [];
    const data = (await res.json()) as JournalEntry[];
    return Array.isArray(data) ? data : [];
  }, [isActive]);

  const applyEntry = useCallback((entry: JournalEntry | null, date: string) => {
    setActiveDate(date);
    if (entry) {
      setContent(entry.content);
      setMeta(parseJournalMeta(entry.meta));
      setPromptUsed(entry.prompt_used ?? "");
    } else {
      setContent("");
      setMeta({ ...DEFAULT_JOURNAL_META, stickers: [] });
      setPromptUsed("");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadEntries()
      .then((list) => {
        setEntries(list);
        const todayEntry = list.find((e) => e.date === today);
        applyEntry(todayEntry ?? null, today);
      })
      .finally(() => setLoading(false));
  }, [applyEntry, loadEntries, today]);

  useEffect(() => {
    if (!isActive) return;
    fetch("/api/journal/prompts")
      .then((r) => r.json())
      .then((data: { all?: string[]; prompts?: string[] }) => {
        setPrompts(data.all ?? data.prompts ?? []);
      })
      .catch(() => null);
  }, [isActive]);

  function flashSaved() {
    setShowSaved(true);
    window.setTimeout(() => setShowSaved(false), 2200);
  }

  async function savePage() {
    if (!content.trim()) return;
    setSaving(true);
    const response = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        date: activeDate,
        promptUsed: promptUsed || undefined,
        meta,
      }),
    });
    setSaving(false);
    if (!response.ok) return;

    const saved = (await response.json()) as JournalEntry;

    // Optimistic update — replace or prepend the saved entry without full reload
    setEntries((prev) => {
      const exists = prev.some((e) => e.date === saved.date);
      if (exists) return prev.map((e) => (e.date === saved.date ? saved : e));
      return [saved, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1));
    });

    await fetch("/api/streak/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityType: "journal" }),
    }).catch(() => null);

    flashSaved();
  }

  function selectEntry(entry: JournalEntry) {
    applyEntry(entry, entry.date);
    setHistoryOpen(false);
  }

  function startToday() {
    applyEntry(null, today);
    setHistoryOpen(false);
  }

  function insertPrompt(prompt: string) {
    if (activeDate !== today && content.trim()) {
      const ok = window.confirm(
        `Bạn đang xem trang ngày ${activeDate}. Thêm gợi ý sẽ chỉnh sửa trang cũ này. Tiếp tục?`,
      );
      if (!ok) return;
    }
    setPromptUsed(prompt);
    setContent((prev) => (prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`));
  }

  function addSticker(emoji: string) {
    setMeta((m) => ({
      ...m,
      stickers: [
        ...m.stickers,
        {
          id: newStickerId(),
          emoji,
          x: 12 + Math.random() * 76,
          y: 18 + Math.random() * 55,
        },
      ],
    }));
  }

  const charCount = content.length;

  const studio = (
    <div className="journal-studio flex min-h-0 flex-1 flex-col gap-4 lg:gap-5">
      <AnimatePresence>
        {showSaved ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed right-6 top-20 z-50 rounded-full bg-[var(--green-wash)] px-4 py-2 text-[13px] font-medium text-[var(--green-deep)] shadow-sm backdrop-blur-sm md:top-6"
          >
            ✓ Đã lưu trang nhật ký
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setHistoryOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-[13px] font-semibold text-[var(--green-deep)]"
        >
          <History className="h-4 w-4" />
          {loading ? "Lịch sử" : `Lịch sử (${entries.length})`}
        </button>
        <span className="text-[12px] text-[var(--muted)]">{charCount} ký tự</span>
      </div>

      <div className="journal-studio-layout min-h-0 flex-1 gap-5 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <JournalHistory
            entries={entries}
            activeDate={activeDate}
            onSelect={selectEntry}
            onNewToday={startToday}
          />
        </div>

        <div className="flex min-h-0 min-w-0 flex-col gap-4">
          <JournalToolbar
            meta={meta}
            onMetaChange={(patch) => setMeta((m) => ({ ...m, ...patch }))}
            onAddSticker={addSticker}
            stickerMode={stickerMode}
            onToggleStickerMode={() => setStickerMode((v) => !v)}
          />

          {loading ? (
            <div className="journal-page flex min-h-[400px] items-center justify-center text-sm text-[var(--muted)]">
              Đang mở trang nhật ký…
            </div>
          ) : (
            <JournalPageCanvas
              content={content}
              onContentChange={setContent}
              meta={meta}
              onMetaChange={setMeta}
              promptUsed={promptUsed}
              activeDate={activeDate}
              placeholder="Hôm nay có điều gì bạn muốn đặt xuống không?"
            />
          )}

          {prompts.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                <Sparkles className="h-3.5 w-3.5" />
                Gợi ý
              </span>
              {prompts.slice(0, 4).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => insertPrompt(prompt)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12px] transition hover:border-[var(--green)]/40 hover:bg-[var(--green-wash)]",
                    promptUsed === prompt
                      ? "border-[var(--green)] bg-[var(--green-wash)] text-[var(--green-deep)]"
                      : "border-[var(--border)] bg-white/70 text-[var(--muted)]",
                  )}
                >
                  {prompt.length > 42 ? `${prompt.slice(0, 42)}…` : prompt}
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)]/50 pt-4">
            <p className="hidden text-[12px] text-[var(--muted)] lg:block">{charCount} ký tự</p>
            <div className="ml-auto flex gap-2">
              {activeDate !== today ? (
                <button type="button" onClick={startToday} className="button-secondary text-[13px]">
                  Về hôm nay
                </button>
              ) : null}
              <button
                type="button"
                onClick={savePage}
                disabled={saving || !content.trim()}
                className="button-primary min-h-[44px] px-6 disabled:opacity-50"
              >
                {saving ? "Đang lưu…" : "Lưu trang"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {historyOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Đóng lịch sử"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/25 backdrop-blur-sm lg:hidden"
              onClick={() => setHistoryOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="fixed inset-y-0 left-0 z-[70] flex w-[min(88vw,320px)] flex-col border-r border-[var(--border)] bg-[#fefdfb] p-5 shadow-2xl lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-serif text-lg text-[var(--foreground)]">Lịch sử</span>
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  className="rounded-full p-2 text-[var(--muted)] hover:bg-[var(--green-wash)]"
                  aria-label="Đóng"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
              <JournalHistory
                entries={entries}
                activeDate={activeDate}
                onSelect={selectEntry}
                onNewToday={startToday}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );

  if (!isActive) {
    return (
      <UpsellOverlay
        featureName="Nhật ký"
        description="Lưu từng trang theo ngày, trang trí bằng sticker và font - như một cuốn journal thật."
        locked
      >
        {studio}
      </UpsellOverlay>
    );
  }

  return studio;
}
