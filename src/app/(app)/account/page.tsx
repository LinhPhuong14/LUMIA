import { AccountPanel } from "@/components/dashboard/account-panel";
import { FeedbackPanel } from "@/components/dashboard/feedback-panel";
import { SettingsPanel } from "@/components/dashboard/settings-panel";
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


  return (
    <>
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
      initialPrivacy={{
        saveChats: session.privacy.saveChats,
        allowJournalAi: session.privacy.allowJournalAi,
      }}
    />
      )}
      {activeTab === "feedback" && <FeedbackPanel />}
    </>
  );
}
