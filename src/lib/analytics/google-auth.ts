import "server-only";

import { createSign } from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const TOKEN_TTL_SECONDS = 3600;
/** Đổi token sớm 60s để không dùng đúng token vừa hết hạn giữa chừng. */
const REFRESH_MARGIN_MS = 60_000;

export const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
export const SEARCH_CONSOLE_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

export type ServiceAccountCredentials = {
  email: string;
  privateKey: string;
};

/**
 * Env một dòng lưu private key dưới dạng `\n` escape (và thường kèm dấu nháy
 * khi copy từ file JSON) — phải trả về newline thật thì crypto mới parse được.
 */
export function normalizePrivateKey(rawKey: string): string {
  return rawKey
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n")
    .trim();
}

export function getServiceAccountCredentials(): ServiceAccountCredentials | null {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !rawKey) {
    return null;
  }

  const privateKey = normalizePrivateKey(rawKey);
  if (!privateKey.includes("BEGIN")) {
    return null;
  }

  return { email, privateKey };
}

export function hasServiceAccount(): boolean {
  return getServiceAccountCredentials() !== null;
}

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** JWT assertion RS256 theo luồng OAuth 2.0 service account của Google. */
export function buildJwtAssertion(
  credentials: ServiceAccountCredentials,
  scope: string,
  nowSeconds: number,
): string {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: credentials.email,
      scope,
      aud: TOKEN_URL,
      iat: nowSeconds,
      exp: nowSeconds + TOKEN_TTL_SECONDS,
    }),
  );

  const signingInput = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(signingInput);
  const signature = base64url(signer.sign(credentials.privateKey));

  return `${signingInput}.${signature}`;
}

type CachedToken = { token: string; expiresAt: number };

// Token sống 1 giờ; cache theo scope để mỗi lần mở tab báo cáo không phải
// ký JWT và đi thêm một vòng OAuth.
const tokenCache = new Map<string, CachedToken>();

export async function getGoogleAccessToken(scope: string): Promise<string | null> {
  const cached = tokenCache.get(scope);
  if (cached && cached.expiresAt > Date.now() + REFRESH_MARGIN_MS) {
    return cached.token;
  }

  const credentials = getServiceAccountCredentials();
  if (!credentials) {
    return null;
  }

  let assertion: string;
  try {
    assertion = buildJwtAssertion(credentials, scope, Math.floor(Date.now() / 1000));
  } catch {
    // Private key sai định dạng — coi như chưa cấu hình, đừng làm sập route.
    return null;
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) {
    return null;
  }

  tokenCache.set(scope, {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? TOKEN_TTL_SECONDS) * 1000,
  });

  return data.access_token;
}
