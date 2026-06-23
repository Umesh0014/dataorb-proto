"use client";

import React from "react";
import { X } from "lucide-react";
import KpiCategoryCard from "./KpiCategoryCard";
import KpiTile from "./KpiTile";
import KpiDrillInline from "./KpiDrillInline";
import { KPIS, CATEGORIES, DATE_RANGE, statusOf } from "./mocks/kpiGoals";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

const DRAWER = 468;

// b3 — cards + a real right-edge sidecar drawer. Category cards on top, then
// Needs-Attention and all-KPI tiles. Selecting a tile opens its drill in a
// full-height drawer flush to the right; the content shifts left to make room.
export default function KpiGoalsB3() {
  const [sel, setSel] = React.useState(null);
  const attention = KPIS.filter((k) => statusOf(k).rag !== "green");
  const cols = sel ? 2 : 3;
  const drillKpi = sel ? { ...KPI_CONFIGS[DEFAULT_KPI_ID], name: sel.name, subtitle: sel.tip } : null;

  return (
    <div style={{ ...s.wrap, paddingRight: sel ? DRAWER + 8 : 0 }}>
      <header style={s.header}>
        <div>
          <h2 style={s.title}>KPI’s and Goals</h2>
          <p style={s.subtitle}>Open any KPI — its detail opens in a side panel.</p>
        </div>
        <span style={s.dateBadge}>{DATE_RANGE}</span>
      </header>

      <div style={s.cats}>
        {CATEGORIES.map((c) => <KpiCategoryCard key={c.id} cat={c} />)}
      </div>

      {!sel && (
        <section style={s.section}>
          <span style={s.sectionTitle}>Needs attention</span>
          <div style={{ ...s.grid, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
            {attention.map((k) => <KpiTile key={k.id} k={k} onClick={() => setSel(k)} />)}
          </div>
        </section>
      )}
      <section style={s.section}>
        <span style={s.sectionTitle}>All KPIs</span>
        <div style={{ ...s.grid, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {KPIS.map((k) => (
            <KpiTile key={k.id} k={k} selected={sel?.id === k.id} onClick={() => setSel(sel?.id === k.id ? null : k)} />
          ))}
        </div>
      </section>

      {sel && (
        <aside style={s.drawer}>
          <button type="button" style={s.drawerX} onClick={() => setSel(null)} aria-label="Close">
            <X size={18} />
          </button>
          <KpiDrillInline kpi={drillKpi} onClose={() => setSel(null)} />
        </aside>
      )}
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 20, transition: "padding-right .2s ease" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 18, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  subtitle: { fontSize: 13, color: "var(--color-text-tertiary)", margin: "4px 0 0" },
  dateBadge: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", background: "var(--surface-alt)", borderRadius: 999, padding: "5px 12px" },
  cats: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },
  section: { display: "flex", flexDirection: "column", gap: 10 },
  sectionTitle: { fontSize: 13, fontWeight: 800, color: "var(--color-text-deep)", textTransform: "uppercase", letterSpacing: "0.04em" },
  grid: { display: "grid", gap: 14 },
  drawer: { position: "fixed", top: 0, right: 0, height: "100vh", width: DRAWER, background: "#FFFFFF", boxShadow: "-14px 0 36px rgba(20,24,40,0.12)", padding: "24px 24px 40px", overflowY: "auto", zIndex: 50 },
  drawerX: { position: "absolute", top: 18, right: 18, width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--surface-alt)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-medium)", zIndex: 1 },
};
