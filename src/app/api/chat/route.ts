import { NextResponse } from "next/server";
import { z } from "zod";

import { runChat } from "@/lib/ai/chat-pipeline";
import type { ChatHistoryMessage } from "@/lib/ai/chat-pipeline";
import { env, hasLlmConfig } from "@/lib/env";
import { logActivity } from "@/lib/streak";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/supabase/auth";

const FREE_DAILY_LIMIT = 3;
const schema = z.object({ message: z.string().min(1).max(2000) });

export const runtime = "nodejs";

async function incrementDailyUsage(supabase: SupabaseClient, userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("chat_daily_usage")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle();

  if (existing) {
    await supabase.from("chat_daily_usage").update({ count: existing.count + 1 }).eq("id", existing.id);
  } else {
    await supabase.from("chat_daily_usage").insert({ user_id: userId, date: today, count: 1 });
  }
}

async function loadChatHistory(userId: string): Promise<ChatHistoryMessage[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("user_id", userId)
    .gte("created_at", `${today}T00:00:00.000Z`)
    .order("created_at", { ascending: true })
    .limit(20);

  return (data ?? []).map((row) => ({
    role: row.role as "user" | "assistant",
    content: row.content,
  }));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  const snapshot = await getSubscriptionSnapshot(session.id);
  const supabase = await createClient();

  if (!snapshot.isActive && supabase) {
    const today = new Date().toISOString().slice(0, 10);
    const { data: usage } = await supabase
      .from("chat_daily_usage")
      .select("count")
      .eq("user_id", session.id)
      .eq("date", today)
      .maybeSingle();

    if ((usage?.count ?? 0) >= FREE_DAILY_LIMIT) {
      return NextResponse.json({ error: "Đã hết lượt chat hôm nay. Mua hộp để tiếp tục." }, { status: 429 });
    }
  }

  if (!hasLlmConfig()) {
    const fallback = "Mình nghe thấy bạn. Hãy thử hít sâu ba lần — mình ở đây cùng bạn.";
    return NextResponse.json({ content: fallback, mode: env.DEMO_MODE ? "demo" : "unconfigured" });
  }

  const history = await loadChatHistory(session.id);
  const encoder = new TextEncoder();
  let fullContent = "";
  let escalated = false;

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of runChat({
          userName: session.name,
          message: parsed.data.message,
          history,
        })) {
          if (chunk.type === "meta" && chunk.safety_flag) {
            escalated = true;
          }
          if (chunk.type === "token") {
            fullContent += chunk.text;
            controller.enqueue(encoder.encode(chunk.text));
          }
          if (chunk.type === "error") {
            controller.enqueue(encoder.encode("LUMIA tạm thời không phản hồi được. Bạn thử lại sau nhé."));
          }
        }
      } catch {
        controller.enqueue(encoder.encode("LUMIA tạm thời không phản hồi được. Bạn thử lại sau nhé."));
      } finally {
        controller.close();

        if (supabase && fullContent) {
          const { data: chatSession } = await supabase.from("chat_sessions").insert({ user_id: session.id }).select().single();
          if (chatSession) {
            await supabase.from("chat_messages").insert([
              { session_id: chatSession.id, user_id: session.id, role: "user", content: parsed.data.message },
              { session_id: chatSession.id, user_id: session.id, role: "assistant", content: fullContent },
            ]);
          }
        }
        if (!snapshot.isActive && supabase) await incrementDailyUsage(supabase, session.id);
        await logActivity(session.id, "chat");

        if (escalated) {
          // crisis response streamed via pipeline
        }
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
