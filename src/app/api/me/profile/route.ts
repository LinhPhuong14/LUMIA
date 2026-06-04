import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { env, hasMongoConfig } from "@/lib/env";
import { profileSchema } from "@/lib/validators/subscription";
import { UserModel } from "@/models";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Bạn cần đăng nhập." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Thông tin hồ sơ không hợp lệ." }, { status: 400 });
  }

  if (!hasMongoConfig()) {
    return NextResponse.json({ message: env.DEMO_MODE ? "Đã lưu tạm trong chế độ xem thử." : "Hệ thống dữ liệu chưa sẵn sàng." });
  }

  await connectToDatabase();
  await UserModel.updateOne(
    { _id: session.userId },
    {
      name: parsed.data.name,
      profile: {
        bio: parsed.data.bio,
        sleepGoal: parsed.data.sleepGoal,
        wakeGoal: parsed.data.wakeGoal,
      },
    },
  );

  return NextResponse.json({ message: "Đã cập nhật hồ sơ." });
}
