"use client";

import { useEffect, useRef, useState } from "react";

const HERO_VIDEO_DELAY_MS = 8000;

export function useHeroVideoLoop(sources: readonly string[]) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSourceIndex, setVideoSourceIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const sourcesKey = sources.join("|");

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let idleId: number | null = null;
    let delayId: number | null = null;

    const clearScheduledLoad = () => {
      if (idleId !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
        idleId = null;
      }
      if (delayId !== null) {
        window.clearTimeout(delayId);
        delayId = null;
      }
    };

    const canLoadVideo = () => desktopQuery.matches && !motionQuery.matches && !connection?.saveData;

    const scheduleVideoLoad = () => {
      clearScheduledLoad();
      if (!canLoadVideo()) {
        setShouldLoadVideo(false);
        return;
      }

      const enableVideo = () => {
        idleId = null;
        delayId = null;
        setShouldLoadVideo(true);
      };

      delayId = window.setTimeout(() => {
        if ("requestIdleCallback" in window) {
          idleId = window.requestIdleCallback(enableVideo, { timeout: 2500 });
        } else {
          enableVideo();
        }
      }, HERO_VIDEO_DELAY_MS);
    };

    const onReady = () => scheduleVideoLoad();
    const onPreferenceChange = () => scheduleVideoLoad();

    if (document.readyState === "complete") {
      window.setTimeout(onReady, 0);
    } else {
      window.addEventListener("load", onReady, { once: true });
    }

    motionQuery.addEventListener("change", onPreferenceChange);
    desktopQuery.addEventListener("change", onPreferenceChange);

    return () => {
      clearScheduledLoad();
      window.removeEventListener("load", onReady);
      motionQuery.removeEventListener("change", onPreferenceChange);
      desktopQuery.removeEventListener("change", onPreferenceChange);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoadVideo) {
      return;
    }

    let active = true;

    const startPlayback = async () => {
      try {
        video.muted = true;
        await video.play();
      } catch {
        // Autoplay blocked - fallback stays visible
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

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    setVideoReady(false);
    video.load();

    return () => {
      active = false;
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
    };
  }, [shouldLoadVideo, sources, sourcesKey, videoSourceIndex]);

  return {
    videoRef,
    videoReady,
    videoFailed,
    shouldLoadVideo,
    currentSource: sources[videoSourceIndex],
  };
}
