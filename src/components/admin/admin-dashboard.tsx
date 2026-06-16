"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3, BookOpen, Box, ChevronRight, LayoutDashboard,
  Package, Settings, ShoppingBag, Users, X, Webhook,
} from "lucide-react";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { getSubscriptionStatusLabel } from "@/lib/subscription-labels";
import { PRODUCT_TIERS } from "@/lib/product-tiers";
import { formatCurrency } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

type Stats = { users: number; orders: number; reports: number };

type UserRow = {
  id: string; email: string; full_name: string; role: string;
  subscription?: { status: string; started_at: string | null; expires_at: string | null };
  streak?: { current_streak: number };
};

type Order = {
  id: string; status: string; amount: number; created_at: string;
  tier?: string | null; duration_months?: number | null; has_physical_box?: boolean;
  profiles?: { full_name?: string; email?: string };
};

type Product = {
  id: string; name: string; category: string | null;
  price_vnd: number; stock_quantity: number; in_stock: boolean; slug: string;
};

type BlogPost = {
  id: string; slug: string; title: string; excerpt: string;
  category: string; emoji: string; cover_color: string;
  read_time: number; published: boolean; published_at: string | null; created_at: string;
};

type BlogForm = {
  id?: string; slug: string; title: string; excerpt: string;
  content: string; category: string; emoji: string;
  cover_color: string; read_time: number; published: boolean;
};

const BLOG_CATEGORIES = ["Wellbeing", "Mindfulness", "Sleep", "Productivity", "Nutrition", "Mental Health"];

const ORDER_STATUSES = ["paid", "preparing", "shipping", "delivered"] as const;
const ORDER_STATUS_LABELS: Record<string, string> = {
  paid: "Đã thanh toán", preparing: "Đang chuẩn bị",
  shipping: "Đang giao", delivered: "Đã giao",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str.toLowerCase().trim()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-").replace(/-+/g, "-");
}

function fmtDate(s: string | null) {
  if (!s) return "-";
  return new Date(s).toLocaleDateString("vi-VN");
}

// ─── Tab: Tổng quan ──────────────────────────────────────────────────────────

