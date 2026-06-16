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
    accent: "#6366f1",
    blob: "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.18) 0%, transparent 65%), radial-gradient(ellipse at 80% 20%, rgba(147,197,253,0.14) 0%, transparent 55%)",
    border: "rgba(99,102,241,0.2)",
    darkBlob: "radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.25) 0%, transparent 65%), radial-gradient(ellipse at 80% 20%, rgba(67,56,202,0.2) 0%, transparent 55%)",
  },
  {
    href: "/audio/meditation",
    emoji: "🧘",
    title: "Thiền định",
    description: "Guided meditation và mini session",
    accent: "#10b981",
    blob: "radial-gradient(ellipse at 75% 30%, rgba(16,185,129,0.16) 0%, transparent 60%), radial-gradient(ellipse at 20% 70%, rgba(167,243,208,0.12) 0%, transparent 50%)",
    border: "rgba(16,185,129,0.2)",
    darkBlob: "radial-gradient(ellipse at 75% 30%, rgba(16,185,129,0.22) 0%, transparent 60%), radial-gradient(ellipse at 20% 70%, rgba(5,150,105,0.18) 0%, transparent 50%)",
  },
  {
    href: "/audio/breathing",
    emoji: "🌬️",
    title: "Hơi thở",
    description: "Kỹ thuật thở 4-7-8, box breathing",
    accent: "#0ea5e9",
    blob: "radial-gradient(ellipse at 60% 20%, rgba(14,165,233,0.15) 0%, transparent 60%), radial-gradient(ellipse at 15% 75%, rgba(186,230,253,0.12) 0%, transparent 50%)",
    border: "rgba(14,165,233,0.2)",
    darkBlob: "radial-gradient(ellipse at 60% 20%, rgba(14,165,233,0.22) 0%, transparent 60%), radial-gradient(ellipse at 15% 75%, rgba(2,132,199,0.18) 0%, transparent 50%)",
  },
  {
    href: "/audio/timer",
    emoji: "⏱️",
    title: "Hẹn giờ",
    description: "Meditation timer với ambient sound",
    accent: "#f59e0b",
    blob: "radial-gradient(ellipse at 30% 25%, rgba(245,158,11,0.16) 0%, transparent 58%), radial-gradient(ellipse at 80% 70%, rgba(254,215,170,0.13) 0%, transparent 52%)",
    border: "rgba(245,158,11,0.2)",
    darkBlob: "radial-gradient(ellipse at 30% 25%, rgba(245,158,11,0.22) 0%, transparent 58%), radial-gradient(ellipse at 80% 70%, rgba(217,119,6,0.18) 0%, transparent 52%)",
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
      <div className="space-y-4 lg:space-y-5">
        {/* Featured track — full width */}
        <FeaturedTrackOfDay />

        {/* Category grid — full width 2×2 */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group relative flex min-h-[140px] flex-col items-start justify-between overflow-hidden rounded-[24px] border p-5 transition hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(0,0,0,0.10)] active:scale-[0.98] lg:min-h-[160px] lg:p-6"
              style={{
                borderColor: cat.border,
                background: "var(--surface-card)",
              }}
            >
              {/* Ambient blob */}
              <div
                className="pointer-events-none absolute inset-0 opacity-100 transition-opacity duration-500 group-hover:opacity-0 dark:hidden"
                style={{ background: cat.blob }}
              />
              <div
                className="pointer-events-none absolute inset-0 hidden opacity-100 transition-opacity duration-500 group-hover:opacity-0 dark:block"
                style={{ background: cat.darkBlob }}
              />
              {/* Hover shimmer */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${cat.accent}22 0%, transparent 70%)` }}
              />

              <span className="relative text-3xl drop-shadow-sm lg:text-4xl">{cat.emoji}</span>
              <div className="relative mt-3">
                <p className="font-semibold text-[var(--foreground)]">{cat.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted)] lg:text-[12px]">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
