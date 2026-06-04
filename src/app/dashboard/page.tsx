import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { hasMongoConfig } from "@/lib/env";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";

const tierMap: Record<string, string> = {
  free: "Dùng thử miễn phí",
  "1m": "Hộp LUMIA Khởi đầu",
  "3m": "Hộp LUMIA Mỗi ngày",
  "5m": "Hộp LUMIA Dịu sâu",
};

export default async function DashboardPage() {
  const session = await requireSession();

  let tier = "free";
  if (hasMongoConfig()) {
    await connectToDatabase();
    const subscription = await getSubscriptionSnapshot(session.userId);
    tier = subscription.tier;
  }

  const planLabel = tierMap[tier] ?? "Dùng thử miễn phí";

  return (
    <DashboardShell
      currentPath="/dashboard"
      sessionName={session.name}
      planLabel={planLabel}
      title={`Chào buổi tối, ${session.name}.`}
      subtitle="Đây là workspace riêng của bạn: check-in nhanh, viết ra điều đang nặng và mở LUMIA lắng nghe khi cần."
    >
      <DashboardHome planLabel={planLabel} tier={tier} />
    </DashboardShell>
  );
}
