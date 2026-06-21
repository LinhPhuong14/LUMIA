"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3, BookOpen, Box, ChevronRight, ImagePlus, LayoutDashboard,
  Package, Settings, ShoppingBag, Upload, Users, Webhook, X,
} from "lucide-react";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { getSubscriptionStatusLabel } from "@/lib/subscription-labels";
import { PRODUCT_TIERS } from "@/lib/product-tiers";
import { formatCurrency } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  id: string; slug: string; name: string; subtitle?: string | null;
  description?: string | null; category: string | null;
  price_vnd: number; stock_quantity: number; in_stock: boolean;
  image_url?: string | null; features?: string[]; sort_order?: number;
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
  cover_image_url: string;
};

const BLOG_CATEGORIES = ["Wellbeing", "Mindfulness", "Sleep", "Productivity", "Nutrition", "Mental Health"];
const PRODUCT_CATEGORIES = ["drink", "scent", "sleep", "meditation", "wellness"];

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

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = "w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]/30";
const labelCls = "mb-1 block text-[12px] font-medium text-[var(--muted)]";

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
          <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-[var(--green)]" /> Tab <strong>Người dùng</strong> — tìm, tạo, sửa, nâng cấp subscription cho user</li>
          <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-[var(--green)]" /> Tab <strong>Đơn hàng</strong> — theo dõi và cập nhật trạng thái giao hàng</li>
          <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-[var(--green)]" /> Tab <strong>Sản phẩm</strong> — quản lý, thêm, sửa, xóa sản phẩm và tồn kho</li>
          <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-[var(--green)]" /> Tab <strong>Blog</strong> — viết và xuất bản bài viết mới với ảnh bìa</li>
          <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-[var(--green)]" /> Tab <strong>Hệ thống</strong> — cấu hình webhook PayOS</li>
        </ul>
      </div>
    </div>
  );
}

// ─── Tab: Người dùng ─────────────────────────────────────────────────────────

type UserModalMode = "create" | "edit" | "upgrade";

