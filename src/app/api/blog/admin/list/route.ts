import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/blog/admin/list — all posts (draft + published), admin only
export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Role + data via service role: the RLS-scoped read returns empty under the
  // current ES256 JWT setup, which was 403'ing real admins.
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data, error } = await admin
    .from("blog_posts")
    .select("id,slug,title,excerpt,category,emoji,cover_color,read_time,published,published_at,created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data ?? [] });
}
