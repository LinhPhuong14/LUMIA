import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProductDetailView } from "@/components/store/product-detail-view";
import { getProductBySlug, STORE_PRODUCTS_DETAIL } from "@/data/store-products-detail";
import { getSession } from "@/lib/supabase/auth";

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

  const session = await getSession();
  return <ProductDetailView product={product} backHref="/store" isLoggedIn={!!session} />;
}
