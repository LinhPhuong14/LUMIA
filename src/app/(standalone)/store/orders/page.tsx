import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { StoreOrdersPanel } from "@/components/store/store-orders-panel";
import { getStoreOrdersForUser } from "@/lib/store-orders-db";
import { getSession } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Đơn hàng của tôi – LUMIA",
};

// Đơn thay đổi trạng thái liên tục (khách vừa đặt, admin vừa chuyển sang giao),
// nên trang này không được cache.
export const dynamic = "force-dynamic";

export default async function StoreOrdersPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/store/orders");
  }

  const { orders, error } = await getStoreOrdersForUser(session.id);

  return (
    <div className="landing-frame py-12 md:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="lumia-kicker">- LUMIA Store</span>
          <h1 className="lumia-h2 mt-2">Đơn hàng của tôi.</h1>
          <p className="mt-3 max-w-[520px] text-base leading-relaxed text-[var(--muted)]">
            Theo dõi trạng thái đơn và huỷ đơn khi hàng chưa rời kho.
          </p>
        </div>
        <Link
          href="/store"
          className="rounded-full border border-[var(--border)] px-5 py-2.5 text-[13px] font-semibold text-[var(--foreground)] transition hover:border-[var(--green)]"
        >
          ← Tiếp tục mua sắm
        </Link>
      </div>

      <div className="max-w-[720px]">
        {/* Lỗi đọc phải nói ra: nếu nuốt, nó hiện thành "bạn chưa có đơn nào" —
            câu sai nguy hiểm nhất có thể nói với người vừa đặt hàng xong. */}
        {error ? (
          <p className="mb-4 rounded-[12px] bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</p>
        ) : null}
        <StoreOrdersPanel orders={orders} />
      </div>
    </div>
  );
}
