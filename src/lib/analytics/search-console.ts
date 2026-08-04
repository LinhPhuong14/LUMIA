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
 * Property của Search Console có hai dạng: URL prefix (`https://domain/`)
 * và domain property (`sc-domain:domain`). URL prefix phải khớp **chính xác**,
 * kể cả dấu `/` cuối, nếu không API trả 403.
 */
export function resolveSiteUrl(): string {
  const configured = process.env.GSC_SITE_URL?.trim();
  if (configured) {
    return configured.startsWith("sc-domain:") ? configured : ensureTrailingSlash(configured);
  }
  return ensureTrailingSlash(getAppUrl());
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

  const siteUrl = resolveSiteUrl();
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
    return {
      status: "error",
      // 403 gần như luôn là quên add service account vào property — nói thẳng cách sửa.
      message: message.includes("403")
        ? `${message} — hãy thêm service account làm user của property "${siteUrl}" trong Search Console.`
        : message,
      data: null,
    };
  }
}
