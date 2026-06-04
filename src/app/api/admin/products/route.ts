import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { lumiaProducts } from "@/data/catalog";
import { connectToDatabase } from "@/lib/db/mongoose";
import { hasMongoConfig } from "@/lib/env";
import { ProductModel } from "@/models";

export const runtime = "nodejs";

async function requireAdminApi() {
  const session = await getSession();
  if (!session || !["admin", "superadmin"].includes(session.role)) {
    return null;
  }
  return session;
}

export async function GET() {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (!hasMongoConfig()) {
    return NextResponse.json(lumiaProducts);
  }

  await connectToDatabase();
  return NextResponse.json(await ProductModel.find().sort({ createdAt: -1 }).lean());
}

export async function POST(request: Request) {
  const session = await requireAdminApi();
  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (!hasMongoConfig()) {
    return NextResponse.json({ error: "MongoDB chua duoc cau hinh." }, { status: 503 });
  }

  const body = await request.json();
  await connectToDatabase();
  const product = await ProductModel.create(body);
  return NextResponse.json(product, { status: 201 });
}
