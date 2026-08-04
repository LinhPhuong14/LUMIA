import "server-only";

import { getAppUrl } from "@/lib/app-url";
import type { DateRange } from "@/lib/analytics/date-range";
import {
  getGoogleAccessToken,
  hasServiceAccount,
  SEARCH_CONSOLE_SCOPE,
} from "@/lib/analytics/google-auth";
import type {
  GscReport,
  GscRow,
  GscSummary,
  GscTrendPoint,
  SourceState,
} from "@/lib/analytics/types";

const API_BASE = "https://searchconsole.googleapis.com/webmasters/v3/sites";

type GscApiRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

type GscApiResponse = {
  rows?: GscApiRow[];
  error?: { message?: string };
};

/**
 * Property của Search Console có hai dạng, tuỳ cách xác minh:
 *
 * - **URL prefix** (`https://domain/`) — xác minh bằng thẻ HTML hoặc file HTML.
 *   Phải khớp **chính xác**, kể cả `www` và dấu `/` cuối.
 * - **Domain property** (`sc-domain:domain`) — xác minh bằng DNS (TXT hoặc
 *   CNAME). Gộp cả apex, www, http, https và mọi subdomain.
 *
 * Gọi nhầm dạng là API trả 403, nên khi không cấu hình tường minh thì code hỏi
 * Google xem service account đang có quyền trên property nào (`pickBestSite`).
 */
export function resolveSiteUrl(): string {
  const configured = process.env.GSC_SITE_URL?.trim();
  if (configured) {
    return configured.startsWith("sc-domain:") ? configured : ensureTrailingSlash(configured);
  }
  return ensureTrailingSlash(getAppUrl());
}

export type GscSite = { siteUrl: string; permissionLevel?: string };

