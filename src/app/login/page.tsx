import Link from "next/link";

import { AuthMinimalHeader } from "@/components/auth/auth-minimal-header";
import { AuthForm } from "@/components/auth/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="marketing-page page-scroll-area relative h-full">
      <AuthMinimalHeader />
      <main className="shell grid gap-6 py-6 lg:grid-cols-[1fr_0.94fr] lg:items-center">
        <section className="liquid-panel relative hidden min-h-[calc(100dvh-150px)] overflow-hidden p-8 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute left-8 top-8 h-28 w-28 rounded-full bg-champagne/55 blur-3xl" />
          <div className="absolute bottom-10 right-8 h-36 w-36 rounded-full bg-matcha-soft/75 blur-3xl" />
          <div className="relative max-w-xl pt-16">
            <h1 className="font-serif text-5xl leading-[0.98] tracking-[-0.05em] text-matcha-deep">
              Chào mừng bạn quay lại với LUMIA.
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted">
              Hôm nay mình bắt đầu nhẹ nhàng thôi — một check-in, vài dòng viết ra, hoặc vài phút được lắng nghe.
            </p>
          </div>
          <div className="relative rounded-[32px] border border-white/70 bg-white/56 p-6">
            <p className="text-sm leading-7 text-muted">
              Không gian riêng tư để bạn ghi nhận cảm xúc và chuẩn bị cho giấc ngủ dịu hơn.
            </p>
          </div>
        </section>

        <div className="hero-card h-full max-h-[calc(100dvh-150px)] overflow-hidden p-4 md:p-5">
          <AuthForm mode="login" next={params.next ?? "/dashboard"} />
          <p className="px-5 pb-5 pt-2 text-sm text-muted">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-semibold text-matcha-deep">
              Đăng ký
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
