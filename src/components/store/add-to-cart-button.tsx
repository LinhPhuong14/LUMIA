"use client";
import { ShoppingCart, Check, LogIn } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";

type Props = {
  product: { id: string; slug: string; name: string; subtitle?: string | null; price_vnd: number; image_url?: string | null };
  variant?: string | null;
  disabled?: boolean;
  isLoggedIn?: boolean;
};

export function AddToCartButton({ product, variant, disabled, isLoggedIn = true }: Props) {
  const { addItem } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    if (!isLoggedIn) {
      router.push("/login?next=/store");
      return;
    }
    addItem({ id: product.id, slug: product.slug, name: product.name, subtitle: product.subtitle, price_vnd: product.price_vnd, image_url: product.image_url, variant });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (!isLoggedIn) {
    return (
      <button
        type="button"
        onClick={handleAdd}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--green)] py-3.5 text-[14px] font-semibold text-[var(--green)] transition hover:bg-[var(--green-wash)]"
      >
        <LogIn className="h-4 w-4" />
        Đăng nhập để mua
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled || added}
      onClick={handleAdd}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--green)] py-3.5 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
    >
      {added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      {disabled ? "Hết hàng" : added ? "Đã thêm vào giỏ!" : "Thêm vào giỏ"}
    </button>
  );
}
