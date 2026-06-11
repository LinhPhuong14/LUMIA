import { AccountPanel } from "@/components/dashboard/account-panel";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getRecentOrdersForUser } from "@/lib/orders";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export default async function AccountPage() {
  const session = await requireSession();
  const [subscription, orders] = await Promise.all([
    getSubscriptionSnapshot(session.id),
    getRecentOrdersForUser(session.id, 20),
  ]);

  const planName = subscription.isActive
    ? "Hành trình 21 ngày"
    : subscription.status === "expired"
      ? "Đã hết hạn"
      : "Dùng thử miễn phí";

  return (
    <DashboardShell
      sessionName={session.name}
      planLabel={planName}
      title="Account"
      subtitle="Hộp của bạn, đơn hàng và quyền truy cập — tất cả ở một nơi."
      isAdmin={session.role === "admin"}
    >
      <AccountPanel subscription={subscription} orders={orders} />
    </DashboardShell>
  );
}
