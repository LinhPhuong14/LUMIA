import { NextResponse } from "next/server";

import { comparePassword, setSessionCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { env, hasMongoConfig } from "@/lib/env";
import { loginSchema } from "@/lib/validators/auth";
import { UserModel } from "@/models";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const demoRole = email.includes("admin") || email.endsWith("@lumia.vn") ? "admin" : "user";

  if (!hasMongoConfig()) {
    if (!env.DEMO_MODE) {
      return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
    }

    await setSessionCookie({
      userId: `demo-${email}`,
      email,
      name: email.split("@")[0],
      role: demoRole,
    });

    return NextResponse.json({ ok: true, mode: "demo" });
  }

  await connectToDatabase();
  const user = await UserModel.findOne({ email });

  if (!user) {
    return NextResponse.json({ error: "Sai email hoặc mật khẩu." }, { status: 401 });
  }

  const validPassword = await comparePassword(parsed.data.password, user.passwordHash);
  if (!validPassword) {
    return NextResponse.json({ error: "Sai email hoặc mật khẩu." }, { status: 401 });
  }

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return NextResponse.json({ ok: true });
}
