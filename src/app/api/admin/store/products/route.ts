import { NextResponse } from "next/server";
import { requireSession, getSession } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type ProductImage = { url: string; label?: string };
type ProductVariant = { name: string; image_url?: string };

type CreateProductBody = {
  slug: string;
  name: string;
  subtitle?: string;
  description?: string;
  price_vnd: number;
  category: string;
  features?: string[];
  image_url?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  in_stock: boolean;
  stock_quantity: number;
  sort_order?: number;
};

export async function GET() {
  await requireSession();
  const supabase = await createClient();
  if (!supabase) return NextResponse.json([], { status: 503 });

  const { data } = await supabase
    .from("store_products")
    .select("id,slug,name,subtitle,description,category,price_vnd,stock_quantity,in_stock,image_url,features,images,variants,sort_order")
    .order("sort_order", { ascending: true });

  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
  }

  const body = (await req.json()) as CreateProductBody;

  const { data, error } = await admin
    .from("store_products")
    .insert({
      slug: body.slug,
      name: body.name,
      subtitle: body.subtitle ?? null,
      description: body.description ?? null,
      price_vnd: body.price_vnd,
      category: body.category,
      features: body.features ?? [],
      image_url: body.image_url ?? null,
      images: body.images ?? [],
      variants: body.variants ?? [],
      in_stock: body.in_stock,
      stock_quantity: body.stock_quantity,
      sort_order: body.sort_order ?? 0,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
