import { NextResponse } from "next/server";

import { getPayOSClient } from "@/lib/payos";
import { env, hasPayOSConfig } from "@/lib/env";
import { getSession } from "@/lib/supabase/auth";
import { buildAbsoluteUrl } from "@/lib/utils";

// POST /api/admin/payos-webhook
// Registers / re-registers the webhook URL with PayOS.
// Only callable by admins. Run once after deploying to production.
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!hasPayOSConfig()) {
    return NextResponse.json({ error: "PayOS chưa được cấu hình (thiếu env vars)." }, { status: 503 });
  }

  const webhookUrl = env.PAYOS_WEBHOOK_URL ?? buildAbsoluteUrl("/api/payos/webhook");

  const payos = getPayOSClient();
  if (!payos) {
    return NextResponse.json({ error: "Không thể khởi tạo PayOS client." }, { status: 500 });
  }

  try {
    const result = await payos.webhooks.confirm(webhookUrl);
    return NextResponse.json({ ok: true, webhookUrl, result });
  } catch (error) {
    return NextResponse.json({ error: String(error), webhookUrl }, { status: 500 });
  }
}

// GET — trả về trạng thái hiện tại
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const webhookUrl = env.PAYOS_WEBHOOK_URL ?? buildAbsoluteUrl("/api/payos/webhook");

  return NextResponse.json({
    configured: hasPayOSConfig(),
    webhookUrl,
    clientId: env.PAYOS_CLIENT_ID ? `${env.PAYOS_CLIENT_ID.slice(0, 6)}...` : null,
  });
}
