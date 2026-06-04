import { SignJWT, jwtVerify } from "jose";

import { env } from "@/lib/env";

export const SESSION_COOKIE_NAME = "lumia_session";

export type SessionRole = "user" | "admin" | "superadmin";

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: SessionRole;
};

function getSecret() {
  return new TextEncoder().encode(env.SESSION_SECRET);
}

export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
