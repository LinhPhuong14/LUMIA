import { NextResponse } from "next/server";

import { env, hasSupabaseConfig } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
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
    // (#009) Don't leak Supabase internal error messages to the client
    const isEmailTaken =
      error.message.toLowerCase().includes("already registered") ||
      error.message.toLowerCase().includes("already exists") ||
      error.message.toLowerCase().includes("duplicate");
    const message = isEmailTaken
      ? "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác."
      : "Không thể tạo tài khoản lúc này. Vui lòng thử lại.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ error: "Không thể tạo tài khoản." }, { status: 500 });
  }

  const admin = createAdminClient();
  if (admin) {
    await admin.from("profiles").upsert(
      { id: data.user.id, email, full_name: parsed.data.name, role: "user" },
      { onConflict: "id" },
    );
    const { data: sub } = await admin.from("subscriptions").select("id").eq("user_id", data.user.id).limit(1).maybeSingle();
    if (!sub) {
      await admin.from("subscriptions").insert({ user_id: data.user.id, status: "free" });
    }
    const { data: streak } = await admin.from("streaks").select("id").eq("user_id", data.user.id).maybeSingle();
    if (!streak) {
      await admin.from("streaks").insert({ user_id: data.user.id });
    }
  }

  return NextResponse.json({ ok: true, id: data.user.id, redirect: "/onboarding" }, { status: 201 });
}
