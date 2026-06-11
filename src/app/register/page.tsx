import Link from "next/link";

import { AuthMinimalHeader } from "@/components/auth/auth-minimal-header";
import { AuthForm } from "@/components/auth/auth-form";

export default async function RegisterPage({
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
            <span className="eyebrow">Đăng ký</span>
            <h1 className="mt-5 font-serif text-5xl leading-[0.98] tracking-[-0.05em] text-matcha-deep md:text-6xl">
              Tạo không gian LUMIA của riêng bạn.
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted">
              Sau khi tạo tài khoản, bạn có thể chọn gói phù hợp hoặc bắt đầu bằng chế độ dùng thử miễn phí.
            </p>
          </div>

          <p className="relative text-sm text-muted">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-matcha-deep">
              Đăng nhập
            </Link>
          </p>
        </section>

        <div className="hero-card h-full max-h-[calc(100dvh-150px)] overflow-hidden p-4 md:p-5">
          <AuthForm mode="register" next={params.next ?? "/onboarding"} />
        </div>
      </main>
    </div>
  );
}
