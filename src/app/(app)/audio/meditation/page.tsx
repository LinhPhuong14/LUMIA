import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2 text-[13px] font-medium text-[var(--foreground)] transition hover:border-[var(--green)] mb-4 mt-2 w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Âm thanh
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

        {/* Breathing exercise - inline, no separate page needed.
            When locked, show a compact upsell banner (variant="banner") instead of a large
            blurred overlay so it never covers/dominates the free meditation tracks above. */}
        <UpsellOverlay
          featureName="Bài tập thở"
          description="Kỹ thuật thở 4-7-8 và box breathing giúp thư giãn."
          locked={!subscription.isActive}
          variant="banner"
        >
          <BreathingExercise enabled={subscription.isActive} />
        </UpsellOverlay>

        {/* Meditation timer */}
        <UpsellOverlay
          featureName="Hẹn giờ thiền"
          description="Đặt giờ thiền cùng âm thanh nền dịu nhẹ."
          locked={!subscription.isActive}
          variant="banner"
        >
          <MeditationTimer enabled={subscription.isActive} />
        </UpsellOverlay>
      </div>
    </DashboardShell>
  );
}
