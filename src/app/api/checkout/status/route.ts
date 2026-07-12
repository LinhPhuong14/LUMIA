import { NextResponse } from "next/server";
import { getPayOSClient } from "@/lib/payos";
import { getSession } from "@/lib/supabase/auth";
import { settleOrderPaid } from "@/lib/subscriptions";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const orderCode = searchParams.get("orderCode");
  if (!orderCode) return NextResponse.json({ error: "Missing orderCode" }, { status: 400 });

  const payos = getPayOSClient();
  if (!payos) return NextResponse.json({ status: "UNKNOWN" });

  try {
    const link = await payos.paymentRequests.get(Number(orderCode));
    // If paid, mark the order paid AND grant the subscription (idempotently).
    // This is the fallback path when the PayOS webhook hasn't fired yet, so
    // premium activates even without a reachable webhook.
    if (link.status === "PAID") {
      await settleOrderPaid(orderCode, session.id);
    }
    return NextResponse.json({ status: link.status, amountPaid: link.amountPaid });
  } catch {
    return NextResponse.json({ status: "UNKNOWN" });
  }
}
