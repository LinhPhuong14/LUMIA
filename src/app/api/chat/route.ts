import { NextResponse } from "next/server";
import { z } from "zod";

import { runChat } from "@/lib/ai/chat-pipeline";
import type { ChatHistoryMessage } from "@/lib/ai/chat-pipeline";
import { getUserContext } from "@/lib/ai/user-context";
import { env, hasLlmConfig } from "@/lib/env";
import { localDateString } from "@/lib/local-date";
import { logActivity } from "@/lib/streak";
import { getSubscriptionSnapshot } from "@/lib/subscriptions";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSession } from "@/lib/supabase/auth";

const FREE_DAILY_LIMIT = 3;
const schema = z.object({ message: z.string().min(1).max(2000) });

export const runtime = "nodejs";

async function incrementDailyUsage(supabase: SupabaseClient, userId: string) {
  const today = localDateString();
  await supabase.rpc("increment_chat_usage", { p_user_id: userId, p_date: today });
}

async function loadChatHistory(userId: string): Promise<ChatHistoryMessage[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const today = localDateString();
  const { data } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("user_id", userId)
    .gte("created_at", `${today}T00:00:00+07:00`)
    .order("created_at", { ascending: true })
    .limit(20);

  return (data ?? []).map((row) => ({
    role: row.role as "user" | "assistant",
    content: row.content,
  }));
}

async function getOrCreateChatSession(
  supabase: SupabaseClient,
  userId: string,
  date: string,
): Promise<string | null> {
  // SELECT first (fast path — session usually already exists)
  const { data: existing } = await supabase
    .from("chat_sessions")
    .select("id")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (existing?.id) return existing.id;

  // INSERT new session for today
  const { data: created, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: userId, date })
    .select("id")
    .single();

  if (error) {
    // Could be unique-constraint race — try SELECT once more
    const { data: retry } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("user_id", userId)
      .eq("date", date)
      .maybeSingle();
    return retry?.id ?? null;
  }

  return created?.id ?? null;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Bạn cần đăng nhập để tiếp tục." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Tin nhắn không hợp lệ." }, { status: 400 });
  }

  const snapshot = await getSubscriptionSnapshot(session.id);
  const supabase = await createClient();

  if (!snapshot.isActive && supabase) {
    const today = localDateString();
    const { data: usage } = await supabase
      .from("chat_daily_usage")
      .select("count")
      .eq("user_id", session.id)
      .eq("date", today)
      .maybeSingle();

    if ((usage?.count ?? 0) >= FREE_DAILY_LIMIT) {
      return NextResponse.json(
        { error: "Đã hết lượt chat hôm nay. Mua hộp để tiếp tục." },
        { status: 429 },
      );
    }
  }

  if (!hasLlmConfig()) {
    const fallback = "Mình nghe thấy bạn. Hãy thử hít sâu ba lần - mình ở đây cùng bạn.";
    return NextResponse.json({ content: fallback, mode: env.DEMO_MODE ? "demo" : "unconfigured" });
  }

  const [history, userContext] = await Promise.all([
    loadChatHistory(session.id),
    getUserContext(session.id, session.name, snapshot.isActive),
  ]);

  const encoder = new TextEncoder();
  let fullContent = "";
  let escalated = false;
  let hasError = false;

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of runChat({
          userName: session.name,
          message: parsed.data.message,
          history,
          userContext,
        })) {
          if (chunk.type === "meta" && chunk.safety_flag) escalated = true;
          if (chunk.type === "token") {
            fullContent += chunk.text;
            controller.enqueue(encoder.encode(chunk.text));
          }
          if (chunk.type === "error") {
            hasError = true;
            controller.enqueue(
              encoder.encode("LUMIA tạm thời không phản hồi được. Bạn thử lại sau nhé."),
            );
          }
        }
      } catch {
        hasError = true;
        controller.enqueue(
          encoder.encode("LUMIA tạm thời không phản hồi được. Bạn thử lại sau nhé."),
        );
      }

      // Save to DB BEFORE closing stream so serverless doesn't cut off
      if (supabase && fullContent && !hasError) {
        try {
          const today = localDateString();
          // Best-effort session lookup — session_id is now nullable so save proceeds regardless
          const sessionId = await getOrCreateChatSession(supabase, session.id, today);
          const { error: insertError } = await supabase.from("chat_messages").insert([
            {
              session_id: sessionId,   // nullable — null is fine if session failed
              user_id: session.id,
              role: "user",
              content: parsed.data.message,
            },
            {
              session_id: sessionId,
              user_id: session.id,
              role: "assistant",
              content: fullContent,
            },
          ]);
          if (insertError) {
            console.error("[chat] message save failed:", insertError.message);
          }
        } catch (e) {
          console.error("[chat] message save exception:", e);
        }
      }

      if (!snapshot.isActive && supabase && !hasError) {
        try { await incrementDailyUsage(supabase, session.id); } catch { /* noop */ }
      }

      try { await logActivity(session.id, "chat"); } catch { /* noop */ }

      void escalated;
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
