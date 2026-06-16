import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
      <Link
        href="/audio"
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2 text-[13px] font-medium text-[var(--foreground)] transition hover:border-[var(--green)] mb-4 mt-2 w-fit"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Âm thanh
      </Link>
      <UpsellOverlay featureName="Hẹn giờ thiền" locked={!subscription.isActive}>
        <MeditationTimer enabled={subscription.isActive} />
      </UpsellOverlay>
    </DashboardShell>
  );
}
