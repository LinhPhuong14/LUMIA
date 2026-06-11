"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const durations = [5, 10, 15, 20, 30] as const;
const ambients = ["Không có", "Mưa", "Sóng biển", "Rừng", "White noise"] as const;

const ambientSlugMap: Record<(typeof ambients)[number], string | null> = {
  "Không có": null,
  Mưa: "rain",
  "Sóng biển": "ocean",
  Rừng: "forest",
  "White noise": "white-noise",
};

type TimerTrack = { id: string; description: string | null };

async function resolveTrackUrl(trackId: string): Promise<string | null> {
  const res = await fetch(`/api/audio/${trackId}/url`);
  const data = (await res.json()) as { url?: string | null };
  return data.url ?? null;
}

function findTrackBySlug(tracks: TimerTrack[], slug: string) {
  return tracks.find((t) => t.description?.includes(`slug:${slug}`));
}

function findTrackByTag(tracks: TimerTrack[], tag: string) {
  return tracks.find((t) => t.description?.includes(`tag:${tag}`));
}

export function MeditationTimer({ enabled = true }: { enabled?: boolean }) {
  const [minutes, setMinutes] = useState<number>(10);
  const [ambient, setAmbient] = useState<(typeof ambients)[number]>("Không có");
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [logged, setLogged] = useState(false);
  const [timerTracks, setTimerTracks] = useState<TimerTrack[]>([]);

  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const bellRef = useRef<HTMLAudioElement | null>(null);

  const totalSeconds = minutes * 60;
  const progress =
    secondsLeft !== null && totalSeconds > 0
      ? ((totalSeconds - secondsLeft) / totalSeconds) * 100
      : 0;

  useEffect(() => {
    if (!enabled) return;
    fetch("/api/audio?category=timer_ambient")
      .then((r) => r.json())
      .then((data: TimerTrack[]) => setTimerTracks(Array.isArray(data) ? data : []))
      .catch(() => setTimerTracks([]));
  }, [enabled]);

  const stopAmbient = useCallback(() => {
    const el = ambientRef.current;
    if (el) {
      el.pause();
      el.src = "";
      el.loop = false;
    }
  }, []);

  const stopBell = useCallback(() => {
    const el = bellRef.current;
    if (el) {
      el.pause();
      el.src = "";
    }
  }, []);

  const playBell = useCallback(
    async (tag: "bell-start" | "bell-end") => {
      const track = findTrackByTag(timerTracks, tag);
      if (!track) return;
      const url = await resolveTrackUrl(track.id);
      if (!url) return;
      stopBell();
      const audio = new Audio(url);
      bellRef.current = audio;
      audio.play().catch(() => null);
    },
    [timerTracks, stopBell],
  );

  const startAmbient = useCallback(async () => {
    const slug = ambientSlugMap[ambient];
    if (!slug) return;
    const track = findTrackBySlug(timerTracks, slug);
    if (!track) return;
    const url = await resolveTrackUrl(track.id);
    if (!url) return;
    stopAmbient();
    const audio = new Audio(url);
    audio.loop = true;
    ambientRef.current = audio;
    audio.play().catch(() => null);
  }, [ambient, timerTracks, stopAmbient]);

  useEffect(() => {
    return () => {
      stopAmbient();
      stopBell();
    };
  }, [stopAmbient, stopBell]);

  useEffect(() => {
    if (!running || secondsLeft === null) return;
    if (secondsLeft <= 0) {
      setRunning(false);
      stopAmbient();
      void playBell("bell-end");
      if (enabled && !logged) {
        setLogged(true);
        fetch("/api/streak/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activityType: "timer" }),
        }).catch(() => null);
      }
      return;
    }
    const t = window.setTimeout(() => setSecondsLeft(secondsLeft - 1), 1000);
    return () => window.clearTimeout(t);
  }, [running, secondsLeft, enabled, logged, stopAmbient, playBell]);

  useEffect(() => {
    if (running && secondsLeft === totalSeconds - 300 && enabled && !logged) {
      setLogged(true);
      fetch("/api/streak/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityType: "timer" }),
      }).catch(() => null);
    }
  }, [secondsLeft, running, totalSeconds, enabled, logged]);

  function handleStop() {
    setRunning(false);
    setSecondsLeft(null);
    setLogged(false);
    stopAmbient();
    stopBell();
  }

  async function handleStart() {
    setSecondsLeft(minutes * 60);
    setRunning(true);
    setLogged(false);
    await playBell("bell-start");
    if (ambient !== "Không có") {
      await startAmbient();
    }
  }

  if (!enabled) {
    return <div className="soft-card min-h-[300px] p-8" />;
  }

  if (running || secondsLeft !== null) {
    return (
      <div className="flex flex-col items-center py-10">
        <div className="relative flex h-56 w-56 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#DDE8D2" strokeWidth="4" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#8FA878"
              strokeWidth="4"
              strokeDasharray={`${progress * 2.83} 283`}
            />
          </svg>
          <span className="font-serif text-5xl text-matcha-deep">
            {secondsLeft !== null
              ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`
              : `${minutes}:00`}
          </span>
        </div>
        <p className="mt-4 text-sm text-muted">{ambient}</p>
        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => {
              const next = !running;
              setRunning(next);
              if (next) {
                void startAmbient();
              } else {
                stopAmbient();
              }
            }}
            className="button-secondary"
          >
            {running ? "Tạm dừng" : "Tiếp tục"}
          </button>
          <button type="button" onClick={handleStop} className="button-secondary">
            Dừng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="soft-card p-8">
      <span className="eyebrow">Chọn thời gian</span>
      <div className="mt-4 flex flex-wrap gap-2">
        {durations.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMinutes(m)}
            className={`rounded-full px-4 py-2 text-sm ${minutes === m ? "bg-matcha text-white" : "bg-white text-muted"}`}
          >
            {m} phút
          </button>
        ))}
      </div>

      <span className="eyebrow mt-8 block">Ambient sound</span>
      <div className="mt-4 flex flex-wrap gap-2">
        {ambients.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAmbient(a)}
            className={`rounded-full px-4 py-2 text-sm ${ambient === a ? "bg-matcha text-white" : "bg-white text-muted"}`}
          >
            {a}
          </button>
        ))}
      </div>

      <button type="button" onClick={() => void handleStart()} className="button-primary mt-8">
        Bắt đầu
      </button>
    </div>
  );
}
