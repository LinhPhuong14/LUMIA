import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { hasPayOSConfig, hasSupabaseConfig } from "@/lib/env";
import { settleOrderPaid } from "@/lib/subscriptions";
import { getPayOSClient } from "@/lib/payos";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json();

  if (!hasPayOSConfig() || !hasSupabaseConfig()) {
    return NextResponse.json({ received: true, mode: "demo" });
  }

  const payos = getPayOSClient();
  if (!payos) {
    return NextResponse.json({ error: "PayOS client unavailable." }, { status: 500 });
  }

  try {
    const webhookData = await payos.webhooks.verify(payload);

    // PayOS sends a test ping during webhook registration — orderCode = 0 or non-existent.
    // Return 200 so registration succeeds; real payments always have a real orderCode.
    if (!webhookData.orderCode || webhookData.orderCode === 0) {
      return NextResponse.json({ received: true, test: true });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase admin unavailable." }, { status: 500 });
    }

    const { data: order } = await admin
      .from("orders")
      .select("*")
      .eq("payos_order_id", String(webhookData.orderCode))
      .maybeSingle();

    if (!order) {
      // Unknown order — log and ack so PayOS doesn't retry endlessly
      console.warn("[payos-webhook] unknown orderCode:", webhookData.orderCode);
      return NextResponse.json({ received: true, unknown: true });
    }

    if (order.amount !== webhookData.amount) {
      return NextResponse.json({ error: "Amount mismatch." }, { status: 400 });
    }

    if (!order.tier) {
      return NextResponse.json({ error: "Order missing tier." }, { status: 400 });
    }

    // Idempotent: marks paid + grants subscription exactly once, even if the
    // checkout status poller already flipped this order to `paid` first.
    await settleOrderPaid(String(webhookData.orderCode));

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: "Webhook verification failed.", detail: String(error) }, { status: 400 });
  }
}
