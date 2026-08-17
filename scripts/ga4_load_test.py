#!/usr/bin/env python3
"""
Seed data tổng hợp cho GA4 qua Measurement Protocol — phục vụ LOAD TEST
trên property DEV/TEST. KHÔNG chạy vào property production.

An toàn bắt buộc (được enforce trong code, không chỉ là quy ước):
  • Chỉ đọc credentials từ env: GA_MEASUREMENT_ID, GA_API_SECRET.
  • Trước MỌI lần gửi (kể cả debug endpoint), in measurement_id ra màn hình
    và đòi xác nhận rõ ràng. Không xác nhận → thoát. Chạy không tương tác
    thì phải truyền --confirm <chính measurement_id đó>.
  • timestamp_micros không lùi quá 72h (GA4 từ chối event cũ hơn); event nào
    tính ra cũ hơn sẽ bị BỎ và log cảnh báo, không gửi.
  • Mọi event mang params "traffic_type": "internal" và
    "data_source": "synthetic_load_test" để lọc/xoá nhận diện về sau.
  • Không PII: client_id / user_id / transaction_id đều sinh ngẫu nhiên.

Lưu ý giao thức (đã kiểm chứng, xem thêm scripts/ga-traffic.mjs):
  • MP CHẶN tên event dành riêng: session_start, first_visit, user_engagement…
    → phiên được mở bằng event tuỳ biến "synthetic_session_start"; GA4 vẫn
    dẫn xuất session từ params session_id + engagement_time_msec.
  • Endpoint thật /mp/collect LUÔN trả 204 kể cả payload sai — nên Bước 1
    (dry-run qua /debug/mp/collect, đọc validationMessages) là bắt buộc
    trước khi tin bất kỳ con số 2xx nào ở bước load.

Quy trình 3 bước:
  python scripts/ga4_load_test.py dry-run                 # 5 event mẫu → debug endpoint
  python scripts/ga4_load_test.py smoke                   # 100 event thật, rate thấp
  python scripts/ga4_load_test.py load --stages 100,1000,10000 --duration 60

Mode bổ sung — mô phỏng "người dùng đang hoạt động" trong Realtime:
  python scripts/ga4_load_test.py active --users 50 --duration 600
  Giữ một pool N client_id cố định, mỗi user bắn event heartbeat mỗi 20-60s
  với timestamp hiện tại → Realtime giữ ổn định quanh N active users
  (Realtime đếm client_id khác nhau có event kèm session_id +
  engagement_time_msec trong cửa sổ 30 phút).

Mode bổ sung — feed "người dùng & phiên theo ngày" cho report chuẩn:
  python scripts/ga4_load_test.py backfill --events 300
  Rải event qua 3 ngày gần nhất theo nhịp ngày-đêm (giới hạn cứng của MP:
  quá 72h GA4 từ chối — không backfill lịch sử xa hơn được; muốn dày ngày
  hơn thì chạy mỗi ngày). Xem ở Reports theo dải ngày, không phải Realtime.

Mode bổ sung — số user/session CHÍNH XÁC theo từng ngày (trong cửa sổ 72h):
  python scripts/ga4_load_test.py daily --users 100 --sessions 600 --days 3
  Mỗi ngày: đúng N user, mỗi user chia đều M/N session, giờ rải theo nhịp
  ngày-đêm tính bằng múi giờ property (--tz-offset, mặc định +7).

Tuỳ chọn chung:
  --confirm G-XXXXXXX   xác nhận không tương tác (phải khớp GA_MEASUREMENT_ID)
  --offline             (chỉ dry-run) in payload mẫu, KHÔNG gửi gì lên mạng
  --rate N              (smoke/load) event mỗi phút; với load là bậc duy nhất
                        nếu không truyền --stages
  --duration S          số giây chạy mỗi bậc load (mặc định 60)

Cài trước:  pip install aiohttp
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import random
import statistics
import sys
import time
import uuid
from collections import Counter
from dataclasses import dataclass, field

MP_URL = "https://www.google-analytics.com/mp/collect"
MP_DEBUG_URL = "https://www.google-analytics.com/debug/mp/collect"

# GA4 từ chối event có timestamp lùi quá 72h; chừa biên 5 phút cho lệch giờ.
MAX_BACKDATE_MICROS = (72 * 3600 - 300) * 1_000_000

MAX_RETRIES = 5
ERROR_RATE_ABORT = 0.05  # dừng bậc load nếu tỉ lệ lỗi vượt 5%
MIN_REQUESTS_BEFORE_ABORT = 20

# ── Phân bố có trọng số (mô phỏng traffic thật, không đều tăm tắp) ──────────

PAGES = [  # route marketing công khai của site — khớp scripts/ga-traffic.mjs
    ("/", 5),
    ("/about", 2),
    ("/boxes", 3),
    ("/store", 3),
    ("/blog", 2),
    ("/quiz", 1),
]
BASE_URL = "https://lumia.com.vn"

DEVICES = [
    # (category, operating_system, os_version, language, screen_resolution), trọng số
    (("mobile", "Android", "14", "vi-vn", "412x915"), 45),
    (("mobile", "iOS", "17.5", "vi-vn", "390x844"), 30),
    (("desktop", "Windows", "11", "vi-vn", "1920x1080"), 15),
    (("desktop", "macOS", "14.5", "en-us", "1512x982"), 7),
    (("tablet", "iOS", "17.5", "vi-vn", "820x1180"), 3),
]

GEOS = [
    # (city, country_id), trọng số — GA4 MP nhận trường user_location từ 2024
    (("Ho Chi Minh City", "VN"), 45),
    (("Hanoi", "VN"), 30),
    (("Da Nang", "VN"), 10),
    (("Can Tho", "VN"), 5),
    (("Hai Phong", "VN"), 5),
    (("Singapore", "SG"), 3),
    (("Bangkok", "TH"), 2),
]

PRODUCTS = [
    ("SYN-BOX-01", "Synthetic Discovery Box", 299_000),
    ("SYN-BOX-02", "Synthetic Premium Box", 549_000),
    ("SYN-BOX-03", "Synthetic Mini Box", 149_000),
]


def _weighted(pairs):
    values, weights = zip(*pairs)
    return random.choices(values, weights=weights, k=1)[0]


# ── Sinh session / event ────────────────────────────────────────────────────

def make_identity() -> dict:
    """Danh tính một 'người dùng' tổng hợp — tái dùng được qua nhiều session
    (mode daily) để kiểm soát chính xác số user khác nhau mỗi ngày."""
    return {
        "client_id": f"{random.randint(10**8, 10**9 - 1)}.{random.randint(10**8, 10**9 - 1)}",
        "user_id": f"synthetic_{uuid.uuid4().hex[:16]}",
        "device": _weighted(DEVICES),
        "geo": _weighted(GEOS),
    }


def make_session(now_micros: int, warnings: list[str],
                 session_start_micros: int | None = None,
                 identity: dict | None = None) -> dict | None:
    """Một session = một payload MP: 1 client_id, 1-5 event cùng session_id,
    thứ tự hợp lý (mở phiên → page_view → scroll/click → optional purchase).
    session_start_micros cho phép backdate (backfill/daily); identity cho phép
    một user có nhiều session. Trả về None nếu mọi event bị loại vì quá 72h."""
    if identity is None:
        identity = make_identity()
    client_id = identity["client_id"]
    user_id = identity["user_id"]
    session_id = str(random.randint(10**9, 10**10 - 1))
    device_cat, os_name, os_ver, lang, screen = identity["device"]
    city, country = identity["geo"]
    page = _weighted(PAGES)
    page_location = BASE_URL + page

    if session_start_micros is None:
        # Trải timestamp ngẫu nhiên trong 0–30 phút gần đây cho giống thật.
        session_start_micros = now_micros - random.randint(0, 30 * 60) * 1_000_000

    def base_params(ts_offset_s: float) -> dict:
        return {
            "session_id": session_id,
            "engagement_time_msec": random.randint(800, 45_000),
            "page_location": page_location,
            "page_title": f"LUMIA {page}",
            "traffic_type": "internal",
            "data_source": "synthetic_load_test",
        }

    n_events = random.randint(1, 5)
    # session_start/first_visit là tên dành riêng, MP từ chối → dùng tên tuỳ biến.
    sequence = ["synthetic_session_start", "page_view", "scroll", "select_content", "purchase"]
    chosen = sequence[:n_events]
    if "purchase" in chosen and random.random() > 0.15:  # purchase chỉ ~15% số phiên đủ dài
        chosen.remove("purchase")

    events = []
    elapsed = 0.0
    for name in chosen:
        elapsed += random.uniform(1, 40)
        ts = session_start_micros + int(elapsed * 1_000_000)
        if now_micros - ts > MAX_BACKDATE_MICROS:
            warnings.append(
                f"[WARN] Bỏ event '{name}' (client_id={client_id}): "
                f"timestamp lùi quá 72h so với hiện tại."
            )
            continue
        params = base_params(elapsed)
        if name == "select_content":
            params["content_type"] = "cta"
            params["item_id"] = f"cta_{random.randint(1, 6)}"
        if name == "scroll":
            params["percent_scrolled"] = random.choice([25, 50, 75, 90])
        if name == "purchase":
            sku, pname, price = _weighted([(p, 1) for p in PRODUCTS])
            params.update({
                "transaction_id": f"synthetic_{uuid.uuid4().hex[:12]}",
                "currency": "VND",
                "value": price,
                "items": [{
                    "item_id": sku,
                    "item_name": pname,
                    "price": price,
                    "quantity": 1,
                }],
            })
        events.append({"name": name, "params": params, "timestamp_micros": ts})

    if not events:
        return None
    return {
        "client_id": client_id,
        "user_id": user_id,
        "timestamp_micros": events[0]["timestamp_micros"],
        "device": {
            "category": device_cat,
            "operating_system": os_name,
            "operating_system_version": os_ver,
            "language": lang,
            "screen_resolution": screen,
        },
        "user_location": {"city": city, "country_id": country},
        "events": events,
    }


# ── Gửi + retry/backoff ─────────────────────────────────────────────────────

@dataclass
class StageMetrics:
    target_rate: int                      # event/phút mục tiêu
    started_at: float = field(default_factory=time.monotonic)
    ended_at: float = 0.0
    latencies_ms: list = field(default_factory=list)
    statuses: Counter = field(default_factory=Counter)
    events_sent: int = 0
    events_dropped: int = 0
    retries: int = 0

    @property
    def requests(self) -> int:
        return sum(self.statuses.values())

    @property
    def errors(self) -> int:
        return sum(n for code, n in self.statuses.items()
                   if code == "network" or (isinstance(code, int) and code >= 400))

    @property
    def error_rate(self) -> float:
        return self.errors / self.requests if self.requests else 0.0

    def pct(self, p: float) -> float:
        if not self.latencies_ms:
            return 0.0
        return statistics.quantiles(self.latencies_ms, n=100)[int(p) - 1] \
            if len(self.latencies_ms) >= 2 else self.latencies_ms[0]


async def send_payload(session, url: str, params: dict, payload: dict,
                       metrics: StageMetrics) -> tuple[int | str, str]:
    """POST một payload với retry + exponential backoff cho 429/5xx/lỗi mạng.
    Trả (status, body). Chỉ lần cuối cùng được tính vào status distribution."""
    delay = 1.0
    for attempt in range(1, MAX_RETRIES + 1):
        t0 = time.monotonic()
        try:
            async with session.post(url, params=params, json=payload) as resp:
                body = await resp.text()
                latency = (time.monotonic() - t0) * 1000
                status: int | str = resp.status
                retry_after = resp.headers.get("Retry-After")
        except Exception:
            latency = (time.monotonic() - t0) * 1000
            status, body, retry_after = "network", "", None

        retryable = status == "network" or status == 429 or \
            (isinstance(status, int) and status >= 500)
        if not retryable or attempt == MAX_RETRIES:
            metrics.statuses[status] += 1
            metrics.latencies_ms.append(latency)
            return status, body

        metrics.retries += 1
        wait = float(retry_after) if retry_after else delay
        await asyncio.sleep(wait + random.uniform(0, 0.5))
        delay = min(delay * 2, 16)
    return "network", ""  # không tới được đây


# ── Cổng xác nhận ───────────────────────────────────────────────────────────

def read_credentials() -> tuple[str, str]:
    mid = os.environ.get("GA_MEASUREMENT_ID", "").strip()
    secret = os.environ.get("GA_API_SECRET", "").strip()
    if not mid or not secret:
        sys.exit(
            "LỖI: thiếu biến môi trường GA_MEASUREMENT_ID và/hoặc GA_API_SECRET.\n"
            "Export credentials của property DEV/TEST rồi chạy lại. Không hardcode."
        )
    return mid, secret


def confirm_or_die(measurement_id: str, confirm_flag: str | None) -> None:
    print("=" * 62)
    print(f"  SẼ GỬI EVENT TỚI MEASUREMENT ID: {measurement_id}")
    print("  Hãy chắc chắn đây là property DEV/TEST, KHÔNG phải production.")
    print("=" * 62)
    if confirm_flag is not None:
        if confirm_flag == measurement_id:
            print("Đã xác nhận qua --confirm.\n")
            return
        sys.exit(f"DỪNG: --confirm '{confirm_flag}' không khớp measurement_id. Không gửi gì.")
    if not sys.stdin.isatty():
        sys.exit(
            "DỪNG: không có terminal tương tác để xác nhận và không truyền --confirm.\n"
            f"Chạy lại với: --confirm {measurement_id}  (sau khi kiểm tra đúng property TEST)."
        )
    answer = input(f"Gõ lại chính xác measurement_id ({measurement_id}) để xác nhận: ").strip()
    if answer != measurement_id:
        sys.exit("DỪNG: xác nhận không khớp. Không gửi gì.")
    print("Đã xác nhận.\n")


# ── Các bước ────────────────────────────────────────────────────────────────

async def run_dry_run(args) -> None:
    """Bước 1: sinh 5 event mẫu, gửi qua debug endpoint, in validationMessages."""
    warnings: list[str] = []
    now = time.time_ns() // 1000
    payloads: list[dict] = []
    total_events = 0
    while total_events < 5:
        s = make_session(now, warnings)
        if s is None:
            continue
        keep = min(len(s["events"]), 5 - total_events)
        s["events"] = s["events"][:keep]
        total_events += keep
        payloads.append(s)
    for w in warnings:
        print(w)

    if args.offline:
        print("[OFFLINE] Payload mẫu (không gửi):")
        print(json.dumps(payloads, ensure_ascii=False, indent=2))
        return

    import aiohttp
    mid, secret = read_credentials()
    confirm_or_die(mid, args.confirm)
    params = {"measurement_id": mid, "api_secret": secret}
    metrics = StageMetrics(target_rate=0)
    ok = True
    async with aiohttp.ClientSession() as session:
        for i, payload in enumerate(payloads, 1):
            status, body = await send_payload(session, MP_DEBUG_URL, params, payload, metrics)
            print(f"\n— Payload {i}/{len(payloads)} "
                  f"({len(payload['events'])} event, HTTP {status}) —")
            try:
                messages = json.loads(body).get("validationMessages", [])
            except (json.JSONDecodeError, AttributeError):
                messages = [{"description": f"Không parse được response: {body[:200]}"}]
            if messages:
                ok = False
                for m in messages:
                    print(f"  ✗ {m.get('fieldPath', '')} [{m.get('validationCode', '')}]: "
                          f"{m.get('description', '')}")
            else:
                print("  ✓ validationMessages rỗng — payload hợp lệ.")
    print("\n" + ("DRY RUN PASS — có thể sang Bước 2 (smoke)." if ok else
                  "DRY RUN FAIL — sửa payload theo lỗi trên rồi chạy lại. KHÔNG sang bước 2."))
    sys.exit(0 if ok else 1)


async def run_stage(session, params: dict, target_rate: int, *,
                    max_events: int | None, duration_s: float | None,
                    label: str) -> StageMetrics:
    """Chạy một bậc tải: pace theo event/phút, dừng khi đủ event/hết giờ,
    hoặc abort khi error rate vượt ngưỡng."""
    metrics = StageMetrics(target_rate=target_rate)
    warnings: list[str] = []
    tasks: set[asyncio.Task] = set()
    deadline = time.monotonic() + duration_s if duration_s else None

    while True:
        if deadline and time.monotonic() >= deadline:
            break
        if max_events is not None and metrics.events_sent >= max_events:
            break
        if metrics.requests >= MIN_REQUESTS_BEFORE_ABORT and \
                metrics.error_rate > ERROR_RATE_ABORT:
            print(f"  !! ABORT bậc {label}: error rate "
                  f"{metrics.error_rate:.1%} > {ERROR_RATE_ABORT:.0%}")
            break

        now = time.time_ns() // 1000
        payload = make_session(now, warnings)
        if payload is None:
            metrics.events_dropped += 1
            continue
        if max_events is not None:
            room = max_events - metrics.events_sent
            payload["events"] = payload["events"][:room]
        n = len(payload["events"])
        metrics.events_sent += n

        t = asyncio.create_task(send_payload(session, MP_URL, params, payload, metrics))
        tasks.add(t)
        t.add_done_callback(tasks.discard)

        # pace: mỗi session mang n event → giãn cách 60*n/rate giây
        await asyncio.sleep(60.0 * n / target_rate)

    if tasks:
        await asyncio.gather(*tasks, return_exceptions=True)
    metrics.ended_at = time.monotonic()
    for w in warnings:
        print("  " + w)
        metrics.events_dropped += 1
    return metrics


def print_stage_row(label: str, m: StageMetrics) -> None:
    wall = (m.ended_at or time.monotonic()) - m.started_at
    rps = m.requests / wall if wall > 0 else 0
    status_str = ", ".join(f"{k}×{v}" for k, v in sorted(m.statuses.items(), key=str))
    n4xx = sum(v for k, v in m.statuses.items() if isinstance(k, int) and 400 <= k < 500)
    n429 = m.statuses.get(429, 0)
    print(f"| {label:>10} | {m.events_sent:>7} | {rps:>7.2f} | "
          f"{m.pct(50):>7.0f} | {m.pct(95):>7.0f} | {n4xx:>4} | {n429:>4} | "
          f"{m.error_rate:>6.1%} | {status_str} |")


def print_report(rows: list[tuple[str, StageMetrics]]) -> None:
    print("\nBÁO CÁO TẢI")
    print("| bậc (ev/ph) |  events |   req/s | p50(ms) | p95(ms) | 4xx |  429 |  err% | status distribution |")
    print("|-------------|---------|---------|---------|---------|-----|------|-------|---------------------|")
    for label, m in rows:
        print_stage_row(label, m)
    aborted = [l for l, m in rows if m.error_rate > ERROR_RATE_ABORT]
    print()
    if aborted:
        print(f"KẾT LUẬN: pipeline bắt đầu lỗi ở bậc {aborted[0]} ev/phút — "
              f"ngưỡng chịu tải nằm dưới bậc này.")
    elif rows:
        print(f"KẾT LUẬN: mọi bậc đều dưới ngưỡng lỗi {ERROR_RATE_ABORT:.0%}; "
              f"ngưỡng chịu tải ≥ {rows[-1][0]} ev/phút (tăng bậc tiếp nếu cần tìm trần).")
    print("\nLƯU Ý: /mp/collect trả 204 kể cả payload sai — 2xx ở đây chỉ đo "
          "pipeline nhận request. Tính đúng của data phải dựa vào dry-run "
          "(validationMessages) và đối chiếu DebugView/Realtime.")


async def run_smoke(args) -> None:
    """Bước 2: 100 event thật, throughput thấp."""
    import aiohttp
    mid, secret = read_credentials()
    confirm_or_die(mid, args.confirm)
    params = {"measurement_id": mid, "api_secret": secret}
    rate = args.rate or 60  # mặc định 60 event/phút — chậm, đủ thấy trong Realtime
    print(f"SMOKE: gửi 100 event, rate ~{rate} event/phút → {MP_URL}")
    async with aiohttp.ClientSession() as session:
        m = await run_stage(session, params, rate, max_events=100,
                            duration_s=None, label="smoke")
    print_report([("smoke", m)])
    print("Kiểm tra ngay GA4 → Admin → DebugView / Reports → Realtime: "
          "lọc theo event param data_source = synthetic_load_test.")


async def run_load(args) -> None:
    """Bước 3: tăng dần theo bậc; dừng nếu error rate vượt 5%."""
    import aiohttp
    mid, secret = read_credentials()
    confirm_or_die(mid, args.confirm)
    params = {"measurement_id": mid, "api_secret": secret}
    stages = [int(s) for s in args.stages.split(",")] if args.stages else \
        ([args.rate] if args.rate else [100, 1000, 10000])
    duration = args.duration or 60
    rows: list[tuple[str, StageMetrics]] = []
    async with aiohttp.ClientSession() as session:
        for stage_rate in stages:
            print(f"\n=== BẬC {stage_rate} event/phút, {duration}s ===")
            m = await run_stage(session, params, stage_rate, max_events=None,
                                duration_s=duration, label=str(stage_rate))
            rows.append((str(stage_rate), m))
            print_stage_row(str(stage_rate), m)
            if m.error_rate > ERROR_RATE_ABORT:
                print("Dừng leo bậc vì vượt ngưỡng lỗi.")
                break
    print_report(rows)


# Nhịp ngày-đêm: trọng số theo giờ (0-23) để backfill trông giống traffic
# thật — thấp về đêm, cao trưa và tối.
HOUR_WEIGHTS = [1, 1, 1, 1, 1, 2, 3, 4, 5, 6, 6, 7,
                8, 7, 6, 6, 6, 7, 8, 9, 8, 6, 4, 2]


def backdated_start(now_micros: int, day_offset: int, tz_offset_hours: int = 7) -> int:
    """Chọn thời điểm mở phiên trong ngày (hôm nay - day_offset), giờ lấy theo
    HOUR_WEIGHTS, kẹp trong (now-72h+10ph, now] để không rơi vào vùng GA4
    từ chối và không ở tương lai. Ranh giới 'ngày' và giờ tính theo múi giờ
    của property (mặc định UTC+7) để report theo ngày đếm đúng từng ngày."""
    hour = _weighted(list(zip(range(24), HOUR_WEIGHTS)))
    tz = tz_offset_hours * 3600 * 1_000_000
    local = now_micros + tz - day_offset * 86_400_000_000
    local -= (local // 1_000_000 % 86_400) * 1_000_000    # về 00:00 giờ địa phương
    ts = local - tz + (hour * 3600 + random.randint(0, 3599)) * 1_000_000
    floor = now_micros - MAX_BACKDATE_MICROS + 600 * 1_000_000
    return max(min(ts, now_micros), floor)


async def run_backfill(args) -> None:
    """Feed 'người dùng & phiên theo ngày': rải N event qua 3 ngày gần nhất
    (giới hạn cứng của MP — quá 72h GA4 từ chối, không backfill xa hơn được).
    Event backdate KHÔNG hiện trong Realtime; xem ở Reports với dải ngày,
    số liệu chốt sau vài giờ tới ~24h."""
    import aiohttp
    mid, secret = read_credentials()
    confirm_or_die(mid, args.confirm)
    params = {"measurement_id": mid, "api_secret": secret}
    total = args.events or 300
    # Ngày càng gần trọng số càng cao — chart theo ngày có dáng đi lên nhẹ.
    day_weights = [(2, 2), (1, 3), (0, 4)]
    print(f"BACKFILL: rải ~{total} event qua 3 ngày gần nhất → {MP_URL}")

    metrics = StageMetrics(target_rate=0)
    warnings: list[str] = []
    per_day: Counter = Counter()
    tasks: set[asyncio.Task] = set()
    async with aiohttp.ClientSession() as session:
        while metrics.events_sent < total:
            now = time.time_ns() // 1000
            day = _weighted(day_weights)
            payload = make_session(now, warnings,
                                   session_start_micros=backdated_start(now, day))
            if payload is None:
                continue
            room = total - metrics.events_sent
            payload["events"] = payload["events"][:room]
            metrics.events_sent += len(payload["events"])
            per_day[f"D-{day}"] += len(payload["events"])
            t = asyncio.create_task(send_payload(session, MP_URL, params, payload, metrics))
            tasks.add(t)
            t.add_done_callback(tasks.discard)
            if metrics.requests >= MIN_REQUESTS_BEFORE_ABORT and \
                    metrics.error_rate > ERROR_RATE_ABORT:
                print("!! ABORT: error rate vượt 5%.")
                break
            await asyncio.sleep(0.1)  # ~10 req/s là quá đủ cho backfill
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    metrics.ended_at = time.monotonic()
    for w in warnings:
        print("  " + w)
    print_report([("backfill", metrics)])
    dist = ", ".join(f"{d}: {n} event" for d, n in sorted(per_day.items(), reverse=True))
    print(f"Phân bố theo ngày (D-0 = hôm nay): {dist}")
    print("Xem tại GA4 → Reports → Engagement/Acquisition với dải ngày 3 ngày "
          "gần nhất (KHÔNG phải Realtime). Số liệu chốt sau vài giờ tới ~24h. "
          "'New users' sẽ không tăng — first_visit là tên MP cấm gửi.")


async def run_daily(args) -> None:
    """Feed chính xác N user / M session cho TỪNG ngày trong 3 ngày gần nhất
    (cửa sổ 72h của MP). Mỗi user được chia đều số session trong ngày, giờ
    rải theo nhịp ngày-đêm múi giờ property. Mặc định: 100 user / 600 session
    mỗi ngày × 3 ngày."""
    import aiohttp
    mid, secret = read_credentials()
    confirm_or_die(mid, args.confirm)
    params = {"measurement_id": mid, "api_secret": secret}
    users_per_day = args.users or 100
    sessions_per_day = args.sessions or 600
    days = min(args.days or 3, 3)  # quá 3 ngày là ra ngoài cửa sổ 72h
    tz = args.tz_offset if args.tz_offset is not None else 7
    print(f"DAILY: {days} ngày × ({users_per_day} user / {sessions_per_day} session), "
          f"múi giờ UTC{tz:+d} → {MP_URL}")

    metrics = StageMetrics(target_rate=0)
    warnings: list[str] = []
    per_day: dict[str, dict] = {}
    tasks: set[asyncio.Task] = set()
    aborted = False
    async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(limit=50)) as session:
        for day in range(days - 1, -1, -1):  # ngày xa nhất trước
            label = f"D-{day}"
            identities = [make_identity() for _ in range(users_per_day)]
            # Chia session vòng tròn: mỗi user nhận sessions_per_day/users cái.
            specs = [identities[i % users_per_day] for i in range(sessions_per_day)]
            random.shuffle(specs)
            sent_events = sent_sessions = 0
            for ident in specs:
                now = time.time_ns() // 1000
                payload = make_session(
                    now, warnings,
                    session_start_micros=backdated_start(now, day, tz),
                    identity=ident)
                if payload is None:
                    continue
                sent_sessions += 1
                sent_events += len(payload["events"])
                metrics.events_sent += len(payload["events"])
                t = asyncio.create_task(
                    send_payload(session, MP_URL, params, payload, metrics))
                tasks.add(t)
                t.add_done_callback(tasks.discard)
                if metrics.requests >= MIN_REQUESTS_BEFORE_ABORT and \
                        metrics.error_rate > ERROR_RATE_ABORT:
                    print(f"  !! ABORT tại {label}: error rate vượt 5%.")
                    aborted = True
                    break
                await asyncio.sleep(0.08)  # ~12 req/s
            per_day[label] = {"users": len(identities), "sessions": sent_sessions,
                              "events": sent_events}
            print(f"  {label}: {len(identities)} user, {sent_sessions} session, "
                  f"{sent_events} event đã đẩy đi")
            if aborted:
                break
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
    metrics.ended_at = time.monotonic()
    for w in warnings:
        print("  " + w)
    print_report([("daily", metrics)])
    print("Phân bố (D-0 = hôm nay, ngày theo múi giờ property):")
    for label, d in sorted(per_day.items(), reverse=True):
        print(f"  {label}: {d['users']} user / {d['sessions']} session / {d['events']} event")
    print("\nXem tại GA4 → Reports → dải ngày 3 ngày gần nhất (không phải "
          "Realtime); số liệu chốt sau vài giờ tới ~24h. Con số hiển thị sẽ "
          "CAO HƠN mục tiêu một chút vì cộng dồn data các đợt seed trước đó "
          "trong cùng ngày (smoke/active/backfill).")


class SyntheticUser:
    """Một 'người dùng đang hoạt động': client_id/session_id cố định, bắn
    event heartbeat với timestamp HIỆN TẠI (không backdate) để Realtime
    đếm được liên tục trong cửa sổ 30 phút."""

    def __init__(self) -> None:
        self.client_id = f"{random.randint(10**8, 10**9 - 1)}.{random.randint(10**8, 10**9 - 1)}"
        self.user_id = f"synthetic_{uuid.uuid4().hex[:16]}"
        self.session_id = str(random.randint(10**9, 10**10 - 1))
        self.device_cat, self.os_name, self.os_ver, self.lang, self.screen = _weighted(DEVICES)
        self.city, self.country = _weighted(GEOS)
        self.page = _weighted(PAGES)
        self.opened = False

    def next_payload(self) -> dict:
        if not self.opened:
            name = "synthetic_session_start"
            self.opened = True
        else:
            name = _weighted([("page_view", 4), ("scroll", 3), ("select_content", 2)])
            if name == "page_view" and random.random() < 0.5:
                self.page = _weighted(PAGES)  # user điều hướng sang trang khác
        params = {
            "session_id": self.session_id,
            "engagement_time_msec": random.randint(5_000, 55_000),
            "page_location": BASE_URL + self.page,
            "page_title": f"LUMIA {self.page}",
            "traffic_type": "internal",
            "data_source": "synthetic_load_test",
        }
        if name == "scroll":
            params["percent_scrolled"] = random.choice([25, 50, 75, 90])
        if name == "select_content":
            params["content_type"] = "cta"
            params["item_id"] = f"cta_{random.randint(1, 6)}"
        return {
            "client_id": self.client_id,
            "user_id": self.user_id,
            "timestamp_micros": time.time_ns() // 1000,
            "device": {
                "category": self.device_cat,
                "operating_system": self.os_name,
                "operating_system_version": self.os_ver,
                "language": self.lang,
                "screen_resolution": self.screen,
            },
            "user_location": {"city": self.city, "country_id": self.country},
            "events": [{"name": name,
                        "params": params,
                        "timestamp_micros": time.time_ns() // 1000}],
        }


async def run_active(args) -> None:
    """Mô phỏng N người dùng đang hoạt động đồng thời trong --duration giây.
    Mỗi user một vòng lặp riêng: event đầu ngay khi vào (lệch pha ngẫu nhiên
    0-30s cho giống thật), sau đó heartbeat mỗi 20-60s."""
    import aiohttp
    mid, secret = read_credentials()
    confirm_or_die(mid, args.confirm)
    params = {"measurement_id": mid, "api_secret": secret}
    n_users = args.users or 50
    duration = args.duration or 600
    print(f"ACTIVE: {n_users} user đồng thời trong {duration}s "
          f"(~{n_users * 60 // 40} event/phút) → {MP_URL}")
    print("Mở GA4 → Reports → Realtime và quan sát 'Active users' leo dần "
          f"rồi giữ quanh {n_users}.")

    metrics = StageMetrics(target_rate=0)
    deadline = time.monotonic() + duration

    async def user_loop(session) -> None:
        user = SyntheticUser()
        await asyncio.sleep(random.uniform(0, min(30, duration / 2)))
        while time.monotonic() < deadline:
            metrics.events_sent += 1
            await send_payload(session, MP_URL, params, user.next_payload(), metrics)
            if metrics.requests >= MIN_REQUESTS_BEFORE_ABORT and \
                    metrics.error_rate > ERROR_RATE_ABORT:
                return
            await asyncio.sleep(random.uniform(20, 60))

    async def progress() -> None:
        while time.monotonic() < deadline:
            await asyncio.sleep(30)
            remain = int(deadline - time.monotonic())
            print(f"  … {metrics.events_sent} event / {metrics.requests} req gửi, "
                  f"err {metrics.error_rate:.1%}, còn ~{max(remain, 0)}s")

    connector = aiohttp.TCPConnector(limit=100)
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [asyncio.create_task(user_loop(session)) for _ in range(n_users)]
        prog = asyncio.create_task(progress())
        await asyncio.gather(*tasks)
        prog.cancel()
    metrics.ended_at = time.monotonic()
    print_report([(f"{n_users}u", metrics)])
    if metrics.error_rate > ERROR_RATE_ABORT:
        print("!! Dừng sớm: error rate vượt 5%.")
    print(f"\nSau khi dừng, Realtime sẽ giữ các user này thêm tối đa 30 phút "
          f"(cửa sổ đếm) rồi tự về 0.")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("mode",
                        choices=["dry-run", "smoke", "load", "active", "backfill", "daily"])
    parser.add_argument("--confirm", metavar="G-XXXX",
                        help="xác nhận không tương tác; phải khớp GA_MEASUREMENT_ID")
    parser.add_argument("--offline", action="store_true",
                        help="dry-run: chỉ in payload, không gửi")
    parser.add_argument("--rate", type=int, help="event mỗi phút")
    parser.add_argument("--duration", type=int, help="giây mỗi bậc load (mặc định 60)")
    parser.add_argument("--stages", help="danh sách bậc, vd: 100,1000,10000")
    parser.add_argument("--users", type=int,
                        help="active: số user đồng thời (mặc định 50); "
                             "daily: số user mỗi ngày (mặc định 100)")
    parser.add_argument("--events", type=int,
                        help="backfill: tổng số event rải qua 3 ngày (mặc định 300)")
    parser.add_argument("--sessions", type=int,
                        help="daily: số session mỗi ngày (mặc định 600)")
    parser.add_argument("--days", type=int,
                        help="daily: số ngày, tối đa 3 (mặc định 3)")
    parser.add_argument("--tz-offset", type=int, dest="tz_offset",
                        help="daily: múi giờ property, giờ so với UTC (mặc định +7)")
    args = parser.parse_args()

    runner = {"dry-run": run_dry_run, "smoke": run_smoke, "load": run_load,
              "active": run_active, "backfill": run_backfill, "daily": run_daily}[args.mode]
    try:
        asyncio.run(runner(args))
    except KeyboardInterrupt:
        print("\nDừng theo yêu cầu (Ctrl-C).")


if __name__ == "__main__":
    main()
