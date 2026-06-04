import Image from "next/image";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { SiteHeader } from "@/components/marketing/site-header";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="shell grid min-h-[calc(100dvh-80px)] gap-8 py-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <section className="relative overflow-hidden rounded-[40px] border border-white/75 bg-white/80 p-5 shadow-[0_24px_80px_rgba(244,216,120,0.18)]">
          <Image src="/assets/auth-ritual-portrait.svg" alt="Hộp LUMIA trên nền lụa trắng" width={1200} height={1400} className="h-[44rem] w-full rounded-[32px] object-cover" priority />
          <div className="absolute left-10 top-10 rounded-[28px] border border-white/70 bg-white/86 px-5 py-4 shadow-[0_16px_40px_rgba(143,168,120,0.12)]">
            <div className="font-serif text-3xl text-matcha-deep">Chào mừng bạn quay lại với LUMIA.</div>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted">Hôm nay mình bắt đầu nhẹ nhàng thôi.</p>
          </div>
          <div className="absolute bottom-10 left-10 rounded-full border border-white/70 bg-white/86 px-5 py-3 text-sm text-matcha-deep shadow-[0_16px_40px_rgba(244,216,120,0.14)]">
            Riêng tư • dịu dàng • không phán xét
          </div>
        </section>

        <div className="hero-card p-4 md:p-6">
          <AuthForm mode="login" next={params.next ?? "/dashboard"} />
          <p className="px-5 pb-5 pt-2 text-sm text-muted">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-semibold text-matcha-deep">
              Tạo tài khoản mới
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
