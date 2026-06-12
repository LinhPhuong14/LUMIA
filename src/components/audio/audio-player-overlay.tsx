"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, X } from "lucide-react";

import { BotanicalArtwork, CATEGORY_ACCENT } from "@/components/audio/botanical-artwork";
import { AUDIO_STOCK_QUERIES, PhotoImage } from "@/components/ui/photo-image";
import { GenerativeVisual } from "@/components/ui/generative-visual";
import { useIsClient } from "@/hooks/use-is-client";

type Track = {
  id: string;
  title: string;
  description: string | null;
  duration_seconds: number | null;
  category?: string;
  accent_color?: string | null;
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function WaveformBars({
  playing,
  accentColor,
  barCount = 64,
}: {
  playing: boolean;
  accentColor: string;
  barCount?: number;
}) {
  const isClient = useIsClient();
  const isMobile = isClient && window.innerWidth < 768;
  const count = isMobile ? 32 : barCount;

  return (
    <div className="flex h-12 items-end justify-center gap-0.5 px-4" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full ${playing ? "animate-waveform" : ""}`}
          style={{
            height: playing ? `${20 + (i % 5) * 12}%` : `${15 + (i % 3) * 8}%`,
            background: accentColor,
            opacity: 0.5 + (i % 4) * 0.1,
            animationDelay: `${(i % 8) * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
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
  const accentColor =
    track?.accent_color ?? CATEGORY_ACCENT[category] ?? "#8d9d76";
  const stockQuery = AUDIO_STOCK_QUERIES[category] ?? "forest morning light meditation";

  useEffect(() => {
    onAccentChange?.(track ? accentColor : null);
    return () => onAccentChange?.(null);
  }, [track, accentColor, onAccentChange]);

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
        className="audio-player-overlay glass-overlay overflow-hidden rounded-t-[28px] lg:bottom-4 lg:left-1/2 lg:max-w-lg lg:-translate-x-1/2 lg:rounded-[28px]"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        <div className="relative h-[200px] w-full overflow-hidden rounded-t-[28px]">
          {/* [REPLACE WITH CLIENT PHOTO: track artwork] */}
          <PhotoImage
            stockQuery={stockQuery}
            alt={track.title}
            overlay="dark"
            fill
            className="h-full w-full"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to bottom, transparent 0%, ${accentColor}e6 100%)`,
            }}
          />
          <GenerativeVisual
            seed={track.id}
            variant="wave"
            size={200}
            animated={playing}
            audioPlaying={playing}
            className="absolute inset-0 opacity-40"
          />
          <div className="absolute bottom-4 left-5 right-5">
            <div className="truncate font-medium text-white">{track.title}</div>
            <div className="truncate text-[13px] text-white/80">{track.description ?? "Đang phát"}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-4 top-4 touch-target rounded-full bg-black/20 p-2 text-white backdrop-blur-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {url ? (
          <audio
            ref={audioRef}
            src={url}
            loop={loop}
            className="sr-only"
            autoPlay
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        ) : null}

        <WaveformBars playing={playing} accentColor={accentColor} />

        <div className="px-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-matcha-soft">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: accentColor, height: 6 }}
            />
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
            className="glass-card-elevated flex h-16 w-16 items-center justify-center rounded-full text-matcha-deep"
            style={{ color: accentColor }}
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

export { BotanicalArtwork };
