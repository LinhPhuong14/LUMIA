"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Pause, Play, Repeat, X } from "lucide-react";

import { BotanicalArtwork, CATEGORY_ACCENT } from "@/components/audio/botanical-artwork";
import { AUDIO_STOCK_QUERIES, PhotoImage } from "@/components/ui/photo-image";
import { GenerativeVisual } from "@/components/ui/generative-visual";

type Track = {
  id: string;
  title: string;
  description: string | null;
  duration_seconds: number | null;
  category?: string;
  accent_color?: string | null;
  thumbnail_url?: string | null;
};

function formatTime(seconds: number) {
  // Guard against Infinity/NaN — streamed WebM/Opus files report no duration,
  // which previously rendered as "Infinity:NaN".
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayerOverlay({
  track,
  onClose,
  onAccentChange,
}: {
  track: Track | null;
  onClose: () => void;
  onAccentChange?: (color: string | null) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loop, setLoop] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [logged, setLogged] = useState(false);

  const category = track?.category ?? "guided_meditation";
  const accentColor = track?.accent_color ?? CATEGORY_ACCENT[category] ?? "#8d9d76";
  const stockQuery = AUDIO_STOCK_QUERIES[category] ?? "forest morning light meditation";

  useEffect(() => {
    onAccentChange?.(track ? accentColor : null);
    return () => onAccentChange?.(null);
  }, [track, accentColor, onAccentChange]);

  useEffect(() => {
    if (track) document.body.classList.add("player-open");
    else document.body.classList.remove("player-open");
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
      // Only trust duration when it's a real finite number (streams report Infinity).
      if (Number.isFinite(el.duration) && el.duration > 0) {
        setProgress((el.currentTime / el.duration) * 100);
        setDuration(el.duration);
      }
      setCurrentTime(el.currentTime);
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

  const hasDuration = Number.isFinite(duration) && duration > 0;
  const totalLabel = hasDuration
    ? formatTime(duration)
    : track.duration_seconds
    ? formatTime(track.duration_seconds)
    : "∞";

  function togglePlay() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause();
    else void el.play();
  }

  function seek(e: MouseEvent<HTMLDivElement>) {
    const el = audioRef.current;
    if (!el || !Number.isFinite(el.duration) || el.duration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    el.currentTime = pct * el.duration;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Đóng trình phát"
        className="fixed inset-0 z-[65] bg-black/40 backdrop-blur-sm lg:hidden"
        onClick={onClose}
      />
      <div
        className="audio-player-overlay glass-overlay overflow-hidden rounded-t-[28px] lg:bottom-4 lg:left-1/2 lg:max-w-md lg:-translate-x-1/2 lg:rounded-[28px]"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        {/* Artwork */}
        <div className="relative h-[240px] w-full overflow-hidden">
          {track.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.thumbnail_url} alt={track.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <PhotoImage stockQuery={stockQuery} alt={track.title} overlay="dark" fill className="h-full w-full" />
          )}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to bottom, transparent 0%, ${accentColor}f0 100%)` }}
          />
          <GenerativeVisual
            seed={track.id}
            variant="wave"
            size={240}
            animated={playing}
            audioPlaying={playing}
            className="absolute inset-0 opacity-30"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="truncate text-[19px] font-semibold text-white">{track.title}</div>
            <div className="truncate text-[13px] text-white/75">{track.description ?? "Đang phát"}</div>
          </div>
        </div>

        {url ? (
          <audio
            ref={audioRef}
            src={url}
            loop={loop}
            className="sr-only"
            autoPlay
            onLoadStart={() => { setProgress(0); setCurrentTime(0); setDuration(0); setLogged(false); }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        ) : null}

        {/* Seekable progress bar */}
        <div className="px-5 pt-5">
          <div className="group cursor-pointer py-1.5" onClick={seek}>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--border)] transition-all group-hover:h-2">
              <div
                className="h-full rounded-full"
                style={{ width: `${progress}%`, background: accentColor }}
              />
            </div>
          </div>
          <div className="flex justify-between font-sans text-[12px] tabular-nums text-[var(--muted)]">
            <span>{formatTime(currentTime)}</span>
            <span>{totalLabel}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 px-5 pb-6 pt-3">
          <button
            type="button"
            onClick={() => setLoop((v) => !v)}
            aria-label="Lặp lại"
            aria-pressed={loop}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
              loop ? "text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
            style={loop ? { background: accentColor } : undefined}
          >
            <Repeat className="h-[18px] w-[18px]" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-[0_10px_24px_rgba(0,0,0,0.25)] transition hover:scale-105"
            style={{ background: accentColor }}
            aria-label={playing ? "Tạm dừng" : "Phát"}
          >
            {playing ? (
              <Pause className="h-6 w-6" fill="currentColor" />
            ) : (
              <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
            )}
          </button>

          {/* Spacer keeps the play button optically centered */}
          <div className="h-10 w-10" aria-hidden />
        </div>

        {!url ? <p className="px-5 pb-4 text-center text-sm text-[var(--muted)]">Đang tải...</p> : null}
      </div>
    </>
  );
}

export { BotanicalArtwork };
