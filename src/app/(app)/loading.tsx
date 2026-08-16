/**
 * Khung chờ cho mọi trang trong (app).
 *
 * Không có file này thì App Router CHẶN HẲN điều hướng cho tới khi máy chủ
 * render xong: người dùng bấm tab, màn hình cũ đứng yên vài trăm mili-giây rồi
 * trang mới hiện ra đột ngột — đúng cảm giác "đơ" được báo.
 *
 * Vì khung ứng dụng đã chuyển lên `layout.tsx`, cái này chỉ thay phần NỘI DUNG;
 * header, sidebar và thanh tab đứng yên. Nhờ vậy tab phản hồi ngay lập tức.
 *
 * Nó cũng bật lại prefetch: với route động, `<Link>` chỉ tải trước tới ranh giới
 * loading gần nhất — không có ranh giới thì prefetch không làm được gì.
 */
export default function AppLoading() {
  return (
    <div className="space-y-4 py-2" aria-busy>
      <span className="sr-only">Đang tải…</span>

      <div className="h-28 animate-pulse rounded-[24px] bg-[var(--surface-warm)]" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[140px] animate-pulse rounded-[24px] bg-[var(--surface-warm)] lg:h-[160px]"
          />
        ))}
      </div>

      <div className="h-40 animate-pulse rounded-[24px] bg-[var(--surface-warm)]" />
    </div>
  );
}
