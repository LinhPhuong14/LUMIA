import { notFound } from "next/navigation";

import { CheckoutPanel } from "@/components/checkout/checkout-panel";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { getProductBySlug, lumiaBoxes } from "@/data/catalog";
import { hasUserBoughtFirstTime } from "@/lib/subscriptions";
import { getSession } from "@/lib/supabase/auth";

export function generateStaticParams() {
  return lumiaBoxes.map((box) => ({ slug: box.slug }));
}

export default async function BoxDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const session = await getSession();
  const firstTimeUnavailable =
    product.tier === "first_time" && session ? await hasUserBoughtFirstTime(session.id) : false;

  return (
    <div className="catalog-page marketing-page page-scroll-area h-full">
      <SiteHeader />
      <main className="shell grid gap-8 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <section className="product-card product-card-default p-8">
          {product.featured ? (
            <span className="badge-featured mb-4 inline-flex">GÓI TIẾT KIỆM</span>
          ) : (
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--lumia-text-soft)]">
              {product.badge}
            </span>
          )}
          <h1 className="mt-4 text-sm font-semibold uppercase tracking-[0.1em] text-[var(--lumia-text)] md:text-base">
            {product.name}
          </h1>
          <p className="mt-2 text-lg text-[var(--lumia-text-soft)]">{product.duration}</p>
          <p className="mt-4 text-base leading-7 text-[var(--lumia-text-mid)]">{product.description}</p>
          <ul className="mt-6 space-y-2 text-sm leading-7">
            {product.features.map((feature) => (
              <li key={feature} className="flex gap-2">
                <span className="feature-check">✓</span>
                <span>{feature}</span>
              </li>
            ))}
            {product.physicalItems.map((item) => (
              <li key={item} className="flex gap-2 font-semibold">
                <span className="feature-check">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
        <CheckoutPanel
          product={product}
          unavailable={firstTimeUnavailable}
          unavailableReason="Bạn đã sử dụng ưu đãi này rồi."
        />
      </main>
      <SiteFooter />
    </div>
  );
}
