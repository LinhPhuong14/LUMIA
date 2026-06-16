import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STATIC_PRODUCTS = [
  {
    id: "tra-thao-moc",
    slug: "tra-thao-moc",
    name: "Trà thảo mộc",
    subtitle: "Hộp 20 túi lọc",
    price_vnd: 120000,
    category: "drink",
    image_url: null,
    in_stock: true,
    features: ["Thư giãn tinh thần", "Hỗ trợ ngủ sâu", "Giảm căng thẳng"],
    sort_order: 1,
  },
  {
    id: "nen-thom",
    slug: "nen-thom",
    name: "Nến thơm",
    subtitle: "Hũ 270g · Đốt 30–40 tiếng",
    price_vnd: 265000,
    category: "scent",
    image_url: null,
    in_stock: true,
    features: ["Thư giãn", "Giảm căng thẳng"],
    sort_order: 2,
  },
  {
    id: "set-khuech-tan-tinh-dau",
    slug: "set-khuech-tan-tinh-dau",
    name: "Set khuếch tán tinh dầu",
    subtitle: "Lavender, Bergamot, Lemon",
    price_vnd: 100000,
    category: "scent",
    image_url: null,
    in_stock: true,
    features: ["Thư giãn", "Khử mùi", "Tạo không gian ngủ"],
    sort_order: 3,
  },
  {
    id: "xit-goi-ngu",
    slug: "xit-goi-ngu",
    name: "Xịt gối ngủ",
    subtitle: "50ml / chai",
    price_vnd: 150000,
    category: "sleep",
    image_url: null,
    in_stock: true,
    features: ["Thư giãn tinh thần", "Khử mùi", "Xoa dịu tinh thần"],
    sort_order: 4,
  },
  {
    id: "bit-mat-lua",
    slug: "bit-mat-lua",
    name: "Bịt mắt lụa",
    subtitle: "Lụa satin",
    price_vnd: 165000,
    category: "sleep",
    image_url: null,
    in_stock: true,
    features: ["Che sáng hiệu quả", "Hỗ trợ ngủ sâu", "Tối ưu trải nghiệm"],
    sort_order: 5,
  },
  {
    id: "chuong-thien",
    slug: "chuong-thien",
    name: "Chuông thiền",
    subtitle: "Chuông đồng, vỗ gỗ, đệm lót",
    price_vnd: 330000,
    category: "meditation",
    image_url: null,
    in_stock: true,
    features: ["Hỗ trợ thiền định", "Tối ưu trải nghiệm"],
    sort_order: 6,
  },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search")?.toLowerCase();

  const supabase = await createClient();

  if (supabase) {
    let query = supabase
      .from("store_products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (category) query = query.eq("category", category);
    if (search) query = query.ilike("name", `%${search}%`);

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return NextResponse.json(data);
    }
  }

  // Fall back to static catalog
  let products = STATIC_PRODUCTS;
  if (category) products = products.filter((p) => p.category === category);
  if (search) products = products.filter((p) => p.name.toLowerCase().includes(search) || (p.subtitle ?? "").toLowerCase().includes(search));
  return NextResponse.json(products);
}
