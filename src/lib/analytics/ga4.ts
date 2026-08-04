import "server-only";

import type { DateRange } from "@/lib/analytics/date-range";
import { normalizeGaDate } from "@/lib/analytics/date-range";
import { GA4_SCOPE, getGoogleAccessToken, hasServiceAccount } from "@/lib/analytics/google-auth";
import type {
  BreakdownRow,
  GaPageRow,
  GaReport,
  GaSummary,
  GaTrendPoint,
  SourceState,
} from "@/lib/analytics/types";

const API_BASE = "https://analyticsdata.googleapis.com/v1beta";

type GaRow = {
  dimensionValues?: { value?: string }[];
  metricValues?: { value?: string }[];
};

type GaSingleReport = {
  rows?: GaRow[];
};

type GaBatchResponse = {
  reports?: GaSingleReport[];
  error?: { message?: string };
};

/** Chấp nhận cả `123456789` lẫn `properties/123456789`. */
export function normalizePropertyId(raw: string | undefined): string | null {
  const value = raw?.trim().replace(/^properties\//, "");
  return value && /^\d+$/.test(value) ? value : null;
}

export function getPropertyId(): string | null {
  return normalizePropertyId(process.env.GA4_PROPERTY_ID);
}

function num(value: string | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dim(row: GaRow, index: number): string {
  return row.dimensionValues?.[index]?.value ?? "";
}

function metric(row: GaRow, index: number): number {
  return num(row.metricValues?.[index]?.value);
}

const EMPTY_SUMMARY: GaSummary = {
  users: 0,
  newUsers: 0,
  sessions: 0,
  pageViews: 0,
  engagementRate: 0,
  avgSessionSeconds: 0,
};

const SUMMARY_METRICS = [
  "activeUsers",
  "newUsers",
  "sessions",
  "screenPageViews",
  "engagementRate",
  "averageSessionDuration",
];

function toSummary(row: GaRow | undefined): GaSummary {
  if (!row) {
    return { ...EMPTY_SUMMARY };
  }
  return {
    users: metric(row, 0),
    newUsers: metric(row, 1),
    sessions: metric(row, 2),
    pageViews: metric(row, 3),
    engagementRate: metric(row, 4),
    avgSessionSeconds: metric(row, 5),
  };
}

function toBreakdown(report: GaSingleReport | undefined): BreakdownRow[] {
  return (report?.rows ?? []).map((row) => ({
    label: dim(row, 0) || "(không xác định)",
    value: metric(row, 0),
  }));
}

async function runBatch(
  propertyId: string,
  token: string,
  requests: unknown[],
): Promise<GaBatchResponse> {
  const response = await fetch(`${API_BASE}/properties/${propertyId}:batchRunReports`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requests }),
    cache: "no-store",
  });

  const data = (await response.json()) as GaBatchResponse;
  if (!response.ok) {
    throw new Error(data.error?.message ?? `GA4 trả về HTTP ${response.status}`);
  }
  return data;
}

export async function fetchGaReport(range: DateRange): Promise<SourceState<GaReport>> {
  const propertyId = getPropertyId();

  if (!hasServiceAccount() || !propertyId) {
    return {
      status: "not_configured",
      message: "Chưa cấu hình GA4_PROPERTY_ID hoặc service account của Google.",
      data: null,
    };
  }

  const token = await getGoogleAccessToken(GA4_SCOPE);
  if (!token) {
    return {
      status: "error",
      message: "Không lấy được access token — kiểm tra lại private key của service account.",
      data: null,
    };
  }

  const currentRange = { startDate: range.startDate, endDate: range.endDate };
  const previousRange = { startDate: range.previousStartDate, endDate: range.previousEndDate };

  try {
    // Hai batch chạy song song: mỗi batchRunReports chỉ nhận tối đa 5 request,
    // và tách theo nhóm giữ cho việc đọc kết quả theo index dễ lần.
    const [core, breakdowns] = await Promise.all([
      runBatch(propertyId, token, [
        {
          // Hai dateRange trong cùng request → GA4 trả 2 dòng, kỳ này và kỳ trước.
          dateRanges: [currentRange, previousRange],
          metrics: SUMMARY_METRICS.map((name) => ({ name })),
        },
        {
          dateRanges: [currentRange],
          dimensions: [{ name: "date" }],
          metrics: [{ name: "activeUsers" }, { name: "sessions" }],
          orderBys: [{ dimension: { dimensionName: "date" } }],
          limit: 100,
        },
        {
          dateRanges: [currentRange],
          dimensions: [{ name: "pagePath" }],
          metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 10,
        },
      ]),
      runBatch(propertyId, token, [
        {
          dateRanges: [currentRange],
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 8,
        },
        {
          dateRanges: [currentRange],
          dimensions: [{ name: "deviceCategory" }],
          metrics: [{ name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 5,
        },
        {
          dateRanges: [currentRange],
          dimensions: [{ name: "country" }],
          metrics: [{ name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
          limit: 6,
        },
      ]),
    ]);

    const summaryRows = core.reports?.[0]?.rows ?? [];
    const trend: GaTrendPoint[] = (core.reports?.[1]?.rows ?? []).map((row) => ({
      date: normalizeGaDate(dim(row, 0)),
      users: metric(row, 0),
      sessions: metric(row, 1),
    }));
    const topPages: GaPageRow[] = (core.reports?.[2]?.rows ?? []).map((row) => ({
      path: dim(row, 0) || "/",
      views: metric(row, 0),
      users: metric(row, 1),
    }));

    return {
      status: "ok",
      data: {
        summary: toSummary(summaryRows[0]),
        previousSummary: toSummary(summaryRows[1]),
        trend,
        topPages,
        channels: toBreakdown(breakdowns.reports?.[0]),
        devices: toBreakdown(breakdowns.reports?.[1]),
        countries: toBreakdown(breakdowns.reports?.[2]),
      },
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Không gọi được GA4 Data API.",
      data: null,
    };
  }
}
