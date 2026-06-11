import Link from "next/link";

import { AudioHubExtras } from "@/components/audio/audio-category-page";
import { FeaturedTrackOfDay } from "@/components/audio/featured-track-of-day";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export default async function AudioPage() {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
    <DashboardShell
      sessionName={session.name}
      sessionEmail={session.email}
      subscription={subscription}
      title="Âm thanh cho buổi tối"
      subtitle="Giấc ngủ, thiền định, thở và timer — chọn nhịp phù hợp với bạn."
      isAdmin={session.role === "admin"}
    >
      <div className="space-y-5 lg:space-y-6">
        <FeaturedTrackOfDay />

        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-4">
          <Link href="/audio/sleep" className="mobile-list-row lg:soft-card lg:block lg:p-6 lg:hover:shadow-[0_18px_44px_rgba(143,168,120,0.1)]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-matcha-soft text-2xl lg:hidden">🌙</div>
            <div className="min-w-0 flex-1">
              <h2 className="font-sans text-base font-medium text-matcha-text lg:text-lg">Giấc ngủ</h2>
              <p className="mt-0.5 text-[13px] text-muted lg:mt-2 lg:text-sm">
                Sleep sounds, sleep cast, wind down và sleep music
              </p>
            </div>
            <span className="shrink-0 text-[12px] text-matcha lg:mt-4 lg:inline-block">→</span>
          </Link>
          <Link
            href="/audio/meditation"
            className="mobile-list-row lg:soft-card lg:block lg:p-6 lg:hover:shadow-[0_18px_44px_rgba(143,168,120,0.1)]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-matcha-soft text-2xl lg:hidden">🧘</div>
            <div className="min-w-0 flex-1">
              <h2 className="font-sans text-base font-medium text-matcha-text lg:text-lg">Thiền định</h2>
              <p className="mt-0.5 text-[13px] text-muted lg:mt-2 lg:text-sm">Guided, mini meditation và body scan</p>
            </div>
            <span className="shrink-0 text-[12px] text-matcha lg:mt-4 lg:inline-block">→</span>
          </Link>
        </div>

        <AudioHubExtras isActive={subscription.isActive} />

        <section className="soft-card p-6">
          <span className="eyebrow">Mood test</span>
          <p className="mt-2 text-sm text-muted">Không chắc nên nghe gì? Làm quiz ngắn để được gợi ý.</p>
          <Link href="/mood-test" className="button-secondary mt-4 inline-flex text-[13px]">
            Làm kiểm tra cảm xúc
          </Link>
        </section>
      </div>
    </DashboardShell>
  );
}
