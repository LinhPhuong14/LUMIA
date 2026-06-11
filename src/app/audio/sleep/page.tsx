import { AudioCategoryPage } from "@/components/audio/audio-category-page";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export default async function AudioSleepPage() {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
    <DashboardShell
      sessionName={session.name}
      planLabel="Sleep"
      title="Giấc ngủ"
      subtitle="Âm thanh dịu nhẹ để bạn dễ vào giấc hơn."
      isAdmin={session.role === "admin"}
    >
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
    </DashboardShell>
  );
}
