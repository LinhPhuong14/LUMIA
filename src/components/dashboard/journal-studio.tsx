"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

import { UpsellOverlay } from "@/components/ui/upsell-overlay";

type JournalTab = "release" | "journal" | "mood";

const tabs: { key: JournalTab; label: string }[] = [
  { key: "release", label: "Viết ra" },
  { key: "journal", label: "Nhật ký" },
  { key: "mood", label: "Mood" },
];

const moodEmojis = ["😌", "😔", "😟", "😢", "😤"] as const;

function hashToTab(hash: string): JournalTab {
  if (hash === "#journal" || hash === "#mood") return hash.slice(1) as JournalTab;
  return "release";
}

export function JournalStudio({ isActive = false }: { isActive?: boolean }) {
  const [tab, setTab] = useState<JournalTab>("release");
  const [prompts, setPrompts] = useState<string[]>([]);
  const [promptUsed, setPromptUsed] = useState("");
  const [releaseText, setReleaseText] = useState("");
  const [journalText, setJournalText] = useState("");
  const [moodScore, setMoodScore] = useState(3);
  const [moodNote, setMoodNote] = useState("");
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const syncHash = useCallback(() => {
    setTab(hashToTab(window.location.hash));
  }, []);

  useEffect(() => {
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [syncHash]);

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

  async function saveRelease() {
    if (!releaseText.trim()) return;
    setSavedMessage("Bạn đã đặt cảm xúc này xuống một chút rồi.");
    setReleaseText("");
    await logStreak("journal");
    window.setTimeout(() => setSavedMessage(null), 2200);
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
    if (response.ok) {
      setSavedMessage("Nhật ký hôm nay đã được lưu.");
      window.setTimeout(() => setSavedMessage(null), 2200);
    }
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
      setSavedMessage("Đã lưu cảm xúc.");
      window.setTimeout(() => setSavedMessage(null), 2200);
    }
  }

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-full border border-white/70 bg-white/84 p-1 shadow-sm">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => switchTab(item.key)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              tab === item.key ? "bg-matcha text-white" : "text-muted"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "release" ? (
        <section className="hero-card p-8">
          <span className="eyebrow">Viết ra</span>
          <textarea
            value={releaseText}
            onChange={(e) => setReleaseText(e.target.value)}
            className="mt-6 min-h-56 w-full rounded-[30px] border border-white/70 bg-white/84 p-6 text-base leading-8 outline-none"
            placeholder="Hôm nay có điều gì bạn muốn đặt xuống không?"
          />
          <div className="mt-6 flex justify-between gap-4">
            {savedMessage ? <span className="text-sm text-matcha-deep">{savedMessage}</span> : <span />}
            <button type="button" onClick={saveRelease} disabled={loading} className="button-primary">
              Xả đi
            </button>
          </div>
        </section>
      ) : null}

      {tab === "journal" ? (
        <UpsellOverlay featureName="Nhật ký" description="Lưu nhật ký theo ngày với prompt gợi ý từ LUMIA." locked={!isActive}>
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="hero-card p-8">
              <span className="eyebrow">Nhật ký</span>
              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                className="mt-6 min-h-56 w-full rounded-[30px] border border-white/70 bg-white/84 p-6 text-base leading-8 outline-none"
                placeholder="Bắt đầu viết..."
              />
              <button type="button" onClick={saveJournal} disabled={loading} className="button-primary mt-4">
                Lưu nhật ký
              </button>
            </section>
            <aside className="grid gap-3">
              {prompts.map((prompt, index) => (
                <motion.button
                  key={prompt}
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setPromptUsed(prompt)}
                  className={`soft-card p-5 text-left ${promptUsed === prompt ? "ring-2 ring-matcha" : ""}`}
                >
                  <p className="text-sm text-matcha-deep">{prompt}</p>
                </motion.button>
              ))}
            </aside>
          </div>
        </UpsellOverlay>
      ) : null}

      {tab === "mood" ? (
        <UpsellOverlay featureName="Ghi nhận Mood" description="Theo dõi cảm xúc chi tiết hơn mỗi ngày." locked={!isActive}>
          <section className="soft-card p-8">
            <span className="eyebrow">Mood</span>
            <div className="mt-6 flex justify-between gap-2">
              {moodEmojis.map((emoji, i) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setMoodScore(i + 1)}
                  className={`flex-1 rounded-[20px] py-4 text-2xl transition ${
                    moodScore === i + 1 ? "bg-matcha-soft ring-2 ring-matcha" : "bg-white/80"
                  }`}
                >
                  {emoji}
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

      {savedMessage && tab !== "release" ? (
        <p className="text-sm text-matcha-deep">{savedMessage}</p>
      ) : null}
    </div>
  );
}
