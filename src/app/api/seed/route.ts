import { NextResponse } from "next/server";

import { env, hasSupabaseServiceRole } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

const sampleAudioTracks = [
  { title: "Tiếng mưa nhẹ", category: "sleep_sound", duration_seconds: 600, is_free: true, sort_order: 1 },
  { title: "Gió trong rừng", category: "sleep_sound", duration_seconds: 720, is_free: true, sort_order: 2 },
  { title: "Chuyện kể buổi tối", category: "sleep_cast", duration_seconds: 900, is_free: false, sort_order: 3 },
  { title: "Thả lỏng cơ thể", category: "wind_down", duration_seconds: 480, is_free: false, sort_order: 4 },
  { title: "Nhạc ngủ dịu", category: "sleep_music", duration_seconds: 1200, is_free: false, sort_order: 5 },
  { title: "Thiền hướng dẫn 10 phút", category: "guided_meditation", duration_seconds: 600, is_free: false, sort_order: 6 },
  { title: "Thiền mini 5 phút", category: "mini_meditation", duration_seconds: 300, is_free: true, sort_order: 7 },
  { title: "Ambient timer", category: "timer_ambient", duration_seconds: 1800, is_free: false, sort_order: 8 },
] as const;

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (process.env.VERCEL_ENV === "production") {
    const secret = request.headers.get("x-seed-secret");
    if (!env.SEED_SECRET || secret !== env.SEED_SECRET) {
      return NextResponse.json({ error: "Seed disabled in production." }, { status: 403 });
    }
  }

  if (!hasSupabaseServiceRole()) {
    return NextResponse.json(
      { error: "SUPABASE_SECRET_KEY chua duoc cau hinh (Supabase Dashboard > API Keys > Secret key)." },
      { status: 503 },
    );
  }

  const admin = createAdminClient()!;

  const { count } = await admin.from("audio_tracks").select("id", { count: "exact", head: true });
  if (!count) {
    await admin.from("audio_tracks").insert([...sampleAudioTracks]);
  }

  const adminEmail = "admin@lumia.vn";
  const adminPassword = "Lum1aAdmin!";

  const { data: existingUsers } = await admin.auth.admin.listUsers();
  const existingAdmin = existingUsers.users.find((u) => u.email === adminEmail);

  if (!existingAdmin) {
    const { data: created, error } = await admin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: "LUMIA Admin" },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (created.user) {
      await admin.from("profiles").update({ role: "admin", full_name: "LUMIA Admin" }).eq("id", created.user.id);
    }
  } else {
    await admin.from("profiles").update({ role: "admin" }).eq("id", existingAdmin.id);
  }

  return NextResponse.json({
    ok: true,
    adminEmail,
    adminPassword,
    audioTracks: sampleAudioTracks.length,
    note: "Doi mat khau admin ngoai moi truong local.",
  });
}
