import "server-only";

import type { DateRange } from "@/lib/analytics/date-range";
import { normalizeGaDate } from "@/lib/analytics/date-range";
import { GA4_SCOPE, getGoogleAccessToken, getServiceAccountCredentials, hasServiceAccount } from "@/lib/analytics/google-auth";
import { describeGoogleApiError } from "@/lib/analytics/google-errors";
import type {
  BreakdownRow,
  GaPageRow,
  GaRealtime,
  GaRealtimePoint,
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
  eventCount: 0,
  engagementRate: 0,
  avgSessionSeconds: 0,
};

// Thứ tự phải khớp index trong toSummary bên dưới.
const SUMMARY_METRICS = [
  "activeUsers",
  "newUsers",
  "sessions",
  "screenPageViews",
  "eventCount",
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
    eventCount: metric(row, 4),
    engagementRate: metric(row, 5),
    avgSessionSeconds: metric(row, 6),
  };
}

function toBreakdown(report: GaSingleReport | undefined): BreakdownRow[] {
  return (report?.rows ?? []).map((row) => ({
    label: dim(row, 0) || "(không xác định)",
    value: metric(row, 0),
  }));
}

/**
 * Bộ lọc loại data tổng hợp (load-test) khỏi báo cáo.
 *
 * Chỉ bật khi GA4_EXCLUDE_SYNTHETIC=true. Data API chỉ lọc được tham số tùy
 * biến `data_source` khi property đã ĐĂNG KÝ custom dimension event-scoped cho
 * nó (Admin → Custom definitions → parameter `data_source`); chưa đăng ký mà
 * thêm bộ lọc là API trả lỗi. Vì vậy mặc định TẮT — bật tường minh sau khi đã
 * đăng ký dimension. Tên dimension và giá trị chỉnh được qua env để khớp đúng
 * những gì script seed gắn (data_source = synthetic_load_test).
 */
export function syntheticExclusionFilter(): Record<string, unknown> | null {
  if (process.env.GA4_EXCLUDE_SYNTHETIC !== "true") {
    return null;
  }
  const fieldName = process.env.GA4_SYNTHETIC_DIMENSION?.trim() || "customEvent:data_source";
  const value = process.env.GA4_SYNTHETIC_VALUE?.trim() || "synthetic_load_test";
  return {
    notExpression: {
      filter: {
        fieldName,
        stringFilter: { matchType: "EXACT", value },
      },
    },
  };
}

async function runBatch(
  propertyId: string,
  token: string,
  requests: Record<string, unknown>[],
): Promise<GaBatchResponse> {
  // Gắn bộ lọc loại data test vào mọi request nếu đang bật — làm một chỗ để
  // không truy vấn nào lọt lưới.
  const filter = syntheticExclusionFilter();
  const withFilter = filter
    ? requests.map((request) => ({ ...request, dimensionFilter: filter }))
    : requests;

  const response = await fetch(`${API_BASE}/properties/${propertyId}:batchRunReports`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requests: withFilter }),
    cache: "no-store",
  });

  const data = (await response.json()) as GaBatchResponse;
  if (!response.ok) {
    throw new Error(data.error?.message ?? `GA4 trả về HTTP ${response.status}`);
  }
  return data;
}

/**
 * Chuỗi người dùng theo ngày, chỉ một chỉ số. Dùng để neo lịch sử dựng lại vào
 * mức traffic thật — không cần kéo cả báo cáo đầy đủ chỉ để lấy một cột số.
 *
 * Trả mảng rỗng khi chưa cấu hình hoặc API lỗi: bên gọi coi như "chưa đủ ngày
 * thật" và không neo, thay vì neo bằng số rác.
 */
export async function fetchGaDailyUsers(
  startDate: string,
  endDate: string,
): Promise<{ date: string; users: number }[]> {
  const propertyId = getPropertyId();
  if (!hasServiceAccount() || !propertyId) {
    return [];
  }

  const token = await getGoogleAccessToken(GA4_SCOPE);
  if (!token) {
    return [];
  }

  try {
    const data = await runBatch(propertyId, token, [
      {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
        limit: 400,
      },
    ]);

    return (data.reports?.[0]?.rows ?? []).map((row) => ({
      date: normalizeGaDate(dim(row, 0)),
      users: metric(row, 0),
    }));
  } catch {
    return [];
  }
}

async function runRealtime(
  propertyId: string,
  token: string,
  body: Record<string, unknown>,
): Promise<GaSingleReport> {
  const filter = syntheticExclusionFilter();
  const merged = filter ? { ...body, dimensionFilter: filter } : body;

  const response = await fetch(`${API_BASE}/properties/${propertyId}:runRealtimeReport`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(merged),
    cache: "no-store",
  });

  const data = (await response.json()) as GaSingleReport & { error?: { message?: string } };
  if (!response.ok) {
    throw new Error(data.error?.message ?? `GA4 realtime trả về HTTP ${response.status}`);
  }
  return data;
}

/**
 * Người dùng đang hoạt động — cửa sổ 30 phút của GA4 Realtime API.
 *
 * Hai request thay vì một: tổng phải hỏi riêng (không dimension) vì cộng 30
 * dòng theo phút sẽ đếm trùng người hoạt động ở nhiều phút.
 */
export async function fetchGaRealtime(): Promise<SourceState<GaRealtime>> {
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

  try {
    const [total, perMinute] = await Promise.all([
      runRealtime(propertyId, token, {
        metrics: [{ name: "activeUsers" }],
      }),
      runRealtime(propertyId, token, {
        dimensions: [{ name: "minutesAgo" }],
        metrics: [{ name: "activeUsers" }],
        limit: 30,
      }),
    ]);

    // GA4 bỏ qua những phút không có hoạt động — lấp đủ 30 điểm để biểu đồ
    // không co giãn theo số phút có dữ liệu.
    const byMap = new Map<number, number>();
    for (const row of perMinute.rows ?? []) {
      byMap.set(Number(dim(row, 0)), metric(row, 0));
    }
    const byMinute: GaRealtimePoint[] = Array.from({ length: 30 }, (_, i) => ({
      minutesAgo: 29 - i,
      users: byMap.get(29 - i) ?? 0,
    }));

    return {
      status: "ok",
      data: {
        activeUsers: metric((total.rows ?? [])[0] ?? {}, 0),
        byMinute,
      },
    };
  } catch (error) {
    const raw = error instanceof Error ? error.message : "Không gọi được GA4 Realtime API.";
    return {
      status: "error",
      message: describeGoogleApiError(
        raw,
        "ga4",
        getServiceAccountCredentials()?.email,
        propertyId,
      ),
      detail: `GA4 property ${propertyId} · service account ${getServiceAccountCredentials()?.email ?? "?"} · lỗi gốc: ${raw}`,
      data: null,
    };
  }
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
    const raw = error instanceof Error ? error.message : "Không gọi được GA4 Data API.";
    return {
      status: "error",
      message: describeGoogleApiError(
        raw,
        "ga4",
        getServiceAccountCredentials()?.email,
        propertyId,
      ),
      // Giữ nguyên văn của Google: thông báo đã diễn giải giúp biết phải làm gì,
      // nhưng khi cách đó không ăn thì chỉ còn lỗi gốc là bằng chứng dùng được.
      detail: `GA4 property ${propertyId} · service account ${getServiceAccountCredentials()?.email ?? "?"} · lỗi gốc: ${raw}`,
      data: null,
    };
  }
}
