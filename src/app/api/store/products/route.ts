import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ products: [] });

  const { data, error } = await supabase
    .from("store_products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) return NextResponse.json({ products: [] });
  return NextResponse.json({ products: data ?? [] });
}
