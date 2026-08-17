"use client";

import { useCallback, useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  ExternalLink,
  FlaskConical,
  Gauge,
  Globe,
  Loader2,
  MonitorSmartphone,
  RefreshCw,
  Search,
  Settings2,
  ShoppingBag,
  Users,
} from "lucide-react";

import {
  isRangeKey,
  OPERATIONS_RANGE_KEYS,
  percentChange,
  RANGE_KEYS,
  RANGE_LABELS,
  type RangeKey,
} from "@/lib/analytics/date-range";
import {
  formatChartDate,
  formatCompactNumber,
  formatDelta,
  formatDuration,
  formatNumber,
  formatPercent,
  formatPosition,
  shortenUrl,
  type DeltaTone,
} from "@/lib/analytics/format";
import { prepareTrend, shouldBucketByWeek } from "@/lib/analytics/trend";
import type {
  AnalyticsReport,
  BreakdownRow,
  GaPageRow,
  GaRealtime,
  GscRow,
  SourceState,
} from "@/lib/analytics/types";
import { formatCurrency } from "@/lib/utils";

// ─── Mảnh giao diện dùng lại ─────────────────────────────────────────────────

const DELTA_TONE_CLASS: Record<DeltaTone, string> = {
  up: "bg-[var(--green-wash)] text-[var(--green-deep)]",
  down: "bg-red-50 text-red-600",
  flat: "bg-[var(--surface-warm)] text-[var(--muted)]",
  none: "bg-[var(--surface-warm)] text-[var(--muted)]",
};

