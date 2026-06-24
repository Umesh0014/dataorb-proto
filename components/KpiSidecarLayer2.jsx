"use client";

import React from "react";
import { Settings2 } from "lucide-react";
import KpiInteractionsList from "./KpiInteractionsList";
import { INTERACTION_GROUPS } from "./mocks/kpiSidecar";

const POPPINS = "var(--font-sans)";
const DELTA = {
  up: { bg: "#F0FDF4", fg: "#00711D", arrow: "↑" },
  down: { bg: "#FEF2F2", fg: "#BA1A1A", arrow: "↓" },
};

// Layer 2 — week detail (Figma node 2349-28544). Reached by selecting a
// Week-over-Week row in L1. A compact summary (metric rate for the week +
// delta + one action button) over the dated Interactions list.
export default function KpiSidecarLayer2({ kpi, agent: week }) {
  const rate = week?.metric ?? kpi.campaignRate;
  const count = week?.evaluated ?? kpi.metricCount ?? kpi.total;
  const change = week?.change ?? kpi.priorDelta ?? 0;
  const tone = change >= 0 ? "up" : "down";
  const dt = DELTA[tone];

  return (
    <div style={s.wrap}>
      <div style={s.summary}>
        <span style={s.kicker}>{kpi.summaryKicker || "Performance"} Rate</span>
        <span style={s.metricName}>{kpi.name}</span>
        <span style={s.metricRate}>
          {rate}{kpi.unit}
          <span style={s.metricCount}> ({count.toLocaleString()} interactions)</span>
        </span>
        <span style={s.deltaRow}>
          <span style={{ ...s.deltaPill, background: dt.bg, color: dt.fg }}>{dt.arrow} {Math.abs(change)}%</span>
          <span style={s.deltaText}>compared to prior period</span>
        </span>
        <div style={s.actions}>
          <button type="button" style={s.actionBtn}><Settings2 size={15} color="#004BEF" /> Feedback Summary</button>
        </div>
      </div>

      <span style={s.interactionsLabel}>Interactions</span>
      <KpiInteractionsList groups={INTERACTION_GROUPS} />
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 18, fontFamily: POPPINS },
  summary: { background: "#FCFBFF", borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 8 },
  kicker: { fontSize: 12, fontWeight: 500, color: "#5B5E6F", letterSpacing: "0.25px" },
  metricName: { fontSize: 18, fontWeight: 700, color: "#171B2C", letterSpacing: "0.1px" },
  metricRate: { fontSize: 18, fontWeight: 700, color: "#171B2C" },
  metricCount: { fontSize: 13, fontWeight: 400, color: "#8C90A6" },
  deltaRow: { display: "flex", alignItems: "center", gap: 10, marginTop: 2 },
  deltaPill: { display: "inline-flex", alignItems: "center", gap: 3, height: 24, padding: "0 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 },
  deltaText: { fontSize: 13, color: "#5B5E6F" },
  actions: { display: "flex", gap: 12, marginTop: 12 },
  actionBtn: { display: "inline-flex", alignItems: "center", gap: 8, height: 38, padding: "0 16px", borderRadius: 8, border: "1px solid #D7DBF5", background: "#fff", cursor: "pointer", fontFamily: POPPINS, fontSize: 13, fontWeight: 600, color: "#2C2F42" },
  interactionsLabel: { fontSize: 14, fontWeight: 600, color: "#171B2C", letterSpacing: "0.1px" },
};
