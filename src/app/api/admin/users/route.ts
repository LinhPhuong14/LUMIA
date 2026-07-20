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

  // PostgREST caps a plain select at 1000 rows, so the table silently stopped
  // at the first 1000 accounts. Page through explicitly instead. Filtering the
  // side tables by an .in() list is not an option — thousands of UUIDs would
  // blow the URL length limit — so page through those in full too.
  const PAGE = 1000;
  async function fetchAll(table: string, orderBy: string, ascending: boolean) {
    const rows: Record<string, unknown>[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await admin!
        .from(table)
        .select("*")
        .order(orderBy, { ascending })
        .range(from, from + PAGE - 1);

      if (error) throw new Error(error.message);
      rows.push(...(data ?? []));
      if (!data || data.length < PAGE) return rows;
    }
  }

  let profiles: Record<string, unknown>[];
  let subs: Record<string, unknown>[];
  let streaks: Record<string, unknown>[];
  try {
    [profiles, subs, streaks] = await Promise.all([
      fetchAll("profiles", "created_at", false),
      // Two extra queries per profile meant ~5k round trips on a 2.5k-user
      // table; fetch both side tables once and join in memory.
      fetchAll("subscriptions", "created_at", false),
      fetchAll("streaks", "user_id", true),
    ]);
  } catch (err) {
    console.error("[api/admin/users] load failed", err);
    return NextResponse.json({ error: "Không thể tải danh sách người dùng." }, { status: 500 });
  }

  // Ordered newest-first above, so the first row seen per user is the current one.
  const subByUser = new Map<string, unknown>();
  (subs ?? []).forEach((s) => {
    const key = s.user_id as string;
    if (!subByUser.has(key)) subByUser.set(key, s);
  });
  const streakByUser = new Map<string, unknown>();
  (streaks ?? []).forEach((s) => streakByUser.set(s.user_id as string, s));

  const users = profiles.map((profile) => ({
    ...profile,
    subscription: subByUser.get(profile.id as string) ?? null,
    streak: streakByUser.get(profile.id as string) ?? null,
  }));

  return NextResponse.json(users);
}
