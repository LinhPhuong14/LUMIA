/**
 * Fallback cho các section landing phải chờ Supabase (Suspense boundary
 * trong `HomePage`). Không có ranh giới Suspense quanh những section này,
 * React server-render phải đợi TOÀN BỘ section chậm nhất xong mới được gửi
 * bất kỳ byte HTML nào xuống — kể cả nav bar và hero tĩnh phía trên. Bọc
 * Suspense quanh riêng từng section cho phép phần khung (nav, hero) stream
 * xuống ngay, còn section nào chưa có dữ liệu thì hiện khối chờ này trước.
 *
 * `variant="grid"` khớp hình dạng lưới thẻ (Boxes/Products/Blog); `"banner"`
 * khớp khối quảng bá một cột của PromoSection. Không cần khớp pixel-perfect —
 * chỉ cần đủ gần để không giật layout khi dữ liệu thật thế vào.
 */
export function SectionSkeleton({
  variant = "grid",
  cards = 3,
}: {
  variant?: "grid" | "banner";
  cards?: number;
}) {
  if (variant === "banner") {
    return (
      <div className="px-4 py-16 sm:py-24" aria-hidden="true">
        <div className="shell">
          <div className="mx-auto max-w-3xl">
            <div className="h-56 animate-pulse rounded-[28px] bg-[var(--surface-warm)] sm:h-64" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-16 sm:py-24" aria-hidden="true">
      <div className="shell">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="h-8 w-48 animate-pulse rounded-full bg-[var(--surface-warm)]" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-[var(--surface-warm)]" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} className="h-[280px] animate-pulse rounded-[24px] bg-[var(--surface-warm)]" />
          ))}
        </div>
      </div>
    </div>
  );
}
