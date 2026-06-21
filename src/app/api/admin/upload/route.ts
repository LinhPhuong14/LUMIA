import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Use local session (no network call to Supabase Auth) then verify role via admin client
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Hệ thống chưa sẵn sàng." }, { status: 503 });
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Hệ thống chưa sẵn sàng." }, { status: 503 });
    }

    // Check role via admin client (bypasses RLS, fast)
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

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Không tìm thấy file." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File quá lớn (tối đa 10MB)." }, { status: 413 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await admin.storage
      .from("blog-images")
      .upload(fileName, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      // Bucket might not exist yet — create it and retry once
      if (uploadError.message?.includes("not found") || uploadError.message?.includes("does not exist")) {
        await admin.storage.createBucket("blog-images", { public: true, allowedMimeTypes: ["image/*"] });
        const { error: e2 } = await admin.storage
          .from("blog-images")
          .upload(fileName, buffer, { contentType: file.type, upsert: false });
        if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
      } else {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }
    }

    const { data: publicUrlData } = admin.storage.from("blog-images").getPublicUrl(fileName);
    return NextResponse.json({ url: publicUrlData.publicUrl });

  } catch (err) {
    console.error("[upload] unhandled error:", err);
    return NextResponse.json({ error: "Lỗi server. Vui lòng thử lại." }, { status: 500 });
  }
}
