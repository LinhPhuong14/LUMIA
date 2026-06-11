"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type Track = {
  id: string;
  title: string;
  description: string | null;
  duration_seconds: number | null;
};

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
  const [logged, setLogged] = useState(false);

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
      if (el.duration) setProgress((el.currentTime / el.duration) * 100);
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
    return () => el.removeEventListener("timeupdate", onTime);
  }, [url, logged]);

  if (!track) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-white/70 bg-white/95 p-5 shadow-[0_-12px_40px_rgba(143,168,120,0.12)] backdrop-blur-xl lg:bottom-4 lg:left-1/2 lg:max-w-lg lg:-translate-x-1/2 lg:rounded-[28px] lg:border">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-medium text-matcha-deep">{track.title}</div>
          <div className="text-[13px] text-muted">{track.description ?? "Đang phát"}</div>
        </div>
        <button type="button" onClick={onClose} aria-label="Đóng" className="rounded-full p-2 hover:bg-white/80">
          <X className="h-4 w-4" />
        </button>
      </div>

      {url ? (
        <audio ref={audioRef} src={url} loop={loop} className="mt-3 w-full" controls autoPlay />
      ) : (
        <p className="mt-3 text-sm text-muted">Đang tải...</p>
      )}

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-matcha-soft/40">
        <div className="h-full bg-matcha transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const el = audioRef.current;
            if (!el) return;
            if (playing) el.pause();
            else el.play();
            setPlaying(!playing);
          }}
          className="button-secondary px-4 py-2 text-[13px]"
        >
          {playing ? "Tạm dừng" : "Phát"}
        </button>
        <label className="flex items-center gap-2 text-[13px] text-muted">
          <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
          Lặp lại
        </label>
      </div>
    </div>
  );
}