function OverviewTab({ stats }: { stats: Stats }) {
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Người dùng", value: stats.users, icon: Users, color: "text-[var(--green-deep)]", bg: "bg-[var(--green-wash)]" },
          { label: "Đơn hàng", value: stats.orders, icon: ShoppingBag, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Báo cáo", value: stats.reports, icon: BarChart3, color: "text-blue-700", bg: "bg-blue-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="soft-card p-6">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${bg} ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="mt-4 text-3xl font-bold text-[var(--foreground)]">{value}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">{label}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 soft-card p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Hướng dẫn nhanh</h3>
        <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
          <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-[var(--green)]" /> Tab <strong>Người dùng</strong> — tìm và nâng cấp subscription cho user</li>
          <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-[var(--green)]" /> Tab <strong>Đơn hàng</strong> — theo dõi và cập nhật trạng thái giao hàng</li>
          <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-[var(--green)]" /> Tab <strong>Sản phẩm</strong> — quản lý tồn kho và kích hoạt sản phẩm</li>
          <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-[var(--green)]" /> Tab <strong>Blog</strong> — viết và xuất bản bài viết mới</li>
          <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-[var(--green)]" /> Tab <strong>Hệ thống</strong> — cấu hình webhook PayOS</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Tab: Người dùng ─────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [form, setForm] = useState({ tier: "premium", duration_months: 1, has_physical_box: false });
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users").then(r => r.json()).then(setUsers).catch(() => setUsers([]));
  }, []);

  const filtered = useMemo(() =>
    users.filter(u => u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())),
    [users, search]);

  async function upgrade() {
    if (!selected) return;
    setBusy(true); setStatus(null);
    const res = await fetch(`/api/admin/users/${selected.id}/subscription`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    setStatus(res.ok ? { ok: true, msg: "Nâng cấp thành công!" } : { ok: false, msg: data.error ?? "Lỗi" });
    if (res.ok) setUsers(prev => prev.map(u => u.id === selected.id
      ? { ...u, subscription: { ...u.subscription, status: "active", started_at: new Date().toISOString(), expires_at: null } }
      : u));
    setBusy(false);
  }

  return (
    <div>
      <input
        type="search" placeholder="Tìm theo email hoặc tên..." value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 w-full max-w-md rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]/30"
      />
      <div className="overflow-x-auto rounded-[20px] border border-[var(--border)]">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-warm)]">
            <tr className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              {["Email", "Tên", "Vai trò", "Gói", "Hết hạn", "Streak"].map(h => (
                <th key={h} className="px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} onClick={() => { setSelected(u); setStatus(null); }}
                className="cursor-pointer border-t border-[var(--border)]/50 transition hover:bg-[var(--green-wash)]/40">
                <td className="px-4 py-3 text-[13px]">{u.email}</td>
                <td className="px-4 py-3">{u.full_name || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${u.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-[var(--surface-warm)] text-[var(--muted)]"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">{getSubscriptionStatusLabel(u.subscription?.status ?? "free")}</td>
                <td className="px-4 py-3 text-[12px] text-[var(--muted)]">{fmtDate(u.subscription?.expires_at ?? null)}</td>
                <td className="px-4 py-3">{u.streak?.current_streak ?? 0} 🔥</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[var(--muted)]">Không tìm thấy user</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upgrade Drawer */}
      {selected ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/25" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="flex h-full w-full max-w-sm flex-col overflow-y-auto bg-[var(--surface-card)] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-[var(--foreground)]">{selected.full_name || "User"}</h2>
                <p className="text-[13px] text-[var(--muted)]">{selected.email}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-full p-1 hover:bg-[var(--surface-warm)]">
                <X className="h-4 w-4 text-[var(--muted)]" />
              </button>
            </div>
            <dl className="mt-5 space-y-2 rounded-[16px] bg-[var(--surface-warm)] px-4 py-3 text-[13px]">
              <div className="flex justify-between"><dt className="text-[var(--muted)]">Gói hiện tại</dt><dd>{getSubscriptionStatusLabel(selected.subscription?.status ?? "free")}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--muted)]">Streak</dt><dd>{selected.streak?.current_streak ?? 0} ngày</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--muted)]">Hết hạn</dt><dd>{fmtDate(selected.subscription?.expires_at ?? null)}</dd></div>
            </dl>
            <div className="mt-6 border-t border-[var(--border)] pt-5">
              <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Nâng cấp Premium</h3>
              <div className="space-y-3">
                {[
                  { label: "Gói", key: "tier", options: [["saver", "Saver"], ["premium", "Premium"], ["gift", "Gift"]] },
                  { label: "Thời gian", key: "duration_months", options: [["1", "1 tháng"], ["3", "3 tháng"], ["6", "6 tháng"], ["12", "12 tháng"]] },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <label className="mb-1 block text-[12px] text-[var(--muted)]">{label}</label>
                    <select
                      value={String(form[key as keyof typeof form])}
                      onChange={e => setForm(f => ({ ...f, [key]: key === "duration_months" ? Number(e.target.value) : e.target.value }))}
                      className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]/30"
                    >
                      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                ))}
                <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                  <input type="checkbox" checked={form.has_physical_box}
                    onChange={e => setForm(f => ({ ...f, has_physical_box: e.target.checked }))}
                    className="h-4 w-4 accent-[var(--green)]" />
                  Kèm hộp vật lý
                </label>
              </div>
              <button type="button" onClick={upgrade} disabled={busy}
                className="button-primary mt-4 w-full disabled:opacity-60">
                {busy ? "Đang xử lý…" : "Nâng cấp ngay"}
              </button>
              {status && (
                <p className={`mt-3 rounded-[12px] px-3 py-2 text-[13px] ${status.ok ? "bg-[var(--green-wash)] text-[var(--green-deep)]" : "bg-red-50 text-red-600"}`}>
                  {status.msg}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ─── Tab: Đơn hàng ───────────────────────────────────────────────────────────

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders").then(r => r.json()).then(setOrders).catch(() => setOrders([]));
  }, []);

  async function updateStatus(id: string, status: string) {
    const prev = orders.find(o => o.id === id)?.status;
    setOrders(list => list.map(o => o.id === id ? { ...o, status } : o));
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    });
    if (!res.ok && prev) setOrders(list => list.map(o => o.id === id ? { ...o, status: prev } : o));
    setToast(res.ok ? "Đã cập nhật" : "Cập nhật thất bại");
    setTimeout(() => setToast(null), 2500);
  }

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {["all", ...ORDER_STATUSES].map(s => (
          <button key={s} type="button" onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-[13px] transition ${filter === s ? "border-[var(--green)] bg-[var(--green-wash)] font-semibold text-[var(--green-deep)]" : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--green)]/50"}`}>
            {s === "all" ? "Tất cả" : ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-[20px] border border-[var(--border)]">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-warm)]">
            <tr className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              {["Mã đơn", "Email", "Gói", "Thời hạn", "Box", "Ngày đặt", "Số tiền", "Trạng thái"].map(h => (
                <th key={h} className="px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-t border-[var(--border)]/50 transition hover:bg-[var(--surface-warm)]/60">
                <td className="px-4 py-3 font-mono text-[11px] text-[var(--muted)]">{o.id.slice(0, 8)}</td>
                <td className="px-4 py-3 text-[13px]">{o.profiles?.email ?? "-"}</td>
                <td className="px-4 py-3">{o.tier ?? "-"}</td>
                <td className="px-4 py-3">{o.duration_months ? `${o.duration_months} tháng` : "-"}</td>
                <td className="px-4 py-3">{o.has_physical_box ? "✓" : "-"}</td>
                <td className="px-4 py-3 text-[12px] text-[var(--muted)]">{fmtDate(o.created_at)}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(o.amount)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={o.status} />
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      disabled={!o.has_physical_box && o.status === "paid"}
                      className="rounded-[10px] border border-[var(--border)] bg-[var(--surface-card)] px-2 py-1 text-[12px] outline-none">
                      {ORDER_STATUSES.map(s => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-[var(--muted)]">Không có đơn hàng</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {toast && <div className="mt-3 text-[13px] text-[var(--green-deep)]">{toast}</div>}
    </div>
  );
}

// ─── Tab: Sản phẩm ──────────────────────────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tất cả");
  const [editing, setEditing] = useState<{ id: string; value: string } | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/store/products").then(r => r.json()).then(setProducts).catch(() => setProducts([]));
  }, []);

  async function patch(id: string, body: { stock_quantity?: number; in_stock?: boolean }) {
    setSaving(id);
    const res = await fetch(`/api/admin/store/products/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (res.ok) setProducts(prev => prev.map(p => p.id === id ? { ...p, ...body } : p));
    setSaving(null);
  }

  function saveStock(id: string) {
    if (!editing || editing.id !== id) return;
    const val = parseInt(editing.value, 10);
    if (!isNaN(val) && val >= 0) patch(id, { stock_quantity: val });
    setEditing(null);
  }

  const CATS = ["Tất cả", "drink", "scent", "sleep", "meditation"];
  const filtered = useMemo(() => products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === "Tất cả" || p.category === cat;
    return matchSearch && matchCat;
  }), [products, search, cat]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input type="search" placeholder="Tìm theo tên sản phẩm..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]/30" />
        <div className="flex flex-wrap gap-2">
          {CATS.map(c => (
            <button key={c} type="button" onClick={() => setCat(c)}
              className={`rounded-full border px-3 py-1 text-[13px] transition ${cat === c ? "border-[var(--green)] bg-[var(--green-wash)] font-semibold text-[var(--green-deep)]" : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--green)]/50"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto rounded-[20px] border border-[var(--border)]">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-warm)]">
            <tr className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              {["Tên sản phẩm", "Danh mục", "Giá", "Tồn kho", "Còn hàng", "Link"].map(h => (
                <th key={h} className="px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t border-[var(--border)]/50 transition hover:bg-[var(--surface-warm)]/60">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-[var(--muted)]">{p.category ?? "-"}</td>
                <td className="px-4 py-3">{formatCurrency(p.price_vnd)}</td>
                <td className="px-4 py-3">
                  {editing?.id === p.id ? (
                    <input type="number" min={0} value={editing.value} autoFocus
                      onChange={e => setEditing({ id: p.id, value: e.target.value })}
                      onBlur={() => saveStock(p.id)}
                      onKeyDown={e => { if (e.key === "Enter") saveStock(p.id); if (e.key === "Escape") setEditing(null); }}
                      className="w-20 rounded-[10px] border border-[var(--border)] bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]/30" />
                  ) : (
                    <button type="button" title="Click để chỉnh sửa"
                      onClick={() => setEditing({ id: p.id, value: String(p.stock_quantity) })}
                      className="rounded px-2 py-0.5 tabular-nums transition hover:bg-[var(--green-wash)]">
                      {p.stock_quantity}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={p.in_stock} disabled={saving === p.id}
                    onChange={e => patch(p.id, { in_stock: e.target.checked })}
                    className="h-4 w-4 cursor-pointer accent-[var(--green)]" />
                </td>
                <td className="px-4 py-3">
                  <a href={`/store/${p.slug}`} target="_blank" rel="noopener noreferrer"
                    className="text-[12px] text-[var(--green)] underline hover:opacity-70">Xem</a>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[var(--muted)]">Không tìm thấy sản phẩm</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Tab: Blog ───────────────────────────────────────────────────────────────

const EMPTY_BLOG: BlogForm = {
  slug: "", title: "", excerpt: "", content: "",
  category: "Wellbeing", emoji: "📝",
  cover_color: "linear-gradient(135deg,#e0f2e9,#b8dfc8)", read_time: 3, published: false,
};

function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<BlogForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  const loadPosts = useCallback(() => {
    fetch("/api/blog/admin/list").then(r => r.json())
      .then(d => setPosts(d.posts ?? [])).catch(() => setPosts([]));
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  function openNew() { setForm({ ...EMPTY_BLOG }); }
  function openEdit(p: BlogPost) {
    setForm({ id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt, content: "", category: p.category, emoji: p.emoji, cover_color: p.cover_color, read_time: p.read_time, published: p.published });
  }

  function handleTitleChange(title: string) {
    setForm(f => f ? { ...f, title, slug: slugify(title) } : f);
  }

  async function savePost() {
    if (!form) return;
    setSaving(true);
    const res = await fetch("/api/blog/admin", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    if (res.ok) { showToast(form.id ? "Đã cập nhật bài viết" : "Đã tạo bài viết"); setForm(null); loadPosts(); }
    else { const d = await res.json(); showToast(d.error ?? "Lỗi lưu bài viết"); }
    setSaving(false);
  }

  async function deletePost(id: string) {
    setDeleting(id);
    const res = await fetch(`/api/blog/admin?id=${id}`, { method: "DELETE" });
    if (res.ok) { showToast("Đã xóa bài viết"); setPosts(p => p.filter(x => x.id !== id)); }
    else showToast("Xóa thất bại");
    setDeleting(null);
  }

  async function togglePublish(p: BlogPost) {
    const newPub = !p.published;
    const res = await fetch("/api/blog/admin", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, emoji: p.emoji, cover_color: p.cover_color, read_time: p.read_time, published: newPub }),
    });
    if (res.ok) { showToast(newPub ? "Đã xuất bản" : "Đã ẩn bài viết"); loadPosts(); }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13px] text-[var(--muted)]">{posts.length} bài viết</span>
        <button type="button" onClick={openNew} className="button-primary px-4 py-2 text-sm">+ Bài viết mới</button>
      </div>

      <div className="space-y-3">
        {posts.map(p => (
          <div key={p.id} className="flex items-center gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-3 transition hover:border-[var(--green)]/40">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-xl" style={{ background: p.cover_color.startsWith("linear") ? p.cover_color : undefined, backgroundColor: p.cover_color.startsWith("linear") ? undefined : p.cover_color }}>
              {p.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-[var(--foreground)]">{p.title}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${p.published ? "bg-[var(--green-wash)] text-[var(--green-deep)]" : "bg-[var(--surface-warm)] text-[var(--muted)]"}`}>
                  {p.published ? "Đã xuất bản" : "Bản nháp"}
                </span>
              </div>
              <p className="mt-0.5 truncate text-[12px] text-[var(--muted)]">{p.category} · {p.read_time} phút · {fmtDate(p.created_at)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => togglePublish(p)}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-[12px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)]">
                {p.published ? "Ẩn" : "Xuất bản"}
              </button>
              <button type="button" onClick={() => openEdit(p)}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-[12px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)]">
                Sửa
              </button>
              <button type="button" onClick={() => deletePost(p.id)} disabled={deleting === p.id}
                className="rounded-full border border-red-200 px-3 py-1 text-[12px] text-red-500 transition hover:bg-red-50 disabled:opacity-50">
                Xóa
              </button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <div className="py-12 text-center text-[var(--muted)]">Chưa có bài viết nào. Hãy tạo bài đầu tiên!</div>}
      </div>

      {toast && <div className="mt-3 rounded-[12px] bg-[var(--green-wash)] px-4 py-2 text-[13px] text-[var(--green-deep)]">{toast}</div>}

      {/* Blog form modal */}
      {form ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/30 py-8">
          <div className="relative w-full max-w-2xl rounded-[24px] bg-[var(--surface-card)] p-6 shadow-2xl mx-4">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold text-[var(--foreground)]">{form.id ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}</h2>
              <button type="button" onClick={() => setForm(null)} className="rounded-full p-1 hover:bg-[var(--surface-warm)]">
                <X className="h-4 w-4 text-[var(--muted)]" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[12px] font-medium text-[var(--muted)]">Tiêu đề *</label>
                <input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Tiêu đề bài viết"
                  className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-[var(--muted)]">Slug</label>
                  <input type="text" value={form.slug} onChange={e => setForm(f => f ? { ...f, slug: e.target.value } : f)}
                    className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]/30" />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-[var(--muted)]">Danh mục</label>
                  <select value={form.category} onChange={e => setForm(f => f ? { ...f, category: e.target.value } : f)}
                    className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]/30">
                    {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-[var(--muted)]">Emoji</label>
                  <input type="text" value={form.emoji} onChange={e => setForm(f => f ? { ...f, emoji: e.target.value } : f)}
                    className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]/30" />
                </div>
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-[var(--muted)]">Thời gian đọc (phút)</label>
                  <input type="number" min={1} value={form.read_time} onChange={e => setForm(f => f ? { ...f, read_time: Number(e.target.value) } : f)}
                    className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]/30" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-[var(--muted)]">Màu nền (CSS gradient hoặc hex)</label>
                <input type="text" value={form.cover_color} onChange={e => setForm(f => f ? { ...f, cover_color: e.target.value } : f)}
                  className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-[var(--green)]/30" />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-[var(--muted)]">Tóm tắt *</label>
                <textarea rows={2} value={form.excerpt} onChange={e => setForm(f => f ? { ...f, excerpt: e.target.value } : f)}
                  placeholder="Mô tả ngắn hiển thị trên trang danh sách"
                  className="w-full resize-none rounded-[12px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]/30" />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-[var(--muted)]">Nội dung (Markdown)</label>
                <textarea rows={10} value={form.content} onChange={e => setForm(f => f ? { ...f, content: e.target.value } : f)}
                  placeholder="Nội dung bài viết hỗ trợ Markdown..."
                  className="w-full resize-y rounded-[12px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2.5 font-mono text-[13px] outline-none focus:ring-2 focus:ring-[var(--green)]/30" />
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                <input type="checkbox" checked={form.published} onChange={e => setForm(f => f ? { ...f, published: e.target.checked } : f)}
                  className="h-4 w-4 accent-[var(--green)]" />
                Xuất bản ngay
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setForm(null)} className="button-secondary px-4 py-2 text-sm">Hủy</button>
              <button type="button" onClick={savePost} disabled={saving || !form.title || !form.excerpt}
                className="button-primary px-4 py-2 text-sm disabled:opacity-60">
                {saving ? "Đang lưu…" : (form.id ? "Cập nhật" : "Tạo bài viết")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ─── Tab: Gói dịch vụ ────────────────────────────────────────────────────────

function PlansTab() {
  return (
    <div>
      <p className="mb-4 text-[13px] text-[var(--muted)]">Danh sách gói dịch vụ hiện tại. Để thay đổi giá, chỉnh sửa <code className="rounded bg-[var(--surface-warm)] px-1 text-[12px]">src/lib/product-tiers.ts</code>.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCT_TIERS.map(t => (
          <div key={t.id} className={`soft-card p-5 ${t.isFeatured ? "ring-2 ring-[var(--green)]" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{t.group}</p>
                <h3 className="mt-1 font-semibold text-[var(--foreground)]">{t.name}</h3>
              </div>
              {t.isFeatured && <span className="rounded-full bg-[var(--green-wash)] px-2 py-0.5 text-[10px] font-bold text-[var(--green-deep)]">Nổi bật</span>}
            </div>
            <div className="mt-4 text-2xl font-bold text-[var(--foreground)]">
              {formatCurrency(t.priceVnd)}
            </div>
            <div className="mt-0.5 text-[12px] text-[var(--muted)]">{t.durationMonths} tháng · {t.discountPercent > 0 ? `Tiết kiệm ${t.discountPercent}%` : "Giá gốc"}</div>
            <div className="mt-3 flex flex-wrap gap-1">
              {t.hasPhysicalBox && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">Hộp vật lý</span>}
              {t.isFirstTimeOnly && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">First-time only</span>}
            </div>
            {t.boxContents.length > 0 && (
              <ul className="mt-3 space-y-1 text-[12px] text-[var(--muted)]">
                {t.boxContents.map(c => <li key={c} className="flex items-center gap-1"><span className="text-[var(--green)]">·</span> {c}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Hệ thống ────────────────────────────────────────────────────────────

function SystemTab() {
  const [webhookStatus, setWebhookStatus] = useState<{ configured: boolean; webhookUrl?: string; clientId?: string } | null>(null);
  const [registering, setRegistering] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/payos-webhook").then(r => r.json()).then(setWebhookStatus).catch(() => null);
  }, []);

  async function registerWebhook() {
    setRegistering(true); setMsg(null);
    const res = await fetch("/api/admin/payos-webhook", { method: "POST" });
    const d = await res.json();
    setMsg(res.ok ? "Đăng ký webhook thành công!" : (d.error ?? "Đăng ký thất bại"));
    if (res.ok) fetch("/api/admin/payos-webhook").then(r => r.json()).then(setWebhookStatus).catch(() => null);
    setRegistering(false);
  }

  return (
    <div className="space-y-6">
      <div className="soft-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--green-wash)] text-[var(--green-deep)]">
            <Webhook className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">PayOS Webhook</h3>
            <p className="text-[12px] text-[var(--muted)]">Cấu hình nhận thông báo thanh toán từ PayOS</p>
          </div>
        </div>
        {webhookStatus ? (
          <dl className="mt-5 space-y-2 rounded-[16px] bg-[var(--surface-warm)] px-4 py-3 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-[var(--muted)]">Trạng thái</dt>
              <dd>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${webhookStatus.configured ? "bg-[var(--green-wash)] text-[var(--green-deep)]" : "bg-red-50 text-red-600"}`}>
                  {webhookStatus.configured ? "Đã cấu hình" : "Chưa cấu hình"}
                </span>
              </dd>
            </div>
            {webhookStatus.webhookUrl && (
              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-[var(--muted)]">Webhook URL</dt>
                <dd className="truncate font-mono text-[11px]">{webhookStatus.webhookUrl}</dd>
              </div>
            )}
            {webhookStatus.clientId && (
              <div className="flex justify-between">
                <dt className="text-[var(--muted)]">Client ID</dt>
                <dd className="font-mono text-[12px]">{webhookStatus.clientId}</dd>
              </div>
            )}
          </dl>
        ) : (
          <div className="mt-4 h-20 animate-pulse rounded-[16px] bg-[var(--surface-warm)]" />
        )}
        <button type="button" onClick={registerWebhook} disabled={registering}
          className="button-primary mt-4 px-5 py-2.5 text-sm disabled:opacity-60">
          {registering ? "Đang đăng ký…" : "Đăng ký / Cập nhật webhook"}
        </button>
        {msg && <p className={`mt-3 rounded-[12px] px-3 py-2 text-[13px] ${msg.includes("thành công") ? "bg-[var(--green-wash)] text-[var(--green-deep)]" : "bg-red-50 text-red-600"}`}>{msg}</p>}
      </div>

      <div className="soft-card p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--surface-warm)]">
            <Settings className="h-5 w-5 text-[var(--muted)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">Biến môi trường</h3>
            <p className="text-[12px] text-[var(--muted)]">Cấu hình qua file .env.local trên server</p>
          </div>
        </div>
        <ul className="mt-4 space-y-1.5 text-[13px] text-[var(--muted)]">
          {["PAYOS_CLIENT_ID", "PAYOS_API_KEY", "PAYOS_CHECKSUM_KEY", "NEXT_PUBLIC_APP_URL", "ANTHROPIC_API_KEY", "SUPABASE_URL", "SUPABASE_ANON_KEY"].map(k => (
            <li key={k} className="flex items-center gap-2">
              <code className="rounded bg-[var(--surface-warm)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--foreground)]">{k}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "users", label: "Người dùng", icon: Users },
  { id: "orders", label: "Đơn hàng", icon: ShoppingBag },
  { id: "products", label: "Sản phẩm", icon: Package },
  { id: "blog", label: "Blog", icon: BookOpen },
  { id: "plans", label: "Gói dịch vụ", icon: Box },
  { id: "system", label: "Hệ thống", icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminDashboard({ stats }: { stats: Stats }) {
  const [tab, setTab] = useState<TabId>("overview");
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Tab bar */}
      <div className="shrink-0 overflow-x-auto border-b border-[var(--border)] bg-[var(--surface-card)]">
        <div ref={scrollRef} className="flex min-w-max gap-1 px-4 py-2 md:px-8">
          {TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} type="button" onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition ${active ? "bg-[var(--green-wash)] text-[var(--green-deep)]" : "text-[var(--muted)] hover:bg-[var(--surface-warm)] hover:text-[var(--foreground)]"}`}>
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8">
        {tab === "overview" && <OverviewTab stats={stats} />}
        {tab === "users" && <UsersTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "blog" && <BlogTab />}
        {tab === "plans" && <PlansTab />}
        {tab === "system" && <SystemTab />}
      </div>
    </div>
  );
}
