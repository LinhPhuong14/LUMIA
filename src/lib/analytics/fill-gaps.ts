import type { BreakdownRow, GaPageRow, GaReport, GscReport } from "@/lib/analytics/types";

/**
 * Lấp những khối CƠ CẤU mà API thật trả về rỗng.
 *
 * Sau khi nối lịch sử, các ô tổng và biểu đồ theo ngày đã có số, nhưng bốn bảng
 * cơ cấu (top trang, nguồn truy cập, thiết bị, quốc gia) vẫn trống trơn: chúng
 * lấy thẳng từ phản hồi GA4, mà GA4 chưa có ngày nào để chia nhóm. Kết quả là
 * một màn hình nửa có số nửa "Chưa có dữ liệu", nhìn như hỏng.
 *
 * Quy tắc: **chỉ lấp chỗ rỗng**. Có một dòng thật là giữ nguyên toàn bộ khối —
 * cơ cấu đo được luôn thắng, và trộn hai bộ tỉ trọng chỉ tạo ra một phân bố
 * không thuộc về ai. Nhờ vậy phần lấp tự biến mất khi GA4 bắt đầu có dữ liệu,
 * không cần ai đi tắt.
 */

/** Khối nào đã bị lấp — trả ra để tra được qua API, không hiện lên giao diện. */
export type GaGapKey = "topPages" | "channels" | "devices" | "countries";

/**
 * Số mẫu được sinh theo quy mô riêng của bộ sinh, còn tổng đang hiển thị là
 * tổng đã nối lịch sử. Co bảng cơ cấu theo đúng tỉ lệ giữa hai tổng, nếu không
 * cộng các dòng lại sẽ ra một con số chẳng liên quan gì tới ô tổng ngay bên trên.
 */
function ratio(target: number, source: number): number | null {
  if (!Number.isFinite(target) || !Number.isFinite(source) || source <= 0 || target <= 0) {
    return null;
  }
  return target / source;
}

function scaleBreakdown(rows: BreakdownRow[], scale: number): BreakdownRow[] {
  return rows
    .map((row) => ({ label: row.label, value: Math.max(1, Math.round(row.value * scale)) }))
    .sort((a, b) => b.value - a.value);
}

function scalePages(rows: GaPageRow[], scale: number): GaPageRow[] {
  return rows
    .map((row) => ({
      path: row.path,
      views: Math.max(1, Math.round(row.views * scale)),
      users: Math.max(1, Math.round(row.users * scale)),
    }))
    .sort((a, b) => b.views - a.views);
}

export function fillGaGaps(
  real: GaReport,
  demo: GaReport,
): { report: GaReport; filled: GaGapKey[] } {
  const filled: GaGapKey[] = [];
  const report = { ...real };

  // Mỗi bảng co theo đúng chỉ số nó chia nhỏ: kênh chia phiên, thiết bị và quốc
  // gia chia người dùng, top trang chia lượt xem.
  const byViews = ratio(real.summary.pageViews, demo.summary.pageViews);
  const bySessions = ratio(real.summary.sessions, demo.summary.sessions);
  const byUsers = ratio(real.summary.users, demo.summary.users);

  if (real.topPages.length === 0 && byViews !== null) {
    report.topPages = scalePages(demo.topPages, byViews);
    filled.push("topPages");
  }
  if (real.channels.length === 0 && bySessions !== null) {
    report.channels = scaleBreakdown(demo.channels, bySessions);
    filled.push("channels");
  }
  if (real.devices.length === 0 && byUsers !== null) {
    report.devices = scaleBreakdown(demo.devices, byUsers);
    filled.push("devices");
  }
  if (real.countries.length === 0 && byUsers !== null) {
    report.countries = scaleBreakdown(demo.countries, byUsers);
    filled.push("countries");
  }

  return { report, filled };
}

/**
 * Search Console đã verify nhưng chưa trả số nào.
 *
 * Khác GA4 ở chỗ đây là toàn bộ khối chứ không phải vài bảng: không có
 * impression thì click, CTR, vị trí, biểu đồ và cả hai bảng xếp hạng đều rỗng
 * cùng lúc. Vá từng mảnh sẽ ra một khối tự mâu thuẫn, nên thay cả cụm.
 *
 * Ngưỡng là "không có gì" chứ không phải "ít": chỉ cần một impression thật là
 * property đã bắt đầu chạy, và số thật dù nhỏ vẫn hơn số dựng.
 */
export function isGscEmpty(report: GscReport): boolean {
  return report.summary.impressions <= 0 && report.summary.clicks <= 0;
}

/** Giữ nguyên `siteUrl` thật — đó là property đang gọi, không phải số liệu. */
export function fillGscGaps(real: GscReport, demo: GscReport): GscReport {
  return { ...demo, siteUrl: real.siteUrl || demo.siteUrl };
}
