"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

import { useVisualViewportOffset } from "@/lib/use-visual-viewport-offset";

type Message = { role: "user" | "assistant"; content: string; id: string };

const starters = [
  "Tối nay mình thấy hơi quá tải",
  "Mình đang không biết bắt đầu từ đâu",
  "Hôm nay mình mệt vì công việc",
] as const;

function ThinkingOrbs() {
  return (
    <div className="flex items-center gap-2 py-2">
      {[0, 0.3, 0.6].map((delay, i) => (
        <motion.span
          key={i}
          className="inline-block h-2 w-2 rounded-full bg-[var(--green)]"
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1, delay, repeat: Infinity, type: "spring", stiffness: 300, damping: 20 }}
        />
      ))}
    </div>
  );
}

function ListenWelcome({
  onPick,
  disabled,
  loading,
}: {
  onPick: (text: string) => void;
  disabled: boolean;
  loading: boolean;
}) {
  return (
    <div className="flex min-h-[min(420px,55vh)] flex-1 flex-col items-center justify-center px-4 py-8 text-center md:px-8">
      <div className="listen-welcome-glow mb-7" aria-hidden />
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
        LUMIA lắng nghe
      </p>
      <h2 className="mt-3 font-serif text-[1.65rem] font-medium tracking-[-0.02em] text-[var(--foreground)] md:text-[1.85rem]">
        LUMIA đang lắng nghe
      </h2>
      <p className="mt-3 max-w-md text-sm leading-7 text-[var(--muted)]">
        Hôm nay bạn muốn chia sẻ điều gì? Chọn một gợi ý hoặc viết trực tiếp bên dưới.
      </p>
      <div className="mt-7 flex max-w-xl flex-wrap justify-center gap-2.5">
        {starters.map((text) => (
          <button
            key={text}
            type="button"
            onClick={() => onPick(text)}
            disabled={disabled || loading}
            className="listen-starter-chip disabled:opacity-50"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}

function formatDateLabel(dateStr: string): string {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (dateStr === todayStr) return "Hôm nay";
  if (dateStr === yesterdayStr) return "Hôm qua";

  const d = new Date(dateStr + "T12:00:00+07:00");
  return d.toLocaleDateString("vi-VN", { day: "numeric", month: "long" });
}

function localToday(): string {
  const vn = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return vn.toISOString().slice(0, 10);
}

let msgCounter = 0;
function nextId() {
  return `msg-${++msgCounter}`;
}

export function AiStudio() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeDate, setActiveDate] = useState<string>(localToday());
  const [historyDates, setHistoryDates] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [usage, setUsage] = useState<{ remaining: number | null; limit: number | null }>({
    remaining: null,
    limit: null,
  });
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const keyboardOffset = useVisualViewportOffset();
  const today = localToday();
  const isToday = activeDate === today;

  // Load messages for activeDate
  useEffect(() => {
    setHistoryLoading(true);
    const url = activeDate === today
      ? "/api/chat/history"
      : `/api/chat/history?date=${activeDate}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Array<{ role: string; content: string }>) => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(
            data.map((m) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
              id: nextId(),
            })),
          );
        } else {
          setMessages([]);
        }
      })
      .catch(() => setMessages([]))
      .finally(() => setHistoryLoading(false));
  }, [activeDate, today]);

  // Load history date list
  useEffect(() => {
    fetch("/api/chat/history?days=30")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: string[]) => {
        if (Array.isArray(data)) setHistoryDates(data);
      })
      .catch(() => null);
  }, []);

  useEffect(() => {
    fetch("/api/chat/usage")
      .then((r) => r.json())
      .then((data: { remaining: number | null; limit: number | null }) => setUsage(data))
      .catch(() => null);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    if (usage.remaining === 0) return;
    if (!isToday) return; // can't send in past days

    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: text, id: nextId() }]);
    setInput("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (!response.ok) {
      const err = (await response.json()) as { error?: string };
      setMessages((prev) => [...prev, { role: "assistant", content: err.error ?? "Có lỗi xảy ra.", id: nextId() }]);
      setLoading(false);
      return;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = (await response.json()) as { content: string };
      setMessages((prev) => [...prev, { role: "assistant", content: data.content, id: nextId() }]);
    } else {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const assistantId = nextId();
      setMessages((prev) => [...prev, { role: "assistant", content: "", id: assistantId }]);

      if (reader) {
        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated = `${accumulated}${decoder.decode(value)}`;
          const nextText = accumulated;
          setMessages((prev) => {
            const next = [...prev];
            const idx = next.findIndex((m) => m.id === assistantId);
            if (idx !== -1) next[idx] = { ...next[idx], content: nextText };
            return next;
          });
        }
      }
    }

    // Refresh date list so today appears
    fetch("/api/chat/history?days=30")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: string[]) => { if (Array.isArray(data)) setHistoryDates(data); })
      .catch(() => null);

    const usageRes = await fetch("/api/chat/usage");
    const usageData = (await usageRes.json()) as { remaining: number | null; limit: number | null };
    setUsage(usageData);
    setLoading(false);
  }

  const disabled = usage.remaining === 0;
  const isEmpty = messages.length === 0 && !historyLoading;

  // Navigate between dates
  const dateIndex = historyDates.indexOf(activeDate);
  const canGoNewer = dateIndex > 0;
  const canGoOlder = dateIndex < historyDates.length - 1 || !historyDates.includes(activeDate);

  function goDate(dir: "newer" | "older") {
    if (dir === "newer") {
      if (dateIndex <= 0) { setActiveDate(today); return; }
      setActiveDate(historyDates[dateIndex - 1]);
    } else {
      if (dateIndex === -1) {
        setActiveDate(historyDates[0] ?? today);
      } else if (dateIndex < historyDates.length - 1) {
        setActiveDate(historyDates[dateIndex + 1]);
      }
    }
  }

  return (
    <div className="chat-container h-full min-h-0 lg:grid lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[minmax(0,240px)_minmax(0,1fr)] xl:gap-5">
      {/* ── Left sidebar ── */}
      <section className="dash-panel hidden shrink-0 flex-col p-5 lg:flex">
        {/* Quick starters (only show when on today) */}
        {isToday ? (
          <>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              Bắt đầu nhanh
            </span>
            <div className="mt-4 flex flex-col gap-2">
              {starters.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => sendMessage(text)}
                  disabled={disabled || loading}
                  className="listen-starter-chip w-full rounded-[18px] px-4 py-3 text-left disabled:opacity-50"
                >
                  {text}
                </button>
              ))}
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setActiveDate(today)}
            className="flex items-center gap-2 rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[13px] font-medium text-[var(--green-deep)] transition hover:border-[var(--green)]/40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Quay về hôm nay
          </button>
        )}

        {/* History section */}
        {historyDates.length > 0 ? (
          <div className="mt-5 flex-1 overflow-y-auto">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
              <Clock className="h-3 w-3" />
              Lịch sử
            </span>
            <div className="mt-3 flex flex-col gap-1">
              {historyDates.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setActiveDate(d)}
                  className={`rounded-[14px] px-3 py-2 text-left text-[12.5px] transition ${
                    d === activeDate
                      ? "bg-[var(--green-wash)] font-semibold text-[var(--green-deep)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {formatDateLabel(d)}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {usage.limit !== null ? (
          <p className="mt-auto pt-4 text-xs text-[var(--muted)]">
            Còn {usage.remaining}/{usage.limit} lượt hôm nay
          </p>
        ) : null}
      </section>

      {/* ── Chat panel ── */}
      <section className="dash-panel relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-0">
        <AnimatePresence>
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-10 bg-[var(--green-wash)]/30"
            />
          ) : null}
        </AnimatePresence>

        {/* Header */}
        <div className="shrink-0 border-b border-[var(--border)] px-5 py-3 lg:px-7">
          <div className="flex items-center justify-between gap-3">
            {/* Mobile: date navigation */}
            <div className="flex items-center gap-1 lg:hidden">
              <button
                type="button"
                onClick={() => goDate("older")}
                disabled={!canGoOlder && historyDates.length === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface)] disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                  showHistory
                    ? "border-[var(--green)] bg-[var(--green-wash)] text-[var(--green-deep)]"
                    : "border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                <Clock className="h-3 w-3" />
                {formatDateLabel(activeDate)}
              </button>
              <button
                type="button"
                onClick={() => goDate("newer")}
                disabled={!canGoNewer && isToday}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface)] disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <span className="hidden items-center gap-2 text-[13px] font-semibold text-[var(--foreground)] lg:flex">
              {formatDateLabel(activeDate)}
            </span>

            <span className="hidden rounded-full border border-[var(--border)] bg-[var(--glass-control)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] lg:inline-flex">
              LUMIA lắng nghe
            </span>
          </div>

          {/* Mobile history dropdown */}
          <AnimatePresence>
            {showHistory && historyDates.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 flex flex-wrap gap-1.5 pb-1">
                  {historyDates.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => { setActiveDate(d); setShowHistory(false); }}
                      className={`rounded-full border px-3 py-1 text-[12px] transition ${
                        d === activeDate
                          ? "border-[var(--green)] bg-[var(--green-wash)] font-semibold text-[var(--green-deep)]"
                          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--green)]/40"
                      }`}
                    >
                      {formatDateLabel(d)}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Messages */}
        <div
          className={`chat-messages lumia-scroll flex min-h-0 flex-1 flex-col px-4 py-4 pb-[calc(var(--mobile-tab-bar-offset)+5rem)] lg:px-7 lg:py-5 lg:pb-5 ${
            isEmpty ? "justify-center" : "space-y-3"
          }`}
        >
          {historyLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--green)] border-t-transparent" />
            </div>
          ) : isEmpty ? (
            isToday ? (
              <ListenWelcome onPick={sendMessage} disabled={disabled} loading={loading} />
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <span className="text-4xl opacity-30">💬</span>
                <p className="text-[14px] text-[var(--muted)]">Không có cuộc trò chuyện nào vào ngày này.</p>
                <button
                  type="button"
                  onClick={() => setActiveDate(today)}
                  className="mt-2 rounded-full border border-[var(--border)] px-4 py-2 text-[13px] font-medium text-[var(--muted)] transition hover:border-[var(--green)]/40 hover:text-[var(--foreground)]"
                >
                  Quay về hôm nay
                </button>
              </div>
            )
          ) : (
            <>
              {/* Date label at top of past conversations */}
              {!isToday ? (
                <div className="mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {formatDateLabel(activeDate)}
                </div>
              ) : null}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.95, x: msg.role === "user" ? 12 : -12 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.2 }}
                  className={`px-4 py-3 text-[15px] leading-7 ${
                    msg.role === "user" ? "listen-msg-user" : "listen-msg-assistant"
                  }`}
                >
                  {msg.content}
                  {msg.role === "assistant" && loading && msg === messages[messages.length - 1] && msg.content ? (
                    <span className="animate-pulse">|</span>
                  ) : null}
                </motion.div>
              ))}
              {loading && messages[messages.length - 1]?.role === "user" ? <ThinkingOrbs /> : null}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {disabled && isToday ? (
          <div className="mx-4 mb-2 shrink-0 rounded-[18px] border border-[var(--border)] bg-[var(--green-wash)] px-4 py-3 text-sm text-[var(--foreground)] lg:mx-7">
            Đã hết lượt chat hôm nay.{" "}
            <Link href="/store" className="font-semibold text-[var(--green-deep)] underline">
              Khám phá gói LUMIA
            </Link>{" "}
            để tiếp tục không giới hạn.
          </div>
        ) : null}

        {usage.limit !== null && isToday ? (
          <p className="px-4 pb-1 text-center text-[11px] text-[var(--muted)] lg:hidden">
            Còn {usage.remaining}/{usage.limit} lượt hôm nay
          </p>
        ) : null}

        {/* Input bar - only shown for today */}
        {isToday ? (
          <form
            className="chat-input-bar listen-input-bar fixed inset-x-0 z-30 flex shrink-0 gap-2 px-4 py-3 lg:static lg:z-auto lg:px-7 lg:py-5"
            style={{
              bottom: `calc(var(--mobile-tab-bar-offset) + var(--safe-bottom) + ${keyboardOffset}px)`,
            }}
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={2000}
              disabled={disabled || loading}
              className="min-h-[44px] flex-1 rounded-full border border-[var(--border)] bg-[var(--surface-card)] px-4 py-3 text-[15px] text-[var(--foreground)] outline-none ring-[var(--green)]/20 focus:ring-4 disabled:opacity-50"
              placeholder="Viết điều đang ở trong lòng bạn…"
            />
            <button
              type="submit"
              disabled={disabled || loading || !input.trim()}
              className="dash-accent-btn min-h-[44px] shrink-0 px-5 disabled:opacity-50"
            >
              Gửi
            </button>
          </form>
        ) : (
          /* Past day - show read-only notice at bottom */
          <div className="shrink-0 border-t border-[var(--border)] px-4 py-3 text-center text-[12px] text-[var(--muted)] lg:px-7">
            Đây là lịch sử trò chuyện.{" "}
            <button
              type="button"
              onClick={() => setActiveDate(today)}
              className="font-semibold text-[var(--green-deep)] underline"
            >
              Quay về hôm nay
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
