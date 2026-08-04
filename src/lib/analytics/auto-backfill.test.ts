import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { SnapshotStats } from "@/lib/analytics/snapshot";

/**
 * Trọng tâm: **dựng** lịch sử và **neo** nó là hai việc tách rời.
 *
 * Bug đã sửa: cả hai cùng chờ 3 ngày dữ liệu GA4, nên khi mốc gắn đo nằm ở tương
 * lai (điều kiện đó không bao giờ đạt được) biểu đồ trống vĩnh viễn.
 */

const fetchGaDailyUsers = vi.fn();
const getSnapshotStats = vi.fn();
const replaceDemoSnapshot = vi.fn();
const fetchFirstProfileAt = vi.fn();

vi.mock("@/lib/analytics/ga4", () => ({ fetchGaDailyUsers }));
vi.mock("@/lib/analytics/snapshot", () => ({ getSnapshotStats, replaceDemoSnapshot }));
vi.mock("@/lib/analytics/business", () => ({ fetchFirstProfileAt }));

const CUTOVER = "2026-08-07";

function stats(overrides: Partial<SnapshotStats> = {}): SnapshotStats {
  return {
    demoDays: 0,
    firstDate: null,
    lastDate: null,
    anchored: false,
    error: null,
    ...overrides,
  };
}

/** Module giữ state (khoá chạy chồng, nhịp hỏi lại) nên mỗi test cần bản mới. */
async function load() {
  vi.resetModules();
  return import("@/lib/analytics/auto-backfill");
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-08-04T09:00:00Z"));

  fetchFirstProfileAt.mockResolvedValue("2026-06-04T00:00:00Z");
  fetchGaDailyUsers.mockResolvedValue([]);
  replaceDemoSnapshot.mockResolvedValue({ written: 0, error: null });
  getSnapshotStats.mockResolvedValue(stats());
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ensureBackfilled", () => {
  it("dựng lịch sử ngay dù chưa có ngày thật nào — mốc ở tương lai vẫn ra hình", async () => {
    replaceDemoSnapshot.mockResolvedValue({ written: 64, error: null });

    const { ensureBackfilled } = await load();
    const outcome = await ensureBackfilled(CUTOVER);

    expect(outcome.ran).toBe(true);
    if (!outcome.ran) return;

    // Chưa neo: quy mô mặc định, đánh dấu NULL để lượt sau còn biết phải neo lại.
    expect(outcome.scaleFactor).toBeNull();
    expect(outcome.provisional).toBe(true);
    expect(outcome.to).toBe("2026-08-06"); // hôm trước mốc gắn đo
    expect(replaceDemoSnapshot).toHaveBeenCalledWith(expect.any(Array), null);
  });

  it("đã neo rồi thì không đụng vào DB nữa", async () => {
    getSnapshotStats.mockResolvedValue(
      stats({ demoDays: 64, firstDate: "2026-06-04", lastDate: "2026-08-06", anchored: true }),
    );

    const { ensureBackfilled } = await load();
    const outcome = await ensureBackfilled(CUTOVER);

    expect(outcome.ran).toBe(false);
    if (outcome.ran) return;
    expect(outcome.reason).toBe("already_done");
    expect(replaceDemoSnapshot).not.toHaveBeenCalled();
    expect(fetchGaDailyUsers).not.toHaveBeenCalled();
  });

  it("bản tạm mà vẫn chưa đủ ngày thật thì giữ nguyên, không ghi lại y hệt", async () => {
    getSnapshotStats.mockResolvedValue(
      stats({ demoDays: 64, firstDate: "2026-06-04", lastDate: "2026-08-06" }),
    );

    const { ensureBackfilled } = await load();
    const outcome = await ensureBackfilled(CUTOVER);

    expect(outcome.ran).toBe(false);
    if (outcome.ran) return;
    expect(outcome.reason).toBe("not_ready");
    expect(outcome.provisional).toBe(true);
    expect(replaceDemoSnapshot).not.toHaveBeenCalled();
  });

  it("đủ 3 ngày thật thì neo lại bản tạm bằng hệ số đo được", async () => {
    getSnapshotStats.mockResolvedValue(
      stats({ demoDays: 64, firstDate: "2026-06-04", lastDate: "2026-08-06" }),
    );
    // Mốc lùi về quá khứ để cửa sổ "tới hôm qua" có ngày thật.
    fetchGaDailyUsers.mockResolvedValue([
      { date: "2026-08-01", users: 12 },
      { date: "2026-08-02", users: 14 },
      { date: "2026-08-03", users: 10 },
    ]);
    replaceDemoSnapshot.mockResolvedValue({ written: 58, error: null });

    const { ensureBackfilled } = await load();
    const outcome = await ensureBackfilled("2026-08-01");

    expect(outcome.ran).toBe(true);
    if (!outcome.ran) return;
    expect(outcome.provisional).toBe(false);
    expect(outcome.scaleFactor).toBeGreaterThan(0);
    expect(replaceDemoSnapshot).toHaveBeenCalledWith(expect.any(Array), outcome.scaleFactor);
  });

  it("bản tạm đã hỏi GA4 rồi thì 30 phút sau mới hỏi lại", async () => {
    getSnapshotStats.mockResolvedValue(
      stats({ demoDays: 64, firstDate: "2026-06-04", lastDate: "2026-08-06" }),
    );

    // Mốc trong quá khứ nhưng mới 2 ngày thật: có gọi GA4, mà vẫn chưa neo được.
    fetchGaDailyUsers.mockResolvedValue([
      { date: "2026-08-02", users: 12 },
      { date: "2026-08-03", users: 14 },
    ]);

    const { ensureBackfilled } = await load();
    await ensureBackfilled("2026-08-02");
    const callsAfterFirst = fetchGaDailyUsers.mock.calls.length;
    expect(callsAfterFirst).toBeGreaterThan(0);

    await ensureBackfilled("2026-08-02");
    expect(fetchGaDailyUsers.mock.calls.length).toBe(callsAfterFirst);

    vi.setSystemTime(new Date("2026-08-04T09:31:00Z"));
    await ensureBackfilled("2026-08-02");
    expect(fetchGaDailyUsers.mock.calls.length).toBeGreaterThan(callsAfterFirst);
  });

  it("bảng chưa tồn tại thì nói thẳng, không âm thầm bỏ qua", async () => {
    getSnapshotStats.mockResolvedValue(
      stats({ error: "Chưa chạy migration 026_analytics_daily_snapshot.sql." }),
    );

    const { ensureBackfilled } = await load();
    const outcome = await ensureBackfilled(CUTOVER);

    expect(outcome.ran).toBe(false);
    if (outcome.ran) return;
    expect(outcome.reason).toBe("failed");
    expect(outcome.note).toContain("migration");
  });

  it("không có mốc gắn đo thì chưa biết dựng tới đâu", async () => {
    const { ensureBackfilled } = await load();
    const outcome = await ensureBackfilled(null);

    expect(outcome.ran).toBe(false);
    if (outcome.ran) return;
    expect(outcome.reason).toBe("no_cutover");
    expect(replaceDemoSnapshot).not.toHaveBeenCalled();
  });
});
