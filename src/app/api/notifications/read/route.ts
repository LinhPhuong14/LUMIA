import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: fetch unread + recent notifications
export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ notifications: [] });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ notifications: [] });

  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, body, action_url, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return NextResponse.json({ notifications: data ?? [] });
}

// POST: mark notifications as read
export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Unavailable" }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let ids: string[] = [];
  try {
    const body = (await request.json()) as { ids?: string[] };
    ids = body.ids ?? [];
  } catch { /* mark all */ }

  if (ids.length > 0) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .in("id", ids);
  } else {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
  }

  return NextResponse.json({ ok: true });
}
