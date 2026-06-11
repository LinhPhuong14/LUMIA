"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

const prompts = [
  "Điều gì khiến bạn mệt nhất hôm nay?",
  "Điều gì đã giúp bạn đi qua ngày hôm nay?",
  "Bạn đang cần điều gì mà chưa nói ra?",
  "Nếu dịu lại 1%, bạn sẽ làm gì trước?",
] as const;

type JournalMode = "release" | "journal" | "mood";

export function JournalStudio({
  initialMode = "release",
  isActive = false,
}: {
  initialMode?: JournalMode;
  isActive?: boolean;
}) {
  const [mode, setMode] = useState<JournalMode>(initialMode);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [releaseText, setReleaseText] = useState("");
  const [journalText, setJournalText] = useState("");
  const [moodNote, setMoodNote] = useState("");
  const [loading, setLoading] = useState(false);

  const particles = useMemo(() => Array.from({ length: 9 }), []);

  async function saveJournal(content: string, promptUsed?: string) {
    if (!isActive) return;
    setLoading(true);
    const response = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, promptUsed }),
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
      body: JSON.stringify({ score: intensity, note: moodNote || undefined }),
    });
    setLoading(false);
    if (response.ok) {
      setSavedMessage("Đã lưu cảm xúc hiện tại của bạn.");
      window.setTimeout(() => setSavedMessage(null), 2200);
    }
  }

  async function saveRelease() {
    if (!releaseText.trim()) return;
    if (isActive) {
      await saveJournal(releaseText, "Xả nhanh");
    } else {
      setSavedMessage("Bạn đã đặt cảm xúc này xuống một chút rồi.");
      window.setTimeout(() => setSavedMessage(null), 2200);
    }
    setReleaseText("");
  }

  return (
    <div className="space-y-6">
      {!isActive ? (
        <div className="rounded-[24px] border border-[#F4D878]/50 bg-[#FFFDF5] px-5 py-4 text-sm text-matcha-deep">
          Viết nhật ký đầy đủ cần hành trình active.{" "}
          <Link href="/boxes" className="font-semibold underline">
            Mua hộp LUMIA
          </Link>{" "}
          để mở khóa.
        </div>
      ) : null}

      <div className="inline-flex rounded-full border border-white/70 bg-white/84 p-1 shadow-sm">
        {[
          { key: "release", label: "Xả nhanh" },
          { key: "journal", label: "Nhật ký có gợi mở" },
          { key: "mood", label: "Ghi nhận cảm xúc" },
        ].map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setMode(item.key as JournalMode)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              mode === item.key ? "bg-matcha text-white" : "text-muted"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode === "release" ? (
        <section className="hero-card p-8">
          <span className="eyebrow">Xả nhanh</span>
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

      {mode === "journal" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="hero-card p-8">
            <span className="eyebrow">Nhật ký</span>
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              disabled={!isActive}
              className="mt-6 min-h-56 w-full rounded-[30px] border border-white/70 bg-white/84 p-6 text-base leading-8 outline-none disabled:opacity-50"
              placeholder="Bắt đầu viết..."
            />
            <button
              type="button"
              onClick={() => saveJournal(journalText, prompts[0])}
              disabled={!isActive || loading}
              className="button-primary mt-4 disabled:opacity-50"
            >
              Lưu nhật ký
            </button>
          </section>
          <aside className="grid gap-3">
            {prompts.map((prompt, index) => (
              <motion.article key={prompt} {...{ initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: index * 0.05 } }} className="soft-card p-5">
                <p className="text-sm text-matcha-deep">{prompt}</p>
              </motion.article>
            ))}
          </aside>
        </div>
      ) : null}

      {mode === "mood" ? (
        <section className="soft-card p-8">
          <span className="eyebrow">Ghi nhận cảm xúc</span>
          <div className="mt-6">
            <div className="flex justify-between text-sm text-muted">
              <span>Mức độ</span>
              <span>{intensity}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="mt-3 h-2 w-full"
            />
          </div>
          <textarea
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
            className="mt-6 min-h-28 w-full rounded-[30px] border border-white/70 bg-white/84 p-6 outline-none"
            placeholder="Ghi chú ngắn..."
          />
          <button type="button" onClick={saveMood} disabled={loading} className="button-primary mt-4">
            Lưu cảm xúc
          </button>
          {savedMessage ? <p className="mt-3 text-sm text-matcha-deep">{savedMessage}</p> : null}
        </section>
      ) : null}
    </div>
  );
}
