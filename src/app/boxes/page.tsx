import Link from "next/link";

import { ProductCard } from "@/components/marketing/product-card";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { lumiaBoxes } from "@/data/catalog";
import { hasUserBoughtFirstTime } from "@/lib/subscriptions";
import { getSession } from "@/lib/supabase/auth";

const catalogFeatures = [
  "AI Sleep",
  "Mood Tracking",
  "Guided Meditation",
  "Breathing Exercise",
  "Journal & Reflect",
  "Sleep Sounds",
];

export default async function BoxesPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const onboarding = params.onboarding === "1";
  const firstTimeUnavailable = session ? await hasUserBoughtFirstTime(session.id) : false;

  return (
    <div className="catalog-page marketing-page page-scroll-area h-full">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-4 py-8 md:px-7 md:py-12">
        <section className="mx-auto max-w-4xl text-center">
          <p className="text-sm text-[var(--lumia-text-soft)]">
            Nền tảng chăm sóc giấc ngủ và sức khỏe tinh thần
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.05em] text-[var(--lumia-text)] md:text-5xl">
            Bộ sưu tập hộp LUMIA
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-[var(--lumia-text-soft)] md:mt-4 md:text-lg">
            Đăng ký LUMIA để ngủ ngon hơn mỗi đêm — chọn gói phù hợp với bạn.
          </p>
        </section>

        {onboarding ? (
          <section className="mx-auto mt-10 max-w-3xl rounded-[32px] border border-[var(--lumia-green-soft)] bg-white p-5 shadow-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <Link
                href="/boxes/first-time-user"
                className="rounded-[24px] bg-[var(--lumia-green)] px-6 py-5 text-left text-white transition hover:opacity-90"
              >
                <div className="text-sm font-medium">Bắt đầu với gói người dùng mới</div>
                <div className="mt-2 text-sm text-white/80">99.000đ — tháng đầu tiên kèm Mini Welcome Box.</div>
              </Link>
              <Link
                href={session ? "/dashboard" : "/register?next=/onboarding"}
                className="rounded-[24px] border border-[var(--lumia-green-soft)] bg-white px-6 py-5 text-left text-[var(--lumia-text)] transition hover:bg-[var(--lumia-green-bg)]"
              >
                <div className="text-sm font-medium">Dùng thử miễn phí trước</div>
                <div className="mt-2 text-sm text-[var(--lumia-text-soft)]">Vào workspace ngay, rồi nâng cấp sau.</div>
              </Link>
            </div>
          </section>
        ) : null}

        <section className="products-grid mx-auto mt-8 md:mt-14">
          {lumiaBoxes.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              unavailable={product.tier === "first_time" && firstTimeUnavailable}
              unavailableReason={
                product.tier === "first_time" && firstTimeUnavailable
                  ? "Bạn đã sử dụng ưu đãi này rồi."
                  : undefined
              }
            />
          ))}
        </section>
      </main>

      <section className="catalog-footer-strip mt-12 px-4 py-8 md:px-7">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-[var(--lumia-text-mid)] md:text-left">
            {catalogFeatures.join(" · ")}
          </p>
          <p className="text-sm text-[var(--lumia-text-soft)]">lumia.vn</p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
