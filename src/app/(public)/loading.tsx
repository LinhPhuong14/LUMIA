/**
 * Khung chờ cho trang chủ (`/`).
 *
 * Không có file này, App Router chặn hẳn điều hướng vào `/` tới khi server
 * render xong — người dùng bấm "Trang chủ", màn hình cũ đứng yên rồi trang
 * mới hiện ra đột ngột. `HomePage` còn đọc `cookies()` nên luôn dynamic, tức
 * là không có cách nào tránh việc render lại; cái file này chỉ đảm bảo có gì
 * đó hiện ra NGAY LẬP TỨC thay vì màn hình đứng yên trong lúc chờ.
 *
 * Nó cũng bật lại prefetch: với route dynamic, `<Link>` chỉ tải trước tới
 * ranh giới loading gần nhất — không có ranh giới thì prefetch không làm
 * được gì.
 */
export default function HomeLoading() {
  return (
    <div className="animate-pulse" aria-busy>
      <span className="sr-only">Đang tải…</span>

      {/* Thanh nav nổi */}
      <div className="px-4 pt-[env(safe-area-inset-top,0px)] sm:px-8">
        <div className="mx-auto mt-3 h-14 max-w-[1280px] rounded-full bg-[var(--surface-warm)]" />
      </div>

      {/* Hero */}
      <div className="shell py-16 sm:py-24">
        <div className="h-10 w-2/3 max-w-md rounded-full bg-[var(--surface-warm)]" />
        <div className="mt-4 h-10 w-1/2 max-w-sm rounded-full bg-[var(--surface-warm)]" />
        <div className="mt-6 h-[280px] rounded-[28px] bg-[var(--surface-warm)] sm:h-[360px]" />
      </div>
    </div>
  );
}
