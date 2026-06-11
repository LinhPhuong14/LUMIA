import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") ?? "21");

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json([]);
  }

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await admin
    .from("activity_logs")
    .select("*")
    .eq("user_id", session.id)
    .gte("date", since.toISOString().slice(0, 10))
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
