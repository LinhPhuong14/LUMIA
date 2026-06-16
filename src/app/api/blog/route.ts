import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ posts: [] });

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,slug,title,excerpt,category,emoji,cover_color,read_time,published_at")
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (error) return NextResponse.json({ posts: [] });
  return NextResponse.json({ posts: data ?? [] });
}
