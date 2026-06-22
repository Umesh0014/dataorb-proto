"use client";

import React from "react";
import { ResponsiveContainer, Tooltip } from "recharts";

// Minimal shadcn-style chart primitives, themed with DataOrb tokens.
// Only what the app needs: ChartContainer (config → per-series CSS vars +
// responsive sizing), ChartTooltip (recharts Tooltip), and a themed
// ChartTooltipContent. Series colors are exposed as `--color-<key>` CSS
// variables on the container so chart children can use fill="var(--color-…)".
//
// `config` shape: { <seriesKey>: { label: string, color: string } }

const ChartContext = React.createContext(null);

function useChartConfig() {
  return React.useContext(ChartContext)?.config ?? {};
}

export function ChartContainer({ config, children, height = 120, style }) {
  const cssVars = Object.fromEntries(
    Object.entries(config)
      .filter(([, item]) => item.color)
      .map(([key, item]) => [`--color-${key}`, item.color])
  );

  return (
    <ChartContext.Provider value={{ config }}>
      <div style={{ width: "100%", height, ...cssVars, ...style }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

// Re-export recharts' Tooltip under the shadcn name so callers pass a custom
// `content` (e.g. <ChartTooltipContent />).
export const ChartTooltip = Tooltip;

export function ChartTooltipContent({ active, payload, label }) {
  const config = useChartConfig();
  if (!active || !payload?.length) return null;

  return (
    <div style={tip.box}>
      {label != null && <div style={tip.label}>{label}</div>}
      {payload.map((item) => {
        const key = item.dataKey;
        const meta = config[key] || {};
        return (
          <div key={key} style={tip.row}>
            <span
              style={{ ...tip.dot, background: meta.color || item.color }}
              aria-hidden="true"
            />
            <span style={tip.name}>{meta.label || key}</span>
            <span style={tip.value}>{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}

const tip = {
  box: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "8px 10px",
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 8,
    boxShadow: "var(--shadow-card)",
    fontFamily: "var(--font-sans)",
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    flexShrink: 0,
  },
  name: {
    flex: 1,
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  value: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
};
