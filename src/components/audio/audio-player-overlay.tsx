"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, X } from "lucide-react";

type Track = {
  id: string;
  title: string;
  description: string | null;
  duration_seconds: number | null;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayerOverlay({
  track,
  onClose,
}: {
  track: Track | null;
  onClose: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    if (track) {
      document.body.classList.add("player-open");
    } else {
      document.body.classList.remove("player-open");
    }
    return () => document.body.classList.remove("player-open");
  }, [track]);

  useEffect(() => {
    if (!track) {
      setUrl(null);
      return;
    }
    fetch(`/api/audio/${track.id}/url`)
      .then((r) => r.json())
      .then((data: { url?: string }) => setUrl(data.url ?? null))
      .catch(() => setUrl(null));
  }, [track]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !url) return;

    const onTime = () => {
      if (el.duration) {
        setProgress((el.currentTime / el.duration) * 100);
        setCurrentTime(el.currentTime);
        setDuration(el.duration);
      }
      if (!logged && el.currentTime >= 30) {
        setLogged(true);
        fetch("/api/streak/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activityType: "audio" }),
        }).catch(() => null);
      }
    };

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onTime);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onTime);
    };
  }, [url, logged]);

  if (!track) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Đóng trình phát"
        className="fixed inset-0 z-[65] bg-black/30 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      <div
        className="audio-player-overlay h-[320px] rounded-t-[28px] border border-white/70 bg-white/95 shadow-[0_-24px_80px_rgba(143,168,120,0.18)] backdrop-blur-xl lg:bottom-4 lg:left-1/2 lg:h-auto lg:max-w-lg lg:-translate-x-1/2 lg:rounded-[28px]"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <div className="mx-auto mb-3 mt-3 h-1 w-10 rounded-full bg-matcha-soft" />
        <div className="flex items-start gap-4 px-5">
          <div
            className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-matcha-soft to-matcha"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-matcha-deep">{track.title}</div>
            <div className="truncate text-[13px] text-muted">{track.description ?? "Đang phát"}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng" className="touch-target rounded-full p-2 hover:bg-matcha-soft/40">
            <X className="h-4 w-4" />
          </button>
        </div>

        {url ? <audio ref={audioRef} src={url} loop={loop} className="sr-only" autoPlay onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} /> : null}

        <div className="mt-5 px-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-matcha-soft">
            <div className="h-full bg-matcha-deep transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 flex justify-between font-mono text-sm text-muted">
            <span>{formatTime(currentTime)}</span>
            <span>{duration ? formatTime(duration) : track.duration_seconds ? formatTime(track.duration_seconds) : "—"}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 px-5 pb-5">
          <button
            type="button"
            onClick={() => {
              const el = audioRef.current;
              if (!el) return;
              if (playing) el.pause();
              else void el.play();
            }}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-matcha-deep text-white shadow-[0_12px_32px_rgba(125,143,104,0.35)]"
            aria-label={playing ? "Tạm dừng" : "Phát"}
          >
            {playing ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
          </button>
          <label className="flex items-center gap-2 text-[13px] text-muted">
            <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
            Lặp lại
          </label>
        </div>

        {!url ? <p className="px-5 pb-4 text-center text-sm text-muted">Đang tải...</p> : null}
      </div>
    </>
  );
}
