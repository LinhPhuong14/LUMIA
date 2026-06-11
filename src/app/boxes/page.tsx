import Link from "next/link";

import { ProductCard } from "@/components/marketing/product-card";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { lumiaBoxes } from "@/data/catalog";
import { getSession } from "@/lib/supabase/auth";

export default async function BoxesPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const onboarding = params.onboarding === "1";

  return (
    <div className="min-h-[100dvh] bg-surface-warm">
      <SiteHeader />
      <main className="mx-auto max-w-[1280px] px-4 py-8 md:px-7 md:py-12">
        <section className="mx-auto max-w-4xl text-center">
          <div className="font-serif text-4xl leading-tight tracking-[-0.05em] text-foreground md:text-6xl md:leading-[0.95]">
            Bộ sưu tập hộp LUMIA
          </div>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-muted md:mt-4 md:text-lg md:leading-8">
            Chọn gói phù hợp — vuốt ngang để xem tất cả.
          </p>
        </section>

        {onboarding ? (
          <section className="mx-auto mt-10 max-w-3xl rounded-[32px] border border-white/70 bg-surface-glass p-5 shadow-[0_20px_50px_rgba(106,134,88,0.08)] backdrop-blur">
            <div className="grid gap-3 md:grid-cols-2">
              <Link
                href="/boxes/first-time-user"
                className="rounded-[24px] bg-inverse px-6 py-5 text-left text-white transition hover:bg-inverse-hover"
              >
                <div className="text-sm font-medium">Bắt đầu với gói người dùng mới</div>
                <div className="mt-2 text-sm text-white/70">99.000đ — tháng đầu tiên kèm Mini Welcome Box.</div>
              </Link>
              <Link
                href={session ? "/dashboard" : "/register?next=/onboarding"}
                className="rounded-[24px] border border-onboarding-border bg-onboarding-surface px-6 py-5 text-left text-foreground transition hover:bg-white"
              >
                <div className="text-sm font-medium">Dùng thử miễn phí trước</div>
                <div className="mt-2 text-sm text-muted">Vào workspace ngay, rồi nâng cấp sau.</div>
              </Link>
            </div>
          </section>
        ) : null}

        <section className="mobile-h-scroll mx-auto mt-8 -mx-4 px-4 md:mx-auto md:mt-14 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 xl:grid-cols-3 2xl:grid-cols-5">
          {lumiaBoxes.map((product) => (
            <div key={product.slug} className="mobile-snap-card w-[min(85vw,320px)] md:w-auto">
              <ProductCard product={product} />
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
