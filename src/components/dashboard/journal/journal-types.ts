export type JournalFontId = "serif" | "sans" | "hand";

export type JournalSticker = {
  id: string;
  emoji: string;     // emoji char OR "" when imageUrl is set
  imageUrl?: string; // base64 data URL for image stickers
  x: number;
  y: number;
  size?: number;     // percentage of page width, default 8
};

export type JournalMeta = {
  fontFamily: JournalFontId;
  textColor: string;
  stickers: JournalSticker[];
};

export type JournalEntry = {
  id: string;
  date: string;
  content: string;
  prompt_used?: string | null;
  meta?: JournalMeta | null;
  created_at?: string;
};

export const DEFAULT_JOURNAL_META: JournalMeta = {
  fontFamily: "serif",
  textColor: "var(--journal-ink)",
  stickers: [],
};

export const JOURNAL_FONTS: { id: JournalFontId; label: string; className: string }[] = [
  { id: "serif", label: "Trang trí", className: "font-serif" },
  { id: "sans", label: "Tin cậy", className: "font-sans" },
  { id: "hand", label: "Nghiêng", className: "font-journal-hand" },
];

export const JOURNAL_COLORS = [
  { id: "ink",    light: "#1e3b2d", dark: "#d4e8d0", label: "Mực" },
  { id: "leaf",   light: "#5f7a45", dark: "#a8c97a", label: "Lá" },
  { id: "honey",  light: "#9a7b2e", dark: "#f0c96b", label: "Mật" },
  { id: "rose",   light: "#a86b6b", dark: "#f4b0b0", label: "Hồng" },
  { id: "mist",   light: "#6b6560", dark: "#c5bfbc", label: "Khói" },
  { id: "ocean",  light: "#2b5f8a", dark: "#8dd4f5", label: "Biển" },
] satisfies { id: string; light: string; dark: string; label: string }[];

export const JOURNAL_STICKER_PACK = ["🌿", "✨", "🌙", "🍃", "☁️", "🕯️", "💚", "📝", "🌸", "⭐"] as const;

export function parseJournalMeta(raw: unknown): JournalMeta {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_JOURNAL_META, stickers: [] };
  const m = raw as Partial<JournalMeta>;
  return {
    fontFamily: m.fontFamily ?? DEFAULT_JOURNAL_META.fontFamily,
    // Migrate old hard-coded dark default to CSS var
    textColor: (m.textColor && m.textColor !== "#1e3b2d") ? m.textColor : DEFAULT_JOURNAL_META.textColor,
    stickers: Array.isArray(m.stickers) ? m.stickers : [],
  };
}

export function formatJournalDate(date: string) {
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "short" });
}

export function isToday(date: string) {
  return date === new Date().toISOString().slice(0, 10);
}
