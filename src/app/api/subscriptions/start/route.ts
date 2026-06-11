import { NextResponse } from "next/server";

import { getDeliveredOrderForUser } from "@/lib/orders";
import { getSubscriptionSnapshot, startJourney } from "@/lib/subscriptions";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await getSubscriptionSnapshot(session.id);
  if (snapshot.isActive) {
    return NextResponse.json({ error: "Hành trình đã được bắt đầu." }, { status: 400 });
  }

  const deliveredOrder = await getDeliveredOrderForUser(session.id);
  if (!deliveredOrder) {
    return NextResponse.json({ error: "Chưa có đơn hàng đã giao." }, { status: 400 });
  }

  if (snapshot.status !== "active" || snapshot.startedAt) {
    return NextResponse.json({ error: "Subscription chưa sẵn sàng để bắt đầu." }, { status: 400 });
  }

  try {
    const sub = await startJourney(session.id, deliveredOrder.id);
    return NextResponse.json({
      ok: true,
      startedAt: sub.started_at,
      expiresAt: sub.expires_at,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 400 });
  }
}
