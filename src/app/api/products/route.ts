import { NextResponse } from "next/server";

import { lumiaBoxes } from "@/data/catalog";
import { hasUserBoughtFirstTime } from "@/lib/subscriptions";
import { getSession } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userIdParam = searchParams.get("userId");

  let firstTimeUnavailable = false;
  if (userIdParam) {
    firstTimeUnavailable = await hasUserBoughtFirstTime(userIdParam);
  } else {
    const session = await getSession();
    if (session) {
      firstTimeUnavailable = await hasUserBoughtFirstTime(session.id);
    }
  }

  const products = lumiaBoxes.map((product) => ({
    ...product,
    unavailable: product.tier === "first_time" && firstTimeUnavailable,
    unavailableReason:
      product.tier === "first_time" && firstTimeUnavailable
        ? "Bạn đã sử dụng ưu đãi người dùng mới."
        : null,
  }));

  return NextResponse.json(products);
}
