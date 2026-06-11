"use client";

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
    <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
      <section className="soft-card p-5">
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

      <section className="soft-card flex min-h-[560px] flex-col p-6">
        <div>
          <span className="eyebrow">LUMIA lắng nghe</span>
          <p className="mt-2 text-xs text-muted">
            LUMIA không thay thế chuyên gia y tế hoặc chuyên gia tâm lý.
          </p>
        </div>

        <div className="mt-6 flex-1 space-y-3 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-muted">Hôm nay bạn muốn LUMIA lắng nghe điều gì?</p>
          ) : null}
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[85%] rounded-[24px] px-4 py-3 text-sm leading-7 ${
                msg.role === "user"
                  ? "ml-auto bg-[#DDE8D2] text-matcha-deep"
                  : "bg-white text-matcha-deep shadow-sm"
              }`}
            >
              {msg.content}
            </motion.div>
          ))}
          {loading ? <p className="text-sm text-muted">LUMIA đang lắng nghe...</p> : null}
          <div ref={bottomRef} />
        </div>

        {disabled ? (
          <p className="mt-4 text-sm text-[#9A5B5B]">Đã hết lượt chat hôm nay. Mua hộp LUMIA để tiếp tục.</p>
        ) : null}

        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled || loading}
            className="flex-1 rounded-[20px] border border-matcha-soft bg-white px-4 py-3 text-sm outline-none disabled:opacity-50"
            placeholder="Viết điều đang ở trong lòng bạn…"
          />
          <button type="submit" disabled={disabled || loading} className="button-primary disabled:opacity-50">
            Gửi
          </button>
        </form>
      </section>
    </div>
  );
}
