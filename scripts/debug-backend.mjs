const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const email = process.env.TEST_EMAIL ?? `debug_${Date.now()}@lumia-test.local`;
const password = process.env.TEST_PASSWORD ?? "TestPass123!";

const jar = new Map();
const results = [];

function parseSetCookie(headers) {
  const raw = typeof headers.getSetCookie === "function" ? headers.getSetCookie() : [];
  for (const c of raw) {
    const [pair] = c.split(";");
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1));
  }
}

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function req(path, opts = {}) {
  const headers = { ...(opts.headers ?? {}) };
  if (opts.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  if (jar.size) headers.Cookie = cookieHeader();
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  parseSetCookie(res.headers);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body, text };
}

function record(step, r, { expect, note } = {}) {
  const ok = expect ? expect(r.status, r.body) : r.status >= 200 && r.status < 300;
  const detail =
    typeof r.body === "string"
      ? r.body.slice(0, 200).replace(/\s+/g, " ")
      : JSON.stringify(r.body).slice(0, 200);
  results.push({ step, ok, status: r.status, detail, note });
  console.log(`${ok ? "PASS" : "FAIL"} | ${step} | ${r.status} | ${detail}${note ? ` | ${note}` : ""}`);
  return r;
}

async function checkSupabaseTables() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    record("DB tables (REST)", { status: 0, body: "missing env" }, { expect: () => false, note: "no supabase env" });
    return;
  }
  const tables = ["profiles", "mood_checkins", "audio_tracks", "subscriptions", "streaks"];
  for (const table of tables) {
    const r = await fetch(`${url}/rest/v1/${table}?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const text = await r.text();
    const missing = text.includes("schema cache") || text.includes("does not exist");
    const rls = text.includes("infinite recursion");
    record(`DB table: ${table}`, { status: r.status, body: text.slice(0, 120) }, {
      expect: (s) => s === 200 || s === 406,
      note: missing ? "TABLE MISSING" : rls ? "RLS RECURSION" : "",
    });
  }
}

async function main() {
  console.log(`\n=== LUMIA Backend Debug @ ${BASE} ===\n`);

  record("Health", await req("/api/health"));
  await checkSupabaseTables();

  const reg = await req("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name: "Debug User", email, password }),
  });
  record("Register", reg, { expect: (s) => s === 201 || s === 200 });

  if (jar.size === 0) {
    record("Login fallback", await req("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }));
  } else {
    console.log(`INFO | cookies: ${[...jar.keys()].join(", ")}`);
  }

  record("GET /api/me/subscription", await req("/api/me/subscription"));
  record("Onboarding", await req("/api/me/profile", {
    method: "POST",
    body: JSON.stringify({ onboardingGoal: "sleep" }),
  }));
  record("Mood POST", await req("/api/mood", {
    method: "POST",
    body: JSON.stringify({ score: 4, note: "debug run" }),
  }));
  record("Mood history", await req("/api/mood/history"));
  record("Journal GET", await req("/api/journal"));
  record("Journal POST (free→403)", await req("/api/journal", {
    method: "POST",
    body: JSON.stringify({ content: "debug journal" }),
  }), { expect: (s) => s === 403 });
  record("Audio", await req("/api/audio"));
  record("Chat usage", await req("/api/chat/usage"));
  const chat = await req("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message: "Xin chào, đây là test debug." }),
  });
  record("Chat POST", chat, {
    expect: (s, b) => s === 200 && typeof b === "string" && b.length > 0,
    note: typeof chat.body === "string" && chat.body.includes("tạm thời") ? "LLM FALLBACK" : "",
  });
  record("Streak", await req("/api/streak"));
  record("Journal prompts", await req("/api/journal/prompts"));
  record("Seed", await req("/api/seed", { method: "POST" }), {
    expect: (s) => s === 200 || s === 503,
    note: "503 if no secret key",
  });
  record("Logout", await req("/api/auth/logout", { method: "POST" }));

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== ${results.length - failed.length}/${results.length} passed ===`);
  if (failed.length) {
    console.log("\nFailed:");
    for (const f of failed) console.log(`  - ${f.step}: ${f.status} ${f.detail} ${f.note ?? ""}`);
  }

  const blockers = [];
  if (results.some((r) => r.note?.includes("TABLE MISSING"))) blockers.push("Run supabase/migrations/001_initial_schema.sql");
  if (results.some((r) => r.note?.includes("RLS RECURSION"))) blockers.push("Run supabase/migrations/002_fix_profiles_rls_recursion.sql");
  if (results.find((r) => r.step === "Seed" && r.status === 503)) blockers.push("Set SUPABASE_SECRET_KEY in .env");
  if (results.find((r) => r.step === "Audio" && r.status === 200 && String(r.detail) === "[]")) {
    blockers.push("Run supabase/migrations/003_streak_rls_and_audio_seed.sql (audio + streak RLS)");
  }
  if (results.find((r) => r.step === "Streak" && String(r.detail).includes('"current_streak":0') && results.find((x) => x.step === "Mood POST" && x.ok))) {
    blockers.push("Run 003 migration for streak UPDATE policy, or set SUPABASE_SECRET_KEY");
  }
  if (results.find((r) => r.note?.includes("LLM FALLBACK"))) blockers.push("Check LLM_API_KEY — invalid key or set LLM_BASE_URL");
  if (blockers.length) {
    console.log("\nBlockers:");
    blockers.forEach((b) => console.log(`  • ${b}`));
  }

  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
