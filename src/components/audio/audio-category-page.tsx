"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Pause, Play } from "lucide-react";

import { useAudioPlayer } from "@/components/audio/audio-player-provider";
import { AUDIO_STOCK_QUERIES, PhotoImage } from "@/components/ui/photo-image";
import { EmptyState } from "@/components/ui/empty-state";
import { PremiumSectionTeaser } from "@/components/ui/upsell-overlay";
import { UpgradeModal } from "@/components/ui/upgrade-modal";
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
  const { current, play } = useAudioPlayer();
  const [upsellFor, setUpsellFor] = useState<Track | null>(null);
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
    const isPlaying = current?.id === track.id;
    const stockQuery = AUDIO_STOCK_QUERIES[track.category] ?? "calm wellness";
    const minutes = track.duration_seconds ? Math.round(track.duration_seconds / 60) : null;
    // Clean, Spotify-style subtitle — no raw category/description clutter.
    const subtitle = locked ? "Premium" : minutes ? `${minutes} phút` : "Liên tục";

    return (
      <motion.button
        key={track.id}
        type="button"
        variants={staggerItem}
        onClick={() => (locked ? setUpsellFor(track) : play(track))}
        className="group relative flex w-full flex-col rounded-2xl p-2.5 text-left transition hover:bg-[var(--surface-warm)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green)]/60"
      >
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[var(--surface-warm)] shadow-sm">
          {track.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={track.thumbnail_url}
              alt={track.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <PhotoImage
              stockQuery={stockQuery}
              alt={track.title}
              fill
              className="h-full w-full transition-transform duration-500 group-hover:scale-105"
            />
          )}

          {/* Now-playing equalizer */}
          {isPlaying ? (
            <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm">
              <span className="flex items-end gap-[2px]">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="inline-block w-[2px] animate-waveform bg-white"
                    style={{ height: 10, animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          ) : null}

          {locked ? (
            /* Locked overlay — clearly dims premium tracks and marks them with a lock */
            <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[2px] transition group-hover:bg-black/45">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-matcha-deep shadow-md">
                <Lock className="h-[18px] w-[18px]" />
              </span>
            </div>
          ) : (
            /* Spotify-style play button: green circle, reveals on hover */
            <div
              className={`absolute bottom-2 right-2 transition-all duration-200 ${
                isPlaying
                  ? "translate-y-0 opacity-100"
                  : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
              }`}
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--green)] text-white shadow-[0_8px_18px_rgba(0,0,0,0.25)] transition group-hover:scale-105">
                {isPlaying ? (
                  <Pause className="h-5 w-5" fill="currentColor" />
                ) : (
                  <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />
                )}
              </span>
            </div>
          )}
        </div>

        <div className="mt-2.5 min-w-0 px-0.5">
          <div className="truncate text-[14px] font-semibold text-[var(--foreground)]">{track.title}</div>
          <div className="mt-0.5 flex items-center gap-1 text-[12px] text-[var(--muted)]">
            {locked ? <Lock className="h-3 w-3 shrink-0" /> : null}
            <span className="truncate">{subtitle}</span>
          </div>
        </div>
      </motion.button>
    );
  }

  if (loading) {
    return (
      <div className="audio-track-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-2.5">
            <div className="aspect-square w-full animate-pulse rounded-xl bg-[var(--surface-warm)]" />
            <div className="mt-3 h-3.5 w-3/4 animate-pulse rounded bg-[var(--surface-warm)]" />
            <div className="mt-1.5 h-3 w-1/3 animate-pulse rounded bg-[var(--surface-warm)]" />
          </div>
        ))}
      </div>
    );
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

      <UpgradeModal
        open={!!upsellFor}
        trackTitle={upsellFor?.title}
        onClose={() => setUpsellFor(null)}
      />
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
