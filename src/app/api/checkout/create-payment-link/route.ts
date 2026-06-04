import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { getProductBySlug } from "@/data/catalog";
import { connectToDatabase } from "@/lib/db/mongoose";
import { env, hasMongoConfig, hasPayOSConfig } from "@/lib/env";
import { getPayOSClient } from "@/lib/payos";
import { createCheckoutSchema } from "@/lib/validators/checkout";
import { buildAbsoluteUrl, toOrderCode } from "@/lib/utils";
import { OrderModel, PaymentSessionModel } from "@/models";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Bạn cần đăng nhập trước khi tiếp tục." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createCheckoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Lựa chọn sản phẩm không hợp lệ." }, { status: 400 });
  }

  const product = getProductBySlug(parsed.data.productSlug);
  if (!product) {
    return NextResponse.json({ error: "Không tìm thấy lựa chọn này." }, { status: 404 });
  }

  if (!hasMongoConfig() || !hasPayOSConfig()) {
    if (!env.DEMO_MODE) {
      return NextResponse.json({ error: "Phiên thanh toán chưa sẵn sàng. Vui lòng thử lại sau ít phút." }, { status: 503 });
    }

    return NextResponse.json({
      checkoutUrl: `${buildAbsoluteUrl("/checkout/success")}?demo=1&tier=${product.tier}`,
      mode: "demo",
    });
  }

  await connectToDatabase();

  const orderCode = toOrderCode(Math.floor(Math.random() * 900) + 100);
  const order = await OrderModel.create({
    userId: session.userId,
    orderCode,
    status: "pending_payment",
    currency: "VND",
    totalAmount: product.price,
    tier: product.tier,
    items: [
      {
        productSlug: product.slug,
        productName: product.name,
        unitPrice: product.price,
        quantity: 1,
        tier: product.tier,
      },
    ],
    customerSnapshot: {
      email: session.email,
      name: session.name,
    },
  });

  const idempotencyKey = crypto.randomUUID();
  const returnUrl = buildAbsoluteUrl("/checkout/success");
  const cancelUrl = buildAbsoluteUrl("/checkout/cancel");

  const payos = getPayOSClient();
  if (!payos) {
    return NextResponse.json({ error: "Không thể khởi tạo phiên thanh toán lúc này." }, { status: 500 });
  }

  try {
    const paymentLink = await payos.paymentRequests.create({
      orderCode,
      amount: product.price,
      description: `LUMIA ${product.tier.toUpperCase()}`,
      returnUrl,
      cancelUrl,
      buyerEmail: session.email,
      buyerName: session.name,
      items: [
        {
          name: product.name.slice(0, 25),
          quantity: 1,
          price: product.price,
        },
      ],
    });

    await PaymentSessionModel.create({
      orderId: order.id,
      provider: "payos",
      paymentLinkId: paymentLink.paymentLinkId,
      orderCode,
      idempotencyKey,
      status: "created",
      checkoutUrl: paymentLink.checkoutUrl,
      returnUrl,
      cancelUrl,
    });

    await OrderModel.updateOne(
        { _id: order.id },
      {
        paymentLinkId: paymentLink.paymentLinkId,
        payosOrderCode: paymentLink.orderCode,
        providerMetadata: paymentLink,
      },
    );

    return NextResponse.json({ checkoutUrl: paymentLink.checkoutUrl, orderCode });
  } catch (error) {
    await OrderModel.updateOne({ _id: order.id }, { status: "cancelled", providerMetadata: { error: String(error) } });
    return NextResponse.json({ error: "Không thể tạo liên kết thanh toán lúc này." }, { status: 500 });
  }
}
