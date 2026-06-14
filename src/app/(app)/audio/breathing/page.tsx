import { BreathingExercise } from "@/components/audio/breathing-exercise";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UpsellOverlay } from "@/components/ui/upsell-overlay";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export default async function BreathingPage() {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
    <DashboardShell
      sessionName={session.name}
      sessionEmail={session.email}
      subscription={subscription}
      title="Thở cùng LUMIA"
      subtitle="3 kỹ thuật thở - chọn một và để nhịp thở dẫn bạn về tĩnh lặng."
      isAdmin={session.role === "admin"}
    >
      <UpsellOverlay featureName="Bài tập thở" locked={!subscription.isActive}>
        <BreathingExercise enabled={subscription.isActive} />
      </UpsellOverlay>
    </DashboardShell>
  );
}
