"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

import { AudioPlayerOverlay } from "@/components/audio/audio-player-overlay";
import { CATEGORY_ACCENT } from "@/components/audio/botanical-artwork";
import { AUDIO_STOCK_QUERIES, PhotoImage } from "@/components/ui/photo-image";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumSectionTeaser } from "@/components/ui/upsell-overlay";
import { staggerContainer, staggerItem } from "@/lib/motion-variants";

type Track = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  duration_seconds: number | null;
  is_free: boolean;
  thumbnail_url?: string | null;
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

    const CardTag = locked ? motion.div : motion.button;
    const card = (
      <CardTag
        type={locked ? undefined : "button"}
        variants={staggerItem}
        onClick={locked ? undefined : () => setPlaying(track)}
        whileHover={locked ? undefined : { y: -2 }}
        className={`dash-panel group w-full overflow-hidden p-0 text-left transition ${locked ? "opacity-95" : ""}`}
      >
        <div className="relative h-24 overflow-hidden sm:h-28">
          {track.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.thumbnail_url}
              alt={track.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <PhotoImage
              stockQuery={stockQuery}
              alt={track.title}
              overlay="dark"
              overlayOpacity={0.4}
              fill
              className="h-full w-full transition-transform duration-300 group-hover:scale-105"
            />
          )}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background: `linear-gradient(to top, ${accent}cc, transparent)`,
              maskImage: "linear-gradient(to bottom, black 40%, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent)",
            }}
          />
          {track.duration_seconds ? (
            <span className="absolute bottom-2 right-2 rounded-full bg-black/35 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
              {Math.round(track.duration_seconds / 60)} phút
            </span>
          ) : (
            <span className="absolute bottom-2 right-2 rounded-full bg-black/35 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
              ∞ loop
            </span>
          )}
          {locked ? (
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[10px] font-semibold text-matcha-deep backdrop-blur-sm">
              <Lock className="h-3 w-3" />
              Premium
            </div>
          ) : null}
          {isPlaying ? (
            <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-white/80">
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="inline-block h-3 w-0.5 animate-waveform bg-white"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          ) : null}
        </div>
        <div className="p-4">
          <div className="font-medium text-matcha-deep">{track.title}</div>
          <div className="mt-1 line-clamp-2 text-[12px] text-muted">{track.description ?? track.category}</div>
          {locked ? (
            <Link
              href="/store"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 inline-block text-[11px] font-semibold text-[var(--green)] underline-offset-2 hover:underline"
            >
              Xem gói LUMIA
            </Link>
          ) : null}
        </div>
      </CardTag>
    );

    return <div key={track.id}>{card}</div>;
  }

  if (loading) {
    return <p className="text-sm text-muted">Đang tải thư viện...</p>;
  }

  const hasPremiumSections = !isActive && sections.some((s) => s.activeOnly);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="audio-library space-y-6 lg:space-y-8">
      {hasPremiumSections ? (
        <PremiumSectionTeaser
          title="Nội dung Premium"
          description="Sleep Cast, Wind Down và nhiều track khác mở khóa khi bạn đăng ký gói LUMIA."
        />
      ) : null}

      {sections.map((section) => {
        const sectionTracks = tracks.filter((t) => t.category === section.category);
        const isPremiumSection = section.activeOnly && !isActive;

        if (!sectionTracks.length) {
          if (isPremiumSection) {
            return <PremiumSectionTeaser key={section.title} title={section.title} />;
          }
          return null;
        }

        return (
          <section key={section.title} className="space-y-3 sm:space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="font-sans text-base font-medium text-matcha-text sm:text-lg">{section.title}</h2>
              {isPremiumSection ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--green-wash)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--green-deep)]">
                  <Lock className="h-3 w-3" />
                  Premium
                </span>
              ) : null}
            </div>
            <div className="audio-track-grid">{sectionTracks.map(renderTrackCard)}</div>
          </section>
        );
      })}

      {tracks.length === 0 ? (
        <EmptyState
          scene="audio"
          title="Thư viện đang được chuẩn bị"
          description="Các track âm thanh sẽ sớm có mặt. Hãy quay lại sau nhé."
        />
      ) : null}

      <AudioPlayerOverlay track={playing} onClose={() => setPlaying(null)} />
    </motion.div>
  );
}

export function AudioHubExtras({ isActive }: { isActive: boolean }) {
  if (!isActive) {
    return (
      <PremiumSectionTeaser
        title="Breathing & Timer"
        description="Bài tập thở và hẹn giờ thiền dành cho thành viên Premium."
      />
    );
  }

  return (
    <section className="dash-panel p-5 sm:p-6">
      <h2 className="font-sans text-base font-medium text-matcha-text sm:text-lg">Breathing & Timer</h2>
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
}
