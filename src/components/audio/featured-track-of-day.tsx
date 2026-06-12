"use client";

import { useEffect, useState } from "react";

import { AudioPlayerOverlay } from "@/components/audio/audio-player-overlay";

type Track = {
  id: string;
  title: string;
  description: string | null;
  duration_seconds: number | null;
};

function pickIndexForDate(tracks: Track[], date: string) {
  const hashCode = [...date].reduce((h, c) => Math.imul(31, h) + c.charCodeAt(0) | 0, 0);
  return Math.abs(hashCode) % tracks.length;
}

export function FeaturedTrackOfDay() {
  const [track, setTrack] = useState<Track | null>(null);
  const [playing, setPlaying] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audio?is_free=true")
      .then((r) => r.json())
      .then((tracks: Track[]) => {
        if (!Array.isArray(tracks) || tracks.length === 0) {
          setTrack(null);
          return;
        }
        const today = new Date().toISOString().slice(0, 10);
        setTrack(tracks[pickIndexForDate(tracks, today)] ?? null);
      })
      .catch(() => setTrack(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="dash-panel p-5 sm:p-6">
        <span className="eyebrow">Gợi ý hôm nay</span>
        <p className="mt-3 text-sm text-muted">Đang tải...</p>
      </section>
    );
  }

  if (!track) {
    return null;
  }

  return (
    <>
      <section className="dash-panel h-full p-5 sm:p-6">
        <span className="eyebrow">Gợi ý hôm nay</span>
        <h2 className="mt-3 font-sans text-lg font-medium text-matcha-text">{track.title}</h2>
        <p className="mt-2 text-sm text-muted">{track.description ?? "Track miễn phí cho buổi tối của bạn."}</p>
        <button type="button" onClick={() => setPlaying(track)} className="button-primary mt-5 text-[13px]">
          Nghe ngay
        </button>
      </section>
      <AudioPlayerOverlay track={playing} onClose={() => setPlaying(null)} />
    </>
  );
}
