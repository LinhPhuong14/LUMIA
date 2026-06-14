"use client";

import { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ChartPoint } from "@/lib/dashboard-insights";

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartPoint & { plotScore?: number } }[];
}) {
  if (!active || !payload?.[0]?.payload) return null;
  const point = payload[0].payload;
  const score = point.plotScore ?? point.score;
  return (
    <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-panel)] px-3 py-2 text-xs shadow-[var(--shadow-ritual)]">
      <div className="font-semibold text-[var(--foreground)]">{point.label}</div>
      <div className="text-[var(--muted)]">
        {score != null ? `${score}/5` : "Chưa check-in"}
      </div>
    </div>
  );
}

export function MoodTrendChart({
  data,
  average,
  className,
}: {
  data: ChartPoint[];
  average: number | null;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const fillId = `mood-fill-${uid}`;
  const strokeId = `mood-stroke-${uid}`;

  const chartData = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        plotScore: point.score ?? null,
      })),
    [data],
  );

  const chartKey = useMemo(
    () => chartData.map((d) => `${d.date}:${d.plotScore ?? "·"}`).join("|"),
    [chartData],
  );

  const hasAnyScore = chartData.some((d) => d.plotScore != null);

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
          Nhịp cảm xúc 7 ngày
        </span>
        <span className="text-xs font-bold text-[var(--green-deep)]">
          {average != null ? `TB ${average.toFixed(1)}/5` : hasAnyScore ? "Đang tính…" : "Chưa có dữ liệu"}
        </span>
      </div>
      <div className="h-[100px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            key={chartKey}
            data={chartData}
            margin={{ top: 8, right: 6, left: -30, bottom: 0 }}
          >
            <defs>
              <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--green-bright)" stopOpacity={0.5} />
                <stop offset="45%" stopColor="var(--green)" stopOpacity={0.22} />
                <stop offset="100%" stopColor="var(--green-wash)" stopOpacity={0.04} />
              </linearGradient>
              <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--green-teal)" />
                <stop offset="50%" stopColor="var(--green)" />
                <stop offset="100%" stopColor="var(--green-bright)" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted)", fontSize: 10 }}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted)", fontSize: 10 }}
              width={28}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "var(--green)", strokeOpacity: 0.15, strokeWidth: 1 }}
            />
            <Area
              type="natural"
              dataKey="plotScore"
              stroke={`url(#${strokeId})`}
              strokeWidth={2.5}
              fill={`url(#${fillId})`}
              dot={(props) => {
                const { cx, cy, payload, index } = props;
                if (cx == null || cy == null || payload?.plotScore == null) return null;
                const isToday = index === chartData.length - 1;
                return (
                  <circle
                    key={`dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={isToday ? 4.5 : 3}
                    fill={isToday ? "var(--green-bright)" : "var(--green-deep)"}
                    stroke="var(--surface-card)"
                    strokeWidth={isToday ? 2 : 1}
                  />
                );
              }}
              activeDot={{
                r: 6,
                fill: "var(--green-bright)",
                stroke: "var(--surface-card)",
                strokeWidth: 2,
              }}
              connectNulls
              isAnimationActive
              animationDuration={320}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
