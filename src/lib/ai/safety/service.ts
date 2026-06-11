import { buildClassifierMessages } from "@/lib/ai/prompts/safety-classifier";
import { llmComplete } from "@/lib/ai/llm";
import { tripwireHit } from "@/lib/ai/safety/tripwire";
import { env } from "@/lib/env";

export type RiskLevel = "none" | "low" | "high";

function parseRiskLevel(raw: string): RiskLevel {
  try {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end < 0) return "none";
    const data = JSON.parse(raw.slice(start, end + 1)) as { risk_level?: string };
    if (data.risk_level === "high" || data.risk_level === "low") return data.risk_level;
    return "none";
  } catch {
    return "none";
  }
}

/** Ported from lumia_service_ai/app/safety/service.py */
export async function checkSafety(text: string): Promise<RiskLevel> {
  if (env.SAFETY_TRIPWIRE_ENABLED && tripwireHit(text)) {
    return "high";
  }

  if (env.SAFETY_CLASSIFIER_ENABLED) {
    try {
      const raw = await llmComplete(buildClassifierMessages(text));
      if (parseRiskLevel(raw) === "high") return "high";
    } catch {
      // rely on tripwire only
    }
  }

  return "none";
}
