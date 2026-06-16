import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProductDetailView } from "@/components/store/product-detail-view";
import { getProductBySlug, STORE_PRODUCTS_DETAIL } from "@/data/store-products-detail";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";

export function generateStaticParams() {
  return STORE_PRODUCTS_DETAIL.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return { title: `${product.name} | Lumia Store` };
}

export default async function DashboardStoreProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const session = await requireSession();
  const subscription = await getSubscriptionSnapshot(session.id);

  return (
    <DashboardShell
      sessionName={session.name}
      sessionEmail={session.email}
      subscription={subscription}
      title={product.name}
      subtitle={product.subtitle}
      isAdmin={session.role === "admin"}
    >
      <ProductDetailView product={product} backHref="/dashboard/store" inDashboard />
    </DashboardShell>
  );
}
