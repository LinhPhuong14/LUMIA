import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/blog/admin — create or update a post (admin only)
export async function POST(req: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Role + writes via service role (RLS-scoped reads return empty under ES256 JWT).
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json();
  const {
    id,
    slug,
    title,
    excerpt,
    content,
    category,
    emoji,
    cover_color,
    read_time,
    published,
  } = body;

  if (!slug || !title || !excerpt) {
    return NextResponse.json({ error: "slug, title, excerpt required" }, { status: 400 });
  }

  const payload = {
    slug,
    title,
    excerpt,
    content: content ?? "",
    category: category ?? "Wellbeing",
    emoji: emoji ?? "📝",
    cover_color: cover_color ?? "linear-gradient(135deg,#e0f2e9,#b8dfc8)",
    read_time: read_time ?? 3,
    published: published ?? false,
    published_at: published ? new Date().toISOString() : null,
    author_id: user.id,
    updated_at: new Date().toISOString(),
  };

  let result;
  if (id) {
    result = await admin
      .from("blog_posts")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
  } else {
    result = await admin
      .from("blog_posts")
      .insert(payload)
      .select()
      .single();
  }

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  return NextResponse.json({ post: result.data });
}

// DELETE /api/blog/admin?id=...
export async function DELETE(req: Request) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const { error } = await admin.from("blog_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
