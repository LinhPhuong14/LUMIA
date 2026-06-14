"use client";

import { useMemo } from "react";

import { heroVideoSources, ritualStageVideoSrc } from "@/components/landing/data/landing-content";
import { useHeroVideoLoop } from "@/components/landing/shared/use-hero-video-loop";
import { cn } from "@/lib/utils";

const eveningHeroSources = [ritualStageVideoSrc] as const;

export function HeroVideoBackground({ evening = false }: { evening?: boolean }) {
  const sources = useMemo(
    () => (evening ? eveningHeroSources : heroVideoSources),
    [evening],
  );
  const { videoRef, videoReady, videoFailed, currentSource } = useHeroVideoLoop(sources);

  const showVideo = !videoFailed;

  return (
    <div
      className={cn(
        "absolute inset-0 z-0 overflow-hidden",
        evening ? "bg-[#0f1a2e]" : "bg-white",
      )}
    >
      <div
        className={cn(
          "hero-video-fallback absolute inset-0 z-0 transition-opacity duration-700",
          evening
            ? "bg-[linear-gradient(180deg,#0f1a2e_0%,#141f35_45%,#1a2840_100%)]"
            : "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.82)_28%,rgba(255,255,255,0.2)_58%,rgba(248,244,237,0.75)_100%)]",
          showVideo && videoReady ? "opacity-0" : "opacity-100",
        )}
        aria-hidden
      />

      {showVideo ? (
        <video
          ref={videoRef}
          key={`${evening ? "evening" : "day"}-${currentSource}`}
          muted
          playsInline
          autoPlay
          loop
          preload="auto"
          className={cn(
            "hero-video absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-700",
            evening ? "hero-video--evening" : "hero-video--day",
            videoReady ? "opacity-100" : "opacity-0",
          )}
        >
          <source src={currentSource} type="video/mp4" />
        </video>
      ) : null}

      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-[2]",
          evening
            ? "bg-[linear-gradient(180deg,rgba(10,16,28,0.35)_0%,rgba(10,16,28,0.08)_42%,rgba(10,16,28,0.4)_100%)]"
            : "bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.08)_42%,transparent_68%)]",
        )}
        aria-hidden
      />
    </div>
  );
}
