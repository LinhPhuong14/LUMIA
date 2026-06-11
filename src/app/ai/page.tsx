import { AiStudio } from "@/components/dashboard/ai-studio";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export default async function AIPage() {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
    <DashboardShell
      sessionName={session.name}
      sessionEmail={session.email}
      subscription={subscription}
      title="LUMIA lắng nghe bạn."
      subtitle="Một không gian riêng tư để bạn được nói ra điều đang ở trong lòng, theo nhịp nhẹ và không bị phán xét."
      isAdmin={session.role === "admin"}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <AiStudio />
      </div>
    </DashboardShell>
  );
}
