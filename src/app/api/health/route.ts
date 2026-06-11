import { NextResponse } from "next/server";

import { env, hasLlmConfig, hasPayOSConfig, hasSupabaseConfig, hasSupabaseSecretKey } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    appUrl: env.APP_URL,
    vercelEnv: env.VERCEL_ENV ?? "local",
    demoMode: env.DEMO_MODE,
    supabase: {
      client: hasSupabaseConfig(),
      secretKey: hasSupabaseSecretKey(),
    },
    payos: hasPayOSConfig(),
    ai: {
      mode: "in-process",
      configured: hasLlmConfig(),
      model: env.LLM_MODEL,
      tripwire: env.SAFETY_TRIPWIRE_ENABLED,
      classifier: env.SAFETY_CLASSIFIER_ENABLED,
    },
  });
}
