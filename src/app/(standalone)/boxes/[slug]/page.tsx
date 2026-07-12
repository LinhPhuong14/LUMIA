import { notFound } from "next/navigation";

import { CheckoutPanel } from "@/components/checkout/checkout-panel";
import { getAllPurchasableProducts, getProductBySlug } from "@/data/catalog";
import { withDbPricing } from "@/lib/plans-db";
import { hasUserBoughtFirstTime } from "@/lib/subscriptions";
import { getSession } from "@/lib/supabase/auth";

export const revalidate = 60;

export function generateStaticParams() {
  return getAllPurchasableProducts().map((box) => ({ slug: box.slug }));
}

export default async function BoxDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const staticProduct = getProductBySlug(slug);

  if (!staticProduct) {
    notFound();
  }

  // Overlay admin-managed price/name/features from the DB.
  const product = await withDbPricing(staticProduct);

  const session = await getSession();
  const firstTimeUnavailable =
    product.tier === "first_time" && session ? await hasUserBoughtFirstTime(session.id) : false;

  return (
    <main className="shell grid gap-8 py-10 md:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <section className="dash-panel product-card-default p-8">
        {product.featured ? (
          <span className="badge-featured mb-4 inline-flex">GÓI TIẾT KIỆM</span>
        ) : (
          <span className="text-xs uppercase tracking-[0.2em]" style={{ color: "var(--muted)" }}>
            {product.badge}
          </span>
        )}
        <h1
          className="mt-4 font-serif text-2xl font-bold md:text-3xl"
          style={{ color: "var(--title-primary)" }}
        >
          {product.name}
        </h1>
        <p className="mt-2 text-lg" style={{ color: "var(--muted)" }}>
          {product.duration}
        </p>
        <p className="mt-4 text-base leading-7" style={{ color: "var(--muted)" }}>
          {product.description}
        </p>
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
      <div className="dash-panel p-5 md:p-6">
        <CheckoutPanel
          product={product}
          unavailable={firstTimeUnavailable}
          unavailableReason="Bạn đã sử dụng ưu đãi này rồi."
        />
      </div>
    </main>
  );
}
