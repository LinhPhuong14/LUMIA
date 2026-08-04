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
  resourceId?: string,
): string {
  if (isApiDisabled(message)) {
    const url = buildEnableUrl(api, extractProjectNumber(message));
    return `Chưa bật ${API_LABEL[api]} trong Google Cloud. Mở ${url} rồi bấm Enable, chờ 1-2 phút cho Google lan cấu hình. Lưu ý mỗi API phải bật riêng.`;
  }

  if (isPermissionDenied(message)) {
    const who = serviceAccountEmail ? `"${serviceAccountEmail}"` : "email service account";
    return [
      `Service account chưa đọc được. Token lấy được rồi nên private key là ĐÚNG — vấn đề nằm ở quyền hoặc ở việc đang trỏ nhầm property.`,
      `Kiểm hai thứ theo thứ tự:`,
      `(1) ${resourceHint(api, resourceId)}`,
      `(2) Đã thêm ${who} vào ${GRANT_HINT[api]} chưa. Nếu vừa thêm, chờ 2-3 phút cho Google lan quyền.`,
    ].join(" ");
  }

  return message;
}

/**
 * Nhắc kiểm định danh tài nguyên TRƯỚC khi đi kiểm quyền.
 *
 * Trỏ nhầm property cho ra đúng cùng một lỗi "insufficient permission" như thiếu
 * quyền, và đây mới là nguyên nhân hay gặp hơn: trong màn hình Admin của GA4 có
 * vài con số đều trông giống ID (Account ID, Property ID, Stream ID), rất dễ
 * chép nhầm — mà cấp quyền lại thì bao nhiêu lần cũng không hết lỗi.
 */
function resourceHint(api: GoogleApiName, resourceId?: string): string {
  if (api === "ga4") {
    const current = resourceId ? ` Đang gọi property \`${resourceId}\`.` : "";
    return `GA4_PROPERTY_ID có đúng là **Property ID** không.${current} Lấy ở GA4 → Admin → Property Settings, KHÔNG phải Stream ID (Data Streams) hay Account ID — cả ba đều là dãy số nhìn giống nhau.`;
  }
  const current = resourceId ? ` Đang gọi property \`${resourceId}\`.` : "";
  return `Property đang gọi có khớp property đã verify không.${current} Verify bằng DNS thì phải là dạng \`sc-domain:...\`.`;
}
