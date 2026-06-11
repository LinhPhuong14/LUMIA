"use client";

import { heroVideoSources } from "@/components/landing/data/landing-content";
import { useHeroVideoLoop } from "@/components/landing/shared/use-hero-video-loop";

export function HeroVideoBackground() {
  const { videoRef, videoReady, videoFailed, currentSource } =
    useHeroVideoLoop(heroVideoSources);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-white">
      {!videoFailed ? (
        <video
          ref={videoRef}
          key={currentSource}
          muted
          playsInline
          autoPlay
          preload="metadata"
          crossOrigin="anonymous"
          className="hero-video absolute inset-0 h-full w-full object-cover"
          style={{ opacity: videoReady ? 1 : 0, transition: "opacity 600ms ease" }}
        >
          <source src={currentSource} type="video/mp4" />
        </video>
      ) : null}

      <div className="hero-video-fallback absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.72)_24%,rgba(255,255,255,0.16)_56%,rgba(248,244,237,0.7)_100%)]" />
    </div>
  );
}
