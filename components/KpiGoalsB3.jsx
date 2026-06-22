"use client";

import React from "react";
import KpiCategoryCard from "./KpiCategoryCard";
import KpiTile from "./KpiTile";
import KpiDrillInline from "./KpiDrillInline";
import {
  KPIS, CATEGORIES, DATE_RANGE, statusOf,
} from "./mocks/kpiGoals";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

// b3 — Tiles + expand-in-place. Rings (L0) → Needs-Attention sparkline cards →
// all KPIs as tiles. Selecting any tile opens its drill in a detail card right
// below the grid, navigated by breadcrumbs (KPI ▸ Agent ▸ Week). Approach #3.
export default function KpiGoalsB3() {
  const [sel, setSel] = React.useState(null);
  const attention = KPIS.filter((k) => statusOf(k).rag !== "green");
  const drillKpi = sel ? { ...KPI_CONFIGS[DEFAULT_KPI_ID], name: sel.name, subtitle: sel.tip } : null;

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <div>
          <h2 style={s.title}>KPI’s and Goals</h2>
          <p style={s.subtitle}>Overall health, then what needs attention. Open any KPI in place.</p>
        </div>
        <span style={s.dateBadge}>{DATE_RANGE}</span>
      </header>

      {/* Category cards */}
      <div style={s.cats}>
        {CATEGORIES.map((c) => (
          <KpiCategoryCard key={c.id} cat={c} onClick={() => onOpenKpi?.({ category: c.name })} />
        ))}
      </div>

      {/* Needs attention */}
      {!sel && (
        <section style={s.section}>
          <span style={s.sectionTitle}>Needs attention</span>
          <div style={s.grid3}>
            {attention.map((k) => <KpiTile key={k.id} k={k} onClick={() => setSel(k)} />)}
          </div>
        </section>
      )}

      {/* All KPIs as tiles */}
      <section style={s.section}>
        <span style={s.sectionTitle}>{sel ? "All KPIs" : "All KPIs"}</span>
        <div style={s.grid3}>
          {KPIS.map((k) => (
            <KpiTile key={k.id} k={k} compact selected={sel?.id === k.id} onClick={() => setSel(sel?.id === k.id ? null : k)} />
          ))}
        </div>
      </section>

      {/* Detail card below the grid (credit-usage pattern) */}
      {sel && (
        <section style={s.detail}>
          <KpiDrillInline kpi={drillKpi} onClose={() => setSel(null)} />
        </section>
      )}
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
  section: { display: "flex", flexDirection: "column", gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: 800, color: "var(--color-text-deep)", textTransform: "uppercase", letterSpacing: "0.04em" },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 },
  detail: { border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: "20px 22px", background: "#fff", boxShadow: "var(--shadow-card)" },
};
