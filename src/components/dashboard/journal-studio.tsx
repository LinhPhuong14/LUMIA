"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { TabPills } from "@/components/ui/tab-pills";
import { UpsellOverlay } from "@/components/ui/upsell-overlay";
import { MoodFace } from "@/components/ui/mood-faces";

type JournalTab = "release" | "journal" | "mood";

const tabs: { key: JournalTab; label: string }[] = [
  { key: "release", label: "Viết ra" },
  { key: "journal", label: "Nhật ký" },
  { key: "mood", label: "Mood" },
];

function hashToTab(hash: string): JournalTab {
  if (hash === "#journal" || hash === "#mood") return hash.slice(1) as JournalTab;
  return "release";
}

export function JournalStudio({ isActive = false }: { isActive?: boolean }) {
  const [tab, setTab] = useState<JournalTab>("release");
  const [focusMode, setFocusMode] = useState(false);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [promptUsed, setPromptUsed] = useState("");
  const [releaseText, setReleaseText] = useState("");
  const [journalText, setJournalText] = useState("");
  const [moodScore, setMoodScore] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [moodNote, setMoodNote] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [showSaved, setShowSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  const activeText = tab === "release" ? releaseText : journalText;
  const charCount = activeText.length;

  const syncHash = useCallback(() => {
    setTab(hashToTab(window.location.hash));
  }, []);

  useEffect(() => {
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [syncHash]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && focusMode) setFocusMode(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusMode]);

  useEffect(() => {
    if (!isActive) return;
    fetch("/api/journal/prompts")
      .then((r) => r.json())
      .then((data: { all?: string[]; prompts?: string[] }) => {
        const list = data.all ?? data.prompts ?? [];
        setPrompts(list);
        if (list[0]) setPromptUsed(list[0]);
      })
      .catch(() => null);

    const today = new Date().toISOString().slice(0, 10);
    fetch("/api/journal")
      .then((r) => r.json())
      .then((entries: { date: string; content: string }[]) => {
        const todayEntry = Array.isArray(entries) ? entries.find((e) => e.date === today) : null;
        if (todayEntry) setJournalText(todayEntry.content);
      })
      .catch(() => null);
  }, [isActive]);

  function switchTab(next: JournalTab) {
    window.location.hash = next === "release" ? "#release" : `#${next}`;
    setTab(next);
  }

  async function logStreak(type: string) {
    await fetch("/api/streak/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityType: type }),
    }).catch(() => null);
  }

  function flashSaved(msg: string) {
    setSavedMessage(msg);
    setShowSaved(true);
    window.setTimeout(() => setShowSaved(false), 2000);
    window.setTimeout(() => setSavedMessage(null), 2400);
  }

  async function saveRelease() {
    if (!releaseText.trim()) return;
    flashSaved("Bạn đã đặt cảm xúc này xuống một chút rồi.");
    setReleaseText("");
    await logStreak("journal");
  }

  async function saveJournal() {
    if (!journalText.trim()) return;
    setLoading(true);
    const response = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: journalText, promptUsed }),
    });
    setLoading(false);
    if (response.ok) flashSaved("Nhật ký hôm nay đã được lưu.");
  }

  async function saveMood() {
    setLoading(true);
    const response = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: moodScore, note: moodNote || undefined }),
    });
    setLoading(false);
    if (response.ok) {
      await logStreak("mood");
      flashSaved("Đã lưu cảm xúc.");
    }
  }

  function insertPrompt(prompt: string) {
    setPromptUsed(prompt);
    setJournalText((prev) => (prev ? `${prev}\n\n${prompt}\n` : `${prompt}\n`));
  }

  const editorClass =
    tab === "journal"
      ? "font-serif text-lg leading-[1.9]"
      : "font-sans text-lg leading-[1.9]";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col space-y-4 lg:space-y-6">
      <AnimatePresence>
        {showSaved ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed right-6 top-6 z-50 rounded-full bg-matcha-soft/90 px-4 py-2 text-[13px] text-matcha-deep backdrop-blur-sm"
          >
            ✓ Đã lưu
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        animate={{ opacity: focusMode ? 0 : 1, y: focusMode ? -20 : 0 }}
        transition={{ duration: 0.25 }}
        className={`sticky top-0 z-30 -mx-4 bg-gradient-to-b from-background via-background/95 to-transparent px-4 pb-3 pt-1 lg:static lg:mx-0 lg:bg-transparent lg:p-0 ${focusMode ? "pointer-events-none" : ""}`}
      >
        <TabPills
          fullWidth
          className="lg:!inline-flex lg:!w-auto"
          tabs={tabs.map((t) => ({ id: t.key, label: t.label }))}
          activeTab={tab}
          onChange={(id) => switchTab(id as JournalTab)}
        />
      </motion.div>

      {focusMode ? (
        <button
          type="button"
          onClick={() => setFocusMode(false)}
          className="fixed right-6 top-6 z-50 rounded-full bg-white/80 px-3 py-2 text-[13px] text-matcha-deep shadow-sm backdrop-blur-sm"
        >
          ← Thu nhỏ
        </button>
      ) : null}

      <div className={`journal-list space-y-4 lg:space-y-6 ${focusMode ? "fixed inset-0 z-40 bg-[#fffef8]/80 pt-16" : ""}`}>
        {tab === "release" ? (
          <motion.section
            layout
            className={`hero-card flex min-h-0 flex-1 flex-col p-5 lg:p-8 ${focusMode ? "mx-auto h-full max-w-4xl bg-transparent shadow-none" : ""}`}
          >
            {!focusMode ? <span className="eyebrow">Viết ra</span> : null}
            <textarea
              value={releaseText}
              onChange={(e) => {
                setReleaseText(e.target.value);
                setTyping(true);
                window.setTimeout(() => setTyping(false), 600);
              }}
              onFocus={() => setFocusMode(true)}
              className={`mt-4 min-h-0 flex-1 w-full resize-none rounded-[24px] border border-white/70 bg-white/84 p-5 outline-none lg:mt-6 lg:min-h-56 lg:rounded-[30px] lg:p-6 ${editorClass} ${focusMode ? "min-h-[70vh] border-none bg-transparent px-[10vw] lg:px-[15vw]" : ""}`}
              placeholder="Hôm nay có điều gì bạn muốn đặt xuống không?"
            />
            {focusMode ? (
              <motion.div
                animate={typing ? { scale: [1, 1.04, 1] } : {}}
                transition={{ duration: 1.5, repeat: typing ? Infinity : 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-muted"
              >
                {charCount} ký tự
              </motion.div>
            ) : null}
            {!focusMode ? (
              <div className="mt-4 flex items-center justify-between gap-4 lg:mt-6">
                {savedMessage ? <span className="text-sm text-matcha-deep">{savedMessage}</span> : <span />}
                <button type="button" onClick={saveRelease} disabled={loading} className="button-primary min-h-[44px] px-6">
                  Xả đi
                </button>
              </div>
            ) : (
              <div className="fixed bottom-20 right-6">
                <button type="button" onClick={saveRelease} className="button-primary px-6">
                  Xả đi
                </button>
              </div>
            )}
          </motion.section>
        ) : null}

        {tab === "journal" ? (
          <UpsellOverlay featureName="Nhật ký" description="Lưu nhật ký theo ngày với prompt gợi ý từ LUMIA." locked={!isActive}>
            <div className={`grid gap-6 ${focusMode ? "" : "lg:grid-cols-2"}`}>
              <motion.section layout className={`hero-card p-8 ${focusMode ? "fixed inset-0 z-40 bg-[#fffef8]/90 pt-16" : ""}`}>
                {!focusMode ? <span className="eyebrow">Nhật ký</span> : null}
                <textarea
                  value={journalText}
                  onChange={(e) => {
                    setJournalText(e.target.value);
                    setTyping(true);
                    window.setTimeout(() => setTyping(false), 600);
                  }}
                  onFocus={() => setFocusMode(true)}
                  className={`mt-6 min-h-56 w-full rounded-[30px] border border-white/70 bg-white/84 p-6 outline-none ${editorClass} ${focusMode ? "min-h-[70vh] border-none bg-transparent px-[10vw]" : ""}`}
                  placeholder="Bắt đầu viết..."
                />
                {focusMode ? (
                  <motion.div className="fixed bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-muted">
                    {journalText.length} ký tự
                  </motion.div>
                ) : null}
                <button
                  type="button"
                  onClick={saveJournal}
                  disabled={loading}
                  className={`button-primary mt-4 ${focusMode ? "fixed bottom-20 right-6" : ""}`}
                >
                  Lưu nhật ký
                </button>
              </motion.section>
              {!focusMode ? (
                <aside className="mobile-h-scroll -mx-1 gap-3 px-1 lg:mx-0 lg:grid lg:overflow-visible lg:px-0">
                  {prompts.map((prompt, index) => (
                    <motion.button
                      key={prompt}
                      type="button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => insertPrompt(prompt)}
                      className={`glass-card w-[min(72vw,260px)] shrink-0 p-5 text-left lg:w-auto ${promptUsed === prompt ? "ring-2 ring-matcha" : ""}`}
                    >
                      <p className="text-sm text-matcha-deep">{prompt}</p>
                    </motion.button>
                  ))}
                </aside>
              ) : null}
            </div>
          </UpsellOverlay>
        ) : null}

        {tab === "mood" ? (
          <UpsellOverlay featureName="Ghi nhận Mood" description="Theo dõi cảm xúc chi tiết hơn mỗi ngày." locked={!isActive}>
            <section className="glass-card p-8">
              <span className="eyebrow">Mood</span>
              <div className="mt-6 flex justify-between gap-2">
                {([1, 2, 3, 4, 5] as const).map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setMoodScore(score)}
                    className={`rounded-2xl p-2 transition hover:scale-110 ${moodScore === score ? "ring-2 ring-matcha bg-matcha-soft" : ""}`}
                  >
                    <MoodFace score={score} selected={moodScore === score} />
                  </button>
                ))}
              </div>
              <textarea
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                className="mt-6 min-h-28 w-full rounded-[30px] border border-white/70 bg-white/84 p-6 outline-none"
                placeholder="Ghi chú ngắn..."
              />
              <button type="button" onClick={saveMood} disabled={loading} className="button-primary mt-4">
                Lưu mood
              </button>
            </section>
          </UpsellOverlay>
        ) : null}

        {savedMessage && tab !== "release" && !focusMode ? (
          <p className="text-sm text-matcha-deep">{savedMessage}</p>
        ) : null}
      </div>
    </div>
  );
}
