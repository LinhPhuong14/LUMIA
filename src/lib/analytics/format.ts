const NUMBER_FORMAT = new Intl.NumberFormat("vi-VN");

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  return NUMBER_FORMAT.format(Math.round(value));
}

/**
 * Dạng rút gọn cho nhãn trục biểu đồ — `84.210` thành `84 N` để nhãn không bị
 * cắt khi lượt hiển thị lên tới hàng chục nghìn.
 */
export function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "—";
  }
  const abs = Math.abs(value);
  if (abs >= 1_000_000) {
    return `${trimZero(value / 1_000_000)} Tr`;
  }
  if (abs >= 10_000) {
    return `${trimZero(value / 1_000)} N`;
  }
  return formatNumber(value);
}

function trimZero(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace(".", ",");
}

/** Nhận tỉ lệ 0..1 (đúng dạng GA4 và Search Console trả về). */
export function formatPercent(ratio: number, digits = 1): string {
  if (!Number.isFinite(ratio)) {
    return "—";
  }
  return `${(ratio * 100).toFixed(digits).replace(".", ",")}%`;
}

export function formatPosition(position: number): string {
  if (!Number.isFinite(position) || position <= 0) {
    return "—";
  }
  return position.toFixed(1).replace(".", ",");
}

/** Giây → `1m 05s`, dùng cho thời lượng phiên trung bình. */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0s";
  }
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes > 0 ? `${minutes}m ${String(rest).padStart(2, "0")}s` : `${rest}s`;
}

export type DeltaTone = "up" | "down" | "flat" | "none";

export type Delta = {
  text: string;
  tone: DeltaTone;
};

/**
 * `change` là % thay đổi (hoặc null khi kỳ trước bằng 0).
 * `lowerIsBetter` dành cho vị trí SERP: tụt số = lên hạng, phải hiện màu tốt.
 */
export function formatDelta(change: number | null, lowerIsBetter = false): Delta {
  if (change === null || !Number.isFinite(change)) {
    return { text: "—", tone: "none" };
  }

  const rounded = Math.round(change * 10) / 10;
  if (rounded === 0) {
    return { text: "0%", tone: "flat" };
  }

  const sign = rounded > 0 ? "+" : "−";
  const text = `${sign}${Math.abs(rounded).toFixed(1).replace(".", ",")}%`;
  const improving = lowerIsBetter ? rounded < 0 : rounded > 0;

  return { text, tone: improving ? "up" : "down" };
}

/** `2026-08-04` → `04/08` cho trục X của biểu đồ. */
export function formatChartDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  return match ? `${match[3]}/${match[2]}` : isoDate;
}

/** Bỏ phần origin của URL Search Console trả về để bảng đọc gọn hơn. */
export function shortenUrl(value: string, maxLength = 48): string {
  let path = value;
  try {
    const url = new URL(value);
    path = `${url.pathname}${url.search}`;
  } catch {
    // Không phải absolute URL (GA4 trả pagePath) — giữ nguyên.
  }
  if (path === "" || path === "/") {
    return "/";
  }
  return path.length > maxLength ? `${path.slice(0, maxLength - 1)}…` : path;
}
