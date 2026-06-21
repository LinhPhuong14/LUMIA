"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronRight, Clock, Copy, ExternalLink, LoaderCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { BoxProduct } from "@/data/catalog";
import { formatCurrency } from "@/lib/utils";
import { validateName, validatePhone, validateRequired } from "@/lib/validators";

type ShippingForm = {
  name: string; phone: string; address: string; city: string; note: string;
};

function ShippingFieldError({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="mt-1 text-[12px] text-red-500">{msg}</p>;
}

type PaymentInfo = {
  checkoutUrl: string;
  orderCode: number;
  qrCode: string;
  accountNumber: string;
  accountName: string;
  bin: string;
  amount: number;
};

// VietQR image from napas — no library needed
function vietQRUrl(info: PaymentInfo) {
  return `https://img.vietqr.io/image/${info.bin}-${info.accountNumber}-compact2.png?amount=${info.amount}&addInfo=${encodeURIComponent("LUMIA " + info.orderCode)}&accountName=${encodeURIComponent(info.accountName)}`;
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).catch(() => null);
}

function PaymentScreen({
  info,
  productName,
  onClose,
  onSuccess,
}: {
  info: PaymentInfo;
  productName: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const [status, setStatus] = useState<"PENDING" | "PAID" | "EXPIRED" | "CANCELLED">("PENDING");
  const [tab, setTab] = useState<"qr" | "transfer">("qr");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      const res = await fetch(`/api/checkout/status?orderCode=${info.orderCode}`);
      const data = await res.json() as { status: string };
      if (data.status === "PAID") {
        setStatus("PAID");
        clearInterval(intervalRef.current!);
        setTimeout(onSuccess, 1500);
      } else if (data.status === "CANCELLED" || data.status === "EXPIRED") {
        setStatus(data.status as "EXPIRED" | "CANCELLED");
        clearInterval(intervalRef.current!);
      }
    }, 3000);
    return () => clearInterval(intervalRef.current!);
  }, [info.orderCode, onSuccess]);

  function handleCopy(text: string, key: string) {
    copyText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }

  if (status === "PAID") {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--green-wash)]">
          <CheckCircle2 className="h-10 w-10 text-[var(--green)]" />
        </div>
        <h3 className="font-serif text-2xl text-[var(--foreground)]">Thanh toán thành công!</h3>
        <p className="text-[14px] text-[var(--muted)]">Đơn hàng của bạn đã được xác nhận. Chuyển hướng…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Thanh toán</p>
          <h3 className="font-serif text-[18px] text-[var(--foreground)]">{productName}</h3>
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-1.5 hover:bg-[var(--surface-warm)]">
          <X className="h-4 w-4 text-[var(--muted)]" />
        </button>
      </div>

      {/* Amount */}
      <div className="flex items-center justify-between bg-[var(--green-wash)] px-5 py-3">
        <span className="text-[13px] font-medium text-[var(--green-deep)]">Số tiền thanh toán</span>
        <span className="text-[18px] font-bold text-[var(--green-deep)]">{formatCurrency(info.amount)}</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)]">
        {(["qr", "transfer"] as const).map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`flex-1 py-3 text-[13px] font-medium transition ${tab === t ? "border-b-2 border-[var(--green)] text-[var(--green-deep)]" : "text-[var(--muted)]"}`}>
            {t === "qr" ? "Quét mã QR" : "Chuyển khoản thủ công"}
          </button>
        ))}
      </div>

      {/* QR tab */}
      {tab === "qr" && (
        <div className="flex flex-col items-center gap-4 px-5 py-6">
          <div className="overflow-hidden rounded-[20px] border-4 border-[var(--border)] bg-white p-2 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={vietQRUrl(info)}
              alt="VietQR"
              className="h-52 w-52 object-contain"
            />
          </div>
          <p className="text-center text-[13px] leading-5 text-[var(--muted)]">
            Mở app ngân hàng → Quét mã → Xác nhận chuyển khoản
          </p>
          <div className="flex w-full items-center justify-center gap-1.5 rounded-[12px] bg-[var(--surface-warm)] px-4 py-2.5">
            <Clock className="h-3.5 w-3.5 text-[var(--muted)]" />
            <span className="text-[12px] text-[var(--muted)]">Đang chờ thanh toán…</span>
            <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[var(--green)]" />
          </div>
          <a href={info.checkoutUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[12px] text-[var(--muted)] underline-offset-2 hover:text-[var(--green-deep)] hover:underline">
            <ExternalLink className="h-3 w-3" />
            Mở trang PayOS (nếu ứng dụng không hỗ trợ)
          </a>
        </div>
      )}

      {/* Manual transfer tab */}
      {tab === "transfer" && (
        <div className="space-y-3 px-5 py-5">
          {[
            { label: "Ngân hàng", value: bankName(info.bin), key: "bank" },
            { label: "Số tài khoản", value: info.accountNumber, key: "acc" },
            { label: "Chủ tài khoản", value: info.accountName, key: "name" },
            { label: "Số tiền", value: formatCurrency(info.amount), key: "amt" },
            { label: "Nội dung CK", value: `LUMIA ${info.orderCode}`, key: "desc" },
          ].map(({ label, value, key }) => (
            <div key={key} className="flex items-center justify-between rounded-[14px] bg-[var(--surface-warm)] px-4 py-3">
              <div>
                <p className="text-[11px] text-[var(--muted)]">{label}</p>
                <p className="mt-0.5 font-semibold text-[var(--foreground)]">{value}</p>
              </div>
              <button type="button" onClick={() => handleCopy(value, key)}
                className="flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)]">
                {copied === key ? <CheckCircle2 className="h-3 w-3 text-[var(--green)]" /> : <Copy className="h-3 w-3" />}
                {copied === key ? "Đã sao chép" : "Sao chép"}
              </button>
            </div>
          ))}
          <div className="flex items-center justify-center gap-1.5 rounded-[12px] bg-amber-50 px-4 py-2.5">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-[12px] text-amber-700">Ghi đúng nội dung để tự động kích hoạt gói</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin text-[var(--green)]" />
            <span className="text-[12px] text-[var(--muted)]">Đang chờ xác nhận thanh toán…</span>
          </div>
        </div>
      )}

      {(status === "EXPIRED" || status === "CANCELLED") && (
        <div className="mx-5 mb-4 rounded-[12px] bg-red-50 px-4 py-3 text-center text-[13px] text-red-600">
          {status === "EXPIRED" ? "Phiên thanh toán đã hết hạn." : "Đơn hàng đã bị huỷ."} Vui lòng thử lại.
        </div>
      )}
    </div>
  );
}

