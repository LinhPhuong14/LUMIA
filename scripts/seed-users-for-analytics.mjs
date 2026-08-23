#!/usr/bin/env node
/**
 * Sinh seed SQL tạo tài khoản cho KHỚP với đường cong người dùng mà tab Vận
 * hành đang hiển thị — để "Tài khoản mới" bên tab Báo cáo không còn lệch hẳn
 * so với lưu lượng bên tab Vận hành.
 *
 * Cách làm: import THẲNG bộ sinh số mẫu của app (`sample-data.ts`) và bộ tính
 * khoảng ngày (`date-range.ts`), nên số ở đây và số trên màn hình ra từ đúng
 * một công thức — sửa `sample-data.ts` thì chỉ cần chạy lại script, không phải
 * đồng bộ tay hai nơi.
 *
 * Chỉ tiêu = ô báo cáo đã neo (`--match`) × `--rate`, rồi rải ra từng ngày theo
 * hình sóng của `daily.newUsers`.
 *
 *   --match=new-users (mặc định)  neo vào "người dùng mới", rate mặc định 0.12
 *   --match=users                 neo vào ô "Người dùng", rate mặc định 1 —
 *                                 tức seed cho bằng đúng con số trên màn hình
 *
 * Hai điểm dễ nhầm:
 *   - Dùng `newUsers` chứ không phải `users`: chỉ khách LẦN ĐẦU mới tạo được
 *     tài khoản mới.
 *   - Lấy từ `summary`, KHÔNG cộng dồn `daily`. GA4 đếm người dùng của một kỳ
 *     theo đầu người đã loại trùng; cộng theo ngày thì một người ghé nhiều ngày
 *     bị tính nhiều lần, ra số lớn gấp đôi những gì màn hình hiển thị.
 *
 * Hệ quả: KPI "người dùng" không cộng được giữa các kỳ (28 ngày và 90 ngày đều
 * ~1.500 người duy nhất), trong khi tài khoản seed thì cộng được — mỗi ngày một
 * nhóm dòng thật. Nên không có cách rải nào khớp đồng thời mọi kỳ. Script neo
 * vào kỳ RỘNG NHẤT (`--days`); các kỳ ngắn hơn sẽ ra tỉ lệ thấp hơn --rate, và
 * đó là đúng: tài khoản thì tích luỹ, còn khách duy nhất thì không.
 *
 * SQL sinh ra là dạng BÙ CHO ĐỦ, không phải chèn mù: mỗi ngày đếm số profile
 * đã có sẵn (user thật + seed cũ) rồi chỉ chèn phần còn thiếu. Chạy lại lần hai
 * không nhân đôi dữ liệu.
 *
 * Ví dụ:
 *   node scripts/seed-users-for-analytics.mjs
 *   node scripts/seed-users-for-analytics.mjs --rate=0.2 --days=90
 *   node scripts/seed-users-for-analytics.mjs --today=2026-08-23   # cố định ngày để so sánh
 *
 * Script này CHỈ GHI RA FILE .sql, không đụng tới database. Muốn seed thật thì
 * mở file kết quả rồi chạy trong Supabase SQL Editor — chèn `auth.users` cần
 * quyền schema `auth` mà API service-role không có.
 */

import { existsSync, writeFileSync } from "node:fs";
import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import process from "node:process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ─── Tự chạy lại với cờ strip-types ─────────────────────────────────────────
// Script cần import trực tiếp file .ts của app. Node 22 làm được nhưng phải bật
// cờ, nên tự exec lại một lần thay vì bắt người dùng nhớ cờ.
if (!process.execArgv.some((a) => a.includes("strip-types"))) {
  const { spawnSync } = await import("node:child_process");
  const result = spawnSync(
    process.execPath,
    ["--experimental-strip-types", "--no-warnings", fileURLToPath(import.meta.url), ...process.argv.slice(2)],
    { stdio: "inherit" },
  );
  process.exit(result.status ?? 1);
}

