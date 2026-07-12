import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json([]);
  const { data } = await supabase
    .from("subscription_plans")
    .select("id,name,price_vnd,duration_months,features,is_featured,is_first_time_only,box_image_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return NextResponse.json(data ?? []);
}
