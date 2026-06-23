"use client";

import React from "react";
import { X } from "lucide-react";
import KpiCategoryCard from "./KpiCategoryCard";
import KpiTile from "./KpiTile";
import KpiDrillInline from "./KpiDrillInline";
import { KPIS, CATEGORIES, DATE_RANGE } from "./mocks/kpiGoals";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

// b6 — B2's layout (category selected → KPI cards below), but a KPI opens its
// full sidecar (L1→L2→L3 drill) in a centered dialog rather than in-page.
export default function KpiGoalsB6() {
  const [catId, setCatId] = React.useState(CATEGORIES[0].id);
  const [dialogKpi, setDialogKpi] = React.useState(null);
  const cat = CATEGORIES.find((c) => c.id === catId);
  const kpis = KPIS.filter((k) => k.category === cat.name);
  const drillKpi = dialogKpi ? { ...KPI_CONFIGS[DEFAULT_KPI_ID], name: dialogKpi.name, subtitle: dialogKpi.tip } : null;

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <div>
          <h2 style={s.title}>KPI’s and Goals</h2>
          <p style={s.subtitle}>Pick a goal area; open a KPI for its full detail.</p>
        </div>
        <span style={s.dateBadge}>{DATE_RANGE}</span>
      </header>

      <div style={s.catsRow}>
        {CATEGORIES.map((c) => (
          <KpiCategoryCard key={c.id} cat={c} selected={c.id === catId} onClick={() => setCatId(c.id)} />
        ))}
      </div>

      <section style={s.panel}>
        <div style={s.grid}>
          {kpis.map((k) => <KpiTile key={k.id} k={k} onClick={() => setDialogKpi(k)} />)}
        </div>
      </section>

      {dialogKpi && (
        <div style={s.overlay} onClick={() => setDialogKpi(null)} role="dialog" aria-modal="true">
          <div style={s.dialog} onClick={(e) => e.stopPropagation()}>
            <button type="button" style={s.closeX} onClick={() => setDialogKpi(null)} aria-label="Close">
              <X size={18} />
            </button>
            <KpiDrillInline kpi={drillKpi} onClose={() => setDialogKpi(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 18 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 18, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  subtitle: { fontSize: 13, color: "var(--color-text-tertiary)", margin: "4px 0 0" },
  dateBadge: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", background: "var(--surface-alt)", borderRadius: 999, padding: "5px 12px" },
  catsRow: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },
  panel: { border: "1px solid var(--color-divider-card)", borderRadius: 12, padding: "20px 22px", background: "#FFFFFF", minHeight: 200 },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 },
  overlay: { position: "fixed", inset: 0, background: "rgba(20,24,40,0.45)", zIndex: 60, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px", overflowY: "auto" },
  dialog: { position: "relative", width: 760, maxWidth: "100%", background: "#FFFFFF", borderRadius: 14, boxShadow: "0 24px 60px rgba(0,0,0,0.28)", padding: "24px 26px" },
  closeX: { position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--surface-alt)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-medium)", zIndex: 1 },
};
