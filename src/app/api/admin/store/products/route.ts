import { NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  await requireRole(["admin"]);
  const supabase = await createClient();
  if (!supabase) return NextResponse.json([], { status: 503 });

  const { data } = await supabase
    .from("store_products")
    .select("id,name,category,price_vnd,stock_quantity,in_stock,slug")
    .order("category", { ascending: true });

  return NextResponse.json(data ?? []);
}
