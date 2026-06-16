import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/blog/admin/list — all posts (draft + published), admin only
export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,slug,title,excerpt,category,emoji,cover_color,read_time,published,published_at,created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data ?? [] });
}
