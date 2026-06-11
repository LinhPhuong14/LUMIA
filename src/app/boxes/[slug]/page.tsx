import { notFound } from "next/navigation";

import { CheckoutPanel } from "@/components/checkout/checkout-panel";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { getProductBySlug, lumiaBox } from "@/data/catalog";

export function generateStaticParams() {
  return [{ slug: lumiaBox.slug }];
}

export default async function BoxDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="shell grid gap-8 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <section className="soft-card p-8">
          <span className="eyebrow">{product.badge}</span>
          <h1 className="mt-4 font-serif text-5xl text-matcha-deep">{product.name}</h1>
          <p className="mt-4 text-lg leading-8 text-muted">{product.description}</p>
          <ul className="mt-6 space-y-2 text-sm leading-7 text-foreground">
            {product.features.map((feature) => (
              <li key={feature}>- {feature}</li>
            ))}
          </ul>
        </section>
        <CheckoutPanel product={product} />
      </main>
      <SiteFooter />
    </div>
  );
}
