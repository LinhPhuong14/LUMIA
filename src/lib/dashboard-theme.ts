export type DashboardTheme = "light" | "evening";

export type DashboardThemePreference = "auto" | DashboardTheme;

const STORAGE_KEY = "lumia-dashboard-theme-preference";

/** Sáng: 6h–18h · Tối: 18h–6h (theo giờ local của trình duyệt) */
export function getTimeBasedDashboardTheme(now = new Date()): DashboardTheme {
  const hour = now.getHours();
  return hour >= 6 && hour < 18 ? "light" : "evening";
}

export function getUserTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "local";
  }
}

export function formatLocalTime(now = new Date(), locale?: string): string {
  return now.toLocaleTimeString(locale ?? undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getThemePreferenceLabel(preference: DashboardThemePreference): string {
  if (preference === "auto") return "Tự động theo giờ";
  if (preference === "evening") return "Evening Mode (Tối)";
  return "Light Mode (Sáng)";
}

export function resolveDashboardTheme(
  preference: DashboardThemePreference,
  now = new Date(),
): DashboardTheme {
  if (preference === "auto") {
    return getTimeBasedDashboardTheme(now);
  }
  return preference;
}

export function readThemePreference(): DashboardThemePreference {
  if (typeof window === "undefined") {
    return "auto";
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "auto" || stored === "light" || stored === "evening") {
    return stored;
  }

  // Migrate legacy manual-only key
  const legacy = localStorage.getItem("lumia-dashboard-theme") as DashboardThemePreference | null;
  if (legacy === "light" || legacy === "evening") {
    writeThemePreference(legacy);
    localStorage.removeItem("lumia-dashboard-theme");
    return legacy;
  }

  return "auto";
}

export function writeThemePreference(preference: DashboardThemePreference) {
  localStorage.setItem(STORAGE_KEY, preference);
}

export { STORAGE_KEY as DASHBOARD_THEME_STORAGE_KEY };
