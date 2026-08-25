import type { DateRange } from "@/lib/analytics/date-range";
import { toIsoDate } from "@/lib/analytics/date-range";
import type {
  BreakdownRow,
  GaDailyPoint,
  GaPageRow,
  GaReport,
  GaSummary,
  GscReport,
  GscRow,
  GscSummary,
} from "@/lib/analytics/types";

/**
 * Bộ SỐ LIỆU MẪU cho tab Báo cáo/Vận hành theo KỊCH BẢN 3 THÁNG HOẠT ĐỘNG của
 * website: 28/5 → 5/9. Câu chuyện: site mở cửa cuối tháng 5, lưu lượng bò lên
 * đều trong 3 tháng, tới 5/9 đạt ~1.900 NGƯỜI DÙNG DUY NHẤT. Kèm các chỉ số phụ
 * trợ (phiên, tương tác, thời lượng, nguồn/thiết bị, và Search Console với CTR
 * ~5%) cho khớp nhau.
 *
 * ⚠️ ĐÂY LÀ SỐ MẪU, KHÔNG PHẢI SỐ ĐO ĐƯỢC. Chỉ dùng để xem trước/demo giao
 * diện. KHÔNG được trình bày như số thật với người ngoài (nhà đầu tư, đối tác…).
 * Route đánh dấu nguồn này `demo: true`, và cờ đó nằm trong response của
 * /api/admin/analytics nên luôn tra được nguồn nào đang chạy số mẫu.
 *
 * Nguyên tắc: TẤT ĐỊNH theo ngày (cùng ngày luôn ra cùng số, không nhảy sau mỗi
 * lần làm mới) và tính theo ngày tuyệt đối, nên một ngày cụ thể trùng khớp dù
 * xem ở kỳ 7, 28 hay 90 ngày.
 */

// Ngày site bắt đầu hoạt động — "Ngày 1" của kịch bản 3 tháng.
const CAMPAIGN_START = "2026-05-28";
// Ngày cuối của kịch bản mẫu (mốc ~1.900 users). Từ NGÀY SAU đó trở đi, dashboard
// nối số GA THẬT (xem buildSampleGaReport splice).
export const SAMPLE_END = "2026-09-05";
const DAY_MS = 86_400_000;

// ─── PRNG tất định (cùng idiom với demo-data) ───────────────────────────────

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

/** Nhiễu quanh 1.0, tất định theo (ngày, salt). */
function jitter(isoDate: string, salt: string, spread: number): number {
  const random = createRandom(hashString(`sample:${isoDate}:${salt}`));
  return 1 + (random() * 2 - 1) * spread;
}

function daysBetween(fromIso: string, toIsoStr: string): number {
  const from = Date.UTC(
    Number(fromIso.slice(0, 4)),
    Number(fromIso.slice(5, 7)) - 1,
    Number(fromIso.slice(8, 10)),
  );
  const to = Date.UTC(
    Number(toIsoStr.slice(0, 4)),
    Number(toIsoStr.slice(5, 7)) - 1,
    Number(toIsoStr.slice(8, 10)),
  );
  return Math.round((to - from) / DAY_MS);
}

// ─── Mô hình lưu lượng theo ngày ────────────────────────────────────────────

/**
 * Người dùng HOẠT ĐỘNG/ngày theo số ngày kể từ Ngày 1 (28/5).
 *
 * - Trước khi mở (dayIndex < 0): gần như không có lưu lượng — chỉ để range lỡ
 *   chờm sang trước 28/5 không bị vỡ. Rơi nhanh về sàn ~4.
 * - Trong 3 tháng chạy: bò lên từ ~8 (ngày mở) tới ~44/ngày (đầu tháng 9) theo
 *   đường bão hoà — tăng nhanh giai đoạn đầu rồi đều dần (site trưởng thành).
 *
 * Hằng số được canh để daily active cộng dồn cả kỳ ~2.900 người-ngày, tương ứng
 * ~1.900 NGƯỜI DÙNG DUY NHẤT (mỗi người ghé ~1,5 ngày) — đúng mốc mục tiêu 5/9.
 */
const OPENING_USERS = 8;

function baseDailyUsers(dayIndex: number): number {
  if (dayIndex < 0) {
    // Trước ngày mở: tụt nhanh về gần 0, sàn 4 để không âm/không vỡ range.
    return Math.max(4, OPENING_USERS * Math.exp(dayIndex / 25));
  }
  // Đường bão hoà: ~8 ngày đầu → ~44 đầu tháng 9. Tăng nhanh rồi đều.
  const gain = 36;
  return OPENING_USERS + gain * (1 - Math.exp(-dayIndex / 45));
}

