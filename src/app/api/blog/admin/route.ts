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
    cover_image_url,
    read_time,
    published,
  } = body;

  if (!slug || !title || !excerpt) {
    return NextResponse.json({ error: "slug, title, excerpt required" }, { status: 400 });
  }

  const isPublished = published ?? false;

  // Ngày đăng chỉ được đặt MỘT LẦN, ở lần publish đầu tiên.
  //
  // Bản cũ gán `published_at: new Date()` ở mọi lần lưu, nên chỉ sửa một lỗi
  // chính tả là bài viết nhảy ngày đăng thành hôm nay. Google đọc `datePublished`
  // từ đúng trường này (qua JSON-LD) và tính "độ tươi" của nội dung theo nó —
  // một bài được sửa vặt vài lần sẽ liên tục tự nhận là bài mới, và khi Google
  // đối chiếu với bản đã crawl trước đó thì đây là tín hiệu ngày tháng không
  // đáng tin. Ngày sửa là việc của `updated_at`.
  let publishedAt: string | null = isPublished ? new Date().toISOString() : null;
  if (id) {
    const { data: existing } = await admin
      .from("blog_posts")
      .select("published_at")
      .eq("id", id)
      .maybeSingle();
    if (isPublished && existing?.published_at) {
      publishedAt = existing.published_at;
    }
  }

  const payload = {
    slug,
    title,
    excerpt,
    content: content ?? "",
    category: category ?? "Wellbeing",
    emoji: emoji ?? "📝",
    cover_color: cover_color ?? "linear-gradient(135deg,#e0f2e9,#b8dfc8)",
    cover_image_url: cover_image_url || null,
    read_time: read_time ?? 3,
    published: isPublished,
    published_at: publishedAt,
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
