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
    <div className="min-h-screen overflow-hidden">
      <SiteHeader />
      <main className="shell grid min-h-[calc(100dvh-80px)] gap-6 py-6 lg:grid-cols-[1fr_0.94fr] lg:items-center lg:overflow-hidden">
        <section className="liquid-panel relative hidden min-h-[calc(100dvh-150px)] overflow-hidden p-6 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute left-8 top-8 h-28 w-28 rounded-full bg-champagne/55 blur-3xl" />
          <div className="absolute bottom-10 right-8 h-36 w-36 rounded-full bg-matcha-soft/75 blur-3xl" />

          <div className="relative max-w-xl">
            <span className="eyebrow">Đăng nhập</span>
            <h1 className="mt-5 font-serif text-6xl leading-[0.98] tracking-[-0.05em] text-matcha-deep">
              Chào mừng bạn quay lại với LUMIA.
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted">Hôm nay mình bắt đầu nhẹ nhàng thôi.</p>
          </div>

          <div className="relative rounded-[32px] border border-white/70 bg-white/56 p-6">
            <div className="text-xs uppercase tracking-[0.24em] text-muted">Hình ảnh sẽ được cập nhật</div>
            <div className="mt-4 font-serif text-3xl leading-tight text-matcha-deep">Khu vực này đang chờ ảnh thật của LUMIA.</div>
            <p className="mt-3 max-w-md text-sm leading-7 text-muted">
              Mình đã gỡ toàn bộ ảnh SVG placeholder khỏi trang này để bạn thay bằng visual thật sau.
            </p>
          </div>

          <div className="relative inline-flex w-fit rounded-full border border-white/70 bg-white/82 px-5 py-3 text-sm text-matcha-deep shadow-[0_16px_40px_rgba(244,216,120,0.14)]">
            Riêng tư · dịu dàng · không phán xét
          </div>
        </section>

        <div className="hero-card h-full max-h-[calc(100dvh-150px)] overflow-hidden p-4 md:p-5">
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
