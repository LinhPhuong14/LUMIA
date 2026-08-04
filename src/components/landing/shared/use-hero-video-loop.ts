"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hoãn sau `window.load` để video không tranh băng thông với ảnh và font của
 * màn hình đầu. Trước đây để 8000ms: cộng với thời gian `load` và một vòng
 * `requestIdleCallback` nữa, video mãi tới giây thứ 17 mới bắt đầu tải — đó là
 * độ trễ do chính mình tạo ra, chưa tính thời gian tải file.
 */
const HERO_VIDEO_DELAY_MS = 1200;

/**
 * Quá mốc này mà video chưa phát được thì bỏ hẳn, giữ nguyên nền gradient.
 *
 * Không có mốc này, một file nặng trên mạng chậm sẽ để người dùng nhìn gradient
 * hàng phút rồi video bật vào giữa chừng — khó chịu hơn là không bao giờ hiện.
 * Bỏ sớm cũng cắt luôn phần băng thông đang tải vô ích.
 */
const HERO_VIDEO_TIMEOUT_MS = 12_000;

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
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
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

    // Mạng 2G/3G thì một video nền không bao giờ đáng giá — bỏ ngay từ đầu
    // thay vì tải hàng chục giây rồi mới bỏ.
    const isSlowConnection = /(^|-)2g$/.test(connection?.effectiveType ?? "");

    const canLoadVideo = () =>
      desktopQuery.matches && !motionQuery.matches && !connection?.saveData && !isSlowConnection;

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
          idleId = window.requestIdleCallback(enableVideo, { timeout: 800 });
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

    const markReady = () => {
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

    // `loadeddata` bắn sớm hơn `canplay` — chỉ cần khung hình đầu là đã đủ để
    // thay nền gradient, không phải chờ đủ buffer để phát liên tục.
    video.addEventListener("loadeddata", markReady);
    video.addEventListener("canplay", markReady);
    video.addEventListener("error", handleError);

    const timeoutId = window.setTimeout(() => {
      if (!active || video.readyState >= 2) return;
      setVideoFailed(true);
      // Ngắt tải dở: gán src rỗng rồi load() là cách chuẩn để trình duyệt huỷ
      // request đang chạy, tránh ngốn tiếp băng thông cho thứ đã bỏ.
      video.removeAttribute("src");
      video.load();
    }, HERO_VIDEO_TIMEOUT_MS);

    setVideoReady(false);
    // Không gọi video.load() ở đây: phần tử đã có `src` và tự tải khi mount,
    // gọi thêm sẽ tạo ra request thứ hai cho cùng một file.

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("error", handleError);
    };
  }, [shouldLoadVideo, sourcesKey, sources.length, videoSourceIndex]);

  return {
    videoRef,
    videoReady,
    videoFailed,
    shouldLoadVideo,
    currentSource: sources[videoSourceIndex],
  };
}
