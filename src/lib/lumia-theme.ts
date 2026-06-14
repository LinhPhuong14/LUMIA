export type LumiaTheme = "light" | "dark";

export const LUMIA_THEME_STORAGE_KEY = "lumia-theme";

const THEME_COLORS: Record<LumiaTheme, string> = {
  light: "#5f7a45",
  dark: "#18203a",
};

export function isLumiaTheme(value: string | null | undefined): value is LumiaTheme {
  return value === "light" || value === "dark";
}

export function readStoredTheme(): LumiaTheme | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(LUMIA_THEME_STORAGE_KEY);
  if (isLumiaTheme(stored)) {
    return stored;
  }

  // Migrate legacy keys
  const legacyDashboard = localStorage.getItem("lumia-dashboard-theme-preference");
  if (legacyDashboard === "evening") {
    return "dark";
  }
  if (legacyDashboard === "light") {
    return "light";
  }

  const legacySite = localStorage.getItem("lumia-dashboard-theme");
  if (legacySite === "evening") {
    return "dark";
  }
  if (legacySite === "light") {
    return "light";
  }

  return null;
}

export function resolveLumiaTheme(options?: {
  queryTheme?: string | null;
  storedTheme?: LumiaTheme | null;
}): LumiaTheme {
  const query = options?.queryTheme ?? null;
  if (isLumiaTheme(query)) {
    return query;
  }

  const stored = options?.storedTheme ?? readStoredTheme();
  if (stored) {
    return stored;
  }

  return "light";
}

export function writeLumiaTheme(theme: LumiaTheme) {
  localStorage.setItem(LUMIA_THEME_STORAGE_KEY, theme);
}

export function applyLumiaTheme(theme: LumiaTheme) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme === "dark" ? "dark" : "light";

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", THEME_COLORS[theme]);
  }
}

export function getThemeColor(theme: LumiaTheme) {
  return THEME_COLORS[theme];
}
