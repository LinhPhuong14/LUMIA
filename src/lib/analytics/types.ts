import type { DateRange } from "@/lib/analytics/date-range";

/** `ok` = có dữ liệu, `not_configured` = thiếu env, `error` = gọi API hỏng. */
export type SourceStatus = "ok" | "not_configured" | "error";

export type SourceState<T> = {
  status: SourceStatus;
  /** Lý do hiển thị cho admin khi status khác `ok`. */
  message?: string;
  data: T | null;
};

export type BreakdownRow = {
  label: string;
  value: number;
};

export type GaSummary = {
  users: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  /** 0..1 */
  engagementRate: number;
  avgSessionSeconds: number;
};

export type GaTrendPoint = {
  date: string;
  users: number;
  sessions: number;
};

export type GaPageRow = {
  path: string;
  views: number;
  users: number;
};

export type GaReport = {
  summary: GaSummary;
  previousSummary: GaSummary;
  trend: GaTrendPoint[];
  topPages: GaPageRow[];
  channels: BreakdownRow[];
  devices: BreakdownRow[];
  countries: BreakdownRow[];
};

export type GscSummary = {
  clicks: number;
  impressions: number;
  /** 0..1 */
  ctr: number;
  /** Vị trí trung bình trên SERP — càng nhỏ càng tốt. */
  position: number;
};

export type GscTrendPoint = {
  date: string;
  clicks: number;
  impressions: number;
};

export type GscRow = {
  label: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GscReport = {
  siteUrl: string;
  summary: GscSummary;
  previousSummary: GscSummary;
  trend: GscTrendPoint[];
  topQueries: GscRow[];
  topPages: GscRow[];
};

export type VercelState = {
  /** Vercel Web Analytics không có API đọc số liệu công khai — chỉ báo trạng thái. */
  onVercel: boolean;
  environment: string | null;
  projectUrl: string | null;
  analyticsDisabled: boolean;
};

export type AnalyticsReport = {
  range: DateRange;
  generatedAt: string;
  google: SourceState<GaReport>;
  searchConsole: SourceState<GscReport>;
  vercel: VercelState;
};