// Mốc NGƯỜI DÙNG DUY NHẤT của cả kỳ 3 tháng (~1.900 tới 5/9). KPI Users của một
// kỳ trong GA4 là số DUY NHẤT đã loại trùng — KHÔNG phải tổng người hoạt động
// theo ngày cộng lại (một người quay lại nhiều ngày chỉ tính 1). Neo tổng quan
// vào mốc này để KPI không phình to khi kéo 28/90 ngày, đồng thời các chỉ số còn
// lại suy ra từ chính số này nên mọi ô luôn "khớp".
const SAMPLE_TOTAL_USERS = 1900;

// Tổng base users của trọn kỳ (28/5→5/9), làm mẫu số quy đổi "độ phủ" của range
// hiện tại. Range phủ trọn kỳ → độ phủ 1 → đúng mốc 1.900. Range ngắn/tính tới
// hôm nay (trước 5/9) → độ phủ < 1 → số duy nhất "tới thời điểm này".
const CAMPAIGN_BASE_SUM = (() => {
  let sum = 0;
  const lastIndex = daysBetween(CAMPAIGN_START, SAMPLE_END);
  for (let i = 0; i <= lastIndex; i += 1) sum += baseDailyUsers(i);
  return sum;
})();

function buildSampleDay(date: string): GaDailyPoint {
  const dayIndex = daysBetween(CAMPAIGN_START, date);
  const users = Math.max(1, Math.round(baseDailyUsers(dayIndex) * jitter(date, "users", 0.1)));

  // Site đang tăng trưởng: phần lớn là người mới, tỉ lệ nhích giảm dần.
  const newUserShare = Math.max(0.6, 0.78 - Math.max(0, dayIndex) * 0.004);
  const newUsers = Math.min(users, Math.round(users * newUserShare));

  // ~1,3-1,4 phiên/người (tài liệu: tổng phiên ~1.800-2.000).
  const sessions = Math.max(users, Math.round(users * 1.35 * jitter(date, "sessions", 0.05)));
  // ~3,6 lượt xem/phiên (tài liệu: tổng lượt xem ~6.840).
  const pageViews = Math.round(sessions * 3.6 * jitter(date, "views", 0.06));
  // Sự kiện gồm cả page_view + session_start/user_engagement + tương tác.
  const eventCount = Math.round(pageViews + sessions * 2.4 * jitter(date, "events", 0.05));
  // Engagement 58-63%.
  const engagementRate = 0.585 + 0.03 * (createRandom(hashString(`sample:${date}:eng`))() );
  // Thời lượng phiên 2p15 - 2p45 (135-165s).
  const avgSessionSeconds = 135 + 30 * createRandom(hashString(`sample:${date}:dur`))();

  return { date, users, newUsers, sessions, pageViews, eventCount, engagementRate, avgSessionSeconds };
}

function eachDay(startDate: string, endDate: string): GaDailyPoint[] {
  const points: GaDailyPoint[] = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  // Chặn an toàn để vòng lặp không bao giờ chạy vô hạn nếu range hỏng.
  let guard = 0;
  while (cursor <= end && guard < 800) {
    points.push(buildSampleDay(toIsoDate(cursor)));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    guard += 1;
  }
  return points;
}

function summarize(points: GaDailyPoint[]): GaSummary {
  const totals = points.reduce(
    (acc, p) => ({
      users: acc.users + p.users,
      newUsers: acc.newUsers + p.newUsers,
      sessions: acc.sessions + p.sessions,
      pageViews: acc.pageViews + p.pageViews,
      eventCount: acc.eventCount + p.eventCount,
    }),
    { users: 0, newUsers: 0, sessions: 0, pageViews: 0, eventCount: 0 },
  );
  // Tỉ lệ/thời lượng lấy trung bình có trọng số theo phiên.
  const weighted = points.reduce(
    (acc, p) => ({
      engagement: acc.engagement + p.engagementRate * p.sessions,
      duration: acc.duration + p.avgSessionSeconds * p.sessions,
    }),
    { engagement: 0, duration: 0 },
  );
  return {
    ...totals,
    engagementRate: totals.sessions > 0 ? weighted.engagement / totals.sessions : 0,
    avgSessionSeconds: totals.sessions > 0 ? weighted.duration / totals.sessions : 0,
  };
}

