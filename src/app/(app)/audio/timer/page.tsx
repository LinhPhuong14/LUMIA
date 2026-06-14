import { MeditationTimer } from "@/components/audio/meditation-timer";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UpsellOverlay } from "@/components/ui/upsell-overlay";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export default async function TimerPage() {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
    <DashboardShell
      sessionName={session.name}
      sessionEmail={session.email}
      subscription={subscription}
      title="Hẹn giờ thiền"
      subtitle="Chọn thời gian và ambient sound - rồi để mình ở yên."
      isAdmin={session.role === "admin"}
    >
      <UpsellOverlay featureName="Hẹn giờ thiền" locked={!subscription.isActive}>
        <MeditationTimer enabled={subscription.isActive} />
      </UpsellOverlay>
    </DashboardShell>
  );
}
