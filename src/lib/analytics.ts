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

/**
 * `items` là mảng object — GA4 bắt buộc dạng này cho các event thương mại
 * (`add_to_cart`, `purchase`), nên kiểu tham số phải nhận được cả nó, không chỉ
 * giá trị nguyên thuỷ.
 */
export type AnalyticsItem = {
  item_id?: string;
  item_name?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
};

export type AnalyticsParams = Record<
  string,
  string | number | boolean | null | undefined | AnalyticsItem[]
>;

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
export function cleanParams(params: AnalyticsParams): Record<string, string | number | boolean | AnalyticsItem[]> {
  const result: Record<string, string | number | boolean | AnalyticsItem[]> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      result[key] = value;
    }
  }
  return result;
}

function gtag(...args: unknown[]): boolean {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
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

/**
 * Người dùng tạo tài khoản. GA4 nhận diện `sign_up` là event chuẩn nên nó lên
 * thẳng báo cáo Conversions mà không phải khai báo gì thêm.
 */
export function trackSignUp(method = "email"): boolean {
  return trackEvent("sign_up", { method });
}

/** Thêm sản phẩm vào giỏ. */
export function trackAddToCart(params: {
  itemId?: string;
  itemName?: string;
  value?: number;
  variant?: string | null;
}): boolean {
  return trackEvent("add_to_cart", {
    currency: "VND",
    value: params.value,
    items: [
      {
        item_id: params.itemId,
        item_name: params.itemName,
        item_variant: params.variant ?? undefined,
        price: params.value,
        quantity: 1,
      },
    ],
  });
}

/**
 * Một hành động có ý nghĩa trong app (viết nhật ký, nghe audio, check-in…).
 *
 * Vì sao đáng gửi: GA4 tính "phiên có tương tác" dựa vào thời lượng HOẶC số
 * event. Trước đây app chỉ bắn `page_view`, nên một người viết nhật ký 20 phút
 * vẫn bị đếm ngang một người mở trang rồi thoát — tỉ lệ tương tác và số event
 * mỗi phiên đều thấp hơn thực tế đang diễn ra.
 */
export function trackEngagement(
  action:
    | "journal_save"
    | "chat_message"
    | "audio_play"
    | "mood_checkin"
    | "mood_test_complete",
  params: AnalyticsParams = {},
): boolean {
  return trackEvent(action, params);
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
