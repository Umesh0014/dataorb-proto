"use client";

import React from "react";
import KpiCategoryCard from "./KpiCategoryCard";
import KpiTile from "./KpiTile";
import KpiDrillInline from "./KpiDrillInline";
import { KPIS, CATEGORIES, DATE_RANGE, statusOf } from "./mocks/kpiGoals";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

// b3 — cards + side sidecar. Category cards on top, then Needs-Attention and
// all-KPI tiles. Selecting a tile opens its sidecar (L1→L2→L3 drill) docked on
// the RIGHT of the KPI section; the tile grids reflow to make room.
export default function KpiGoalsB3() {
  const [sel, setSel] = React.useState(null);
  const attention = KPIS.filter((k) => statusOf(k).rag !== "green");
  const cols = sel ? 2 : 3;
  const drillKpi = sel ? { ...KPI_CONFIGS[DEFAULT_KPI_ID], name: sel.name, subtitle: sel.tip } : null;

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <div>
          <h2 style={s.title}>KPI’s and Goals</h2>
          <p style={s.subtitle}>Open any KPI — its detail opens beside the cards.</p>
        </div>
        <span style={s.dateBadge}>{DATE_RANGE}</span>
      </header>

      <div style={s.cats}>
        {CATEGORIES.map((c) => <KpiCategoryCard key={c.id} cat={c} />)}
      </div>

      <div style={s.body}>
        <div style={s.main}>
          {!sel && (
            <section style={s.section}>
              <span style={s.sectionTitle}>Needs attention</span>
              <div style={{ ...s.grid, gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {attention.map((k) => <KpiTile key={k.id} k={k} onClick={() => setSel(k)} />)}
              </div>
            </section>
          )}
          <section style={s.section}>
            <span style={s.sectionTitle}>All KPIs</span>
            <div style={{ ...s.grid, gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {KPIS.map((k) => (
                <KpiTile key={k.id} k={k} selected={sel?.id === k.id} onClick={() => setSel(sel?.id === k.id ? null : k)} />
              ))}
            </div>
          </section>
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
  wrap: { display: "flex", flexDirection: "column", gap: 20 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 18, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  subtitle: { fontSize: 13, color: "var(--color-text-tertiary)", margin: "4px 0 0" },
  dateBadge: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", background: "var(--surface-alt)", borderRadius: 999, padding: "5px 12px" },
  cats: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 },
  body: { display: "flex", gap: 18, alignItems: "flex-start" },
  main: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 },
  section: { display: "flex", flexDirection: "column", gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: 800, color: "var(--color-text-deep)", textTransform: "uppercase", letterSpacing: "0.04em" },
  grid: { display: "grid", gap: 14 },
  sidecar: { width: 440, flexShrink: 0, minWidth: 0, border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: "20px 22px", background: "#FFFFFF", boxShadow: "var(--shadow-card)", position: "sticky", top: 16, maxHeight: "calc(100vh - 32px)", overflowY: "auto" },
};
