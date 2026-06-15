import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
  }

  const { data: profiles, error } = await admin.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: "Không thể tải danh sách người dùng." }, { status: 500 });
  }

  const users = await Promise.all(
    (profiles ?? []).map(async (profile) => {
      const [{ data: sub }, { data: streak }] = await Promise.all([
        admin.from("subscriptions").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        admin.from("streaks").select("*").eq("user_id", profile.id).maybeSingle(),
      ]);
      return { ...profile, subscription: sub, streak };
    }),
  );

  return NextResponse.json(users);
}
