"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellDot, ExternalLink, X } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
};

const TYPE_ICON: Record<string, string> = {
  bedtime: "🌙",
  morning: "☀️",
  streak: "🔥",
  weekly: "📊",
  system: "💚",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [loaded, setLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function load() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
      }
    } catch {}
    setLoaded(true);
  }

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  useEffect(() => {
    if (open && !loaded) void load();
    if (open && unreadCount > 0) {
      const t = setTimeout(markAllRead, 2000);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="dash-glass-btn relative"
        aria-label="Thông báo"
      >
        {unreadCount > 0 ? (
          <>
            <BellDot className="h-[19px] w-[19px]" style={{ color: "var(--green-deep)" }} />
            <span className="absolute -right-0.5 -top-0.5 flex h-[14px] w-[14px] items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </>
        ) : (
          <Bell className="h-[19px] w-[19px] text-[var(--foreground)]" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface-card)] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
            <span className="text-[14px] font-semibold text-[var(--foreground)]">Thông báo</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {!loaded ? (
              <div className="space-y-2 p-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl bg-[var(--surface)]" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Bell className="h-8 w-8 opacity-20 text-[var(--muted)]" />
                <p className="text-[13px] text-[var(--muted)]">Chưa có thông báo</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0",
                    !n.is_read && "bg-[var(--green-wash)]",
                  )}
                >
                  <span className="mt-0.5 shrink-0 text-xl">{TYPE_ICON[n.type] ?? "💚"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold leading-snug text-[var(--foreground)]">{n.title}</p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-[var(--muted)]">{n.body}</p>
                    <p className="mt-1 text-[10.5px] text-[var(--muted)]">{timeAgo(n.created_at)}</p>
                  </div>
                  {n.action_url && (
                    <Link
                      href={n.action_url as "/"}
                      onClick={() => setOpen(false)}
                      className="shrink-0 text-[var(--muted)]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
