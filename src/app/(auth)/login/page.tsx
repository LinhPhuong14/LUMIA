import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { defaultLoginNext } from "@/lib/site-nav";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="auth-page-grid grid w-full gap-6 lg:grid-cols-[1fr_0.94fr] lg:items-start">
      <section
        className="relative hidden overflow-hidden rounded-[32px] p-8 lg:flex lg:flex-col lg:justify-between lg:min-h-[600px]"
        style={{ background: "var(--gradient-jade)" }}
      >
        <div className="relative max-w-xl pt-8">
          <h1 className="font-serif text-5xl leading-[0.98] tracking-[-0.05em]" style={{ color: "var(--ink-on-light)" }}>
            Chào mừng bạn quay lại với LUMIA.
          </h1>
          <p className="mt-4 text-lg leading-8" style={{ color: "var(--scene-ink-muted)" }}>
            Hôm nay mình bắt đầu nhẹ nhàng thôi - một check-in, vài dòng viết ra, hoặc vài phút được lắng nghe.
          </p>
        </div>
        <div className="dash-panel relative p-6">
          <p className="text-sm leading-7" style={{ color: "var(--muted)" }}>
            Không gian riêng tư để bạn ghi nhận cảm xúc và chuẩn bị cho giấc ngủ dịu hơn.
          </p>
        </div>
      </section>

      <div className="hero-card flex w-full flex-col">
        <AuthForm mode="login" next={params.next ?? defaultLoginNext} />
        <p className="shrink-0 px-5 pb-5 pt-2 text-sm" style={{ color: "var(--muted)" }}>
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold" style={{ color: "var(--green-deep)" }}>
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
}
