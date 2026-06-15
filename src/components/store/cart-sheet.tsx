"use client";

import { X, ShoppingCart, Plus, Minus, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

type CheckoutForm = { name: string; phone: string; address: string; email: string; note: string };

export function CartSheet({ onClose }: { onClose: () => void }) {
  const { items, removeItem, setQty, clear } = useCart();
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [form, setForm] = useState<CheckoutForm>({ name: "", phone: "", address: "", email: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((s, i) => s + i.price_vnd * i.qty, 0);
  const shipping = subtotal >= 300000 ? 0 : 30000;
  const total = subtotal + shipping;

  function field(key: keyof CheckoutForm) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  async function handleOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/store/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ product_id: i.id, slug: i.slug, name: i.name, price_vnd: i.price_vnd, qty: i.qty, variant: i.variant })),
        shipping_name: form.name,
        shipping_phone: form.phone,
        shipping_address: form.address,
        guest_email: form.email || undefined,
        note: form.note || undefined,
      }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const j = await res.json() as { error?: string };
      setError(j.error ?? "Có lỗi xảy ra, vui lòng thử lại.");
      return;
    }
    clear();
    setStep("success");
  }

  const inputCls = "w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-3 text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--green)] focus:outline-none";

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col bg-[var(--bg)] shadow-[-24px_0_60px_rgba(0,0,0,0.15)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
          <span className="font-serif text-xl text-[var(--foreground)]">
            {step === "cart" ? "Giỏ hàng" : step === "checkout" ? "Thông tin giao hàng" : "Đặt hàng thành công"}
          </span>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-[var(--muted)] hover:text-[var(--foreground)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart step */}
        {step === "cart" && (
          items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 text-[var(--muted)]">
              <ShoppingCart className="h-12 w-12 opacity-30" />
              <p className="text-[14px]">Giỏ hàng trống</p>
              <Link href="/store" onClick={onClose} className="mt-2 text-[13px] text-[var(--green)] underline-offset-2 hover:underline">
                Khám phá cửa hàng
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {items.map((item) => (
                  <div key={`${item.id}__${item.variant}`} className="flex gap-4 rounded-[16px] border border-[var(--border)] bg-[var(--surface-card)] p-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[12px] bg-[var(--green-wash)] text-2xl">
                      {item.image_url
                        ? <img src={item.image_url} alt={item.name} className="h-full w-full rounded-[12px] object-cover" />
                        : "🌿"}
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="text-[13px] font-semibold text-[var(--foreground)]">{item.name}</p>
                        {item.variant ? <p className="text-[11px] text-[var(--muted)]">{item.variant}</p> : null}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] px-2 py-1">
                          <button type="button" onClick={() => setQty(item.id, item.variant, item.qty - 1)} className="text-[var(--muted)]"><Minus className="h-3 w-3" /></button>
                          <span className="w-5 text-center text-[13px] font-semibold text-[var(--foreground)]">{item.qty}</span>
                          <button type="button" onClick={() => setQty(item.id, item.variant, item.qty + 1)} className="text-[var(--muted)]"><Plus className="h-3 w-3" /></button>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[13px] font-semibold text-[var(--green-deep)]">{formatVnd(item.price_vnd * item.qty)}</span>
                          <button type="button" onClick={() => removeItem(item.id, item.variant)} className="text-[var(--muted)] hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--border)] px-6 py-5 space-y-2">
                <div className="flex justify-between text-[13px] text-[var(--muted)]"><span>Tạm tính</span><span>{formatVnd(subtotal)}</span></div>
                <div className="flex justify-between text-[13px] text-[var(--muted)]">
                  <span>Phí ship</span>
                  <span>{shipping === 0 ? <span className="text-[var(--green)]">Miễn phí</span> : formatVnd(shipping)}</span>
                </div>
                {shipping > 0 && <p className="text-[11px] text-[var(--muted)]">Miễn phí ship cho đơn từ 300.000 ₫</p>}
                <div className="flex justify-between pt-2 font-semibold text-[var(--foreground)]">
                  <span>Tổng cộng</span><span className="text-[var(--green-deep)]">{formatVnd(total)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep("checkout")}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--green)] py-3.5 text-[14px] font-semibold text-white transition hover:opacity-90"
                >
                  Đặt hàng <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )
        )}

        {/* Checkout step */}
        {step === "checkout" && (
          <form onSubmit={handleOrder} className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex-1 px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--green)]">Họ tên *</label>
                  <input {...field("name")} required placeholder="Nguyễn Văn A" className={inputCls} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--green)]">Số điện thoại *</label>
                  <input {...field("phone")} required type="tel" className={inputCls} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--green)]">Địa chỉ *</label>
                <input {...field("address")} required placeholder="Số nhà, đường, phường, quận, tỉnh" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--green)]">Email</label>
                <input {...field("email")} type="email" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--green)]">Ghi chú</label>
                <textarea {...field("note")} rows={2} className={inputCls + " resize-none"} />
              </div>
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-card)] p-4 text-[13px]">
                {items.map((i) => (
                  <div key={`${i.id}__${i.variant}`} className="flex justify-between py-1 text-[var(--muted)]">
                    <span>{i.name}{i.variant ? ` (${i.variant})` : ""} × {i.qty}</span>
                    <span>{formatVnd(i.price_vnd * i.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-[var(--border)] pt-2 font-semibold text-[var(--foreground)]">
                  <span>Tổng ({shipping === 0 ? "ship miễn phí" : `ship ${formatVnd(shipping)}`})</span>
                  <span className="text-[var(--green-deep)]">{formatVnd(total)}</span>
                </div>
              </div>
              {error && <p className="rounded-[10px] bg-red-50 px-4 py-2 text-[13px] text-red-600">{error}</p>}
            </div>
            <div className="border-t border-[var(--border)] px-6 py-4 flex gap-3">
              <button type="button" onClick={() => setStep("cart")} className="flex-1 rounded-full border border-[var(--border)] py-3 text-[14px] font-semibold text-[var(--foreground)]">← Quay lại</button>
              <button type="submit" disabled={submitting} className="flex-1 rounded-full bg-[var(--green)] py-3 text-[14px] font-semibold text-white disabled:opacity-50">
                {submitting ? "Đang xử lý…" : "Xác nhận"}
              </button>
            </div>
          </form>
        )}

        {/* Success */}
        {step === "success" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--green-wash)]">
              <span className="text-4xl">🌿</span>
            </div>
            <h3 className="font-serif text-2xl text-[var(--foreground)]">Đặt hàng thành công!</h3>
            <p className="text-[14px] leading-6 text-[var(--muted)]">LUMIA sẽ liên hệ xác nhận đơn hàng qua điện thoại trong thời gian sớm nhất.</p>
            <button type="button" onClick={onClose} className="mt-2 rounded-full bg-[var(--green)] px-6 py-3 text-[14px] font-semibold text-white">Đóng</button>
          </div>
        )}
      </div>
    </>
  );
}
