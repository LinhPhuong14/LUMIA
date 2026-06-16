import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STATIC_PRODUCTS = [
  {
    id: "tra-thao-moc",
    slug: "tra-thao-moc",
    name: "Trà thảo mộc Lumia",
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
    name: "Nến thơm LUMIA",
    subtitle: "Sáp đậu nành · 300g · 40h cháy",
    price_vnd: 265000,
    category: "scent",
    image_url: null,
    in_stock: true,
    features: ["Sáp đậu nành", "Hoa khô tự nhiên", "3 mùi hương"],
    sort_order: 2,
  },
  {
    id: "set-khuech-tan-tinh-dau",
    slug: "set-khuech-tan-tinh-dau",
    name: "Tinh dầu khuếch tán Lumia",
    subtitle: "50ml · Que khuếch tán",
    price_vnd: 100000,
    category: "scent",
    image_url: null,
    in_stock: true,
    features: ["Không cần điện", "Lan tỏa tự nhiên", "Tinh dầu thiên nhiên"],
    sort_order: 3,
  },
  {
    id: "xit-oai-huong",
    slug: "xit-oai-huong",
    name: "Tinh dầu xịt Oải Hương",
    subtitle: "Lavender · 100ml",
    price_vnd: 150000,
    category: "scent",
    image_url: null,
    in_stock: true,
    features: ["Thư giãn tinh thần", "Khử mùi", "Nguyên chất 100%"],
    sort_order: 4,
  },
  {
    id: "xit-tra-trang",
    slug: "xit-tra-trang",
    name: "Tinh dầu xịt Trà Trắng",
    subtitle: "White Tea · 100ml",
    price_vnd: 150000,
    category: "scent",
    image_url: null,
    in_stock: true,
    features: ["Hương thuần khiết", "Khử mùi", "Nguyên chất 100%"],
    sort_order: 5,
  },
  {
    id: "xit-bach-dan-chanh",
    slug: "xit-bach-dan-chanh",
    name: "Tinh dầu xịt Bạch Đàn Chanh",
    subtitle: "Eucalyptus Lemon · 100ml",
    price_vnd: 150000,
    category: "scent",
    image_url: null,
    in_stock: true,
    features: ["Thanh tẩy không gian", "Xua đuổi côn trùng", "Nguyên chất"],
    sort_order: 6,
  },
  {
    id: "xit-hoa-lai",
    slug: "xit-hoa-lai",
    name: "Tinh dầu xịt Hoa Lài",
    subtitle: "Jasmine · 100ml",
    price_vnd: 150000,
    category: "scent",
    image_url: null,
    in_stock: true,
    features: ["Hương tinh tế", "Thư giãn", "Nguyên chất 100%"],
    sort_order: 7,
  },
  {
    id: "bit-mat-lua",
    slug: "bit-mat-lua",
    name: "Bịt mắt lụa Lumia",
    subtitle: "Lụa satin cao cấp",
    price_vnd: 165000,
    category: "sleep",
    image_url: null,
    in_stock: true,
    features: ["Che sáng hiệu quả", "Hỗ trợ ngủ sâu", "Mềm mại thoáng khí"],
    sort_order: 8,
  },
  {
    id: "chuong-thien",
    slug: "chuong-thien",
    name: "Chuông thiền Lumia",
    subtitle: "Chuông đồng · Vỗ gỗ · Đệm lót",
    price_vnd: 330000,
    category: "meditation",
    image_url: null,
    in_stock: true,
    features: ["Hỗ trợ thiền định", "Âm thanh trong trẻo", "Chuông đồng thật"],
    sort_order: 9,
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
