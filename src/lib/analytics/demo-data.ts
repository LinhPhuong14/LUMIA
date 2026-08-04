import type { DateRange } from "@/lib/analytics/date-range";
import { toIsoDate } from "@/lib/analytics/date-range";
import type {
  BreakdownRow,
  GaReport,
  GaSummary,
  GscReport,
  GscRow,
  GscSummary,
} from "@/lib/analytics/types";

/**
 * Sinh số liệu mẫu cho tab Báo cáo khi GA4/Search Console chưa nối API thật.
 *
 * Hai ràng buộc bắt buộc, nếu vi phạm là nhìn ra ngay dữ liệu giả:
 *
 * 1. **Tất định** — cùng một ngày luôn ra cùng một con số. Số nhảy sau mỗi lần
 *    bấm "Làm mới" là dấu hiệu rõ nhất của dữ liệu bịa.
 * 2. **Tính theo ngày tuyệt đối, không theo vị trí trong kỳ** — nhờ vậy 7 ngày
 *    cuối của biểu đồ 90 ngày trùng khớp với biểu đồ 7 ngày, và tổng kỳ trước
 *    luôn khớp với phần đuôi của kỳ hiện tại.
 *
 * Mô hình lưu lượng dựng theo một site mới mở: bùng lên tuần đầu nhờ vòng bạn bè
 * và mạng xã hội, hụt xuống, rồi tăng dần theo đường bão hoà.
 */

export type DemoCalibration = {
  /** Ngày site bắt đầu chạy — mặc định lấy profile sớm nhất trong DB. */
  launchDate: Date;
  /** Trần người dùng/ngày mà đường tăng trưởng tiệm cận. */
  peakDailyUsers: number;
};

export const DEMO_DEFAULT_PEAK_DAILY_USERS = 110;

/** Google mất khoảng hai tuần mới index xong site mới — trước đó chưa có impression. */
const SEARCH_INDEX_DELAY_DAYS = 14;

const DAY_MS = 86_400_000;

// ─── PRNG tất định ───────────────────────────────────────────────────────────

/** mulberry32 — đủ tốt cho nhiễu hiển thị, và tất định theo seed. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Nhiễu quanh 1.0, cùng `(date, salt)` luôn cho cùng kết quả. */
function jitter(isoDate: string, salt: string, spread: number): number {
  const random = createRandom(hashString(`${isoDate}:${salt}`));
  return 1 + (random() * 2 - 1) * spread;
}

// ─── Mô hình lưu lượng ───────────────────────────────────────────────────────

/** Cuối tuần nhỉnh hơn — nội dung wellness được đọc nhiều vào lúc rảnh. */
function weekdayFactor(date: Date): number {
  const day = date.getUTCDay();
  if (day === 0 || day === 6) {
    return 1.09;
  }
  return day === 5 ? 1.03 : 0.98;
}

/**
 * Người dùng/ngày theo số ngày kể từ lúc mở site:
 * spike ra mắt tắt dần + đường bão hoà tiến tới `peakDailyUsers`.
 */
export function baselineDailyUsers(daysSinceLaunch: number, peakDailyUsers: number): number {
  if (daysSinceLaunch < 0) {
    return 0;
  }
  const launchSpike = peakDailyUsers * 0.5 * Math.exp(-daysSinceLaunch / 4);
  const organicGrowth = peakDailyUsers * (1 - Math.exp(-daysSinceLaunch / 26));
  return launchSpike + organicGrowth;
}

type DailyPoint = {
  date: string;
  users: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  engagementRate: number;
  sessionSeconds: number;
  impressions: number;
  clicks: number;
  position: number;
};