// Simple BIN → bank name mapping for common VN banks
function bankName(bin: string): string {
  const map: Record<string, string> = {
    "970436": "Vietcombank", "970422": "MB Bank", "970415": "Vietinbank",
    "970418": "BIDV", "970432": "Vpbank", "970423": "Techcombank",
    "970405": "Agribank", "970452": "MB Bank", "970407": "Techcombank",
    "970441": "VIB", "970448": "OCB", "970412": "Pvcombank",
  };
  return map[bin] ?? bin;
}

export function CheckoutPanel({
  product,
  unavailable = false,
  unavailableReason,
}: {
  product: BoxProduct;
  unavailable?: boolean;
  unavailableReason?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "confirm" | "pay">("form");
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const needsShipping = product.physicalItems.length > 0;
  const [shipping, setShipping] = useState<ShippingForm>({
    name: "", phone: "", address: "", city: "", note: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  function touchField(f: string) { setTouched(t => ({ ...t, [f]: true })); }

  // Per-field errors (shown after blur)
  const shippingErrors = {
    name: touched.name ? validateName(shipping.name) : null,
    phone: touched.phone ? validatePhone(shipping.phone) : null,
    address: touched.address ? validateRequired(shipping.address, "địa chỉ") : null,
    city: touched.city ? validateRequired(shipping.city, "thành phố / tỉnh") : null,
  };

  function updateShipping(field: keyof ShippingForm, value: string) {
    setShipping(prev => ({ ...prev, [field]: value }));
  }

  function hasShippingErrors(): boolean {
    return !!(validateName(shipping.name) || validatePhone(shipping.phone) ||
      validateRequired(shipping.address, "địa chỉ") || validateRequired(shipping.city, "thành phố / tỉnh"));
  }

  function handleReview() {
    if (needsShipping) {
      setTouched({ name: true, phone: true, address: true, city: true });
      if (hasShippingErrors()) return;
    }
    setError(null);
    setStep("confirm");
  }

  async function handlePay() {
    setStep("form");
    setLoading(true);
    setError(null);

    const response = await fetch("/api/checkout/create-payment-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier: product.tier, slug: product.slug, shipping: needsShipping ? shipping : undefined }),
    });

    const result = await response.json() as PaymentInfo & { error?: string };

    if (!response.ok || !result.checkoutUrl) {
      setError(result.error ?? "Không thể khởi tạo bước thanh toán lúc này.");
      setLoading(false);
      return;
    }

    setPaymentInfo(result);
    setLoading(false);
    setStep("pay");
  }

  if (step === "pay" && paymentInfo) {
    return (
      <div className="product-card product-card-default w-full max-w-md overflow-hidden p-0">
        <PaymentScreen
          info={paymentInfo}
          productName={product.name}
          onClose={() => { setPaymentInfo(null); setStep("form"); }}
          onSuccess={() => router.push("/checkout/success")}
        />
      </div>
    );
  }

  return (
    <>
      {/* Confirm bottom sheet */}
      {step === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setStep("form")} />
          <div className="relative z-10 w-full max-w-sm rounded-t-[28px] bg-[var(--surface-card)] p-6 shadow-2xl sm:rounded-[28px]">
            <button type="button" onClick={() => setStep("form")}
              className="absolute right-4 top-4 rounded-full p-1.5 text-[var(--muted)] hover:bg-[var(--surface)]">
              <X className="h-4 w-4" />
            </button>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Xác nhận đơn hàng</p>
            <h3 className="mt-2 font-serif text-xl text-[var(--foreground)]">{product.name}</h3>

            <div className="mt-4 space-y-2 rounded-[18px] bg-[var(--surface)] p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Gói</span>
                <span className="font-semibold">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Thời hạn</span>
                <span>{product.duration}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-2">
                <span className="font-semibold">Tổng cộng</span>
                <span className="font-bold text-[var(--green-deep)]">{formatCurrency(product.price)}</span>
              </div>
            </div>

            {needsShipping && shipping.name && (
              <div className="mt-3 rounded-[18px] bg-[var(--surface)] p-4 text-sm">
                <p className="mb-1 text-[var(--muted)]">Giao tới</p>
                <p className="font-semibold">{shipping.name} · {shipping.phone}</p>
                <p className="text-[var(--muted)]">{shipping.address}, {shipping.city}</p>
                {shipping.note && <p className="text-[var(--muted)]">Ghi chú: {shipping.note}</p>}
              </div>
            )}

            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setStep("form")} className="button-secondary flex-1">
                Chỉnh sửa
              </button>
              <Button type="button" onClick={handlePay} className="flex-1 justify-center gap-1.5">
                Đến thanh toán <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="product-card product-card-default w-full max-w-md p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--lumia-text-soft)]">Hoàn tất lựa chọn của bạn</div>
        <h3 className="mt-4 font-serif text-xl font-bold text-[var(--title-primary)]">{product.name}</h3>
        <p className="mt-2 text-sm text-[var(--lumia-text-soft)]">{product.duration}</p>

        <div className="mt-5 rounded-[28px] bg-[var(--lumia-green-bg)] p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--lumia-text-soft)]">Tổng thanh toán</div>
          <div className="price-amount mt-2">{formatCurrency(product.price)}</div>
          {product.priceNote && <p className="price-per-month mt-1">({product.priceNote})</p>}
          {product.savingsNote && <p className="mt-1 text-sm font-semibold text-[var(--lumia-green)]">{product.savingsNote}</p>}
        </div>

        {needsShipping && (
          <div className="mt-6 space-y-2">
            <p className="text-sm font-semibold text-[var(--title-primary)]">Thông tin nhận hàng vật lý</p>
            {(["name", "phone", "address", "city", "note"] as const).map(field => {
              const err = field !== "note" ? shippingErrors[field as keyof typeof shippingErrors] : null;
              return (
                <div key={field}>
                  <input
                    value={shipping[field]}
                    onChange={e => updateShipping(field, e.target.value)}
                    onBlur={() => touchField(field)}
                    type={field === "phone" ? "tel" : "text"}
                    required={field !== "note"}
                    placeholder={{
                      name: "Họ tên người nhận *", phone: "Số điện thoại * (0912...)",
                      address: "Địa chỉ chi tiết *", city: "Thành phố / Tỉnh *",
                      note: "Ghi chú giao hàng (tuỳ chọn)",
                    }[field]}
                    className={`w-full rounded-[18px] border px-4 py-3 text-sm outline-none transition focus:border-[var(--lumia-green)] ${err ? "border-red-400" : "border-[var(--lumia-green-soft)]"}`}
                  />
                  <ShippingFieldError msg={err} />
                </div>
              );
            })}
          </div>
        )}

        {unavailable ? (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-[var(--lumia-text-mid)]">{unavailableReason ?? "Bạn đã sử dụng ưu đãi này rồi."}</p>
            <Link href="/boxes/standard" className="button-primary inline-flex w-full justify-center">Xem gói STANDARD</Link>
          </div>
        ) : (
          <Button type="button" onClick={handleReview} disabled={loading} className="mt-6 w-full justify-center">
            {loading
              ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Đang tạo đơn hàng…</>
              : "Xem lại & Thanh toán"}
          </Button>
        )}

        {error && <p className="mt-3 text-sm text-error">{error}</p>}
      </div>
    </>
  );
}
