import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Hệ thống chưa sẵn sàng." }, { status: 503 });
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: "Hệ thống chưa sẵn sàng." }, { status: 503 });

    const { data: profile } = await admin
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
    }

    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: "Không đọc được file. Vui lòng thử lại." }, { status: 400 });
    }

    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Không có file." }, { status: 400 });

    const isVideo = file.type.startsWith("video/") || file.type.startsWith("audio/");
    const bucket = isVideo ? "meditation-videos" : "blog-images";
    const ext = file.name.split(".").pop()?.toLowerCase() ?? (isVideo ? "mp4" : "jpg");
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await admin.storage.from(bucket).upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      if (error.message?.includes("not found") || error.message?.includes("does not exist")) {
        await admin.storage.createBucket(bucket, {
          public: true,
          allowedMimeTypes: isVideo ? ["video/*", "audio/*"] : ["image/*"],
        });
        const { error: e2 } = await admin.storage.from(bucket).upload(filename, buffer, { contentType: file.type });
        if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
      } else {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const { data: urlData } = admin.storage.from(bucket).getPublicUrl(filename);
    return NextResponse.json({ url: urlData.publicUrl, type: isVideo ? "video" : "image" });

  } catch (err) {
    console.error("[upload-media] unhandled error:", err);
    return NextResponse.json({ error: "Lỗi server. Vui lòng thử lại." }, { status: 500 });
  }
}
