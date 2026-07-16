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

// WebM recorded via MediaRecorder reports duration = Infinity, which disabled
// seeking. Fall back to the seekable range end so those tracks are seekable too.
function effectiveDuration(el: HTMLAudioElement): number {
  if (Number.isFinite(el.duration) && el.duration > 0) return el.duration;
  try {
    if (el.seekable && el.seekable.length > 0) {
      const end = el.seekable.end(el.seekable.length - 1);
      if (Number.isFinite(end) && end > 0) return end;
    }
  } catch {
    /* noop */
  }
  return 0;
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [detectedDur, setDetectedDur] = useState(0); // real duration (probed for Infinity webm)
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

  // Determine the REAL total duration, so we never show "∞". Prefer the DB value;
  // otherwise probe on a hidden element — for MediaRecorder WebM (duration=Infinity)
  // force an end-scan (seek to a huge time) to make the browser compute it.
  const dbDuration = track?.duration_seconds ?? 0;
  useEffect(() => {
    setDetectedDur(0);
    if (!url || (dbDuration && dbDuration > 0)) return;
    let cancelled = false;
    const probe = document.createElement("audio");
    probe.preload = "metadata";
    probe.muted = true;
    const cleanup = () => { probe.src = ""; try { probe.load(); } catch { /* noop */ } };
    probe.onloadedmetadata = () => {
      if (cancelled) return;
      if (Number.isFinite(probe.duration) && probe.duration > 0) { setDetectedDur(probe.duration); cleanup(); return; }
      probe.ondurationchange = () => {
        if (cancelled) return;
        if (Number.isFinite(probe.duration) && probe.duration > 0) { setDetectedDur(probe.duration); cleanup(); }
      };
      try { probe.currentTime = 1e101; } catch { cleanup(); }
    };
    probe.onerror = () => { if (!cancelled) cleanup(); };
    probe.src = url;
    return () => { cancelled = true; cleanup(); };
  }, [url, dbDuration]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !url) return;

    const onTime = () => {
      const dur = effectiveDuration(el);
      if (dur > 0) setDuration(dur);
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

  // Real total (never Infinity): DB value → probed → element duration.
  const total =
    (dbDuration && dbDuration > 0 ? dbDuration : 0) ||
    (detectedDur > 0 ? detectedDur : 0) ||
    (Number.isFinite(duration) && duration > 0 ? duration : 0);
  const progressPct = total > 0 ? Math.min(100, (currentTime / total) * 100) : 0;
  const remaining = total > 0 ? Math.max(0, total - currentTime) : 0;
  // Right label = remaining time (never the infinity symbol).
  const rightLabel = total > 0 ? `-${formatTime(remaining)}` : formatTime(currentTime);

  function togglePlay() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) el.pause();
    else void el.play();
  }

  function seek(e: MouseEvent<HTMLDivElement>) {
    const el = audioRef.current;
    if (!el || total <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    try { el.currentTime = pct * total; } catch { /* seek may be rejected mid-load */ }
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
        className="audio-player-overlay glass-overlay overflow-hidden rounded-t-[28px] lg:bottom-4 lg:left-auto lg:right-4 lg:w-[200px] lg:rounded-[24px] lg:shadow-2xl"
        style={{ paddingBottom: "var(--safe-bottom)" }}
      >
        {/* Artwork */}
        <div className="relative h-[150px] w-full overflow-hidden max-lg:h-[200px]">
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
            size={200}
            animated={playing}
            audioPlaying={playing}
            className="absolute inset-0 opacity-30"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-3 right-3">
            <div className="truncate text-[13px] font-semibold text-white">{track.title}</div>
          </div>
        </div>

        {url ? (
          <audio
            ref={audioRef}
            src={url}
            loop={loop}
            className="sr-only"
            autoPlay
            onLoadStart={() => { setCurrentTime(0); setDuration(0); setDetectedDur(0); setLogged(false); }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
        ) : null}

        {/* Seekable progress bar (click anywhere to jump) */}
        <div className="px-3 pt-3">
          <div className="group cursor-pointer py-1.5" onClick={seek} role="slider" aria-label="Tua" aria-valuenow={Math.round(progressPct)} aria-valuemin={0} aria-valuemax={100} tabIndex={0}>
            <div className="relative h-1.5 rounded-full bg-[var(--border)]">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${progressPct}%`, background: accentColor }}
              />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow ring-1 ring-black/10 transition-opacity group-hover:opacity-100"
                style={{ left: `${progressPct}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between font-sans text-[11px] tabular-nums text-[var(--muted)]">
            <span>{formatTime(currentTime)}</span>
            <span>{rightLabel}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 px-3 pb-4 pt-2">
          <button
            type="button"
            onClick={() => setLoop((v) => !v)}
            aria-label="Lặp lại"
            aria-pressed={loop}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
              loop ? "text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
            style={loop ? { background: accentColor } : undefined}
          >
            <Repeat className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_10px_24px_rgba(0,0,0,0.25)] transition hover:scale-105"
            style={{ background: accentColor }}
            aria-label={playing ? "Tạm dừng" : "Phát"}
          >
            {playing ? (
              <Pause className="h-5 w-5" fill="currentColor" />
            ) : (
              <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
            )}
          </button>

          {/* Spacer keeps the play button optically centered */}
          <div className="h-9 w-9" aria-hidden />
        </div>

        {!url ? <p className="px-3 pb-3 text-center text-[13px] text-[var(--muted)]">Đang tải...</p> : null}
      </div>
    </>
  );
}

export { BotanicalArtwork };
