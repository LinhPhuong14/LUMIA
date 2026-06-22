import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AudioCategoryPage } from "@/components/audio/audio-category-page";
import { SleepCoach } from "@/components/audio/sleep-coach";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export default async function AudioSleepPage() {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
    <DashboardShell
      sessionName={session.name}
      sessionEmail={session.email}
      subscription={subscription}
      title="Giấc ngủ"
      subtitle="Âm thanh dịu nhẹ để bạn dễ vào giấc hơn."
      isAdmin={session.role === "admin"}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        {/* Back to audio hub */}
        <Link
          href="/audio"
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2 text-[13px] font-medium text-[var(--foreground)] transition hover:border-[var(--green)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Âm thanh
        </Link>

        {/* Two-column on desktop: tracks left, sleep coach right */}
        <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row lg:items-start lg:gap-6">
          {/* Audio tracks — scrollable left column */}
          <div className="min-w-0 flex-1">
            <AudioCategoryPage
              isActive={subscription.isActive}
              categories={["sleep_sound", "sleep_cast", "wind_down", "sleep_music"]}
              sections={[
                { title: "Sleep Sounds", category: "sleep_sound" },
                { title: "Sleep Cast", category: "sleep_cast", activeOnly: true },
                { title: "Wind Down", category: "wind_down", activeOnly: true },
                { title: "Sleep Music", category: "sleep_music" },
              ]}
            />
          </div>

          {/* Sleep Coach — sticky right sidebar on desktop */}
          <div className="w-full shrink-0 lg:sticky lg:top-4 lg:w-[340px] xl:w-[380px]">
            <SleepCoach />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
