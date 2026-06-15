import { detectInjection } from "@/lib/ai/guard/injection";
import { wrapUserInput } from "@/lib/ai/guard/wrap";
import { llmStream } from "@/lib/ai/llm";
import { buildChatbotSystem } from "@/lib/ai/prompts/chatbot";
import { crisisResponse } from "@/lib/ai/safety/crisis-response";
import { checkSafety } from "@/lib/ai/safety/service";
import type { UserContext } from "@/lib/ai/user-context";

export type ChatHistoryMessage = { role: "user" | "assistant"; content: string };

const HISTORY_MAX = 10;

/** Ported from lumia_service_ai/app/pipeline/chat_pipeline.py */
export async function* runChat(params: {
  userName: string;
  message: string;
  history?: ChatHistoryMessage[];
  userContext?: UserContext;
}): AsyncGenerator<
  | { type: "meta"; safety_flag: boolean; risk_level: string }
  | { type: "token"; text: string }
  | { type: "done"; finish_reason: string }
  | { type: "error"; error: string }
> {
  const risk = await checkSafety(params.message);

  if (risk === "high") {
    yield { type: "meta", safety_flag: true, risk_level: "high" };
    yield { type: "token", text: crisisResponse(params.userName) };
    yield { type: "done", finish_reason: "safety" };
    return;
  }

  yield { type: "meta", safety_flag: false, risk_level: "none" };

  const injection = detectInjection(params.message);
  const system = buildChatbotSystem(params.userName, injection, params.userContext);
  const history = (params.history ?? []).slice(-HISTORY_MAX);

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: system },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: wrapUserInput(params.message) },
  ];

  try {
    for await (const token of llmStream(messages)) {
      yield { type: "token", text: token };
    }
    yield { type: "done", finish_reason: "stop" };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[chat-pipeline] llmStream failed:", message);
    }
    yield { type: "error", error: "llm_unavailable" };
    yield { type: "done", finish_reason: "error" };
  }
}
