import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { SiteHeader } from "@/components/marketing/site-header";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen overflow-hidden">
      
      <main className="shell grid min-h-[calc(100dvh-80px)] gap-6 py-6 lg:grid-cols-[1fr_0.94fr] lg:items-center lg:overflow-hidden">
        <section className="liquid-panel relative hidden min-h-[calc(100dvh-150px)] overflow-hidden p-6 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute left-8 top-8 h-28 w-28 rounded-full bg-champagne/55 blur-3xl" />
          <div className="absolute bottom-10 right-8 h-36 w-36 rounded-full bg-matcha-soft/75 blur-3xl" />

          <div className="relative max-w-xl">
            <span className="eyebrow">Tạo tài khoản</span>
            <h1 className="mt-5 font-serif text-6xl leading-[0.98] tracking-[-0.05em] text-matcha-deep">
              Tạo không gian LUMIA của riêng bạn.
            </h1>
            <p className="mt-4 text-lg leading-8 text-muted">
              Sau khi tạo tài khoản, bạn sẽ chọn chiếc hộp phù hợp để mở premium hoặc bỏ qua để bắt đầu bằng chế độ dùng thử miễn phí.
            </p>
          </div>

          

          <p className="relative text-sm text-muted">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-matcha-deep">
              Đăng nhập ngay
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