// ─── Resolve hook: `@/x` → `<root>/src/x`, và thêm đuôi .ts cho import không đuôi ──
// App dùng path alias của tsconfig; node trần không hiểu nên phải dạy nó, bằng
// một hook nhỏ thay vì kéo thêm dependency (tsx/ts-node) chỉ để chạy một script.
const HOOK = `
import { existsSync } from "node:fs";
const SRC = ${JSON.stringify(pathToFileURL(path.join(ROOT, "src/")).href)};
export function resolve(spec, ctx, next) {
  let s = spec.startsWith("@/") ? SRC + spec.slice(2) : spec;
  if (/^(file:|\\.{1,2}\\/)/.test(s) && !/\\.[cm]?[jt]s$/.test(s)) {
    const base = s.startsWith("file:") ? s : new URL(s, ctx.parentURL).href;
    for (const ext of [".ts", ".mts", ".js"]) {
      if (existsSync(new URL(base + ext))) { s = base + ext; break; }
    }
  }
  return next(s, ctx);
}
`;
register(`data:text/javascript,${encodeURIComponent(HOOK)}`);

const { resolveDateRange } = await import("@/lib/analytics/date-range");
const { buildSampleGaReport } = await import("@/lib/analytics/sample-data");
// Trần chuyển đổi lấy từ chính app: vượt ngưỡng này thì demo-data coi là số sai
// chứ không phải marketing giỏi. Ở đây chỉ dùng để CẢNH BÁO, không chặn — chọn
// vượt trần hay không là quyết định của người chạy.
const { SIGNUP_CONVERSION_CEILING } = await import("@/lib/analytics/demo-data");

// ─── Tham số ────────────────────────────────────────────────────────────────

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);
    return m ? [m[1], m[2] ?? true] : [a, true];
  }),
);

if (args.help) {
  console.log(`
Sinh seed SQL tạo tài khoản khớp đường cong người dùng của tab Vận hành.

  --match=<what>    Neo vào ô nào của báo cáo: new-users (mặc định) hoặc users
  --rate=<0..1>     Nhân với ô đã neo. Mặc định 0.12, hoặc 1 khi --match=users
  --days=<n>        Số ngày lùi về, tính cả hôm nay. Mặc định 90 (phủ hết mọi kỳ của tab)
  --today=<ISO>     Cố định "hôm nay" (YYYY-MM-DD). Mặc định là ngày hệ thống
  --out=<path>      File SQL kết quả. Mặc định supabase/seeds/003_users_match_analytics.sql
  --seed-tag=<tag>  Nhãn đánh dấu để gỡ về sau. Mặc định analytics_match
`);
  process.exit(0);
}

function fail(message, hint) {
  console.error(`✗ ${message}`);
  if (hint) console.error(`  → ${hint}`);
  process.exit(1);
}

// Neo vào ô nào của báo cáo: "Người dùng" (users) hay "người dùng mới"
// (new-users). Mặc định new-users vì chỉ khách lần đầu mới tạo được tài khoản.
const match = String(args.match ?? "new-users");
if (match !== "users" && match !== "new-users") {
  fail(`--match không hợp lệ: ${match}`, "Chỉ nhận users hoặc new-users.");
}

// Neo theo users thì mặc định 1:1 — mỗi khách một tài khoản, đúng nghĩa "seed
// cho bằng đúng ô Người dùng".
const rate = args.rate === undefined ? (match === "users" ? 1 : 0.12) : Number(args.rate);
if (!Number.isFinite(rate) || rate <= 0 || rate > 1) {
  fail(`--rate không hợp lệ: ${args.rate}`, "Cần một số trong khoảng (0, 1], ví dụ --rate=0.12");
}

const days = args.days === undefined ? 90 : Number(args.days);
if (!Number.isInteger(days) || days < 1 || days > 400) {
  fail(`--days không hợp lệ: ${args.days}`, "Cần số nguyên trong khoảng 1-400.");
}

if (args.today !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(args.today))) {
  fail(`--today không hợp lệ: ${args.today}`, "Định dạng YYYY-MM-DD, ví dụ --today=2026-08-23.");
}
const today = args.today ? new Date(`${args.today}T00:00:00Z`) : new Date();
if (Number.isNaN(today.getTime())) {
  fail(`--today không phải ngày có thật: ${args.today}`);
}

const seedTag = String(args["seed-tag"] ?? "analytics_match");
if (!/^[a-z0-9_]+$/.test(seedTag)) {
  fail(`--seed-tag không hợp lệ: ${seedTag}`, "Chỉ dùng chữ thường, số và dấu _ (nhãn này được nhúng vào SQL).");
}

const outPath = path.resolve(ROOT, String(args.out ?? "supabase/seeds/003_users_match_analytics.sql"));
if (!existsSync(path.dirname(outPath))) {
  fail(`Không có thư mục ${path.relative(ROOT, path.dirname(outPath))}`, "Kiểm tra lại --out.");
}

