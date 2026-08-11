import { NextResponse } from "next/server";

import { initialStatusFor } from "@/lib/store-orders";
import { getStoreOrdersForUser } from "@/lib/store-orders-db";
import { priceCart, productIdsToLookUp, type PricingProduct } from "@/lib/store-pricing";
import { createClient } from "@/lib/supabase/server";
import { describeStoreOrderError, storeOrderSchema } from "@/lib/validators/store-order";

export const runtime = "nodejs";

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

  const {
    items, shipping_name, shipping_phone, shipping_address, guest_email, note, payment_method,
  } = parsed.data;

  // Giá KHÔNG lấy từ payload. Trình duyệt chỉ được nói mua cái gì, mấy cái —
  // tiền thì đọc từ `store_products`.
  const ids = productIdsToLookUp(items);
  const { data: products, error: productError } = ids.length
    ? await supabase
        .from("store_products")
        .select("id,slug,name,price_vnd,in_stock,variants")
        .in("id", ids)
    : { data: [], error: null };

  if (productError) {
    console.error("[store/orders] price lookup failed:", productError.message);
    return NextResponse.json({ error: "Không kiểm tra được giá sản phẩm." }, { status: 503 });
  }

  const pricing = priceCart(items, (products ?? []) as PricingProduct[]);
  if (!pricing.ok) {
    return NextResponse.json({ error: pricing.error }, { status: 409 });
  }

  const { items: pricedItems, subtotal, shipping, total } = pricing;

  const { data, error } = await supabase
    .from("store_orders")
    .insert({
      user_id: user?.id ?? null,
      guest_email: user ? null : (guest_email || null),
      items: pricedItems,
      subtotal_vnd: subtotal,
      shipping_vnd: shipping,
      total_vnd: total,
      shipping_name,
      shipping_phone,
      shipping_address,
      note: note || null,
      payment_method,
      status: initialStatusFor(payment_method),
    })
    .select("id")
    .single();

  if (error) {
    console.error("[store/orders] insert error:", error.message, error.code);
    // Cột chưa có = chưa chạy migration 027. Nói thẳng, vì mọi đơn đều hỏng cho
    // tới khi chạy nó — im lặng ở đây là cả cửa hàng ngừng bán mà không ai biết.
    const missingColumn = /payment_method|cancelled_at/.test(error.message);
    return NextResponse.json(
      {
        error: missingColumn
          ? "Cửa hàng chưa sẵn sàng nhận đơn (thiếu cấu hình cơ sở dữ liệu)."
          : "Không thể tạo đơn hàng",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    orderId: data.id,
    paymentMethod: payment_method,
    total_vnd: total,
    shipping_vnd: shipping,
  });
}

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ orders: [] });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ orders: [], error: "Bạn cần đăng nhập." }, { status: 401 });

  const { orders, error } = await getStoreOrdersForUser(user.id);
  return NextResponse.json({ orders, error });
}
