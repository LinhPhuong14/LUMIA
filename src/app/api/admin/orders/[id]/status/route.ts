import { NextResponse } from "next/server";
import { z } from "zod";

import { updateOrderStatus } from "@/lib/orders";
import { getSession } from "@/lib/supabase/auth";
import type { OrderStatus } from "@/lib/supabase/types";

const schema = z.object({
  status: z.enum(["pending_payment", "paid", "preparing", "shipping", "delivered"]),
});

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
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
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
