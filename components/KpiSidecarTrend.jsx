"use client";

import React from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

// Layer-2 trend: agent = solid brand line, org avg = dashed grey, plus a
// horizontal target ReferenceLine with an inline "Target: N" label. X-axis
// uses W[N] week labels. Target + label omit for Type E (no target).
export default function KpiSidecarTrend({ data, target, unit = "", lowerIsBetter = false, height = 220 }) {
  const config = {
    agent: { label: "This agent", color: "var(--do-brand-blue)" },
    orgAvg: { label: "Org avg", color: "#94A3B8" },
  };
  return (
    <ChartContainer config={config} height={height}>
      <LineChart data={data} margin={{ top: 12, right: 16, left: 4, bottom: lowerIsBetter ? 22 : 4 }}>
        <CartesianGrid vertical={false} stroke="var(--color-divider-card)" />
        <XAxis
          dataKey="week"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
        />
        <YAxis
          width={32}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
          label={lowerIsBetter ? {
            value: "Lower is better",
            position: "bottom",
            offset: 8,
            style: { fontSize: 11, fill: "var(--color-text-tertiary)", textAnchor: "middle" },
          } : undefined}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        {target != null && (
          <ReferenceLine
            y={target}
            stroke="var(--do-brand-blue)"
            strokeDasharray="5 4"
            strokeOpacity={0.5}
            label={{
              value: `Target: ${target}${unit}`,
              position: "insideTopRight",
              fill: "var(--do-brand-blue)",
              fontSize: 11,
              fontWeight: 600,
            }}
          />
        )}
        <Line dataKey="agent" type="monotone" stroke="var(--color-agent)" strokeWidth={2.5} dot={false} />
        <Line dataKey="orgAvg" type="monotone" stroke="var(--color-orgAvg)" strokeWidth={2} strokeDasharray="5 4" dot={false} />
      </LineChart>
    </ChartContainer>
  );
}
