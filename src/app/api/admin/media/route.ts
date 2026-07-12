import { NextResponse } from "next/server";
import { getSession } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ tracks: [] });

  const { data } = await admin
    .from("audio_tracks")
    .select("id,title,description,category,duration_seconds,file_url,thumbnail_url,is_free,sort_order,created_at")
    .order("sort_order", { ascending: true });

  return NextResponse.json({ tracks: data ?? [] });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const body = await req.json() as {
    title: string; description?: string; category: string;
    duration_seconds?: number; file_url?: string; thumbnail_url?: string;
    is_free: boolean; sort_order?: number;
  };

  const { data, error } = await admin
    .from("audio_tracks")
    .insert({
      title: body.title,
      description: body.description ?? null,
      category: body.category,
      duration_seconds: body.duration_seconds ?? null,
      file_url: body.file_url ?? null,
      thumbnail_url: body.thumbnail_url ?? null,
      is_free: body.is_free,
      sort_order: body.sort_order ?? 0,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
