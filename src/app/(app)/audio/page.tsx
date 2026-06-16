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
    description: "Sleep sounds, sleep cast và wind down music",
    color: "from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/30",
    border: "border-indigo-100 dark:border-indigo-900/40",
  },
  {
    href: "/audio/meditation",
    emoji: "🧘",
    title: "Thiền định",
    description: "Guided meditation và mini session",
    color: "from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30",
    border: "border-emerald-100 dark:border-emerald-900/40",
  },
  {
    href: "/audio/breathing",
    emoji: "🌬️",
    title: "Hơi thở",
    description: "Kỹ thuật thở 4-7-8, box breathing",
    color: "from-sky-50 to-cyan-50 dark:from-sky-950/40 dark:to-cyan-950/30",
    border: "border-sky-100 dark:border-sky-900/40",
  },
  {
    href: "/audio/timer",
    emoji: "⏱️",
    title: "Hẹn giờ",
    description: "Meditation timer với ambient sound",
    color: "from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30",
    border: "border-amber-100 dark:border-amber-900/40",
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
        {/* Desktop: 2-col featured + categories; Mobile: stacked */}
        <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
          <FeaturedTrackOfDay />

          {/* 4 square category cards */}
          <div className="grid grid-cols-2 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className={`flex flex-col items-start justify-between rounded-[22px] border bg-gradient-to-br p-5 transition hover:shadow-md active:scale-[0.98] lg:p-6 ${cat.color} ${cat.border}`}
              >
                <span className="text-3xl">{cat.emoji}</span>
                <div className="mt-3">
                  <p className="font-semibold text-[var(--foreground)]">{cat.title}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--muted)]">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
