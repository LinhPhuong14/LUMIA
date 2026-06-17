import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const itemSchema = z.object({
  product_id: z.string().uuid(),
  slug: z.string(),
  name: z.string(),
  price_vnd: z.number().int().positive(),
  qty: z.number().int().min(1).max(20),
  variant: z.string().optional(),
});

const schema = z.object({
  items: z.array(itemSchema).min(1),
  shipping_name: z.string().min(1),
  shipping_phone: z.string().min(8),
  shipping_address: z.string().min(5),
  guest_email: z.string().email().optional(),
  note: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.error("[store/orders] validation error:", JSON.stringify(parsed.error.flatten()));
    return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin" }, { status: 400 });
  }

  const { items, shipping_name, shipping_phone, shipping_address, guest_email, note } = parsed.data;

  const subtotal = items.reduce((sum, item) => sum + item.price_vnd * item.qty, 0);
  const shipping = subtotal >= 300000 ? 0 : 30000; // free shipping over 300k
  const total = subtotal + shipping;

  const { data, error } = await supabase
    .from("store_orders")
    .insert({
      user_id: user?.id ?? null,
      guest_email: user ? null : (guest_email ?? null),
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
