import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";
import { defaultRegisterNext } from "@/lib/site-nav";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[1fr_0.94fr] lg:items-center">
      <section
        className="relative hidden min-h-[calc(100dvh-150px)] overflow-hidden rounded-[32px] p-8 lg:flex lg:flex-col lg:justify-between"
        style={{ background: "var(--gradient-jade)" }}
      >
        <div className="relative max-w-xl pt-8">
          <span className="eyebrow">Đăng ký</span>
          <h1
            className="mt-5 font-serif text-5xl leading-[0.98] tracking-[-0.05em] md:text-6xl"
            style={{ color: "var(--ink-on-light)" }}
          >
            Tạo không gian LUMIA của riêng bạn.
          </h1>
          <p className="mt-4 text-lg leading-8" style={{ color: "var(--scene-ink-muted)" }}>
            Sau khi tạo tài khoản, bạn có thể chọn gói phù hợp hoặc bắt đầu bằng chế độ dùng thử miễn phí.
          </p>
        </div>

        <p className="relative text-sm" style={{ color: "var(--scene-ink-muted)" }}>
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "var(--green-deep)" }}>
            Đăng nhập
          </Link>
        </p>
      </section>

      <div className="hero-card h-full max-h-[calc(100dvh-150px)] overflow-hidden p-4 md:p-5">
        <AuthForm mode="register" next={params.next ?? defaultRegisterNext} />
      </div>
    </div>
  );
}
