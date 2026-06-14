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
  { title: "Timer - Mưa", category: "timer_ambient", description: "slug:rain", duration_seconds: null, is_free: false, sort_order: 20 },
  { title: "Timer - Sóng biển", category: "timer_ambient", description: "slug:ocean", duration_seconds: null, is_free: false, sort_order: 21 },
  { title: "Timer - Rừng", category: "timer_ambient", description: "slug:forest", duration_seconds: null, is_free: false, sort_order: 22 },
  { title: "Timer - White noise", category: "timer_ambient", description: "slug:white-noise", duration_seconds: null, is_free: false, sort_order: 23 },
  { title: "Timer bell - bắt đầu", category: "timer_ambient", description: "tag:bell-start", duration_seconds: 3, is_free: false, sort_order: 24 },
  { title: "Timer bell - kết thúc", category: "timer_ambient", description: "tag:bell-end", duration_seconds: 3, is_free: false, sort_order: 25 },
] ;

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
      {
        error:
          "Seed can admin key. Chay SQL trong Supabase SQL Editor (migrations/003) hoac dat SUPABASE_SECRET_KEY legacy neu project con co.",
      },
      { status: 503 },
    );
  }

  const admin = createAdminClient()!;

  const { count } = await admin.from("audio_tracks").select("id", { count: "exact", head: true });
  if (!count) {
    await admin.from("audio_tracks").insert([...sampleAudioTracks]);
  } else {
    for (const track of sampleAudioTracks) {
      if (!("description" in track) || !track.description) continue;
      const { count: exists } = await admin
        .from("audio_tracks")
        .select("id", { count: "exact", head: true })
        .eq("description", track.description);
      if (!exists) {
        await admin.from("audio_tracks").insert(track as Record<string, unknown>);
      }
    }
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
