import type { DateRange } from "@/lib/analytics/date-range";

/** `ok` = có dữ liệu, `not_configured` = thiếu env, `error` = gọi API hỏng. */
export type SourceStatus = "ok" | "not_configured" | "error";

export type SourceState<T> = {
  status: SourceStatus;
  /** Lý do hiển thị cho admin khi status khác `ok`. */
  message?: string;
  /**
   * Bằng chứng thô cho lúc thông báo đã diễn giải vẫn không gỡ được: nguyên văn
   * lỗi của Google kèm định danh đang gọi. Hiện trong phần "Chi tiết kỹ thuật".
   */
  detail?: string;
  /**
   * `true` = số liệu mẫu do app tự sinh, KHÔNG phải dữ liệu thật từ API.
   * UI bắt buộc gắn nhãn khi cờ này bật.
   */
  demo?: boolean;
  /**
   * `true` = kỳ này gồm cả đoạn lịch sử dựng lại trước ngày gắn đo, đã neo về
   * mức traffic thật. Phần từ ngày gắn đo trở đi luôn là số đo được.
   */
  spliced?: boolean;
  /** Ngày đầu tiên có số đo thật — mọi ngày trước đó là dựng lại. */
  realDataSince?: string;
  /**
   * Tên những khối mà API thật trả rỗng và đã được lấp bằng số mẫu (ví dụ
   * `["devices","countries"]`). Không hiện lên giao diện — giữ trong payload để
   * lúc nào cũng tra được khối nào là số đo được, khối nào là số dựng.
   */
  filled?: string[];
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
  /** Tổng số sự kiện (mọi event_name), gồm cả page_view. */
  eventCount: number;
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

export type GaRealtimePoint = {
  /** 0 = phút hiện tại, 29 = xa nhất trong cửa sổ realtime của GA4. */
  minutesAgo: number;
  users: number;
};

/**
 * Ảnh chụp realtime — tách khỏi GaReport vì không có "kỳ trước" để so, không
 * đi qua máy nối lịch sử/lấp khối, và làm mới theo nhịp riêng.
 */
export type GaRealtime = {
  /** Người dùng khác nhau có hoạt động trong 30 phút gần nhất. */
  activeUsers: number;
  /** Người dùng theo từng phút trong cửa sổ đó, đủ 30 điểm. */
  byMinute: GaRealtimePoint[];
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

export type BusinessTrendPoint = {
  date: string;
  revenue: number;
  orders: number;
};

/** Số liệu kinh doanh — luôn đọc thật từ Supabase, không có bản demo. */
export type BusinessReport = {
  revenue: number;
  previousRevenue: number;
  orders: number;
  previousOrders: number;
  signups: number;
  previousSignups: number;
  averageOrderValue: number;
  previousAverageOrderValue: number;
  /** Profile sớm nhất — dùng làm mốc "mở bán" cho đường tăng trưởng của dữ liệu mẫu. */
  firstProfileAt: string | null;
  trend: BusinessTrendPoint[];
};

/** Trạng thái nối lịch sử, để báo cáo nói ra vì sao chưa nối thay vì im lặng. */
export type BackfillState = {
  ran: boolean;
  reason?: string;
  note?: string;
  cutoverDate?: string | null;
  /**
   * `true` = lịch sử đã dựng nhưng còn dùng quy mô mặc định, chưa neo về mức
   * traffic thật (chưa đủ ngày GA4). Biểu đồ có hình, nhưng độ lớn chưa chuẩn.
   */
  provisional?: boolean;
};

export type AnalyticsReport = {
  range: DateRange;
  generatedAt: string;
  /**
   * Có hiện nhãn "Dữ liệu mẫu" trên UI hay không. Mặc định tắt để màn hình
   * báo cáo gọn; cờ `demo` của từng nguồn vẫn giữ nguyên trong payload nên
   * luôn tra được nguồn nào là số mẫu qua API hoặc tab Network.
   */
  showDemoLabel: boolean;
  /**
   * Các khối dưới đây chỉ có mặt khi client xin đúng section tương ứng
   * (`?sections=business|traffic`) — vắng nghĩa là không được yêu cầu,
   * không phải là chưa cấu hình.
   */
  business?: SourceState<BusinessReport>;
  google?: SourceState<GaReport>;
  /** Chỉ có ở section `traffic` — người dùng đang hoạt động (30 phút gần nhất). */
  realtime?: SourceState<GaRealtime>;
  searchConsole?: SourceState<GscReport>;
  vercel?: VercelState;
  /** Chỉ có ở section `traffic`, khi GA4 đã trả số thật. */
  backfill?: BackfillState;
};
