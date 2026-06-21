import { NextResponse } from "next/server";
import { getSession } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Hệ thống chưa sẵn sàng." }, { status: 503 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Không có file." }, { status: 400 });

  const isVideo = file.type.startsWith("video/");
  const bucket = isVideo ? "meditation-videos" : "blog-images";
  const ext = file.name.split(".").pop() ?? (isVideo ? "mp4" : "jpg");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await admin.storage.from(bucket).upload(filename, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    // Bucket might not exist — try creating it
    if (error.message?.includes("not found") || error.message?.includes("does not exist")) {
      await admin.storage.createBucket(bucket, { public: true, allowedMimeTypes: isVideo ? ["video/*"] : ["image/*"] });
      const { error: e2 } = await admin.storage.from(bucket).upload(filename, buffer, { contentType: file.type });
      if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  const { data: urlData } = admin.storage.from(bucket).getPublicUrl(filename);
  return NextResponse.json({ url: urlData.publicUrl, type: isVideo ? "video" : "image" });
}
