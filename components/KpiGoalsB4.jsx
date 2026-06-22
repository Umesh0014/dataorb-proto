"use client";

import React from "react";
import KpiCategoryCard from "./KpiCategoryCard";
import KpiTile from "./KpiTile";
import KpiDrillInline from "./KpiDrillInline";
import { KPIS, CATEGORIES, DATE_RANGE } from "./mocks/kpiGoals";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

// b4 — Master-detail (credit-usage buckets). Categories stack on the LEFT as
// selectable tiles; the selected category's KPI cards fill the RIGHT. Picking a
// KPI swaps the right panel for the in-place breadcrumb drill. Approach #4 + #3.
export default function KpiGoalsB4() {
  const [catId, setCatId] = React.useState(CATEGORIES[0].id);
  const [sel, setSel] = React.useState(null);
  const cat = CATEGORIES.find((c) => c.id === catId);
  const kpis = KPIS.filter((k) => k.category === cat.name);
  const drillKpi = sel ? { ...KPI_CONFIGS[DEFAULT_KPI_ID], name: sel.name, subtitle: sel.tip } : null;

  const pick = (id) => { setCatId(id); setSel(null); };

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <div>
          <h2 style={s.title}>KPI’s and Goals</h2>
          <p style={s.subtitle}>Pick a goal area on the left; its KPIs open on the right.</p>
        </div>
        <span style={s.dateBadge}>{DATE_RANGE}</span>
      </header>

      <div style={s.split}>
        {/* Left rail — categories */}
        <aside style={s.rail}>
          {CATEGORIES.map((c) => (
            <KpiCategoryCard key={c.id} cat={c} selected={c.id === catId} onClick={() => pick(c.id)} />
          ))}
        </aside>

        {/* Right panel — KPIs or drill */}
        <div style={s.panel}>
          {sel ? (
            <KpiDrillInline kpi={drillKpi} onClose={() => setSel(null)} />
          ) : (
            <>
              <div style={s.panelHead}>
                <span style={s.panelTitle}>{cat.name}</span>
                <span style={s.panelSub}>{cat.onTrack}/{cat.total} on track</span>
              </div>
              <div style={s.cards}>
                {kpis.map((k) => <KpiTile key={k.id} k={k} onClick={() => setSel(k)} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 18 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 18, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  subtitle: { fontSize: 13, color: "var(--color-text-tertiary)", margin: "4px 0 0" },
  dateBadge: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", background: "var(--surface-alt)", borderRadius: 999, padding: "5px 12px" },
  split: { display: "grid", gridTemplateColumns: "260px 1fr", gap: 18, alignItems: "start" },
  rail: { display: "flex", flexDirection: "column", gap: 10 },
  panel: { border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: "20px 22px", background: "#fff", minHeight: 340 },
  panelHead: { display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 },
  panelTitle: { fontSize: 15, fontWeight: 800, color: "var(--color-text-deep)" },
  panelSub: { fontSize: 12, color: "var(--color-text-tertiary)" },
  cards: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 },
};
