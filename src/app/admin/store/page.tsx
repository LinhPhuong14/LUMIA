"use client";

import { useEffect, useMemo, useState } from "react";

import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { Input } from "@/components/ui/input";

type Product = {
  id: string;
  name: string;
  category: string | null;
  price_vnd: number;
  stock_quantity: number;
  in_stock: boolean;
  slug: string;
};

const CATEGORIES = ["Tất cả", "drink", "scent", "sleep", "meditation"];

export default function AdminStorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [editingStock, setEditingStock] = useState<{ id: string; value: string } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/store/products")
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "Tất cả" || p.category === category;
      return matchSearch && matchCat;
    });
  }, [products, search, category]);

  async function patchProduct(id: string, body: { stock_quantity?: number; in_stock?: boolean }) {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/store/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...body } : p))
        );
      }
    } finally {
      setSaving(null);
    }
  }

  function handleStockSave(id: string) {
    if (!editingStock || editingStock.id !== id) return;
    const val = parseInt(editingStock.value, 10);
    if (!isNaN(val) && val >= 0) {
      patchProduct(id, { stock_quantity: val });
    }
    setEditingStock(null);
  }

  const priceFormat = (v: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

  return (
    <AdminPageShell title={`Cửa hàng (${filtered.length})`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          type="search"
          label="Tìm kiếm"
          placeholder="Tìm theo tên sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={[
                "rounded-full border px-4 py-1.5 text-sm transition",
                category === cat
                  ? "border-[var(--green)] bg-[var(--green-wash)] text-[var(--green-deep)] font-medium"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--green)]",
              ].join(" ")}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 overflow-x-auto rounded-[20px] border border-white/70">
        <table className="w-full min-w-[800px] border-collapse text-left text-sm">
          <thead className="bg-surface-warm">
            <tr className="text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3">Tên</th>
              <th className="px-4 py-3">Danh mục</th>
              <th className="px-4 py-3">Giá</th>
              <th className="px-4 py-3">Tồn kho</th>
              <th className="px-4 py-3">Còn hàng</th>
              <th className="px-4 py-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr
                key={product.id}
                className="border-t border-white/60 transition hover:bg-matcha-soft/20"
              >
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{product.category ?? "-"}</td>
                <td className="px-4 py-3">{priceFormat(product.price_vnd)}</td>
                <td className="px-4 py-3">
                  {editingStock?.id === product.id ? (
                    <input
                      type="number"
                      min={0}
                      value={editingStock.value}
                      autoFocus
                      onChange={(e) =>
                        setEditingStock({ id: product.id, value: e.target.value })
                      }
                      onBlur={() => handleStockSave(product.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleStockSave(product.id);
                        if (e.key === "Escape") setEditingStock(null);
                      }}
                      className="w-20 rounded-lg border border-[var(--border)] bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--green)]"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingStock({ id: product.id, value: String(product.stock_quantity) })
                      }
                      className="rounded px-1 hover:bg-[var(--green-wash)] transition"
                      title="Click để chỉnh sửa"
                    >
                      {product.stock_quantity}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={product.in_stock}
                    disabled={saving === product.id}
                    onChange={(e) => patchProduct(product.id, { in_stock: e.target.checked })}
                    className="h-4 w-4 cursor-pointer accent-[var(--green)]"
                  />
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`/store/${product.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[var(--green)] underline hover:opacity-70"
                  >
                    Xem
                  </a>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--muted)]">
                  Không tìm thấy sản phẩm
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  );
}
