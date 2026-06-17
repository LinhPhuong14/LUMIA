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
  if (!admin) {
    return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Yêu cầu phải là multipart/form-data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Không tìm thấy file." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await admin.storage
    .from("blog-images")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: publicUrlData } = admin.storage
    .from("blog-images")
    .getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrlData.publicUrl });
}
