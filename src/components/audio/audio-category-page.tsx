"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AudioPlayerOverlay } from "@/components/audio/audio-player-overlay";
import { UpsellOverlay } from "@/components/ui/upsell-overlay";

type Track = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  duration_seconds: number | null;
  is_free: boolean;
  locked?: boolean;
};

export function AudioCategoryPage({
  categories,
  sections,
  isActive,
}: {
  categories: string[];
  sections: { title: string; category: string; activeOnly?: boolean }[];
  isActive: boolean;
}) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playing, setPlaying] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = categories.join(",");
    fetch(`/api/audio?category=${query}`)
      .then((r) => r.json())
      .then((data: Track[]) => setTracks(Array.isArray(data) ? data : []))
      .catch(() => setTracks([]))
      .finally(() => setLoading(false));
  }, [categories]);

  function renderTrackCard(track: Track) {
    const locked = track.locked ?? (!isActive && !track.is_free);
    const card = (
      <button
        type="button"
        onClick={() => !locked && setPlaying(track)}
        disabled={locked}
        className={`soft-card w-full p-5 text-left transition ${locked ? "opacity-70" : "hover:shadow-lg"}`}
      >
        <div className="font-medium text-matcha-deep">{track.title}</div>
        <div className="mt-1 text-[12px] text-muted">{track.description ?? track.category}</div>
        {track.duration_seconds ? (
          <div className="mt-2 text-[11px] text-muted">
            {Math.round(track.duration_seconds / 60)} phút
          </div>
        ) : (
          <div className="mt-2 text-[11px] text-muted">∞ loop</div>
        )}
        {locked ? <span className="mt-2 inline-block text-[11px] text-matcha">Cần hộp LUMIA</span> : null}
      </button>
    );

    if (locked) {
      return (
        <div key={track.id} className="relative">
          <UpsellOverlay featureName={track.title} locked>
            {card}
          </UpsellOverlay>
        </div>
      );
    }
    return <div key={track.id}>{card}</div>;
  }

  if (loading) {
    return <p className="text-sm text-muted">Đang tải thư viện...</p>;
  }

  return (
    <>
      {sections.map((section) => {
        const sectionTracks = tracks.filter((t) => t.category === section.category);
        if (!sectionTracks.length && section.activeOnly && !isActive) {
          return (
            <UpsellOverlay key={section.title} featureName={section.title} locked={!isActive}>
              <section className="soft-card p-6">
                <h2 className="font-serif text-2xl text-matcha-deep">{section.title}</h2>
              </section>
            </UpsellOverlay>
          );
        }
        if (!sectionTracks.length) return null;

        const inner = (
          <section className="space-y-4">
            <h2 className="font-serif text-2xl text-matcha-deep">{section.title}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sectionTracks.map(renderTrackCard)}
            </div>
          </section>
        );

        if (section.activeOnly && !isActive) {
          return (
            <UpsellOverlay key={section.title} featureName={section.title} locked>
              {inner}
            </UpsellOverlay>
          );
        }
        return <div key={section.title}>{inner}</div>;
      })}

      {tracks.length === 0 ? (
        <p className="text-sm text-muted">Chưa có track. Chạy POST /api/seed.</p>
      ) : null}

      <AudioPlayerOverlay track={playing} onClose={() => setPlaying(null)} />
    </>
  );
}

export function AudioHubExtras({ isActive }: { isActive: boolean }) {
  const breathingSection = (
    <section className="soft-card p-6">
      <h2 className="font-serif text-2xl text-matcha-deep">Breathing & Timer</h2>
      <p className="mt-2 text-sm text-muted">Bài tập thở và hẹn giờ thiền.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/audio/breathing" className="button-secondary text-[13px]">
          Bài thở
        </Link>
        <Link href="/audio/timer" className="button-secondary text-[13px]">
          Timer
        </Link>
      </div>
    </section>
  );

  return (
    <UpsellOverlay featureName="Breathing & Timer" locked={!isActive}>
      {breathingSection}
    </UpsellOverlay>
  );
}
