import Link from "next/link";

import { AudioCategoryPage } from "@/components/audio/audio-category-page";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
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
      subtitle="Guided meditation và mini sessions cho mọi năng lượng."
      isAdmin={session.role === "admin"}
    >
      <div className="flex min-h-0 flex-1 flex-col space-y-8">
        <AudioCategoryPage
          isActive={subscription.isActive}
          categories={["guided_meditation", "mini_meditation"]}
          sections={[
            { title: "Guided Meditation", category: "guided_meditation" },
            { title: "Mini Meditations", category: "mini_meditation" },
          ]}
        />
        <section className="soft-card p-6">
          <h2 className="font-sans text-base font-medium text-matcha-text">Breathing & Timer</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/audio/breathing" className="button-secondary text-[13px]">
              Bài tập thở
            </Link>
            <Link href="/audio/timer" className="button-secondary text-[13px]">
              Meditation Timer
            </Link>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
