"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Message = { role: "user" | "assistant"; content: string };

const starters = [
  "Tối nay mình thấy hơi quá tải",
  "Mình đang không biết bắt đầu từ đâu",
  "Hôm nay mình mệt vì công việc",
] as const;

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
      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value);
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "assistant", content: assistantText };
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
    <div className="chat-container flex h-full min-h-0 flex-col lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6">
      <section className="soft-card hidden p-5 xl:block">
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

      <section className="soft-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] p-0 lg:p-6">
        <div className="hidden border-b border-white/60 px-5 py-4 lg:block">
          <span className="eyebrow">LUMIA lắng nghe</span>
          <p className="mt-2 text-xs text-muted">
            LUMIA không thay thế chuyên gia y tế hoặc chuyên gia tâm lý.
          </p>
        </div>

        <div className="chat-messages space-y-3 px-4 py-4 pb-24 lg:mt-6 lg:px-0 lg:py-0 lg:pb-0">
          {messages.length === 0 ? (
            <div className="py-6 text-center lg:text-left">
              <p className="font-sans text-base font-medium text-matcha-text">LUMIA đang lắng nghe</p>
              <p className="mt-2 text-sm text-muted">Hôm nay bạn muốn chia sẻ điều gì?</p>
            </div>
          ) : null}
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[88%] rounded-[20px] px-4 py-3 text-[15px] leading-7 ${
                msg.role === "user"
                  ? "ml-auto bg-matcha-soft text-matcha-deep"
                  : "bg-white text-matcha-deep shadow-sm"
              }`}
            >
              {msg.content}
            </motion.div>
          ))}
          {loading ? <p className="text-sm text-muted">LUMIA đang lắng nghe...</p> : null}
          <div ref={bottomRef} />
        </div>

        {messages.length === 0 ? (
          <div className="mobile-h-scroll border-t border-white/60 px-4 py-3 lg:hidden">
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
          <div className="mx-4 mb-2 rounded-[18px] border border-honey/50 bg-champagne/30 px-4 py-3 text-sm text-matcha-deep lg:mx-0 lg:mt-4">
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
          className="chat-input-bar fixed inset-x-0 bottom-[calc(var(--mobile-tab-bar-height)+var(--safe-bottom))] z-30 flex gap-2 border-t border-white/60 bg-white/92 px-4 py-3 backdrop-blur-md lg:static lg:z-auto lg:mt-4 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none"
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
