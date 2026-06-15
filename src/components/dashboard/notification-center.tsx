"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellRing, Moon, Flame, CalendarDays, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NotifType = "bedtime" | "morning" | "streak" | "weekly" | "system";

type Notification = {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
};

const TYPE_ICON: Record<NotifType, React.ElementType> = {
  bedtime: Moon,
  morning: Sparkles,
  streak:  Flame,
  weekly:  CalendarDays,
  system:  BellRing,
};

const TYPE_COLOR: Record<NotifType, string> = {
  bedtime: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300",
  morning: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
  streak:  "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300",
  weekly:  "bg-[var(--green-wash)] text-[var(--green-deep)]",
  system:  "bg-[var(--surface)] text-[var(--muted)]",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
}

// Generate smart in-app notifications based on local time + user data
function generateSmartNotifications(): Omit<Notification, "id" | "is_read" | "created_at">[] {
  const hour = new Date().getHours();
  const notifs: Omit<Notification, "id" | "is_read" | "created_at">[] = [];

  if (hour >= 21 && hour < 23) {
    notifs.push({
      type: "bedtime",
      title: "Đã đến giờ chuẩn bị ngủ",
      body: "Hãy bắt đầu nghi thức tối của bạn. Tắt màn hình và thư giãn nhé.",
      action_url: "/audio/sleep",
    });
  }
  if (hour >= 7 && hour < 9) {
    notifs.push({
      type: "morning",
      title: "Chào buổi sáng! ✨",
      body: "Bắt đầu ngày mới với một check-in cảm xúc nhỏ nhé.",
      action_url: "/dashboard",
    });
  }
  if (hour >= 20 && hour < 22) {
    notifs.push({
      type: "streak",
      title: "Đừng để streak bị gián đoạn",
      body: "Bạn chưa check-in hôm nay. Chỉ cần 30 giây để giữ chuỗi ngày của bạn.",
      action_url: "/dashboard",
    });
  }

  return notifs;
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/read");
      const json = (await res.json()) as { notifications: Notification[] };
      const fromDb = json.notifications ?? [];

      // Merge smart local notifications (not persisted) with DB ones
      const smart = generateSmartNotifications().map((n, i) => ({
        ...n,
        id: `smart-${i}`,
        is_read: false,
        created_at: new Date().toISOString(),
      }));

      // Only show smart ones if DB has no recent unread of same type
      const dbTypes = new Set(fromDb.filter((n) => !n.is_read).map((n) => n.type));
      const filteredSmart = smart.filter((n) => !dbTypes.has(n.type));

      setNotifications([...filteredSmart, ...fromDb]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  async function markAllRead() {
    const ids = notifications.filter((n) => !n.is_read && !n.id.startsWith("smart-")).map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    if (ids.length > 0) {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
    }
  }

  function handleOpen() {
    setOpen((v) => !v);
    if (!open) load();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        className="dash-control-btn relative h-[42px] w-[42px]"
        aria-label="Thông báo"
        aria-expanded={open}
      >
        {unreadCount > 0 ? (
          <BellRing className="h-[18px] w-[18px] text-[var(--green)]" />
        ) : (
          <Bell className="h-[18px] w-[18px] text-[var(--muted)]" />
        )}
        {unreadCount > 0 ? (
          <span className="absolute right-2 top-2 flex h-[8px] w-[8px] items-center justify-center rounded-full bg-[var(--green)]">
            <span className="h-full w-full animate-ping rounded-full bg-[var(--green)] opacity-75" />
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-[340px] overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--bg)] shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3.5">
              <span className="font-serif text-[16px] text-[var(--foreground)]">Thông báo</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-[11px] text-[var(--green)] hover:underline"
                  >
                    Đánh dấu đã đọc
                  </button>
                ) : null}
                <button type="button" onClick={() => setOpen(false)} className="text-[var(--muted)]">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="lumia-scroll max-h-[420px] overflow-y-auto">
              {loading ? (
                <div className="space-y-3 p-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="h-9 w-9 shrink-0 rounded-full bg-[var(--surface)]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 rounded-full bg-[var(--surface)]" />
                        <div className="h-3 w-full rounded-full bg-[var(--surface)]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <Bell className="h-10 w-10 opacity-20 text-[var(--muted)]" />
                  <p className="text-[13px] text-[var(--muted)]">Chưa có thông báo nào</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {notifications.map((n) => {
                    const Icon = TYPE_ICON[n.type] ?? BellRing;
                    const content = (
                      <div
                        className={cn(
                          "flex gap-3 px-4 py-3.5 transition hover:bg-[var(--surface)]",
                          !n.is_read && "bg-[var(--green-wash)]/30",
                        )}
                      >
                        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm", TYPE_COLOR[n.type])}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn("text-[13px] font-semibold leading-snug", n.is_read ? "text-[var(--muted)]" : "text-[var(--foreground)]")}>
                              {n.title}
                            </p>
                            {!n.is_read ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--green)]" /> : null}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-[var(--muted)]">{n.body}</p>
                          <p className="mt-1 text-[11px] text-[var(--muted)]/70">{timeAgo(n.created_at)}</p>
                        </div>
                      </div>
                    );

                    return n.action_url ? (
                      <Link key={n.id} href={n.action_url} onClick={() => setOpen(false)}>
                        {content}
                      </Link>
                    ) : (
                      <div key={n.id}>{content}</div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--border)] px-4 py-3">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="text-[12px] text-[var(--muted)] hover:text-[var(--green)]"
              >
                Cài đặt thông báo →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
