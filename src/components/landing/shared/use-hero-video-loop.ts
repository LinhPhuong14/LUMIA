"use client";

import { useEffect, useRef, useState } from "react";

export function useHeroVideoLoop(sources: readonly string[]) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSourceIndex, setVideoSourceIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const sourcesKey = sources.join("|");

  useEffect(() => {
    setVideoSourceIndex(0);
    setVideoReady(false);
    setVideoFailed(false);
  }, [sourcesKey]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let active = true;

    const startPlayback = async () => {
      try {
        video.muted = true;
        await video.play();
      } catch {
        // Autoplay blocked — fallback stays visible
      }
    };

    const handleCanPlay = () => {
      if (!active) return;
      setVideoReady(true);
      setVideoFailed(false);
      startPlayback();
    };

    const handleError = () => {
      if (!active) return;
      if (videoSourceIndex < sources.length - 1) {
        setVideoReady(false);
        setVideoSourceIndex((current) => current + 1);
        return;
      }
      setVideoReady(false);
      setVideoFailed(true);
    };

    setVideoReady(false);
    video.load();

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);

    return () => {
      active = false;
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [sources, sourcesKey, videoSourceIndex]);

  return {
    videoRef,
    videoReady,
    videoFailed,
    currentSource: sources[videoSourceIndex],
  };
}
