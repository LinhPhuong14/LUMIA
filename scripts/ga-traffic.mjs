#!/usr/bin/env node
/**
 * Sinh lưu lượng tổng hợp vào property GA4 của site.
 *
 * ĐỌC TRƯỚC KHI CHẠY — ba điều không đảo ngược được:
 *
 *   1. Sự kiện đã vào GA4 thì KHÔNG XOÁ ĐƯỢC. Số do script này tạo ra sẽ trộn
 *      vĩnh viễn với traffic thật về sau; từ đó trở đi không còn cách nào tách
 *      ra để biết marketing có thật sự chạy hay không.
 *   2. Vi phạm điều khoản sử dụng Google Analytics. Rủi ro khoá property là có.
 *   3. Nó sẽ làm lệch chính hệ thống báo cáo của repo này: `resolveAnchor()`
 *      trong src/lib/analytics/backfill.ts lấy trung bình traffic GA4 *thật* để
 *      tính scale_factor rồi co giãn toàn bộ đoạn lịch sử trong bảng
 *      analytics_daily_snapshot — vốn chỉ đóng băng một lần (migration 026).
 *      Nếu những ngày này là ngày GA4 đầu tiên, cả lịch sử sẽ bị kéo theo.
 *
 * VÌ SAO DÙNG TRÌNH DUYỆT THẬT CHỨ KHÔNG PHẢI MEASUREMENT PROTOCOL:
 * Measurement Protocol chặn các tên sự kiện dành riêng, trong đó có
 * `first_visit` và `session_start`. Mà GA4 dẫn xuất chỉ số `newUsers` từ
 * `first_visit`. Nên bơm MP thổi được activeUsers/sessions/screenPageViews
 * nhưng KHÔNG tạo được "người dùng mới" một cách đáng tin. Mở trình duyệt thật
 * với context trắng thì gtag tự sinh client_id mới rồi tự bắn first_visit —
 * đúng thứ cần, không phải mô phỏng.
 *
 * CHẠY Ở ĐÂU: máy cá nhân, đường mạng bình thường. KHÔNG chạy trên server/CI:
 * 20 phiên cùng một IP datacenter, cùng một thành phố, trong một giờ là chân
 * dung bot kinh điển — báo cáo nhìn còn giả hơn là không làm gì.
 *
 * Chạy một lần = một ngày. Muốn 100 người trong 5 ngày thì chạy 5 ngày liên
 * tiếp với --users=20. GA4 không nhận sự kiện lùi quá 72h nên không có cách
 * nào dồn 5 ngày vào một buổi.
 *
 * Cài trước:  npm i -D playwright && npx playwright install chromium
 *
 * Ví dụ:
 *   node scripts/ga-traffic.mjs --url=https://lumia.com.vn --users=20 --dry-run
 *   node scripts/ga-traffic.mjs --url=https://lumia.com.vn --users=20 \
 *     --i-understand-this-is-irreversible
 */

import process from "node:process";

/**
 * Chỉ những route marketing công khai.
 *
 * Cố tình BỎ /checkout, /onboarding, /subscription, /store/orders và mọi trang
 * auth: chúng chạm PayOS, tạo bản ghi trong Supabase, hoặc gọi OpenAI — tốn
 * tiền thật và bẩn dữ liệu thật. Xem lưu lượng thì không cần vào những chỗ đó.
 */
const PAGES = [
  { path: "/", weight: 5 },
  { path: "/about", weight: 2 },
  { path: "/boxes", weight: 3 },
  { path: "/store", weight: 3 },
  { path: "/blog", weight: 2 },
  { path: "/quiz", weight: 1 },
];

/**
 * Chromium bản đóng gói của Playwright để chuỗi "HeadlessChrome" trong
 * user-agent. Chuỗi đó nằm trong danh sách IAB Spiders & Bots mà GA4 lọc bỏ
 * mặc định, nên không ghi đè thì toàn bộ phiên bị vứt lặng lẽ — chạy xong
 * không thấy gì mà cũng không có lỗi.
 */
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1",
];

const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1536, height: 864 },
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
];

/** Dưới 10 giây thì GA4 không tính phiên là "engaged" → engagementRate ra 0. */
const DWELL_MIN_MS = 12_000;
const DWELL_MAX_MS = 40_000;

