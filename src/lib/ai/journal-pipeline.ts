import { detectInjection } from "@/lib/ai/guard/injection";
import { wrapUserInput } from "@/lib/ai/guard/wrap";
import { llmComplete } from "@/lib/ai/llm";
import { buildReflectSystem } from "@/lib/ai/prompts/journal-reflect";
import { crisisResponse } from "@/lib/ai/safety/crisis-response";
import { checkSafety } from "@/lib/ai/safety/service";

/** Ported from lumia_service_ai/app/pipeline/journal_pipeline.py — reflect */
export async function runReflect(params: { userName: string; text: string }) {
  const risk = await checkSafety(params.text);

  if (risk === "high") {
    return {
      reflection: crisisResponse(params.userName),
      safety_flag: true,
      risk_level: "high" as const,
    };
  }

  const injection = detectInjection(params.text);
  const messages = [
    { role: "system" as const, content: buildReflectSystem(params.userName, injection) },
    { role: "user" as const, content: wrapUserInput(params.text) },
  ];

  const text = (await llmComplete(messages)).trim();
  return {
    reflection: text,
    safety_flag: false,
    risk_level: "none" as const,
  };
}