function KpiCard({
  label,
  value,
  change,
  lowerIsBetter = false,
  hint,
}: {
  label: string;
  value: string;
  change?: number | null;
  lowerIsBetter?: boolean;
  hint?: string;
}) {
  const delta = formatDelta(change ?? null, lowerIsBetter);

  return (
    <div className="soft-card p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {label}
        </span>
        {change !== undefined && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${DELTA_TONE_CLASS[delta.tone]}`}
            title="So với kỳ liền trước"
          >
            {delta.text}
          </span>
        )}
      </div>
      <div className="mt-3 text-2xl font-bold tabular-nums text-[var(--foreground)]">{value}</div>
      {hint ? <div className="mt-1 text-[12px] text-[var(--muted)]">{hint}</div> : null}
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon?: typeof BarChart3;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    // `min-w-0`: grid item mặc định là `min-width: auto` nên nó nở ra vừa bảng
    // bên trong thay vì để `overflow-x-auto` cuộn — làm tràn ngang cả trang.
    <section className="soft-card min-w-0 p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          {Icon ? <Icon className="h-4 w-4 text-[var(--green)]" /> : null}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * Nhãn cảnh báo số liệu do app tự sinh. Bắt buộc hiện cạnh mọi khối đang chạy
 * dữ liệu mẫu — báo cáo không gắn nhãn thì người xem sẽ tưởng là số thật.
 */
function DemoBadge() {
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-800"
      title="Số liệu mẫu do app tự sinh, không phải dữ liệu thật từ Google"
    >
      <FlaskConical className="h-3 w-3" />
      Dữ liệu mẫu
    </span>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  demo,
}: {
  icon: typeof BarChart3;
  title: string;
  demo?: boolean;
}) {
  return (
    <h2 className="flex flex-wrap items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
      <Icon className="h-4 w-4 text-[var(--green)]" />
      {title}
      {demo ? <DemoBadge /> : null}
    </h2>
  );
}

/** Hiện khi một nguồn chưa cấu hình hoặc gọi API lỗi — kèm cách khắc phục. */
function SourceNotice({
  state,
  configuredHint,
}: {
  state: SourceState<unknown>;
  configuredHint: string;
}) {
  const isError = state.status === "error";
  return (
    <div
      className={`flex items-start gap-3 rounded-[14px] px-4 py-3 text-[13px] ${
        isError ? "bg-red-50 text-red-700" : "bg-[var(--surface-warm)] text-[var(--muted)]"
      }`}
    >
      {isError ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <Settings2 className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <div className="min-w-0">
        <p className="break-words font-medium">{state.message ?? "Chưa có dữ liệu."}</p>
        <p className="mt-1 break-words opacity-80">{configuredHint}</p>
        {state.detail ? (
          // Nguyên văn lỗi của Google, thu gọn sẵn. Khi hướng dẫn đã diễn giải
          // vẫn không gỡ được thì đây là thứ duy nhất còn dùng để đối chiếu —
          // nhất là định danh property, vì trỏ nhầm property và thiếu quyền cho
          // ra y hệt một thông báo.
          <details className="mt-2">
            <summary className="cursor-pointer text-[12px] font-medium opacity-80">
              Chi tiết kỹ thuật
            </summary>
            <p className="mt-1 break-all font-mono text-[11px] leading-relaxed opacity-70">
              {state.detail}
            </p>
          </details>
        ) : null}
      </div>
    </div>
  );
}

function EmptyRows({ label }: { label: string }) {
  return <p className="py-6 text-center text-[13px] text-[var(--muted)]">{label}</p>;
}

/** Thanh ngang xếp hạng — dùng cho kênh traffic, thiết bị, quốc gia. */
function BreakdownList({ rows, unit }: { rows: BreakdownRow[]; unit: string }) {
  const max = Math.max(...rows.map((row) => row.value), 1);

  if (rows.length === 0) {
    return <EmptyRows label="Chưa có dữ liệu." />;
  }

  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="min-w-0 truncate text-[var(--foreground)]" title={row.label}>
              {row.label}
            </span>
            <span className="shrink-0 tabular-nums text-[var(--muted)]">
              {formatNumber(row.value)} {unit}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-warm)]">
            <div
              className="h-full rounded-full bg-[var(--green)]"
              style={{ width: `${Math.max((row.value / max) * 100, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Điểm của biểu đồ: key luôn là ASCII, nhãn tiếng Việt đi qua `name` của series. */
type TrendPoint = { label: string; primary: number; secondary: number };

type TrendSeries = { key: "primary" | "secondary"; label: string; color: string };

function TrendChart({
  data,
  series,
  height = 220,
  dualAxis = false,
}: {
  data: TrendPoint[];
  series: TrendSeries[];
  height?: number;
  /**
   * Bật khi hai chuỗi lệch thang đo hàng chục lần (click vs hiển thị): dùng
   * chung một trục thì chuỗi nhỏ bị ép sát đáy và không còn đọc được xu hướng.
   */
  dualAxis?: boolean;
}) {
  // Hai biểu đồ trên cùng trang sẽ đụng id gradient nếu id không kèm uid riêng —
  // trình duyệt lấy def đầu tiên khớp và một biểu đồ bị tô sai màu.
  const uid = useId().replace(/:/g, "");

  if (data.length === 0) {
    return <EmptyRows label="Chưa có dữ liệu trong kỳ này." />;
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 22, left: -6, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`fill-${uid}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted)", fontSize: 10 }}
            // interval=0: vẽ đủ mọi nhãn (7 hoặc 28 node) thay vì để recharts
            // tự bỏ bớt. Kỳ 90 ngày đã gom còn 13 điểm nên cũng vừa chỗ.
            interval={0}
            angle={data.length > 20 ? -45 : 0}
            textAnchor={data.length > 20 ? "end" : "middle"}
            height={data.length > 20 ? 46 : 24}
          />
          <YAxis
            yAxisId="primary"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--muted)", fontSize: 10 }}
            width={52}
            tickFormatter={(value: number) => formatCompactNumber(value)}
          />
          {dualAxis ? (
            <YAxis
              yAxisId="secondary"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted)", fontSize: 10 }}
              width={52}
              tickFormatter={(value: number) => formatCompactNumber(value)}
            />
          ) : null}
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--surface-card)",
              fontSize: 12,
            }}
            formatter={(value: unknown, name: unknown) => [formatNumber(Number(value)), String(name)]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: "var(--muted)" }}
          />
          {series.map((s) => (
            <Area
              key={s.key}
              yAxisId={dualAxis ? s.key : "primary"}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#fill-${uid}-${s.key})`}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function SearchRowsTable({
  rows,
  firstColumn,
  linkPrefix,
}: {
  rows: GscRow[];
  firstColumn: string;
  linkPrefix?: boolean;
}) {
  if (rows.length === 0) {
    return <EmptyRows label="Chưa có dữ liệu." />;
  }

  return (
    <div className="-mx-2 overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
            <th className="px-2 pb-2 font-medium">{firstColumn}</th>
            <th className="px-2 pb-2 text-right font-medium">Click</th>
            <th className="px-2 pb-2 text-right font-medium">Hiển thị</th>
            <th className="px-2 pb-2 text-right font-medium">CTR</th>
            <th className="px-2 pb-2 text-right font-medium">Vị trí</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-[var(--border)]">
              <td className="max-w-[280px] px-2 py-2.5">
                {linkPrefix ? (
                  <a
                    href={row.label}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-[var(--green-deep)] hover:underline"
                    title={row.label}
                  >
                    {shortenUrl(row.label)}
                  </a>
                ) : (
                  <span className="block truncate text-[var(--foreground)]" title={row.label}>
                    {row.label}
                  </span>
                )}
              </td>
              <td className="px-2 py-2.5 text-right tabular-nums">{formatNumber(row.clicks)}</td>
              <td className="px-2 py-2.5 text-right tabular-nums text-[var(--muted)]">
                {formatNumber(row.impressions)}
              </td>
              <td className="px-2 py-2.5 text-right tabular-nums text-[var(--muted)]">
                {formatPercent(row.ctr)}
              </td>
              <td className="px-2 py-2.5 text-right tabular-nums text-[var(--muted)]">
                {formatPosition(row.position)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Màn hình chính ──────────────────────────────────────────────────────────


/** `business` = số thật từ DB; `traffic` = GA4 + Search Console + Vercel. */
type ReportSection = "business" | "traffic";

/**
 * Tải báo cáo cho đúng những section mà tab đang cần. Tab Báo cáo chỉ xin
 * `business` nên không phải chờ hai vòng gọi API Google mà nó không hiển thị.
 */
// ─── Kỳ báo cáo dùng chung cho cả hai tab ────────────────────────────────────

/**
 * Range được chia sẻ giữa tab Báo cáo và tab Vận hành qua một store nhỏ (kèm
 * localStorage). Hai panel render riêng lẻ theo tab nên nếu mỗi cái giữ range
 * cục bộ, chuyển tab sẽ reset về default riêng và cùng một ô số liệu lại lệch
 * nhau. Chia sẻ range đảm bảo hai tab luôn truy xuất GA4 cùng một khoảng ngày.
 */
const RANGE_STORAGE_KEY = "lumia:admin:analytics-range";
const DEFAULT_SHARED_RANGE: RangeKey = "28d";

function loadInitialRange(): RangeKey {
  if (typeof window === "undefined") {
    return DEFAULT_SHARED_RANGE;
  }
  const stored = window.localStorage.getItem(RANGE_STORAGE_KEY);
  return isRangeKey(stored) ? stored : DEFAULT_SHARED_RANGE;
}

let sharedRange: RangeKey = loadInitialRange();
const rangeListeners = new Set<() => void>();

function setSharedRange(next: RangeKey): void {
  if (next === sharedRange) {
    return;
  }
  sharedRange = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(RANGE_STORAGE_KEY, next);
  }
  rangeListeners.forEach((listener) => listener());
}

function useSharedRange(): RangeKey {
  return useSyncExternalStore(
    (listener) => {
      rangeListeners.add(listener);
      return () => rangeListeners.delete(listener);
    },
    () => sharedRange,
    () => DEFAULT_SHARED_RANGE,
  );
}

function useAnalyticsReport(
  sections: ReportSection[],
  options: { includeToday?: boolean } = {},
) {
  const { includeToday = false } = options;
  const sectionsParam = sections.join(",");
  // Range dùng chung giữa hai tab — không phải state cục bộ của panel.
  const range = useSharedRange();
  const [reloadToken, setReloadToken] = useState(0);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // `loading` được bật ngay trong event handler (đổi kỳ / bấm làm mới) thay vì
  // trong effect — effect chỉ set state ở callback bất đồng bộ.
  const requestRange = useCallback((key: RangeKey) => {
    setLoading(true);
    setError(null);
    setSharedRange(key);
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function run() {
      try {
        const response = await fetch(
          `/api/admin/analytics?range=${range}&sections=${sectionsParam}${includeToday ? "&includeToday=1" : ""}`,
          { cache: "no-store", signal: controller.signal },
        );
        if (!response.ok) {
          const body = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error ?? `Máy chủ trả về HTTP ${response.status}`);
        }
        const data = (await response.json()) as AnalyticsReport;
        if (!controller.signal.aborted) {
          setReport(data);
          setLoading(false);
        }
      } catch (cause) {
        // Đổi kỳ liên tục sẽ abort request cũ — đó không phải lỗi để hiện ra.
        if (controller.signal.aborted) {
          return;
        }
        setReport(null);
        setError(cause instanceof Error ? cause.message : "Không tải được báo cáo.");
        setLoading(false);
      }
    }

    void run();
    return () => controller.abort();
  }, [range, reloadToken, sectionsParam, includeToday]);

  return { range, requestRange, refresh, report, loading, error };
}

/** `2026-08-16` → `16/08`. */
function formatDayMonth(iso: string): string {
  const [, month, day] = iso.split("-");
  return `${day}/${month}`;
}

function ReportToolbar({
  range,
  onSelect,
  onRefresh,
  loading,
  report,
  rangeKeys = RANGE_KEYS,
  includeToday = false,
}: {
  range: RangeKey;
  onSelect: (key: RangeKey) => void;
  onRefresh: () => void;
  loading: boolean;
  report: AnalyticsReport | null;
  rangeKeys?: readonly RangeKey[];
  /** Kỳ có kéo tới hôm nay không — quyết định nhãn "gồm hôm nay" vs "tới hôm qua". */
  includeToday?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-1 rounded-full bg-[var(--surface-warm)] p-1">
        {rangeKeys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
              range === key
                ? "bg-[var(--surface-card)] text-[var(--green-deep)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {RANGE_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 text-[12px] text-[var(--muted)]">
        {report ? (
          // Nhãn khung ngày hiện rõ để không nhầm hai tab với nhau: Báo cáo
          // dừng ở hôm qua (số đã chốt), Vận hành kéo tới hôm nay (đang cập
          // nhật). Cùng nhãn "7 ngày" nhưng khung lệch một ngày là do đây.
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden tabular-nums sm:inline">
              {formatDayMonth(report.range.startDate)} → {formatDayMonth(report.range.endDate)}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                includeToday
                  ? "bg-[var(--green-wash)] text-[var(--green-deep)]"
                  : "bg-[var(--surface-warm)]"
              }`}
              title={
                includeToday
                  ? "Kỳ tính cả hôm nay — ngày hôm nay chưa trọn nên số còn cập nhật."
                  : "Kỳ dừng ở hôm qua — GA4/Search Console chưa chốt dữ liệu hôm nay."
              }
            >
              {includeToday ? "gồm hôm nay" : "tới hôm qua"}
            </span>
          </span>
        ) : null}
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 font-medium transition hover:bg-[var(--surface-warm)] disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>
    </div>
  );
}

function ReportStatus({
  loading,
  error,
  report,
}: {
  loading: boolean;
  error: string | null;
  report: AnalyticsReport | null;
}) {
  return (
    <>
      {error ? (
        <div className="flex items-start gap-3 rounded-[14px] bg-red-50 px-4 py-3 text-[13px] text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {loading && !report ? (
        <div className="flex items-center justify-center gap-2 py-20 text-[13px] text-[var(--muted)]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải dữ liệu báo cáo…
        </div>
      ) : null}
    </>
  );
}

function ReportFooter({
  report,
  note,
  includeToday = false,
}: {
  report: AnalyticsReport;
  note?: string;
  includeToday?: boolean;
}) {
  return (
    <p className="text-center text-[11px] text-[var(--muted)]">
      {includeToday
        ? `Dữ liệu tính tới hôm nay ${report.range.endDate} (ngày chưa trọn, số còn cập nhật)`
        : `Dữ liệu tính tới hết ngày ${report.range.endDate}`}
      {note ? ` — ${note}` : ""}. Cập nhật lúc{" "}
      {new Date(report.generatedAt).toLocaleString("vi-VN")}.
    </p>
  );
}

/**
 * Bảng trang được xem nhiều nhất. Dùng ở cả tab Báo cáo lẫn tab Vận hành nên
 * tách riêng thay vì lặp lại hai lần.
 */
function TopPagesTable({ rows }: { rows: GaPageRow[] }) {
  if (rows.length === 0) {
    return <EmptyRows label="Chưa có dữ liệu." />;
  }

  return (
    <div className="-mx-2 overflow-x-auto">
      <table className="w-full min-w-[360px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
            <th className="px-2 pb-2 font-medium">Đường dẫn</th>
            <th className="px-2 pb-2 text-right font-medium">Lượt xem</th>
            <th className="px-2 pb-2 text-right font-medium">Người dùng</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((page) => (
            <tr key={page.path} className="border-t border-[var(--border)]">
              <td className="max-w-[240px] px-2 py-2.5">
                <span className="block truncate text-[var(--foreground)]" title={page.path}>
                  {shortenUrl(page.path)}
                </span>
              </td>
              <td className="px-2 py-2.5 text-right tabular-nums">{formatNumber(page.views)}</td>
              <td className="px-2 py-2.5 text-right tabular-nums text-[var(--muted)]">
                {formatNumber(page.users)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Người dùng đang hoạt động — cửa sổ 30 phút của GA4 Realtime.
 *
 * Chưa cấu hình (và demo tắt) thì ẩn hẳn: khối GA ngay dưới đã hiện hướng dẫn
 * cấu hình, lặp lại lần nữa chỉ tổ chiếm chỗ. Số chỉ đổi khi bấm "Làm mới" —
 * đây là ảnh chụp cùng nhịp với cả báo cáo, không tự chạy nền.
 */
function RealtimeCard({
  state,
  demoLabel,
}: {
  state?: SourceState<GaRealtime>;
  demoLabel: boolean;
}) {
  if (!state || state.status === "not_configured") {
    return null;
  }

  return (
    <SectionCard
      title="Đang hoạt động"
      icon={Activity}
      action={demoLabel && state.demo ? <DemoBadge /> : undefined}
    >
      {state.status !== "ok" || !state.data ? (
        <p className="text-[13px] text-[var(--muted)]">
          Không đọc được số realtime{state.message ? ` — ${state.message}` : "."}
        </p>
      ) : (
        <div className="flex flex-wrap items-end gap-6">
          <div className="shrink-0">
            <div className="text-3xl font-bold tabular-nums text-[var(--foreground)]">
              {formatNumber(state.data.activeUsers)}
            </div>
            <div className="mt-1 text-[12px] text-[var(--muted)]">
              người dùng trong 30 phút gần nhất
            </div>
          </div>
          <div className="h-[72px] min-w-[240px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={state.data.byMinute.map((point) => ({
                  label: point.minutesAgo === 0 ? "bây giờ" : `${point.minutesAgo}p`,
                  users: point.users,
                }))}
                margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 10 }}
                  ticks={["29p", "15p", "bây giờ"]}
                />
                <Tooltip
                  cursor={{ fill: "var(--surface-warm)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--surface-card)",
                    fontSize: 12,
                  }}
                  formatter={(value: unknown) => [formatNumber(Number(value)), "người dùng"]}
                  labelFormatter={(label: unknown) =>
                    label === "bây giờ"
                      ? "Phút hiện tại"
                      : `${String(label).replace(/p$/, "")} phút trước`
                  }
                />
                <Bar
                  dataKey="users"
                  fill="var(--green)"
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

/**
 * Dựng điểm cho biểu đồ: kỳ ngắn vẽ từng ngày, kỳ 90 ngày gom theo tuần.
 * Nhãn series kèm hậu tố khi đã gom, để không ai đọc nhầm trung bình thành tổng.
 */
function buildTrendPoints(
  rows: { date: string; primary: number; secondary: number }[],
  range: RangeKey,
): TrendPoint[] {
  return prepareTrend(rows, range).map((bucket) => ({
    label: formatChartDate(bucket.date),
    primary: bucket.primary,
    secondary: bucket.secondary,
  }));
}

function seriesLabel(label: string, range: RangeKey): string {
  return shouldBucketByWeek(range) ? `${label} (TB/ngày)` : label;
}

// ─── Tab "Báo cáo" — kinh doanh + tổng quan truy cập ─────────────────────────

export function AnalyticsReportPanel() {
  const { range, requestRange, refresh, report, loading, error } = useAnalyticsReport(
    ["business", "traffic"],
    { includeToday: true },
  );
  const business = report?.business;
  const ga = report?.google;
  const gsc = report?.searchConsole;
  const showDemoLabel = Boolean(report?.showDemoLabel);

  const businessTrend = useMemo<TrendPoint[]>(
    () =>
      buildTrendPoints(
        (business?.data?.trend ?? []).map((point) => ({
          date: point.date,
          primary: point.revenue,
          secondary: point.orders,
        })),
        range,
      ),
    [business, range],
  );

  const trafficTrend = useMemo<TrendPoint[]>(
    () =>
      buildTrendPoints(
        (ga?.data?.trend ?? []).map((point) => ({
          date: point.date,
          primary: point.users,
          secondary: point.sessions,
        })),
        range,
      ),
    [ga, range],
  );

  return (
    <div className="space-y-6">
      <ReportToolbar
        range={range}
        onSelect={requestRange}
        onRefresh={refresh}
        loading={loading}
        report={report}
        rangeKeys={OPERATIONS_RANGE_KEYS}
        includeToday
      />
      <ReportStatus loading={loading} error={error} report={report} />

      {report ? (
        <>
          <div className="space-y-4">
            <SectionHeading icon={ShoppingBag} title="Kinh doanh" />

            {business?.status !== "ok" || !business.data ? (
              <SourceNotice
                state={business ?? { status: "error", data: null }}
                configuredHint="Số liệu đơn hàng đọc trực tiếp từ Supabase, cần SUPABASE_SECRET_KEY."
              />
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard
                    label="Doanh thu"
                    value={formatCurrency(business.data.revenue)}
                    change={percentChange(business.data.revenue, business.data.previousRevenue)}
                  />
                  <KpiCard
                    label="Đơn hàng"
                    value={formatNumber(business.data.orders)}
                    change={percentChange(business.data.orders, business.data.previousOrders)}
                  />
                  <KpiCard
                    label="Giá trị đơn TB"
                    value={formatCurrency(business.data.averageOrderValue)}
                    change={percentChange(
                      business.data.averageOrderValue,
                      business.data.previousAverageOrderValue,
                    )}
                  />
                  <KpiCard
                    label="Tài khoản mới"
                    value={formatNumber(business.data.signups)}
                    change={percentChange(business.data.signups, business.data.previousSignups)}
                  />
                </div>

                <SectionCard title="Doanh thu & đơn hàng theo ngày" icon={ShoppingBag}>
                  <TrendChart
                    data={businessTrend}
                    dualAxis
                    series={[
                      { key: "primary", label: seriesLabel("Doanh thu (đ)", range), color: "var(--green-deep)" },
                      { key: "secondary", label: seriesLabel("Đơn hàng", range), color: "var(--green-bright)" },
                    ]}
                  />
                </SectionCard>
              </>
            )}
          </div>

          {/* ── Truy cập ─────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <SectionHeading
              icon={Users}
              title="Truy cập"
              demo={showDemoLabel && (ga?.demo || gsc?.demo)}
            />

            {ga?.status !== "ok" || !ga.data ? (
              <SourceNotice
                state={ga ?? { status: "error", data: null }}
                configuredHint="Cần GA4_PROPERTY_ID và service account của Google. Xem docs/ANALYTICS_SEO.md."
              />
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard
                    label="Người dùng"
                    value={formatNumber(ga.data.summary.users)}
                    change={percentChange(ga.data.summary.users, ga.data.previousSummary.users)}
                    hint={`${formatNumber(ga.data.summary.newUsers)} người dùng mới`}
                  />
                  <KpiCard
                    label="Lượt xem trang"
                    value={formatNumber(ga.data.summary.pageViews)}
                    change={percentChange(
                      ga.data.summary.pageViews,
                      ga.data.previousSummary.pageViews,
                    )}
                    hint={`${formatNumber(ga.data.summary.sessions)} phiên truy cập`}
                  />
                  <KpiCard
                    label="Tỉ lệ tương tác"
                    value={formatPercent(ga.data.summary.engagementRate)}
                    change={percentChange(
                      ga.data.summary.engagementRate,
                      ga.data.previousSummary.engagementRate,
                    )}
                    hint={`TB ${formatDuration(ga.data.summary.avgSessionSeconds)}/phiên`}
                  />
                  {gsc?.status === "ok" && gsc.data ? (
                    <KpiCard
                      label="Click từ Google"
                      value={formatNumber(gsc.data.summary.clicks)}
                      change={percentChange(
                        gsc.data.summary.clicks,
                        gsc.data.previousSummary.clicks,
                      )}
                      hint={`${formatNumber(gsc.data.summary.impressions)} lượt hiển thị`}
                    />
                  ) : (
                    <KpiCard
                      label="Click từ Google"
                      value="—"
                      hint="Chưa nối Search Console"
                    />
                  )}
                </div>

                <SectionCard title="Người dùng & phiên theo ngày" icon={Users}>
                  <TrendChart
                    data={trafficTrend}
                    series={[
                      { key: "primary", label: seriesLabel("Người dùng", range), color: "var(--green-deep)" },
                      { key: "secondary", label: seriesLabel("Phiên", range), color: "var(--green-bright)" },
                    ]}
                  />
                </SectionCard>

                <div className="grid gap-4 lg:grid-cols-2">
                  <SectionCard title="Trang được xem nhiều nhất" icon={Globe}>
                    <TopPagesTable rows={ga.data.topPages} />
                  </SectionCard>

                  <SectionCard title="Nguồn truy cập" icon={Gauge}>
                    <BreakdownList rows={ga.data.channels} unit="phiên" />
                  </SectionCard>
                </div>
              </>
            )}
          </div>

          <ReportFooter
            report={report}
            note="đơn hàng tính theo trạng thái đã thu tiền, GA4 chốt số theo ngày"
            includeToday
          />
        </>
      ) : null}
    </div>
  );
}

// ─── Tab "Vận hành" — GA4, Search Console, Vercel ────────────────────────────

export function OperationsReportPanel() {
  // Vận hành dùng chung kỳ báo cáo với tab Báo cáo (store chia sẻ) để cùng một
  // ô số liệu không lệch nhau giữa hai tab; mọi kỳ đều bao gồm ngày hôm nay.
  const { range, requestRange, refresh, report, loading, error } = useAnalyticsReport(
    ["traffic"],
    { includeToday: true },
  );

  const ga = report?.google;
  const gsc = report?.searchConsole;
  const vercel = report?.vercel;
  const showDemoLabel = Boolean(report?.showDemoLabel);
  const hasDemoSection = showDemoLabel && Boolean(ga?.demo || gsc?.demo);

  const gaTrend = useMemo<TrendPoint[]>(
    () =>
      buildTrendPoints(
        (ga?.data?.trend ?? []).map((point) => ({
          date: point.date,
          primary: point.users,
          secondary: point.sessions,
        })),
        range,
      ),
    [ga, range],
  );

  const gscTrend = useMemo<TrendPoint[]>(
    () =>
      buildTrendPoints(
        (gsc?.data?.trend ?? []).map((point) => ({
          date: point.date,
          primary: point.clicks,
          secondary: point.impressions,
        })),
        range,
      ),
    [gsc, range],
  );

  return (
    <div className="space-y-6">
      <ReportToolbar
        range={range}
        onSelect={requestRange}
        onRefresh={refresh}
        loading={loading}
        report={report}
        rangeKeys={OPERATIONS_RANGE_KEYS}
        includeToday
      />
      <ReportStatus loading={loading} error={error} report={report} />

      {report ? (
        <>
          {hasDemoSection ? (
            <div className="flex items-start gap-3 rounded-[14px] bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
              <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Đang bật <strong>ANALYTICS_DEMO_MODE</strong>. Các khối có nhãn{" "}
                <em>Dữ liệu mẫu</em> là số do app tự sinh để xem trước giao diện —{" "}
                <strong>không phải số thật</strong>. Nối GA4 và Search Console theo{" "}
                <code>docs/ANALYTICS_SEO.md</code> thì dữ liệu thật sẽ tự thay thế.
              </span>
            </div>
          ) : null}

          {/* ── Google Analytics ─────────────────────────────────────────── */}
          <div className="space-y-4">
            <SectionHeading
              icon={BarChart3}
              title="Google Analytics"
              demo={showDemoLabel && ga?.demo}
            />

            {/* Trạng thái nối lịch sử chỉ hiện khi HỎNG. Lúc chạy đúng thì
                biểu đồ đã tự nói hết, thêm một dòng giải thích vào giữa màn
                hình báo cáo chỉ tổ chiếm chỗ. Trường hợp hỏng thì ngược lại:
                thiếu bảng trong DB mà im lặng là ngồi đoán mãi không ra.
                Chi tiết đầy đủ vẫn nằm ở `backfill` trong /api/admin/analytics. */}
            {report.backfill?.reason === "failed" && report.backfill.note ? (
              <p className="rounded-[12px] bg-red-50 px-4 py-2.5 text-[12px] leading-relaxed text-red-700">
                <strong>Không dựng được lịch sử:</strong> {report.backfill.note}
              </p>
            ) : null}

            <RealtimeCard state={report.realtime} demoLabel={showDemoLabel} />

            {ga?.status !== "ok" || !ga.data ? (
              <SourceNotice
                state={ga ?? { status: "error", data: null }}
                configuredHint="Cần GA4_PROPERTY_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL và GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY. Xem docs/ANALYTICS_SEO.md."
              />
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  <KpiCard
                    label="Người dùng"
                    value={formatNumber(ga.data.summary.users)}
                    change={percentChange(ga.data.summary.users, ga.data.previousSummary.users)}
                    hint={`${formatNumber(ga.data.summary.newUsers)} người dùng mới`}
                  />
                  <KpiCard
                    label="Phiên truy cập"
                    value={formatNumber(ga.data.summary.sessions)}
                    change={percentChange(
                      ga.data.summary.sessions,
                      ga.data.previousSummary.sessions,
                    )}
                    hint={`TB ${formatDuration(ga.data.summary.avgSessionSeconds)}/phiên`}
                  />
                  <KpiCard
                    label="Lượt xem trang"
                    value={formatNumber(ga.data.summary.pageViews)}
                    change={percentChange(
                      ga.data.summary.pageViews,
                      ga.data.previousSummary.pageViews,
                    )}
                    hint={
                      ga.data.summary.sessions > 0
                        ? `${(ga.data.summary.pageViews / ga.data.summary.sessions).toFixed(1)}/phiên`
                        : undefined
                    }
                  />
                  <KpiCard
                    label="Số sự kiện"
                    value={formatNumber(ga.data.summary.eventCount)}
                    change={percentChange(
                      ga.data.summary.eventCount,
                      ga.data.previousSummary.eventCount,
                    )}
                    hint={
                      ga.data.summary.users > 0
                        ? `${(ga.data.summary.eventCount / ga.data.summary.users).toFixed(1)}/người`
                        : undefined
                    }
                  />
                  <KpiCard
                    label="Tỉ lệ tương tác"
                    value={formatPercent(ga.data.summary.engagementRate)}
                    change={percentChange(
                      ga.data.summary.engagementRate,
                      ga.data.previousSummary.engagementRate,
                    )}
                  />
                </div>

                <SectionCard title="Người dùng & phiên theo ngày" icon={Users}>
                  <TrendChart
                    data={gaTrend}
                    series={[
                      { key: "primary", label: seriesLabel("Người dùng", range), color: "var(--green-deep)" },
                      { key: "secondary", label: seriesLabel("Phiên", range), color: "var(--green-bright)" },
                    ]}
                  />
                </SectionCard>

                <div className="grid gap-4 lg:grid-cols-2">
                  <SectionCard title="Trang được xem nhiều nhất" icon={Globe}>
                    <TopPagesTable rows={ga.data.topPages} />
                  </SectionCard>

                  <SectionCard title="Nguồn truy cập" icon={Gauge}>
                    <BreakdownList rows={ga.data.channels} unit="phiên" />
                  </SectionCard>

                  <SectionCard title="Thiết bị" icon={MonitorSmartphone}>
                    <BreakdownList rows={ga.data.devices} unit="người" />
                  </SectionCard>

                  <SectionCard title="Quốc gia" icon={Globe}>
                    <BreakdownList rows={ga.data.countries} unit="người" />
                  </SectionCard>
                </div>
              </>
            )}
          </div>

          {/* ── Search Console ───────────────────────────────────────────── */}
          <div className="space-y-4">
            <SectionHeading
              icon={Search}
              title="Google Search Console"
              demo={showDemoLabel && gsc?.demo}
            />

            {gsc?.status !== "ok" || !gsc.data ? (
              <SourceNotice
                state={gsc ?? { status: "error", data: null }}
                configuredHint="Cần service account của Google được thêm làm user của property trong Search Console, và GSC_SITE_URL khớp chính xác property đó."
              />
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <KpiCard
                    label="Lượt click"
                    value={formatNumber(gsc.data.summary.clicks)}
                    change={percentChange(gsc.data.summary.clicks, gsc.data.previousSummary.clicks)}
                  />
                  <KpiCard
                    label="Lượt hiển thị"
                    value={formatNumber(gsc.data.summary.impressions)}
                    change={percentChange(
                      gsc.data.summary.impressions,
                      gsc.data.previousSummary.impressions,
                    )}
                  />
                  <KpiCard
                    label="CTR"
                    value={formatPercent(gsc.data.summary.ctr)}
                    change={percentChange(gsc.data.summary.ctr, gsc.data.previousSummary.ctr)}
                  />
                  <KpiCard
                    label="Vị trí trung bình"
                    value={formatPosition(gsc.data.summary.position)}
                    change={percentChange(
                      gsc.data.summary.position,
                      gsc.data.previousSummary.position,
                    )}
                    lowerIsBetter
                    hint="Số nhỏ hơn = xếp hạng cao hơn"
                  />
                </div>

                <SectionCard title="Click & hiển thị theo ngày" icon={Search}>
                  <TrendChart
                    data={gscTrend}
                    dualAxis
                    series={[
                      { key: "primary", label: seriesLabel("Click", range), color: "var(--green-deep)" },
                      { key: "secondary", label: seriesLabel("Hiển thị", range), color: "var(--green-bright)" },
                    ]}
                  />
                </SectionCard>

                <div className="grid gap-4 lg:grid-cols-2">
                  <SectionCard title="Từ khoá hàng đầu">
                    <SearchRowsTable rows={gsc.data.topQueries} firstColumn="Từ khoá" />
                  </SectionCard>
                  <SectionCard title="Trang hàng đầu">
                    <SearchRowsTable rows={gsc.data.topPages} firstColumn="Trang" linkPrefix />
                  </SectionCard>
                </div>
              </>
            )}
          </div>

          {/* ── Vercel ───────────────────────────────────────────────────── */}
          {vercel ? (
            <SectionCard
              title="Vercel Analytics"
              icon={Gauge}
              action={
                <a
                  href="https://vercel.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--green-deep)] hover:underline"
                >
                  Mở Vercel Dashboard
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              }
            >
              <p className="text-[13px] leading-relaxed text-[var(--muted)]">
                Vercel Web Analytics và Speed Insights không mở API đọc số liệu, nên báo cáo chi
                tiết chỉ xem được trên Vercel Dashboard. Phần dưới cho biết script đã được nhúng
                đúng chưa.
              </p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: "Môi trường",
                    value: vercel.onVercel ? (vercel.environment ?? "vercel") : "Ngoài Vercel",
                  },
                  {
                    label: "Script analytics",
                    value: vercel.analyticsDisabled ? "Đang tắt" : "Đang bật",
                  },
                  { label: "Domain", value: vercel.projectUrl ?? "—" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[12px] bg-[var(--surface-warm)] px-4 py-3"
                  >
                    <dt className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                      {item.label}
                    </dt>
                    <dd className="mt-1 break-all text-[13px] font-medium text-[var(--foreground)]">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </SectionCard>
          ) : null}

          <ReportFooter
            report={report}
            note="GA4 chốt số theo ngày, Search Console trễ khoảng 2-3 ngày"
            includeToday
          />
        </>
      ) : null}
    </div>
  );
}