// ─── Tính chỉ tiêu từng ngày ────────────────────────────────────────────────
// Kỳ kết thúc ở HÔM NAY, giống resolveDateRange(includeToday=true) mà tab Vận
// hành dùng, để ngày đầu/cuối trùng khít với những gì màn hình đang vẽ.

function isoShift(iso, delta) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

const endDate = resolveDateRange("today", today, true).endDate;
const startDate = isoShift(endDate, -(days - 1));
const previousEndDate = isoShift(startDate, -1);
const fullRange = {
  key: "90d",
  days,
  startDate,
  endDate,
  previousStartDate: isoShift(previousEndDate, -(days - 1)),
  previousEndDate,
};
const report = buildSampleGaReport(fullRange);

// Chỉ tiêu lấy từ summary.newUsers của cả kỳ, KHÔNG phải tổng newUsers theo
// ngày cộng lại. GA4 đếm "người dùng mới" của một kỳ theo đầu người đã loại
// trùng, còn cộng dồn theo ngày thì một người ghé nhiều ngày bị tính nhiều lần
// — sample-data neo KPI đúng theo bản chất đó, nên seed phải bám vào cùng con
// số mà màn hình hiển thị.
const totalNewUsers = report.summary.newUsers;
const anchorValue = match === "users" ? report.summary.users : totalNewUsers;
const totalWant = Math.round(anchorValue * rate);

if (totalWant === 0) {
  fail("Chỉ tiêu tính ra 0 tài khoản", "Tăng --rate hoặc --days.");
}

// Cảnh báo, KHÔNG chặn: đây là lựa chọn của người chạy, nhưng phải nói rõ hệ quả.
const impliedConversion = report.summary.users > 0 ? totalWant / report.summary.users : 0;
const overCeiling = impliedConversion > SIGNUP_CONVERSION_CEILING;

// Rải chỉ tiêu theo HÌNH SÓNG của newUsers từng ngày, để biểu đồ tài khoản mới
// lên xuống giống biểu đồ lưu lượng. Chia theo phần dư lớn nhất (largest
// remainder) nên tổng sau khi làm tròn khớp đúng totalWant, không hụt vài đơn vị.
const weights = report.daily.map((point) => point.newUsers);
const weightSum = weights.reduce((sum, w) => sum + w, 0);

const shares = weights.map((w) => (weightSum > 0 ? (w / weightSum) * totalWant : 0));
const counts = shares.map((s) => Math.floor(s));
let leftover = totalWant - counts.reduce((sum, c) => sum + c, 0);
for (const i of shares
  .map((s, idx) => [s - Math.floor(s), idx])
  .sort((a, b) => b[0] - a[0])
  .map(([, idx]) => idx)) {
  if (leftover <= 0) break;
  counts[i] += 1;
  leftover -= 1;
}

const perDay = report.daily.map((point, i) => ({
  date: point.date,
  newUsers: point.newUsers,
  want: counts[i],
}));

// ─── Sinh SQL ───────────────────────────────────────────────────────────────

const values = perDay
  .filter((d) => d.want > 0)
  .map((d) => `    (DATE '${d.date}', ${d.want})`)
  .join(",\n");

