import { NextResponse } from "next/server";
import { describeStoreOrderError, storeOrderSchema } from "@/lib/validators/store-order";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const parsed = storeOrderSchema.safeParse(body);
  if (!parsed.success) {
    console.error("[store/orders] validation error:", JSON.stringify(parsed.error.flatten()));
    return NextResponse.json({ error: describeStoreOrderError(parsed.error) }, { status: 400 });
  }

  const { items, shipping_name, shipping_phone, shipping_address, guest_email, note } = parsed.data;

  const subtotal = items.reduce((sum, item) => sum + item.price_vnd * item.qty, 0);
  const shipping = subtotal >= 300000 ? 0 : 30000; // free shipping over 300k
  const total = subtotal + shipping;

  const { data, error } = await supabase
    .from("store_orders")
    .insert({
      user_id: user?.id ?? null,
      guest_email: user ? null : (guest_email || null),
      items,
      subtotal_vnd: subtotal,
      shipping_vnd: shipping,
      total_vnd: total,
      shipping_name,
      shipping_phone,
      shipping_address,
      note: note ?? null,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[store/orders] insert error:", error.message, error.code);
    return NextResponse.json({ error: "Không thể tạo đơn hàng" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, orderId: data.id, total_vnd: total, shipping_vnd: shipping });
}

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ orders: [] });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ orders: [] });

  const { data } = await supabase
    .from("store_orders")
    .select("id, status, items, total_vnd, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ orders: data ?? [] });
}
