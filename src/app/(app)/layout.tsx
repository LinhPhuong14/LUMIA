import type { ReactNode } from "react";

import { AudioPlayerProvider } from "@/components/audio/audio-player-provider";

export default function AppLayout({ children }: { children: ReactNode }) {
  // Persistent across navigation between all (app) pages → audio keeps playing
  // when the user switches pages or backgrounds the tab.
  return <AudioPlayerProvider>{children}</AudioPlayerProvider>;
}
