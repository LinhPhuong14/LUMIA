"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import { AudioPlayerOverlay } from "@/components/audio/audio-player-overlay";

export type PlayerTrack = {
  id: string;
  title: string;
  description: string | null;
  duration_seconds: number | null;
  category?: string;
  accent_color?: string | null;
  thumbnail_url?: string | null;
};

type PlayerContextValue = {
  current: PlayerTrack | null;
  play: (track: PlayerTrack) => void;
  close: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function useAudioPlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  // Safe no-op fallback if a component using this renders outside the provider.
  return ctx ?? { current: null, play: () => {}, close: () => {} };
}

/**
 * Mounts a single, persistent audio player. Placed in the (app) layout so the
 * <audio> element survives client-side navigation between app pages — playback
 * keeps going when the user opens another page (or backgrounds the browser tab).
 */
export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<PlayerTrack | null>(null);
  const play = useCallback((track: PlayerTrack) => setCurrent(track), []);
  const close = useCallback(() => setCurrent(null), []);

  return (
    <PlayerContext.Provider value={{ current, play, close }}>
      {children}
      <AudioPlayerOverlay track={current} onClose={close} />
    </PlayerContext.Provider>
  );
}