const sql = `-- Seed: tài khoản khớp đường cong người dùng của tab Vận hành
--
-- SINH TỰ ĐỘNG bởi scripts/seed-users-for-analytics.mjs — đừng sửa tay, sửa
-- tham số rồi chạy lại script:
--
--   node scripts/seed-users-for-analytics.mjs --rate=${rate} --days=${days} --today=${endDate}
--
-- Chạy trong Supabase SQL Editor (cần quyền schema \`auth\` — API service-role
-- không chèn được vào auth.users).
--
-- Chỉ tiêu: ${totalWant.toLocaleString("vi-VN")} tài khoản trải trên ${perDay.length} ngày
-- (${perDay[0].date} → ${perDay[perDay.length - 1].date}), bằng ${(rate * 100).toFixed(1)}% của
-- ${totalNewUsers.toLocaleString("vi-VN")} khách ghé lần đầu mà tab Vận hành báo trong cùng kỳ.
--
-- BÙ CHO ĐỦ, không chèn mù: mỗi ngày đếm profile đã có (user thật + seed cũ)
-- rồi chỉ chèn phần còn thiếu, nên chạy lại nhiều lần không nhân đôi dữ liệu.
--
-- Cách hoạt động (giống 002_fake_vietnamese_users.sql):
--   auth.users -> handle_new_user            -> profiles + subscriptions(free) + streaks
--   profiles   -> handle_new_user_notifications -> notification_settings
-- nên chỉ cần chèn auth.users, phần còn lại tự cascade.
--
-- LƯU Ý về created_at: handle_new_user KHÔNG chép created_at từ auth.users sang
-- profiles (cột đó mặc định now()), mà báo cáo lại đếm theo profiles.created_at.
-- Vì vậy sau khi chèn phải UPDATE lại profiles.created_at — nếu bỏ bước này thì
-- toàn bộ tài khoản dồn vào hôm nay và biểu đồ vẫn sai.
--
-- Mật khẩu dùng chung: Lumia@123 (tài khoản chỉ để demo/làm đầy số liệu).

DO $$
DECLARE
  v_pw text;
  v_base int;
  v_inserted int;
  v_touched int;

  ho text[] := ARRAY[
    'Nguyễn','Nguyễn','Nguyễn','Trần','Trần','Lê','Lê','Phạm','Hoàng','Huỳnh',
    'Phan','Vũ','Võ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương','Lý',
    'Đào','Đoàn','Vương','Trịnh','Đinh','Lâm','Mai','Trương','Cao','Tô'
  ];
  dem_nu text[] := ARRAY[
    'Thị','Thị','Thị','Ngọc','Thu','Thanh','Phương','Hồng','Kim','Minh',
    'Diệu','Thúy','Bích','Ánh','Quỳnh','Khánh','Bảo','Hà','Gia','Yến'
  ];
  ten_nu text[] := ARRAY[
    'Anh','Linh','Hương','Lan','Hà','Trang','Ngọc','Mai','Thảo','Trâm',
    'Nhung','Yến','Vân','Hằng','Quyên','Ly','Uyên','Dung','Loan','Nga',
    'Hạnh','Phượng','Chi','Như','Thư','Huyền','Diệp','Tú','Vy','Oanh'
  ];
  dem_nam text[] := ARRAY[
    'Văn','Văn','Văn','Hữu','Đức','Minh','Quang','Công','Thành','Xuân',
    'Bá','Đình','Ngọc','Tuấn','Gia','Anh','Duy','Hoàng','Trọng','Nhật'
  ];
  ten_nam text[] := ARRAY[
    'Anh','Hùng','Dũng','Nam','Tuấn','Minh','Khánh','Hải','Sơn','Long',
    'Phong','Đạt','Bình','Kiên','Hoàng','Thắng','Trung','Vinh','Quân','Huy',
    'Bảo','Khoa','Phúc','Tài','Duy','Thành','Lâm','Nghĩa','Cường','Toàn'
  ];
  dom text[] := ARRAY['gmail.com','gmail.com','gmail.com','gmail.com','yahoo.com','outlook.com','icloud.com','hotmail.com'];
BEGIN
  -- Hash mật khẩu MỘT lần rồi dùng lại cho mọi dòng. bcrypt tốn ~100ms/lần nên
  -- gọi trong SELECT theo từng dòng sẽ biến vài trăm dòng thành hàng phút.
  v_pw := extensions.crypt('Lumia@123', extensions.gen_salt('bf'));

  -- Đánh số email tiếp nối lần chạy trước để chạy lại với --rate cao hơn không
  -- đụng email đã tạo.
  SELECT 100000 + count(*) INTO v_base
  FROM auth.users WHERE raw_app_meta_data->>'seed' = '${seedTag}';

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  WITH target(day, want) AS (
    VALUES
${values}
  ),
  -- Gom theo NGÀY UTC: báo cáo lọc bằng mốc \`...T00:00:00.000Z\`, gom theo giờ
  -- server sẽ lệch ngày và bù sai.
  existing AS (
    SELECT (created_at AT TIME ZONE 'UTC')::date AS day, count(*) AS have
    FROM public.profiles
    WHERE created_at >= '${startDate}T00:00:00Z'
      AND created_at <= '${endDate}T23:59:59.999Z'
    GROUP BY 1
  ),
  -- Thiếu bao nhiêu so với chỉ tiêu NGÀY — dùng làm trọng số rải, không dùng
  -- trực tiếp làm số chèn.
  deficit AS (
    SELECT t.day, GREATEST(0, t.want - COALESCE(e.have, 0))::numeric AS gap
    FROM target t
    LEFT JOIN existing e ON e.day = t.day
  ),
  -- Bù theo TỔNG chứ không theo từng ngày. Chèn đủ mỗi ngày nghe thì hợp lý,
  -- nhưng nếu profile sẵn có dồn cục vào một ngày (seed 002 dồn hết vào ngày
  -- chạy nó, vì trigger không lùi created_at) thì ngày đó đã thừa mà các ngày
  -- khác vẫn chèn đủ — tổng vọt qua chỉ tiêu. Lấy tổng thiếu rồi rải theo trọng
  -- số \`gap\` thì tổng cuối luôn bám đúng ${totalWant}.
  totals AS (
    SELECT
      (SELECT COALESCE(sum(gap), 0) FROM deficit) AS sum_gap,
      GREATEST(0, ${totalWant} - (
        SELECT count(*) FROM public.profiles
        WHERE created_at >= '${startDate}T00:00:00Z'
          AND created_at <= '${endDate}T23:59:59.999Z'
      ))::numeric AS shortfall
  ),
  share AS (
    SELECT d.day,
           CASE WHEN t.sum_gap > 0 THEN d.gap * t.shortfall / t.sum_gap ELSE 0 END AS exact
    FROM deficit d CROSS JOIN totals t
  ),
  -- Chia phần dư lớn nhất: làm tròn xuống rồi phát nốt phần lẻ cho những ngày
  -- hụt nhiều nhất, để tổng khớp đúng chứ không hụt vài đơn vị vì làm tròn.
  ranked AS (
    SELECT day, floor(exact)::int AS base,
           row_number() OVER (ORDER BY exact - floor(exact) DESC, day) AS rk
    FROM share
  ),
  need AS (
    SELECT r.day,
           (r.base + CASE
              WHEN r.rk <= (SELECT shortfall FROM totals)::int
                          - (SELECT COALESCE(sum(base), 0) FROM ranked)
              THEN 1 ELSE 0 END)::int AS missing
    FROM ranked r
  ),
  slot AS (
    SELECT n.day, row_number() OVER (ORDER BY n.day, g) AS seq
    FROM need n, generate_series(1, n.missing) g
    WHERE n.missing > 0
  ),
  pick AS (
    SELECT
      seq,
      (random() < 0.52)                                            AS fem,
      (random() < 0.72)                                            AS has_dem,
      ho[1 + floor(random() * array_length(ho, 1))::int]           AS s_ho,
      dem_nu[1 + floor(random() * array_length(dem_nu, 1))::int]   AS d_nu,
      ten_nu[1 + floor(random() * array_length(ten_nu, 1))::int]   AS t_nu,
      dem_nam[1 + floor(random() * array_length(dem_nam, 1))::int] AS d_nam,
      ten_nam[1 + floor(random() * array_length(ten_nam, 1))::int] AS t_nam,
      dom[1 + floor(random() * array_length(dom, 1))::int]         AS domain,
      -- Rải trong ngày cho tự nhiên, nhưng không vượt quá thời điểm hiện tại:
      -- ngày cuối là hôm nay và chưa trọn.
      LEAST(
        (day::text || ' 00:00:00+00')::timestamptz + (random() * interval '86399 seconds'),
        now()
      )                                                            AS ts
    FROM slot
  ),
  built AS (
    SELECT
      seq, ts, domain,
      s_ho
        || CASE WHEN has_dem THEN ' ' || CASE WHEN fem THEN d_nu ELSE d_nam END ELSE '' END
        || ' ' || CASE WHEN fem THEN t_nu ELSE t_nam END           AS full_name,
      CASE WHEN fem THEN t_nu ELSE t_nam END                       AS given
    FROM pick
  )
  SELECT
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    lower(translate(
      given,
      'áàảãạâấầẩẫậăắằẳẵặéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ',
      'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd'
    )) || (v_base + seq)::text || '@' || domain,
    v_pw,
    ts,
    jsonb_build_object(
      'provider', 'email',
      'providers', jsonb_build_array('email'),
      'seed', '${seedTag}'
    ),
    jsonb_build_object('full_name', full_name),
    ts,
    ts,
    '', '', '', ''
  FROM built
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  -- Bắt buộc: kéo created_at của profiles về đúng ngày của auth.users. Trigger
  -- handle_new_user không làm việc này nên thiếu bước đây là seed vô nghĩa.
  UPDATE public.profiles p
  SET created_at = u.created_at
  FROM auth.users u
  WHERE u.id = p.id
    AND u.raw_app_meta_data->>'seed' = '${seedTag}'
    AND p.created_at IS DISTINCT FROM u.created_at;

  GET DIAGNOSTICS v_touched = ROW_COUNT;

  RAISE NOTICE 'Đã chèn % tài khoản mới, chỉnh created_at cho % profile (seed=${seedTag}, mật khẩu=Lumia@123).',
    v_inserted, v_touched;
  IF v_inserted = 0 THEN
    RAISE NOTICE 'Không chèn gì: số profile mỗi ngày đã đạt chỉ tiêu. Muốn nhiều hơn thì chạy lại script với --rate cao hơn.';
  END IF;
END $$;

-- ── Đối chiếu ────────────────────────────────────────────────────────────────
-- So số tài khoản/ngày với chỉ tiêu (cột thiếu = chưa đủ, âm = đã dư sẵn):
--
--   SELECT (created_at AT TIME ZONE 'UTC')::date AS ngay, count(*) AS so_tai_khoan
--   FROM public.profiles
--   WHERE created_at >= '${perDay[0].date}T00:00:00Z'
--   GROUP BY 1 ORDER BY 1;

-- ── Gỡ bỏ ────────────────────────────────────────────────────────────────────
-- Xoá auth.users sẽ cascade sang profiles / subscriptions / streaks /
-- notification_settings (mọi FK đều ON DELETE CASCADE):
--
--   DELETE FROM auth.users WHERE raw_app_meta_data->>'seed' = '${seedTag}';
`;

