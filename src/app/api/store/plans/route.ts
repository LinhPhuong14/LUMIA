import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json([]);
  const { data } = await supabase
    .from("subscription_plans")
    .select("id,box_image_url")
    .eq("is_active", true);
  return NextResponse.json(data ?? []);
}