/** Giãn cách giữa hai người dùng, để 20 phiên không dồn hết vào một phút. */
const GAP_MIN_MS = 20_000;
const GAP_MAX_MS = 150_000;

const CONFIRM_FLAG = "--i-understand-this-is-irreversible";

// ─── Tiện ích ────────────────────────────────────────────────────────────────

/** mulberry32 — cùng idiom với src/lib/analytics/demo-data.ts. */
function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function randInt(rand, min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

function pick(rand, items) {
  return items[Math.floor(rand() * items.length)];
}

function pickWeighted(rand, items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = rand() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) {
      return item;
    }
  }
  return items[items.length - 1];
}

function formatMs(ms) {
  return `${Math.round(ms / 1000)}s`;
}

export function parseArgs(argv) {
  const args = {
    users: 20,
    dryRun: false,
    diagnose: false,
    confirmed: false,
    url: null,
    seed: null,
    headed: false,
  };

  for (const raw of argv) {
    if (raw === "--dry-run") {
      args.dryRun = true;
    } else if (raw === "--diagnose") {
      args.diagnose = true;
    } else if (raw === CONFIRM_FLAG) {
      args.confirmed = true;
    } else if (raw === "--headed") {
      args.headed = true;
    } else if (raw.startsWith("--url=")) {
      args.url = raw.slice(6).trim().replace(/\/$/, "");
    } else if (raw.startsWith("--users=")) {
      args.users = Number(raw.slice(8));
    } else if (raw.startsWith("--seed=")) {
      args.seed = Number(raw.slice(7));
    } else {
      throw new Error(`Tham số không hiểu: ${raw}`);
    }
  }

  return args;
}

/**
 * URL truyền tay, cố tình KHÔNG đọc NEXT_PUBLIC_APP_URL từ env: biến đó trỏ
 * thẳng production, lỡ tay chạy là bơm thật, không rút lại được.
 */
function validate(args) {
  if (!args.url) {
    throw new Error("Thiếu --url=https://... (bắt buộc truyền tay, không lấy từ env).");
  }
  if (!/^https:\/\/[^/\s]+$/.test(args.url)) {
    throw new Error(`--url phải là origin https hợp lệ, nhận được: ${args.url}`);
  }
  if (!Number.isInteger(args.users) || args.users < 1 || args.users > 200) {
    throw new Error("--users phải là số nguyên trong khoảng 1..200.");
  }
  // --diagnose chỉ mở đúng một trang để đọc trạng thái, không cần cờ xác nhận.
  if (!args.dryRun && !args.diagnose && !args.confirmed) {
    throw new Error(
      `Thiếu cờ xác nhận. Chạy thật sẽ ghi vĩnh viễn vào GA4 và không xoá được.\n` +
        `  Xem trước:  --dry-run\n` +
        `  Chạy thật:  ${CONFIRM_FLAG}`,
    );
  }
}

// ─── Kế hoạch mỗi lượt ghé ───────────────────────────────────────────────────

/**
 * Một người dùng xem 2-4 trang. Từ 2 trang trở lên GA4 đã tính phiên là
 * engaged, cộng với thời gian dừng thì cả engagementRate lẫn
 * averageSessionDuration đều không ra những con số phẳng lì dễ nhận ra.
 */
export function buildVisitPlan(rand) {
  const depth = randInt(rand, 2, 4);
  const seen = new Set();
  const steps = [];

  while (steps.length < depth) {
    const page = steps.length === 0 ? PAGES[0] : pickWeighted(rand, PAGES);
    if (seen.has(page.path) && steps.length > 0) {
      continue;
    }
    seen.add(page.path);
    steps.push({ path: page.path, dwellMs: randInt(rand, DWELL_MIN_MS, DWELL_MAX_MS) });
  }

  return {
    userAgent: pick(rand, USER_AGENTS),
    viewport: pick(rand, VIEWPORTS),
    steps,
  };
}

export function buildBatch(rand, users) {
  return Array.from({ length: users }, () => ({
    plan: buildVisitPlan(rand),
    gapMs: randInt(rand, GAP_MIN_MS, GAP_MAX_MS),
  }));
}

