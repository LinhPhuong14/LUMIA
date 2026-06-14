export type JournalFontId = "serif" | "sans" | "hand";

export type JournalSticker = {
  id: string;
  emoji: string;
  x: number;
  y: number;
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
  textColor: "#383328",
  stickers: [],
};

export const JOURNAL_FONTS: { id: JournalFontId; label: string; className: string }[] = [
  { id: "serif", label: "Trang trí", className: "font-serif" },
  { id: "sans", label: "Tin cậy", className: "font-sans" },
  { id: "hand", label: "Tay viết", className: "font-journal-hand" },
];

export const JOURNAL_COLORS = [
  { id: "ink", value: "#383328", label: "Mực" },
  { id: "leaf", value: "#5f7a45", label: "Lá" },
  { id: "honey", value: "#9a7b2e", label: "Mật" },
  { id: "rose", value: "#a86b6b", label: "Hồng" },
  { id: "mist", value: "#6b6560", label: "Khói" },
] as const;

export const JOURNAL_STICKER_PACK = ["🌿", "✨", "🌙", "🍃", "☁️", "🕯️", "💚", "📝", "🌸", "⭐"] as const;

export function parseJournalMeta(raw: unknown): JournalMeta {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_JOURNAL_META, stickers: [] };
  const m = raw as Partial<JournalMeta>;
  return {
    fontFamily: m.fontFamily ?? DEFAULT_JOURNAL_META.fontFamily,
    textColor: m.textColor ?? DEFAULT_JOURNAL_META.textColor,
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