/**
 * Tổng quan cho PHẦN MẪU, neo theo NGƯỜI DÙNG DUY NHẤT (~1.900 trọn kỳ) thay vì
 * cộng dồn người hoạt động theo ngày — đúng bản chất GA4 (Users của một kỳ đã
 * loại trùng). Nhờ vậy KPI ổn định, không phình khi kéo 28/90 ngày. Các chỉ số
 * còn lại (người mới, phiên, lượt xem, sự kiện) suy ra từ chính số users theo tỉ
 * lệ 3 tháng (phiên ~1,6×/người; lượt xem ~3,4×phiên) nên mọi ô luôn khớp nhau.
 * Engagement & thời lượng lấy trung bình có trọng số theo phiên của các ngày mẫu.
 */
function anchoredSampleSummary(sampleDays: GaDailyPoint[]): GaSummary {
  const baseSum = sampleDays.reduce(
    (s, p) => s + baseDailyUsers(daysBetween(CAMPAIGN_START, p.date)),
    0,
  );
  // Độ phủ so với trọn kỳ 3 tháng; chặn trần 1,02 để range không bao giờ vọt quá
  // mốc mục tiêu.
  const coverage = CAMPAIGN_BASE_SUM > 0 ? Math.min(1.02, baseSum / CAMPAIGN_BASE_SUM) : 0;
  const users = Math.round(SAMPLE_TOTAL_USERS * coverage);
  const newUsers = Math.round(users * 0.6);
  const sessions = Math.round(users * 1.6);
  const pageViews = Math.round(sessions * 3.4);
  const eventCount = Math.round(pageViews + sessions * 2.4);
  const w = sampleDays.reduce(
    (acc, p) => ({
      eng: acc.eng + p.engagementRate * p.sessions,
      dur: acc.dur + p.avgSessionSeconds * p.sessions,
      s: acc.s + p.sessions,
    }),
    { eng: 0, dur: 0, s: 0 },
  );
  return {
    users,
    newUsers,
    sessions,
    pageViews,
    eventCount,
    engagementRate: w.s > 0 ? w.eng / w.s : 0.6,
    avgSessionSeconds: w.s > 0 ? w.dur / w.s : 150,
  };
}

/** Cộng phần GA THẬT (ngày > 23/8) vào tổng quan mẫu đã neo. */
function mergeRealIntoSummary(sample: GaSummary, realDays: GaDailyPoint[]): GaSummary {
  if (realDays.length === 0) return sample;
  const real = summarize(realDays);
  const sessions = sample.sessions + real.sessions;
  return {
    users: sample.users + real.users,
    newUsers: sample.newUsers + real.newUsers,
    sessions,
    pageViews: sample.pageViews + real.pageViews,
    eventCount: sample.eventCount + real.eventCount,
    engagementRate:
      sessions > 0
        ? (sample.engagementRate * sample.sessions + real.engagementRate * real.sessions) / sessions
        : sample.engagementRate,
    avgSessionSeconds:
      sessions > 0
        ? (sample.avgSessionSeconds * sample.sessions + real.avgSessionSeconds * real.sessions) /
          sessions
        : sample.avgSessionSeconds,
  };
}

// ─── Cơ cấu nguồn / thiết bị / quốc gia / trang (theo tài liệu) ──────────────

// Nguồn truy cập theo tài liệu: Direct 50%, Organic Social 35%, Organic Search
// 15% (không có Unassigned — khớp yêu cầu đã bỏ Unassigned).
const CHANNEL_SHARES: [string, number][] = [
  ["Direct", 0.5],
  ["Organic Social", 0.35],
  ["Organic Search", 0.15],
];
// Thiết bị theo tài liệu: 80% Mobile, 20% Desktop.
const DEVICE_SHARES: [string, number][] = [
  ["mobile", 0.8],
  ["desktop", 0.2],
];
// Các nước khác ngoài Việt Nam — chiếm phần rất nhỏ. Việt Nam gánh phần còn
// lại (xem toCountries) nên bảng quốc gia cộng ĐÚNG bằng tổng người dùng.
const OTHER_COUNTRY_SHARES: [string, number][] = [
  ["United States", 0.008],
  ["Japan", 0.005],
  ["South Korea", 0.004],
  ["Singapore", 0.003],
];
// Trang marketing công khai (khớp PAGES của site), tỉ trọng lượt xem.
const PAGE_SHARES: [string, number][] = [
  ["/", 0.34],
  ["/store", 0.18],
  ["/boxes", 0.15],
  ["/quiz", 0.12],
  ["/about", 0.09],
  ["/boxes/standard", 0.07],
  ["/boxes/first-time-user", 0.05],
];

