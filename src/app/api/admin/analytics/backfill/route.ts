import { NextResponse } from "next/server";

import {
  ANCHOR_MIN_REAL_DAYS,
  computeAnchorStatus,
  resolveCutoverDate,
  runBackfill,
} from "@/lib/analytics/auto-backfill";
import { getSnapshotStats } from "@/lib/analytics/snapshot";
import { getSession } from "@/lib/supabase/auth";

/**
 * Nối lịch sử giờ chạy tự động khi mở báo cáo (xem `ensureBackfilled`), nên
 * route này không còn là đường chính. Giữ lại làm công cụ vận hành:
 *
 * - `GET`  — xem mốc gắn đo, hệ số neo, đã đóng băng bao nhiêu ngày
 * - `POST` — ép neo lại theo dữ liệu mới hơn, ghi đè đoạn đã dựng
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const cutoverDate = await resolveCutoverDate();
  const { anchor, backfillEnd } = await computeAnchorStatus(cutoverDate);

  return NextResponse.json({
    cutoverDate,
    backfillEnd,
    minRealDays: ANCHOR_MIN_REAL_DAYS,
    anchor,
    snapshot: await getSnapshotStats(),
  });
}

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });
  }

  const cutoverDate = await resolveCutoverDate();

  try {
    const outcome = await runBackfill(cutoverDate);

    if (!outcome.ran) {
      const messages: Record<string, string> = {
        no_cutover: "Chưa đo được dữ liệu GA4 thật nào — chưa biết mốc gắn đo ở đâu.",
        not_ready: `Chưa đủ ${ANCHOR_MIN_REAL_DAYS} ngày dữ liệu thật để neo.`,
        nothing_to_fill: "Không có ngày nào trước mốc gắn đo để dựng lại.",
        already_done: "Lịch sử đã được dựng.",
      };
      return NextResponse.json(
        { error: messages[outcome.reason] ?? "Chưa neo được.", outcome },
        { status: 409 },
      );
    }

    return NextResponse.json({ ok: true, cutoverDate, ...outcome });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Không ghi được lịch sử." },
      { status: 500 },
    );
  }
}
