import Link from "next/link";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { lumiaBox } from "@/data/catalog";
import { getRecentOrdersForUser, getOrderStatusLabel } from "@/lib/orders";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardBoxesPage() {
  const session = await requireSession();
  const [subscription, recentOrders] = await Promise.all([
    getSubscriptionSnapshot(session.id),
    getRecentOrdersForUser(session.id, 4),
  ]);

  const planLabel = subscription.isActive ? "Hành trình 21 ngày" : "Dùng thử miễn phí";

  return (
    <DashboardShell
      currentPath="/dashboard/boxes"
      sessionName={session.name}
      planLabel={planLabel}
      title="Hộp dành cho bạn"
      subtitle="Mua hộp LUMIA để mở khóa hành trình 21 ngày đầy đủ."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="soft-card p-6">
          <span className="eyebrow">{lumiaBox.badge}</span>
          <h2 className="mt-4 font-serif text-4xl text-matcha-deep">{lumiaBox.name}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{lumiaBox.description}</p>
          <div className="mt-6 font-serif text-3xl text-matcha-deep">{formatCurrency(lumiaBox.price)}</div>
          <Link href={`/boxes/${lumiaBox.slug}`} className="button-primary mt-6">
            Mua hộp
          </Link>
        </section>

        <section className="soft-card p-6">
          <span className="eyebrow">Lịch sử đơn</span>
          {recentOrders.length ? (
            <ul className="mt-4 space-y-3">
              {recentOrders.map((order) => (
                <li key={order.id} className="rounded-[20px] border border-white/70 bg-white/78 px-4 py-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span>{formatDate(order.createdAt)}</span>
                    <span>{getOrderStatusLabel(order.status)}</span>
                  </div>
                  <div className="mt-1 text-muted">{formatCurrency(order.amount)}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">Chưa có đơn hàng.</p>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
