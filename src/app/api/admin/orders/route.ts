import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function GET() {
  // Role gating is enforced by src/proxy.ts (service-role check on /api/admin/*).
  // Don't re-check session.role here: getSession() reads role via the RLS-scoped
  // client which returns empty under the current ES256 JWT setup, so a real
  // admin would be wrongly 403'd. Identity-only check is enough.
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
  }

  const { data, error } = await admin
    .from("orders")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Không thể tải danh sách đơn hàng." }, { status: 500 });
  }

  return NextResponse.json(data);
}
