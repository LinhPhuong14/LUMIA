import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

type CreateUserBody = {
  email: string;
  password: string;
  full_name: string;
  role: "user" | "admin";
};

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
  }

  const body = (await req.json()) as CreateUserBody;
  const { email, password, full_name, role } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email và mật khẩu là bắt buộc." }, { status: 400 });
  }

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Tạo tài khoản thất bại." }, { status: 500 });
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: authData.user.id,
    email,
    full_name,
    role: role ?? "user",
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
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
