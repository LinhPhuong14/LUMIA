"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

let msgCounter = 0;
function nextId() {
  return `msg-${++msgCounter}`;
}

export function AiStudio() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [usage, setUsage] = useState<{ remaining: number | null; limit: number | null }>({
    remaining: null,
    limit: null,
  });
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const keyboardOffset = useVisualViewportOffset();

  // (#006) Load today's chat history on mount so refresh preserves context
  useEffect(() => {
    setHistoryLoading(true);
    fetch("/api/chat/history")
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
        }
      })
      .catch(() => null)
      .finally(() => setHistoryLoading(false));
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
            if (idx !== -1) {
              next[idx] = { ...next[idx], content: nextText };
            }
            return next;
          });
        }
      }
    }

    const usageRes = await fetch("/api/chat/usage");
    const usageData = (await usageRes.json()) as { remaining: number | null; limit: number | null };
    setUsage(usageData);
    setLoading(false);
  }

  const disabled = usage.remaining === 0;
  const isEmpty = messages.length === 0 && !historyLoading;

  return (
    <div className="chat-container h-full min-h-0 lg:grid lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[minmax(0,240px)_minmax(0,1fr)] xl:gap-5">
      <section className="dash-panel hidden shrink-0 flex-col p-5 lg:flex">
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
        {usage.limit !== null ? (
          <p className="mt-auto pt-4 text-xs text-[var(--muted)]">
            Còn {usage.remaining}/{usage.limit} lượt hôm nay
          </p>
        ) : null}
      </section>

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

        <div className="shrink-0 border-b border-[var(--border)] px-5 py-4 text-center lg:px-7">
          <span className="inline-flex rounded-full border border-[var(--border)] bg-[var(--glass-control)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
            LUMIA lắng nghe
          </span>
          <p className="mx-auto mt-3 max-w-lg text-xs leading-6 text-[var(--muted)]">
            LUMIA không thay thế chuyên gia y tế hoặc chuyên gia tâm lý.
          </p>
        </div>

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
            <ListenWelcome onPick={sendMessage} disabled={disabled} loading={loading} />
          ) : (
            <>
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

        {disabled ? (
          <div className="mx-4 mb-2 shrink-0 rounded-[18px] border border-[var(--border)] bg-[var(--green-wash)] px-4 py-3 text-sm text-[var(--foreground)] lg:mx-7">
            Đã hết lượt chat hôm nay.{" "}
            <Link href="/boxes" className="font-semibold text-[var(--green-deep)] underline">
              Khám phá gói LUMIA
            </Link>{" "}
            để tiếp tục không giới hạn.
          </div>
        ) : null}

        {usage.limit !== null ? (
          <p className="px-4 pb-1 text-center text-[11px] text-[var(--muted)] lg:hidden">
            Còn {usage.remaining}/{usage.limit} lượt hôm nay
          </p>
        ) : null}

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
      </section>
    </div>
  );
}
