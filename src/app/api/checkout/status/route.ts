import { NextResponse } from "next/server";
import { getPayOSClient } from "@/lib/payos";
import { getSession } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

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
    // If paid, update order status in DB
    if (link.status === "PAID") {
      const admin = createAdminClient();
      if (admin) {
        await admin
          .from("orders")
          .update({ status: "paid" })
          .eq("payos_order_id", orderCode)
          .eq("user_id", session.id);
      }
    }
    return NextResponse.json({ status: link.status, amountPaid: link.amountPaid });
  } catch {
    return NextResponse.json({ status: "UNKNOWN" });
  }
}
