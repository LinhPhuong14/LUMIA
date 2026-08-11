/**
 * Khung giữ chỗ cho `MoodTrendChart` trong lúc recharts đang tải.
 *
 * Chiều cao phải khớp CHÍNH XÁC bản thật (nhãn + vùng vẽ 100px), nếu không nội
 * dung bên dưới sẽ nhảy khi biểu đồ hiện ra — vốn là thứ người dùng cảm nhận
 * thành "lag" rõ hơn cả thời gian tải.
 */
export function MoodTrendChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
          Nhịp cảm xúc 7 ngày
        </span>
      </div>
      <div className="h-[100px] w-full animate-pulse rounded-[12px] bg-[var(--surface-warm)]" />
    </div>
  );
}
