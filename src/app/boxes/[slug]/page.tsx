import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { getProductBySlug, lumiaProducts } from "@/data/catalog";
import { formatCurrency } from "@/lib/utils";

const trustHighlights = [
  "Nghi thức dịu nhẹ",
  "Không gian riêng tư",
  "Quyền truy cập digital",
  "Quà tặng tinh tế",
] as const;

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
    <div className="min-h-screen bg-[#f8f4eb]">
      <SiteHeader />
      <main className="mx-auto max-w-[1320px] px-7 py-10">
        <Link href="/boxes" className="inline-flex items-center gap-2 text-sm text-[#6f6b63] transition hover:text-[#2f2b25]">
          <span aria-hidden="true">‹</span> Quay lại danh sách box
        </Link>

        <section className="mt-6 grid gap-10 xl:grid-cols-[1.04fr_0.96fr] xl:items-start">
          <div className="rounded-[36px] bg-[linear-gradient(145deg,#b88247,#f4dba9)] p-6 shadow-[0_22px_60px_rgba(180,154,67,0.18)]">
            <div className="flex min-h-[640px] items-center justify-center rounded-[30px] bg-[linear-gradient(145deg,rgba(255,250,241,0.52),rgba(255,255,255,0.18))] px-8 text-center">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-white/82">Hình ảnh sản phẩm sẽ được cập nhật</div>
                <div className="mt-4 font-serif text-5xl leading-tight text-white">{product.name}</div>
                <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/82">
                  Mình đã gỡ ảnh SVG placeholder khỏi trang chi tiết này để bạn thay bằng ảnh thật của từng box sau.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-xs uppercase tracking-[0.28em] text-[#8b847a]">{product.tierLabel}</div>
            <h1 className="font-serif text-[4.4rem] leading-[0.95] tracking-[-0.06em] text-[#21304b]">{product.name}</h1>
            <p className="text-2xl italic leading-8 text-[#5f7253]">{product.tagline}</p>
            <p className="max-w-2xl text-lg leading-8 text-[#4e4a43]">{product.description}</p>

            <div className="flex items-end gap-4">
              <div className="text-[3.4rem] font-semibold leading-none text-[#1f2a3b]">{formatCurrency(product.price)}</div>
              <div className="pb-2 text-lg text-[#8b847a]">{product.durationMonths} tháng đồng hành</div>
            </div>

            <div>
              <div className="text-sm font-medium text-[#2f2b25]">Nhịp phù hợp</div>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="rounded-full bg-[#5f7253] px-6 py-3 text-sm font-medium text-white">
                  {product.durationMonths} tháng
                </div>
                <div className="rounded-full border border-[#e5dac5] bg-[#f7f2e8] px-6 py-3 text-sm text-[#6f6b63]">
                  {product.badge ?? "Dịu dàng"}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href={`/checkout?product=${product.slug}` as Route}
                className="inline-flex items-center justify-center rounded-full bg-[#5b6f47] px-8 py-4 text-base font-medium text-white transition hover:bg-[#4e613d]"
              >
                Mua box này
              </Link>
              <Link
                href="/boxes"
                className="inline-flex items-center justify-center rounded-full border border-[#d8cfbd] bg-white/75 px-8 py-4 text-base font-medium text-[#2f2b25] transition hover:bg-white"
              >
                Xem box khác
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {trustHighlights.map((item) => (
                <div key={item} className="rounded-[24px] border border-[#ece5d6] bg-white/72 px-4 py-5 text-center text-sm text-[#5f7253] shadow-[0_10px_24px_rgba(106,134,88,0.06)]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[32px] border border-white/70 bg-white/82 p-6 shadow-[0_16px_46px_rgba(106,134,88,0.06)]">
            <div className="text-xs uppercase tracking-[0.24em] text-[#8b847a]">Bao gồm</div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {product.physicalItems.map((item) => (
                <div key={item} className="rounded-[20px] bg-[#fbf7ef] px-4 py-4 text-sm leading-6 text-[#2f2b25]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/82 p-6 shadow-[0_16px_46px_rgba(180,154,67,0.08)]">
            <div className="text-xs uppercase tracking-[0.24em] text-[#8b847a]">Không gian digital đi kèm</div>
            <p className="mt-5 text-base leading-7 text-[#4e4a43]">{product.digitalAccess}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {product.features.map((feature) => (
                <div key={feature} className="rounded-[20px] border border-[#efe7d8] bg-[#fffdf8] px-4 py-4 text-sm leading-6 text-[#5f7253]">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
