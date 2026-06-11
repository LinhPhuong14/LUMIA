import OpenAI from "openai";

import { env, hasLlmConfig } from "@/lib/env";

let client: OpenAI | null = null;
let cachedConfigKey: string | null = null;

function readLlmEnv() {
  const apiKey = process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY;
  const baseURL = process.env.LLM_BASE_URL;
  return { apiKey, baseURL };
}

function llmConfigKey() {
  const { apiKey, baseURL } = readLlmEnv();
  return `${apiKey ?? ""}|${baseURL ?? ""}`;
}

function getClient() {
  if (!hasLlmConfig()) {
    throw new Error("LLM not configured.");
  }

  const { apiKey, baseURL } = readLlmEnv();
  const configKey = llmConfigKey();
  if (!client || cachedConfigKey !== configKey) {
    cachedConfigKey = configKey;
    client = new OpenAI({
      apiKey: apiKey!,
      ...(baseURL ? { baseURL } : {}),
    });
    if (process.env.NODE_ENV !== "production") {
      console.info("[LLM] client initialized (key changed or first use)");
    }
  }

  return client;
}

function logLlmError(context: string, error: unknown) {
  if (process.env.NODE_ENV !== "production") {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[LLM ${context}]`, message);
  }
}

export async function llmComplete(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) {
  try {
    const openai = getClient();
    const resp = await openai.chat.completions.create({
      model: env.LLM_MODEL,
      messages,
      max_tokens: env.LLM_MAX_TOKENS,
      temperature: env.LLM_TEMPERATURE,
    });
    return resp.choices[0]?.message?.content ?? "";
  } catch (error) {
    logLlmError("complete", error);
    throw error;
  }
}

export async function* llmStream(messages: Array<{ role: "system" | "user" | "assistant"; content: string }>) {
  try {
    const openai = getClient();
    const stream = await openai.chat.completions.create({
      model: env.LLM_MODEL,
      messages,
      max_tokens: env.LLM_MAX_TOKENS,
      temperature: env.LLM_TEMPERATURE,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  } catch (error) {
    logLlmError("stream", error);
    throw error;
  }
}
