"use client";

import React from "react";
import KpiCategoryCard from "./KpiCategoryCard";
import KpiTile from "./KpiTile";
import KpiDrillInline from "./KpiDrillInline";
import { KPIS, CATEGORIES, DATE_RANGE } from "./mocks/kpiGoals";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

// b2 — select-and-populate (credit-usage pattern). The three category cards
// sit on top as a selectable row; picking one populates that category's KPI
// cards in the panel below. Clicking a KPI swaps the panel for its in-place
// breadcrumb drill.
export default function KpiGoalsB2() {
  const [catId, setCatId] = React.useState(CATEGORIES[0].id);
  const [drill, setDrill] = React.useState(null);
  const cat = CATEGORIES.find((c) => c.id === catId);
  const kpis = KPIS.filter((k) => k.category === cat.name);
  const drillKpi = drill ? { ...KPI_CONFIGS[DEFAULT_KPI_ID], name: drill.name, subtitle: drill.tip } : null;

  const pick = (id) => { setCatId(id); setDrill(null); };

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <div>
          <h2 style={s.title}>KPI’s and Goals</h2>
          <p style={s.subtitle}>Pick a goal area; its KPIs populate below.</p>
        </div>
        <span style={s.dateBadge}>{DATE_RANGE}</span>
      </header>

      {/* Selectable category row */}
      <div style={s.catsRow}>
        {CATEGORIES.map((c) => (
          <KpiCategoryCard key={c.id} cat={c} selected={c.id === catId} onClick={() => pick(c.id)} />
        ))}
      </div>

      {/* Detail panel — populated by the selected category */}
      <section style={s.panel}>
        {drill ? (
          <KpiDrillInline kpi={drillKpi} onClose={() => setDrill(null)} />
        ) : (
          <div style={s.grid}>
            {kpis.map((k) => <KpiTile key={k.id} k={k} onClick={() => setDrill(k)} />)}
          </div>
        )}
      </section>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 18 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 18, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  subtitle: { fontSize: 13, color: "var(--color-text-tertiary)", margin: "4px 0 0" },
  dateBadge: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", background: "var(--surface-alt)", borderRadius: 999, padding: "5px 12px" },
  catsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 },
  panel: { border: "1px solid #6650A5", borderRadius: 12, padding: "20px 22px", background: "#FFFFFF", minHeight: 240 },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 },
};
