"use client";

import { useEffect, useState } from "react";

type Track = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  duration_seconds: number | null;
  is_free: boolean;
};

export function AudioLibrary({ category }: { category?: string }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = category ? `/api/audio?category=${category}` : "/api/audio";
    fetch(url)
      .then((r) => r.json())
      .then((data: Track[]) => setTracks(data))
      .catch(() => setTracks([]));
  }, [category]);

  async function playTrack(id: string) {
    const res = await fetch(`/api/audio/${id}/url`);
    const data = (await res.json()) as { url?: string };
    if (data.url) {
      setPlaying(id);
      setAudioUrl(data.url);
      await fetch("/api/streak/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityType: "audio" }),
      });
    }
  }

  return (
    <div className="space-y-4">
      {tracks.map((track) => (
        <article key={track.id} className="soft-card flex items-center justify-between gap-4 p-5">
          <div>
            <h3 className="font-medium text-matcha-deep">{track.title}</h3>
            <p className="text-sm text-muted">{track.description ?? track.category}</p>
            {track.is_free ? <span className="text-xs text-matcha">Miễn phí</span> : null}
          </div>
          <button type="button" onClick={() => playTrack(track.id)} className="button-secondary">
            {playing === track.id ? "Đang phát" : "Nghe"}
          </button>
        </article>
      ))}
      {audioUrl ? <audio src={audioUrl} controls autoPlay className="w-full" /> : null}
      {tracks.length === 0 ? <p className="text-sm text-muted">Chưa có track. Chạy POST /api/seed.</p> : null}
    </div>
  );
}
