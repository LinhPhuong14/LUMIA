import { createVerify, generateKeyPairSync } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  buildJwtAssertion,
  GA4_SCOPE,
  getServiceAccountCredentials,
  hasServiceAccount,
  normalizePrivateKey,
} from "@/lib/analytics/google-auth";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

function decodeSegment(segment: string): Record<string, unknown> {
  return JSON.parse(Buffer.from(segment, "base64url").toString("utf8")) as Record<string, unknown>;
}

describe("normalizePrivateKey", () => {
  it("đổi \\n escape trong env một dòng thành newline thật", () => {
    const raw = "-----BEGIN PRIVATE KEY-----\\nMIIE\\n-----END PRIVATE KEY-----";
    expect(normalizePrivateKey(raw)).toBe(
      "-----BEGIN PRIVATE KEY-----\nMIIE\n-----END PRIVATE KEY-----",
    );
  });

  it("bỏ dấu nháy bao ngoài khi copy nguyên từ file JSON", () => {
    expect(normalizePrivateKey('"-----BEGIN PRIVATE KEY-----\\nabc"')).toBe(
      "-----BEGIN PRIVATE KEY-----\nabc",
    );
  });
});

describe("getServiceAccountCredentials", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("trả null khi thiếu env", () => {
    expect(getServiceAccountCredentials()).toBeNull();
    expect(hasServiceAccount()).toBe(false);
  });

  it("trả null khi private key không phải PEM — tránh crash lúc ký", () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "bot@lumia.iam.gserviceaccount.com";
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = "khong-phai-pem";
    expect(getServiceAccountCredentials()).toBeNull();
  });

  it("đọc được credential hợp lệ", () => {
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "bot@lumia.iam.gserviceaccount.com";
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = privateKey.replace(/\n/g, "\\n");

    const credentials = getServiceAccountCredentials();
    expect(credentials?.email).toBe("bot@lumia.iam.gserviceaccount.com");
    expect(credentials?.privateKey).toContain("-----BEGIN PRIVATE KEY-----");
    expect(hasServiceAccount()).toBe(true);
  });
});

describe("buildJwtAssertion", () => {
  const credentials = { email: "bot@lumia.iam.gserviceaccount.com", privateKey };
  const now = 1_800_000_000;

  it("tạo JWT ba phần với claim đúng chuẩn service account của Google", () => {
    const assertion = buildJwtAssertion(credentials, GA4_SCOPE, now);
    const [header, payload] = assertion.split(".");

    expect(assertion.split(".")).toHaveLength(3);
    expect(decodeSegment(header)).toEqual({ alg: "RS256", typ: "JWT" });
    expect(decodeSegment(payload)).toEqual({
      iss: credentials.email,
      scope: GA4_SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    });
  });

  it("chữ ký RS256 verify được bằng public key tương ứng", () => {
    const assertion = buildJwtAssertion(credentials, GA4_SCOPE, now);
    const [header, payload, signature] = assertion.split(".");

    const verifier = createVerify("RSA-SHA256");
    verifier.update(`${header}.${payload}`);
    expect(verifier.verify(publicKey, Buffer.from(signature, "base64url"))).toBe(true);
  });

  it("không chứa ký tự cần escape URL (base64url thuần)", () => {
    const assertion = buildJwtAssertion(credentials, GA4_SCOPE, now);
    expect(assertion).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });
});
