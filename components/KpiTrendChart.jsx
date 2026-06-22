"use client";

import React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { TREND_MONTHS } from "./mocks/miraKpiSpace";

// Trend area chart for the selected outcome KPI (KPI Space direction). Themed
// with the KPI's accent; the soft fill is a per-instance gradient of that
// accent so it stays inside the DataOrb palette.
export default function KpiTrendChart({ kpi, height = 200 }) {
  const gradientId = `kpi-grad-${React.useId().replace(/:/g, "")}`;
  const data = kpi.trend.map((v, i) => ({ month: TREND_MONTHS[i], value: v }));
  const config = { value: { label: kpi.label, color: kpi.accent } };

  return (
    <ChartContainer config={config} height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={kpi.accent} stopOpacity={0.24} />
            <stop offset="100%" stopColor={kpi.accent} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-divider-card)" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="value"
          type="monotone"
          stroke="var(--color-value)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ChartContainer>
  );
}
