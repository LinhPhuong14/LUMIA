import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { getLatestOrderForUser } from "@/lib/orders";
import { getPlanDisplayLabel } from "@/lib/subscription-labels";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

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
  <DashboardHome
    planLabel={planLabel}
    subscription={subscription}
    latestOrder={latestOrder}
    onboardingGoal={session.onboardingGoal}
    userName={session.name}
    userId={session.id}
  />
  );
}
