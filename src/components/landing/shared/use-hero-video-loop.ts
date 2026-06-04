"use client";

import { useEffect, useRef, useState } from "react";

export function useHeroVideoLoop(sources: readonly string[]) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const restartTimeoutRef = useRef<number | null>(null);

  const [videoSourceIndex, setVideoSourceIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const fadeDuration = 0.5;
    let active = true;

    const startPlayback = async () => {
      try {
        await video.play();
      } catch {
        // Keep fallback visible if autoplay is blocked.
      }
    };

    const tick = () => {
      if (!active) return;
      const current = video.currentTime;
      const duration = video.duration;

      if (!duration) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (current < fadeDuration) {
        video.style.opacity = String(current / fadeDuration);
      } else if (current > duration - fadeDuration) {
        video.style.opacity = String((duration - current) / fadeDuration);
      } else {
        video.style.opacity = "1";
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      restartTimeoutRef.current = window.setTimeout(() => {
        if (!active) return;
        video.currentTime = 0;
        startPlayback();
      }, 100);
    };

    const handleLoadedData = () => {
      setVideoReady(true);
      setVideoFailed(false);
      startPlayback();
    };

    const handleError = () => {
      if (videoSourceIndex < sources.length - 1) {
        setVideoReady(false);
        setVideoSourceIndex((current) => current + 1);
        return;
      }

      setVideoReady(false);
      setVideoFailed(true);
    };

    video.style.opacity = "0";
    rafRef.current = requestAnimationFrame(tick);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);

    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (restartTimeoutRef.current) window.clearTimeout(restartTimeoutRef.current);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
    };
  }, [sources, videoSourceIndex]);

  return {
    videoRef,
    videoReady,
    videoFailed,
    currentSource: sources[videoSourceIndex],
  };
}
