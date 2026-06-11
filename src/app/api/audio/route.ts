import { NextResponse } from "next/server";

import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSession();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const isFree = searchParams.get("is_free");

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  let query = supabase.from("audio_tracks").select("*").order("sort_order", { ascending: true });
  if (category) {
    const categories = category.split(",").map((c) => c.trim()).filter(Boolean);
    if (categories.length === 1) {
      query = query.eq("category", categories[0]);
    } else if (categories.length > 1) {
      query = query.in("category", categories);
    }
  }
  if (isFree === "true") {
    query = query.eq("is_free", true);
  }
  if (tag) {
    query = query.ilike("description", `%tag:${tag}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const snapshot = session ? await getSubscriptionSnapshot(session.id) : { isActive: false };
  const tracks = (data ?? []).map((track) => ({
    ...track,
    locked: !snapshot.isActive && !track.is_free,
  }));

  return NextResponse.json(tracks);
}
