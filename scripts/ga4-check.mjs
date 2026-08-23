#!/usr/bin/env node
/**
 * Chẩn đoán đầu-cuối kết nối GA4 Data API bằng service account — để biết vì sao
 * tab Báo cáo/Vận hành CHƯA hiện số GA.
 *
 * Chạy 4 bước, mỗi bước PASS/FAIL kèm cách sửa:
 *   1. Đọc credentials (env GA4_PROPERTY_ID + GOOGLE_SERVICE_ACCOUNT_*, hoặc
 *      --key-file JSON + --property=<id số>)
 *   2. Ký JWT RS256 → đổi access token (scope analytics.readonly)
 *   3. runReport 28 ngày: activeUsers/newUsers/sessions/screenPageViews theo ngày
 *   4. Đối chiếu: property có trả số không, hay 0 / lỗi quyền / API chưa bật
 *
 * Ví dụ:
 *   GA4_PROPERTY_ID=123456789 \
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL=...@...iam.gserviceaccount.com \
 *   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..." \
 *   node scripts/ga4-check.mjs
 *
 *   node scripts/ga4-check.mjs --key-file=./service-account.json --property=123456789
 *
 * Chỉ ĐỌC (scope readonly) — không ghi gì lên GA4.
 */

import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";
import process from "node:process";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const API = "https://analyticsdata.googleapis.com/v1beta";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  }),
);

let failures = 0;
const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m, ...hints) => {
  failures++;
  console.log(`  ✗ ${m}`);
  for (const h of hints) console.log(`    → ${h}`);
};
const step = (n, t) => console.log(`\n[${n}/4] ${t}`);
const finish = () => {
  console.log(
    failures === 0
      ? "\nKẾT LUẬN: GA4 Data API OK — nếu dashboard vẫn trắng thì là do DEPLOY (env chưa lên branch đang deploy) hoặc ANALYTICS_SAMPLE_MODE đang bật."
      : `\nKẾT LUẬN: ${failures} bước FAIL — sửa theo gợi ý '→' rồi chạy lại.`,
  );
  process.exit(failures === 0 ? 0 : 1);
};

// ── 1. Credentials ──────────────────────────────────────────────────────────
step(1, "Đọc credentials service account + property id");
let email, privateKey, propertyId;
if (args["key-file"]) {
  try {
    const json = JSON.parse(readFileSync(args["key-file"], "utf8"));
    email = json.client_email;
    privateKey = json.private_key;
  } catch (e) {
    fail(`Không đọc được --key-file: ${e.message}`);
  }
} else {
  email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    ?.trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n");
}
propertyId = (args.property || process.env.GA4_PROPERTY_ID || "")
  .toString()
  .trim()
  .replace(/^properties\//, "");

if (!email || !privateKey) {
  fail(
    "Thiếu credentials.",
    "Set GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,",
    "hoặc --key-file=./service-account.json",
  );
  finish();
}
if (!privateKey.includes("BEGIN")) {
  fail("PRIVATE_KEY không chứa '-----BEGIN' — sai định dạng (giữ nguyên các \\n, bọc nháy kép).");
  finish();
}
if (!/^\d+$/.test(propertyId)) {
  fail(
    `GA4_PROPERTY_ID không hợp lệ: "${propertyId}" (phải là SỐ, không phải G-XXXX).`,
    "Lấy ở GA4 → Admin → Property Settings → Property ID (dạng số như 548574470).",
  );
  finish();
}
pass(`service account: ${email}`);
pass(`property: ${propertyId}`);

// ── 2. Token ─────────────────────────────────────────────────────────────────
step(2, "Đổi JWT lấy access token (scope analytics.readonly)");
const b64url = (s) =>
  Buffer.from(s).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
let token;
{
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({ iss: email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600 }),
  );
  let assertion;
  try {
    const signer = createSign("RSA-SHA256");
    signer.update(`${header}.${payload}`);
    assertion = `${header}.${payload}.${b64url(signer.sign(privateKey))}`;
  } catch (e) {
    fail(`Không ký được JWT: ${e.message}`, "Private key hỏng — tạo key JSON mới trong Cloud Console.");
    finish();
  }
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    fail(
      `Token endpoint trả ${res.status}: ${data.error ?? "?"} — ${data.error_description ?? ""}`,
      data.error === "invalid_grant"
        ? "invalid_grant: key đã bị xoá/rotate, hoặc đồng hồ máy lệch >5 phút."
        : "Kiểm tra email + private key cùng một service account.",
    );
    finish();
  }
  token = data.access_token;
  pass("lấy được access token");
}

// ── 3. runReport ─────────────────────────────────────────────────────────────
step(3, "Kéo báo cáo 28 ngày (runReport)");
const day = (o) => new Date(Date.now() + o * 86400_000).toISOString().slice(0, 10);
let rows = [];
try {
  const res = await fetch(`${API}/properties/${propertyId}:runReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      dateRanges: [{ startDate: day(-28), endDate: day(0) }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
      limit: 100,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message ?? `HTTP ${res.status}`;
    fail(
      `runReport lỗi: ${msg}`,
      /SERVICE_DISABLED|has not been used|is disabled/i.test(msg)
        ? "Google Analytics Data API chưa bật — Cloud Console → APIs & Services → Library → 'Google Analytics Data API' → Enable."
        : /permission|PERMISSION_DENIED|caller does not have/i.test(msg)
          ? `Service account chưa có quyền trên property ${propertyId} — GA4 → Admin → Property access management → thêm ${email} quyền Viewer.`
          : "Xem lỗi gốc ở trên.",
    );
    finish();
  }
  rows = data.rows ?? [];
  pass("runReport thành công");
} catch (e) {
  fail(`Không gọi được Data API: ${e.message}`);
  finish();
}

// ── 4. Đối chiếu số ──────────────────────────────────────────────────────────
step(4, "Số liệu property trả về");
const num = (r, i) => Number(r.metricValues?.[i]?.value ?? 0);
const totals = rows.reduce(
  (a, r) => ({
    users: a.users + num(r, 0),
    newUsers: a.newUsers + num(r, 1),
    sessions: a.sessions + num(r, 2),
    views: a.views + num(r, 3),
  }),
  { users: 0, newUsers: 0, sessions: 0, views: 0 },
);
console.log(`      28 ngày: ${rows.length} ngày có dữ liệu`);
console.log(
  `      Σ activeUsers=${totals.users}  newUsers=${totals.newUsers}  ` +
    `sessions=${totals.sessions}  pageViews=${totals.views}`,
);
if (rows.length > 0) {
  const last = rows[rows.length - 1];
  console.log(
    `      ngày gần nhất ${last.dimensionValues?.[0]?.value}: ` +
      `users=${num(last, 0)} sessions=${num(last, 2)}`,
  );
}
if (totals.users === 0) {
  console.log(
    "      ⚠ Property trả 0 — credentials/property ĐÚNG nhưng chưa có traffic được ghi\n" +
      "        (hoặc Data API trễ 24-48h so với Realtime). Không phải lỗi kết nối.",
  );
} else {
  pass(`property có ${totals.users} activeUsers trong 28 ngày → dashboard PHẢI hiện được số này`);
}
finish();
