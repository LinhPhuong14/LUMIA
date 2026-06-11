"use client";

import { useEffect, useState } from "react";

const durations = [5, 10, 15, 20, 30] as const;

export default function MeditationTimerPage() {
  const [minutes, setMinutes] = useState<number>(10);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      setRunning(false);
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => window.clearTimeout(t);
  }, [running, secondsLeft]);

  function start() {
    setSecondsLeft(minutes * 60);
    setRunning(true);
    fetch("/api/streak/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activityType: "timer" }),
    }).catch(() => null);
  }

  return (
    <main className="shell flex min-h-screen flex-col items-center justify-center py-14">
      <h1 className="font-serif text-4xl text-matcha-deep">Meditation Timer</h1>
      <div className="mt-8 flex gap-2">
        {durations.map((m) => (
          <button key={m} type="button" onClick={() => setMinutes(m)} className={`rounded-full px-4 py-2 ${minutes === m ? "bg-matcha text-white" : "bg-white"}`}>
            {m} phút
          </button>
        ))}
      </div>
      <div className="mt-12 font-serif text-6xl text-matcha-deep">
        {secondsLeft !== null ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}` : `${minutes}:00`}
      </div>
      <button type="button" onClick={start} className="button-primary mt-8">
        {running ? "Đang chạy..." : "Bắt đầu"}
      </button>
    </main>
  );
}
