import type { SnapshotRow } from "@/lib/analytics/snapshot";
import type { GaSummary, GaTrendPoint } from "@/lib/analytics/types";

/**
 * Nối lịch sử đã đóng băng (giai đoạn chưa gắn đo) với số thật từ GA4.
 *
 * Quy tắc bất di bất dịch: **một ngày chỉ thuộc về một nguồn**. Ngày nào GA4 có
 * số thì lấy số thật, ngày nào không thì lấy từ snapshot. Không bao giờ cộng
 * hai nguồn cho cùng một ngày — làm vậy là nhân đôi lưu lượng ở vùng giao.
 *
 * Chỉ áp dụng cho GA4. Search Console **không cần nối**: khi verify property,
 * Google trả về tới 16 tháng lịch sử vì nó vẫn ghi nhận impression/click từ
 * trước — phần tìm kiếm là số thật ngay từ ngày đầu.
 */

function toTrendPoint(row: SnapshotRow): GaTrendPoint {
  return { date: row.date, users: row.users, sessions: row.sessions };
}

/**
 * Ghép hai chuỗi theo ngày. Số thật thắng tuyệt đối: nếu một ngày có mặt ở cả
 * hai nguồn (do đặt mốc cắt lệch), bản thật được giữ và bản dựng lại bị bỏ.
 */
export function spliceTrend(
  historical: SnapshotRow[],
  real: GaTrendPoint[],
): GaTrendPoint[] {
  const byDate = new Map<string, GaTrendPoint>();

  for (const row of historical) {
    byDate.set(row.date, toTrendPoint(row));
  }
  for (const point of real) {
    byDate.set(point.date, point);
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Cộng tổng của đoạn lịch sử vào tổng thật.
 *
 * Tỉ lệ tương tác và thời lượng phiên là **trung bình có trọng số theo số
 * phiên**, không phải trung bình cộng của hai con số: đoạn lịch sử có thể dài
 * gấp nhiều lần đoạn thật, lấy trung bình cộng sẽ để vài ngày thật đè bẹp hai
 * tháng lịch sử.
 */
export function spliceGaSummary(historical: SnapshotRow[], real: GaSummary): GaSummary {
  if (historical.length === 0) {
    return real;
  }

  const past = historical.reduce(
    (acc, row) => ({
      users: acc.users + row.users,
      newUsers: acc.newUsers + row.newUsers,
      sessions: acc.sessions + row.sessions,
      pageViews: acc.pageViews + row.pageViews,
      engagementWeighted: acc.engagementWeighted + row.engagementRate * row.sessions,
      durationWeighted: acc.durationWeighted + row.avgSessionSeconds * row.sessions,
    }),
    { users: 0, newUsers: 0, sessions: 0, pageViews: 0, engagementWeighted: 0, durationWeighted: 0 },
  );

  const totalSessions = past.sessions + real.sessions;

  return {
    users: past.users + real.users,
    newUsers: past.newUsers + real.newUsers,
    sessions: totalSessions,
    pageViews: past.pageViews + real.pageViews,
    engagementRate:
      totalSessions > 0
        ? (past.engagementWeighted + real.engagementRate * real.sessions) / totalSessions
        : 0,
    avgSessionSeconds:
      totalSessions > 0
        ? (past.durationWeighted + real.avgSessionSeconds * real.sessions) / totalSessions
        : 0,
  };
}

/** Chỉ giữ những ngày thuộc giai đoạn chưa gắn đo và nằm trong kỳ đang xem. */
export function selectHistorical(
  rows: SnapshotRow[],
  startDate: string,
  endDate: string,
  cutoverDate: string | null,
): SnapshotRow[] {
  if (!cutoverDate) {
    return [];
  }
  return rows.filter(
    (row) => row.date >= startDate && row.date <= endDate && row.date < cutoverDate,
  );
}