function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [mode, setMode] = useState<UserModalMode>("upgrade");
  const [upgradeForm, setUpgradeForm] = useState({ tier: "premium", duration_months: 1, has_physical_box: false });
  const [editForm, setEditForm] = useState({ full_name: "", role: "user" as "user" | "admin" });
  const [createForm, setCreateForm] = useState({ email: "", password: "", full_name: "", role: "user" as "user" | "admin" });
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);

  const loadUsers = useCallback(() => {
    fetch("/api/admin/users").then(r => r.json()).then(setUsers).catch(() => setUsers([]));
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const filtered = useMemo(() =>
    users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase())),
    [users, search]);

  function openUpgrade(u: UserRow) { setSelected(u); setMode("upgrade"); setStatus(null); }
  function openEdit(u: UserRow) {
    setSelected(u);
    setEditForm({ full_name: u.full_name ?? "", role: (u.role as "user" | "admin") ?? "user" });
    setMode("edit");
    setStatus(null);
  }
  function openCreate() {
    setSelected(null);
    setCreateForm({ email: "", password: "", full_name: "", role: "user" });
    setMode("create");
    setStatus(null);
  }
  function closeModal() { setSelected(null); setStatus(null); }

  async function upgrade() {
    if (!selected) return;
    setBusy(true); setStatus(null);
    const res = await fetch(`/api/admin/users/${selected.id}/subscription`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(upgradeForm),
    });
    const data = await res.json() as { error?: string };
    setStatus(res.ok ? { ok: true, msg: "Nâng cấp thành công!" } : { ok: false, msg: data.error ?? "Lỗi" });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === selected.id
        ? { ...u, subscription: { ...u.subscription, status: "active", started_at: new Date().toISOString(), expires_at: null } }
        : u));
    }
    setBusy(false);
  }

  async function saveEdit() {
    if (!selected) return;
    setBusy(true); setStatus(null);
    const res = await fetch(`/api/admin/users/${selected.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm),
    });
    const data = await res.json() as { error?: string };
    if (res.ok) {
      setStatus({ ok: true, msg: "Cập nhật thành công!" });
      setUsers(prev => prev.map(u => u.id === selected.id ? { ...u, ...editForm } : u));
    } else {
      setStatus({ ok: false, msg: data.error ?? "Lỗi" });
    }
    setBusy(false);
  }

  async function createUser() {
    setBusy(true); setStatus(null);
    const res = await fetch("/api/admin/users", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(createForm),
    });
    const data = await res.json() as { error?: string };
    if (res.ok) {
      setStatus({ ok: true, msg: "Tạo user thành công!" });
      loadUsers();
      setCreateForm({ email: "", password: "", full_name: "", role: "user" });
    } else {
      setStatus({ ok: false, msg: data.error ?? "Lỗi tạo user" });
    }
    setBusy(false);
  }

  async function deleteUser(u: UserRow) {
    setConfirmDelete(null);
    setBusy(true);
    await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    setUsers(prev => prev.filter(x => x.id !== u.id));
    setBusy(false);
  }

  const showModal = mode === "create" || selected !== null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          type="search" placeholder="Tìm theo email hoặc tên..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]/30"
        />
        <button type="button" onClick={openCreate} className="button-primary shrink-0 px-4 py-2 text-sm">
          + Tạo user mới
        </button>
      </div>
      <div className="overflow-x-auto rounded-[20px] border border-[var(--border)]">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-warm)]">
            <tr className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              {["Email", "Tên", "Vai trò", "Gói", "Hết hạn", "Streak", ""].map(h => (
                <th key={h} className="px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-t border-[var(--border)]/50 transition hover:bg-[var(--green-wash)]/40">
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
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => openUpgrade(u)}
                      className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)]">
                      Nâng cấp
                    </button>
                    <button type="button" onClick={() => openEdit(u)}
                      className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)]">
                      Sửa
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(u)} disabled={busy}
                      className="rounded-full border border-red-200 px-2.5 py-1 text-[11px] text-red-500 transition hover:bg-red-50 disabled:opacity-50">
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-[var(--muted)]">Không tìm thấy user</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm delete dialog */}
      {confirmDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-sm rounded-[20px] bg-[var(--surface-card)] p-6 shadow-2xl">
            <h3 className="font-semibold text-[var(--foreground)]">Xác nhận xóa user</h3>
            <p className="mt-2 text-[13px] text-[var(--muted)]">
              Bạn có chắc muốn xóa <strong>{confirmDelete.email}</strong>? Hành động này không thể hoàn tác.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDelete(null)} className="button-secondary px-4 py-2 text-sm">Hủy</button>
              <button type="button" onClick={() => deleteUser(confirmDelete)}
                className="rounded-[12px] bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">
                Xóa
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* User modal (create / edit / upgrade) */}
      {showModal ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/25"
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="flex h-full w-full max-w-sm flex-col overflow-y-auto bg-[var(--surface-card)] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-[var(--foreground)]">
                  {mode === "create" ? "Tạo user mới" : mode === "edit" ? "Sửa thông tin" : (selected?.full_name || "User")}
                </h2>
                {mode !== "create" && selected && (
                  <p className="text-[13px] text-[var(--muted)]">{selected.email}</p>
                )}
              </div>
              <button type="button" onClick={closeModal} className="rounded-full p-1 hover:bg-[var(--surface-warm)]">
                <X className="h-4 w-4 text-[var(--muted)]" />
              </button>
            </div>

            {/* Create form */}
            {mode === "create" && (
              <div className="mt-5 space-y-3">
                <div>
                  <label className={labelCls}>Email *</label>
                  <input type="email" value={createForm.email}
                    onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Mật khẩu *</label>
                  <input type="password" value={createForm.password}
                    onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Họ tên</label>
                  <input type="text" value={createForm.full_name}
                    onChange={e => setCreateForm(f => ({ ...f, full_name: e.target.value }))}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Vai trò</label>
                  <select value={createForm.role}
                    onChange={e => setCreateForm(f => ({ ...f, role: e.target.value as "user" | "admin" }))}
                    className={inputCls}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="button" onClick={createUser} disabled={busy || !createForm.email || !createForm.password}
                  className="button-primary mt-2 w-full disabled:opacity-60">
                  {busy ? "Đang tạo…" : "Tạo user"}
                </button>
              </div>
            )}

            {/* Edit form */}
            {mode === "edit" && selected && (
              <div className="mt-5 space-y-3">
                <div>
                  <label className={labelCls}>Họ tên</label>
                  <input type="text" value={editForm.full_name}
                    onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Vai trò</label>
                  <select value={editForm.role}
                    onChange={e => setEditForm(f => ({ ...f, role: e.target.value as "user" | "admin" }))}
                    className={inputCls}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="button" onClick={saveEdit} disabled={busy}
                  className="button-primary mt-2 w-full disabled:opacity-60">
                  {busy ? "Đang lưu…" : "Lưu thay đổi"}
                </button>
              </div>
            )}

            {/* Upgrade form */}
            {mode === "upgrade" && selected && (
              <>
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
                          value={String(upgradeForm[key as keyof typeof upgradeForm])}
                          onChange={e => setUpgradeForm(f => ({ ...f, [key]: key === "duration_months" ? Number(e.target.value) : e.target.value }))}
                          className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]/30"
                        >
                          {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                    ))}
                    <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                      <input type="checkbox" checked={upgradeForm.has_physical_box}
                        onChange={e => setUpgradeForm(f => ({ ...f, has_physical_box: e.target.checked }))}
                        className="h-4 w-4 accent-[var(--green)]" />
                      Kèm hộp vật lý
                    </label>
                  </div>
                  <button type="button" onClick={upgrade} disabled={busy}
                    className="button-primary mt-4 w-full disabled:opacity-60">
                    {busy ? "Đang xử lý…" : "Nâng cấp ngay"}
                  </button>
                </div>
              </>
            )}

            {status && (
              <p className={`mt-3 rounded-[12px] px-3 py-2 text-[13px] ${status.ok ? "bg-[var(--green-wash)] text-[var(--green-deep)]" : "bg-red-50 text-red-600"}`}>
                {status.msg}
              </p>
            )}
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

// ─── Tab: Sản phẩm ───────────────────────────────────────────────────────────

type ProductImage = { url: string; label: string };
type ProductVariant = { name: string; image_url: string };

type ProductForm = {
  name: string; slug: string; subtitle: string; description: string;
  price_vnd: number; category: string; features: string;
  image_url: string;
  images: ProductImage[];
  variants: ProductVariant[];
  in_stock: boolean; stock_quantity: number; sort_order: number;
};

const EMPTY_PRODUCT: ProductForm = {
  name: "", slug: "", subtitle: "", description: "",
  price_vnd: 0, category: "drink", features: "",
  image_url: "", images: [], variants: [],
  in_stock: true, stock_quantity: 0, sort_order: 0,
};

function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Tất cả");
  const [stockEditing, setStockEditing] = useState<{ id: string; value: string } | null>(null);
  const [patchingSaving, setPatchingSaving] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductForm | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formBusy, setFormBusy] = useState(false);
  const [formStatus, setFormStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<string | null>(null); // "banner"|"gallery-*"|"var-N"

  const loadProducts = useCallback(() => {
    fetch("/api/admin/store/products").then(r => r.json()).then(setProducts).catch(() => setProducts([]));
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  async function patch(id: string, body: { stock_quantity?: number; in_stock?: boolean }) {
    setPatchingSaving(id);
    const res = await fetch(`/api/admin/store/products/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    if (res.ok) setProducts(prev => prev.map(p => p.id === id ? { ...p, ...body } : p));
    setPatchingSaving(null);
  }

  function saveStock(id: string) {
    if (!stockEditing || stockEditing.id !== id) return;
    const val = parseInt(stockEditing.value, 10);
    if (!isNaN(val) && val >= 0) patch(id, { stock_quantity: val });
    setStockEditing(null);
  }

  function openNewProduct() {
    setEditingId(null);
    setProductForm({ ...EMPTY_PRODUCT });
    setFormStatus(null);
  }

  function openEditProduct(p: Product) {
    setEditingId(p.id);
    setProductForm({
      name: p.name, slug: p.slug, subtitle: p.subtitle ?? "",
      description: p.description ?? "", price_vnd: p.price_vnd,
      category: p.category ?? "drink",
      features: (p.features ?? []).join("\n"),
      image_url: p.image_url ?? "",
      images: ((p as unknown as { images?: ProductImage[] }).images) ?? [],
      variants: ((p as unknown as { variants?: ProductVariant[] }).variants) ?? [],
      in_stock: p.in_stock,
      stock_quantity: p.stock_quantity, sort_order: p.sort_order ?? 0,
    });
    setFormStatus(null);
  }

  async function uploadProductImage(kind: string, onUrl: (url: string) => void) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploadingIdx(kind);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json() as { url: string };
        onUrl(url);
      }
      setUploadingIdx(null);
    };
    input.click();
  }

  function handleProductNameChange(name: string) {
    setProductForm(f => f ? { ...f, name, slug: editingId ? f.slug : slugify(name) } : f);
  }

  async function saveProduct() {
    if (!productForm) return;
    setFormBusy(true); setFormStatus(null);

    const payload = {
      ...productForm,
      features: productForm.features.split("\n").map(s => s.trim()).filter(Boolean),
      images: productForm.images.filter(i => i.url.trim()),
      variants: productForm.variants.filter(v => v.name.trim()),
    };

    const url = editingId ? `/api/admin/store/products/${editingId}` : "/api/admin/store/products";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const data = await res.json() as { error?: string };

    if (res.ok) {
      setFormStatus({ ok: true, msg: editingId ? "Đã cập nhật sản phẩm." : "Đã tạo sản phẩm." });
      loadProducts();
      setTimeout(() => setProductForm(null), 800);
    } else {
      setFormStatus({ ok: false, msg: data.error ?? "Lỗi lưu sản phẩm." });
    }
    setFormBusy(false);
  }

  async function deleteProduct(p: Product) {
    setConfirmDelete(null);
    const res = await fetch(`/api/admin/store/products/${p.id}`, { method: "DELETE" });
    if (res.ok) setProducts(prev => prev.filter(x => x.id !== p.id));
  }

  const CATS = ["Tất cả", ...PRODUCT_CATEGORIES];
  const filtered = useMemo(() => products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === "Tất cả" || p.category === cat;
    return matchSearch && matchCat;
  }), [products, search, cat]);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
        <button type="button" onClick={openNewProduct} className="button-primary shrink-0 px-4 py-2 text-sm">
          + Thêm sản phẩm
        </button>
      </div>

      <div className="overflow-x-auto rounded-[20px] border border-[var(--border)]">
        <table className="w-full min-w-[780px] border-collapse text-left text-sm">
          <thead className="bg-[var(--surface-warm)]">
            <tr className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
              {["Tên sản phẩm", "Danh mục", "Giá", "Tồn kho", "Còn hàng", "Link", ""].map(h => (
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
                  {stockEditing?.id === p.id ? (
                    <input type="number" min={0} value={stockEditing.value} autoFocus
                      onChange={e => setStockEditing({ id: p.id, value: e.target.value })}
                      onBlur={() => saveStock(p.id)}
                      onKeyDown={e => { if (e.key === "Enter") saveStock(p.id); if (e.key === "Escape") setStockEditing(null); }}
                      className="w-20 rounded-[10px] border border-[var(--border)] bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]/30" />
                  ) : (
                    <button type="button" title="Click để chỉnh sửa"
                      onClick={() => setStockEditing({ id: p.id, value: String(p.stock_quantity) })}
                      className="rounded px-2 py-0.5 tabular-nums transition hover:bg-[var(--green-wash)]">
                      {p.stock_quantity}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={p.in_stock} disabled={patchingSaving === p.id}
                    onChange={e => patch(p.id, { in_stock: e.target.checked })}
                    className="h-4 w-4 cursor-pointer accent-[var(--green)]" />
                </td>
                <td className="px-4 py-3">
                  <a href={`/store/${p.slug}`} target="_blank" rel="noopener noreferrer"
                    className="text-[12px] text-[var(--green)] underline hover:opacity-70">Xem</a>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => openEditProduct(p)}
                      className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)]">
                      Sửa
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(p)}
                      className="rounded-full border border-red-200 px-2.5 py-1 text-[11px] text-red-500 transition hover:bg-red-50">
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-[var(--muted)]">Không tìm thấy sản phẩm</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm delete */}
      {confirmDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-sm rounded-[20px] bg-[var(--surface-card)] p-6 shadow-2xl">
            <h3 className="font-semibold text-[var(--foreground)]">Xác nhận xóa sản phẩm</h3>
            <p className="mt-2 text-[13px] text-[var(--muted)]">
              Xóa <strong>{confirmDelete.name}</strong>? Hành động này không thể hoàn tác.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDelete(null)} className="button-secondary px-4 py-2 text-sm">Hủy</button>
              <button type="button" onClick={() => deleteProduct(confirmDelete)}
                className="rounded-[12px] bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">
                Xóa
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Product form modal */}
      {productForm ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-8">
          <div className="relative mx-4 w-full max-w-2xl rounded-[24px] bg-[var(--surface-card)] shadow-2xl">
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[24px] border-b border-[var(--border)] bg-[var(--surface-card)] px-6 py-4">
              <h2 className="font-semibold text-[var(--foreground)]">{editingId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
              <button type="button" onClick={() => setProductForm(null)} className="rounded-full p-1.5 hover:bg-[var(--surface-warm)]">
                <X className="h-4 w-4 text-[var(--muted)]" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* Basic info */}
              <section>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Thông tin cơ bản</p>
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Tên sản phẩm *</label>
                    <input type="text" value={productForm.name}
                      onChange={e => handleProductNameChange(e.target.value)}
                      className={inputCls} placeholder="Tên sản phẩm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Slug</label>
                      <input type="text" value={productForm.slug}
                        onChange={e => setProductForm(f => f ? { ...f, slug: e.target.value } : f)}
                        className={`${inputCls} font-mono text-[13px]`} />
                    </div>
                    <div>
                      <label className={labelCls}>Danh mục</label>
                      <select value={productForm.category}
                        onChange={e => setProductForm(f => f ? { ...f, category: e.target.value } : f)}
                        className={inputCls}>
                        {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Subtitle</label>
                    <input type="text" value={productForm.subtitle}
                      onChange={e => setProductForm(f => f ? { ...f, subtitle: e.target.value } : f)}
                      className={inputCls} placeholder="Hộp 20 túi lọc, 50ml / chai..." />
                  </div>
                  <div>
                    <label className={labelCls}>Mô tả</label>
                    <textarea rows={3} value={productForm.description}
                      onChange={e => setProductForm(f => f ? { ...f, description: e.target.value } : f)}
                      className={`${inputCls} resize-none`} placeholder="Mô tả đầy đủ sản phẩm" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Giá (VND) *</label>
                      <input type="number" min={0} value={productForm.price_vnd}
                        onChange={e => setProductForm(f => f ? { ...f, price_vnd: Number(e.target.value) } : f)}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Tồn kho</label>
                      <input type="number" min={0} value={productForm.stock_quantity}
                        onChange={e => setProductForm(f => f ? { ...f, stock_quantity: Number(e.target.value) } : f)}
                        className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Sort order</label>
                      <input type="number" value={productForm.sort_order}
                        onChange={e => setProductForm(f => f ? { ...f, sort_order: Number(e.target.value) } : f)}
                        className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Features (mỗi dòng một feature)</label>
                    <textarea rows={3} value={productForm.features}
                      onChange={e => setProductForm(f => f ? { ...f, features: e.target.value } : f)}
                      className={`${inputCls} resize-none font-mono text-[13px]`}
                      placeholder={"Thư giãn tinh thần\nHỗ trợ ngủ sâu\nGiảm căng thẳng"} />
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                    <input type="checkbox" checked={productForm.in_stock}
                      onChange={e => setProductForm(f => f ? { ...f, in_stock: e.target.checked } : f)}
                      className="h-4 w-4 accent-[var(--green)]" />
                    Còn hàng
                  </label>
                </div>
              </section>

              {/* Banner image */}
              <section>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Ảnh banner chính</p>
                <div className="rounded-[16px] border-2 border-dashed border-[var(--border)] p-4">
                  {productForm.image_url ? (
                    <div className="relative mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={productForm.image_url} alt="Banner" className="h-48 w-full rounded-[12px] object-cover" />
                      <button type="button"
                        onClick={() => setProductForm(f => f ? { ...f, image_url: "" } : f)}
                        className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="mb-3 flex h-32 items-center justify-center rounded-[12px] bg-[var(--surface-warm)]">
                      <div className="text-center text-[var(--muted)]">
                        <ImagePlus className="mx-auto mb-1 h-8 w-8 opacity-40" />
                        <p className="text-[12px]">Chưa có ảnh banner</p>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input type="text" value={productForm.image_url}
                      onChange={e => setProductForm(f => f ? { ...f, image_url: e.target.value } : f)}
                      placeholder="Paste URL hoặc tải ảnh lên..."
                      className={`${inputCls} flex-1 text-[13px]`} />
                    <button type="button"
                      disabled={uploadingIdx === "banner"}
                      onClick={() => uploadProductImage("banner", url => setProductForm(f => f ? { ...f, image_url: url } : f))}
                      className="flex shrink-0 items-center gap-1.5 rounded-[12px] border border-[var(--border)] px-3 py-2 text-[13px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)] disabled:opacity-50">
                      {uploadingIdx === "banner" ? <Upload className="h-4 w-4 animate-bounce" /> : <Upload className="h-4 w-4" />}
                      {uploadingIdx === "banner" ? "Đang tải…" : "Upload"}
                    </button>
                  </div>
                </div>
              </section>

              {/* Gallery images */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Thư viện ảnh ({productForm.images.length})</p>
                  <button type="button"
                    disabled={uploadingIdx?.startsWith("gallery")}
                    onClick={() => uploadProductImage("gallery-new", url => setProductForm(f => f ? { ...f, images: [...f.images, { url, label: "" }] } : f))}
                    className="flex items-center gap-1.5 rounded-[10px] border border-[var(--border)] px-3 py-1.5 text-[12px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)] disabled:opacity-50">
                    <ImagePlus className="h-3.5 w-3.5" />
                    Thêm ảnh
                  </button>
                </div>
                {productForm.images.length === 0 ? (
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-[var(--border)] py-8 text-[13px] text-[var(--muted)] transition hover:border-[var(--green)]/40 hover:text-[var(--green-deep)]"
                    onClick={() => uploadProductImage("gallery-new", url => setProductForm(f => f ? { ...f, images: [...f.images, { url, label: "" }] } : f))}>
                    <ImagePlus className="mb-2 h-6 w-6 opacity-40" />
                    Click hoặc kéo thả ảnh vào đây
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {productForm.images.map((img, idx) => (
                      <div key={idx} className="group relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={img.label || `Ảnh ${idx + 1}`}
                          className="h-24 w-full rounded-[12px] object-cover" />
                        <button type="button"
                          onClick={() => setProductForm(f => f ? { ...f, images: f.images.filter((_, i) => i !== idx) } : f)}
                          className="absolute right-1.5 top-1.5 hidden rounded-full bg-black/60 p-1 text-white group-hover:flex">
                          <X className="h-3 w-3" />
                        </button>
                        <input
                          type="text" value={img.label}
                          onChange={e => setProductForm(f => f ? { ...f, images: f.images.map((im, i) => i === idx ? { ...im, label: e.target.value } : im) } : f)}
                          placeholder="Nhãn ảnh (tuỳ chọn)"
                          className="mt-1.5 w-full rounded-[8px] border border-[var(--border)] bg-[var(--surface-card)] px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-[var(--green)]/30" />
                      </div>
                    ))}
                    {/* Add more slot */}
                    <button type="button"
                      onClick={() => uploadProductImage("gallery-add", url => setProductForm(f => f ? { ...f, images: [...f.images, { url, label: "" }] } : f))}
                      className="flex h-24 items-center justify-center rounded-[12px] border-2 border-dashed border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--green)]/40 hover:text-[var(--green-deep)]">
                      <ImagePlus className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </section>

              {/* Variants */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Phân loại hàng ({productForm.variants.length})</p>
                    <p className="mt-0.5 text-[11px] text-[var(--muted)]">Ví dụ: Mùi Lavender, Bergamot… Mỗi loại có ảnh riêng</p>
                  </div>
                  <button type="button"
                    onClick={() => setProductForm(f => f ? { ...f, variants: [...f.variants, { name: "", image_url: "" }] } : f)}
                    className="flex items-center gap-1.5 rounded-[10px] border border-[var(--border)] px-3 py-1.5 text-[12px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)]">
                    + Thêm loại
                  </button>
                </div>
                {productForm.variants.length === 0 ? (
                  <div className="rounded-[14px] border border-dashed border-[var(--border)] py-6 text-center text-[13px] text-[var(--muted)]">
                    Sản phẩm này không có phân loại — bỏ qua nếu không cần
                  </div>
                ) : (
                  <div className="space-y-3">
                    {productForm.variants.map((variant, idx) => (
                      <div key={idx} className="flex gap-3 rounded-[14px] border border-[var(--border)] bg-[var(--surface-warm)] p-3">
                        {/* Variant image */}
                        <div className="shrink-0">
                          {variant.image_url ? (
                            <div className="relative h-16 w-16">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={variant.image_url} alt={variant.name}
                                className="h-16 w-16 rounded-[10px] object-cover" />
                              <button type="button"
                                onClick={() => setProductForm(f => f ? { ...f, variants: f.variants.map((v, i) => i === idx ? { ...v, image_url: "" } : v) } : f)}
                                className="absolute -right-1 -top-1 rounded-full bg-black/60 p-0.5 text-white">
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ) : (
                            <button type="button"
                              disabled={uploadingIdx === `var-${idx}`}
                              onClick={() => uploadProductImage(`var-${idx}`, url => setProductForm(f => f ? { ...f, variants: f.variants.map((v, i) => i === idx ? { ...v, image_url: url } : v) } : f))}
                              className="flex h-16 w-16 flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--green)]/40 hover:text-[var(--green-deep)]">
                              {uploadingIdx === `var-${idx}` ? <Upload className="h-4 w-4 animate-bounce" /> : <ImagePlus className="h-4 w-4" />}
                              <span className="mt-0.5 text-[9px]">Ảnh</span>
                            </button>
                          )}
                        </div>
                        {/* Variant name */}
                        <div className="flex flex-1 items-center gap-2">
                          <input type="text" value={variant.name}
                            onChange={e => setProductForm(f => f ? { ...f, variants: f.variants.map((v, i) => i === idx ? { ...v, name: e.target.value } : v) } : f)}
                            placeholder="Tên phân loại (vd: Lavender, Size M...)"
                            className={`${inputCls} flex-1`} />
                          {variant.image_url && (
                            <button type="button"
                              disabled={uploadingIdx === `var-${idx}`}
                              onClick={() => uploadProductImage(`var-${idx}`, url => setProductForm(f => f ? { ...f, variants: f.variants.map((v, i) => i === idx ? { ...v, image_url: url } : v) } : f))}
                              className="flex shrink-0 items-center gap-1 rounded-[10px] border border-[var(--border)] px-2 py-1.5 text-[11px] text-[var(--muted)] hover:text-[var(--green-deep)]">
                              <Upload className="h-3 w-3" /> Đổi ảnh
                            </button>
                          )}
                          <button type="button"
                            onClick={() => setProductForm(f => f ? { ...f, variants: f.variants.filter((_, i) => i !== idx) } : f)}
                            className="shrink-0 rounded-full p-1.5 text-[var(--muted)] hover:bg-red-50 hover:text-red-500">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center justify-between gap-4 rounded-b-[24px] border-t border-[var(--border)] bg-[var(--surface-card)] px-6 py-4">
              <div className="flex-1">
                {formStatus && (
                  <p className={`rounded-[10px] px-3 py-2 text-[13px] ${formStatus.ok ? "bg-[var(--green-wash)] text-[var(--green-deep)]" : "bg-red-50 text-red-600"}`}>
                    {formStatus.msg}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-3">
                <button type="button" onClick={() => setProductForm(null)} className="button-secondary px-4 py-2 text-sm">Hủy</button>
                <button type="button" onClick={saveProduct} disabled={formBusy || !productForm.name}
                  className="button-primary px-4 py-2 text-sm disabled:opacity-60">
                  {formBusy ? "Đang lưu…" : (editingId ? "Cập nhật" : "Tạo sản phẩm")}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ─── Tab: Blog ───────────────────────────────────────────────────────────────

const EMPTY_BLOG: BlogForm = {
  slug: "", title: "", excerpt: "", content: "",
  category: "Wellbeing", emoji: "📝",
  cover_color: "linear-gradient(135deg,#e0f2e9,#b8dfc8)", read_time: 3, published: false,
  cover_image_url: "",
};

const COVER_PRESETS = [
  "linear-gradient(135deg,#e0f2e9,#b8dfc8)",
  "linear-gradient(135deg,#fef3c7,#fde68a)",
  "linear-gradient(135deg,#e0e7ff,#c7d2fe)",
  "linear-gradient(135deg,#fce7f3,#fbcfe8)",
  "linear-gradient(135deg,#f0fdf4,#bbf7d0)",
  "linear-gradient(135deg,#fff7ed,#fed7aa)",
];

function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [form, setForm] = useState<BlogForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  const loadPosts = useCallback(() => {
    fetch("/api/blog/admin/list").then(r => r.json())
      .then(d => setPosts(d.posts ?? [])).catch(() => setPosts([]));
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  function openNew() { setForm({ ...EMPTY_BLOG }); }
  function openEdit(p: BlogPost) {
    setForm({
      id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt,
      content: "", category: p.category, emoji: p.emoji,
      cover_color: p.cover_color, read_time: p.read_time, published: p.published,
      cover_image_url: "",
    });
  }

  function handleTitleChange(title: string) {
    setForm(f => f ? { ...f, title, slug: slugify(title) } : f);
  }

  async function uploadCoverImage(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json() as { url: string };
      setForm(f => f ? { ...f, cover_image_url: url } : f);
      showToast("Tải ảnh lên thành công!");
    } else {
      showToast("Lỗi tải ảnh lên.");
    }
    setUploading(false);
  }

  async function savePost() {
    if (!form) return;
    setSaving(true);
    const res = await fetch("/api/blog/admin", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    if (res.ok) { showToast(form.id ? "Đã cập nhật bài viết" : "Đã tạo bài viết"); setForm(null); loadPosts(); }
    else { const d = await res.json() as { error?: string }; showToast(d.error ?? "Lỗi lưu bài viết"); }
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
            <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[10px] text-xl"
              style={{ background: p.cover_color }}>
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

      {/* Blog form modal — Notion-style */}
      {form ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm">
          <div className="relative mx-4 my-8 w-full max-w-3xl rounded-[28px] bg-[var(--surface-card)] shadow-[0_32px_80px_rgba(0,0,0,0.25)]">

            {/* ── Cover banner zone ─────────────────────────── */}
            <div className="relative overflow-hidden rounded-t-[28px]">
              {form.cover_image_url ? (
                /* Photo cover */
                <div className="group relative h-52">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.cover_image_url} alt="Ảnh bìa"
                    className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                  {/* floating action bar */}
                  <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
                    <button type="button" disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm hover:bg-black/80">
                      <Upload className="h-3.5 w-3.5" />
                      {uploading ? "Đang tải…" : "Đổi ảnh"}
                    </button>
                    <button type="button"
                      onClick={() => setForm(f => f ? { ...f, cover_image_url: "" } : f)}
                      className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur-sm hover:bg-red-700">
                      <X className="h-3.5 w-3.5" />
                      Xóa ảnh
                    </button>
                  </div>
                </div>
              ) : (
                /* Gradient + drag-drop cover */
                <div
                  className="group relative flex h-44 cursor-pointer flex-col items-center justify-center transition"
                  style={{ background: form.cover_color }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void uploadCoverImage(f); }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 transition group-hover:opacity-100">
                    <div className="flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 text-white backdrop-blur-sm">
                      <ImagePlus className="h-4 w-4" />
                      <span className="text-[13px] font-medium">
                        {uploading ? "Đang tải ảnh lên…" : "Thêm ảnh bìa — kéo thả hoặc click"}
                      </span>
                    </div>
                  </div>
                  {/* Emoji preview */}
                  <span className="text-5xl opacity-80">{form.emoji || "📝"}</span>
                </div>
              )}

              {/* Color presets bar — shown when no photo */}
              {!form.cover_image_url && (
                <div className="flex items-center gap-2 border-t border-white/20 bg-black/5 px-4 py-2">
                  <span className="text-[11px] font-medium text-[var(--muted)]">Màu nền:</span>
                  <div className="flex gap-1.5">
                    {COVER_PRESETS.map(preset => (
                      <button key={preset} type="button"
                        onClick={() => setForm(f => f ? { ...f, cover_color: preset } : f)}
                        className={`h-6 w-6 rounded-full border-2 transition ${form.cover_color === preset ? "border-[var(--green)] scale-110" : "border-white/40 hover:border-white"}`}
                        style={{ background: preset }} />
                    ))}
                    <label className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-2 border-white/40 bg-white/20 text-[10px] font-bold text-white hover:border-white"
                      title="Màu tuỳ chỉnh">
                      #
                      <input type="color" className="absolute h-0 w-0 opacity-0"
                        onChange={e => setForm(f => f ? { ...f, cover_color: e.target.value } : f)} />
                    </label>
                  </div>
                  <button type="button" disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="ml-auto flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-3 py-1 text-[11px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)]">
                    <ImagePlus className="h-3 w-3" />
                    {uploading ? "Đang tải…" : "Upload ảnh bìa"}
                  </button>
                </div>
              )}
            </div>

            {/* hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) void uploadCoverImage(f); e.target.value = ""; }} />

            {/* ── Page body ────────────────────────────────── */}
            <div className="px-8 pb-0 pt-6">
              {/* Emoji + close */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <input type="text" value={form.emoji}
                    onChange={e => setForm(f => f ? { ...f, emoji: e.target.value } : f)}
                    className="w-14 rounded-[10px] border border-transparent bg-transparent text-3xl outline-none hover:border-[var(--border)] hover:bg-[var(--surface-warm)] focus:border-[var(--border)] focus:bg-[var(--surface-warm)]"
                    maxLength={4} title="Emoji đại diện" />
                  <div>
                    <select value={form.category} onChange={e => setForm(f => f ? { ...f, category: e.target.value } : f)}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface-warm)] px-3 py-1 text-[12px] text-[var(--muted)] outline-none">
                      {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button type="button" onClick={() => setForm(null)}
                  className="rounded-full p-1.5 hover:bg-[var(--surface-warm)]">
                  <X className="h-4 w-4 text-[var(--muted)]" />
                </button>
              </div>

              {/* Title */}
              <input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)}
                placeholder="Tiêu đề bài viết..."
                className="w-full bg-transparent text-[28px] font-bold text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/50" />

              {/* Meta row */}
              <div className="mt-3 flex flex-wrap items-center gap-3 border-b border-[var(--border)] pb-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] text-[var(--muted)]">Slug:</span>
                  <input type="text" value={form.slug} onChange={e => setForm(f => f ? { ...f, slug: e.target.value } : f)}
                    className="rounded-[8px] border border-transparent bg-[var(--surface-warm)] px-2 py-0.5 font-mono text-[12px] text-[var(--muted)] outline-none focus:border-[var(--border)]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] text-[var(--muted)]">Đọc:</span>
                  <input type="number" min={1} value={form.read_time}
                    onChange={e => setForm(f => f ? { ...f, read_time: Number(e.target.value) } : f)}
                    className="w-14 rounded-[8px] border border-transparent bg-[var(--surface-warm)] px-2 py-0.5 text-[12px] text-[var(--muted)] outline-none focus:border-[var(--border)]" />
                  <span className="text-[12px] text-[var(--muted)]">phút</span>
                </div>
                <label className="flex cursor-pointer items-center gap-1.5 text-[12px]">
                  <input type="checkbox" checked={form.published}
                    onChange={e => setForm(f => f ? { ...f, published: e.target.checked } : f)}
                    className="h-3.5 w-3.5 accent-[var(--green)]" />
                  <span className={form.published ? "font-semibold text-[var(--green-deep)]" : "text-[var(--muted)]"}>
                    {form.published ? "Đã xuất bản" : "Bản nháp"}
                  </span>
                </label>
              </div>

              {/* Excerpt */}
              <div className="mt-4">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Tóm tắt *</p>
                <textarea rows={2} value={form.excerpt} onChange={e => setForm(f => f ? { ...f, excerpt: e.target.value } : f)}
                  placeholder="Mô tả ngắn hiển thị trên trang danh sách bài viết..."
                  className="w-full resize-none bg-transparent text-[14px] leading-relaxed text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/50" />
              </div>

              {/* Content */}
              <div className="mt-2">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Nội dung (Markdown)</p>
                <textarea rows={14} value={form.content} onChange={e => setForm(f => f ? { ...f, content: e.target.value } : f)}
                  placeholder="Bắt đầu viết... hỗ trợ **Markdown**, ## Tiêu đề, - Danh sách, > Trích dẫn..."
                  className={`w-full resize-y rounded-[14px] border border-[var(--border)] bg-[var(--surface-warm)] p-4 font-mono text-[13px] leading-relaxed text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--green)]/20 placeholder:text-[var(--muted)]/40`} />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center justify-between gap-4 rounded-b-[28px] border-t border-[var(--border)] bg-[var(--surface-card)] px-8 py-4">
              <p className="text-[12px] text-[var(--muted)]">{form.id ? "Chỉnh sửa bài viết" : "Bài viết mới"}</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setForm(null)} className="button-secondary px-4 py-2 text-sm">Hủy</button>
                <button type="button" onClick={savePost} disabled={saving || !form.title || !form.excerpt}
                  className="button-primary px-4 py-2 text-sm disabled:opacity-60">
                  {saving ? "Đang lưu…" : (form.id ? "Cập nhật" : "Xuất bản")}
                </button>
              </div>
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
    const d = await res.json() as { error?: string };
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
