import { NextResponse } from "next/server";

import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSession();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  let query = supabase.from("audio_tracks").select("*").order("sort_order", { ascending: true });
  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const snapshot = session ? await getSubscriptionSnapshot(session.id) : { isActive: false };
  const tracks = (data ?? []).filter((track) => snapshot.isActive || track.is_free);

  return NextResponse.json(tracks);
}
