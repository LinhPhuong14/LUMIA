"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3, BookOpen, Box, ChevronRight, Film, ImagePlus, LayoutDashboard,
  Package, ShoppingBag, Upload, Users, Video, X, Edit2, Plus,
} from "lucide-react";

import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { RichEditor } from "@/components/admin/rich-editor";
import { getSubscriptionStatusLabel } from "@/lib/subscription-labels";
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

async function signedUpload(signedUrl: string, file: File): Promise<boolean> {
  const fd = new FormData();
  fd.append("cacheControl", "3600");
  fd.append("", file);
  const res = await fetch(signedUrl, { method: "PUT", body: fd, headers: { "x-upsert": "false" } });
  return res.ok;
}

// Resize + compress image to stay under targetMB at maxPx wide/tall.
// Returns a new File of type image/webp (or image/jpeg for JPEG inputs).
async function compressImage(file: File, maxPx = 1920, targetMB = 4): Promise<File> {
  const targetBytes = targetMB * 1024 * 1024;
  if (file.size <= targetBytes && !file.type.includes("png")) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        const ratio = Math.min(maxPx / width, maxPx / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);

      const outType = file.type === "image/png" ? "image/webp" : file.type;
      const ext = outType === "image/webp" ? "webp" : "jpg";
      // Try progressively lower quality until under target
      let quality = 0.85;
      const tryCompress = () => {
        canvas.toBlob((blob) => {
          if (!blob) { resolve(file); return; }
          if (blob.size <= targetBytes || quality <= 0.4) {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), { type: outType }));
          } else {
            quality -= 0.1;
            tryCompress();
          }
        }, outType, quality);
      };
      tryCompress();
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

// Returns an error string if the media file exceeds Supabase free-tier limit (50 MB).
function validateMediaSize(file: File): string | null {
  const MB = file.size / (1024 * 1024);
  if (MB > 50) return `File quá lớn (${MB.toFixed(1)} MB). Giới hạn tối đa 50 MB.`;
  return null;
}

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
        </ul>
      </div>
    </div>
  );
}

// ─── Tab: Người dùng ─────────────────────────────────────────────────────────

