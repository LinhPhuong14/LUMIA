import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProductDetailView } from "@/components/store/product-detail-view";
import { getProductBySlug } from "@/data/store-products-detail";
import { getSession } from "@/lib/supabase/auth";
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
  return {
    title: `${product.name} | Lumia Store`,
    description: product.tagline,
  };
}

export default async function StoreProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const [session, dbProduct] = await Promise.all([
    getSession(),
    getDbProductBySlug(slug),
  ]);

  return (
    <ProductDetailView
      product={product}
      dbProduct={dbProduct ?? undefined}
      backHref="/store"
      isLoggedIn={!!session}
    />
  );
}
