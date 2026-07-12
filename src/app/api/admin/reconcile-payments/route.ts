import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getPayOSClient } from "@/lib/payos";
import { getSession } from "@/lib/supabase/auth";
import { settleOrderPaid } from "@/lib/subscriptions";

export const runtime = "nodejs";

// GET /api/admin/reconcile-payments
//   ?from=2026-07-11&to=2026-07-13   (VN dates; `to` is exclusive)
//   ?apply=1                          actually settle (default = dry run)
//
// Reconciles pending_payment orders against PayOS: for each order PayOS reports
// as PAID, marks it paid and grants the subscription (idempotent). Orders PayOS
// does NOT report as paid are left untouched and listed as `stillUnpaid`.
// Role gating is enforced by src/proxy.ts (service-role admin check).
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const admin = createAdminClient();
  const payos = getPayOSClient();
  if (!admin || !payos) {
    return NextResponse.json({ error: "Supabase/PayOS chưa sẵn sàng." }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const apply = searchParams.get("apply") === "1";
  // force=1: settle WITHOUT PayOS confirmation (use when payment landed in the
  // bank directly and PayOS never matched it — the merchant vouches it's paid).
  const force = searchParams.get("force") === "1";
  const idsParam = searchParams.get("ids");
  const onlyIds = idsParam ? idsParam.split(",").map((s) => s.trim()).filter(Boolean) : null;
  const from = searchParams.get("from") ?? "2026-07-11";
  const to = searchParams.get("to") ?? "2026-07-13";
  const fromTs = `${from}T00:00:00+07:00`;
  const toTs = `${to}T00:00:00+07:00`;

  let pendingQuery = admin
    .from("orders")
    .select("id, payos_order_id, amount, tier, user_id, created_at, status")
    .eq("status", "pending_payment")
    .gte("created_at", fromTs)
    .lt("created_at", toTs)
    .order("created_at", { ascending: true });
  if (onlyIds) {
    pendingQuery = pendingQuery.in("id", onlyIds);
  }

  const { data: pending, error } = await pendingQuery;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const settled: unknown[] = [];
  const stillUnpaid: unknown[] = [];
  const errors: unknown[] = [];

  for (const o of pending ?? []) {
    if (!o.payos_order_id) {
      errors.push({ orderId: o.id, reason: "missing payos_order_id" });
      continue;
    }
    try {
      // force skips the PayOS check and treats the order as paid.
      const isPaid = force ? true : (await payos.paymentRequests.get(Number(o.payos_order_id))).status === "PAID";
      if (isPaid) {
        if (apply) {
          await settleOrderPaid(String(o.payos_order_id));
        }
        settled.push({
          orderId: o.id,
          payosOrderId: o.payos_order_id,
          tier: o.tier,
          amount: o.amount,
          createdAt: o.created_at,
          via: force ? "force" : "payos",
        });
      } else {
        stillUnpaid.push({ orderId: o.id, tier: o.tier, amount: o.amount });
      }
    } catch (e) {
      errors.push({ orderId: o.id, payosOrderId: o.payos_order_id, reason: String(e) });
    }
  }

  return NextResponse.json({
    mode: `${apply ? "APPLIED" : "DRY_RUN (add ?apply=1)"}${force ? " · FORCE (no PayOS check)" : ""}`,
    range: { from: fromTs, to: toTs },
    filteredByIds: onlyIds ?? undefined,
    totalPending: pending?.length ?? 0,
    settledCount: settled.length,
    stillUnpaidCount: stillUnpaid.length,
    errorCount: errors.length,
    settledAmount: settled.reduce<number>((s, x) => s + ((x as { amount?: number }).amount ?? 0), 0),
    settled,
    stillUnpaid,
    errors,
  });
}
