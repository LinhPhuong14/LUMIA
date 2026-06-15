import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  const { id } = await params;
  const body = await req.json() as { stock_quantity?: number; in_stock?: boolean };
  const update: Record<string, unknown> = {};
  if (body.stock_quantity !== undefined) update.stock_quantity = body.stock_quantity;
  if (body.in_stock !== undefined) update.in_stock = body.in_stock;
  const { error } = await admin.from("store_products").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
