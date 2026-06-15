import Link from "next/link";

import { AudioCategoryPage } from "@/components/audio/audio-category-page";
import { BreathingExercise } from "@/components/audio/breathing-exercise";
import { MeditationTimer } from "@/components/audio/meditation-timer";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UpsellOverlay } from "@/components/ui/upsell-overlay";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export default async function AudioMeditationPage() {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
    <DashboardShell
      sessionName={session.name}
      sessionEmail={session.email}
      subscription={subscription}
      title="Thiền định"
      subtitle="Nhạc thiền, hướng dẫn và bài tập thở."
      isAdmin={session.role === "admin"}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-6">
        {/* Back to audio hub */}
        <Link
          href="/audio"
          className="inline-flex w-fit items-center gap-1.5 text-[13px] text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          ← Âm thanh
        </Link>

        {/* Meditation audio tracks */}
        <AudioCategoryPage
          isActive={subscription.isActive}
          categories={["guided_meditation", "mini_meditation"]}
          sections={[
            { title: "Guided Meditation", category: "guided_meditation" },
            { title: "Mini Meditations", category: "mini_meditation" },
          ]}
        />

        {/* Breathing exercise — inline, no separate page needed */}
        <UpsellOverlay featureName="Bài tập thở" locked={!subscription.isActive}>
          <BreathingExercise enabled={subscription.isActive} />
        </UpsellOverlay>

        {/* Meditation timer */}
        <UpsellOverlay featureName="Hẹn giờ thiền" locked={!subscription.isActive}>
          <MeditationTimer enabled={subscription.isActive} />
        </UpsellOverlay>
      </div>
    </DashboardShell>
  );
}
