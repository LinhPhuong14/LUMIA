import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, payos_order_id, amount, created_at")
    .eq("user_id", session.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orders = (data ?? []).map((order) => ({
    id: order.id,
    status: order.status,
    payosOrderId: order.payos_order_id,
    amount: order.amount,
    createdAt: order.created_at,
  }));

  return NextResponse.json(orders);
}
