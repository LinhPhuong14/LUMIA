import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { JourneyPanel } from "@/components/dashboard/journey-panel";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export default async function JourneyPage() {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
    <DashboardShell
      sessionName={session.name}
      planLabel={subscription.isActive ? "Hành trình 21 ngày" : "Dùng thử"}
      title="Hành trình của bạn"
      subtitle="Nhìn lại lịch sử, mood và báo cáo — không phải để đánh giá, mà để hiểu mình hơn."
      isAdmin={session.role === "admin"}
    >
      <JourneyPanel isActive={subscription.isActive} />
    </DashboardShell>
  );
}
