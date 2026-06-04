const fallback = {
  APP_URL: "http://localhost:3000",
  SESSION_SECRET: "lumia-dev-secret-change-me",
  DEMO_MODE: "true",
};

export const env = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? fallback.APP_URL,
  SESSION_SECRET: process.env.SESSION_SECRET ?? fallback.SESSION_SECRET,
  DEMO_MODE: (process.env.DEMO_MODE ?? fallback.DEMO_MODE) === "true",
  MONGODB_URI: process.env.MONGODB_URI,
  PAYOS_CLIENT_ID: process.env.PAYOS_CLIENT_ID,
  PAYOS_API_KEY: process.env.PAYOS_API_KEY,
  PAYOS_CHECKSUM_KEY: process.env.PAYOS_CHECKSUM_KEY,
  PAYOS_WEBHOOK_URL: process.env.PAYOS_WEBHOOK_URL,
};

export function hasMongoConfig() {
  return Boolean(env.MONGODB_URI);
}

export function hasPayOSConfig() {
  return Boolean(env.PAYOS_CLIENT_ID && env.PAYOS_API_KEY && env.PAYOS_CHECKSUM_KEY);
}