writeFileSync(outPath, sql, "utf8");

// ─── Báo cáo ────────────────────────────────────────────────────────────────

const rel = path.relative(ROOT, outPath);
console.log(`✓ Đã ghi ${rel}`);
console.log(`  Kỳ           ${perDay[0].date} → ${perDay[perDay.length - 1].date} (${perDay.length} ngày)`);
console.log(`  Neo theo     ô "${match === "users" ? "Người dùng" : "người dùng mới"}" = ${anchorValue.toLocaleString("vi-VN")} × ${(rate * 100).toFixed(1)}%`);
console.log(`  Báo cáo      ${report.summary.users.toLocaleString("vi-VN")} người dùng · ${totalNewUsers.toLocaleString("vi-VN")} lần đầu`);
console.log(`  Chỉ tiêu     ${totalWant.toLocaleString("vi-VN")} tài khoản`);
if (overCeiling) {
  console.log("");
  console.log(`  (!) Tỉ lệ khách → tài khoản thành ${(impliedConversion * 100).toFixed(0)}%, vượt trần ${SIGNUP_CONVERSION_CEILING * 100}% của app.`);
  console.log("      Vẫn sinh file vì đây là lựa chọn của bạn, nhưng cần biết:");
  console.log("      - 100% khách ghé đều tạo tài khoản là con số không có thật ngoài đời.");
  console.log("      - Nếu sau này tắt ANALYTICS_SAMPLE_MODE, calibrateForSignups sẽ tự");
  console.log(`        thổi lưu lượng demo lên ~${Math.ceil(totalWant / SIGNUP_CONVERSION_CEILING).toLocaleString("vi-VN")} người để phủ số tài khoản này.`);
}
console.log("");
console.log("  Đối chiếu từng kỳ của tab Vận hành:");
console.log("    kỳ     người dùng  lần đầu  tài khoản  tỉ lệ");
for (const key of ["today", "7d", "28d", "90d"]) {
  const r = resolveDateRange(key, today, true);
  const summary = buildSampleGaReport(r).summary;
  const want = perDay
    .filter((d) => d.date >= r.startDate && d.date <= r.endDate)
    .reduce((sum, d) => sum + d.want, 0);
  // Chia cho đúng ô đã neo, không thì --match=users sẽ ra tỉ lệ vô nghĩa.
  const base = match === "users" ? summary.users : summary.newUsers;
  const ratio = base > 0 ? (want / base) * 100 : 0;
  console.log(
    `    ${key.padEnd(6)} ${String(summary.users).padStart(9)}` +
      ` ${String(summary.newUsers).padStart(8)}` +
      ` ${String(want).padStart(10)}` +
      ` ${ratio.toFixed(1).padStart(6)}%`,
  );
}
console.log("");
console.log(`  Cột tỉ lệ = tài khoản / ô "${match === "users" ? "Người dùng" : "người dùng mới"}" của kỳ đó.`);
console.log("  Chỉ kỳ rộng nhất khớp đúng --rate. Kỳ ngắn thấp hơn là đúng: KPI người");
console.log("  dùng đã loại trùng nên không cộng được, còn tài khoản thì tích luỹ.");
console.log("");
console.log(`  Chạy tiếp: mở ${rel} rồi dán vào Supabase SQL Editor.`);
