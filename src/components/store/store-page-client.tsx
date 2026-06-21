"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, X, Plus, Minus, Trash2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  price_vnd: number;
  category: string;
  features: string[];
  image_url: string | null;
  in_stock: boolean;
};

type CartItem = Product & { qty: number };

type CheckoutForm = {
  name: string;
  phone: string;
  address: string;
  email: string;
  note: string;
};

function formatVnd(n: number) {
  return n.toLocaleString("vi-VN") + " ₫";
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface-card)] shadow-[0_8px_24px_rgba(95,111,82,0.07)] transition hover:shadow-[0_12px_32px_rgba(95,111,82,0.12)]">
      {/* Image */}
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--surface)] to-[var(--green-wash)]">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className="text-[52px] leading-none" style={{ filter: "saturate(0.7) opacity(0.5)" }}>
              {({ drink: "🍵", scent: "🕯️", sleep: "🌙", meditation: "✨", wellness: "🌿" } as Record<string, string>)[product.category] ?? "🌿"}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--green-deep)] opacity-40">
              {product.category}
            </span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-[var(--green)] px-3 py-1 text-[11px] font-bold text-white shadow">
          {formatVnd(product.price_vnd)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div>
          <h3 className="font-serif text-[18px] font-semibold text-[var(--foreground)]">{product.name}</h3>
          {product.subtitle ? (
            <p className="mt-0.5 text-[12px] text-[var(--muted)]">{product.subtitle}</p>
          ) : null}
        </div>

        <ul className="mt-3 flex-1 space-y-1">
          {product.features.map((f) => (
            <li key={f} className="flex items-center gap-1.5 text-[13px] text-[var(--muted)]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green)]" />
              {f}
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={!product.in_stock}
          onClick={() => onAdd(product)}
          className="mt-4 w-full rounded-full bg-[var(--green)] py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
        >
          {product.in_stock ? "Thêm vào giỏ" : "Hết hàng"}
        </button>
      </div>
    </div>
  );
}

function CartSheet({
  items,
  onClose,
  onQty,
  onRemove,
  onCheckout,
}: {
  items: CartItem[];
  onClose: () => void;
  onQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}) {
  const subtotal = items.reduce((s, i) => s + i.price_vnd * i.qty, 0);
  const shipping = subtotal >= 300000 ? 0 : 30000;
  const total = subtotal + shipping;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        aria-label="Đóng giỏ hàng"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[420px] flex-col bg-[var(--bg)] shadow-[−24px_0_60px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
          <span className="font-serif text-xl text-[var(--foreground)]">Giỏ hàng</span>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-[var(--muted)] hover:text-[var(--foreground)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-[var(--muted)]">
            <ShoppingCart className="h-12 w-12 opacity-30" />
            <p className="text-[14px]">Giỏ hàng trống</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-[16px] border border-[var(--border)] bg-[var(--surface-card)] p-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[12px] bg-[var(--green-wash)] text-2xl">
                    🌿
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-[var(--foreground)]">{item.name}</p>
                      {item.subtitle ? <p className="text-[11px] text-[var(--muted)]">{item.subtitle}</p> : null}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-[var(--border)] px-2 py-1">
                        <button type="button" onClick={() => onQty(item.id, -1)} className="text-[var(--muted)]">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-[13px] font-semibold text-[var(--foreground)]">{item.qty}</span>
                        <button type="button" onClick={() => onQty(item.id, +1)} className="text-[var(--muted)]">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[13px] font-semibold text-[var(--green-deep)]">{formatVnd(item.price_vnd * item.qty)}</span>
                        <button type="button" onClick={() => onRemove(item.id)} className="text-[var(--muted)] hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--border)] px-6 pt-5 pb-[calc(var(--mobile-tab-bar-offset,6.5rem)+var(--safe-bottom,0px))] lg:pb-5 space-y-2">
              <div className="flex justify-between text-[13px] text-[var(--muted)]">
                <span>Tạm tính</span>
                <span>{formatVnd(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[13px] text-[var(--muted)]">
                <span>Phí ship</span>
                <span>{shipping === 0 ? <span className="text-[var(--green)]">Miễn phí</span> : formatVnd(shipping)}</span>
              </div>
              {shipping > 0 ? (
                <p className="text-[11px] text-[var(--muted)]">Miễn phí ship cho đơn từ 300.000 ₫</p>
              ) : null}
              <div className="flex justify-between pt-2 font-semibold text-[var(--foreground)]">
                <span>Tổng cộng</span>
                <span className="text-[var(--green-deep)]">{formatVnd(total)}</span>
              </div>
              <button
                type="button"
                onClick={onCheckout}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--green)] py-3.5 text-[14px] font-semibold text-white transition hover:opacity-90"
              >
                Đặt hàng <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function CheckoutModal({
  items,
  onClose,
  onSuccess,
}: {
  items: CartItem[];
  onClose: () => void;
  onSuccess: () => void;
}) {
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/store/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ product_id: i.id, slug: i.slug, name: i.name, price_vnd: i.price_vnd, qty: i.qty })),
        shipping_name: form.name,
        shipping_phone: form.phone,
        shipping_address: form.address,
        guest_email: form.email || undefined,
        note: form.note || undefined,
      }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const j = (await res.json()) as { error?: string };
      setError(j.error ?? "Có lỗi xảy ra, vui lòng thử lại.");
      return;
    }
    onSuccess();
  }

  const inputCls = "w-full rounded-[14px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-3 text-[14px] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--green)] focus:outline-none";

  return (
    <>
      <button type="button" className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 z-[60] max-h-[90dvh] w-full max-w-lg -translate-y-1/2 overflow-y-auto rounded-[28px] bg-[var(--bg)] p-6 shadow-[0_32px_80px_rgba(0,0,0,0.25)] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2">
        <div className="mb-5 flex items-center justify-between">
          <span className="font-serif text-xl text-[var(--foreground)]">Thông tin giao hàng</span>
          <button type="button" onClick={onClose} className="text-[var(--muted)]"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--green)]">Họ tên *</label>
              <input {...field("name")} required placeholder="Nguyễn Văn A" className={inputCls} />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--green)]">Số điện thoại *</label>
              <input {...field("phone")} required type="tel" placeholder="09x xxx xxxx" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--green)]">Địa chỉ giao hàng *</label>
            <input {...field("address")} required placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--green)]">Email (nhận xác nhận đơn)</label>
            <input {...field("email")} type="email" placeholder="email@example.com" className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--green)]">Ghi chú</label>
            <textarea {...field("note")} rows={2} placeholder="Yêu cầu đặc biệt..." className={inputCls + " resize-none"} />
          </div>

          {/* Order summary */}
          <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface-card)] p-4 text-[13px]">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between py-1 text-[var(--muted)]">
                <span>{i.name} × {i.qty}</span>
                <span>{formatVnd(i.price_vnd * i.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-[var(--border)] pt-2 font-semibold text-[var(--foreground)]">
              <span>Tổng ({shipping === 0 ? "ship miễn phí" : `ship ${formatVnd(shipping)}`})</span>
              <span className="text-[var(--green-deep)]">{formatVnd(total)}</span>
            </div>
          </div>

          {error ? <p className="rounded-[10px] bg-red-50 px-4 py-2 text-[13px] text-red-600">{error}</p> : null}

          <button type="submit" disabled={submitting} className="w-full rounded-full bg-[var(--green)] py-3.5 text-[14px] font-semibold text-white disabled:opacity-50">
            {submitting ? "Đang xử lý…" : "Xác nhận đặt hàng"}
          </button>
        </form>
      </div>
    </>
  );
}

