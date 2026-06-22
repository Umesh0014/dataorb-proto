"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

// Calls vs WhatsApp interactions per month for the Bento hero tile. Colors
// stay in the blue family to preserve the Interactions accent — Calls on the
// chart-blue accent, WhatsApp on chart-sky.
export const INTERACTIONS_SERIES = [
  { key: "calls", label: "Calls", color: "var(--chart-blue)" },
  { key: "whatsapp", label: "WhatsApp", color: "var(--chart-sky)" },
];

const CHART_CONFIG = {
  calls: { label: "Calls", color: "var(--chart-blue)" },
  whatsapp: { label: "WhatsApp", color: "var(--chart-sky)" },
};

export default function InteractionsBarChart({ data, height = 108 }) {
  return (
    <ChartContainer config={CHART_CONFIG} height={height}>
      <BarChart
        data={data}
        barGap={3}
        barCategoryGap="24%"
        margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} stroke="var(--color-divider-card)" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
        />
        <ChartTooltip
          cursor={{ fill: "var(--color-primary-alpha-04)" }}
          content={<ChartTooltipContent />}
        />
        <Bar dataKey="calls" fill="var(--color-calls)" radius={[3, 3, 0, 0]} />
        <Bar dataKey="whatsapp" fill="var(--color-whatsapp)" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
