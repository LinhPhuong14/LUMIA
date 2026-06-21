import { createClient } from "@/lib/supabase/server";

export type DbProduct = {
  id: string;
  slug: string;
  image_url: string | null;
  images: { url: string; label: string }[];
  variants: { name: string; image_url: string }[];
  in_stock: boolean;
  stock_quantity: number;
};

export async function getDbProductBySlug(slug: string): Promise<DbProduct | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("store_products")
    .select("id,slug,image_url,images,variants,in_stock,stock_quantity")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    image_url: data.image_url ?? null,
    images: (data.images as { url: string; label: string }[]) ?? [],
    variants: (data.variants as { name: string; image_url: string }[]) ?? [],
    in_stock: data.in_stock ?? true,
    stock_quantity: data.stock_quantity ?? 0,
  };
}
