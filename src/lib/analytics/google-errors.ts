/**
 * Dịch lỗi của Google API sang thông báo nói rõ phải làm gì.
 *
 * Hai lỗi dưới đây chiếm gần hết số lần cấu hình hỏng, và nguyên văn tiếng Anh
 * của Google không nói ra chỗ cần bấm:
 *
 * - `has not been used in project ... before` — quên bật API trong Cloud Console.
 *   Mỗi API phải bật riêng: bật Analytics Data API không kéo theo Search Console.
 * - `does not have sufficient permission` — service account tồn tại và token hợp
 *   lệ, nhưng chưa được thêm vào property. Đây là hai bước tách rời nhau, làm
 *   xong bước tạo key rất dễ tưởng là xong.
 */

export type GoogleApiName = "ga4" | "searchConsole";

const API_LABEL: Record<GoogleApiName, string> = {
  ga4: "Google Analytics Data API",
  searchConsole: "Google Search Console API",
};

const API_SERVICE: Record<GoogleApiName, string> = {
  ga4: "analyticsdata.googleapis.com",
  searchConsole: "searchconsole.googleapis.com",
};

const GRANT_HINT: Record<GoogleApiName, string> = {
  ga4: "GA4 → Admin → Property access management → thêm email service account với quyền Viewer",
  searchConsole:
    "Search Console → Settings → Users and permissions → Add user → dán email service account, quyền Full",
};

/** Số project trong thông báo `...in project 844193636790 before...`. */
export function extractProjectNumber(message: string): string | null {
  return /\bproject\s+(\d{6,})/i.exec(message)?.[1] ?? null;
}

export function buildEnableUrl(api: GoogleApiName, projectNumber: string | null): string {
  const base = `https://console.cloud.google.com/apis/library/${API_SERVICE[api]}`;
  return projectNumber ? `${base}?project=${projectNumber}` : base;
}

function isApiDisabled(message: string): boolean {
  return /has not been used in project|SERVICE_DISABLED|is disabled/i.test(message);
}

function isPermissionDenied(message: string): boolean {
  return /sufficient permission|PERMISSION_DENIED|caller does not have permission/i.test(message);
}

/**
 * Trả về thông báo hành động được. Lỗi không nhận ra thì giữ nguyên văn — đoán
 * bừa một lời khuyên sai còn tệ hơn là để người đọc thấy đúng lỗi gốc.
 */
export function describeGoogleApiError(
  message: string,
  api: GoogleApiName,
  serviceAccountEmail?: string,
): string {
  if (isApiDisabled(message)) {
    const url = buildEnableUrl(api, extractProjectNumber(message));
    return `Chưa bật ${API_LABEL[api]} trong Google Cloud. Mở ${url} rồi bấm Enable, chờ 1-2 phút cho Google lan cấu hình. Lưu ý mỗi API phải bật riêng.`;
  }

  if (isPermissionDenied(message)) {
    const who = serviceAccountEmail ? `\`${serviceAccountEmail}\`` : "email service account";
    return `Service account chưa được cấp quyền đọc. Thêm ${who} vào: ${GRANT_HINT[api]}. Token đã lấy được nên phần key là đúng — chỉ thiếu bước cấp quyền.`;
  }

  return message;
}
