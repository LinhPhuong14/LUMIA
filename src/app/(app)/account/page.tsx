import { AccountPanel } from "@/components/dashboard/account-panel";
import { FeedbackPanel } from "@/components/dashboard/feedback-panel";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getRecentOrdersForUser } from "@/lib/orders";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";
import { AccountTabs } from "@/components/dashboard/account-tabs";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await requireSession();
  const { tab } = await searchParams;
  const activeTab = tab === "settings" ? "settings" : tab === "feedback" ? "feedback" : "account";

  const [subscription, orders] = await Promise.all([
    getSubscriptionSnapshot(session.id),
    getRecentOrdersForUser(session.id, 20),
  ]);

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    account: { title: "Tài khoản", subtitle: "Hộp của bạn, đơn hàng và quyền truy cập." },
    settings: { title: "Cài đặt", subtitle: "Mục tiêu, quyền riêng tư và cách LUMIA phản hồi với bạn." },
    feedback: { title: "Góp ý", subtitle: "Chia sẻ cảm nhận để LUMIA ngày càng tốt hơn." },
  };

  const { title, subtitle } = tabTitles[activeTab];

  return (
    <DashboardShell
      sessionName={session.name}
      sessionEmail={session.email}
      subscription={subscription}
      title={title}
      subtitle={subtitle}
      isAdmin={session.role === "admin"}
    >
      <AccountTabs activeTab={activeTab} />

      {activeTab === "account" && (
        <AccountPanel subscription={subscription} orders={orders} />
      )}
      {activeTab === "settings" && (
        <SettingsPanel
          initialGoal={session.onboardingGoal}
          userName={session.fullName}
          initialNickname={session.nickname}
          userEmail={session.email}
          initialOnboardingData={session.onboardingData}
        />
      )}
      {activeTab === "feedback" && <FeedbackPanel />}
    </DashboardShell>
  );
}
