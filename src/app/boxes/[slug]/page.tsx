import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { getProductBySlug, lumiaProducts } from "@/data/catalog";
import { formatCurrency } from "@/lib/utils";

export async function generateStaticParams() {
  return lumiaProducts.map((product) => ({ slug: product.slug }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="shell py-12">
        <section className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr] xl:items-center">
          <div className="relative min-h-[78vh] overflow-hidden rounded-[40px] border border-white/75 bg-white/82 p-5 shadow-[0_24px_80px_rgba(244,216,120,0.18)]">
            <div className="absolute left-1/2 top-20 h-52 w-52 -translate-x-1/2 rounded-full bg-[#F4D878]/24 blur-3xl animate-breathe-glow" />
            <Image src="/assets/boxes-editorial.svg" alt={product.name} width={1600} height={1200} className="relative h-full w-full rounded-[34px] object-cover" priority />

            <div className="pointer-events-none absolute left-8 top-10 rounded-[24px] border border-white/70 bg-white/84 px-5 py-4 text-sm text-matcha-deep shadow-[0_16px_40px_rgba(143,168,120,0.1)]">
              Nến thơm
            </div>
            <div className="pointer-events-none absolute right-10 top-20 rounded-[24px] border border-white/70 bg-white/84 px-5 py-4 text-sm text-matcha-deep shadow-[0_16px_40px_rgba(143,168,120,0.1)]">
              Thẻ gợi mở viết ra
            </div>
            <div className="pointer-events-none absolute left-16 bottom-24 rounded-[24px] border border-white/70 bg-white/84 px-5 py-4 text-sm text-matcha-deep shadow-[0_16px_40px_rgba(143,168,120,0.1)]">
              Hương thơm dịu nhẹ
            </div>
            <div className="pointer-events-none absolute right-16 bottom-16 rounded-[24px] border border-white/70 bg-white/84 px-5 py-4 text-sm text-matcha-deep shadow-[0_16px_40px_rgba(143,168,120,0.1)]">
              Mã kích hoạt LUMIA
            </div>
          </div>

          <div className="space-y-6">
            <span className="eyebrow">{product.tierLabel}</span>
            <h1 className="font-serif text-6xl leading-[1.02] tracking-[-0.05em] text-matcha-deep">{product.name}</h1>
            <p className="text-xl leading-8 text-muted">{product.tagline}</p>
            <p className="text-lg leading-8 text-muted">{product.description}</p>

            <div className="rounded-[32px] border border-white/70 bg-white/82 p-6">
              <div className="text-sm uppercase tracking-[0.22em] text-muted">Bao gồm</div>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-foreground md:grid-cols-2">
                {product.physicalItems.map((item) => (
                  <li key={item} className="rounded-[20px] bg-[#FFFEFA] px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[32px] bg-[linear-gradient(145deg,rgba(255,254,250,0.96),rgba(255,253,245,0.9),rgba(255,243,199,0.45))] p-6">
              <div className="text-sm uppercase tracking-[0.22em] text-muted">Quyền truy cập không gian số</div>
              <p className="mt-4 text-base leading-7 text-matcha-deep">{product.digitalAccess}</p>
              <ul className="mt-5 grid gap-3 text-sm leading-6 text-foreground md:grid-cols-2">
                {product.features.map((feature) => (
                  <li key={feature} className="rounded-[20px] border border-white/70 bg-white/78 px-4 py-3">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[32px] border border-white/70 bg-white/82 p-6">
              <div className="text-sm uppercase tracking-[0.22em] text-muted">Giá</div>
              <div className="mt-3 font-serif text-5xl text-matcha-deep">{formatCurrency(product.price)}</div>
              <p className="mt-4 text-sm leading-6 text-muted">{product.ritualFocus}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href={`/checkout?product=${product.slug}` as Route} className="button-primary magnetic-hover px-8 py-4">
                Thêm vào giỏ hàng
              </Link>
              <Link href="/boxes" className="button-secondary magnetic-hover px-8 py-4">
                So sánh các hộp
              </Link>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed bottom-4 left-1/2 z-40 w-[min(92vw,920px)] -translate-x-1/2 rounded-full border border-white/75 bg-white/86 px-5 py-3 shadow-[0_20px_60px_rgba(244,216,120,0.22)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-matcha-deep">{product.name}</div>
            <div className="text-sm text-muted">{formatCurrency(product.price)}</div>
          </div>
          <Link href={`/checkout?product=${product.slug}` as Route} className="button-primary">
            Thêm vào giỏ hàng
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