// ─── Thực thi ────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Beacon của GA4 đi tới google-analytics.com/g/collect (có bản region1..4). */
function isGaBeacon(url) {
  return url.includes("google-analytics.com") && url.includes("/collect");
}

async function runVisit(browser, plan, origin, index) {
  const context = await browser.newContext({
    userAgent: plan.userAgent,
    viewport: plan.viewport,
    locale: "vi-VN",
    timezoneId: "Asia/Ho_Chi_Minh",
  });

  let beacons = 0;
  const page = await context.newPage();
  page.on("request", (request) => {
    if (isGaBeacon(request.url())) {
      beacons += 1;
    }
  });

  try {
    for (const step of plan.steps) {
      await page.goto(`${origin}${step.path}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
      // gtag nạp ở strategy="afterInteractive", beacon bay sau khi hydrate xong.
      // Đóng context sớm là mất sự kiện mà không có lỗi nào báo.
      await sleep(step.dwellMs);
    }
  } finally {
    // Đợi nốt beacon cuối rời trình duyệt trước khi đóng.
    await sleep(2_000);
    await context.close();
  }

  const paths = plan.steps.map((step) => step.path).join(" → ");
  console.log(
    `  [${String(index + 1).padStart(3)}] ${beacons} beacon  ${plan.viewport.width}x${plan.viewport.height}  ${paths}`,
  );

  return beacons;
}

/** Trình duyệt dùng chung cho cả chạy thật lẫn --diagnose. */
async function launchBrowser(headed) {
  const { chromium } = await import("playwright");
  return chromium.launch({
    headless: !headed,
    args: ["--disable-blink-features=AutomationControlled"],
  });
}

/**
 * Mở đúng một trang rồi đọc trạng thái thật của GA trên đó.
 *
 * Có bốn chỗ chuỗi này đứt được, và bốn chỗ đó cần bốn cách sửa hoàn toàn khác
 * nhau. Đoán mò thì sửa nhầm chỗ, nên hỏi thẳng trình duyệt.
 */
async function runDiagnose(origin, headed) {
  const browser = await launchBrowser(headed);
  const context = await browser.newContext({
    userAgent: USER_AGENTS[0],
    viewport: VIEWPORTS[0],
    locale: "vi-VN",
    timezoneId: "Asia/Ho_Chi_Minh",
  });
  const page = await context.newPage();

  const beacons = [];
  page.on("request", (request) => {
    if (isGaBeacon(request.url())) {
      beacons.push(request.url());
    }
  });

  try {
    const response = await page.goto(origin, { waitUntil: "load", timeout: 60_000 });
    const html = await response.text();
    const loader = /googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9]+)/i.exec(html);

    // gtag.js nạp afterInteractive; chờ đủ lâu để hydrate xong rồi mới kết luận.
    await sleep(12_000);

    const state = await page.evaluate(() => ({
      gtagType: typeof window.gtag,
      dataLayerLength: Array.isArray(window.dataLayer) ? window.dataLayer.length : null,
      dataLayerEvents: Array.isArray(window.dataLayer)
        ? window.dataLayer
            .map((entry) => {
              const list = Array.from(entry ?? []);
              return list[0] === "event" ? String(list[1]) : String(list[0] ?? "");
            })
            .filter(Boolean)
        : [],
      hasGaCookie: /(^|;\s*)_ga=/.test(document.cookie),
    }));

    console.log(`HTML có thẻ gtag        ${loader ? `có — ${loader[1]}` : "KHÔNG"}`);
    console.log(`window.gtag             ${state.gtagType}`);
    console.log(`dataLayer              ${state.dataLayerLength ?? "không có"} mục`);
    console.log(`  nội dung             ${state.dataLayerEvents.join(", ") || "(rỗng)"}`);
    console.log(`cookie _ga              ${state.hasGaCookie ? "có" : "KHÔNG"}`);
    console.log(`beacon /g/collect       ${beacons.length}`);

    console.log(`\n── Kết luận ──`);
    if (!loader) {
      console.log(
        `NEXT_PUBLIC_GA_ID không có trong HTML server trả về.\n` +
          `Biến chưa set, hoặc NEXT_PUBLIC_ANALYTICS_DISABLED=true, hoặc trang này được\n` +
          `render tĩnh từ lần build TRƯỚC khi bạn thêm biến — trường hợp cuối cần deploy lại.`,
      );
    } else if (state.gtagType !== "function") {
      console.log(
        `Thẻ script có trong HTML nhưng window.gtag không bao giờ được định nghĩa.\n` +
          `Script gtag bị chặn (adblock/DNS/CSP) hoặc không tải được.`,
      );
    } else if (beacons.length === 0) {
      console.log(
        `gtag sẵn sàng nhưng KHÔNG có beacon nào rời trình duyệt.\n` +
          `Đây là triệu chứng của send_page_view:false cộng với page_view bị mất:\n` +
          `trackPageView() trong src/lib/analytics.ts trả false khi window.gtag chưa\n` +
          `kịp tồn tại lúc useEffect chạy, và nó nuốt lỗi im lặng.`,
      );
    } else {
      console.log(
        `Phía trình duyệt CHẠY ĐÚNG — ${beacons.length} beacon đã gửi đi.\n` +
          `Số không lên là do phía GA4, hãy kiểm tra theo thứ tự:\n` +
          `  1. Admin → Data Settings → Data Filters: bộ lọc "Internal Traffic" có đang\n` +
          `     loại IP của bạn không (rất hay gặp, bật sẵn lúc setup).\n` +
          `  2. Bạn đang xem báo cáo chuẩn (trễ 24-48h) thay vì Realtime.\n` +
          `  3. Measurement ID trong HTML có đúng data stream bạn đang mở không.`,
      );
    }
    console.log("");
  } finally {
    await context.close();
    await browser.close();
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  validate(args);

  if (args.diagnose) {
    console.log(`\nChẩn đoán ${args.url}\n`);
    await runDiagnose(args.url, args.headed);
    return;
  }

  const seed = args.seed ?? Math.floor(Date.now() / 86_400_000);
  const rand = createRandom(seed);
  const batch = buildBatch(rand, args.users);

  const totalPageViews = batch.reduce((sum, item) => sum + item.plan.steps.length, 0);
  const totalMs = batch.reduce(
    (sum, item) => sum + item.gapMs + item.plan.steps.reduce((s, step) => s + step.dwellMs, 0),
    0,
  );

  console.log(`\nĐích      ${args.url}`);
  console.log(`Người mới ${args.users}`);
  console.log(`Lượt xem  ~${totalPageViews}`);
  console.log(`Thời lượng ~${Math.round(totalMs / 60_000)} phút`);
  console.log(`Seed      ${seed}\n`);

  if (args.dryRun) {
    for (const [index, item] of batch.entries()) {
      const paths = item.plan.steps
        .map((step) => `${step.path}(${formatMs(step.dwellMs)})`)
        .join(" → ");
      console.log(`  [${String(index + 1).padStart(3)}] ${paths}  +chờ ${formatMs(item.gapMs)}`);
    }
    console.log(`\nDry-run: chưa mở trình duyệt, chưa gửi gì tới GA4.\n`);
    return;
  }

  // Nạp muộn để --dry-run chạy được khi chưa cài Playwright.
  const browser = await launchBrowser(args.headed);

  let sent = 0;
  let visited = 0;

  try {
    for (const [index, item] of batch.entries()) {
      try {
        sent += await runVisit(browser, item.plan, args.url, index);
        visited += 1;
      } catch (error) {
        console.log(`  [${String(index + 1).padStart(3)}] LỖI: ${error.message}`);
      }
      if (index < batch.length - 1) {
        await sleep(item.gapMs);
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\nXong: ${visited}/${args.users} lượt ghé, ${sent} beacon GA4.`);

  if (sent === 0) {
    console.log(
      `\nKhông có beacon nào. Nghĩa là gtag không chạy — kiểm tra NEXT_PUBLIC_GA_ID đã set\n` +
        `trên production chưa, và NEXT_PUBLIC_ANALYTICS_DISABLED có đang bật không.`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `Kiểm tra ngay ở GA4 → Realtime (hiện sau ~30 giây).\n` +
      `Báo cáo chuẩn và tab /admin phải chờ Data API xử lý, trễ 24-48h.\n`,
  );
}

main().catch((error) => {
  console.error(`\n${error.message}\n`);
  process.exitCode = 1;
});
