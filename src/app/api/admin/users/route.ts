import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongoose";
import { hasMongoConfig } from "@/lib/env";
import { UserModel } from "@/models";

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
  return NextResponse.json(await UserModel.find().select("email name role createdAt").sort({ createdAt: -1 }).limit(50).lean());
}
