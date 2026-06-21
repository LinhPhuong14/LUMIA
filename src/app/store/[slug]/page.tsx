import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { StoreProductDetailClient } from "@/components/store/store-product-detail-client";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

type DbVariant = { name: string; image_url?: string };
type DbImage   = { url: string; label?: string };

export type FullProduct = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  price_vnd: number;
  category: string | null;
  features: string[] | null;
  image_url: string | null;
  images: DbImage[];
  variants: DbVariant[];
  in_stock: boolean;
  stock_quantity: number;
  ingredients: string | null;
  usage_guide: string | null;
  safety_notes: string | null;
  storage_info: string | null;
  dimensions: string | null;
  origin: string | null;
  manufacturer: string | null;
  expiry_months: number | null;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  if (!supabase) return {};
  const { data } = await supabase
    .from("store_products")
    .select("name,subtitle")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return {};
  return { title: `${data.name} | Lumia Store`, description: data.subtitle ?? undefined };
}

export default async function StoreProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [supabase, session] = await Promise.all([createClient(), getSession()]);
  if (!supabase) notFound();

  const { data } = await supabase
    .from("store_products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) notFound();

  const product: FullProduct = {
    id: data.id,
    slug: data.slug,
    name: data.name,
    subtitle: data.subtitle ?? null,
    description: data.description ?? null,
    price_vnd: data.price_vnd,
    category: data.category ?? null,
    features: data.features ?? null,
    image_url: data.image_url ?? null,
    images: (data.images as DbImage[]) ?? [],
    variants: (data.variants as DbVariant[]) ?? [],
    in_stock: data.in_stock ?? true,
    stock_quantity: data.stock_quantity ?? 0,
    ingredients: data.ingredients ?? null,
    usage_guide: data.usage_guide ?? null,
    safety_notes: data.safety_notes ?? null,
    storage_info: data.storage_info ?? null,
    dimensions: data.dimensions ?? null,
    origin: data.origin ?? null,
    manufacturer: data.manufacturer ?? null,
    expiry_months: data.expiry_months ?? null,
  };

  return <StoreProductDetailClient product={product} isLoggedIn={!!session} />;
}
