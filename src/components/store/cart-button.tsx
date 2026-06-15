"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { CartSheet } from "@/components/store/cart-sheet";

export function CartButton() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-card)] text-[var(--foreground)] transition hover:border-[var(--green)] hover:text-[var(--green)]"
        aria-label="Giỏ hàng"
      >
        <ShoppingCart className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--green)] text-[10px] font-bold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>
      {open && <CartSheet onClose={() => setOpen(false)} />}
    </>
  );
}
