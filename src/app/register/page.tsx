import Image from "next/image";
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
    <div className="min-h-screen">
      <SiteHeader />
      <main className="shell grid min-h-[calc(100dvh-80px)] gap-8 py-12 lg:grid-cols-[1fr_0.95fr] lg:items-center">
        <section className="space-y-6">
          <div className="max-w-2xl">
            <span className="eyebrow">Tạo tài khoản</span>
            <h1 className="mt-4 font-serif text-6xl leading-[1.02] tracking-[-0.05em] text-matcha-deep">Tạo không gian LUMIA của riêng bạn.</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
              Sau khi tạo tài khoản, bạn sẽ chọn chiếc hộp phù hợp để mở premium hoặc bỏ qua để bắt đầu bằng chế độ dùng thử miễn phí.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="soft-card p-5">
              <div className="font-serif text-3xl text-matcha-deep">Chọn nhịp bắt đầu</div>
              <p className="mt-3 text-sm leading-6 text-muted">Bạn có thể đi vào trải nghiệm premium bằng hộp LUMIA hoặc vào workspace nhẹ hơn trước để thử.</p>
            </div>
            <div className="soft-card p-5">
              <div className="font-serif text-3xl text-matcha-deep">Không gian riêng tư</div>
              <p className="mt-3 text-sm leading-6 text-muted">Mọi ghi nhận cảm xúc, nhật ký và trò chuyện đều ở trong một không gian dịu dàng và kín đáo.</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-[40px] border border-white/75 bg-white/80 p-5 shadow-[0_24px_80px_rgba(244,216,120,0.18)]">
            <Image src="/assets/auth-ritual-portrait.svg" alt="Không gian LUMIA trắng sáng và dịu dàng" width={1200} height={1400} className="h-[28rem] w-full rounded-[32px] object-cover" />
          </div>
          <p className="text-sm text-muted">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-matcha-deep">
              Đăng nhập ngay
            </Link>
          </p>
        </section>

        <div className="hero-card p-4 md:p-6">
          <AuthForm mode="register" next={params.next ?? "/boxes?onboarding=1"} />
        </div>
      </main>
    </div>
  );
}
