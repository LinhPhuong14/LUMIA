import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { env, hasMongoConfig } from "@/lib/env";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }

  if (!hasMongoConfig()) {
    return NextResponse.json({
      tier: "free",
      status: env.DEMO_MODE ? "demo" : "inactive",
      endsAt: null,
      features: ["Kết nối dữ liệu thật để xem đầy đủ quyền truy cập của bạn."],
    });
  }

  await connectToDatabase();
  return NextResponse.json(await getSubscriptionSnapshot(session.userId));
}
