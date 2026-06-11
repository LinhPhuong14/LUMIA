import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getLatestOrderForUser } from "@/lib/orders";
import { getPlanDisplayLabel } from "@/lib/subscription-labels";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export default async function DashboardPage() {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);
  const latestOrder = await getLatestOrderForUser(session.id);
  const planLabel = getPlanDisplayLabel(subscription);

  return (
    <DashboardShell
      sessionName={session.name}
      sessionEmail={session.email}
      subscription={subscription}
      title={`Chào buổi tối, ${session.name}.`}
      subtitle="Check-in nhanh, chọn hoạt động hôm nay và để LUMIA đồng hành."
      isAdmin={session.role === "admin"}
    >
      <DashboardHome
        planLabel={planLabel}
        subscription={subscription}
        latestOrder={latestOrder}
        onboardingGoal={session.onboardingGoal}
      />
    </DashboardShell>
  );
}
