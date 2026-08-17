import type { DateRange } from "@/lib/analytics/date-range";
import { toIsoDate } from "@/lib/analytics/date-range";
import type {
  BreakdownRow,
  GaRealtime,
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

/**
 * Trần người dùng/ngày mà đường tăng trưởng tiệm cận. Ở mức 30, mỗi ngày dao
 * động khoảng 23-33 người — cỡ một site vừa mở, marketing chưa chạy hiệu quả.
 * Đây là trần chứ không phải giá trị mỗi ngày: những ngày đầu thấp hơn.
 *
 * Lưu ý về tổng theo kỳ: với lưu lượng đều, tổng của 28 ngày luôn xấp xỉ 4 lần
 * tổng của 7 ngày — đó là số học, không phải lỗi cấu hình. Muốn ba kỳ nhìn
 * cùng thang đo thì so sánh ở biểu đồ (kỳ 90 ngày đã quy về trung bình/ngày),
 * chứ không phải ở ô tổng.
 */
export const DEMO_DEFAULT_PEAK_DAILY_USERS = 30;

/** Google mất khoảng hai tuần mới index xong site mới — trước đó chưa có impression. */
const SEARCH_INDEX_DELAY_DAYS = 14;

/** Trần impression/ngày trên mỗi đơn vị `peakDailyUsers` — giữ hai chỉ số cùng tỉ lệ. */
const IMPRESSIONS_PER_PEAK_USER = 8.6;

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
  eventCount: number;
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
  // GA4 đếm mọi event: mỗi phiên có sẵn session_start + user_engagement (~first_visit
  // cho khách mới), cộng page_view và các tương tác scroll/click. Xấp xỉ lượt xem
  // cộng ~2,4 event/phiên cho phần còn lại.
  const eventCount = Math.round(pageViews + sessions * 2.4 * jitter(isoDate, "events", 0.07));

  // Search Console: chưa index thì chưa có impression, sau đó mới bò lên.
  // Trần impression buộc theo quy mô site (`peakDailyUsers`) thay vì hardcode,
  // để chỉnh một tham số là cả traffic lẫn hiển thị tìm kiếm co giãn cùng nhau.
  const searchDay = daysSinceLaunch - SEARCH_INDEX_DELAY_DAYS;
  const impressionCeiling = calibration.peakDailyUsers * IMPRESSIONS_PER_PEAK_USER;
  const impressions =
    searchDay < 0
      ? 0
      : Math.round(
          impressionCeiling *
            (1 - Math.exp(-searchDay / 30)) *
            weekdayFactor(date) *
            jitter(isoDate, "imp", 0.18),
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
    eventCount,
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

/** Chuỗi theo ngày của bộ sinh — dùng khi đóng băng lịch sử vào DB. */
export type DemoDailyPoint = DailyPoint;

/**
 * Chuỗi theo ngày cho một khoảng bất kỳ. Tách ra public để bước đóng băng lịch
 * sử dùng đúng cùng một bộ sinh với báo cáo, không phải viết lại logic lần hai.
 */
export function buildDemoDailySeries(
  startDate: string,
  endDate: string,
  calibration: DemoCalibration,
): DemoDailyPoint[] {
  return eachDay(startDate, endDate, calibration);
}

// ─── Tỉ trọng các nhóm ───────────────────────────────────────────────────────

/**
 * Kênh vào site khi marketing chưa chạy hiệu quả: phần lớn là Direct — người
 * đã biết thương hiệu, bạn bè, khách được giới thiệu tay đôi. Organic Social
 * có nhưng chưa kéo được nhiều, còn Organic Search thấp vì domain chưa có tuổi.
 */
// Cố tình KHÔNG có "Unassigned": báo cáo chỉ hiện các nguồn xác định được, tổng
// là tổng của các nguồn đó (toBreakdown nhân thẳng total×share nên bỏ một dòng
// không co giãn các dòng còn lại).
const CHANNEL_SHARES: [string, number][] = [
  ["Direct", 0.38],
  ["Organic Social", 0.24],
  ["Organic Search", 0.18],
  ["Referral", 0.12],
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

/**
 * `[đường dẫn, tỉ trọng lượt xem, lượt xem trung bình mỗi người]`.
 *
 * Tỉ lệ lượt-xem/người mới là chỗ phân biệt hai loại trang: trang marketing
 * xem một lần rồi thôi (~1,3-2,3), còn khu vực đã đăng nhập được người dùng
 * thật quay lại hằng ngày nên cao hơn nhiều (~3-6,5). Thiếu khu vực đăng nhập
 * trong bảng này thì báo cáo trông như site chưa có ai dùng thật.
 */
const PAGE_SHARES: [string, number, number][] = [
  ["/", 0.21, 1.6],
  ["/store", 0.12, 2.1],
  ["/dashboard", 0.105, 6.5],
  ["/quiz", 0.088, 1.9],
  ["/journal", 0.078, 5.8],
  ["/boxes", 0.068, 2.3],
  ["/ai", 0.06, 4.2],
  ["/audio", 0.052, 3.6],
  ["/boxes/standard", 0.042, 2],
  ["/about", 0.036, 1.3],
  ["/journey", 0.031, 3.1],
  ["/login", 0.026, 2.4],
  ["/boxes/first-time-user", 0.022, 2],
  ["/mood-test", 0.018, 2.8],
];

/**
 * Blog đang bị ẩn khỏi điều hướng (xem `marketingNavLinks`, `footerColumns` và
 * tab Blog trong admin), nên không có đường nào dẫn tới `/blog` — dữ liệu mẫu
 * không được bịa lưu lượng cho nó. Bỏ chặn này khi bật blog trở lại.
 */
const HIDDEN_PATH_PREFIXES = ["/blog"];

function isHiddenPath(path: string): boolean {
  return HIDDEN_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/** GA4 chỉ trả về top 10 đường dẫn, giữ đúng con số đó cho khớp API thật. */
const TOP_PAGES_LIMIT = 10;

/**
 * Từ khoá tiếng Việt quanh chủ đề giấc ngủ; `lumia` là truy vấn thương hiệu.
 * Không có blog nghĩa là không có trang nội dung để hứng truy vấn kiểu
 * "cách/mẹo/hướng dẫn", nên cơ cấu nghiêng hẳn về truy vấn thương hiệu và
 * sản phẩm — đúng với những gì site thật sự có trang để xếp hạng.
 */
const QUERY_SHARES: [string, number, { ctr: number; position: number }][] = [
  ["lumia", 0.19, { ctr: 0.243, position: 1.8 }],
  ["hộp quà chăm sóc giấc ngủ", 0.15, { ctr: 0.052, position: 8.4 }],
  ["quà tặng sức khoẻ tinh thần", 0.115, { ctr: 0.031, position: 11.9 }],
  ["trà thảo mộc dễ ngủ", 0.105, { ctr: 0.028, position: 13.2 }],
  ["bài test chất lượng giấc ngủ", 0.095, { ctr: 0.035, position: 10.3 }],
  ["tinh dầu giúp ngủ ngon", 0.088, { ctr: 0.026, position: 14.8 }],
  ["lumia giấc ngủ", 0.075, { ctr: 0.198, position: 2.3 }],
  ["cách cải thiện giấc ngủ", 0.068, { ctr: 0.021, position: 16.7 }],
  ["app theo dõi giấc ngủ tiếng việt", 0.06, { ctr: 0.018, position: 21.4 }],
  ["hộp quà wellness", 0.054, { ctr: 0.029, position: 12.6 }],
];

const SEARCH_PAGE_SHARES: [string, number, { ctr: number; position: number }][] = [
  ["/", 0.38, { ctr: 0.041, position: 6.2 }],
  ["/store", 0.22, { ctr: 0.029, position: 11.4 }],
  ["/quiz", 0.17, { ctr: 0.033, position: 10.1 }],
  ["/boxes", 0.13, { ctr: 0.024, position: 15.6 }],
  ["/about", 0.1, { ctr: 0.017, position: 22.3 }],
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
      eventCount: acc.eventCount + point.eventCount,
    }),
    { users: 0, newUsers: 0, sessions: 0, pageViews: 0, eventCount: 0 },
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

/**
 * Trần chuyển đổi khách ghé → tài khoản. Site nhỏ đi bằng giới thiệu tay đôi
 * có thể đạt rất cao, nhưng vượt 25% thì là dấu hiệu số liệu sai chứ không
 * phải marketing giỏi.
 */
const SIGNUP_CONVERSION_CEILING = 0.25;

/**
 * Nâng quy mô dữ liệu mẫu cho đủ phủ số tài khoản **thật** đã đăng ký trong kỳ.
 *
 * Không có bước này, báo cáo sẽ tự mâu thuẫn ngay trên một màn hình: khối Kinh
 * doanh đọc từ DB có thể hiện 400 tài khoản mới trong khi khối Truy cập chỉ có
 * 233 khách ghé — nhiều người đăng ký hơn người vào site là điều bất khả.
 *
 * Đây là **sàn**, không phải mục tiêu: khi số tài khoản thật đã nằm gọn dưới
 * trần chuyển đổi thì giữ nguyên quy mô đã cấu hình.
 */
export function calibrateForSignups(
  range: DateRange,
  calibration: DemoCalibration,
  signupsInPeriod: number,
): DemoCalibration {
  if (!Number.isFinite(signupsInPeriod) || signupsInPeriod <= 0) {
    return calibration;
  }

  const baseUsers = summarize(eachDay(range.startDate, range.endDate, calibration)).users;
  const requiredUsers = Math.ceil(signupsInPeriod / SIGNUP_CONVERSION_CEILING);

  if (baseUsers >= requiredUsers || baseUsers <= 0) {
    return calibration;
  }

  return {
    ...calibration,
    // Biên 2%: số của từng ngày được làm tròn nên nhân tuyến tính rồi round lại
    // có thể hụt vài đơn vị so với mục tiêu, đủ để phá vỡ đúng cái sàn này.
    peakDailyUsers: calibration.peakDailyUsers * (requiredUsers / baseUsers) * 1.02,
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
    daily: current.map((point) => ({
      date: point.date,
      users: point.users,
      newUsers: point.newUsers,
      sessions: point.sessions,
      pageViews: point.pageViews,
      eventCount: point.eventCount,
      engagementRate: point.engagementRate,
      avgSessionSeconds: point.sessionSeconds,
    })),
    topPages: PAGE_SHARES.filter(([path]) => !isHiddenPath(path)).map(([path, share, viewsPerUser]) => {
      const views = Math.max(1, Math.round(summary.pageViews * share * jitter(seed, path, 0.05)));
      return {
        path,
        views,
        // Suy người dùng ra từ lượt xem theo tỉ lệ riêng của từng trang, thay vì
        // dùng chung một hệ số — nếu không, trang dashboard sẽ có số người dùng
        // ngang trang chủ, điều không xảy ra ở site thật.
        users: Math.max(1, Math.round(views / viewsPerUser)),
      };
    })
      .sort((a, b) => b.views - a.views)
      .slice(0, TOP_PAGES_LIMIT),
    channels: toBreakdown(summary.sessions, CHANNEL_SHARES, `${seed}:channel`),
    devices: toBreakdown(summary.users, DEVICE_SHARES, `${seed}:device`),
    countries: toBreakdown(summary.users, COUNTRY_SHARES, `${seed}:country`),
  };
}

/**
 * Nhịp trong ngày cho realtime mẫu (giờ Việt Nam): đêm gần như im, nhích dần
 * buổi sáng, cao nhất buổi tối trước giờ ngủ — đúng nhịp một site về giấc ngủ.
 */
const HOURLY_ACTIVITY = [
  0.15, 0.08, 0.05, 0.04, 0.05, 0.12, 0.25, 0.4, 0.5, 0.55, 0.6, 0.65,
  0.7, 0.6, 0.55, 0.55, 0.6, 0.7, 0.8, 0.95, 1, 0.9, 0.6, 0.3,
];

/** Múi giờ hiển thị của báo cáo — trùng múi giờ property GA4. */
const REALTIME_TZ_OFFSET_HOURS = 7;

/**
 * Realtime mẫu, tất định theo (phút hiện tại, calibration): trong cùng một phút
 * mọi lần gọi ra cùng con số — làm mới liên tục thấy số đứng yên rồi đổi theo
 * phút, giống hành vi của số realtime thật; đổi loạn xạ mỗi lần bấm là lộ ngay
 * số bịa. `at` nhận từ ngoài để test được.
 */
export function buildDemoGaRealtime(calibration: DemoCalibration, at: Date = new Date()): GaRealtime {
  const minuteEpoch = Math.floor(at.getTime() / 60_000);

  // Mức "đang hoạt động" hợp lý so với quy mô ngày: một site có N người/ngày
  // thì một phút bất kỳ chỉ có cỡ vài phần trăm đang online, nhân nhịp giờ.
  const byMinute = Array.from({ length: 30 }, (_, i) => {
    const minutesAgo = 29 - i;
    const pointEpoch = minuteEpoch - minutesAgo;
    const hour = Math.floor((pointEpoch / 60 + REALTIME_TZ_OFFSET_HOURS) % 24);
    const base = calibration.peakDailyUsers * 0.06 * HOURLY_ACTIVITY[hour];
    const random = createRandom(hashString(`realtime:${pointEpoch}`));
    return {
      minutesAgo,
      users: Math.max(0, Math.round(base * (0.6 + random() * 0.9))),
    };
  });

  // Tổng 30 phút: lớn hơn phút cao nhất (có người vào-ra suốt cửa sổ) nhưng
  // nhỏ hơn tổng cộng dồn (một người hoạt động nhiều phút chỉ đếm một lần).
  const peakMinute = Math.max(...byMinute.map((point) => point.users), 0);
  const summed = byMinute.reduce((total, point) => total + point.users, 0);
  const activeUsers = Math.max(peakMinute, Math.round(summed * 0.45));

  return { activeUsers, byMinute };
}

function toSearchRows(
  totalClicks: number,
  shares: [string, number, { ctr: number; position: number }][],
  seed: string,
): GscRow[] {
  return shares
    .filter(([label]) => !isHiddenPath(label))
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
