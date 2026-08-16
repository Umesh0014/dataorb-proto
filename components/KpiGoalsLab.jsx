"use client";

import React from "react";
import { X } from "lucide-react";
import Card from "./Card";
import VersionBar from "./VersionBar";
import KpiCardsDense from "./KpiCardsDense";
import KpiCardsProgressive from "./KpiCardsProgressive";
import KpiGoalsB2 from "./KpiGoalsB2";
import KpiGoalsB3 from "./KpiGoalsB3";
import KpiGoalsB4 from "./KpiGoalsB4";
import KpiSidecarStandard from "./KpiSidecarStandard";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

// KPI & Goals lab. One config (kpiGoals.js) feeds every variant so labels never
// disagree. A = decision-dense. b1–b4 are the Progressive family:
//   b1 current · b2 polished · b3 tiles + breadcrumb drill · b4 master-detail.
const VARIANTS = [
  { id: "a", label: "A · Dense", iterations: [] },
  { id: "b1", label: "b1 · Progressive", iterations: [] },
  { id: "b2", label: "b2 · Polished", iterations: [] },
  { id: "b3", label: "b3 · Tiles + drill", iterations: [] },
  { id: "b4", label: "b4 · Master-detail", iterations: [] },
];

export default function KpiGoalsLab() {
  const [variant, setVariant] = React.useState("b3");
  const [openKpi, setOpenKpi] = React.useState(null); // only used by A / b1 (drawer)
  const kpi = KPI_CONFIGS[DEFAULT_KPI_ID];

  const body = {
    a: <KpiCardsDense onOpenKpi={setOpenKpi} />,
    b1: <KpiCardsProgressive onOpenKpi={setOpenKpi} />,
    b2: <KpiGoalsB2 />,
    b3: <KpiGoalsB3 />,
    b4: <KpiGoalsB4 />,
  }[variant];

  return (
    <>
      <div style={s.frame}>
        <div style={s.intro}>
          <h1 style={s.h1}>KPI &amp; Goals — iterations</h1>
          <p style={s.lede}>
            Same data, different structures. A is decision-dense; b1–b4 explore the
            Progressive direction. Switch in the bar below.
          </p>
        </div>
        <Card shadow style={s.panel}>{body}</Card>
      </div>

      {openKpi && (
        <div style={s.overlay} onClick={() => setOpenKpi(null)}>
          <div style={s.drawer} onClick={(e) => e.stopPropagation()}>
            <button type="button" style={s.close} onClick={() => setOpenKpi(null)} aria-label="Close"><X size={18} /></button>
            <KpiSidecarStandard kpi={kpi} />
          </div>
        </div>
      )}

      <VersionBar
        versions={VARIANTS}
        baselineOptions={[{ id: "kpi-goals", label: "KPI & Goals" }]}
        staticBaseline
        value={{ versionId: variant, iterationId: null }}
        onChange={({ versionId }) => { setVariant(versionId); setOpenKpi(null); }}
        help="A/b1 open the drill in a right drawer. b2–b4 keep it in-page: b2 polishes the triage list, b3 expands a tile with KPI▸Agent▸Week breadcrumbs, b4 is a category master-detail."
      />
    </>
  );
}

const s = {
  frame: { display: "flex", flexDirection: "column", gap: 20, paddingBottom: 96 },
  intro: { display: "flex", flexDirection: "column", gap: 6 },
  h1: { fontSize: 22, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  lede: { fontSize: 14, color: "var(--color-text-tertiary)", margin: 0, maxWidth: 640 },
  panel: { maxWidth: 1040 },
  overlay: { position: "fixed", inset: 0, background: "rgba(20,24,40,0.32)", zIndex: 50, display: "flex", justifyContent: "flex-end" },
  drawer: { width: 560, maxWidth: "92vw", height: "100%", background: "#fff", boxShadow: "-8px 0 24px rgba(0,0,0,0.12)", padding: "28px 28px 40px", overflowY: "auto", position: "relative" },
  close: { position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--surface-alt)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
};
