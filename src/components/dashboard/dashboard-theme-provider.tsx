"use client";

import { useLumiaTheme } from "@/components/theme/lumia-theme-provider";
import type { LumiaTheme } from "@/lib/lumia-theme";

export type DashboardTheme = LumiaTheme;
export type DashboardThemePreference = LumiaTheme;

export function useDashboardTheme() {
  const { theme, setTheme } = useLumiaTheme();

  let timeZone = "local";
  try {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    // keep default
  }

  const localTime = new Date().toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return {
    theme,
    preference: theme,
    setPreference: setTheme,
    timeZone,
    localTime,
  };
}

/** @deprecated LumiaThemeProvider at root handles theme */
export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  return children;
}
