"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { AudioPlayerOverlay } from "@/components/audio/audio-player-overlay";
import { BotanicalArtwork, CATEGORY_ACCENT } from "@/components/audio/botanical-artwork";
import { AUDIO_STOCK_QUERIES, PhotoImage } from "@/components/ui/photo-image";
import { EmptyState } from "@/components/ui/empty-state";
import { UpsellOverlay } from "@/components/ui/upsell-overlay";
import { staggerContainer, staggerItem } from "@/lib/motion-variants";

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
    const isPlaying = playing?.id === track.id;
    const stockQuery = AUDIO_STOCK_QUERIES[track.category] ?? "calm wellness";
    const accent = CATEGORY_ACCENT[track.category] ?? "#8d9d76";

    const card = (
      <motion.button
        type="button"
        variants={staggerItem}
        onClick={() => !locked && setPlaying(track)}
        disabled={locked}
        whileHover={locked ? undefined : { y: -2 }}
        className={`glass-card group w-full overflow-hidden p-0 text-left transition ${locked ? "opacity-70" : ""}`}
      >
        <div className="relative h-20 overflow-hidden">
          {/* [REPLACE WITH CLIENT PHOTO: track artwork for {track.category}] */}
          <PhotoImage
            stockQuery={stockQuery}
            alt={track.title}
            overlay="dark"
            overlayOpacity={0.4}
            fill
            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background: `linear-gradient(to top, ${accent}cc, transparent)`,
              maskImage: "linear-gradient(to bottom, black 40%, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent)",
            }}
          />
          {track.duration_seconds ? (
            <span className="glass-card absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-[10px] text-white">
              {Math.round(track.duration_seconds / 60)} phút
            </span>
          ) : (
            <span className="glass-card absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-[10px] text-white">
              ∞ loop
            </span>
          )}
          {locked ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
              <BotanicalArtwork category={track.category} />
            </div>
          ) : null}
          {isPlaying ? (
            <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-white/80">
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="inline-block h-3 w-0.5 animate-waveform bg-white" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
            </div>
          ) : null}
        </div>
        <div className="p-4">
          <div className="font-medium text-matcha-deep">{track.title}</div>
          <div className="mt-1 text-[12px] text-muted">{track.description ?? track.category}</div>
          {locked ? <span className="mt-2 inline-block text-[11px] text-matcha">Cần hộp LUMIA</span> : null}
        </div>
      </motion.button>
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
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="audio-library space-y-8">
      {sections.map((section) => {
        const sectionTracks = tracks.filter((t) => t.category === section.category);
        if (!sectionTracks.length && section.activeOnly && !isActive) {
          return (
            <UpsellOverlay key={section.title} featureName={section.title} locked={!isActive}>
              <section className="glass-card p-6">
                <h2 className="font-sans text-base font-medium text-matcha-text">{section.title}</h2>
              </section>
            </UpsellOverlay>
          );
        }
        if (!sectionTracks.length) return null;

        const inner = (
          <section className="space-y-4">
            <h2 className="font-sans text-base font-medium text-matcha-text">{section.title}</h2>
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
        <EmptyState
          scene="audio"
          title="Thư viện đang được chuẩn bị"
          description="Các track âm thanh sẽ sớm có mặt. Hãy thử bài thở trong lúc chờ nhé."
          action={{ label: "Bài thở", href: "/audio/breathing" }}
        />
      ) : null}

      <AudioPlayerOverlay track={playing} onClose={() => setPlaying(null)} />
    </motion.div>
  );
}

export function AudioHubExtras({ isActive }: { isActive: boolean }) {
  const breathingSection = (
    <section className="glass-card p-6">
      <h2 className="font-sans text-base font-medium text-matcha-text">Breathing & Timer</h2>
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
