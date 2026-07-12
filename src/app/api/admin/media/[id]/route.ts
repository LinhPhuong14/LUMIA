import { NextResponse } from "next/server";
import { getSession } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const { id } = await params;
  const body = await req.json() as {
    title?: string; description?: string; category?: string;
    duration_seconds?: number; file_url?: string; thumbnail_url?: string;
    is_free?: boolean; sort_order?: number;
  };

  const update: Record<string, unknown> = {};
  if (body.title !== undefined) update.title = body.title;
  if (body.description !== undefined) update.description = body.description;
  if (body.category !== undefined) update.category = body.category;
  if (body.duration_seconds !== undefined) update.duration_seconds = body.duration_seconds;
  if (body.file_url !== undefined) update.file_url = body.file_url;
  if (body.thumbnail_url !== undefined) update.thumbnail_url = body.thumbnail_url;
  if (body.is_free !== undefined) update.is_free = body.is_free;
  if (body.sort_order !== undefined) update.sort_order = body.sort_order;

  const { error } = await admin.from("audio_tracks").update(update).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const { id } = await params;
  const { error } = await admin.from("audio_tracks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
