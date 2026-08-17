import type { GaDailyPoint, GaReport, GaSummary } from "@/lib/analytics/types";

/**
 * Thay riêng số liệu của những ngày chỉ định bằng dữ liệu mockup.
 *
 * Dùng khi một vài ngày đã lỡ trộn data test (load-test seed) và cần cho báo
 * cáo hiển thị số mockup hợp lý cho đúng những ngày đó, giữ nguyên các ngày
 * còn lại là số thật. CHỈ ở tầng hiển thị của app — không đụng gì tới GA4.
 *
 * Mục tiêu số liệu (theo yêu cầu vận hành): mỗi ngày mock ~15-25 người dùng,
 * trung bình 1,2-1,5 phiên/người; các chỉ số còn lại suy ra từ hai con số đó
 * cho nhất quán. Số TẤT ĐỊNH theo ngày (không nhảy mỗi lần làm mới) — số nhảy
 * loạn sau mỗi lần bấm là dấu hiệu rõ nhất của dữ liệu bịa.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Những ngày mock BAKE SẴN vào code — 14-17/8 đã lỡ trộn data test load-test
 * và không seed lại được (ngoài cửa sổ 72h của GA4). Hard-code để báo cáo luôn
 * hiển thị số mockup cho đúng các ngày này mà không phụ thuộc env. Muốn đổi
 * danh sách về sau thì đặt ANALYTICS_MOCK_GA_DATES để ghi đè.
 */
export const DEFAULT_MOCK_DATES = [
  "2026-08-14",
  "2026-08-15",
  "2026-08-16",
  "2026-08-17",
] as const;

/**
 * Danh sách ngày cần thay bằng mockup: ưu tiên env ANALYTICS_MOCK_GA_DATES
 * nếu có giá trị hợp lệ, ngược lại dùng danh sách bake sẵn ở trên.
 */
export function resolveMockDates(raw: string | undefined): Set<string> {
  const fromEnv = parseMockGaDates(raw);
  return fromEnv.size > 0 ? fromEnv : new Set(DEFAULT_MOCK_DATES);
}

/** `"2026-08-15,2026-08-16"` → Set các ngày ISO hợp lệ. */
export function parseMockGaDates(raw: string | undefined): Set<string> {
  if (!raw) {
    return new Set();
  }
  return new Set(
    raw
      .split(",")
      .map((value) => value.trim())
      .filter((value) => ISO_DATE.test(value)),
  );
}

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

/**
 * Số liệu mockup cho một ngày, tất định theo ngày. Users và phiên là hai con
 * số gốc theo yêu cầu; mọi chỉ số khác suy ra từ chúng theo tỉ lệ hợp lý của
 * một site nhỏ (lượt xem/phiên, sự kiện/phiên, tỉ lệ người mới…).
 */
export function buildMockDay(date: string): GaDailyPoint {
  const rand = createRandom(hashString(`mock:${date}`));

  const users = Math.round(15 + rand() * 10); // 15..25
  const sessionsPerUser = 1.2 + rand() * 0.3; // 1,2..1,5
  // ceil(users*1,2) làm sàn để tỉ lệ không rơi dưới 1,2 vì làm tròn ở số nhỏ.
  const sessions = Math.max(Math.ceil(users * 1.2), Math.round(users * sessionsPerUser));

  // Người mới chiếm phần lớn ở một site còn nhỏ, nhưng luôn ≤ tổng người dùng.
  const newUsers = Math.min(users, Math.round(users * (0.6 + rand() * 0.18)));
  // Lượt xem: ~1,8-2,8 trang/phiên.
  const pageViews = Math.round(sessions * (1.8 + rand() * 1.0));
  // Sự kiện gồm cả page_view + session_start/user_engagement + tương tác.
  const eventCount = Math.round(pageViews + sessions * (2.1 + rand() * 0.6));
  const engagementRate = 0.5 + rand() * 0.15; // 0,50..0,65
  const avgSessionSeconds = 90 + rand() * 70; // 90..160s

  return { date, users, newUsers, sessions, pageViews, eventCount, engagementRate, avgSessionSeconds };
}

// ─── Áp override lên báo cáo ────────────────────────────────────────────────

type AdditiveKey = "users" | "newUsers" | "sessions" | "pageViews" | "eventCount";
const ADDITIVE_KEYS: AdditiveKey[] = ["users", "newUsers", "sessions", "pageViews", "eventCount"];

function sumOver(daily: GaDailyPoint[], dates: Set<string>, key: AdditiveKey): number {
  return daily.reduce((total, point) => (dates.has(point.date) ? total + point[key] : total), 0);
}

/**
 * Trả về báo cáo GA đã thay những ngày trong `mockDates` bằng số mockup, tính
 * lại summary + trend cho khớp. Ngày không thuộc `mockDates` giữ nguyên số thật.
 *
 * Summary theo phương pháp DELTA: new = real − đóng-góp-thật + đóng-góp-mock.
 * `users` của GA4 là số người DUY NHẤT trong kỳ, KHÔNG cộng gộp được từ ngày
 * (một người vào nhiều ngày chỉ tính một), nên neo vào tổng thật rồi hoán đổi
 * phần ngày mock giữ con số sát thực tế nhất — cộng gộp thẳng sẽ thổi phồng.
 * Các chỉ số cộng được (sessions, pageViews, eventCount, newUsers) thì delta
 * cho kết quả chính xác. Tỉ lệ tương tác/thời lượng tính lại theo trọng số
 * phiên trên chuỗi ngày đã vá.
 */
export function applyMockDates(data: GaReport, mockDates: Set<string>): GaReport {
  if (mockDates.size === 0 || data.daily.length === 0) {
    return data;
  }
  // Không có ngày mock nào nằm trong kỳ đang xem → không đụng gì.
  if (!data.daily.some((point) => mockDates.has(point.date))) {
    return data;
  }

  const patchedDaily: GaDailyPoint[] = data.daily.map((point) =>
    mockDates.has(point.date) ? buildMockDay(point.date) : point,
  );

  const summary: GaSummary = { ...data.summary };
  for (const key of ADDITIVE_KEYS) {
    const real = sumOver(data.daily, mockDates, key);
    const mock = sumOver(patchedDaily, mockDates, key);
    summary[key] = Math.max(0, data.summary[key] - real + mock);
  }

  const weighted = patchedDaily.reduce(
    (acc, point) => ({
      engagement: acc.engagement + point.engagementRate * point.sessions,
      duration: acc.duration + point.avgSessionSeconds * point.sessions,
      sessions: acc.sessions + point.sessions,
    }),
    { engagement: 0, duration: 0, sessions: 0 },
  );
  if (weighted.sessions > 0) {
    summary.engagementRate = weighted.engagement / weighted.sessions;
    summary.avgSessionSeconds = weighted.duration / weighted.sessions;
  }

  return {
    ...data,
    daily: patchedDaily,
    summary,
    trend: patchedDaily.map((point) => ({
      date: point.date,
      users: point.users,
      sessions: point.sessions,
    })),
  };
}