function toBreakdown(total: number, shares: [string, number][], seed: string): BreakdownRow[] {
  return shares
    .map(([label, share]) => ({
      label,
      value: Math.max(1, Math.round(total * share * jitter(seed, label, 0.04))),
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Bảng quốc gia: các nước khác giữ phần nhỏ, Việt Nam GÁNH phần còn lại để
 * tổng của bảng cộng đúng bằng tổng người dùng của kỳ (khớp KPI users).
 */
function toCountries(totalUsers: number, seed: string): BreakdownRow[] {
  const others = OTHER_COUNTRY_SHARES.map(([label, share]) => ({
    label,
    value: Math.max(1, Math.round(totalUsers * share * jitter(seed, label, 0.12))),
  }));
  const othersTotal = others.reduce((sum, row) => sum + row.value, 0);
  const vietnam = Math.max(1, totalUsers - othersTotal);
  return [{ label: "Vietnam", value: vietnam }, ...others].sort((a, b) => b.value - a.value);
}

function toTopPages(summary: GaSummary, seed: string): GaPageRow[] {
  return PAGE_SHARES.map(([path, share]) => {
    const views = Math.max(1, Math.round(summary.pageViews * share * jitter(seed, path, 0.05)));
    // Suy người dùng của trang từ lượt xem — trang chủ ~1,5 lượt/người, trang
    // sâu hơn thì cao hơn chút.
    const viewsPerUser = path === "/" ? 1.5 : 2.1;
    return { path, views, users: Math.max(1, Math.round(views / viewsPerUser)) };
  }).sort((a, b) => b.views - a.views);
}

/**
 * Báo cáo GA mẫu cho kịch bản 3 tháng.
 *
 * `realDaily` (số GA THẬT theo ngày, nếu có): mọi ngày SAU 5/9 sẽ lấy số thật
 * thay cho sample — tức sample chỉ đóng vai "lịch sử 3 tháng" tới 5/9, còn từ
 * 6/9 dashboard nối GA bình thường. Truyền null/undefined để dùng sample cho
 * toàn kỳ (khi GA thật chưa sẵn).
 */
export function buildSampleGaReport(
  range: DateRange,
  realDaily?: GaDailyPoint[] | null,
): GaReport {
  const sampleDaily = eachDay(range.startDate, range.endDate);
  const realByDate = realDaily ? new Map(realDaily.map((p) => [p.date, p])) : null;
  const daily = sampleDaily.map((point) => {
    if (realByDate && point.date > SAMPLE_END) {
      // Từ 24/8: số GA thật; ngày thật không có bản ghi = chưa có traffic (0).
      return (
        realByDate.get(point.date) ?? {
          date: point.date,
          users: 0,
          newUsers: 0,
          sessions: 0,
          pageViews: 0,
          eventCount: 0,
          engagementRate: 0,
          avgSessionSeconds: 0,
        }
      );
    }
    return point;
  });
  const previous = eachDay(range.previousStartDate, range.previousEndDate);
  // Tổng quan neo theo người dùng duy nhất: phần mẫu (≤ 23/8) neo ~1.450, phần
  // GA thật (> 23/8) cộng thêm bình thường.
  const sampleDays = daily.filter((p) => p.date <= SAMPLE_END);
  const realDays = daily.filter((p) => p.date > SAMPLE_END);
  const summary = mergeRealIntoSummary(anchoredSampleSummary(sampleDays), realDays);
  const seed = range.endDate;

  return {
    summary,
    previousSummary: anchoredSampleSummary(previous),
    trend: daily.map((p) => ({ date: p.date, users: p.users, sessions: p.sessions })),
    daily,
    topPages: toTopPages(summary, `${seed}:pages`),
    channels: toBreakdown(summary.sessions, CHANNEL_SHARES, `${seed}:channel`),
    devices: toBreakdown(summary.users, DEVICE_SHARES, `${seed}:device`),
    countries: toCountries(summary.users, `${seed}:country`),
  };
}

// ─── Search Console mẫu ─────────────────────────────────────────────────────

/**
 * Chỉ tiêu Search Console cho trọn kỳ 3 tháng (28/5→5/9): ~420 click, ~8.400
 * hiển thị → CTR đúng 5% (420/8.400 = 0,05), vị trí trung bình ~9,5. 420 click
 * organic khớp với ~15% "Organic Search" của tổng phiên (~3.040) nên nhất quán
 * với phần GA. CTR luôn suy từ click/hiển thị để hai chỉ số không lệch nhau.
 */
const GSC_TARGET_CLICKS = 420;
const GSC_TARGET_IMPRESSIONS = 8400;
const GSC_TARGET_POSITION = 9.5;
// Số ngày trọn kỳ (28/5→5/9) — dùng chuẩn hoá mục tiêu theo độ dài range đang xem.
const GSC_CAMPAIGN_DAYS = 101;

const GSC_QUERY_SHARES: [string, number, { position: number }][] = [
  ["lumia", 0.2, { position: 2.1 }],
  ["hộp quà chăm sóc giấc ngủ", 0.16, { position: 8.4 }],
  ["quà tặng sức khoẻ tinh thần", 0.12, { position: 11.9 }],
  ["trà thảo mộc dễ ngủ", 0.11, { position: 12.6 }],
  ["bài test chất lượng giấc ngủ", 0.1, { position: 9.3 }],
  ["tinh dầu giúp ngủ ngon", 0.09, { position: 13.1 }],
  ["lumia giấc ngủ", 0.08, { position: 2.6 }],
  ["hộp quà wellness", 0.07, { position: 10.4 }],
];

function gscRow(label: string, clicks: number, impressions: number, position: number): GscRow {
  const safeImpr = Math.max(clicks, impressions);
  return { label, clicks, impressions: safeImpr, ctr: safeImpr > 0 ? clicks / safeImpr : 0, position };
}

/** Phân bổ tổng click/hiển thị của kỳ theo ngày, tỉ lệ thuận số phiên/ngày. */
export function buildSampleGscReport(range: DateRange, siteUrl: string): GscReport {
  const daily = eachDay(range.startDate, range.endDate);
  const totalSessions = daily.reduce((s, p) => s + p.sessions, 0) || 1;
  // Chuẩn hoá mục tiêu theo độ dài kỳ đang xem so với trọn kỳ 3 tháng.
  const scale = daily.length / GSC_CAMPAIGN_DAYS;
  const clicks = Math.round(GSC_TARGET_CLICKS * scale);
  const impressions = Math.round(GSC_TARGET_IMPRESSIONS * scale);

  const trend = daily.map((p) => {
    const w = p.sessions / totalSessions;
    return {
      date: p.date,
      clicks: Math.max(0, Math.round(clicks * w * jitter(p.date, "gsc-click", 0.15))),
      impressions: Math.max(0, Math.round(impressions * w * jitter(p.date, "gsc-impr", 0.12))),
    };
  });

  const summary: GscSummary = {
    clicks,
    impressions,
    ctr: impressions > 0 ? clicks / impressions : 0,
    position: GSC_TARGET_POSITION,
  };
  const prevScale = 0.55; // kỳ trước thấp hơn để thể hiện tăng trưởng.
  const previousSummary: GscSummary = {
    clicks: Math.round(clicks * prevScale),
    impressions: Math.round(impressions * prevScale),
    ctr: summary.ctr * 0.9,
    position: GSC_TARGET_POSITION + 2.4,
  };

  const rows = GSC_QUERY_SHARES.map(([label, share, meta]) =>
    gscRow(
      label,
      Math.max(1, Math.round(clicks * share)),
      Math.max(1, Math.round(impressions * share)),
      meta.position,
    ),
  ).sort((a, b) => b.clicks - a.clicks);

  const base = siteUrl.startsWith("sc-domain:")
    ? `https://${siteUrl.slice("sc-domain:".length)}/`
    : siteUrl;
  const topPages = PAGE_SHARES.slice(0, 6).map(([path, share]) =>
    gscRow(
      `${base.replace(/\/$/, "")}${path}`,
      Math.max(1, Math.round(clicks * share)),
      Math.max(1, Math.round(impressions * share)),
      GSC_TARGET_POSITION + (path === "/" ? -1.5 : 1.2),
    ),
  ).sort((a, b) => b.clicks - a.clicks);

  return { siteUrl, summary, previousSummary, trend, topQueries: rows, topPages };
}
