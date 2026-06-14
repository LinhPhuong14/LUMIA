"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import {
  applyLumiaTheme,
  readStoredTheme,
  resolveLumiaTheme,
  writeLumiaTheme,
  type LumiaTheme,
} from "@/lib/lumia-theme";

type LumiaThemeContextValue = {
  theme: LumiaTheme;
  isDark: boolean;
  setTheme: (theme: LumiaTheme) => void;
  toggleTheme: () => void;
};

const LumiaThemeContext = createContext<LumiaThemeContextValue>({
  theme: "light",
  isDark: false,
  setTheme: () => undefined,
  toggleTheme: () => undefined,
});

export function LumiaThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<LumiaTheme>("light");

  const setTheme = useCallback((next: LumiaTheme) => {
    setThemeState(next);
    writeLumiaTheme(next);
    applyLumiaTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: LumiaTheme = current === "dark" ? "light" : "dark";
      writeLumiaTheme(next);
      applyLumiaTheme(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resolved = resolveLumiaTheme({
      queryTheme: params.get("theme"),
      storedTheme: readStoredTheme(),
    });
    setThemeState(resolved);
    applyLumiaTheme(resolved);
  }, []);

  return (
    <LumiaThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </LumiaThemeContext.Provider>
  );
}

export function useLumiaTheme() {
  return useContext(LumiaThemeContext);
}

export type { LumiaTheme } from "@/lib/lumia-theme";

/** @deprecated Use useLumiaTheme */
export function useSiteTheme() {
  const { theme, isDark } = useLumiaTheme();
  return { theme, isEvening: isDark };
}