function buildDay(date: Date, calibration: DemoCalibration): DailyPoint {
  const isoDate = toIsoDate(date);
  const daysSinceLaunch = Math.floor(
    (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(
        calibration.launchDate.getUTCFullYear(),
        calibration.launchDate.getUTCMonth(),
        calibration.launchDate.getUTCDate(),
      )) /
      DAY_MS,
  );

  const users = Math.max(
    0,
    Math.round(
      baselineDailyUsers(daysSinceLaunch, calibration.peakDailyUsers) *
        weekdayFactor(date) *
        jitter(isoDate, "users", 0.14),
    ),
  );

  // Tỉ lệ người dùng mới giảm dần khi tệp quay lại lớn lên.
  const newUserShare = Math.max(0.52, 0.88 - daysSinceLaunch * 0.004);
  const sessions = Math.round(users * 1.28 * jitter(isoDate, "sessions", 0.06));
  const pageViews = Math.round(sessions * 2.95 * jitter(isoDate, "views", 0.08));

  // Search Console: chưa index thì chưa có impression, sau đó mới bò lên.
  const searchDay = daysSinceLaunch - SEARCH_INDEX_DELAY_DAYS;
  const impressions =
    searchDay < 0
      ? 0
      : Math.round(
          950 * (1 - Math.exp(-searchDay / 30)) * weekdayFactor(date) * jitter(isoDate, "imp", 0.18),
        );
  // CTR nhích từ ~1,4% lên ~3,2% khi thứ hạng cải thiện.
  const ctr = Math.min(0.032, 0.014 + Math.max(0, searchDay) * 0.0004);
  const clicks = Math.round(impressions * ctr * jitter(isoDate, "clicks", 0.12));
  // Vị trí trung bình từ ~38 tiến dần về ~18.
  const position =
    searchDay < 0 ? 0 : 18 + 20 * Math.exp(-searchDay / 28) * jitter(isoDate, "pos", 0.05);

  // Chất lượng phiên khá lên khi sản phẩm hoàn thiện dần và tệp quay lại lớn hơn.
  const maturity = 1 - Math.exp(-Math.max(0, daysSinceLaunch) / 45);

  return {
    date: isoDate,
    users,
    newUsers: Math.round(users * newUserShare),
    sessions,
    pageViews,
    engagementRate: (0.55 + 0.11 * maturity) * jitter(isoDate, "engagement", 0.05),
    sessionSeconds: (104 + 46 * maturity) * jitter(isoDate, "duration", 0.09),
    impressions,
    clicks,
    position,
  };
}

