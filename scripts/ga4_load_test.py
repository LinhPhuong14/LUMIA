#!/usr/bin/env python3
"""Seed dữ liệu tổng hợp vào GA4 property TEST qua Measurement Protocol — phục vụ load test.

CHỈ DÙNG CHO PROPERTY DEV/TEST. Script luôn in measurement_id và bắt xác nhận
tường minh trước khi gửi bất kỳ event nào (kể cả debug endpoint).

Ràng buộc được thực thi trong code:
  - Credentials chỉ đọc từ env: GA_MEASUREMENT_ID, GA_API_SECRET. Không hardcode.
  - timestamp_micros không lùi quá 72h; event vi phạm bị DROP + log cảnh báo.
  - Mọi event mang params: traffic_type=internal, data_source=synthetic_load_test,
    engagement_time_msec, session_id.
  - Không PII: client_id/user_id/transaction_id sinh ngẫu nhiên hoàn toàn.

Lưu ý giao thức (đọc trước khi thắc mắc số liệu):
  - MP chặn tên event dành riêng (`session_start`, `first_visit`, ...) — debug
    endpoint trả NAME_RESERVED. Script dùng `synthetic_session_start` thay thế,
    nghĩa là load test này KHÔNG tạo được newUsers/sessions "chuẩn" trong report;
    nó đo khả năng chịu tải pipeline + render report trên event tổng hợp.
  - /mp/collect trả 204 cho cả payload sai — status 2xx chỉ đo transport.
    Vì vậy bước dry-run qua /debug/mp/collect là bắt buộc trước smoke/load.
  - device/geo được set qua trường MP `device` và `user_location` (bổ sung 2024);
    property cũ có thể lờ hai trường này đi — khi đó report hiện (not set).

Cài đặt:  pip install aiohttp

Ví dụ:
  export GA_MEASUREMENT_ID=G-XXXXXXX GA_API_SECRET=yyy
  python3 scripts/ga4_load_test.py --step dry-run
  python3 scripts/ga4_load_test.py --step smoke
  python3 scripts/ga4_load_test.py --step load --levels 100,1000,10000 \
      --level-duration 60 --report ga4_load_report.md
  # Không tương tác (CI): thêm --confirm G-XXXXXXX (phải khớp env thì mới chạy)
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import random
import statistics
import string
import sys
import time
import uuid
from collections import Counter
from dataclasses import dataclass, field

try:
    import aiohttp
except ImportError:  # pragma: no cover
    sys.exit("Thiếu aiohttp. Chạy: pip install aiohttp")

COLLECT_URL = "https://www.google-analytics.com/mp/collect"
DEBUG_URL = "https://www.google-analytics.com/debug/mp/collect"

MAX_BACKDATE_HOURS = 72          # giới hạn cứng của GA4
BACKDATE_SAFETY_MARGIN_S = 300   # chừa 5 phút để event không "già" thêm khi retry
MAX_EVENTS_PER_REQUEST = 25      # giới hạn batch của MP

# ---------------------------------------------------------------------------
# Phân bố có trọng số — mô phỏng traffic thật thay vì đều tăm tắp
# ---------------------------------------------------------------------------

PAGES = [  # (path, title, weight)
    ("/", "Trang chủ", 30),
    ("/products", "Sản phẩm", 20),
    ("/products/den-tha-tran", "Đèn thả trần", 12),
    ("/products/den-ban-lam-viec", "Đèn bàn làm việc", 10),
    ("/blog/chon-anh-sang-phong-khach", "Blog: chọn ánh sáng", 8),
    ("/about", "Giới thiệu", 6),
    ("/contact", "Liên hệ", 5),
    ("/cart", "Giỏ hàng", 5),
    ("/checkout", "Thanh toán", 4),
]

DEVICES = [  # (category, os, browser, weight)
    ("mobile", "Android", "Chrome", 45),
    ("mobile", "iOS", "Safari", 25),
    ("desktop", "Windows", "Chrome", 18),
    ("desktop", "macOS", "Safari", 7),
    ("tablet", "iOS", "Safari", 3),
    ("desktop", "Linux", "Firefox", 2),
]

GEOS = [  # (country_id, region_id, city, weight) — ISO 3166
    ("VN", "VN-SG", "Ho Chi Minh City", 40),
    ("VN", "VN-HN", "Hanoi", 30),
    ("VN", "VN-DN", "Da Nang", 10),
    ("VN", "VN-CT", "Can Tho", 5),
    ("SG", "SG-01", "Singapore", 5),
    ("US", "US-CA", "Los Angeles", 5),
    ("JP", "JP-13", "Tokyo", 5),
]

SOURCES = [  # (source, medium, weight)
    ("google", "organic", 40),
    ("(direct)", "(none)", 25),
    ("facebook.com", "referral", 15),
    ("google", "cpc", 10),
    ("newsletter", "email", 5),
    ("zalo", "social", 5),
]

BASE_URL = "https://test.lumia.local"  # domain giả cho page_location, không phải site thật


def wchoice(table):
    weights = [row[-1] for row in table]
    return random.choices(table, weights=weights, k=1)[0]


# ---------------------------------------------------------------------------
# Sinh session / event
# ---------------------------------------------------------------------------

@dataclass
class GenStats:
    sessions: int = 0
    events: int = 0
    dropped_too_old: int = 0


def _rand_client_id() -> str:
    # Định dạng giống gtag: <random>.<timestamp-like>, hoàn toàn ngẫu nhiên, không PII
    return f"{random.randrange(10**9, 10**10)}.{random.randrange(10**9, 10**10)}"


def _rand_user_id() -> str:
    return "loadtest_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=16))


def make_session(now_s: float, max_back_hours: float, stats: GenStats) -> dict | None:
    """Một session = một request MP: 1-5 event cùng client_id/session_id, thứ tự hợp lý.

    Trả về None nếu toàn bộ event của session vi phạm giới hạn 72h (bị drop).
    """
    page, title, _ = wchoice(PAGES)
    device_cat, device_os, browser, _ = wchoice(DEVICES)
    country, region, city, _ = wchoice(GEOS)
    source, medium, _ = wchoice(SOURCES)

    session_id = str(random.randrange(10**9, 10**10))
    session_start_s = now_s - random.uniform(0, max_back_hours * 3600)
    oldest_allowed_s = now_s - MAX_BACKDATE_HOURS * 3600 + BACKDATE_SAFETY_MARGIN_S

    common = {
        "session_id": session_id,
        "page_location": BASE_URL + page,
        "page_title": title,
        "source": source,
        "medium": medium,
        # Bắt buộc theo spec — dùng để lọc/nhận diện dữ liệu tổng hợp về sau
        "traffic_type": "internal",
        "data_source": "synthetic_load_test",
    }

    # Kịch bản: synthetic_session_start → page_view → scroll/click → optional purchase
    # (session_start là tên dành riêng của MP nên dùng biến thể synthetic_)
    names = ["synthetic_session_start", "page_view"]
    for extra in random.sample(["scroll", "click_cta"], k=random.randint(0, 2)):
        names.append(extra)
    if page in ("/cart", "/checkout") and random.random() < 0.5:
        names.append("purchase")
    names = names[: random.randint(1, 5)]

    events, ts = [], session_start_s
    for name in names:
        if ts < oldest_allowed_s:
            stats.dropped_too_old += 1
            print(
                f"[WARN] drop event '{name}' (session {session_id}): "
                f"timestamp lùi quá {MAX_BACKDATE_HOURS}h",
                file=sys.stderr,
            )
            ts += random.uniform(2, 90)
            continue
        params = dict(common, engagement_time_msec=random.randint(500, 45000))
        if name == "purchase":
            value = round(random.uniform(150_000, 5_000_000), 0)
            params.update(
                transaction_id="LT-" + uuid.uuid4().hex[:12],
                currency="VND",
                value=value,
                items=[{
                    "item_id": f"SKU_{random.randrange(1000, 9999)}",
                    "item_name": "Synthetic Lamp",
                    "price": value,
                    "quantity": 1,
                }],
            )
        events.append({
            "name": name,
            "timestamp_micros": int(ts * 1_000_000),
            "params": params,
        })
        ts += random.uniform(2, 90)  # các event trong phiên cách nhau vài giây tới ~1.5 phút

    if not events:
        return None

    payload = {
        "client_id": _rand_client_id(),
        "timestamp_micros": events[0]["timestamp_micros"],
        "non_personalized_ads": True,
        "device": {
            "category": device_cat,
            "operating_system": device_os,
            "browser": browser,
            "language": "vi-vn" if country == "VN" else "en-us",
        },
        "user_location": {"city": city, "region_id": region, "country_id": country},
        "events": events[:MAX_EVENTS_PER_REQUEST],
    }
    if random.random() < 0.3:  # 30% phiên có user đăng nhập (id ngẫu nhiên, không PII)
        payload["user_id"] = _rand_user_id()

    stats.sessions += 1
    stats.events += len(events)
    return payload


# ---------------------------------------------------------------------------
# Gửi + retry + đo đạc
# ---------------------------------------------------------------------------

@dataclass
class Metrics:
    latencies_ms: list = field(default_factory=list)
    statuses: Counter = field(default_factory=Counter)
    events_sent: int = 0
    retries: int = 0
    gave_up: int = 0

    def record(self, status: int | str, latency_ms: float, n_events: int):
        self.statuses[status] += 1
        self.latencies_ms.append(latency_ms)
        if isinstance(status, int) and 200 <= status < 300:
            self.events_sent += n_events

    @property
    def requests(self) -> int:
        return sum(self.statuses.values())

    def errors(self) -> int:
        return sum(v for k, v in self.statuses.items()
                   if not (isinstance(k, int) and 200 <= k < 300))

    def error_rate(self) -> float:
        return self.errors() / self.requests if self.requests else 0.0

    def pct(self, p: float) -> float:
        if not self.latencies_ms:
            return 0.0
        data = sorted(self.latencies_ms)
        return data[min(len(data) - 1, int(p / 100 * len(data)))]

    def row(self, label: str, wall_s: float) -> dict:
        return {
            "level": label,
            "requests": self.requests,
            "events": self.events_sent,
            "rps": round(self.requests / wall_s, 2) if wall_s else 0,
            "statuses": dict(self.statuses),
            "p50_ms": round(self.pct(50), 1),
            "p95_ms": round(self.pct(95), 1),
            "err_4xx": sum(v for k, v in self.statuses.items()
                           if isinstance(k, int) and 400 <= k < 500),
            "err_429": self.statuses.get(429, 0),
            "error_rate": round(self.error_rate() * 100, 2),
        }


class RateLimiter:
    """Token bucket đơn giản: cho phép `rate` request/giây, burst nhỏ."""

    def __init__(self, rate_per_s: float):
        self.rate = max(rate_per_s, 0.01)
        self.tokens = 1.0
        self.updated = time.monotonic()
        self._lock = asyncio.Lock()

    async def acquire(self):
        async with self._lock:
            while True:
                now = time.monotonic()
                self.tokens = min(self.tokens + (now - self.updated) * self.rate, self.rate)
                self.updated = now
                if self.tokens >= 1:
                    self.tokens -= 1
                    return
                await asyncio.sleep((1 - self.tokens) / self.rate)


class Sender:
    MAX_RETRIES = 5

    def __init__(self, session: aiohttp.ClientSession, url: str, mid: str, secret: str,
                 metrics: Metrics, limiter: RateLimiter):
        self.session, self.metrics, self.limiter = session, metrics, limiter
        self.url = f"{url}?measurement_id={mid}&api_secret={secret}"

    async def send(self, payload: dict) -> tuple[int | str, str]:
        """Gửi 1 request, retry với exponential backoff cho 429/5xx/lỗi mạng."""
        n_events = len(payload["events"])
        backoff = 1.0
        for attempt in range(self.MAX_RETRIES + 1):
            await self.limiter.acquire()
            t0 = time.monotonic()
            try:
                async with self.session.post(
                    self.url, json=payload, timeout=aiohttp.ClientTimeout(total=15)
                ) as resp:
                    latency = (time.monotonic() - t0) * 1000
                    body = await resp.text()
                    status = resp.status
                    retry_after = resp.headers.get("Retry-After")
            except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
                latency = (time.monotonic() - t0) * 1000
                status, body, retry_after = f"EXC:{type(exc).__name__}", "", None

            retryable = status == 429 or (isinstance(status, int) and status >= 500) \
                or isinstance(status, str)
            if not retryable or attempt == self.MAX_RETRIES:
                self.metrics.record(status, latency, n_events)
                if retryable:
                    self.metrics.gave_up += 1
                return status, body

            self.metrics.retries += 1
            delay = float(retry_after) if retry_after else backoff * (1 + random.random() * 0.3)
            await asyncio.sleep(min(delay, 60))
            backoff *= 2
        raise AssertionError("unreachable")


# ---------------------------------------------------------------------------
# Cổng xác nhận — ràng buộc bắt buộc số 1
# ---------------------------------------------------------------------------

def load_credentials() -> tuple[str, str]:
    mid = os.environ.get("GA_MEASUREMENT_ID", "").strip()
    secret = os.environ.get("GA_API_SECRET", "").strip()
    if not mid or not secret:
        sys.exit("Thiếu GA_MEASUREMENT_ID / GA_API_SECRET trong biến môi trường. Dừng.")
    return mid, secret


def confirm_target(mid: str, step: str, confirm_flag: str | None):
    print("=" * 62)
    print("  GA4 MEASUREMENT PROTOCOL LOAD TEST")
    print(f"  measurement_id : {mid}")
    print(f"  bước           : {step}")
    print("  YÊU CẦU: đây phải là property DEV/TEST, không phải production.")
    print("=" * 62)
    if not mid.startswith("G-"):
        print(f"[WARN] '{mid}' không có dạng G-XXXXXXX của GA4.", file=sys.stderr)

    if confirm_flag is not None:
        if confirm_flag == mid:
            print(f"Đã xác nhận qua --confirm {mid}. Tiếp tục.")
            return
        sys.exit(f"--confirm '{confirm_flag}' KHÔNG khớp measurement_id trong env. Dừng.")

    if not sys.stdin.isatty():
        sys.exit(
            "Không có terminal tương tác để xác nhận. Chạy lại với "
            f"--confirm {mid} nếu bạn chắc chắn đây là property TEST. Dừng."
        )
    answer = input(f"Gõ lại chính xác measurement_id ({mid}) để xác nhận gửi: ").strip()
    if answer != mid:
        sys.exit("Xác nhận không khớp. Dừng, không gửi gì cả.")
    print("Đã xác nhận. Tiếp tục.")


# ---------------------------------------------------------------------------
# Các bước
# ---------------------------------------------------------------------------

async def run_batch(sender: Sender, n_events_target: int, max_back_hours: float,
                    stats: GenStats, error_threshold: float,
                    abort_check_every: int = 20) -> bool:
    """Gửi tới khi đạt ~n_events_target event. Trả về False nếu vượt ngưỡng lỗi."""
    metrics = sender.metrics
    base_requests = metrics.requests
    tasks: set[asyncio.Task] = set()
    sent_events = 0
    aborted = False

    while sent_events < n_events_target and not aborted:
        payload = make_session(time.time(), max_back_hours, stats)
        if payload is None:
            continue
        sent_events += len(payload["events"])
        tasks.add(asyncio.ensure_future(sender.send(payload)))
        if len(tasks) >= abort_check_every:
            done, tasks = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
            for t in done:
                t.result()
            if metrics.requests - base_requests >= 50 and metrics.error_rate() > error_threshold:
                aborted = True
    if tasks:
        await asyncio.gather(*tasks)
    if not aborted and metrics.requests - base_requests >= 20 \
            and metrics.error_rate() > error_threshold:
        aborted = True
    return not aborted


async def step_dry_run(mid: str, secret: str, args) -> int:
    """5 event mẫu qua debug endpoint, in validationMessages."""
    stats = GenStats()
    payloads = []
    while sum(len(p["events"]) for p in payloads) < 5:
        p = make_session(time.time(), args.max_back_hours, stats)
        if p:
            payloads.append(p)

    metrics = Metrics()
    ok = True
    async with aiohttp.ClientSession() as http:
        sender = Sender(http, DEBUG_URL, mid, secret, metrics, RateLimiter(2))
        for i, payload in enumerate(payloads, 1):
            status, body = await sender.send(payload)
            print(f"\n--- payload {i} ({len(payload['events'])} event) → HTTP {status}")
            try:
                messages = json.loads(body).get("validationMessages", [])
            except (json.JSONDecodeError, AttributeError):
                messages = [{"description": f"body không phải JSON: {body[:200]}"}]
            if messages:
                ok = False
                for m in messages:
                    print(f"  [VALIDATION] {json.dumps(m, ensure_ascii=False)}")
            else:
                print("  validationMessages: [] — payload hợp lệ")
    print(f"\nDry run: {stats.events} event / {stats.sessions} session, "
          f"dropped(>72h)={stats.dropped_too_old}")
    print("KẾT LUẬN: " + ("PASS — có thể sang --step smoke" if ok
                          else "FAIL — sửa payload theo validationMessages rồi chạy lại"))
    return 0 if ok else 1


async def step_smoke(mid: str, secret: str, args) -> int:
    """100 event thật, throughput thấp (~5 req/s)."""
    stats, metrics = GenStats(), Metrics()
    t0 = time.monotonic()
    async with aiohttp.ClientSession() as http:
        sender = Sender(http, COLLECT_URL, mid, secret, metrics, RateLimiter(5))
        ok = await run_batch(sender, 100, args.max_back_hours, stats, args.error_threshold)
    wall = time.monotonic() - t0
    print_report([metrics.row("smoke (100 ev)", wall)], stats)
    print("\nKiểm tra thủ công: mở GA4 DebugView/Realtime của property TEST, lọc theo "
          "param data_source=synthetic_load_test, xác nhận event xuất hiện rồi mới chạy --step load.")
    return 0 if ok else 1


async def step_load(mid: str, secret: str, args) -> int:
    """Tăng tải theo bậc (event/phút). Dừng ngay nếu tỉ lệ lỗi vượt ngưỡng."""
    levels = [int(x) for x in args.levels.split(",")] if not args.rate else []
    rows, stats = [], GenStats()
    async with aiohttp.ClientSession() as http:
        if args.rate:  # chế độ 1 bậc cố định: --rate event/s trong --duration giây
            plan = [(args.rate * 60, args.duration)]
        else:
            plan = [(epm, args.level_duration) for epm in levels]

        for events_per_min, duration_s in plan:
            n_target = int(events_per_min * duration_s / 60)
            # ~2.6 event/request theo mô hình session → quy đổi rate request/s
            req_rate = max(events_per_min / 60 / 2.6, 0.5)
            metrics = Metrics()
            limiter = RateLimiter(req_rate)
            sender = Sender(http, COLLECT_URL, mid, secret, metrics, limiter)
            label = f"{int(events_per_min)} ev/min × {int(duration_s)}s"
            print(f"\n>>> Bậc: {label} (~{n_target} event, ~{req_rate:.1f} req/s)")
            t0 = time.monotonic()
            ok = await run_batch(sender, n_target, args.max_back_hours, stats,
                                 args.error_threshold)
            rows.append(metrics.row(label, time.monotonic() - t0))
            if not ok:
                print(f"[ABORT] tỉ lệ lỗi {metrics.error_rate()*100:.1f}% vượt ngưỡng "
                      f"{args.error_threshold*100:.0f}% — dừng toàn bộ load test.")
                break
            print(f"    xong: err={metrics.error_rate()*100:.2f}%, "
                  f"p95={metrics.pct(95):.0f}ms, retries={metrics.retries}")

    print_report(rows, stats, report_path=args.report)
    return 0


def print_report(rows: list[dict], stats: GenStats, report_path: str | None = None):
    cols = ["level", "requests", "events", "rps", "p50_ms", "p95_ms",
            "err_4xx", "err_429", "error_rate", "statuses"]
    header = "| " + " | ".join(cols) + " |"
    sep = "|" + "|".join("---" for _ in cols) + "|"
    lines = [header, sep]
    for r in rows:
        lines.append("| " + " | ".join(str(r[c]) for c in cols) + " |")

    passed = [r for r in rows if r["error_rate"] <= 5.0]
    verdict = (f"Ngưỡng chịu tải: bậc cao nhất đạt (error ≤5%) là **{passed[-1]['level']}** "
               f"(p95 {passed[-1]['p95_ms']}ms)." if passed
               else "Không bậc nào đạt error ≤5% — kiểm tra lại mạng/quota.")
    if len(passed) < len(rows):
        verdict += f" Bậc **{rows[len(passed)]['level']}** vượt ngưỡng lỗi → coi là giới hạn trên."

    report = "\n".join([
        "## Báo cáo GA4 load test (Measurement Protocol)", "",
        *lines, "",
        f"- Session sinh ra: {stats.sessions}, event: {stats.events}, "
        f"event bị drop vì lùi quá 72h: {stats.dropped_too_old}",
        f"- {verdict}",
        "- Lưu ý: /mp/collect trả 204 kể cả payload sai — độ hợp lệ đã được chốt ở bước dry-run.",
    ])
    print("\n" + report)
    if report_path:
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(report + "\n")
        print(f"\nĐã ghi báo cáo: {report_path}")


# ---------------------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--step", required=True, choices=["dry-run", "smoke", "load"])
    ap.add_argument("--confirm", metavar="G-XXXX",
                    help="Xác nhận không tương tác: phải khớp GA_MEASUREMENT_ID trong env")
    ap.add_argument("--levels", default="100,1000,10000",
                    help="Các bậc tải, event/phút, phân tách bằng dấu phẩy (mặc định 100,1000,10000)")
    ap.add_argument("--level-duration", type=float, default=60,
                    help="Số giây chạy mỗi bậc (mặc định 60)")
    ap.add_argument("--rate", type=float, default=None,
                    help="Chạy 1 bậc cố định: event/giây (bỏ qua --levels)")
    ap.add_argument("--duration", type=float, default=60,
                    help="Số giây chạy khi dùng --rate (mặc định 60)")
    ap.add_argument("--max-back-hours", type=float, default=48,
                    help="Timestamp lùi tối đa (mặc định 48, cứng <72)")
    ap.add_argument("--error-threshold", type=float, default=0.05,
                    help="Ngưỡng dừng theo tỉ lệ lỗi (mặc định 0.05 = 5%%)")
    ap.add_argument("--report", default=None, help="Ghi báo cáo markdown ra file này")
    ap.add_argument("--seed", type=int, default=None, help="Seed random để tái lập")
    args = ap.parse_args()

    if args.max_back_hours >= MAX_BACKDATE_HOURS:
        sys.exit(f"--max-back-hours phải < {MAX_BACKDATE_HOURS}.")
    if args.seed is not None:
        random.seed(args.seed)

    mid, secret = load_credentials()
    confirm_target(mid, args.step, args.confirm)

    step = {"dry-run": step_dry_run, "smoke": step_smoke, "load": step_load}[args.step]
    return asyncio.run(step(mid, secret, args))


if __name__ == "__main__":
    sys.exit(main())
