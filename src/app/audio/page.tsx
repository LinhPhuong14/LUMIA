import Link from "next/link";

import { AudioHubExtras } from "@/components/audio/audio-category-page";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export default async function AudioPage() {
  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
    <DashboardShell
      sessionName={session.name}
      planLabel="Thư viện audio"
      title="Âm thanh cho buổi tối"
      subtitle="Giấc ngủ, thiền định, thở và timer — chọn nhịp phù hợp với bạn."
      isAdmin={session.role === "admin"}
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/audio/sleep"
            className="soft-card block p-6 transition hover:shadow-[0_18px_44px_rgba(143,168,120,0.1)]"
          >
            <h2 className="font-serif text-3xl text-matcha-deep">Giấc ngủ</h2>
            <p className="mt-2 text-sm text-muted">
              Sleep sounds, sleep cast, wind down và sleep music
            </p>
            <span className="mt-4 inline-block text-[12px] text-matcha">Khám phá →</span>
          </Link>
          <Link
            href="/audio/meditation"
            className="soft-card block p-6 transition hover:shadow-[0_18px_44px_rgba(143,168,120,0.1)]"
          >
            <h2 className="font-serif text-3xl text-matcha-deep">Thiền định</h2>
            <p className="mt-2 text-sm text-muted">Guided, mini meditation và body scan</p>
            <span className="mt-4 inline-block text-[12px] text-matcha">Khám phá →</span>
          </Link>
        </div>

        <AudioHubExtras isActive={subscription.isActive} />

        <section className="soft-card p-6">
          <span className="eyebrow">Mood test</span>
          <p className="mt-2 text-sm text-muted">Không chắc nên nghe gì? Làm quiz ngắn để được gợi ý.</p>
          <Link href="/mood-test" className="button-secondary mt-4 inline-flex text-[13px]">
            Làm Mood Test
          </Link>
        </section>
      </div>
    </DashboardShell>
  );
}
