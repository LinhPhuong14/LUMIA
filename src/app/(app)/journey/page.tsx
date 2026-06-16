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
      sessionEmail={session.email}
      subscription={subscription}
      title="Hành trình của bạn"
      subtitle="Nhìn lại lịch sử, mood và báo cáo - không phải để đánh giá, mà để hiểu mình hơn."
      isAdmin={session.role === "admin"}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <JourneyPanel
          userId={session.id}
          isActive={subscription.isActive}
          calendarDays={90}
        />
      </div>
    </DashboardShell>
  );
}
