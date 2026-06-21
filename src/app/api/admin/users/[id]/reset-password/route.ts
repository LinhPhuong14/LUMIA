import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Hệ thống chưa sẵn sàng." }, { status: 503 });
  }

  const { id } = await params;
  const body = (await req.json()) as { password?: string };
  const password = body.password?.trim();

  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Mật khẩu mới phải có ít nhất 8 ký tự." }, { status: 400 });
  }

  const { error } = await admin.auth.admin.updateUserById(id, { password });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
