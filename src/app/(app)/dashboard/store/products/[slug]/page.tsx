import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProductDetailView } from "@/components/store/product-detail-view";
import { getProductBySlug } from "@/data/store-products-detail";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { requireSession } from "@/lib/supabase/auth";
import { getDbProductBySlug } from "@/lib/store-db";

export const dynamic = "force-dynamic";

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

  const [session, dbProduct] = await Promise.all([
    requireSession(),
    getDbProductBySlug(slug),
  ]);
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
      <ProductDetailView
        product={product}
        dbProduct={dbProduct ?? undefined}
        backHref="/dashboard/store"
        inDashboard
      />
    </DashboardShell>
  );
}
