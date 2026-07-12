import { NextResponse } from "next/server";
import { z } from "zod";

import { updateOrderStatus } from "@/lib/orders";
import { getSession } from "@/lib/supabase/auth";
import { grantSubscription } from "@/lib/subscriptions";
import { isValidTierCode } from "@/lib/product-tiers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/lib/supabase/types";

const schema = z.object({
  status: z.enum(["pending_payment", "paid", "preparing", "shipping", "delivered"]),
});

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const order = await updateOrderStatus(id, parsed.data.status as OrderStatus);

    // Marking an order paid must also activate the subscription — grant once,
    // skipping if a subscription for this order is already active.
    if (parsed.data.status === "paid" && order.tier && isValidTierCode(order.tier)) {
      const admin = createAdminClient();
      const { data: existingSub } = admin
        ? await admin
            .from("subscriptions")
            .select("id")
            .eq("box_order_id", order.id)
            .eq("status", "active")
            .maybeSingle()
        : { data: null };
      if (!existingSub) {
        await grantSubscription(order.user_id, order.tier, order.id);
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
