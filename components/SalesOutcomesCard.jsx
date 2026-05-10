"use client";

import Card from "./Card";
import { StackedPercentBarChart, DistributionRow } from "./StackedPercentBarChart";

const SALES_MONTHS = [
  { label: "May 2025", accepted: 0, declined: 0, noResponse: 0, postponed: 0, ineligible: 0 },
  { label: "Jun",  accepted: 0, declined: 0, noResponse: 0, postponed: 0, ineligible: 0 },
  { label: "Jul",  accepted: 0, declined: 0, noResponse: 0, postponed: 0, ineligible: 0 },
  { label: "Aug",  accepted: 0, declined: 0, noResponse: 0, postponed: 0, ineligible: 0 },
  { label: "Sep",  accepted: 0, declined: 0, noResponse: 0, postponed: 0, ineligible: 0 },
  { label: "Oct",  accepted: 0, declined: 0, noResponse: 0, postponed: 0, ineligible: 0 },
  { label: "Nov",  accepted: 0, declined: 0, noResponse: 0, postponed: 0, ineligible: 0 },
  { label: "Dec",  accepted: 2, declined: 5, noResponse: 0, postponed: 3, ineligible: 1 },
  { label: "Jan 2026",  accepted: 5, declined: 22, noResponse: 1, postponed: 8, ineligible: 1 },
  { label: "Feb",  accepted: 8, declined: 35, noResponse: 2, postponed: 12, ineligible: 1 },
  { label: "Mar",  accepted: 6, declined: 28, noResponse: 1, postponed: 10, ineligible: 1 },
  { label: "Apr",  accepted: 3, declined: 12, noResponse: 0, postponed: 5, ineligible: 0 },
  { label: "May 2026",  accepted: 0, declined: 0, noResponse: 0, postponed: 0, ineligible: 0 },
];

const SALES_COLORS = {
  accepted:   "#34D399",
  declined:   "#F472B6",
  noResponse: "#9CA3AF",
  postponed:  "#FBBF24",
  ineligible: "#A78BFA",
};

const SALES_LEGEND = [
  { key: "accepted",   label: "Accepted",    color: "#34D399" },
  { key: "declined",   label: "Declined",    color: "#F472B6" },
  { key: "noResponse", label: "No response", color: "#9CA3AF" },
  { key: "postponed",  label: "Postponed",   color: "#FBBF24" },
  { key: "ineligible", label: "Ineligible",  color: "#A78BFA" },
];

const SALES_DIST = [
  { emoji: "👍", label: "Accepted",    count: 853,  pct: "17%" },
  { emoji: "👎", label: "Declined",    count: 3184, pct: "64%" },
  { emoji: "😐", label: "No response", count: 80,   pct: "2%" },
  { emoji: "🤔", label: "Postponed",   count: 779,  pct: "16%" },
  { emoji: "🚫", label: "Ineligible",  count: 62,   pct: "1%" },
];

export default function SalesOutcomesCard() {
  return (
    <Card>
      <div style={{ fontFamily: '"Mulish", sans-serif', fontSize: 16, fontWeight: 700, color: "#1F232A", marginBottom: 2 }}>
        Sales Attempt Outcomes
      </div>
      <div style={{ fontFamily: '"Mulish", sans-serif', fontSize: 13, color: "rgba(0,0,0,0.60)", marginBottom: 16 }}>
        Trend of sales interaction results over time
      </div>

      <div style={{ display: "flex", gap: 20, justifyContent: "flex-end", marginBottom: 8 }}>
        {SALES_LEGEND.map((it) => (
          <div key={it.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: it.color }}></div>
            <span style={{ fontFamily: '"Mulish", sans-serif', fontSize: 12, color: "rgba(0,0,0,0.60)" }}>{it.label}</span>
          </div>
        ))}
      </div>

      <StackedPercentBarChart
        months={SALES_MONTHS}
        colorMap={SALES_COLORS}
        keys={["accepted", "declined", "noResponse", "postponed", "ineligible"]}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20, marginBottom: 4 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color: "rgba(0,0,0,0.60)" }}>monitor</span>
        <span style={{ fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 600, color: "#1F232A" }}>Sales outcome distribution</span>
      </div>
      <DistributionRow items={SALES_DIST} />
    </Card>
  );
}
