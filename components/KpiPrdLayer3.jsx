"use client";

import React from "react";
import { EFFICIENCY_INTERACTIONS } from "./mocks/kpiSidecar";
import { InteractionCard } from "./ds";

const POPPINS = "var(--font-sans)";

// Layer 3 — interaction detail. Summary line + outcome filter + a list of DS
// InteractionCard rows. Header/back owned by KpiDrillInline.
export default function KpiSidecarLayer3({ kpi, week }) {
  const all = (kpi.interactions || EFFICIENCY_INTERACTIONS)[week] || [];
  const outcomes = ["all", ...kpi.outcomes.map((o) => o.label)];
  const [filter, setFilter] = React.useState("all");
  const rows = filter === "all" ? all : all.filter((i) => i.outcome === filter);

  return (
    <div style={s.wrap}>
      <div style={s.summary}>
        <span style={s.sumLabel}>{kpi.name}</span>
        <span style={s.sumStat}><strong>{all.length}</strong> interactions · {week}</span>
      </div>

      <div style={s.filterRow}>
        <span style={s.filterLabel}>Interactions</span>
        <select style={s.select} value={filter} onChange={(e) => setFilter(e.target.value)}>
          {outcomes.map((o) => <option key={o} value={o}>{o === "all" ? "All outcomes" : o}</option>)}
        </select>
      </div>

      <div style={s.list}>
        {rows.map((it) => <InteractionCard key={it.id} item={it} />)}
        {!rows.length && <p style={s.none}>No interactions match this outcome.</p>}
      </div>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 16, fontFamily: POPPINS },
  summary: { background: "#FCFBFF", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 2 },
  sumLabel: { fontSize: 12, color: "#5B5E6F", letterSpacing: "0.4px" },
  sumStat: { fontSize: 16, fontWeight: 600, color: "#2C2F42" },
  filterRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderTop: "1px solid #EFEFFF", paddingTop: 16 },
  filterLabel: { fontSize: 14, fontWeight: 500, color: "#5B5E6F", letterSpacing: "0.1px" },
  select: { fontSize: 12, fontFamily: POPPINS, color: "#2C2F42", padding: "6px 10px", borderRadius: 8, border: "1px solid #EFEFFF", background: "#FCFBFF", cursor: "pointer" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  none: { padding: "24px 0", fontSize: 13, color: "#8C90A6", textAlign: "center" },
};
