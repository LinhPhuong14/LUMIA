import { NextResponse } from "next/server";

import { env, hasSupabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validators/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    if (!env.DEMO_MODE) {
      return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
    }
    return NextResponse.json({ ok: true, mode: "demo", redirect: "/onboarding" });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Không thể kết nối Supabase." }, { status: 503 });
  }

  const email = parsed.data.email.toLowerCase();

  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ error: "Không thể tạo tài khoản." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.user.id, redirect: "/onboarding" }, { status: 201 });
}
