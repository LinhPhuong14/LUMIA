import { NextResponse } from "next/server";
import { describeSchemaError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

const MIGRATION = "012_notifications.sql";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, action_url, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    // Danh sách rỗng lặng lẽ đọc thành "không có thông báo nào" — đúng cả khi
    // bảng không tồn tại, nên hỏng kiểu này không bao giờ lộ ra.
    console.error("[notifications] list failed:", error.code, error.message);
    return NextResponse.json(
      { notifications: [], error: describeSchemaError(error, MIGRATION) },
      { status: 500 },
    );
  }

  return NextResponse.json({ notifications: data ?? [] });
}

export async function POST(req: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as { ids?: string[] };

  const query = supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
  const { error } = body.ids?.length
    ? await query.in("id", body.ids)
    : await query.eq("is_read", false);

  if (error) {
    // Trước đây kết quả UPDATE bị bỏ qua hoàn toàn và route luôn trả ok:true —
    // đánh dấu đã đọc không ăn, huy hiệu không bao giờ tắt, và không ai biết.
    console.error("[notifications] mark read failed:", error.code, error.message);
    return NextResponse.json(
      { error: "Không cập nhật được thông báo.", detail: describeSchemaError(error, MIGRATION) },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
