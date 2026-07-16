"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, BarChart3, BookOpen, Box, ChevronRight, Film, ImagePlus, LayoutDashboard,
  Loader2, Package, ShoppingBag, Upload, Users, Video, X, Edit2, Plus,
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

const BLOG_CATEGORIES = ["Sức khỏe", "Thiền định", "Giấc ngủ", "Năng suất", "Dinh dưỡng", "Sức khỏe tâm lý"];
const PRODUCT_CATEGORIES = ["drink", "scent", "sleep", "meditation", "wellness"];

const ORDER_STATUSES = ["paid", "preparing", "shipping", "delivered"] as const;
const ORDER_STATUS_LABELS: Record<string, string> = {
  paid: "Đã thanh toán", preparing: "Đang chuẩn bị",
  shipping: "Đang giao", delivered: "Đã giao",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

// In-memory cache for admin tab data. Tabs unmount when you switch away, so
// without this every tab switch refetches from scratch (spinner + latency).
// Stale-while-revalidate: seed state from the cache for an instant render, then
// refresh in the background. Lives for the page session (cleared on reload).
const adminCache = new Map<string, unknown>();

// Uploads via XHR (not fetch) so we can report real upload progress — fetch()
// exposes no upload progress events. onProgress receives 0–100.
function signedUpload(signedUrl: string, file: File, onProgress?: (pct: number) => void): Promise<boolean> {
  return new Promise((resolve) => {
    const fd = new FormData();
    fd.append("cacheControl", "3600");
    fd.append("", file);
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("x-upsert", "false");
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);
    xhr.onabort = () => resolve(false);
    xhr.send(fd);
  });
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

// Capture a single frame from a video file as a JPEG thumbnail (client-side, no ffmpeg).
// Robust against large 1080p files whose `moov` sits at the END (not faststart) and that
// run under memory pressure right after the audio demux: uses preload="auto" so real frame
// data is available, captures on the first decoded frame (loadeddata) OR after a small seek,
// and — on a long stall — still grabs whatever frame is decoded before giving up. Returns
// null only if the browser truly can't decode the video (e.g. missing codec on Firefox).
async function extractVideoThumbnail(file: File): Promise<File | null> {
  if (typeof document === "undefined") return null;
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    const url = URL.createObjectURL(file);
    let settled = false;

    const done = (result: File | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { URL.revokeObjectURL(url); } catch { /* noop */ }
      video.removeAttribute("src");
      try { video.load(); } catch { /* noop */ }
      resolve(result);
    };

    // Draw the current frame to a canvas → JPEG. Returns false if no frame is decoded yet.
    const capture = (): boolean => {
      if (!video.videoWidth || !video.videoHeight) return false;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return false;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => done(blob ? new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-thumb.jpg`, { type: "image/jpeg" }) : null),
          "image/jpeg",
          0.82,
        );
        return true;
      } catch {
        return false;
      }
    };

    // Generous timeout for big moov-at-end files; on expiry, still try to grab a frame.
    const timer = setTimeout(() => { if (!capture()) done(null); }, 45000);

    // First decoded frame available → seek a touch past the intro, else capture now.
    video.onloadeddata = () => {
      const target = Number.isFinite(video.duration) && video.duration > 1 ? Math.min(video.duration * 0.1, 1.5) : 0;
      if (target > 0) {
        try { video.currentTime = target; } catch { capture(); }
      } else {
        capture();
      }
    };
    video.onseeked = () => { if (!capture()) done(null); };
    video.onerror = () => done(null);

    video.src = url;
    try { video.load(); } catch { /* noop */ }
  });
}

// Compress audio to Opus/WebM at targetBitrate (default 64 kbps).
// Fast path: demux the audio track from an MP4 and remux (copy — NO decode/re-encode) into a
// fragmented .m4a. Runs in seconds regardless of duration, with no quality loss. Returns null
// when there's no usable audio track or mp4box can't parse the container — the caller then
// falls back to compressAudio (real-time, slower, but always works).
type FastAudio = { file: File; durationSeconds: number };
async function extractAudioTrackFast(file: File): Promise<FastAudio | null> {
  if (typeof window === "undefined") return null;
  try {
    const { createFile, MP4BoxBuffer } = await import("mp4box");
    const buf = await file.arrayBuffer();
    const mp4 = createFile();
    const chunks: ArrayBuffer[] = [];

    return await new Promise<FastAudio | null>((resolve) => {
      let done = false;
      const finish = (result: FastAudio | null) => { if (!done) { done = true; clearTimeout(timer); resolve(result); } };
      const timer = setTimeout(() => finish(null), 30000);

      mp4.onError = () => finish(null);
      mp4.onReady = (info) => {
        try {
          const audio = info.tracks.find((t) => t.type === "audio")
            ?? info.tracks.find((t) => (t.codec || "").startsWith("mp4a"));
          if (!audio) { finish(null); return; }

          mp4.onSegment = (_id, _user, segBuf) => { chunks.push(segBuf); };
          // ~1000 samples per fragment → standard fragmented MP4 (broad browser support).
          mp4.setSegmentOptions(audio.id, null, { nbSamples: 1000 });
          const init = mp4.initializeSegmentation();
          chunks.unshift(init.buffer); // init segment (ftyp+moov) must come first
          mp4.start();
          mp4.flush();

          if (chunks.length <= 1) { finish(null); return; } // only init, no media
          // Duration is already known from the parsed moov — no need to re-download the file.
          const durationSeconds = info.timescale ? Math.round(info.duration / info.timescale) : 0;
          const blob = new Blob(chunks, { type: "audio/mp4" });
          const name = `${file.name.replace(/\.[^.]+$/, "")}.m4a`;
          finish({ file: new File([blob], name, { type: "audio/mp4" }), durationSeconds });
        } catch { finish(null); }
      };

      const mb = MP4BoxBuffer.fromArrayBuffer(buf, 0);
      mp4.appendBuffer(mb);
      mp4.flush();
    });
  } catch {
    return null;
  }
}

// Decodes → mono resample via OfflineAudioContext (fast) → re-encode via MediaRecorder (real-time).
// Returns same file if MediaRecorder or AudioContext is unavailable.
async function compressAudio(
  file: File,
  targetBitrate = 64_000,
  onProgress?: (pct: number) => void,
): Promise<File> {
  if (typeof AudioContext === "undefined" || typeof MediaRecorder === "undefined") return file;

  // Decode
  const decodeCtx = new AudioContext();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await decodeCtx.decodeAudioData(await file.arrayBuffer());
  } catch {
    await decodeCtx.close();
    return file;
  }
  await decodeCtx.close();

  // Downsample to mono at 44100 Hz (runs faster than real-time)
  const sampleRate = Math.min(44100, audioBuffer.sampleRate);
  const totalSamples = Math.ceil(audioBuffer.duration * sampleRate);
  const offCtx = new OfflineAudioContext(1, totalSamples, sampleRate);
  const offSrc = offCtx.createBufferSource();
  offSrc.buffer = audioBuffer;
  offSrc.connect(offCtx.destination);
  offSrc.start();
  const mono = await offCtx.startRendering();

  // Pick best supported mime type
  const mimeType = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/webm"].find(
    (t) => MediaRecorder.isTypeSupported(t),
  ) ?? "audio/webm";

  return new Promise((resolve) => {
    const liveCtx = new AudioContext({ sampleRate });
    const dest = liveCtx.createMediaStreamDestination();
    const src = liveCtx.createBufferSource();
    src.buffer = mono;
    src.connect(dest);

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(dest.stream, { mimeType, audioBitsPerSecond: targetBitrate });
    } catch {
      liveCtx.close();
      resolve(file);
      return;
    }

    const chunks: Blob[] = [];
    const durationMs = mono.duration * 1000;
    const startedAt = Date.now();

    const tick = setInterval(() => {
      onProgress?.(Math.min(95, ((Date.now() - startedAt) / durationMs) * 100));
    }, 500);

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      clearInterval(tick);
      liveCtx.close();
      onProgress?.(100);
      const blob = new Blob(chunks, { type: mimeType });
      const ext = mimeType.includes("ogg") ? "ogg" : "webm";
      resolve(new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), { type: mimeType }));
    };
    recorder.onerror = () => { clearInterval(tick); liveCtx.close(); resolve(file); };

    recorder.start(250);
    src.start();
    src.onended = () => recorder.stop();
  });
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

// Full-width spinner row shown inside a table while its data is loading, so the
// user sees a loader instead of a premature "no data" message.
function LoadingRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16">
        <div className="flex items-center justify-center gap-2 text-[var(--muted)]">
          <Loader2 className="h-5 w-5 animate-spin text-[var(--green)]" />
          <span className="text-[13px]">Đang tải…</span>
        </div>
      </td>
    </tr>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls = "w-full rounded-[12px] border border-[var(--border)] bg-[var(--surface-card)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--green)]/30";
const labelCls = "mb-1 block text-[12px] font-medium text-[var(--muted)]";

// ─── Tab: Tổng quan ──────────────────────────────────────────────────────────

function PayosWebhookCard() {
  const [info, setInfo] = useState<{ configured?: boolean; webhookUrl?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/payos-webhook").then(r => r.json()).then(setInfo).catch(() => setInfo(null));
  }, []);

  async function register() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/payos-webhook", { method: "POST" });
      const data = (await res.json()) as { webhookUrl?: string; error?: string; detail?: string; hint?: string };
      setMsg(
        res.ok
          ? { ok: true, text: `Đã đăng ký thành công: ${data.webhookUrl ?? ""}` }
          : {
              ok: false,
              text: [data.error, data.detail && `Chi tiết: ${data.detail}`, data.hint && `→ ${data.hint}`, data.webhookUrl && `URL: ${data.webhookUrl}`]
                .filter(Boolean)
                .join("\n"),
            },
      );
    } catch {
      setMsg({ ok: false, text: "Không gọi được API." });
    }
    setBusy(false);
  }

  return (
    <div className="mt-6 soft-card p-6">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">Webhook PayOS</h3>
      <p className="mt-1 text-[13px] text-[var(--muted)]">
        Bắt buộc — để đơn hàng tự động lên &ldquo;đã thanh toán&rdquo; và kích hoạt gói ngay khi khách chuyển khoản.
      </p>
      <div className="mt-3 space-y-2 rounded-[12px] bg-[var(--surface-warm)] px-4 py-3 text-[13px]">
        <div className="flex justify-between gap-3">
          <span className="text-[var(--muted)]">Cấu hình PayOS</span>
          <span className={info?.configured ? "font-medium text-[var(--green-deep)]" : "font-medium text-red-500"}>
            {info == null ? "…" : info.configured ? "✓ Đã có key" : "✗ Thiếu key"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[var(--muted)]">URL webhook</span>
          <span className="break-all font-mono text-[12px] text-[var(--foreground)]">{info?.webhookUrl ?? "—"}</span>
        </div>
      </div>
      <button type="button" onClick={register} disabled={busy} className="button-primary mt-3 w-full disabled:opacity-60">
        {busy ? "Đang đăng ký…" : "Đăng ký webhook với PayOS"}
      </button>
      {msg && (
        <p
          className={`mt-2 whitespace-pre-line break-words rounded-[10px] px-3 py-2 text-[12px] ${msg.ok ? "bg-[var(--green-wash)] text-[var(--green-deep)]" : "bg-red-50 text-red-600"}`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}

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
      <PayosWebhookCard />
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
  const [users, setUsers] = useState<UserRow[]>(() => (adminCache.get("users") as UserRow[]) ?? []);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [mode, setMode] = useState<UserModalMode>("upgrade");
  const [upgradeForm, setUpgradeForm] = useState({ tier: "premium", duration_months: 1, has_physical_box: false });
  const [editForm, setEditForm] = useState({ full_name: "", role: "user" as "user" | "admin" });
  const [createForm, setCreateForm] = useState({ email: "", password: "", full_name: "", role: "user" as "user" | "admin" });
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);
  const [loading, setLoading] = useState(!adminCache.has("users"));

  const loadUsers = useCallback(() => {
    // Revalidate in the background; cached data already renders instantly.
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(d => { adminCache.set("users", d); setUsers(d); })
      .catch(() => setUsers(prev => prev.length ? prev : []))
      .finally(() => setLoading(false));
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
            {loading && <LoadingRow colSpan={7} />}
            {!loading && filtered.map(u => (
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
            {!loading && filtered.length === 0 && (
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
  const [orders, setOrders] = useState<Order[]>(() => (adminCache.get("orders") as Order[]) ?? []);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(!adminCache.has("orders"));

  useEffect(() => {
    fetch("/api/admin/orders")
      .then(r => r.json())
      .then(d => { adminCache.set("orders", d); setOrders(d); })
      .catch(() => setOrders(prev => prev.length ? prev : []))
      .finally(() => setLoading(false));
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
            {loading && <LoadingRow colSpan={8} />}
            {!loading && filtered.map(o => (
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
            {!loading && filtered.length === 0 && (
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
type ProductVariant = { name: string; image_url: string; stock_quantity?: number };

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
  const [products, setProducts] = useState<Product[]>(() => (adminCache.get("products") as Product[]) ?? []);
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
  const [loading, setLoading] = useState(!adminCache.has("products"));

  const loadProducts = useCallback(() => {
    // Revalidate in the background; cached data already renders instantly.
    fetch("/api/admin/store/products")
      .then(r => r.json())
      .then(d => { adminCache.set("products", d); setProducts(d); })
      .catch(() => setProducts(prev => prev.length ? prev : []))
      .finally(() => setLoading(false));
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
            {loading && <LoadingRow colSpan={7} />}
            {!loading && filtered.map(p => (
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
            {!loading && filtered.length === 0 && (
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
                      disabled={!!uploadingIdx}
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
                    disabled={!!uploadingIdx}
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
                              disabled={!!uploadingIdx}
                              onClick={() => uploadProductImage(`var-${idx}`, url => setProductForm(f => f ? { ...f, variants: f.variants.map((v, i) => i === idx ? { ...v, image_url: url } : v) } : f))}
                              className="flex h-16 w-16 flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--green)]/40 hover:text-[var(--green-deep)]">
                              {uploadingIdx === `var-${idx}` ? <Upload className="h-4 w-4 animate-bounce" /> : <ImagePlus className="h-4 w-4" />}
                              <span className="mt-0.5 text-[9px]">Ảnh</span>
                            </button>
                          )}
                        </div>
                        {/* Variant name + stock */}
                        <div className="flex flex-1 flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <input type="text" value={variant.name}
                              onChange={e => setProductForm(f => f ? { ...f, variants: f.variants.map((v, i) => i === idx ? { ...v, name: e.target.value } : v) } : f)}
                              placeholder="Tên phân loại (vd: Lavender, Size M...)"
                              className={`${inputCls} flex-1`} />
                            {variant.image_url && (
                              <button type="button"
                                disabled={!!uploadingIdx}
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
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] text-[var(--muted)] whitespace-nowrap">Tồn kho:</label>
                            <input type="number" min={0}
                              value={variant.stock_quantity ?? ""}
                              onChange={e => setProductForm(f => f ? { ...f, variants: f.variants.map((v, i) => i === idx ? { ...v, stock_quantity: e.target.value === "" ? undefined : Number(e.target.value) } : v) } : f)}
                              placeholder="Không giới hạn"
                              className={`${inputCls} w-36 text-[12px] py-1.5`} />
                          </div>
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
                <button type="button" onClick={saveProduct} disabled={formBusy || !!uploadingIdx || !productForm.name}
                  className="button-primary px-4 py-2 text-sm disabled:opacity-60">
                  {formBusy ? "Đang lưu…" : uploadingIdx ? "Đang tải ảnh…" : (editingId ? "Cập nhật" : "Tạo sản phẩm")}
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
  category: "Sức khỏe", emoji: "📝",
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
      {/* ── Danh sách bài viết ── */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-[var(--foreground)]">Bài viết</p>
          <p className="text-[12px] text-[var(--muted)]">{posts.length} bài · {posts.filter(p => p.published).length} đã xuất bản</p>
        </div>
        <button type="button" onClick={openNew}
          className="flex items-center gap-1.5 rounded-full bg-[var(--green)] px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> Viết bài mới
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[var(--border)] py-16 text-center">
          <span className="text-4xl">✍️</span>
          <p className="mt-3 font-serif text-[17px] text-[var(--foreground)]">Chưa có bài viết nào</p>
          <p className="mt-1 text-[13px] text-[var(--muted)]">Nhấn "Viết bài mới" để bắt đầu</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map(p => (
            <div key={p.id}
              className="flex items-center gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface-card)] px-4 py-3 transition hover:border-[var(--green)]/30">
              {/* Cover thumbnail */}
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-[10px]"
                style={{ background: p.cover_color }}>
                <span className="absolute inset-0 flex items-center justify-center text-xl">{p.emoji}</span>
              </div>
              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-[var(--foreground)]">{p.title || "(Chưa có tiêu đề)"}</p>
                <p className="mt-0.5 truncate text-[11px] text-[var(--muted)]">
                  {p.category} · {p.read_time} phút đọc · {fmtDate(p.created_at)}
                </p>
              </div>
              {/* Status badge */}
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${p.published ? "bg-[var(--green-wash)] text-[var(--green-deep)]" : "bg-[var(--surface-warm)] text-[var(--muted)]"}`}>
                {p.published ? "Đã xuất bản" : "Bản nháp"}
              </span>
              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1.5">
                <button type="button" onClick={() => openEdit(p)}
                  className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[12px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)]">
                  Chỉnh sửa
                </button>
                <button type="button" onClick={() => togglePublish(p)}
                  className={`rounded-full border px-3 py-1.5 text-[12px] font-medium transition ${p.published ? "border-[var(--border)] text-[var(--muted)] hover:border-red-200 hover:text-red-500" : "border-[var(--green)]/40 text-[var(--green-deep)] hover:bg-[var(--green-wash)]"}`}>
                  {p.published ? "Ẩn" : "Xuất bản"}
                </button>
                <button type="button" onClick={() => deletePost(p.id)} disabled={deleting === p.id}
                  className="rounded-full p-1.5 text-[var(--muted)] transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[var(--green-deep)] px-5 py-2.5 text-[13px] font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* ── Blog editor (full-screen overlay) ── */}
      {form && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--surface)]">

          {/* Sticky top bar */}
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)]/95 px-6 py-3 backdrop-blur-xl">
            <button type="button" onClick={() => setForm(null)}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-[13px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--foreground)]">
              <ArrowLeft className="h-3.5 w-3.5" /> Quay lại
            </button>
            <div className="flex items-center gap-3">
              {/* Draft / Published toggle */}
              <button type="button"
                onClick={() => setForm(f => f ? { ...f, published: !f.published } : f)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${form.published ? "bg-[var(--green-wash)] text-[var(--green-deep)]" : "border border-[var(--border)] text-[var(--muted)]"}`}>
                {form.published ? "✓ Đã xuất bản" : "○ Bản nháp"}
              </button>
              <button type="button" onClick={savePost}
                disabled={saving || uploading || !form.title || !form.excerpt}
                className="rounded-full bg-[var(--green)] px-5 py-1.5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {saving ? "Đang lưu…" : uploading ? "Đang tải ảnh…" : form.id ? "Lưu thay đổi" : "Đăng bài"}
              </button>
            </div>
          </div>

          <div className="mx-auto max-w-2xl px-4 pb-24 pt-8">

            {/* ── Ảnh bìa ── */}
            <div className="mb-6 overflow-hidden rounded-[20px] border border-[var(--border)]">
              {form.cover_image_url ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.cover_image_url} alt="Ảnh bìa" className="h-56 w-full object-cover" />
                  {/* Always-visible action strip */}
                  <div className="flex items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-card)] px-4 py-2.5">
                    <ImagePlus className="h-3.5 w-3.5 text-[var(--muted)]" />
                    <span className="flex-1 text-[12px] text-[var(--muted)]">Ảnh bìa đã tải lên</span>
                    <button type="button" disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1 rounded-full border border-[var(--border)] px-3 py-1 text-[12px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)]">
                      <Upload className="h-3 w-3" />
                      {uploading ? "Đang tải…" : "Đổi ảnh"}
                    </button>
                    <button type="button"
                      onClick={() => setForm(f => f ? { ...f, cover_image_url: "" } : f)}
                      className="flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-[12px] text-red-500 transition hover:bg-red-50">
                      <X className="h-3 w-3" /> Xóa
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Drag-drop zone */}
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center gap-3 py-10 transition hover:bg-[var(--surface-warm)]"
                    style={{ background: form.cover_color }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void uploadCoverImage(f); }}>
                    <span className="text-4xl opacity-60">{form.emoji || "📝"}</span>
                    <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-[13px] font-medium text-[var(--foreground)] shadow-sm backdrop-blur-sm dark:bg-black/50 dark:text-white">
                      {uploading
                        ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" /> Đang tải ảnh lên…</>
                        : <><ImagePlus className="h-3.5 w-3.5" /> Click hoặc kéo thả ảnh bìa vào đây</>}
                    </div>
                    <p className="text-[11px] text-white/70 dark:text-white/50">JPG, PNG, WebP · Tối đa 10MB</p>
                  </div>
                  {/* Color + upload strip */}
                  <div className="flex items-center gap-2 border-t border-[var(--border)] bg-[var(--surface-card)] px-4 py-2.5">
                    <span className="text-[11px] text-[var(--muted)]">Màu nền:</span>
                    {COVER_PRESETS.map(preset => (
                      <button key={preset} type="button"
                        onClick={() => setForm(f => f ? { ...f, cover_color: preset } : f)}
                        className={`h-5 w-5 rounded-full border-2 transition ${form.cover_color === preset ? "scale-125 border-[var(--green)]" : "border-transparent hover:scale-110"}`}
                        style={{ background: preset }} />
                    ))}
                    <label className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-warm)] text-[10px] text-[var(--muted)]" title="Màu tuỳ chỉnh">
                      #
                      <input type="color" className="absolute h-0 w-0 opacity-0"
                        onChange={e => setForm(f => f ? { ...f, cover_color: e.target.value } : f)} />
                    </label>
                    <button type="button" disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="ml-auto flex items-center gap-1.5 rounded-full bg-[var(--green)] px-3 py-1 text-[11px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                      <ImagePlus className="h-3 w-3" />
                      {uploading ? "Đang tải…" : "Upload ảnh bìa"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) void uploadCoverImage(f); e.target.value = ""; }} />

            {/* ── Metadata strip ── */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {/* Emoji */}
              <input type="text" value={form.emoji}
                onChange={e => setForm(f => f ? { ...f, emoji: e.target.value } : f)}
                className="w-10 rounded-[10px] border border-transparent bg-transparent text-center text-2xl outline-none hover:border-[var(--border)] hover:bg-[var(--surface-warm)] focus:border-[var(--border)]"
                maxLength={4} title="Emoji đại diện" />
              {/* Category */}
              <select value={form.category} onChange={e => setForm(f => f ? { ...f, category: e.target.value } : f)}
                className="rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-3 py-1.5 text-[12px] text-[var(--foreground)] outline-none focus:border-[var(--green)]/50">
                {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {/* Read time */}
              <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-3 py-1.5">
                <input type="number" min={1} value={form.read_time}
                  onChange={e => setForm(f => f ? { ...f, read_time: Number(e.target.value) } : f)}
                  className="w-8 bg-transparent text-center text-[12px] text-[var(--foreground)] outline-none" />
                <span className="text-[12px] text-[var(--muted)]">phút đọc</span>
              </div>
              {/* Slug */}
              <div className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-3 py-1.5">
                <span className="text-[11px] text-[var(--muted)]">slug:</span>
                <input type="text" value={form.slug} onChange={e => setForm(f => f ? { ...f, slug: e.target.value } : f)}
                  className="w-32 bg-transparent font-mono text-[11px] text-[var(--muted)] outline-none" />
              </div>
            </div>

            {/* ── Tiêu đề ── */}
            <input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)}
              placeholder="Tiêu đề bài viết..."
              className="w-full bg-transparent font-serif text-[32px] font-bold leading-tight text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/40" />

            {/* ── Tóm tắt ── */}
            <textarea rows={2} value={form.excerpt} onChange={e => setForm(f => f ? { ...f, excerpt: e.target.value } : f)}
              placeholder="Viết tóm tắt ngắn — hiển thị trên trang danh sách và landing page..."
              className="mt-3 w-full resize-none bg-transparent text-[16px] leading-relaxed text-[var(--muted)] outline-none placeholder:text-[var(--muted)]/40" />

            {/* ── Divider ── */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Nội dung</span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            {/* ── Rich editor ── */}
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
              minHeight={400}
            />
          </div>
        </div>
      )}
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
  const [plans, setPlans] = useState<Plan[]>(() => (adminCache.get("plans") as Plan[]) ?? []);
  const [form, setForm] = useState<PlanForm | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Plan | null>(null);
  const [uploadingBox, setUploadingBox] = useState(false);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  const loadPlans = useCallback(() => {
    fetch("/api/admin/plans").then(r => r.json()).then(d => { const arr = Array.isArray(d) ? d : []; adminCache.set("plans", arr); setPlans(arr); }).catch(() => setPlans(prev => prev.length ? prev : []));
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
  const [tracks, setTracks] = useState<AudioTrack[]>(() => (adminCache.get("tracks") as AudioTrack[]) ?? []);
  const [catFilter, setCatFilter] = useState("Tất cả");
  const [form, setForm] = useState<TrackForm | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"video" | "thumb" | null>(null);
  const [compressionProgress, setCompressionProgress] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false); // demux/thumbnail phase (no % available)
  const [confirmDelete, setConfirmDelete] = useState<AudioTrack | null>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);

  // Bulk upload state
  type BulkItem = { name: string; status: "pending" | "compressing" | "uploading" | "done" | "error"; progress?: number; error?: string };
  const [bulkItems, setBulkItems] = useState<BulkItem[]>([]);
  const [bulkOpen, setBulkOpen] = useState(false);
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const thumbFileRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(null), 2500); }

  const loadTracks = useCallback(() => {
    fetch("/api/admin/media").then(r => r.json())
      .then(d => { const arr = d.tracks ?? []; adminCache.set("tracks", arr); setTracks(arr); })
      .catch(() => setTracks(prev => prev.length ? prev : []));
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
    const AUDIO_COMPRESS_THRESHOLD_MB = 10;
    const isAudioFile = raw.type.startsWith("audio/");
    const isVideoFile = raw.type.startsWith("video/");
    const needsCompress = kind === "video" && isAudioFile && raw.size > AUDIO_COMPRESS_THRESHOLD_MB * 1024 * 1024;
    let file = raw;
    let fastDuration = 0; // duration known from demux — avoids a post-upload metadata round-trip
    let preThumb: File | null = null; // thumbnail grabbed before the memory-heavy demux
    if (kind === "video" && isVideoFile) {
      const originalMB = (raw.size / 1024 / 1024).toFixed(1);
      setProcessing(true);
      showToast(`Đang xử lý video ${originalMB} MB…`);
      // 1) Grab the thumbnail FIRST — before the audio demux holds ~240 MB in memory — so the
      //    browser has clean memory to decode a video frame. This is why large files (e.g.
      //    "TẬP 7") intermittently failed to produce a thumbnail: the frame decode was starved
      //    of memory when it ran after the demux.
      preThumb = await extractVideoThumbnail(raw);
      // 2) Demux/copy the AAC audio track into an .m4a (seconds, no re-encode).
      const fast = await extractAudioTrackFast(raw);
      setProcessing(false);
      if (fast) {
        file = fast.file;
        fastDuration = fast.durationSeconds;
        const newMB = (file.size / 1024 / 1024).toFixed(1);
        showToast(`Đã xử lý xong: ${originalMB} MB → ${newMB} MB`);
      } else {
        // Fallback: real-time re-encode to Opus/WebM (slower, ~= video duration, but always works).
        showToast("Dùng phương án dự phòng (nén lại), có thể mất vài phút — vui lòng giữ tab mở.");
        file = await compressAudio(raw, 64_000, (pct) => setCompressionProgress(Math.round(pct)));
        setCompressionProgress(null);
        if (file.type.startsWith("video/")) {
          showToast("Trình duyệt không tách được âm thanh — sẽ lưu nguyên video.");
        } else {
          const newMB = (file.size / 1024 / 1024).toFixed(1);
          showToast(`Tách âm thanh xong: ${originalMB} MB → ${newMB} MB`);
        }
      }
    } else if (needsCompress) {
      setCompressionProgress(0);
      const originalMB = (raw.size / 1024 / 1024).toFixed(1);
      showToast(`Đang nén audio ${originalMB} MB… Ước tính ${Math.ceil(raw.size / 1024 / 1024 / 0.48 / 60)} phút.`);
      file = await compressAudio(raw, 64_000, (pct) => setCompressionProgress(Math.round(pct)));
      setCompressionProgress(null);
      const newMB = (file.size / 1024 / 1024).toFixed(1);
      showToast(`Nén xong: ${originalMB} MB → ${newMB} MB`);
    } else if (kind === "thumb") {
      file = await compressImage(raw);
    }
    const sizeErr = validateMediaSize(file);
    if (sizeErr) { showToast(sizeErr); setUploading(null); return; }
    const urlRes = await fetch("/api/admin/upload-media-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    });
    if (!urlRes.ok) { showToast("Tải lên thất bại."); setUploading(null); return; }
    const { signedUrl, publicUrl } = await urlRes.json() as { signedUrl: string; publicUrl: string };
    setUploadProgress(0);
    const uploaded = await signedUpload(signedUrl, file, (pct) => setUploadProgress(pct));
    setUploadProgress(null);
    if (!uploaded) { showToast("Tải lên thất bại."); setUploading(null); return; }
    const url = publicUrl;
    if (kind === "video") {
      const { title } = parseMetaFromFilename(file.name);
      const isAudio = file.type.startsWith("audio/");
      let duration = fastDuration;
      if (duration <= 0 && (isAudio || file.type.startsWith("video/"))) {
        duration = await readAudioDuration(url);
      }
      setForm(f => {
        if (!f) return f;
        const updates: Partial<TrackForm> = { file_url: url };
        if (!f.title) updates.title = title;
        if (!f.duration_seconds && duration > 0) updates.duration_seconds = duration;
        return { ...f, ...updates };
      });

      // Upload the thumbnail grabbed earlier (best-effort, non-blocking). Only fills
      // thumbnail_url when the admin hasn't already set one.
      if (isVideoFile) {
        try {
          const thumb = preThumb;
          if (thumb) {
            const compressed = await compressImage(thumb);
            const tRes = await fetch("/api/admin/upload-media-url", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ filename: compressed.name, contentType: compressed.type }),
            });
            if (tRes.ok) {
              const { signedUrl: tSigned, publicUrl: tPublic } = await tRes.json() as { signedUrl: string; publicUrl: string };
              if (await signedUpload(tSigned, compressed)) {
                setForm(f => (f && !f.thumbnail_url) ? { ...f, thumbnail_url: tPublic } : f);
                showToast("Đã tạo thumbnail từ video.");
              }
            }
          }
        } catch {
          // Thumbnail is optional — ignore extraction/upload failures.
        }
      }
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

  async function handleBulkUpload(files: FileList) {
    const arr = Array.from(files).filter(f => f.type.startsWith("audio/") || f.type.startsWith("video/"));
    if (!arr.length) return;
    setBulkOpen(true);
    setBulkItems(arr.map(f => ({ name: f.name, status: "pending" })));

    // Uploads a File to storage via a signed URL and returns its public URL (or null).
    const uploadOne = async (f: File, onProgress?: (pct: number) => void): Promise<string | null> => {
      const urlRes = await fetch("/api/admin/upload-media-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: f.name, contentType: f.type }),
      });
      if (!urlRes.ok) return null;
      const { signedUrl, publicUrl } = await urlRes.json() as { signedUrl: string; publicUrl: string };
      return (await signedUpload(signedUrl, f, onProgress)) ? publicUrl : null;
    };

    const processOne = async (raw: File, i: number) => {
      const update = (patch: Partial<BulkItem>) =>
        setBulkItems(prev => prev.map((it, idx) => idx === i ? { ...it, ...patch } : it));
      try {
        const THRESHOLD = 10 * 1024 * 1024;
        const isVideoFile = raw.type.startsWith("video/");
        let file = raw;
        let fastDuration = 0;
        let preThumb: File | null = null;
        if (isVideoFile) {
          update({ status: "compressing", progress: undefined });
          // Grab the thumbnail BEFORE the demux holds ~240 MB in memory (see extractVideoThumbnail).
          try { preThumb = await extractVideoThumbnail(raw); } catch { preThumb = null; }
          // Fast path: demux/copy the AAC track to .m4a (seconds). Fallback: real-time re-encode.
          const fast = await extractAudioTrackFast(raw);
          if (fast) { file = fast.file; fastDuration = fast.durationSeconds; }
          else { file = await compressAudio(raw, 64_000, pct => update({ progress: Math.round(pct) })); }
        } else if (raw.type.startsWith("audio/") && raw.size > THRESHOLD) {
          update({ status: "compressing", progress: 0 });
          file = await compressAudio(raw, 64_000, pct => update({ progress: Math.round(pct) }));
        }

        update({ status: "uploading", progress: 0 });
        // Upload the audio and the pre-extracted thumbnail concurrently.
        const [publicUrl, thumbnailUrl] = await Promise.all([
          uploadOne(file, (pct) => update({ progress: pct })),
          (async (): Promise<string> => {
            if (!preThumb) return "";
            try { return (await uploadOne(await compressImage(preThumb))) ?? ""; } catch { return ""; }
          })(),
        ]);
        if (!publicUrl) throw new Error("Upload thất bại");

        // Duration: use the value from demux when available; otherwise read metadata (no full download).
        const duration = fastDuration > 0 ? fastDuration : await new Promise<number>(resolve => {
          const el = document.createElement("audio");
          el.preload = "metadata";
          el.onloadedmetadata = () => resolve(Math.round(el.duration) || 0);
          el.onerror = () => resolve(0);
          el.src = publicUrl;
        });

        const base = raw.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
        const title = base.replace(/\b\w/g, c => c.toUpperCase());
        const saveRes = await fetch("/api/admin/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description: "", category: "sleep_sound", duration_seconds: duration, file_url: publicUrl, thumbnail_url: thumbnailUrl, is_free: true, sort_order: 0 }),
        });
        if (!saveRes.ok) throw new Error("Lưu track thất bại");
        update({ status: "done" });
      } catch (e) {
        update({ status: "error", error: e instanceof Error ? e.message : "Lỗi" });
      }
    };

    // Process files with bounded concurrency so extraction/upload of multiple files overlap
    // (wall-clock ≈ total / CONCURRENCY instead of the sum). Capped to limit peak memory when
    // several large videos are decoded at once.
    const CONCURRENCY = 3;
    let cursor = 0;
    const worker = async () => {
      while (cursor < arr.length) {
        const i = cursor++;
        await processOne(arr[i]!, i);
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, arr.length) }, worker));
    loadTracks();
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
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => bulkInputRef.current?.click()}
            className="rounded-full border border-[var(--green)] bg-[var(--green-wash)] px-4 py-2 text-sm font-semibold text-[var(--green-deep)] transition hover:bg-[var(--green)]/20">
            ↑ Upload nhiều file
          </button>
          <button type="button" onClick={() => setForm({ ...EMPTY_TRACK })}
            className="button-primary shrink-0 px-4 py-2 text-sm">
            + Thêm track
          </button>
        </div>
      </div>

      {/* Bulk upload progress panel */}
      {bulkOpen && bulkItems.length > 0 && (
        <div className="mb-5 rounded-[16px] border border-[var(--border)] bg-[var(--surface-card)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[var(--foreground)]">
              Đang upload {bulkItems.filter(i => i.status === "done").length}/{bulkItems.length} file
            </p>
            {bulkItems.every(i => i.status === "done" || i.status === "error") && (
              <button type="button" onClick={() => { setBulkOpen(false); setBulkItems([]); }}
                className="text-[12px] text-[var(--muted)] hover:text-[var(--foreground)]">Đóng</button>
            )}
          </div>
          <div className="max-h-[260px] space-y-2 overflow-y-auto">
            {bulkItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                <span className="text-base">
                  {item.status === "done" ? "✅" : item.status === "error" ? "❌" : item.status === "compressing" ? "🔄" : item.status === "uploading" ? "⬆️" : "⏳"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium text-[var(--foreground)]">{item.name}</p>
                  <p className="text-[11px] text-[var(--muted)]">
                    {item.status === "pending" && "Chờ..."}
                    {item.status === "compressing" && (item.progress != null ? `Đang xử lý… ${item.progress}%` : "Đang xử lý…")}
                    {item.status === "uploading" && `Đang tải lên… ${item.progress ?? 0}%`}
                    {item.status === "done" && "Hoàn thành"}
                    {item.status === "error" && (item.error ?? "Lỗi")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden bulk file input */}
      <input ref={bulkInputRef} type="file" accept="audio/*,video/*" multiple className="hidden"
        onChange={e => { if (e.target.files?.length) void handleBulkUpload(e.target.files); e.target.value = ""; }} />

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
                      className={`group mb-3 flex flex-col items-center justify-center rounded-[12px] bg-[var(--surface-warm)] py-10 transition hover:bg-[var(--green-wash)]/30 ${uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                      onClick={() => !uploading && videoFileRef.current?.click()}>
                      <Film className="mb-2 h-10 w-10 text-[var(--muted)] group-hover:text-[var(--green)]" />
                      <p className="text-[13px] font-medium text-[var(--muted)] group-hover:text-[var(--green-deep)]">
                        {processing
                          ? "Đang xử lý video (tách âm thanh + thumbnail)…"
                          : compressionProgress !== null
                          ? `Đang xử lý audio… ${compressionProgress}%`
                          : uploadProgress !== null
                          ? `Đang tải lên… ${uploadProgress}%`
                          : uploading === "video"
                          ? "Đang tải lên…"
                          : "Click để chọn video / audio"}
                      </p>
                      {processing ? (
                        <div className="mt-3 h-1.5 w-40 overflow-hidden rounded-full bg-[var(--border)]">
                          <div className="h-full w-1/3 animate-pulse rounded-full bg-[var(--green)]" />
                        </div>
                      ) : (compressionProgress ?? uploadProgress) !== null ? (
                        <div className="mt-3 h-1.5 w-40 overflow-hidden rounded-full bg-[var(--border)]">
                          <div
                            className="h-full rounded-full bg-[var(--green)] transition-all duration-300"
                            style={{ width: `${compressionProgress ?? uploadProgress ?? 0}%` }}
                          />
                        </div>
                      ) : (
                        <p className="mt-1 text-[11px] text-[var(--muted)]">MP4, WebM, MP3, OGG · Tối đa 50 MB (audio tự động nén)</p>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input type="text" value={form.file_url}
                      onChange={e => setForm(f => f ? { ...f, file_url: e.target.value } : f)}
                      placeholder="Hoặc paste URL trực tiếp..."
                      className={`${inputCls} flex-1 text-[13px]`} />
                    <button type="button" disabled={!!uploading}
                      onClick={() => videoFileRef.current?.click()}
                      className="flex shrink-0 items-center gap-1.5 rounded-[12px] border border-[var(--border)] px-3 py-2 text-[13px] text-[var(--muted)] transition hover:border-[var(--green)]/50 hover:text-[var(--green-deep)] disabled:opacity-50">
                      {(uploading === "video" || processing || compressionProgress !== null || uploadProgress !== null) ? <Upload className="h-4 w-4 animate-bounce" /> : <Upload className="h-4 w-4" />}
                      {processing ? "Đang xử lý…" : compressionProgress !== null ? `Xử lý ${compressionProgress}%` : uploadProgress !== null ? `Tải ${uploadProgress}%` : uploading === "video" ? "Đang tải…" : "Upload"}
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
                    <button type="button" disabled={!!uploading}
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
              <button type="button" onClick={saveTrack} disabled={busy || !!uploading || !form.title}
                className="button-primary px-4 py-2 text-sm disabled:opacity-60">
                {busy ? "Đang lưu…" : uploading ? "Đang tải file…" : (form.id ? "Cập nhật" : "Tạo track")}
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
  // { id: "blog", label: "Blog", icon: BookOpen }, // disabled temporarily
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
        {/* {tab === "blog" && <BlogTab />} */}
        {tab === "media" && <MediaTab />}
        {tab === "plans" && <PlansTab />}
      </div>
    </div>
  );
}
