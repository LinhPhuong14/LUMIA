import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db/mongoose";
import { hasMongoConfig, hasPayOSConfig } from "@/lib/env";
import { grantEntitlement } from "@/lib/subscriptions";
import { getPayOSClient } from "@/lib/payos";
import { getProductFromTier } from "@/lib/domain";
import { OrderModel, PaymentSessionModel } from "@/models";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json();

  if (!hasPayOSConfig() || !hasMongoConfig()) {
    return NextResponse.json({ received: true, mode: "demo" });
  }

  const payos = getPayOSClient();
  if (!payos) {
    return NextResponse.json({ error: "PayOS client unavailable." }, { status: 500 });
  }

  try {
    const webhookData = await payos.webhooks.verify(payload);
    await connectToDatabase();

    const order = await OrderModel.findOne({ orderCode: webhookData.orderCode });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.totalAmount !== webhookData.amount) {
      return NextResponse.json({ error: "Amount mismatch." }, { status: 400 });
    }

    await PaymentSessionModel.updateOne(
      { orderCode: webhookData.orderCode },
      { status: "paid", paymentLinkId: webhookData.paymentLinkId, webhookPayload: payload },
    );

    if (["paid", "fulfilled"].includes(order.status)) {
      return NextResponse.json({ received: true, idempotent: true });
    }

    order.status = "provisioning";
    order.paymentLinkId = webhookData.paymentLinkId;
    order.providerMetadata = payload;
    await order.save();

    const product = getProductFromTier(order.tier);
    await grantEntitlement({
      userId: order.userId.toString(),
      tier: order.tier,
      durationMonths: product?.durationMonths ?? 1,
      source: "order",
      orderId: order.id,
    });

    order.status = "fulfilled";
    await order.save();

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: "Webhook verification failed.", detail: String(error) }, { status: 400 });
  }
}
