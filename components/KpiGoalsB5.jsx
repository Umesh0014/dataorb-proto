"use client";

import React from "react";
import KpiCategoryCard from "./KpiCategoryCard";
import KpiTile from "./KpiTile";
import KpiDrillInline from "./KpiDrillInline";
import { KPIS, CATEGORIES, DATE_RANGE } from "./mocks/kpiGoals";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

// b5 — parents across the top (Reach/Recovery/Quality), each category's child
// KPI cards stacked vertically beneath it in aligned columns. Selecting a
// child opens its sidecar (L1→L2→L3) docked to the right of the cards.
export default function KpiGoalsB5() {
  const [sel, setSel] = React.useState(null);
  const drillKpi = sel ? { ...KPI_CONFIGS[DEFAULT_KPI_ID], name: sel.name, subtitle: sel.tip } : null;

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <div>
          <h2 style={s.title}>KPI’s and Goals</h2>
          <p style={s.subtitle}>Each goal area and its KPIs; open one to see its detail beside.</p>
        </div>
        <span style={s.dateBadge}>{DATE_RANGE}</span>
      </header>

      <div style={s.body}>
        <div style={s.cols}>
          {/* parents row */}
          <div style={s.parents}>
            {CATEGORIES.map((c) => <KpiCategoryCard key={c.id} cat={c} />)}
          </div>
          {/* children columns, aligned under each parent */}
          <div style={s.children}>
            {CATEGORIES.map((c) => (
              <div key={c.id} style={s.col}>
                {KPIS.filter((k) => k.category === c.name).map((k) => (
                  <KpiTile key={k.id} k={k} selected={sel?.id === k.id} onClick={() => setSel(sel?.id === k.id ? null : k)} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {sel && (
          <aside style={s.sidecar}>
            <KpiDrillInline kpi={drillKpi} onClose={() => setSel(null)} />
          </aside>
        )}
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
  body: { display: "flex", gap: 18, alignItems: "flex-start" },
  cols: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 },
  parents: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },
  children: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14, alignItems: "start" },
  col: { minWidth: 0, display: "flex", flexDirection: "column", gap: 14 },
  sidecar: { width: 400, flexShrink: 0, minWidth: 0, border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: "20px 22px", background: "#FFFFFF", boxShadow: "var(--shadow-card)", position: "sticky", top: 16, maxHeight: "calc(100vh - 32px)", overflowY: "auto" },
};
