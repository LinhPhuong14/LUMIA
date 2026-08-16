import { BreathingExercise } from "@/components/audio/breathing-exercise";
import { UpsellOverlay } from "@/components/ui/upsell-overlay";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export default async function BreathingPage() {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
  <UpsellOverlay featureName="Bài tập thở" locked={!subscription.isActive}>
    <BreathingExercise enabled={subscription.isActive} />
  </UpsellOverlay>
  );
}
