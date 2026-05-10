"use client";

import Card from "./Card";
import { StackedPercentBarChart, DistributionRow } from "./StackedPercentBarChart";

const CHURN_MONTHS = [
  { label: "May 2025", churned: 0, high: 0, moderate: 0, low: 0 },
  { label: "Jun",  churned: 0, high: 0, moderate: 0, low: 0 },
  { label: "Jul",  churned: 0, high: 0, moderate: 0, low: 0 },
  { label: "Aug",  churned: 0, high: 0, moderate: 0, low: 0 },
  { label: "Sep",  churned: 0, high: 0, moderate: 0, low: 0 },
  { label: "Oct",  churned: 1, high: 0, moderate: 0, low: 0 },
  { label: "Nov",  churned: 1, high: 1, moderate: 0, low: 0 },
  { label: "Dec",  churned: 3, high: 4, moderate: 2, low: 1 },
  { label: "Jan 2026", churned: 12, high: 18, moderate: 8, low: 6 },
  { label: "Feb",  churned: 18, high: 22, moderate: 10, low: 14 },
  { label: "Mar",  churned: 15, high: 20, moderate: 12, low: 16 },
  { label: "Apr",  churned: 8, high: 10, moderate: 5, low: 4 },
  { label: "May 2026", churned: 1, high: 1, moderate: 0, low: 1 },
];

const CHURN_COLORS = {
  churned:  "#FF6B6B",
  high:     "#F472B6",
  moderate: "#FBBF24",
  low:      "#A78BFA",
};

const CHURN_LEGEND = [
  { key: "churned",  label: "Churned",  color: "#FF6B6B" },
  { key: "high",     label: "High",     color: "#F472B6" },
  { key: "moderate", label: "Moderate", color: "#FBBF24" },
  { key: "low",      label: "Low",      color: "#A78BFA" },
];

const CHURN_DIST = [
  { emoji: "‼️",  label: "Churned",   count: 747,  pct: "11%" },
  { emoji: "⚠️",  label: "High",      count: 2043, pct: "29%" },
  { emoji: "🔔",  label: "Moderate",  count: 810,  pct: "11%" },
  { emoji: "😊",  label: "Low",       count: 778,  pct: "11%" },
  { emoji: "✌️",  label: "No risk",   count: 2674, pct: "38%" },
];

export default function ChurnRiskCard() {
  return (
    <Card>
      <div style={{ fontFamily: '"Mulish", sans-serif', fontSize: 16, fontWeight: 700, color: "#1F232A", marginBottom: 2 }}>
        Churn risk trends
      </div>
      <div style={{ fontFamily: '"Mulish", sans-serif', fontSize: 13, color: "rgba(0,0,0,0.60)", marginBottom: 16 }}>
        Distribution of customer interactions by churn risk level over time
      </div>

      <div style={{ display: "flex", gap: 20, justifyContent: "flex-end", marginBottom: 8 }}>
        {CHURN_LEGEND.map((it) => (
          <div key={it.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: it.color }}></div>
            <span style={{ fontFamily: '"Mulish", sans-serif', fontSize: 12, color: "rgba(0,0,0,0.60)" }}>{it.label}</span>
          </div>
        ))}
      </div>

      <StackedPercentBarChart
        months={CHURN_MONTHS}
        colorMap={CHURN_COLORS}
        keys={["churned", "high", "moderate", "low"]}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20, marginBottom: 4 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: "rgba(0,0,0,0.60)" }}>monitor</span>
        <span style={{ fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 600, color: "#1F232A" }}>
          Interaction distribution by churn risk status
        </span>
      </div>
      <DistributionRow items={CHURN_DIST} />
    </Card>
  );
}