function SuccessScreen({ onClose }: { onClose: () => void }) {
  return (
    <>
      <button type="button" className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 z-[60] max-w-sm -translate-y-1/2 rounded-[28px] bg-[var(--bg)] p-8 text-center shadow-[0_32px_80px_rgba(0,0,0,0.25)] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--green-wash)] text-4xl">🌿</div>
        <h3 className="font-serif text-2xl text-[var(--matcha-deep)]">Đặt hàng thành công!</h3>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--muted)]">
          Cảm ơn bạn đã tin tưởng LUMIA. Chúng mình sẽ liên hệ xác nhận đơn và giao hàng sớm nhất.
        </p>
        <button type="button" onClick={onClose} className="mt-5 w-full rounded-full bg-[var(--green)] py-3 text-[14px] font-semibold text-white">
          Tiếp tục mua sắm
        </button>
      </div>
    </>
  );
}

export function StorePageClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/store/products")
      .then((r) => r.json())
      .then((j: { products: Product[] }) => setProducts(j.products))
      .catch(() => null);
  }, []);

  function addToCart(p: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === p.id);
      if (existing) return prev.map((i) => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...p, qty: 1 }];
    });
  }

  function adjustQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i)
        .filter((i) => i.qty > 0),
    );
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);

  const categories = [
    { id: "all", label: "Tất cả" },
    { id: "drink", label: "Đồ uống" },
    { id: "scent", label: "Hương thơm" },
    { id: "sleep", label: "Ngủ ngon" },
    { id: "meditation", label: "Thiền" },
  ];

  const filtered = filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <div className="relative">
      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilter(cat.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-[13px] font-medium transition",
              filter === cat.id
                ? "border-[var(--green)] bg-[var(--green)] text-white"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--green)] hover:text-[var(--green)]",
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} onAdd={addToCart} />
        ))}
      </div>

      {/* Floating cart button */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            type="button"
            onClick={() => setCartOpen(true)}
            className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--green)] text-white shadow-[0_8px_24px_rgba(95,111,82,0.35)] lg:bottom-8 lg:right-8"
          >
            <ShoppingCart className="h-6 w-6" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--honey)] text-[10px] font-bold text-[var(--matcha-deep)]">
              {totalItems}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart sheet */}
      <AnimatePresence>
        {cartOpen && (
          <CartSheet
            items={cart}
            onClose={() => setCartOpen(false)}
            onQty={adjustQty}
            onRemove={removeItem}
            onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
          />
        )}
      </AnimatePresence>

      {/* Checkout modal */}
      <AnimatePresence>
        {checkoutOpen && !success && (
          <CheckoutModal
            items={cart}
            onClose={() => setCheckoutOpen(false)}
            onSuccess={() => { setCheckoutOpen(false); setSuccess(true); setCart([]); }}
          />
        )}
      </AnimatePresence>

      {/* Success */}
      <AnimatePresence>
        {success && <SuccessScreen onClose={() => setSuccess(false)} />}
      </AnimatePresence>
    </div>
  );
}
