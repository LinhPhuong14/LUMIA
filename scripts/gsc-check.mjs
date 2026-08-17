#!/usr/bin/env node
/**
 * Kiểm tra đầu-cuối kết nối Google Search Console API bằng service account.
 *
 * Chạy tuần tự 5 bước, mỗi bước in PASS/FAIL kèm cách sửa cụ thể:
 *   1. Đọc credentials (env hoặc --key-file JSON tải từ Google Cloud)
 *   2. Ký JWT → đổi access token (scope webmasters.readonly)
 *   3. sites.list — service account có quyền trên property nào
 *   4. searchAnalytics.query — kéo thử 28 ngày: tổng quan, top query, top page
 *   5. sitemaps.list + tải sitemap thật — đối chiếu host trong <loc> với
 *      property (bắt đúng lỗi sitemap trỏ nhầm *.vercel.app)
 *
 * Credentials (giống src/lib/analytics/google-auth.ts):
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL=...@...iam.gserviceaccount.com
 *   GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
 * hoặc tiện hơn khi chạy tay:
 *   node scripts/gsc-check.mjs --key-file=./service-account.json
 *
 * Property: --site=sc-domain:lumia.com.vn > env GSC_SITE_URL > tự chọn từ
 * danh sách bước 3 (ưu tiên domain property, giống pickBestSite trong app).
 *
 * Chỉ ĐỌC (scope readonly) — không ghi gì lên GSC. Exit 0 khi mọi bước pass.
 */

import { readFileSync } from "node:fs";
import { createSign } from "node:crypto";
import process from "node:process";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const API = "https://searchconsole.googleapis.com/webmasters/v3/sites";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  }),
);

let failures = 0;
const pass = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg, ...hints) => {
  failures++;
  console.log(`  ✗ ${msg}`);
  for (const h of hints) console.log(`    → ${h}`);
};
const step = (n, title) => console.log(`\n[${n}/5] ${title}`);

// ── 1. Credentials ──────────────────────────────────────────────────────────

step(1, "Đọc credentials service account");
let email, privateKey;
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
if (!email || !privateKey) {
  fail(
    "Thiếu credentials.",
    "Set env GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (xem .env.example, mục 'Báo cáo trong trang admin'),",
    "hoặc chạy: node scripts/gsc-check.mjs --key-file=./service-account.json",
  );
  finish();
}
if (!privateKey.includes("BEGIN")) {
  fail(
    "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY không chứa '-----BEGIN' — key sai định dạng.",
    "Copy nguyên giá trị private_key từ file JSON, giữ các \\n, bọc trong nháy kép.",
  );
  finish();
}
pass(`service account: ${email}`);

// ── 2. JWT → access token ───────────────────────────────────────────────────

step(2, "Đổi JWT lấy access token (scope webmasters.readonly)");
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
    fail(`Không ký được JWT: ${e.message}`, "Private key hỏng — tạo key JSON mới trong Google Cloud → Service Accounts → Keys.");
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
        ? "invalid_grant thường do: key đã bị xoá/rotate trong Cloud Console, hoặc đồng hồ máy lệch quá 5 phút."
        : "Kiểm tra lại email + private key có thuộc cùng một service account không.",
    );
    finish();
  }
  token = data.access_token;
  pass("lấy được access token");
}

const authed = (url, init = {}) =>
  fetch(url, { ...init, headers: { Authorization: `Bearer ${token}`, ...init.headers } });

// ── 3. sites.list ───────────────────────────────────────────────────────────

step(3, "Liệt kê property mà service account có quyền (sites.list)");
let sites = [];
{
  const res = await authed(API);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error?.message ?? `HTTP ${res.status}`;
    fail(
      `sites.list lỗi: ${msg}`,
      /SERVICE_DISABLED|has not been used|is disabled/i.test(msg)
        ? "Google Search Console API chưa bật cho project — Cloud Console → APIs & Services → Library → 'Google Search Console API' → Enable."
        : "Xem lỗi gốc ở trên.",
    );
    finish();
  }
  sites = data.siteEntry ?? [];
  if (sites.length === 0) {
    fail(
      "Service account chưa được thêm vào property nào.",
      `Search Console → chọn property → Settings → Users and permissions → Add user: ${email} (quyền Full hoặc Restricted).`,
    );
    finish();
  }
  for (const s of sites) {
    const note = s.permissionLevel === "siteUnverifiedUser" ? "  ← CHƯA VERIFY, đọc data sẽ 403" : "";
    console.log(`      • ${s.siteUrl}  (${s.permissionLevel})${note}`);
  }
  const usable = sites.filter((s) => s.permissionLevel !== "siteUnverifiedUser");
  if (usable.length === 0) {
    fail("Mọi property đều ở mức siteUnverifiedUser — liệt kê được nhưng không đọc được data.");
    finish();
  }
  pass(`${usable.length}/${sites.length} property dùng được`);
}

// Chọn property: --site > env > domain property đầu tiên > property đầu tiên
const usable = sites.filter((s) => s.permissionLevel !== "siteUnverifiedUser");
const siteUrl =
  args.site ??
  process.env.GSC_SITE_URL?.trim() ??
  (usable.find((s) => s.siteUrl.startsWith("sc-domain:")) ?? usable[0]).siteUrl;
console.log(`      → dùng property: ${siteUrl}`);

// ── 4. searchAnalytics.query ────────────────────────────────────────────────

