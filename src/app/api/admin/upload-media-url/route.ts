import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: "Hệ thống chưa sẵn sàng." }, { status: 503 });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: "Hệ thống chưa sẵn sàng." }, { status: 503 });

    const { data: profile } = await admin.from("profiles").select("role").eq("id", session.user.id).maybeSingle();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });

    const { filename, contentType } = await req.json() as { filename: string; contentType: string };
    if (!filename || !contentType) return NextResponse.json({ error: "Thiếu thông tin file." }, { status: 400 });

    const isVideo = contentType.startsWith("video/") || contentType.startsWith("audio/");
    const bucket = isVideo ? "meditation-videos" : "blog-images";
    const ext = filename.split(".").pop()?.toLowerCase() ?? (isVideo ? "mp4" : "jpg");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
    if (error) {
      if (error.message?.includes("not found") || error.message?.includes("does not exist")) {
        await admin.storage.createBucket(bucket, {
          public: true,
          allowedMimeTypes: isVideo ? ["video/*", "audio/*"] : ["image/*"],
        });
        const { data: d2, error: e2 } = await admin.storage.from(bucket).createSignedUploadUrl(path);
        if (e2 || !d2) return NextResponse.json({ error: e2?.message ?? "Lỗi tạo URL." }, { status: 500 });
        const { data: urlData } = admin.storage.from(bucket).getPublicUrl(d2.path);
        return NextResponse.json({ signedUrl: d2.signedUrl, path: d2.path, publicUrl: urlData.publicUrl, type: isVideo ? "video" : "image" });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = admin.storage.from(bucket).getPublicUrl(data.path);
    return NextResponse.json({ signedUrl: data.signedUrl, path: data.path, publicUrl: urlData.publicUrl, type: isVideo ? "video" : "image" });
  } catch (err) {
    console.error("[upload-media-url] error:", err);
    return NextResponse.json({ error: "Lỗi server." }, { status: 500 });
  }
}
