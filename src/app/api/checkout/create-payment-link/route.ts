import { NextResponse } from "next/server";

import { getProductBySlug } from "@/data/catalog";
import { env, hasPayOSConfig, hasSupabaseConfig } from "@/lib/env";
import { createOrder } from "@/lib/orders";
import { getPayOSClient } from "@/lib/payos";
import { getSession } from "@/lib/supabase/auth";
import { buildAbsoluteUrl, toOrderCode } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Bạn cần đăng nhập trước khi tiếp tục." }, { status: 401 });
  }

  let slug = "first-time-user";
  try {
    const body = (await request.json()) as { slug?: string };
    if (body.slug) {
      slug = body.slug;
    }
  } catch {
    // default slug when body is empty
  }

  const product = getProductBySlug(slug);
  if (!product) {
    return NextResponse.json({ error: "Gói sản phẩm không hợp lệ." }, { status: 400 });
  }

  if (!hasSupabaseConfig() || !hasPayOSConfig()) {
    if (!env.DEMO_MODE) {
      return NextResponse.json({ error: "Phiên thanh toán chưa sẵn sàng." }, { status: 503 });
    }
    return NextResponse.json({
      checkoutUrl: `${buildAbsoluteUrl("/checkout/success")}?demo=1`,
      mode: "demo",
    });
  }

  const orderCode = toOrderCode(Math.floor(Math.random() * 900) + 100);
  const returnUrl = buildAbsoluteUrl("/checkout/success");
  const cancelUrl = buildAbsoluteUrl("/checkout/cancel");

  const payos = getPayOSClient();
  if (!payos) {
    return NextResponse.json({ error: "Không thể khởi tạo phiên thanh toán." }, { status: 500 });
  }

  try {
    const paymentLink = await payos.paymentRequests.create({
      orderCode,
      amount: product.price,
      description: "LUMIA Box",
      returnUrl,
      cancelUrl,
      buyerEmail: session.email,
      buyerName: session.name,
      items: [{ name: product.name.slice(0, 25), quantity: 1, price: product.price }],
    });

    await createOrder({
      userId: session.id,
      payosOrderId: String(paymentLink.orderCode),
      amount: product.price,
    });

    return NextResponse.json({ checkoutUrl: paymentLink.checkoutUrl, orderCode: paymentLink.orderCode });
  } catch (error) {
    return NextResponse.json({ error: "Không thể tạo liên kết thanh toán.", detail: String(error) }, { status: 500 });
  }
}
