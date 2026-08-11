import { NextResponse } from "next/server";
import { describeSchemaError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

const MIGRATION = "012_notifications.sql";

// GET: fetch unread + recent notifications
export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ notifications: [] });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ notifications: [] });

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, action_url, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("[notifications/read] list failed:", error.code, error.message);
    return NextResponse.json(
      { notifications: [], error: describeSchemaError(error, MIGRATION) },
      { status: 500 },
    );
  }

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

  const query = supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
  const { error } = ids.length > 0
    ? await query.in("id", ids)
    : await query.eq("is_read", false);

  if (error) {
    // Kết quả UPDATE trước đây bị bỏ qua và route luôn trả ok:true.
    console.error("[notifications/read] mark read failed:", error.code, error.message);
    return NextResponse.json(
      { error: "Không cập nhật được thông báo.", detail: describeSchemaError(error, MIGRATION) },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
