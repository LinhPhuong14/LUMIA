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
  const body = await req.json() as { tier: string; duration_months: number };
  const now = new Date();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + body.duration_months);

  const payload = {
    status: "active" as const,
    tier: body.tier,
    started_at: now.toISOString(),
    expires_at: expires.toISOString(),
  };

  // Check if a subscription row already exists for this user
  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", id)
    .maybeSingle();

  let error;
  if (existing?.id) {
    ({ error } = await admin.from("subscriptions").update(payload).eq("id", existing.id));
  } else {
    ({ error } = await admin.from("subscriptions").insert({ user_id: id, ...payload }));
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
