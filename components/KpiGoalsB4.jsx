"use client";

import React from "react";
import KpiCategoryCard from "./KpiCategoryCard";
import KpiDrillInline from "./KpiDrillInline";
import { RagChip } from "./KpiSidecarParts";
import { KPIS, CATEGORIES, DATE_RANGE, statusOf, valueLabel } from "./mocks/kpiGoals";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

// b4 — tree master-detail. Left column: each category card (B2 style) with its
// KPIs stacked beneath it as compact selectable rows. Right: the selected
// KPI's sidecar (L1 → L2 → L3 drill). Structure mirrors the credit-usage page.
export default function KpiGoalsB4() {
  const [selId, setSelId] = React.useState(KPIS[0].id);
  const sel = KPIS.find((k) => k.id === selId) || KPIS[0];
  const drillKpi = { ...KPI_CONFIGS[DEFAULT_KPI_ID], name: sel.name, subtitle: sel.tip };

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <div>
          <h2 style={s.title}>KPI’s and Goals</h2>
          <p style={s.subtitle}>Pick a KPI on the left; its detail opens on the right.</p>
        </div>
        <span style={s.dateBadge}>{DATE_RANGE}</span>
      </header>

      <div style={s.split}>
        <aside style={s.rail}>
          {CATEGORIES.map((cat) => (
            <div key={cat.id} style={s.group}>
              <KpiCategoryCard cat={cat} />
              <div style={s.kpiList}>
                {KPIS.filter((k) => k.category === cat.name).map((k) => (
                  <KpiMiniRow key={k.id} k={k} selected={k.id === selId} onClick={() => setSelId(k.id)} />
                ))}
              </div>
            </div>
          ))}
        </aside>

        <div style={s.panel}>
          <KpiDrillInline key={selId} kpi={drillKpi} />
        </div>
      </div>
    </div>
  );
}

// Compact KPI row in the left tree: name + value + RAG status chip.
function KpiMiniRow({ k, selected, onClick }) {
  const st = statusOf(k);
  return (
    <button type="button" onClick={onClick} style={{ ...mr.row, ...(selected ? mr.on : null) }}>
      <span style={mr.name}>{k.name}</span>
      <span style={mr.right}>
        <span style={mr.value}>{valueLabel(k)}</span>
        <RagChip rag={st.rag} label={st.label} />
      </span>
    </button>
  );
}

const POPPINS = "'Poppins', sans-serif";

const mr = {
  row: { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 12px", border: "1px solid #EFEFFF", borderRadius: 8, background: "#FFFFFF", cursor: "pointer", textAlign: "left", fontFamily: POPPINS },
  on: { borderColor: "var(--do-brand-blue)", boxShadow: "0 0 0 1px var(--do-brand-blue)", background: "#FCFDFF" },
  name: { fontSize: 13, fontWeight: 600, color: "#2C2F42", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  right: { display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 },
  value: { fontSize: 13, fontWeight: 700, color: "#2C2F42" },
};

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 18 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 18, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  subtitle: { fontSize: 13, color: "var(--color-text-tertiary)", margin: "4px 0 0" },
  dateBadge: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", background: "var(--surface-alt)", borderRadius: 999, padding: "5px 12px" },
  split: { display: "grid", gridTemplateColumns: "340px 1fr", gap: 18, alignItems: "start" },
  rail: { display: "flex", flexDirection: "column", gap: 18 },
  group: { display: "flex", flexDirection: "column", gap: 8 },
  kpiList: { display: "flex", flexDirection: "column", gap: 6, paddingLeft: 4 },
  panel: { minWidth: 0, border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: "20px 22px", background: "#FFFFFF", minHeight: 360, position: "sticky", top: 16 },
};
