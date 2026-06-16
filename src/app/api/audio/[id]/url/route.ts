import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Use admin client when available; fall back to session client (RLS allows select on audio_tracks)
  const admin = createAdminClient();
  const db = admin ?? await createClient();
  if (!db) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data: track } = await db.from("audio_tracks").select("*").eq("id", id).single();
  if (!track) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const snapshot = await getSubscriptionSnapshot(session.id);
  if (!track.is_free && !snapshot.isActive) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
  }

  if (!track.file_url) {
    return NextResponse.json({ url: null, title: track.title });
  }

  if (track.file_url.startsWith("http")) {
    return NextResponse.json({ url: track.file_url, title: track.title });
  }

  // Signed URLs require the admin (service role) client
  if (!admin) {
    return NextResponse.json({ error: "Storage signing unavailable - set SUPABASE_SECRET_KEY" }, { status: 503 });
  }

  const { data, error } = await admin.storage.from("audio").createSignedUrl(track.file_url, 3600);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl, title: track.title });
}
