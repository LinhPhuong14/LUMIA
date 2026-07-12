import { NextResponse } from "next/server";

import { getProductBySlug } from "@/data/catalog";
import { env, hasPayOSConfig, hasSupabaseConfig, hasSupabaseServiceRole } from "@/lib/env";
import { createOrder } from "@/lib/orders";
import { isValidTierCode } from "@/lib/product-tiers";
import { getPayOSClient } from "@/lib/payos";
import { hasUserBoughtFirstTime } from "@/lib/subscriptions";
import { getSession } from "@/lib/supabase/auth";
import { buildAbsoluteUrl } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Bạn cần đăng nhập trước khi tiếp tục." }, { status: 401 });
  }

  let slug = "first-time-user";
  let tier: string | undefined;
  let shipping: {
    name: string;
    phone: string;
    address: string;
    city: string;
    note?: string;
  } | undefined;

  try {
    const body = (await request.json()) as {
      slug?: string;
      tier?: string;
      shipping?: {
        name: string;
        phone: string;
        address: string;
        city: string;
        note?: string;
      };
    };
    if (body.tier && isValidTierCode(body.tier)) {
      tier = body.tier;
    }
    if (body.slug) {
      slug = body.slug;
    }
    if (body.shipping) {
      shipping = body.shipping;
    }
  } catch {
    // default slug when body is empty
  }

  const product = tier
    ? (await import("@/data/catalog")).getAllPurchasableProducts().find((b) => b.tier === tier)
    : getProductBySlug(slug);

  if (!product) {
    return NextResponse.json({ error: "Gói sản phẩm không hợp lệ." }, { status: 400 });
  }

  if (product.tier === "first_time" && (await hasUserBoughtFirstTime(session.id))) {
    return NextResponse.json(
      { error: "Bạn đã sử dụng ưu đãi người dùng mới. Vui lòng chọn gói khác." },
      { status: 400 },
    );
  }

  if (product.physicalItems.length > 0) {
    if (
      !shipping?.name?.trim() ||
      !shipping?.phone?.trim() ||
      !shipping?.address?.trim() ||
      !shipping?.city?.trim()
    ) {
      return NextResponse.json(
        { error: "Gói này kèm sản phẩm vật lý - vui lòng điền đầy đủ thông tin giao hàng." },
        { status: 400 },
      );
    }
  }

  if (!hasSupabaseConfig() || !hasPayOSConfig()) {
    if (!env.DEMO_MODE) {
      const envCheck = {
        SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL),
        SUPABASE_ANON_KEY: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY),
        SUPABASE_SERVICE_ROLE: Boolean(process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY),
        PAYOS_CLIENT_ID: Boolean(process.env.PAYOS_CLIENT_ID),
        PAYOS_API_KEY: Boolean(process.env.PAYOS_API_KEY),
        PAYOS_CHECKSUM_KEY: Boolean(process.env.PAYOS_CHECKSUM_KEY),
        VERCEL_ENV: process.env.VERCEL_ENV,
        DEMO_MODE: env.DEMO_MODE,
      };
      console.error("[checkout] config missing:", JSON.stringify(envCheck));
      return NextResponse.json({ error: "Phiên thanh toán chưa sẵn sàng.", debug: envCheck }, { status: 503 });
    }
    return NextResponse.json({
      checkoutUrl: `${buildAbsoluteUrl("/checkout/success")}?demo=1`,
      mode: "demo",
    });
  }

  // Service role required to create orders — check explicitly so we get a clear 503
  if (!hasSupabaseServiceRole()) {
    console.error("[checkout] SUPABASE_SERVICE_ROLE_KEY / SUPABASE_SECRET_KEY not configured");
    return NextResponse.json({
      error: "Phiên thanh toán chưa sẵn sàng (cấu hình server).",
      debug: "missing_service_role",
    }, { status: 503 });
  }

  // (#002) Use timestamp-based unique order code to prevent collisions
  const orderCode = Date.now();
  const returnUrl = buildAbsoluteUrl("/checkout/success");
  const cancelUrl = buildAbsoluteUrl("/checkout/cancel");

  let payos;
  try {
    payos = getPayOSClient();
  } catch (e) {
    console.error("[checkout] PayOS client init threw:", e);
    return NextResponse.json({ error: "Không thể khởi tạo phiên thanh toán (init error).", detail: String(e) }, { status: 503 });
  }
  if (!payos) {
    console.error("[checkout] PayOS client unavailable — check PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY");
    return NextResponse.json({ error: "Không thể khởi tạo phiên thanh toán.", debug: "payos_null" }, { status: 503 });
  }

  const description = `${product.name} - ${product.duration}`;

  // (#002) Create DB order record FIRST so webhook can always find it
  let dbOrder: Awaited<ReturnType<typeof createOrder>>;
  try {
    dbOrder = await createOrder({
      userId: session.id,
      payosOrderId: String(orderCode),
      amount: product.price,
      tier: product.tier,
      shipping: product.physicalItems.length > 0 ? shipping : undefined,
    });
  } catch (error) {
    console.error("[checkout] createOrder failed:", error);
    return NextResponse.json({ error: "Không thể tạo đơn hàng. Vui lòng thử lại.", detail: String(error) }, { status: 500 });
  }

  try {
    const paymentLink = await payos.paymentRequests.create({
      orderCode,
      amount: product.price,
      description: description.slice(0, 25),
      returnUrl,
      cancelUrl,
      buyerEmail: session.email,
      buyerName: session.name,
      items: [{ name: product.name.slice(0, 25), quantity: 1, price: product.price }],
    });

    return NextResponse.json({
      checkoutUrl: paymentLink.checkoutUrl,
      orderCode: paymentLink.orderCode,
      qrCode: paymentLink.qrCode,
      accountNumber: paymentLink.accountNumber,
      accountName: paymentLink.accountName,
      bin: paymentLink.bin,
      amount: paymentLink.amount,
      // The EXACT transfer memo PayOS matches against. Must be shown to the
      // buyer verbatim (both QR and manual transfer) or PayOS never marks the
      // order paid — the cause of orders stuck in pending_payment.
      description: paymentLink.description,
    });
  } catch (error) {
    // DB order was created but PayOS failed - order stays as pending_payment
    // Admin can review and clean up orphan orders
    console.error("[checkout] PayOS createPaymentLink failed:", error);
    return NextResponse.json(
      { error: "Không thể tạo liên kết thanh toán.", detail: String(error), orderId: dbOrder.id },
      { status: 500 },
    );
  }
}
