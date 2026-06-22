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
  const body = await req.json() as { tier: string; duration_months: number; has_physical_box: boolean };
  const now = new Date();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + body.duration_months);
  const { error } = await admin.from("subscriptions").upsert({
    user_id: id,
    status: "active",
    tier: body.tier,
    has_physical_box: body.has_physical_box,
    started_at: now.toISOString(),
    expires_at: expires.toISOString(),
  }, { onConflict: "user_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
