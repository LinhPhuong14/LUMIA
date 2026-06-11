import { getAppUrl } from "@/lib/app-url";

function resolveDemoMode() {
  if (process.env.DEMO_MODE !== undefined) {
    return process.env.DEMO_MODE === "true";
  }
  return process.env.VERCEL_ENV !== "production";
}

export const env = {
  APP_URL: getAppUrl(),
  DEMO_MODE: resolveDemoMode(),
  VERCEL_ENV: process.env.VERCEL_ENV,
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  PAYOS_CLIENT_ID: process.env.PAYOS_CLIENT_ID,
  PAYOS_API_KEY: process.env.PAYOS_API_KEY,
  PAYOS_CHECKSUM_KEY: process.env.PAYOS_CHECKSUM_KEY,
  PAYOS_WEBHOOK_URL: process.env.PAYOS_WEBHOOK_URL,
  LLM_API_KEY: process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY,
  LLM_BASE_URL: process.env.LLM_BASE_URL,
  LLM_MODEL: process.env.LLM_MODEL ?? "gpt-4o-mini",
  LLM_MAX_TOKENS: Number(process.env.LLM_MAX_TOKENS ?? "512"),
  LLM_TEMPERATURE: Number(process.env.LLM_TEMPERATURE ?? "0.7"),
  SAFETY_TRIPWIRE_ENABLED: (process.env.SAFETY_TRIPWIRE_ENABLED ?? "true") === "true",
  SAFETY_CLASSIFIER_ENABLED: (process.env.SAFETY_CLASSIFIER_ENABLED ?? "true") === "true",
  CRON_SECRET: process.env.CRON_SECRET,
  SEED_SECRET: process.env.SEED_SECRET,
};

export function hasSupabaseConfig() {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
}

export function hasSupabaseServiceRole() {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY);
}

export function hasPayOSConfig() {
  return Boolean(env.PAYOS_CLIENT_ID && env.PAYOS_API_KEY && env.PAYOS_CHECKSUM_KEY);
}

export function hasLlmConfig() {
  return Boolean(env.LLM_API_KEY);
}

/** @deprecated use hasLlmConfig — AI runs in-process, no separate service URL */
export function hasLumiaServiceConfig() {
  return hasLlmConfig();
}

export function isVercelCronAuthorized(request: Request) {
  if (!env.CRON_SECRET) {
    return false;
  }
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const header = request.headers.get("x-cron-secret");
  return bearer === env.CRON_SECRET || header === env.CRON_SECRET;
}
