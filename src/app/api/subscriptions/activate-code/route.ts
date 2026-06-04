import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { env, hasMongoConfig } from "@/lib/env";
import { grantEntitlement } from "@/lib/subscriptions";
import { activationCodeSchema } from "@/lib/validators/subscription";
import { ActivationCodeModel } from "@/models";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = activationCodeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Mã kích hoạt không hợp lệ." }, { status: 400 });
  }

  if (!hasMongoConfig()) {
    if (!env.DEMO_MODE) {
      return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
    }

    return NextResponse.json({ message: `Đã kích hoạt thử mã ${parsed.data.code}.` });
  }

  await connectToDatabase();
  const activation = await ActivationCodeModel.findOne({ code: parsed.data.code.toUpperCase().trim() });

  if (!activation || activation.isRedeemed) {
    return NextResponse.json({ error: "Mã kích hoạt không hợp lệ hoặc đã được sử dụng." }, { status: 404 });
  }

  await grantEntitlement({
    userId: session.userId,
    tier: activation.tier,
    durationMonths: activation.durationMonths,
    source: "activation_code",
    activationCodeId: activation.id,
  });

  activation.isRedeemed = true;
  activation.redeemedByUserId = activation.redeemedByUserId ?? session.userId;
  activation.redeemedAt = new Date();
  await activation.save();

  return NextResponse.json({ message: "Kích hoạt thành công." });
}
