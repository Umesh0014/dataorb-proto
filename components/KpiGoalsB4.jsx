"use client";

import React from "react";
import KpiCategoryCard from "./KpiCategoryCard";
import KpiDrillInline from "./KpiDrillInline";
import { RagChip } from "./KpiSidecarParts";
import { KPIS, CATEGORIES, DATE_RANGE, statusOf, valueLabel } from "./mocks/kpiGoals";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

// b4 — tree master-detail. Left column: each category card with its KPIs
// beneath it inside a card as radio-selectable rows. Right: the selected KPI's
// sidecar (L1 → L2 → L3 drill).
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
              <div style={s.kpiCard}>
                {KPIS.filter((k) => k.category === cat.name).map((k) => (
                  <KpiRadioRow key={k.id} k={k} selected={k.id === selId} onClick={() => setSelId(k.id)} />
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

// Radio-selectable KPI row: radio dot + name + value + RAG status.
function KpiRadioRow({ k, selected, onClick }) {
  const st = statusOf(k);
  return (
    <button type="button" onClick={onClick} style={{ ...rr.row, ...(selected ? rr.on : null) }} role="radio" aria-checked={selected}>
      <span style={{ ...rr.radio, ...(selected ? rr.radioOn : null) }}>
        {selected && <span style={rr.dot} />}
      </span>
      <span style={rr.name}>{k.name}</span>
      <span style={rr.right}>
        <span style={rr.value}>{valueLabel(k)}</span>
        <RagChip rag={st.rag} label={st.label} />
      </span>
    </button>
  );
}

const POPPINS = "'Poppins', sans-serif";

const rr = {
  row: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "none", background: "none", borderRadius: 8, cursor: "pointer", textAlign: "left", fontFamily: POPPINS },
  on: { background: "#F6F4FB" },
  radio: { width: 16, height: 16, borderRadius: 999, border: "2px solid #C4C9D6", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" },
  radioOn: { borderColor: "#6650A5" },
  dot: { width: 8, height: 8, borderRadius: 999, background: "#6650A5" },
  name: { flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: "#2C2F42", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  right: { display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 },
  value: { fontSize: 13, fontWeight: 700, color: "#2C2F42" },
};

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 18 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 18, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  subtitle: { fontSize: 13, color: "var(--color-text-tertiary)", margin: "4px 0 0" },
  dateBadge: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", background: "var(--surface-alt)", borderRadius: 999, padding: "5px 12px" },
  split: { display: "grid", gridTemplateColumns: "360px 1fr", gap: 18, alignItems: "start" },
  rail: { display: "flex", flexDirection: "column", gap: 18 },
  group: { display: "flex", flexDirection: "column", gap: 10 },
  kpiCard: { border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: 6, display: "flex", flexDirection: "column", gap: 2 },
  panel: { minWidth: 0, border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: "20px 22px", background: "#FFFFFF", minHeight: 360, position: "sticky", top: 16 },
};
