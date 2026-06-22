"use client";

import React from "react";
import KpiCategoryCard from "./KpiCategoryCard";
import KpiTile from "./KpiTile";
import KpiDrillInline from "./KpiDrillInline";
import { KPIS, CATEGORIES, DATE_RANGE } from "./mocks/kpiGoals";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

// b5 — parents fill the width on top (never shrink). Children stack vertically
// under their parent. Selecting a child opens its sidecar BELOW the parents:
// the selected parent's children stay as a narrow column on the left, the
// sidecar fills the rest. Parents are untouched.
export default function KpiGoalsB5() {
  const [sel, setSel] = React.useState(null);
  const drillKpi = sel ? { ...KPI_CONFIGS[DEFAULT_KPI_ID], name: sel.name, subtitle: sel.tip } : null;
  const childrenOf = (catName) => KPIS.filter((k) => k.category === catName);

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <div>
          <h2 style={s.title}>KPI’s and Goals</h2>
          <p style={s.subtitle}>Each goal area and its KPIs; open one to see its detail below.</p>
        </div>
        <span style={s.dateBadge}>{DATE_RANGE}</span>
      </header>

      {/* parents — horizontal, full width, never affected */}
      <div style={s.parents}>
        {CATEGORIES.map((c) => <KpiCategoryCard key={c.id} cat={c} />)}
      </div>

      {/* children + sidecar, below the parents */}
      <div style={s.body}>
        {sel ? (
          <>
            <div style={s.colNarrow}>
              {childrenOf(sel.category).map((k) => (
                <KpiTile key={k.id} k={k} selected={sel.id === k.id} onClick={() => setSel(sel.id === k.id ? null : k)} />
              ))}
            </div>
            <aside style={s.sidecar}>
              <KpiDrillInline kpi={drillKpi} onClose={() => setSel(null)} />
            </aside>
          </>
        ) : (
          <div style={s.grid}>
            {CATEGORIES.map((c) => (
              <div key={c.id} style={s.col}>
                {childrenOf(c.name).map((k) => (
                  <KpiTile key={k.id} k={k} onClick={() => setSel(k)} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 16 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 18, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  subtitle: { fontSize: 13, color: "var(--color-text-tertiary)", margin: "4px 0 0" },
  dateBadge: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", background: "var(--surface-alt)", borderRadius: 999, padding: "5px 12px" },
  parents: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },
  body: { display: "flex", gap: 18, alignItems: "flex-start" },
  grid: { flex: 1, display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14, alignItems: "start" },
  col: { minWidth: 0, display: "flex", flexDirection: "column", gap: 14 },
  colNarrow: { width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 },
  sidecar: { flex: 1, minWidth: 0, border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: "20px 22px", background: "#FFFFFF", boxShadow: "var(--shadow-card)", position: "sticky", top: 16, maxHeight: "calc(100vh - 32px)", overflowY: "auto" },
};
