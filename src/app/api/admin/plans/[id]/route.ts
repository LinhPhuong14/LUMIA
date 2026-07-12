import { NextResponse } from "next/server";
import { requireSession } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Hệ thống chưa sẵn sàng." }, { status: 503 });

  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;
  delete body.id;
  body.updated_at = new Date().toISOString();

  const { data, error } = await admin
    .from("subscription_plans")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireSession();

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Hệ thống chưa sẵn sàng." }, { status: 503 });

  const { id } = await params;
  const { error } = await admin.from("subscription_plans").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