function ResetPasswordSection({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleReset() {
    if (pw.length < 8) { setMsg({ ok: false, text: "Mật khẩu phải có ít nhất 8 ký tự." }); return; }
    setBusy(true); setMsg(null);
    const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }),
    });
    const data = await res.json() as { error?: string };
    if (res.ok) {
      setMsg({ ok: true, text: "Đã đặt lại mật khẩu thành công." });
      setPw(""); setOpen(false);
    } else {
      setMsg({ ok: false, text: data.error ?? "Thất bại." });
    }
    setBusy(false);
  }

  return (
    <div className="border-t border-[var(--border)] pt-3">
      {!open ? (
        <button type="button" onClick={() => { setOpen(true); setMsg(null); }}
          className="w-full rounded-[12px] border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] font-medium text-amber-700 transition hover:bg-amber-100">
          🔑 Đặt lại mật khẩu thủ công
        </button>
      ) : (
        <div className="space-y-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-700">Đặt mật khẩu mới</p>
          <p className="text-[12px] text-[var(--muted)]">Dùng khi email tự động không gửi được. Thông báo cho user sau khi đặt.</p>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="Tối thiểu 8 ký tự"
              className={`${inputCls} pr-14`}
            />
            <button type="button" onClick={() => setShow(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[var(--muted)] hover:text-[var(--foreground)]">
              {show ? "Ẩn" : "Hiện"}
            </button>
          </div>
          {pw && pw.length < 8 && (
            <p className="text-[12px] text-red-500">Còn thiếu {8 - pw.length} ký tự.</p>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => { setOpen(false); setPw(""); setMsg(null); }}
              className="button-secondary flex-1 py-2 text-sm">Hủy</button>
            <button type="button" onClick={handleReset} disabled={busy || pw.length < 8}
              className="flex-1 rounded-[12px] bg-amber-500 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-50">
              {busy ? "Đang lưu…" : "Xác nhận"}
            </button>
          </div>
        </div>
      )}
      {msg && (
        <p className={`mt-2 rounded-[10px] px-3 py-2 text-[12px] ${msg.ok ? "bg-[var(--green-wash)] text-[var(--green-deep)]" : "bg-red-50 text-red-600"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}

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

                {/* Manual password reset */}
                <ResetPasswordSection userId={selected.id} />
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

  async function uploadOneImage(raw: File): Promise<string | null> {
    const file = await compressImage(raw);
    const urlRes = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    if (!urlRes.ok) return null;
    const { signedUrl, publicUrl } = await urlRes.json() as { signedUrl: string; publicUrl: string };
    return await signedUpload(signedUrl, file) ? publicUrl : null;
  }

  async function uploadProductImage(kind: string, onUrl: (url: string) => void) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = async () => {
      const raw = input.files?.[0];
      if (!raw) return;
      setUploadingIdx(kind);
      const url = await uploadOneImage(raw);
      if (url) onUrl(url);
      setUploadingIdx(null);
    };
    input.click();
  }

  async function uploadGalleryImages(files: File[]) {
    if (!files.length) return;
    setUploadingIdx("gallery");
    const results = await Promise.all(files.map(f => uploadOneImage(f)));
    const urls = results.filter((u): u is string => !!u);
    if (urls.length) {
      setProductForm(f => f ? { ...f, images: [...f.images, ...urls.map(url => ({ url, label: "" }))] } : f);
    }
    setUploadingIdx(null);
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

      {/* Product form side panel */}
      {productForm ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30"
          onClick={e => { if (e.target === e.currentTarget) setProductForm(null); }}>
          <div className="relative flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-[var(--surface-card)] shadow-2xl">
            {/* Panel header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-card)] px-6 py-4">
              <h2 className="font-semibold text-[var(--foreground)]">{editingId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}</h2>
              <button type="button" onClick={() => setProductForm(null)} className="rounded-full p-1.5 hover:bg-[var(--surface-warm)]">
                <X className="h-4 w-4 text-[var(--muted)]" />
              </button>
            </div>

            {/* Live card preview */}
            <div className="border-b border-[var(--border)] bg-[var(--surface-warm)] px-6 py-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Xem trước thẻ sản phẩm</p>
              <div className="overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface-card)] shadow-sm" style={{ maxWidth: 220 }}>
                <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--green-wash)] to-[var(--surface)]">
                  {productForm.image_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={productForm.image_url} alt={productForm.name || "Sản phẩm"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-4xl leading-none" style={{ filter: "saturate(0.7) opacity(0.5)" }}>
                        {({ drink: "🍵", scent: "🕯️", sleep: "🌙", meditation: "✨", wellness: "🌿" } as Record<string, string>)[productForm.category] ?? "🌿"}
                      </span>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--green-deep)] opacity-40">
                        {productForm.category || "Sản phẩm"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-[13px] font-medium text-[var(--foreground)]">{productForm.name || "Tên sản phẩm"}</p>
                  {productForm.subtitle && <p className="mt-0.5 truncate text-[11px] text-[var(--muted)]">{productForm.subtitle}</p>}
                  <p className="mt-1.5 text-[13px] font-bold text-[var(--foreground)]">
                    {productForm.price_vnd > 0 ? productForm.price_vnd.toLocaleString("vi-VN") + " ₫" : "—"}
                  </p>
                </div>
              </div>
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
                      <label className={labelCls}>Thứ tự hiển thị</label>
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
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                    Thư viện ảnh ({productForm.images.length})
                  </p>
                  <button type="button"
                    disabled={uploadingIdx === "gallery"}
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file"; input.multiple = true;
                      input.accept = "image/jpeg,image/png,image/webp";
                      input.onchange = () => { if (input.files) uploadGalleryImages(Array.from(input.files)); };
                      input.click();
                    }}
                    className="flex items-center gap-1.5 rounded-[10px] border border-[var(--border)] px-3 py-1.5 text-[12px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)] disabled:opacity-50">
                    {uploadingIdx === "gallery" ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--green)] border-t-transparent" />
                    ) : (
                      <ImagePlus className="h-3.5 w-3.5" />
                    )}
                    {uploadingIdx === "gallery" ? "Đang tải…" : "Thêm nhiều ảnh"}
                  </button>
                </div>
                {productForm.images.length === 0 ? (
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center rounded-[14px] border-2 border-dashed border-[var(--border)] py-8 text-[13px] text-[var(--muted)] transition hover:border-[var(--green)]/40 hover:text-[var(--green-deep)]"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file"; input.multiple = true;
                      input.accept = "image/jpeg,image/png,image/webp";
                      input.onchange = () => { if (input.files) uploadGalleryImages(Array.from(input.files)); };
                      input.click();
                    }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                      uploadGalleryImages(files);
                    }}>
                    {uploadingIdx === "gallery" ? (
                      <span className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-[var(--green)] border-t-transparent" />
                    ) : (
                      <ImagePlus className="mb-2 h-6 w-6 opacity-40" />
                    )}
                    {uploadingIdx === "gallery" ? "Đang tải lên…" : "Click hoặc kéo thả nhiều ảnh vào đây"}
                  </div>
                ) : (
                  <div
                    className="grid grid-cols-3 gap-3"
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                      e.preventDefault();
                      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                      uploadGalleryImages(files);
                    }}>
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
                    <button type="button" disabled={uploadingIdx === "gallery"}
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file"; input.multiple = true;
                        input.accept = "image/jpeg,image/png,image/webp";
                        input.onchange = () => { if (input.files) uploadGalleryImages(Array.from(input.files)); };
                        input.click();
                      }}
                      className="flex h-24 items-center justify-center rounded-[12px] border-2 border-dashed border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--green)]/40 hover:text-[var(--green-deep)] disabled:opacity-40">
                      {uploadingIdx === "gallery"
                        ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--green)] border-t-transparent" />
                        : <ImagePlus className="h-5 w-5" />}
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
            <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-[var(--border)] bg-[var(--surface-card)] px-6 py-4">
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

  async function uploadCoverImage(raw: File) {
    setUploading(true);
    const file = await compressImage(raw);
    const urlRes = await fetch("/api/admin/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    if (urlRes.ok) {
      const { signedUrl, publicUrl } = await urlRes.json() as { signedUrl: string; publicUrl: string };
      if (await signedUpload(signedUrl, file)) {
        setForm(f => f ? { ...f, cover_image_url: publicUrl } : f);
        showToast("Tải ảnh lên thành công!");
      } else {
        showToast("Lỗi tải ảnh lên.");
      }
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

      {/* Blog form — right-side panel */}
      {form ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setForm(null); }}>
          <div className="relative flex h-full w-full max-w-3xl flex-col overflow-y-auto bg-[var(--surface-card)] shadow-[0_32px_80px_rgba(0,0,0,0.25)]">

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
                  className="relative flex h-44 cursor-pointer flex-col items-center justify-center transition"
                  style={{ background: form.cover_color }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void uploadCoverImage(f); }}
                >
                  {/* Always-visible upload CTA */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                    <span className="text-5xl opacity-70">{form.emoji || "📝"}</span>
                    <div className="flex items-center gap-2 rounded-full bg-black/35 px-4 py-2 text-white backdrop-blur-sm shadow">
                      {uploading
                        ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        : <ImagePlus className="h-3.5 w-3.5" />}
                      <span className="text-[12px] font-medium">
                        {uploading ? "Đang tải ảnh lên…" : "Click hoặc kéo thả ảnh bìa vào đây"}
                      </span>
                    </div>
                  </div>
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
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Nội dung</p>
                <RichEditor
                  value={form.content}
                  onChange={html => setForm(f => f ? { ...f, content: html } : f)}
                  onImageUpload={async (raw) => {
                    const file = await compressImage(raw);
                    const urlRes = await fetch("/api/admin/upload-url", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ filename: file.name, contentType: file.type }),
                    });
                    if (!urlRes.ok) return "";
                    const { signedUrl, publicUrl } = await urlRes.json() as { signedUrl: string; publicUrl: string };
                    return await signedUpload(signedUrl, file) ? publicUrl : "";
                  }}
                  placeholder="Bắt đầu viết nội dung bài viết..."
                  minHeight={360}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-[var(--border)] bg-[var(--surface-card)] px-8 py-4">
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

type Plan = {
  id: string; name: string; description?: string | null; group_name: string;
  price_vnd: number; duration_months: number; has_physical_box: boolean;
  physical_box_type?: string | null; box_image_url?: string | null;
  discount_percent: number; is_featured: boolean;
  is_first_time_only: boolean; is_active: boolean; features: string[]; sort_order: number;
};

type PlanForm = Omit<Plan, "features"> & { features: string };

const EMPTY_PLAN: PlanForm = {
  id: "", name: "", description: "", group_name: "digital",
  price_vnd: 0, duration_months: 1, has_physical_box: false,
  physical_box_type: "", box_image_url: "", discount_percent: 0, is_featured: false,
  is_first_time_only: false, is_active: true, features: "", sort_order: 0,
};

function PlansTab() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState<PlanForm | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Plan | null>(null);
  const [uploadingBox, setUploadingBox] = useState(false);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  const loadPlans = useCallback(() => {
    fetch("/api/admin/plans").then(r => r.json()).then(d => setPlans(Array.isArray(d) ? d : [])).catch(() => setPlans([]));
  }, []);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  function openNew() {
    setIsNew(true);
    setForm({ ...EMPTY_PLAN, id: `plan_${Date.now()}` });
  }

  function openEdit(p: Plan) {
    setIsNew(false);
    setForm({ ...p, features: p.features.join("\n"), box_image_url: p.box_image_url ?? "" });
  }

  async function uploadBoxImage() {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/jpeg,image/png,image/webp";
    input.onchange = async () => {
      const raw = input.files?.[0]; if (!raw) return;
      setUploadingBox(true);
      const file = await compressImage(raw);
      const urlRes = await fetch("/api/admin/upload-url", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (urlRes.ok) {
        const { signedUrl, publicUrl } = await urlRes.json() as { signedUrl: string; publicUrl: string };
        if (await signedUpload(signedUrl, file)) setForm(f => f ? { ...f, box_image_url: publicUrl } : f);
      }
      setUploadingBox(false);
    };
    input.click();
  }

  async function savePlan() {
    if (!form) return;
    setBusy(true);
    const payload = { ...form, features: form.features.split("\n").map(s => s.trim()).filter(Boolean) };
    const url = isNew ? "/api/admin/plans" : `/api/admin/plans/${form.id}`;
    const method = isNew ? "POST" : "PUT";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { showToast(isNew ? "Đã tạo gói." : "Đã cập nhật."); setForm(null); loadPlans(); }
    else { const d = await res.json() as { error?: string }; showToast(d.error ?? "Lỗi lưu."); }
    setBusy(false);
  }

  async function deletePlan(p: Plan) {
    setConfirmDelete(null);
    const res = await fetch(`/api/admin/plans/${p.id}`, { method: "DELETE" });
    if (res.ok) { setPlans(prev => prev.filter(x => x.id !== p.id)); showToast("Đã xóa."); }
    else showToast("Xóa thất bại.");
  }

  const groupColor: Record<string, string> = {
    promo: "bg-blue-50 text-blue-700",
    digital: "bg-[var(--green-wash)] text-[var(--green-deep)]",
    hybrid: "bg-amber-50 text-amber-700",
  };
  const groupLabel: Record<string, string> = {
    promo: "Khuyến mãi", digital: "Gói số", hybrid: "Kèm hộp",
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[13px] text-[var(--muted)]">{plans.length} gói dịch vụ</span>
        <button type="button" onClick={openNew} className="button-primary px-4 py-2 text-sm">+ Thêm gói mới</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map(p => (
          <div key={p.id} className={`soft-card relative p-5 ${p.is_featured ? "ring-2 ring-[var(--green)]" : ""} ${!p.is_active ? "opacity-50" : ""}`}>
            <div className="absolute right-3 top-3 flex gap-1.5">
              <button type="button" onClick={() => openEdit(p)}
                className="rounded-full p-1.5 hover:bg-[var(--surface-warm)] text-[var(--muted)] hover:text-[var(--green-deep)]">
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => setConfirmDelete(p)}
                className="rounded-full p-1.5 hover:bg-red-50 text-[var(--muted)] hover:text-red-500">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="pr-14">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${groupColor[p.group_name] ?? "bg-[var(--surface-warm)] text-[var(--muted)]"}`}>
                {groupLabel[p.group_name] ?? p.group_name}
              </span>
              <h3 className="mt-1.5 font-semibold text-[var(--foreground)]">{p.name}</h3>
            </div>
            <div className="mt-3 text-2xl font-bold text-[var(--foreground)]">{formatCurrency(p.price_vnd)}</div>
            <div className="mt-0.5 text-[12px] text-[var(--muted)]">
              {p.duration_months} tháng
              {p.discount_percent > 0 && ` · Tiết kiệm ${p.discount_percent}%`}
            </div>
            {p.has_physical_box && p.box_image_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={p.box_image_url} alt="Ảnh hộp" className="mt-3 h-24 w-full rounded-[10px] object-cover" />
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {p.is_featured && <span className="rounded-full bg-[var(--green-wash)] px-2 py-0.5 text-[10px] font-bold text-[var(--green-deep)]">Nổi bật</span>}
              {p.has_physical_box && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700">Hộp vật lý</span>}
              {p.is_first_time_only && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700">Người dùng mới</span>}
              {!p.is_active && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-500">Ẩn</span>}
            </div>
          </div>
        ))}
        <button type="button" onClick={openNew}
          className="flex min-h-[140px] flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--green)]/40 hover:text-[var(--green-deep)]">
          <Plus className="mb-1 h-5 w-5" />
          <span className="text-[13px]">Thêm gói mới</span>
        </button>
      </div>

      {toast && <div className="mt-4 rounded-[12px] bg-[var(--green-wash)] px-4 py-2 text-[13px] text-[var(--green-deep)]">{toast}</div>}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="mx-4 w-full max-w-sm rounded-[24px] bg-[var(--surface-card)] p-6 shadow-2xl">
            <p className="font-semibold">Xóa gói "{confirmDelete.name}"?</p>
            <p className="mt-1 text-[13px] text-[var(--muted)]">Hành động này không thể hoàn tác.</p>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setConfirmDelete(null)} className="button-secondary flex-1 py-2 text-sm">Hủy</button>
              <button type="button" onClick={() => deletePlan(confirmDelete)}
                className="flex-1 rounded-[12px] bg-red-500 py-2 text-sm font-medium text-white hover:bg-red-600">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Plan form side panel */}
      {form && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30"
          onClick={e => { if (e.target === e.currentTarget) setForm(null); }}>
          <div className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-[var(--surface-card)] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-card)] px-6 py-4">
              <h2 className="font-semibold">{isNew ? "Thêm gói mới" : "Chỉnh sửa gói"}</h2>
              <button type="button" onClick={() => setForm(null)} className="rounded-full p-1.5 hover:bg-[var(--surface-warm)]">
                <X className="h-4 w-4 text-[var(--muted)]" />
              </button>
            </div>

            <div className="flex-1 space-y-4 p-6">
              <div>
                <label className={labelCls}>ID (slug) *</label>
                <input type="text" value={form.id}
                  onChange={e => setForm(f => f ? { ...f, id: e.target.value } : f)}
                  disabled={!isNew}
                  className={`${inputCls} ${!isNew ? "opacity-60" : ""}`}
                  placeholder="vd: standard, pro, premium" />
              </div>
              <div>
                <label className={labelCls}>Tên gói *</label>
                <input type="text" value={form.name}
                  onChange={e => setForm(f => f ? { ...f, name: e.target.value } : f)}
                  className={inputCls} placeholder="LUMIA PRO" />
              </div>
              <div>
                <label className={labelCls}>Nhóm</label>
                <select value={form.group_name}
                  onChange={e => setForm(f => f ? { ...f, group_name: e.target.value } : f)}
                  className={inputCls}>
                  <option value="promo">Khuyến mãi (Promo)</option>
                  <option value="digital">Gói số (Digital)</option>
                  <option value="hybrid">Kèm hộp vật lý (Hybrid)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Giá (VND) *</label>
                  <input type="number" min={0} value={form.price_vnd}
                    onChange={e => setForm(f => f ? { ...f, price_vnd: Number(e.target.value) } : f)}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Thời hạn (tháng)</label>
                  <input type="number" min={1} value={form.duration_months}
                    onChange={e => setForm(f => f ? { ...f, duration_months: Number(e.target.value) } : f)}
                    className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Giảm giá (%)</label>
                  <input type="number" min={0} max={100} value={form.discount_percent}
                    onChange={e => setForm(f => f ? { ...f, discount_percent: Number(e.target.value) } : f)}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Sort order</label>
                  <input type="number" value={form.sort_order}
                    onChange={e => setForm(f => f ? { ...f, sort_order: Number(e.target.value) } : f)}
                    className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Mô tả</label>
                <textarea rows={2} value={form.description ?? ""}
                  onChange={e => setForm(f => f ? { ...f, description: e.target.value } : f)}
                  className={`${inputCls} resize-none`} />
              </div>
              <div>
                <label className={labelCls}>Features (mỗi dòng một mục)</label>
                <textarea rows={4} value={form.features}
                  onChange={e => setForm(f => f ? { ...f, features: e.target.value } : f)}
                  className={`${inputCls} resize-none font-mono text-[13px]`}
                  placeholder={"Thiền không giới hạn\nNgủ sâu hơn\nHỗ trợ AI"} />
              </div>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                  <input type="checkbox" checked={form.has_physical_box}
                    onChange={e => setForm(f => f ? { ...f, has_physical_box: e.target.checked } : f)}
                    className="h-4 w-4 accent-[var(--green)]" />
                  Kèm hộp vật lý
                </label>
                {form.has_physical_box && (
                  <div className="pl-6 space-y-3">
                    <div>
                      <label className={labelCls}>Loại hộp</label>
                      <input type="text" value={form.physical_box_type ?? ""}
                        onChange={e => setForm(f => f ? { ...f, physical_box_type: e.target.value } : f)}
                        className={inputCls} placeholder="sleep_box, master_box, mini_wellcome..." />
                    </div>
                    <div>
                      <label className={labelCls}>Ảnh hộp vật lý</label>
                      {form.box_image_url ? (
                        <div className="relative mt-1 overflow-hidden rounded-[12px] border border-[var(--border)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={form.box_image_url} alt="Ảnh hộp" className="h-36 w-full object-cover" />
                          <div className="absolute right-2 top-2 flex gap-1.5">
                            <button type="button" disabled={uploadingBox} onClick={uploadBoxImage}
                              className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-white hover:bg-black/80">
                              {uploadingBox ? "Đang tải…" : "Đổi ảnh"}
                            </button>
                            <button type="button"
                              onClick={() => setForm(f => f ? { ...f, box_image_url: "" } : f)}
                              className="rounded-full bg-black/60 p-1 text-white hover:bg-red-700">
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" disabled={uploadingBox} onClick={uploadBoxImage}
                          className="mt-1 flex w-full items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-[var(--border)] py-5 text-[13px] text-[var(--muted)] transition hover:border-[var(--green)]/40 hover:text-[var(--green-deep)] disabled:opacity-50">
                          {uploadingBox
                            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--green)] border-t-transparent" />
                            : <ImagePlus className="h-4 w-4" />}
                          {uploadingBox ? "Đang tải ảnh lên…" : "Tải ảnh hộp lên"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                  <input type="checkbox" checked={form.is_featured}
                    onChange={e => setForm(f => f ? { ...f, is_featured: e.target.checked } : f)}
                    className="h-4 w-4 accent-[var(--green)]" />
                  Gói nổi bật (hiển thị badge)
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                  <input type="checkbox" checked={form.is_first_time_only}
                    onChange={e => setForm(f => f ? { ...f, is_first_time_only: e.target.checked } : f)}
                    className="h-4 w-4 accent-[var(--green)]" />
                  Chỉ dành cho người dùng mới
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-[13px]">
                  <input type="checkbox" checked={form.is_active}
                    onChange={e => setForm(f => f ? { ...f, is_active: e.target.checked } : f)}
                    className="h-4 w-4 accent-[var(--green)]" />
                  Hiển thị (active)
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 flex gap-3 border-t border-[var(--border)] bg-[var(--surface-card)] px-6 py-4">
              <button type="button" onClick={() => setForm(null)} className="button-secondary flex-1 py-2 text-sm">Hủy</button>
              <button type="button" onClick={savePlan} disabled={busy || !form.name || !form.id}
                className="button-primary flex-1 py-2 text-sm disabled:opacity-60">
                {busy ? "Đang lưu…" : (isNew ? "Tạo gói" : "Cập nhật")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Tab: Media (Audio / Video) ───────────────────────────────────────────────

const AUDIO_CATEGORIES = [
  { value: "guided_meditation", label: "Thiền hướng dẫn" },
  { value: "mini_meditation", label: "Thiền mini" },
  { value: "sleep_sound", label: "Âm thanh ngủ" },
  { value: "sleep_cast", label: "Sleep cast" },
  { value: "sleep_music", label: "Nhạc ngủ" },
  { value: "wind_down", label: "Wind down" },
  { value: "breathing", label: "Hít thở" },
  { value: "timer_ambient", label: "Timer ambient" },
];

type AudioTrack = {
  id: string; title: string; description?: string | null; category: string;
  duration_seconds?: number | null; file_url?: string | null; thumbnail_url?: string | null;
  is_free: boolean; sort_order: number; created_at: string;
};

type TrackForm = {
  id?: string; title: string; description: string; category: string;
  duration_seconds: number; file_url: string; thumbnail_url: string; is_free: boolean; sort_order: number;
};

const EMPTY_TRACK: TrackForm = {
  title: "", description: "", category: "guided_meditation",
  duration_seconds: 0, file_url: "", thumbnail_url: "", is_free: false, sort_order: 0,
};

function fmtDuration(s: number | null | undefined) {
  if (!s) return "-";
  const m = Math.floor(s / 60); const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function MediaTab() {
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [catFilter, setCatFilter] = useState("Tất cả");
  const [form, setForm] = useState<TrackForm | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"video" | "thumb" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<AudioTrack | null>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  const loadTracks = useCallback(() => {
    fetch("/api/admin/media").then(r => r.json())
      .then(d => setTracks(d.tracks ?? [])).catch(() => setTracks([]));
  }, []);

  useEffect(() => { loadTracks(); }, [loadTracks]);

  const filtered = useMemo(() => catFilter === "Tất cả" ? tracks : tracks.filter(t => t.category === catFilter), [tracks, catFilter]);

  function parseMetaFromFilename(name: string): { title: string } {
    const base = name.replace(/\.[^.]+$/, "");
    const clean = base
      .replace(/[-_]/g, " ")
      .replace(/\b\d+\s*(min|phut|giay|sec|s|m)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    const title = clean.replace(/\b\w/g, c => c.toUpperCase());
    return { title };
  }

  function readAudioDuration(url: string): Promise<number> {
    return new Promise(resolve => {
      const audio = document.createElement("audio");
      audio.preload = "metadata";
      audio.onloadedmetadata = () => resolve(Math.round(audio.duration) || 0);
      audio.onerror = () => resolve(0);
      audio.src = url;
    });
  }

  async function uploadFile(raw: File, kind: "video" | "thumb") {
    setUploading(kind);
    const sizeErr = validateMediaSize(raw);
    if (sizeErr) { showToast(sizeErr); setUploading(null); return; }
    const file = kind === "thumb" ? await compressImage(raw) : raw;
    const urlRes = await fetch("/api/admin/upload-media-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    if (!urlRes.ok) { showToast("Tải lên thất bại."); setUploading(null); return; }
    const { signedUrl, publicUrl } = await urlRes.json() as { signedUrl: string; publicUrl: string };
    if (!await signedUpload(signedUrl, file)) { showToast("Tải lên thất bại."); setUploading(null); return; }
    const url = publicUrl;
    if (kind === "video") {
      const { title } = parseMetaFromFilename(file.name);
      const isAudio = file.type.startsWith("audio/");
      let duration = 0;
      if (isAudio || file.type.startsWith("video/")) {
        duration = await readAudioDuration(url);
      }
      setForm(f => {
        if (!f) return f;
        const updates: Partial<TrackForm> = { file_url: url };
        if (!f.title) updates.title = title;
        if (!f.duration_seconds && duration > 0) updates.duration_seconds = duration;
        return { ...f, ...updates };
      });
    } else {
      setForm(f => f ? { ...f, thumbnail_url: url } : f);
    }
    showToast("Tải lên thành công!");
    setUploading(null);
  }

  async function saveTrack() {
    if (!form) return;
    setBusy(true);
    const url = form.id ? `/api/admin/media/${form.id}` : "/api/admin/media";
    const method = form.id ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { showToast(form.id ? "Đã cập nhật" : "Đã tạo track"); setForm(null); loadTracks(); }
    else { const d = await res.json() as { error?: string }; showToast(d.error ?? "Lỗi lưu."); }
    setBusy(false);
  }

  async function deleteTrack(t: AudioTrack) {
    setConfirmDelete(null);
    const res = await fetch(`/api/admin/media/${t.id}`, { method: "DELETE" });
    if (res.ok) { setTracks(prev => prev.filter(x => x.id !== t.id)); showToast("Đã xóa."); }
    else showToast("Xóa thất bại.");
  }

  const allCats = ["Tất cả", ...AUDIO_CATEGORIES.map(c => c.value)];
  const catLabel = (v: string) => AUDIO_CATEGORIES.find(c => c.value === v)?.label ?? v;

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {allCats.map(c => (
            <button key={c} type="button" onClick={() => setCatFilter(c)}
              className={`rounded-full border px-3 py-1 text-[13px] transition ${catFilter === c ? "border-[var(--green)] bg-[var(--green-wash)] font-semibold text-[var(--green-deep)]" : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--green)]/50"}`}>
              {c === "Tất cả" ? "Tất cả" : catLabel(c)}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setForm({ ...EMPTY_TRACK })}
          className="button-primary shrink-0 px-4 py-2 text-sm">
          + Thêm track
        </button>
      </div>

      {/* Track list */}
      <div className="space-y-3">
        {filtered.map(t => (
          <div key={t.id} className="flex items-center gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-3 transition hover:border-[var(--green)]/30">
            {/* Thumbnail / video icon */}
            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-[10px] bg-[var(--surface-warm)]">
              {t.thumbnail_url
                ? /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={t.thumbnail_url} alt={t.title} className="h-full w-full object-cover" />
                : <Film className="absolute inset-0 m-auto h-6 w-6 text-[var(--muted)]" />}
              {t.file_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <Video className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium text-[var(--foreground)]">{t.title}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${t.is_free ? "bg-[var(--green-wash)] text-[var(--green-deep)]" : "bg-[var(--surface-warm)] text-[var(--muted)]"}`}>
                  {t.is_free ? "Miễn phí" : "Premium"}
                </span>
              </div>
              <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                {catLabel(t.category)} · {fmtDuration(t.duration_seconds)} · {fmtDate(t.created_at)}
                {!t.file_url && <span className="ml-2 text-amber-600">⚠ Chưa có file</span>}
              </p>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">
              {t.file_url && (
                <a href={t.file_url} target="_blank" rel="noopener noreferrer"
                  className="rounded-full border border-[var(--border)] px-3 py-1 text-[12px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)]">
                  Nghe/Xem
                </a>
              )}
              <button type="button"
                onClick={() => setForm({ id: t.id, title: t.title, description: t.description ?? "", category: t.category, duration_seconds: t.duration_seconds ?? 0, file_url: t.file_url ?? "", thumbnail_url: t.thumbnail_url ?? "", is_free: t.is_free, sort_order: t.sort_order })}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-[12px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)]">
                Sửa
              </button>
              <button type="button" onClick={() => setConfirmDelete(t)}
                className="rounded-full border border-red-200 px-3 py-1 text-[12px] text-red-500 transition hover:bg-red-50">
                Xóa
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-[var(--muted)]">Chưa có track nào. Tạo track đầu tiên!</div>
        )}
      </div>

      {toast && <div className="mt-3 rounded-[12px] bg-[var(--green-wash)] px-4 py-2 text-[13px] text-[var(--green-deep)]">{toast}</div>}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="mx-4 w-full max-w-sm rounded-[24px] bg-[var(--surface-card)] p-6 shadow-2xl">
            <p className="font-semibold text-[var(--foreground)]">Xóa track này?</p>
            <p className="mt-1 text-[13px] text-[var(--muted)]">"{confirmDelete.title}" sẽ bị xóa vĩnh viễn.</p>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setConfirmDelete(null)} className="button-secondary flex-1 px-4 py-2 text-sm">Hủy</button>
              <button type="button" onClick={() => deleteTrack(confirmDelete)}
                className="flex-1 rounded-[12px] bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Track form — right-side panel */}
      {form && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30"
          onClick={e => { if (e.target === e.currentTarget) setForm(null); }}>
          <div className="relative flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-[var(--surface-card)] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-card)] px-6 py-4">
              <h2 className="font-semibold text-[var(--foreground)]">{form.id ? "Sửa track" : "Thêm track mới"}</h2>
              <button type="button" onClick={() => setForm(null)} className="rounded-full p-1.5 hover:bg-[var(--surface-warm)]">
                <X className="h-4 w-4 text-[var(--muted)]" />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* Basic info */}
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Tiêu đề *</label>
                  <input type="text" value={form.title}
                    onChange={e => setForm(f => f ? { ...f, title: e.target.value } : f)}
                    className={inputCls} placeholder="Tên bài thiền / âm thanh" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Danh mục</label>
                    <select value={form.category}
                      onChange={e => setForm(f => f ? { ...f, category: e.target.value } : f)}
                      className={inputCls}>
                      {AUDIO_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Thời lượng (giây)</label>
                    <input type="number" min={0} value={form.duration_seconds}
                      onChange={e => setForm(f => f ? { ...f, duration_seconds: Number(e.target.value) } : f)}
                      className={inputCls} placeholder="600 = 10 phút" />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Mô tả</label>
                  <textarea rows={2} value={form.description}
                    onChange={e => setForm(f => f ? { ...f, description: e.target.value } : f)}
                    className={`${inputCls} resize-none`} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Sort order</label>
                    <input type="number" value={form.sort_order}
                      onChange={e => setForm(f => f ? { ...f, sort_order: Number(e.target.value) } : f)}
                      className={inputCls} />
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 self-end pb-2.5 text-[13px]">
                    <input type="checkbox" checked={form.is_free}
                      onChange={e => setForm(f => f ? { ...f, is_free: e.target.checked } : f)}
                      className="h-4 w-4 accent-[var(--green)]" />
                    Miễn phí (không cần subscription)
                  </label>
                </div>
              </div>

              {/* Video file upload */}
              <div>
                <label className={labelCls}>File video / audio</label>
                <div className="rounded-[16px] border-2 border-dashed border-[var(--border)] p-4">
                  {form.file_url ? (
                    <div className="mb-3">
                      <video src={form.file_url} controls className="w-full rounded-[10px]" style={{ maxHeight: "200px" }} />
                      <button type="button"
                        onClick={() => setForm(f => f ? { ...f, file_url: "" } : f)}
                        className="mt-2 text-[12px] text-red-500 underline">
                        Xóa file
                      </button>
                    </div>
                  ) : (
                    <div
                      className="group mb-3 flex cursor-pointer flex-col items-center justify-center rounded-[12px] bg-[var(--surface-warm)] py-10 transition hover:bg-[var(--green-wash)]/30"
                      onClick={() => videoFileRef.current?.click()}>
                      <Film className="mb-2 h-10 w-10 text-[var(--muted)] group-hover:text-[var(--green)]" />
                      <p className="text-[13px] font-medium text-[var(--muted)] group-hover:text-[var(--green-deep)]">
                        {uploading === "video" ? "Đang tải lên…" : "Click để chọn video / audio"}
                      </p>
                      <p className="mt-1 text-[11px] text-[var(--muted)]">MP4, WebM, MP3, OGG · Tối đa 500MB</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input type="text" value={form.file_url}
                      onChange={e => setForm(f => f ? { ...f, file_url: e.target.value } : f)}
                      placeholder="Hoặc paste URL trực tiếp..."
                      className={`${inputCls} flex-1 text-[13px]`} />
                    <button type="button" disabled={uploading === "video"}
                      onClick={() => videoFileRef.current?.click()}
                      className="flex shrink-0 items-center gap-1.5 rounded-[12px] border border-[var(--border)] px-3 py-2 text-[13px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)] disabled:opacity-50">
                      {uploading === "video" ? <Upload className="h-4 w-4 animate-bounce" /> : <Upload className="h-4 w-4" />}
                      {uploading === "video" ? "Đang tải…" : "Upload"}
                    </button>
                  </div>
                  <input ref={videoFileRef} type="file" accept="video/*,audio/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) void uploadFile(f, "video"); e.target.value = ""; }} />
                </div>
              </div>

              {/* Thumbnail upload */}
              <div>
                <label className={labelCls}>Ảnh thumbnail</label>
                <div className="flex gap-3">
                  {form.thumbnail_url && (
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.thumbnail_url} alt="thumb" className="h-20 w-28 rounded-[10px] object-cover" />
                      <button type="button"
                        onClick={() => setForm(f => f ? { ...f, thumbnail_url: "" } : f)}
                        className="absolute -right-1.5 -top-1.5 rounded-full bg-black/60 p-0.5 text-white">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex flex-1 gap-2">
                    <input type="text" value={form.thumbnail_url}
                      onChange={e => setForm(f => f ? { ...f, thumbnail_url: e.target.value } : f)}
                      placeholder="URL ảnh hoặc upload..."
                      className={`${inputCls} flex-1`} />
                    <button type="button" disabled={uploading === "thumb"}
                      onClick={() => thumbFileRef.current?.click()}
                      className="flex shrink-0 items-center gap-1.5 rounded-[12px] border border-[var(--border)] px-3 py-2 text-[13px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)] disabled:opacity-50">
                      {uploading === "thumb" ? <Upload className="h-4 w-4 animate-bounce" /> : <ImagePlus className="h-4 w-4" />}
                      {uploading === "thumb" ? "Đang tải…" : "Ảnh"}
                    </button>
                    <input ref={thumbFileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) void uploadFile(f, "thumb"); e.target.value = ""; }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[var(--border)] bg-[var(--surface-card)] px-6 py-4">
              <button type="button" onClick={() => setForm(null)} className="button-secondary px-4 py-2 text-sm">Hủy</button>
              <button type="button" onClick={saveTrack} disabled={busy || !form.title}
                className="button-primary px-4 py-2 text-sm disabled:opacity-60">
                {busy ? "Đang lưu…" : (form.id ? "Cập nhật" : "Tạo track")}
              </button>
            </div>
          </div>
        </div>
      )}
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
  { id: "media", label: "Media", icon: Film },
  { id: "plans", label: "Gói dịch vụ", icon: Box },
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
        {tab === "media" && <MediaTab />}
        {tab === "plans" && <PlansTab />}
      </div>
    </div>
  );
}
