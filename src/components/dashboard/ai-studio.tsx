"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { EmptyState } from "@/components/ui/empty-state";

type Message = { role: "user" | "assistant"; content: string };

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
          className="inline-block h-2 w-2 rounded-full bg-matcha-deep"
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1, delay, repeat: Infinity, type: "spring", stiffness: 300, damping: 20 }}
        />
      ))}
    </div>
  );
}

function LeafAccent() {
  return (
    <svg className="absolute left-3 top-3 h-3 w-3 opacity-40" viewBox="0 0 12 12" aria-hidden>
      <path d="M6 1C4 4 3 6 2 9c2-1 3-1 4 0 1-2 2-4 4-7-2 2-3 3-3 5s1 4 3 6c-1-3-1-5 0-8z" fill="#7d8f68" />
    </svg>
  );
}

export function AiStudio() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<{ remaining: number | null; limit: number | null }>({ remaining: null, limit: null });
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });

    if (!response.ok) {
      const err = (await response.json()) as { error?: string };
      setMessages((prev) => [...prev, { role: "assistant", content: err.error ?? "Có lỗi xảy ra." }]);
      setLoading(false);
      return;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = (await response.json()) as { content: string };
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } else {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated = `${accumulated}${decoder.decode(value)}`;
          const nextText = accumulated;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "assistant", content: nextText };
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

  return (
    <div className="chat-container h-full min-h-0 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6">
      <section className="dash-panel hidden shrink-0 p-5 xl:block">
        <span className="eyebrow">Bắt đầu nhanh</span>
        <div className="mt-4 space-y-2">
          {starters.map((text) => (
            <button
              key={text}
              type="button"
              onClick={() => sendMessage(text)}
              disabled={disabled || loading}
              className="w-full rounded-[20px] border border-white/70 bg-white px-4 py-3 text-left text-sm text-matcha-deep disabled:opacity-50"
            >
              {text}
            </button>
          ))}
        </div>
        {usage.limit !== null ? (
          <p className="mt-4 text-xs text-muted">Còn {usage.remaining}/{usage.limit} lượt hôm nay</p>
        ) : null}
      </section>

      <section className="dash-panel lumia-grain-soft relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-0 lg:p-7">
        <AnimatePresence>
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 z-10 bg-matcha/5"
            />
          ) : null}
        </AnimatePresence>

        <div className="hidden shrink-0 border-b border-white/60 px-5 py-4 lg:block">
          <span className="eyebrow">LUMIA lắng nghe</span>
          <p className="mt-2 text-xs text-muted">
            LUMIA không thay thế chuyên gia y tế hoặc chuyên gia tâm lý.
          </p>
        </div>

        <div className="chat-messages lumia-scroll space-y-3 px-4 py-4 pb-24 lg:mt-6 lg:px-0 lg:py-0 lg:pb-0">
          {messages.length === 0 ? (
            <EmptyState
              scene="chat"
              title="LUMIA đang lắng nghe"
              description="Hôm nay bạn muốn chia sẻ điều gì?"
            />
          ) : null}
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95, x: msg.role === "user" ? 12 : -12 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.2 }}
              className={`relative max-w-[75%] rounded-[20px] px-4 py-3 text-[15px] leading-7 ${
                msg.role === "user"
                  ? "ml-auto bg-matcha-deep text-white"
                  : "glass-card max-w-[85%] text-matcha-deep"
              }`}
              style={
                msg.role === "user"
                  ? { borderRadius: "20px 20px 4px 20px" }
                  : { borderRadius: "20px 20px 20px 4px" }
              }
            >
              {msg.role === "assistant" ? <LeafAccent /> : null}
              {msg.content}
              {msg.role === "assistant" && loading && i === messages.length - 1 && msg.content ? (
                <span className="animate-pulse">|</span>
              ) : null}
            </motion.div>
          ))}
          {loading && messages[messages.length - 1]?.role === "user" ? <ThinkingOrbs /> : null}
          <div ref={bottomRef} />
        </div>

        {messages.length === 0 ? (
          <div className="mobile-h-scroll shrink-0 border-t border-white/60 px-4 py-3 lg:hidden">
            {starters.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => sendMessage(text)}
                disabled={disabled || loading}
                className="rounded-full border border-white/70 bg-white/90 px-4 py-2.5 text-[13px] text-matcha-deep disabled:opacity-50"
              >
                {text}
              </button>
            ))}
          </div>
        ) : null}

        {disabled ? (
          <div className="mx-4 mb-2 shrink-0 rounded-[18px] border border-honey/50 bg-champagne/30 px-4 py-3 text-sm text-matcha-deep lg:mx-0 lg:mt-4">
            Đã hết lượt chat hôm nay.{" "}
            <Link href="/boxes" className="font-semibold underline">
              Khám phá gói LUMIA
            </Link>{" "}
            để tiếp tục không giới hạn.
          </div>
        ) : null}

        {usage.limit !== null ? (
          <p className="px-4 pb-1 text-center text-[11px] text-muted lg:hidden">
            Còn {usage.remaining}/{usage.limit} lượt hôm nay
          </p>
        ) : null}

        <form
          className="chat-input-bar fixed inset-x-0 bottom-[calc(var(--mobile-tab-bar-height)+var(--safe-bottom))] z-30 flex shrink-0 gap-2 border-t border-white/60 bg-white/92 px-4 py-3 backdrop-blur-md lg:static lg:z-auto lg:mt-auto lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled || loading}
            className="min-h-[44px] flex-1 rounded-full border border-matcha-soft bg-white px-4 py-3 text-[15px] outline-none disabled:opacity-50"
            placeholder="Viết điều đang ở trong lòng bạn…"
          />
          <button
            type="submit"
            disabled={disabled || loading}
            className="button-primary min-h-[44px] shrink-0 rounded-full px-5 disabled:opacity-50"
          >
            Gửi
          </button>
        </form>
      </section>
    </div>
  );
}
