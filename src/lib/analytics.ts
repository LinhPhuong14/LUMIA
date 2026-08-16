/**
 * Helpers dùng chung cho Google Analytics 4 (gtag.js).
 *
 * Mọi hàm ở đây an toàn khi gọi trước lúc script gtag load xong (hoặc khi GA tắt):
 * chúng chỉ no-op và trả về `false` thay vì throw.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;

/** Measurement ID của GA4 có dạng `G-XXXXXXXXXX`. */
const GA_ID_PATTERN = /^G-[A-Z0-9]{4,}$/i;

export function isValidGaId(id: string | undefined | null): id is string {
  return typeof id === "string" && GA_ID_PATTERN.test(id.trim());
}

/**
 * Ghép pathname + query string của App Router thành `page_path` mà GA mong đợi.
 * Chấp nhận query có hoặc không có dấu `?` đứng đầu.
 */
export function buildPagePath(
  pathname: string | null | undefined,
  search?: string | URLSearchParams | null,
): string {
  const raw = pathname?.trim() || "/";
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  const query = (typeof search === "string" ? search : (search?.toString() ?? "")).replace(
    /^\?/,
    "",
  );
  return query ? `${path}?${query}` : path;
}

/** Bỏ các field `undefined`/`null` để không gửi rác lên GA. */
export function cleanParams(params: AnalyticsParams): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      result[key] = value;
    }
  }
  return result;
}

function gtag(...args: unknown[]): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  if (typeof window.gtag !== "function") {
    // Đáng lẽ không bao giờ tới đây: shim gtag nằm inline trong HTML (xem
    // components/analytics/google-analytics.tsx) nên đã chạy xong trước lúc
    // hydrate. Rơi vào nhánh này nghĩa là GA đang mất event — im lặng trả false
    // chính là lý do lỗi đó từng lọt qua mà không ai biết, nên phải nói ra.
    if (process.env.NODE_ENV !== "production") {
      console.warn("[analytics] window.gtag chưa sẵn sàng, bỏ event:", args[1] ?? args[0]);
    }
    return false;
  }
  window.gtag(...args);
  return true;
}

/**
 * Bắn `page_view` thủ công — cần thiết vì App Router điều hướng client-side,
 * gtag không tự nhận ra route đổi (script chỉ config một lần lúc load).
 */
export function trackPageView(pagePath: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return gtag("event", "page_view", {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/** Bắn một custom event lên GA4. */
export function trackEvent(name: string, params: AnalyticsParams = {}): boolean {
  return gtag("event", name, cleanParams(params));
}

/** Event chuẩn GA4 khi người dùng bắt đầu thanh toán. */
export function trackBeginCheckout(params: {
  value?: number;
  currency?: string;
  itemId?: string;
  itemName?: string;
}): boolean {
  return trackEvent("begin_checkout", {
    currency: params.currency ?? "VND",
    value: params.value,
    item_id: params.itemId,
    item_name: params.itemName,
  });
}

/** Event chuẩn GA4 khi đơn hàng thanh toán thành công. */
export function trackPurchase(params: {
  transactionId?: string;
  value?: number;
  currency?: string;
}): boolean {
  return trackEvent("purchase", {
    transaction_id: params.transactionId,
    currency: params.currency ?? "VND",
    value: params.value,
  });
}
