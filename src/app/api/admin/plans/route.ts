import { NextResponse } from "next/server";
import { requireRole } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  await requireRole(["admin"]);

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Hệ thống chưa sẵn sàng." }, { status: 503 });

  const { data, error } = await admin
    .from("subscription_plans")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  await requireRole(["admin"]);

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Hệ thống chưa sẵn sàng." }, { status: 503 });

  const body = await req.json() as Record<string, unknown>;
  const { data, error } = await admin
    .from("subscription_plans")
    .insert(body)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
