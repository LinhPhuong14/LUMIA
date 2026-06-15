import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { FeedbackPanel } from "@/components/dashboard/feedback-panel";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export const metadata = { title: "Góp ý & Mong muốn – LUMIA" };

export default async function FeedbackPage() {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
    <DashboardShell
      sessionName={session.name}
      sessionEmail={session.email}
      subscription={subscription}
      title="Góp ý & Mong muốn"
      subtitle="Chia sẻ cảm nhận và điều bạn mong muốn để LUMIA ngày càng tốt hơn."
      isAdmin={session.role === "admin"}
    >
      <FeedbackPanel />
    </DashboardShell>
  );
}