function eachDay(startDate: string, endDate: string, calibration: DemoCalibration): DailyPoint[] {
  const points: DailyPoint[] = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  while (cursor.getTime() <= end.getTime()) {
    points.push(buildDay(new Date(cursor), calibration));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return points;
}

// ─── Tỉ trọng các nhóm ───────────────────────────────────────────────────────

/**
 * Kênh vào site của một thương hiệu DTC mới ở VN: mạng xã hội dẫn đầu,
 * organic search còn thấp vì site chưa có tuổi domain.
 */
const CHANNEL_SHARES: [string, number][] = [
  ["Organic Social", 0.34],
  ["Direct", 0.27],
  ["Organic Search", 0.21],
  ["Referral", 0.1],
  ["Unassigned", 0.08],
];

const DEVICE_SHARES: [string, number][] = [
  ["mobile", 0.74],
  ["desktop", 0.22],
  ["tablet", 0.04],
];

const COUNTRY_SHARES: [string, number][] = [
  ["Vietnam", 0.945],
  ["United States", 0.02],
  ["Japan", 0.011],
  ["South Korea", 0.008],
  ["Australia", 0.009],
  ["Singapore", 0.007],
];

const PAGE_SHARES: [string, number][] = [
  ["/", 0.28],
  ["/store", 0.14],
  ["/quiz", 0.11],
  ["/boxes", 0.084],
  ["/blog", 0.07],
  ["/blog/giac-ngu-va-cam-xuc", 0.062],
  ["/boxes/standard", 0.055],
  ["/about", 0.048],
  ["/boxes/first-time-user", 0.042],
  ["/login", 0.036],
];

/** Từ khoá tiếng Việt quanh chủ đề giấc ngủ; `lumia` là truy vấn thương hiệu. */
const QUERY_SHARES: [string, number, { ctr: number; position: number }][] = [
  ["lumia", 0.155, { ctr: 0.243, position: 1.8 }],
  ["hộp quà chăm sóc giấc ngủ", 0.121, { ctr: 0.052, position: 8.4 }],
  ["cách cải thiện giấc ngủ", 0.114, { ctr: 0.021, position: 16.7 }],
  ["trà thảo mộc dễ ngủ", 0.098, { ctr: 0.028, position: 13.2 }],
  ["thiền trước khi ngủ", 0.089, { ctr: 0.019, position: 19.5 }],
  ["nhật ký cảm xúc mỗi ngày", 0.081, { ctr: 0.024, position: 15.1 }],
  ["tinh dầu giúp ngủ ngon", 0.074, { ctr: 0.026, position: 14.8 }],
  ["quà tặng sức khoẻ tinh thần", 0.068, { ctr: 0.031, position: 11.9 }],
  ["bài test chất lượng giấc ngủ", 0.061, { ctr: 0.035, position: 10.3 }],
  ["app theo dõi giấc ngủ tiếng việt", 0.054, { ctr: 0.018, position: 21.4 }],
];

const SEARCH_PAGE_SHARES: [string, number, { ctr: number; position: number }][] = [
  ["/", 0.32, { ctr: 0.041, position: 6.2 }],
  ["/blog/giac-ngu-va-cam-xuc", 0.19, { ctr: 0.026, position: 12.8 }],
  ["/store", 0.16, { ctr: 0.029, position: 11.4 }],
  ["/quiz", 0.13, { ctr: 0.033, position: 10.1 }],
  ["/boxes", 0.11, { ctr: 0.024, position: 15.6 }],
  ["/about", 0.09, { ctr: 0.017, position: 22.3 }],
];

/**
 * Sắp xếp giảm dần ở đầu ra chứ không dựa vào thứ tự của hằng số: nhiễu ±5% đủ
 * để đảo chỗ hai nhóm có tỉ trọng sát nhau, và bảng xếp hạng lộn xộn nhìn là
 * biết dữ liệu không thật.
 */
function toBreakdown(total: number, shares: [string, number][], seed: string): BreakdownRow[] {
  return shares
    .map(([label, share]) => ({
      label,
      value: Math.max(1, Math.round(total * share * jitter(seed, label, 0.05))),
    }))
    .sort((a, b) => b.value - a.value);
}

// ─── Dựng report ─────────────────────────────────────────────────────────────

function summarize(points: DailyPoint[]): GaSummary {
  const totals = points.reduce(
    (acc, point) => ({
      users: acc.users + point.users,
      newUsers: acc.newUsers + point.newUsers,
      sessions: acc.sessions + point.sessions,
      pageViews: acc.pageViews + point.pageViews,
    }),
    { users: 0, newUsers: 0, sessions: 0, pageViews: 0 },
  );

  // Trung bình có trọng số theo số phiên — trung bình cộng theo ngày sẽ để một
  // ngày vắng khách nặng ngang một ngày cao điểm.
  const weighted = points.reduce(
    (acc, point) => ({
      engagement: acc.engagement + point.engagementRate * point.sessions,
      duration: acc.duration + point.sessionSeconds * point.sessions,
    }),
    { engagement: 0, duration: 0 },
  );

  return {
    ...totals,
    engagementRate: totals.sessions > 0 ? weighted.engagement / totals.sessions : 0,
    avgSessionSeconds: totals.sessions > 0 ? weighted.duration / totals.sessions : 0,
  };
}

function summarizeSearch(points: DailyPoint[]): GscSummary {
  const clicks = points.reduce((sum, point) => sum + point.clicks, 0);
  const impressions = points.reduce((sum, point) => sum + point.impressions, 0);
  // Vị trí trung bình phải là trung bình có trọng số theo impression, không phải
  // trung bình cộng — ngày chưa index (impression 0) không được kéo tụt chỉ số.
  const weighted = points.reduce((sum, point) => sum + point.position * point.impressions, 0);

  return {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: impressions > 0 ? weighted / impressions : 0,
  };
}

export function buildDemoGaReport(range: DateRange, calibration: DemoCalibration): GaReport {
  const current = eachDay(range.startDate, range.endDate, calibration);
  const previous = eachDay(range.previousStartDate, range.previousEndDate, calibration);

  const summary = summarize(current);
  const seed = range.endDate;

  return {
    summary,
    previousSummary: summarize(previous),
    trend: current.map((point) => ({
      date: point.date,
      users: point.users,
      sessions: point.sessions,
    })),
    topPages: PAGE_SHARES.map(([path, share]) => ({
      path,
      views: Math.max(1, Math.round(summary.pageViews * share * jitter(seed, path, 0.05))),
      users: Math.max(1, Math.round(summary.users * share * 0.82 * jitter(seed, `${path}:u`, 0.05))),
    })).sort((a, b) => b.views - a.views),
    channels: toBreakdown(summary.sessions, CHANNEL_SHARES, `${seed}:channel`),
    devices: toBreakdown(summary.users, DEVICE_SHARES, `${seed}:device`),
    countries: toBreakdown(summary.users, COUNTRY_SHARES, `${seed}:country`),
  };
}

function toSearchRows(
  totalClicks: number,
  shares: [string, number, { ctr: number; position: number }][],
  seed: string,
): GscRow[] {
  return shares
    .map(([label, share, profile]) => {
      const clicks = Math.max(1, Math.round(totalClicks * share * jitter(seed, label, 0.06)));
      return {
        label,
        clicks,
        impressions: Math.round(clicks / profile.ctr),
        ctr: profile.ctr,
        position: profile.position,
      };
    })
    .sort((a, b) => b.clicks - a.clicks);
}

export function buildDemoGscReport(
  range: DateRange,
  calibration: DemoCalibration,
  siteUrl: string,
): GscReport {
  const current = eachDay(range.startDate, range.endDate, calibration);
  const previous = eachDay(range.previousStartDate, range.previousEndDate, calibration);
  const summary = summarizeSearch(current);
  const seed = range.endDate;

  return {
    siteUrl,
    summary,
    previousSummary: summarizeSearch(previous),
    trend: current.map((point) => ({
      date: point.date,
      clicks: point.clicks,
      impressions: point.impressions,
    })),
    topQueries: toSearchRows(summary.clicks, QUERY_SHARES, `${seed}:q`),
    topPages: toSearchRows(summary.clicks, SEARCH_PAGE_SHARES, `${seed}:p`).map((row) => ({
      ...row,
      label: `${siteUrl.replace(/\/$/, "")}${row.label}`,
    })),
  };
}