function hostOf(value: string): string | null {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** Bỏ `www.` để so hai host ở mức tên miền gốc. */
function apexOf(host: string): string {
  return host.replace(/^www\./, "");
}

/**
 * Chọn property khớp nhất với domain của app trong số những property mà service
 * account thực sự có quyền đọc.
 *
 * Thứ tự ưu tiên:
 *   1. Domain property của apex — bao trọn www lẫn non-www, không bao giờ lệch
 *   2. URL prefix trùng đúng host đang chạy
 *   3. URL prefix cùng apex (vd đã verify non-www nhưng app chạy ở www)
 *
 * Bỏ qua property chỉ có quyền `siteUnverifiedUser`: liệt kê ra được nhưng gọi
 * searchAnalytics vẫn 403, chọn vào chỉ đổi một lỗi khó hiểu lấy một lỗi khác.
 */
export function pickBestSite(sites: GscSite[], appUrl: string): string | null {
  const usable = sites.filter((site) => site.permissionLevel !== "siteUnverifiedUser");
  if (usable.length === 0) {
    return null;
  }

  const host = hostOf(appUrl);
  if (!host) {
    return usable[0].siteUrl;
  }
  const apex = apexOf(host);

  const domainProperty = usable.find(
    (site) => site.siteUrl.toLowerCase() === `sc-domain:${apex}`,
  );
  if (domainProperty) {
    return domainProperty.siteUrl;
  }

  const exactHost = usable.find((site) => hostOf(site.siteUrl) === host);
  if (exactHost) {
    return exactHost.siteUrl;
  }

  const sameApex = usable.find((site) => {
    const siteHost = hostOf(site.siteUrl);
    return siteHost !== null && apexOf(siteHost) === apex;
  });

  return sameApex?.siteUrl ?? null;
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

const EMPTY_SUMMARY: GscSummary = { clicks: 0, impressions: 0, ctr: 0, position: 0 };

function toSummary(row: GscApiRow | undefined): GscSummary {
  if (!row) {
    return { ...EMPTY_SUMMARY };
  }
  return {
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  };
}

function toRows(response: GscApiResponse): GscRow[] {
  return (response.rows ?? []).map((row) => ({
    label: row.keys?.[0] ?? "(không xác định)",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.ctr ?? 0,
    position: row.position ?? 0,
  }));
}

async function query(
  siteUrl: string,
  token: string,
  body: Record<string, unknown>,
): Promise<GscApiResponse> {
  const response = await fetch(
    `${API_BASE}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );

  const data = (await response.json()) as GscApiResponse;
  if (!response.ok) {
    throw new Error(data.error?.message ?? `Search Console trả về HTTP ${response.status}`);
  }
  return data;
}

/**
 * Danh sách property mà service account có quyền. Trả mảng rỗng khi lỗi — bên
 * gọi chỉ dùng nó để chọn giúp và để báo lỗi cho dễ hiểu, không phải đường dữ
 * liệu chính nên hỏng cũng không được làm sập cả báo cáo.
 */
export async function fetchAccessibleSites(token: string): Promise<GscSite[]> {
  try {
    const response = await fetch(API_BASE, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as { siteEntry?: GscSite[] };
    return data.siteEntry ?? [];
  } catch {
    return [];
  }
}

export async function fetchSearchConsoleReport(
  range: DateRange,
): Promise<SourceState<GscReport>> {
  if (!hasServiceAccount()) {
    return {
      status: "not_configured",
      message: "Chưa cấu hình service account của Google.",
      data: null,
    };
  }

  const token = await getGoogleAccessToken(SEARCH_CONSOLE_SCOPE);
  if (!token) {
    return {
      status: "error",
      message: "Không lấy được access token — kiểm tra lại private key của service account.",
      data: null,
    };
  }

  // Chưa cấu hình tường minh thì hỏi Google xem có property nào, rồi tự chọn.
  // Xác minh bằng DNS (TXT/CNAME) tạo ra domain property `sc-domain:...`, còn
  // mặc định suy từ APP_URL lại là URL prefix — đoán sai là 403.
  const configuredSiteUrl = process.env.GSC_SITE_URL?.trim();
  const accessibleSites = configuredSiteUrl ? [] : await fetchAccessibleSites(token);
  const siteUrl = configuredSiteUrl
    ? resolveSiteUrl()
    : (pickBestSite(accessibleSites, getAppUrl()) ?? resolveSiteUrl());

  const current = { startDate: range.startDate, endDate: range.endDate };
  const previous = { startDate: range.previousStartDate, endDate: range.previousEndDate };

  try {
    const [summary, previousSummary, trend, queries, pages] = await Promise.all([
      query(siteUrl, token, { ...current, rowLimit: 1 }),
      query(siteUrl, token, { ...previous, rowLimit: 1 }),
      query(siteUrl, token, { ...current, dimensions: ["date"], rowLimit: 100 }),
      query(siteUrl, token, { ...current, dimensions: ["query"], rowLimit: 10 }),
      query(siteUrl, token, { ...current, dimensions: ["page"], rowLimit: 10 }),
    ]);

    const trendPoints: GscTrendPoint[] = (trend.rows ?? [])
      .map((row) => ({
        date: row.keys?.[0] ?? "",
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
      }))
      .filter((point) => point.date)
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      status: "ok",
      data: {
        siteUrl,
        summary: toSummary(summary.rows?.[0]),
        previousSummary: toSummary(previousSummary.rows?.[0]),
        trend: trendPoints,
        topQueries: toRows(queries),
        topPages: toRows(pages),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không gọi được Search Console API.";

    if (!message.includes("403")) {
      return { status: "error", message, data: null };
    }

    // 403 có đúng hai nguyên nhân, và phân biệt được bằng danh sách property:
    // hoặc service account chưa được add, hoặc đang gọi nhầm dạng property.
    const sites = await fetchAccessibleSites(token);
    const available = sites.map((site) => site.siteUrl);

    return {
      status: "error",
      message:
        available.length > 0
          ? `Không đọc được property "${siteUrl}". Service account đang có quyền trên: ${available.join(", ")}. Đặt GSC_SITE_URL đúng một trong số đó — xác minh bằng DNS (TXT/CNAME) thì property có dạng sc-domain:...`
          : `${message} — service account chưa được thêm làm user của property nào trong Search Console.`,
      data: null,
    };
  }
}
