import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/** Nguồn của một ngày trong lịch sử: số đo được, hay số dựng lại. */
export type SnapshotSource = "demo" | "ga4";

export type SnapshotRow = {
  date: string;
  source: SnapshotSource;
  users: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  engagementRate: number;
  avgSessionSeconds: number;
  clicks: number;
  impressions: number;
};

type DbRow = {
  date: string;
  source: SnapshotSource;
  users: number;
  new_users: number;
  sessions: number;
  page_views: number;
  engagement_rate: number | string;
  avg_session_seconds: number | string;
  clicks: number;
  impressions: number;
};

function toDomain(row: DbRow): SnapshotRow {
  return {
    date: row.date,
    source: row.source,
    users: row.users,
    newUsers: row.new_users,
    sessions: row.sessions,
    pageViews: row.page_views,
    // NUMERIC về từ postgres-js dưới dạng string, Number() lại cho chắc.
    engagementRate: Number(row.engagement_rate),
    avgSessionSeconds: Number(row.avg_session_seconds),
    clicks: row.clicks,
    impressions: row.impressions,
  };
}

/** Đọc lịch sử đã đóng băng trong một khoảng ngày. */
export async function readSnapshot(startDate: string, endDate: string): Promise<SnapshotRow[]> {
  const admin = createAdminClient();
  if (!admin) {
    return [];
  }

  const { data, error } = await admin
    .from("analytics_daily_snapshot")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error || !data) {
    return [];
  }
  return (data as DbRow[]).map(toDomain);
}

/** Số ngày đã đóng băng theo từng nguồn — dùng cho màn hình trạng thái. */
export type SnapshotStats = {
  demoDays: number;
  firstDate: string | null;
  lastDate: string | null;
  /**
   * Lý do không đọc được bảng. Tách khỏi "bảng rỗng": chưa chạy migration và đã
   * chạy nhưng chưa có gì cho ra cùng một con số 0, mà cách xử lý thì khác hẳn.
   */
  error: string | null;
};

export async function getSnapshotStats(): Promise<SnapshotStats> {
  const admin = createAdminClient();
  if (!admin) {
    return {
      demoDays: 0,
      firstDate: null,
      lastDate: null,
      error: "Thiếu SUPABASE_SECRET_KEY nên không đọc/ghi được bảng lịch sử.",
    };
  }

  const { data, error } = await admin
    .from("analytics_daily_snapshot")
    .select("date")
    .eq("source", "demo")
    .order("date", { ascending: true });

  if (error) {
    return { demoDays: 0, firstDate: null, lastDate: null, error: describeTableError(error) };
  }

  const dates = ((data ?? []) as { date: string }[]).map((row) => row.date);
  return {
    demoDays: dates.length,
    firstDate: dates[0] ?? null,
    lastDate: dates[dates.length - 1] ?? null,
    error: null,
  };
}

/** Bảng chưa tồn tại là lỗi hay gặp nhất, và cách sửa rất cụ thể. */
function describeTableError(error: { message: string; code?: string }): string {
  const missingTable =
    error.code === "42P01" ||
    /does not exist|schema cache|could not find the table/i.test(error.message);

  return missingTable
    ? "Chưa chạy migration 026_analytics_daily_snapshot.sql trong Supabase SQL Editor."
    : error.message;
}

/**
 * Ghi đè toàn bộ đoạn `demo` bằng bộ mới.
 *
 * Xoá trước rồi chèn lại thay vì upsert từng dòng: neo lại với hệ số khác thì
 * biên của đoạn lịch sử cũng đổi, còn sót dòng cũ ngoài biên sẽ tạo ra một mẩu
 * lịch sử mồ côi tính theo hệ số cũ.
 *
 * Không đụng tới dòng `source = 'ga4'` — số đo được thì không ghi đè.
 */
export async function replaceDemoSnapshot(
  rows: SnapshotRow[],
  scaleFactor: number,
): Promise<{ written: number; error: string | null }> {
  const admin = createAdminClient();
  if (!admin) {
    return { written: 0, error: "Cần SUPABASE_SECRET_KEY để ghi lịch sử." };
  }

  const { error: deleteError } = await admin
    .from("analytics_daily_snapshot")
    .delete()
    .eq("source", "demo");

  if (deleteError) {
    return { written: 0, error: deleteError.message };
  }

  if (rows.length === 0) {
    return { written: 0, error: null };
  }

  const { error: insertError } = await admin.from("analytics_daily_snapshot").insert(
    rows.map((row) => ({
      date: row.date,
      source: row.source,
      users: row.users,
      new_users: row.newUsers,
      sessions: row.sessions,
      page_views: row.pageViews,
      engagement_rate: row.engagementRate,
      avg_session_seconds: row.avgSessionSeconds,
      clicks: row.clicks,
      impressions: row.impressions,
      scale_factor: scaleFactor,
    })),
  );

  if (insertError) {
    return { written: 0, error: insertError.message };
  }
  return { written: rows.length, error: null };
}
