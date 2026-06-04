import { NextResponse } from "next/server";

import { setSessionCookie, hashPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { env, hasMongoConfig } from "@/lib/env";
import { registerSchema } from "@/lib/validators/auth";
import { UserModel } from "@/models";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const role = email.includes("admin") || email.endsWith("@lumia.vn") ? "admin" : "user";

  if (!hasMongoConfig()) {
    if (!env.DEMO_MODE) {
      return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
    }

    await setSessionCookie({
      userId: `demo-${email}`,
      email,
      name: parsed.data.name,
      role,
    });

    return NextResponse.json({ ok: true, mode: "demo" });
  }

  await connectToDatabase();
  const existing = await UserModel.findOne({ email }).lean();

  if (existing) {
    return NextResponse.json({ error: "Email đã tồn tại." }, { status: 409 });
  }

  const user = await UserModel.create({
    email,
    name: parsed.data.name,
    passwordHash: await hashPassword(parsed.data.password),
    role,
  });

  await setSessionCookie({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return NextResponse.json({ ok: true, id: user.id }, { status: 201 });
}
