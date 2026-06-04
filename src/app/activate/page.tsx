import Image from "next/image";
import Link from "next/link";

import { ActivationForm } from "@/components/checkout/activation-form";
import { SiteHeader } from "@/components/marketing/site-header";
import { requireSession } from "@/lib/auth";

export default async function ActivatePage() {
  await requireSession();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="shell flex min-h-[calc(100dvh-80px)] items-center justify-center py-16">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <section className="relative overflow-hidden rounded-[40px] border border-white/75 bg-white/78 p-5 shadow-[0_24px_80px_rgba(244,216,120,0.22)]">
            <div className="absolute left-1/2 top-16 h-44 w-44 -translate-x-1/2 rounded-full bg-[#F4D878]/28 blur-3xl animate-breathe-glow" />
            <Image src="/assets/auth-ritual-portrait.svg" alt="Hộp LUMIA mở ra với ánh sáng vàng trắng" width={1200} height={1400} className="relative h-[38rem] w-full rounded-[30px] object-cover" priority />
          </section>

          <div className="space-y-4">
            <ActivationForm />
            <div className="soft-card p-6">
              <div className="text-xs uppercase tracking-[0.22em] text-muted">Sau khi mở khóa</div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground">
                <li>- Không gian cá nhân</li>
                <li>- Ghi nhận cảm xúc</li>
                <li>- Nhật ký</li>
                <li>- Xả cảm xúc</li>
                <li>- LUMIA lắng nghe</li>
              </ul>
              <Link href="/dashboard" className="button-secondary mt-6">
                Vào không gian của bạn
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
