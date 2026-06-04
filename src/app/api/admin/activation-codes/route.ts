import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { hasMongoConfig } from "@/lib/env";
import { ActivationCodeModel } from "@/models";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session || !["admin", "superadmin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (!hasMongoConfig()) {
    return NextResponse.json([]);
  }

  await connectToDatabase();
  return NextResponse.json(await ActivationCodeModel.find().sort({ createdAt: -1 }).limit(50).lean());
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !["admin", "superadmin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (!hasMongoConfig()) {
    return NextResponse.json({ error: "MongoDB chua duoc cau hinh." }, { status: 503 });
  }

  const body = await request.json();
  await connectToDatabase();
  const activation = await ActivationCodeModel.create({
    code: String(body.code ?? "").toUpperCase(),
    tier: body.tier,
    durationMonths: body.durationMonths,
  });
  return NextResponse.json(activation, { status: 201 });
}
