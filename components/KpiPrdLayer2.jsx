"use client";

import React from "react";
import KpiSidecarTrend from "./KpiSidecarTrend";
import { rule } from "./KpiSidecarParts";
import DsGapDot from "./DsGapDot";

const POPPINS = "'Poppins', sans-serif";
const LATO = "'Lato', sans-serif";
const PILL = {
  green: { bg: "#F1FEF5", fg: "#00711D" },
  amber: { bg: "#FFFBF5", fg: "#8C620E" },
  red: { bg: "#FEF2F2", fg: "#BA1A1A" },
};

// Layer 2 — agent drill (Figma node 1887-70502). Identity card + This Agent /
// Org Avg / Gap comparison, the trend chart, and a per-week table
// (Week · Attempts · metric). Header/back owned by KpiDrillInline.
export default function KpiSidecarLayer2({ kpi, agent, onSelectWeek, markGaps = false }) {
  const r = rule(kpi);
  const orgAvg = kpi.campaignRate;
  const diff = +(agent.value - orgAvg).toFixed(1);
  const gapTone = (r.higherIsBetter ? diff >= 0 : diff <= 0) ? "green" : "red";

  // Per-week rows synthesised from the agent + the KPI trend (no backend).
  const weeks = kpi.trend.map((w, i) => {
    const value = +(w.agent + (agent.value - orgAvg) * 0.6).toFixed(0);
    const attempts = Math.round((agent.interactions / kpi.trend.length) * (0.7 + ((i * 7) % 5) * 0.12));
    const rag = value >= kpi.target ? "green" : value >= kpi.target * 0.9 ? "amber" : "red";
    return { week: w.week, attempts, value, rag };
  });

  return (
    <div style={s.wrap}>
      {/* identity card */}
      <div style={s.idCard}>
        <div style={s.idTop}>
          <span style={s.avatar} aria-hidden="true">{agent.initials}</span>
          <span style={s.name}>{agent.name}</span>
        </div>
        <div style={s.idMeta}>
          <span style={s.metaLabel}>{kpi.name}</span>
          <span style={s.metaVal}><strong>{agent.interactions.toLocaleString()}</strong> interactions</span>
        </div>
      </div>

      {/* comparison */}
      <div style={s.compare}>
        <Stat label="This Agent" value={`${agent.value}${kpi.unit}`} />
        <Stat label="Organization Avg" value={`${orgAvg}${kpi.unit}`} />
        <Stat label="Gap" value={`${diff >= 0 ? "+" : ""}${diff}pp`} tone={gapTone} />
      </div>

      {/* trend */}
      <div style={{ ...s.chartCard, position: "relative" }}>
        {markGaps && <DsGapDot label="Trend chart — not in the 2.0 Design System; needs a DS chart component" style={{ top: 8, right: 8 }} />}
        <span style={s.sectionLabel}>Interactions</span>
        <KpiSidecarTrend data={kpi.trend} target={kpi.target} unit={kpi.unit} lowerIsBetter={!r.higherIsBetter} height={180} />
      </div>

      {/* week table */}
      <div style={s.table}>
        <div style={s.thead}>
          <span style={s.th}>Week</span>
          <span style={s.thNum}>Attempts</span>
          <span style={s.thNum}>{kpi.name}</span>
        </div>
        {weeks.map((w) => {
          const pill = PILL[w.rag];
          return (
            <button key={w.week} type="button" style={s.row} onClick={() => onSelectWeek(w.week)}>
              <span style={s.tdWeek}>{w.week}</span>
              <span style={s.tdNum}>{w.attempts}</span>
              <span style={s.tdMetric}>
                <span style={{ ...s.pill, background: pill.bg, color: pill.fg }}>{w.value}{kpi.unit}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  const color = tone === "green" ? "#00711D" : tone === "red" ? "#BA1A1A" : "#2C2F42";
  return (
    <div style={s.stat}>
      <span style={s.statLabel}>{label}</span>
      <span style={{ ...s.statValue, color }}>{value}</span>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 16, fontFamily: POPPINS },
  idCard: { background: "#FCFBFF", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8 },
  idTop: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 28, height: 28, borderRadius: 999, background: "#DDE1FF", color: "#6650A5", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: LATO, fontSize: 12 },
  name: { fontSize: 16, fontWeight: 600, color: "#2C2F42" },
  idMeta: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#5B5E6F", letterSpacing: "0.4px" },
  metaLabel: { color: "#5B5E6F" },
  metaVal: { color: "#5B5E6F" },
  compare: { display: "flex", gap: 12 },
  stat: { flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px", background: "#FCFBFF", borderRadius: 10 },
  statLabel: { fontSize: 12, fontWeight: 500, color: "#5B5E6F", letterSpacing: "0.1px" },
  statValue: { fontSize: 18, fontWeight: 700 },
  chartCard: { border: "1px solid #EFEFFF", borderRadius: 12, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 6 },
  sectionLabel: { fontSize: 14, fontWeight: 500, color: "#5B5E6F", letterSpacing: "0.1px", paddingLeft: 4 },
  table: { border: "1px solid #EFEFFF", borderRadius: 8, overflow: "hidden" },
  thead: { display: "grid", gridTemplateColumns: "1fr 100px 100px", height: 40, alignItems: "center", background: "#FCFBFF" },
  th: { padding: "0 12px", fontSize: 11, fontWeight: 600, color: "#5B5E6F", letterSpacing: "0.5px" },
  thNum: { padding: "0 12px", fontSize: 11, fontWeight: 600, color: "#5B5E6F", letterSpacing: "0.5px", textAlign: "right" },
  row: { width: "100%", display: "grid", gridTemplateColumns: "1fr 100px 100px", alignItems: "center", background: "#fff", border: "none", borderTop: "1px solid #F4F4FB", cursor: "pointer", textAlign: "left", fontFamily: POPPINS },
  tdWeek: { padding: "14px 12px", fontSize: 13, fontWeight: 600, color: "#2C2F42" },
  tdNum: { padding: "14px 12px", fontSize: 14, fontWeight: 600, color: "#2C2F42", textAlign: "right" },
  tdMetric: { padding: "14px 12px", display: "flex", justifyContent: "flex-end" },
  pill: { display: "inline-flex", alignItems: "center", height: 24, padding: "0 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, letterSpacing: "0.5px" },
};
