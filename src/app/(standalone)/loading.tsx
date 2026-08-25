/**
 * Khung chờ dùng chung cho mọi trang trong (standalone) — /blog, /about,
 * /store, /quiz, /boxes, /checkout…
 *
 * Không có file này, bấm link sang một trong các trang trên khi trang hiện
 * tại (ví dụ landing) vẫn còn đang tải sẽ không có phản hồi gì: người dùng
 * không biết click có ăn hay không nên bấm lại 2-3 lần, mỗi lần lại huỷ
 * ngang lượt điều hướng trước và bắt đầu lại từ đầu. File này cho một khung
 * chờ hiện ra ngay lập tức bất kể trang đích là gì; header (logo, nút quay
 * lại) đứng ở `layout.tsx` nên vẫn đứng yên, chỉ phần nội dung đổi.
 *
 * Nó cũng bật lại prefetch cho `<Link>` trỏ vào nhóm route này (chỉ tải
 * trước được tới ranh giới loading gần nhất).
 */
export default function StandaloneLoading() {
  return (
    <div className="landing-frame animate-pulse py-12 sm:py-16" aria-busy>
      <span className="sr-only">Đang tải…</span>

      <div className="h-4 w-40 rounded-full bg-[var(--surface-warm)]" />
      <div className="mt-6 h-9 w-2/3 max-w-sm rounded-full bg-[var(--surface-warm)]" />
      <div className="mt-3 h-5 w-1/2 max-w-xs rounded-full bg-[var(--surface-warm)]" />

      <div className="mt-10 h-64 rounded-[28px] bg-[var(--surface-warm)]" />

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[240px] rounded-[24px] bg-[var(--surface-warm)]" />
        ))}
      </div>
    </div>
  );
}
