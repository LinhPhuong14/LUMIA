import Link from "next/link";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { lumiaBox } from "@/data/catalog";
import { getLatestOrderForUser, getOrderStatusLabel } from "@/lib/orders";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

const features = {
  free: ["Mood check-in", "3 bài thiền mẫu", "3 lượt AI/ngày", "Xem journal cũ"],
  active: lumiaBox.features,
  expired: ["Mood check-in", "Xem journal cũ", "Mua hộp mới để tiếp tục"],
};

export default async function SubscriptionPage() {
  const session = await requireSession();
  const [subscription, latestOrder] = await Promise.all([
    getSubscriptionSnapshot(session.id),
    getLatestOrderForUser(session.id),
  ]);

  const statusKey = subscription.isActive ? "active" : subscription.status;
  const planName = subscription.isActive ? "Hành trình 21 ngày" : subscription.status === "expired" ? "Đã hết hạn" : "Dùng thử miễn phí";
  const featureList = features[statusKey as keyof typeof features] ?? features.free;

  return (
    <DashboardShell
      currentPath="/subscription"
      sessionName={session.name}
      planLabel={planName}
      title="Gói của tôi"
      subtitle="Theo dõi gói hiện tại, quyền truy cập đi kèm và những gì có thể mở thêm."
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="soft-card p-6">
          <span className="eyebrow">Gói hiện tại</span>
          <h2 className="mt-4 font-serif text-4xl text-matcha-deep">{planName}</h2>
          <p className="mt-3 text-sm text-muted">Trạng thái: {subscription.status}</p>
          {subscription.currentDay ? (
            <p className="mt-4 text-sm text-matcha-deep">Ngày {subscription.currentDay}/21</p>
          ) : null}
          <p className="mt-4 text-sm leading-6 text-muted">
            {subscription.expiresAt
              ? `Ngày kết thúc: ${formatDate(subscription.expiresAt)}`
              : "Gói hiện tại đang mở và sẵn sàng cho bạn."}
          </p>
        </section>

        <section className="soft-card p-6">
          <span className="eyebrow">Quyền truy cập</span>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-foreground">
            {featureList.map((feature) => (
              <li key={feature} className="rounded-[22px] border border-white/70 bg-white/78 px-4 py-3">
                {feature}
              </li>
            ))}
          </ul>
        </section>

        <section className="soft-card p-6">
          <span className="eyebrow">Đơn hàng</span>
          {latestOrder ? (
            <div className="mt-4 space-y-3 text-sm text-foreground">
              <div className="flex justify-between gap-4">
                <span>Ngày mua</span>
                <span>{formatDate(latestOrder.createdAt)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Số tiền</span>
                <span>{formatCurrency(latestOrder.amount)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Trạng thái</span>
                <span>{getOrderStatusLabel(latestOrder.status)}</span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Chưa có đơn hàng.</p>
          )}
          <Link href="/boxes" className="button-primary mt-6 justify-center">
            Mua hộp LUMIA
          </Link>
        </section>
      </div>
    </DashboardShell>
  );
}
