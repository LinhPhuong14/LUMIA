import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getLatestOrderForUser } from "@/lib/orders";
import { getPlanDisplayLabel } from "@/lib/subscription-labels";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";
import { getDashboardGreeting } from "@/lib/time-greeting";

export default async function DashboardPage() {
  const session = await requireSession();
  // Hai truy vấn này chỉ cần `session.id`, không cần nhau — chạy nối tiếp là
  // chờ thừa trọn một vòng gọi DB trước khi có chữ nào hiện ra.
  const [subscription, latestOrder] = await Promise.all([
    getSubscriptionSnapshot(session.id),
    getLatestOrderForUser(session.id),
  ]);
  const planLabel = getPlanDisplayLabel(subscription);

  return (
    <DashboardShell
      sessionName={session.name}
      sessionEmail={session.email}
      subscription={subscription}
      title={getDashboardGreeting(session.name)}
      subtitle="Hôm nay bạn muốn bắt đầu từ đâu?"
      isAdmin={session.role === "admin"}
    >
      <DashboardHome
        planLabel={planLabel}
        subscription={subscription}
        latestOrder={latestOrder}
        onboardingGoal={session.onboardingGoal}
        userName={session.name}
        userId={session.id}
      />
    </DashboardShell>
  );
}