step(4, "Kéo thử dữ liệu Performance 28 ngày (searchAnalytics.query)");
const day = (offset) => new Date(Date.now() + offset * 86400_000).toISOString().slice(0, 10);
// GSC trễ 1-2 ngày: kết thúc ở hôm kia để không đọc nhầm vùng chưa chốt số.
const range = { startDate: day(-30), endDate: day(-2) };
const gscQuery = async (body) => {
  const res = await authed(`${API}/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...range, ...body }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.message ?? `HTTP ${res.status}`);
  return data.rows ?? [];
};
try {
  const [summary, queries, pages] = await Promise.all([
    gscQuery({ rowLimit: 1 }),
    gscQuery({ dimensions: ["query"], rowLimit: 10 }),
    gscQuery({ dimensions: ["page"], rowLimit: 10 }),
  ]);
  const s = summary[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  pass(
    `API trả dữ liệu ${range.startDate} → ${range.endDate}: ` +
      `${s.clicks} clicks, ${s.impressions} impressions, ` +
      `CTR ${(100 * (s.ctr ?? 0)).toFixed(1)}%, vị trí TB ${(s.position ?? 0).toFixed(1)}`,
  );
  const table = (title, rows) => {
    console.log(`      ${title}`);
    if (rows.length === 0) return console.log("        (trống)");
    for (const r of rows)
      console.log(
        `        ${String(r.clicks).padStart(5)} clicks  ${String(r.impressions).padStart(7)} impr  ${r.keys[0]}`,
      );
  };
  table("Top query:", queries);
  table("Top page:", pages);
  if (s.impressions === 0)
    console.log(
      "      Lưu ý: 0 impression không có nghĩa là hỏng — site mới/property mới\n" +
        "      thường cần vài ngày sau khi được index mới có số. Pipeline API đã thông.",
    );
} catch (e) {
  fail(
    `searchAnalytics.query lỗi: ${e.message}`,
    `403 với property "${siteUrl}" thường là gọi nhầm dạng property — verify bằng DNS thì phải dùng sc-domain:..., verify bằng HTML tag thì phải khớp chính xác URL kèm dấu / cuối.`,
    "Chọn property khác trong danh sách bước 3 bằng --site=...",
  );
}

// ── 5. sitemaps.list + đối chiếu host ───────────────────────────────────────

step(5, "Sitemap: đã submit chưa, và <loc> có trỏ đúng domain không");
const apex = (h) => h.toLowerCase().replace(/^www\./, "");
const propertyApex = siteUrl.startsWith("sc-domain:")
  ? siteUrl.slice("sc-domain:".length)
  : apex(new URL(siteUrl).hostname);
try {
  const res = await authed(`${API}/${encodeURIComponent(siteUrl)}/sitemaps`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.message ?? `HTTP ${res.status}`);
  const maps = data.sitemap ?? [];
  if (maps.length === 0) {
    fail(
      "Chưa có sitemap nào được submit cho property này.",
      `Search Console → Sitemaps → nhập https://www.${propertyApex}/sitemap.xml → Submit.`,
    );
  } else {
    for (const m of maps) {
      const errs = (m.contents ?? []).reduce((n, c) => n + Number(c.errors ?? 0), 0);
      console.log(
        `      • ${m.path}  (tải lần cuối: ${m.lastDownloaded ?? "chưa"}, lỗi: ${errs}${m.isPending ? ", đang chờ xử lý" : ""})`,
      );
    }
    pass(`${maps.length} sitemap đã submit`);
  }

  // Tải sitemap đang phục vụ thật để soi host trong <loc> — đây là chỗ bắt
  // được lỗi NEXT_PUBLIC_APP_URL thiếu làm sitemap trỏ về *.vercel.app.
  const liveSitemap = `https://www.${propertyApex}/sitemap.xml`;
  const xml = await fetch(liveSitemap, { redirect: "follow" }).then((r) => (r.ok ? r.text() : ""));
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  if (locs.length === 0) {
    fail(`Không đọc được <loc> nào từ ${liveSitemap} — sitemap trống hoặc không tải được.`);
  } else {
    const wrongHost = locs.filter((u) => apex(new URL(u).hostname) !== propertyApex);
    if (wrongHost.length > 0) {
      fail(
        `${wrongHost.length}/${locs.length} URL trong sitemap trỏ sang domain khác, vd: ${wrongHost[0]}`,
        "Đây chính là lỗi thiếu NEXT_PUBLIC_APP_URL khi build: Vercel → Settings → Environment Variables → NEXT_PUBLIC_APP_URL=https://www." + propertyApex + " (Production) rồi redeploy.",
        "Google đang được bảo bản chính thức nằm ở domain kia → impressions dồn nhầm property.",
      );
    } else {
      pass(`${locs.length} URL trong sitemap đều thuộc ${propertyApex}`);
    }
  }
} catch (e) {
  fail(`sitemaps.list lỗi: ${e.message}`);
}

finish();

function finish() {
  console.log(
    failures === 0
      ? "\nKẾT LUẬN: mọi bước PASS — pipeline Search Console API hoạt động, tab Báo cáo trong /admin sẽ đọc được data thật."
      : `\nKẾT LUẬN: ${failures} bước FAIL — sửa theo gợi ý '→' ở từng bước rồi chạy lại.`,
  );
  process.exit(failures === 0 ? 0 : 1);
}
