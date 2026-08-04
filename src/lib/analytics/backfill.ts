/**
 * Neo lịch sử dựng lại vào mức traffic thật.
 *
 * GA4 không có dữ liệu hồi tố, nên giai đoạn trước khi gắn tag là một lỗ hổng
 * vĩnh viễn. Thay vì để biểu đồ đứt đoạn, ta dựng lại giai đoạn đó rồi **co giãn
 * về đúng mức traffic thật đo được** — nếu không, chỗ nối sẽ là một vách đứng
 * ngay đúng ngày gắn tag, nhìn là biết có chuyện.
 */

/** Số ngày thật tối thiểu trước khi được phép neo. */
export const ANCHOR_MIN_REAL_DAYS = 3;

/**
 * Chặn hệ số ở hai đầu. Với 3 ngày mẫu, một ngày bất thường (bài viral, bot,
 * hoặc chính bạn F5 50 lần) đủ để kéo hệ số đi rất xa. Chặn lại để một sự cố
 * không nhân hay chia cả hai tháng lịch sử.
 */
const SCALE_MIN = 0.05;
const SCALE_MAX = 20;

export type AnchorStatus =
  | { ready: false; reason: "no_cutover" | "not_enough_days" | "no_baseline"; realDays: number }
  | { ready: true; realDays: number; scaleFactor: number; realDailyAverage: number };

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function clampScaleFactor(value: number): number {
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, value));
}

/**
 * So trung bình ngày của traffic thật với trung bình ngày mà bộ sinh số mẫu tạo
 * ra cho **đúng những ngày đó**, rồi lấy tỉ lệ làm hệ số co giãn.
 *
 * So trên cùng khoảng ngày là điểm mấu chốt: đường tăng trưởng của bộ sinh dốc
 * theo tuổi site, nên so với một mốc khác sẽ ra hệ số lệch.
 */
export function resolveAnchor(params: {
  hasCutover: boolean;
  realDailyUsers: number[];
  demoDailyUsers: number[];
}): AnchorStatus {
  const { hasCutover, realDailyUsers, demoDailyUsers } = params;

  if (!hasCutover) {
    return { ready: false, reason: "no_cutover", realDays: 0 };
  }

  const realDays = realDailyUsers.length;
  if (realDays < ANCHOR_MIN_REAL_DAYS) {
    return { ready: false, reason: "not_enough_days", realDays };
  }

  const demoAverage = average(demoDailyUsers);
  const realAverage = average(realDailyUsers);

  // Không có mốc để chia, hoặc traffic thật bằng 0 (tag hỏng?) — đừng neo bừa.
  if (demoAverage <= 0 || realAverage <= 0) {
    return { ready: false, reason: "no_baseline", realDays };
  }

  return {
    ready: true,
    realDays,
    scaleFactor: clampScaleFactor(realAverage / demoAverage),
    realDailyAverage: realAverage,
  };
}

/**
 * Ngày cuối cùng thuộc về giai đoạn dựng lại — tức hôm trước ngày gắn đo.
 * Trả `null` nếu chưa đặt mốc.
 */
export function resolveBackfillEnd(cutoverDate: string | null): string | null {
  if (!cutoverDate || !/^\d{4}-\d{2}-\d{2}$/.test(cutoverDate)) {
    return null;
  }
  const date = new Date(`${cutoverDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

/** `true` nếu ngày đó thuộc giai đoạn chưa gắn đo. */
export function isBeforeCutover(date: string, cutoverDate: string | null): boolean {
  return Boolean(cutoverDate) && date < cutoverDate!;
}

/**
 * Suy ngày gắn đo từ chính dữ liệu GA4: ngày đầu tiên có người dùng, cộng một.
 *
 * Cộng một để **bỏ ngày cài tag** — hôm đó tag chỉ chạy được vài giờ cuối nên
 * số luôn thấp bất thường, để nguyên sẽ thành một hố sụt ngay chỗ nối. Ngày đó
 * rơi vào vùng dựng lại và được thay bằng số theo đường tăng trưởng.
 *
 * Nhờ hàm này mà không cần ai đặt `ANALYTICS_REAL_DATA_SINCE` bằng tay.
 */
export function inferCutoverDate(daily: { date: string; users: number }[]): string | null {
  const firstWithData = daily.find((point) => point.users > 0);
  if (!firstWithData) {
    return null;
  }

  const date = new Date(`${firstWithData.date}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
