import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

/**
 * Deleting thousands of users in one request would blow the serverless time
 * limit, so the client chunks the selection and calls this repeatedly. Keep the
 * cap low enough that a chunk always finishes well inside the budget.
 */
const MAX_BATCH = 50;

type BulkDeleteBody = { ids?: unknown };

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Hệ thống dữ liệu chưa sẵn sàng." }, { status: 503 });
  }

  let body: BulkDeleteBody;
  try {
    body = (await req.json()) as BulkDeleteBody;
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is string => typeof id === "string") : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: "Chưa chọn user nào." }, { status: 400 });
  }
  if (ids.length > MAX_BATCH) {
    return NextResponse.json(
      { error: `Tối đa ${MAX_BATCH} user mỗi lần. Client cần chia nhỏ danh sách.` },
      { status: 400 },
    );
  }

  // Never let a bulk action take out the operator's own account or a fellow
  // admin — a mis-click on "chọn tất cả" would otherwise lock everyone out.
  const { data: protectedRows, error: lookupError } = await admin
    .from("profiles")
    .select("id")
    .in("id", ids)
    .eq("role", "admin");

  if (lookupError) {
    return NextResponse.json({ error: lookupError.message }, { status: 500 });
  }

  const blocked = new Set<string>([session.id, ...(protectedRows ?? []).map((row) => row.id as string)]);
  const targets = ids.filter((id) => !blocked.has(id));

  const deleted: string[] = [];
  const failed: { id: string; error: string }[] = [];

  // Sequential on purpose: the auth admin API rate-limits, and a partial result
  // the caller can trust beats a faster one that half-succeeded silently.
  for (const id of targets) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) {
      failed.push({ id, error: error.message });
    } else {
      deleted.push(id);
    }
  }

  return NextResponse.json({
    ok: true,
    deleted,
    failed,
    skipped: ids.filter((id) => blocked.has(id)),
  });
}
