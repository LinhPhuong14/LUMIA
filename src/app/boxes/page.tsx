import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/marketing/product-card";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { lumiaProducts } from "@/data/catalog";
import { getSession } from "@/lib/auth";

export default async function BoxesPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const onboarding = params.onboarding === "1";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="shell py-14">
        <section className="grid gap-8 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
          <div className="max-w-2xl">
            <span className="eyebrow">{onboarding ? "Bước tiếp theo của bạn" : "Hộp LUMIA"}</span>
            <h1 className="mt-4 font-serif text-6xl leading-[1.02] tracking-[-0.05em] text-matcha-deep">
              {onboarding ? "Chọn chiếc hộp để mở premium, hoặc dùng thử miễn phí trước." : "Chọn chiếc hộp phù hợp với hành trình của bạn."}
            </h1>
            <p className="mt-5 text-lg leading-8 text-muted">
              Mỗi hộp LUMIA đi kèm một mức trải nghiệm không gian số khác nhau: từ ghi nhận cảm xúc cơ bản đến LUMIA lắng nghe cá nhân hóa hơn.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {session ? (
                <>
                  <Link href="/dashboard" className="button-secondary">
                    Bỏ qua và dùng thử miễn phí
                  </Link>
                  <span className="rounded-full border border-white/70 bg-white/82 px-4 py-3 text-sm text-muted">
                    Bạn luôn có thể nâng cấp sau khi đã vào workspace.
                  </span>
                </>
              ) : (
                <>
                  <Link href="/register?next=/boxes?onboarding=1" className="button-primary">
                    Tạo tài khoản để bắt đầu
                  </Link>
                  <Link href="/login?next=/boxes?onboarding=1" className="button-secondary">
                    Tôi đã có tài khoản
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="soft-card overflow-hidden p-4">
            <Image src="/assets/boxes-editorial.svg" alt="Bộ sưu tập hộp LUMIA" width={1400} height={900} className="h-full w-full rounded-[30px] object-cover" priority />
          </div>
        </section>

        <section className="mt-10 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="soft-card p-6">
            <div className="text-xs uppercase tracking-[0.22em] text-muted">Cách bắt đầu</div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-[26px] bg-white/82 p-4">
                <div className="font-serif text-2xl text-matcha-deep">1. Tạo tài khoản</div>
                <p className="mt-2 text-sm leading-6 text-muted">Giữ chỗ cho không gian riêng tư của bạn trước khi bắt đầu hành trình.</p>
              </div>
              <div className="rounded-[26px] bg-white/82 p-4">
                <div className="font-serif text-2xl text-matcha-deep">2. Chọn hộp</div>
                <p className="mt-2 text-sm leading-6 text-muted">Mua hộp để mở premium theo mức đồng hành phù hợp với bạn.</p>
              </div>
              <div className="rounded-[26px] bg-white/82 p-4">
                <div className="font-serif text-2xl text-matcha-deep">3. Hoặc dùng thử</div>
                <p className="mt-2 text-sm leading-6 text-muted">Nếu chưa sẵn sàng, bạn vẫn có thể vào workspace miễn phí để cảm nhận trước.</p>
              </div>
            </div>
          </div>

          <div className="soft-card p-6 shadow-[0_24px_80px_rgba(244,216,120,0.18)]">
            <div className="text-xs uppercase tracking-[0.22em] text-muted">Nâng cấp mở thêm gì</div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground">
              <li>- Lịch sử cảm xúc dài hơn</li>
              <li>- LUMIA lắng nghe nhiều hơn và sâu hơn</li>
              <li>- Nhật ký không giới hạn</li>
              <li>- Gợi ý chiêm nghiệm cá nhân hóa hơn</li>
            </ul>
            {session ? (
              <Link href="/dashboard" className="button-secondary mt-6">
                Vào workspace hiện tại
              </Link>
            ) : null}
          </div>
        </section>

        <section className="mt-12 -mx-6 overflow-x-auto px-6 pb-4">
          <div className="flex gap-5">
            {lumiaProducts.map((product) => (
              <div key={`${product.slug}-hero`} className="min-w-[280px] rounded-[32px] border border-white/75 bg-white/82 p-5 shadow-[0_18px_54px_rgba(244,216,120,0.14)]">
                <div className="rounded-[24px] bg-[linear-gradient(145deg,rgba(255,254,250,0.96),rgba(255,253,245,0.9),rgba(255,243,199,0.45))] p-3">
                  <Image src="/assets/boxes-editorial.svg" alt={product.name} width={900} height={700} className="h-40 w-full rounded-[20px] object-cover" />
                </div>
                <div className="mt-4 font-serif text-3xl text-matcha-deep">{product.name}</div>
                <div className="mt-2 text-sm text-muted">{product.tagline}</div>
                <div className="mt-4 text-sm font-medium text-matcha-deep">{product.ctaLabel}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2 2xl:grid-cols-4">
          {lumiaProducts.map((product, index) => (
            <ProductCard key={product.slug} product={product} featured={index === 2} />
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
