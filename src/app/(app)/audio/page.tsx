import Link from "next/link";

import { FeaturedTrackOfDay } from "@/components/audio/featured-track-of-day";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

const categories = [
  {
    href: "/audio/sleep",
    emoji: "🌙",
    title: "Giấc ngủ",
    description: "Sleep sounds, sleep cast, wind down và sleep music",
  },
  {
    href: "/audio/meditation",
    emoji: "🧘",
    title: "Thiền & Hơi thở",
    description: "Guided meditation, mini session và bài tập thở",
  },
  {
    href: "/audio/timer",
    emoji: "⏱️",
    title: "Hẹn giờ thiền",
    description: "Meditation timer với ambient sound",
  },
] as const;

export default async function AudioPage() {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
    <DashboardShell
      sessionName={session.name}
      sessionEmail={session.email}
      subscription={subscription}
      title="Âm thanh cho buổi tối"
      subtitle="Giấc ngủ, thiền định, thở và timer - chọn nhịp phù hợp với bạn."
      isAdmin={session.role === "admin"}
    >
      <div className="space-y-5 lg:space-y-6">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr] lg:items-start lg:gap-6">
          <FeaturedTrackOfDay />

          <div className="audio-hub-categories grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="audio-hub-category mobile-list-row lg:!flex lg:min-h-[100px] lg:flex-col lg:items-start lg:justify-between lg:rounded-[26px] lg:border lg:border-[var(--border)] lg:bg-[var(--surface-card)]/90 lg:p-6 lg:shadow-[0_14px_34px_rgba(122,140,82,0.1)] lg:backdrop-blur-sm lg:hover:shadow-[0_18px_44px_rgba(122,140,82,0.14)]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-matcha-soft text-2xl lg:h-14 lg:w-14 lg:text-3xl">
                  {cat.emoji}
                </div>
                <div className="min-w-0 flex-1 lg:mt-4">
                  <h2 className="font-sans text-base font-medium text-matcha-text lg:text-lg">{cat.title}</h2>
                  <p className="mt-0.5 text-[13px] text-muted lg:mt-2 lg:text-sm">{cat.description}</p>
                </div>
                <span className="shrink-0 text-[12px] font-semibold text-matcha lg:mt-3">Khám phá →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
