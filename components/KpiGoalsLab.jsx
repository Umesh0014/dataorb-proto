"use client";

import React from "react";
import { X } from "lucide-react";
import Card from "./Card";
import VersionBar from "./VersionBar";
import KpiCardsDense from "./KpiCardsDense";
import KpiCardsProgressive from "./KpiCardsProgressive";
import KpiSidecarStandard from "./KpiSidecarStandard";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

// KPI & Goals — information-first lab. Two forked directions off the same
// config so the data never disagrees:
//   A — Decision-dense: every KPI card carries trend/target/gap/status.
//   B — Progressive: category rings → triage list → inline expand.
// Clicking any KPI opens the shared sidecar (L1→L2→L3) as a right drawer.
const VARIANTS = [
  { id: "a", label: "A · Decision-dense", iterations: [] },
  { id: "b", label: "B · Progressive", iterations: [] },
];

export default function KpiGoalsLab() {
  const [variant, setVariant] = React.useState("a");
  const [openKpi, setOpenKpi] = React.useState(null); // KPI object or {category}
  // Only Efficiency is wired end-to-end; any card opens it as the representative drill.
  const kpi = KPI_CONFIGS[DEFAULT_KPI_ID];

  return (
    <>
      <div style={s.frame}>
        <div style={s.intro}>
          <h1 style={s.h1}>KPI &amp; Goals — information model</h1>
          <p style={s.lede}>
            Same data, two depths. Switch A/B in the bar. Click any KPI to open the
            shared sidecar drill.
          </p>
        </div>
        <Card shadow style={s.panel}>
          {variant === "a"
            ? <KpiCardsDense onOpenKpi={setOpenKpi} />
            : <KpiCardsProgressive onOpenKpi={setOpenKpi} />}
        </Card>
      </div>

      {openKpi && (
        <div style={s.overlay} onClick={() => setOpenKpi(null)}>
          <div style={s.drawer} onClick={(e) => e.stopPropagation()}>
            <button type="button" style={s.close} onClick={() => setOpenKpi(null)} aria-label="Close">
              <X size={18} />
            </button>
            {openKpi.category && !openKpi.id ? (
              <p style={s.note}>“{openKpi.category}” category drill — wired for the Efficiency KPI below in this prototype.</p>
            ) : null}
            <KpiSidecarStandard kpi={kpi} />
          </div>
        </div>
      )}

      <VersionBar
        versions={VARIANTS}
        baselineOptions={[{ id: "kpi-goals", label: "KPI & Goals" }]}
        staticBaseline
        value={{ versionId: variant, iterationId: null }}
        onChange={({ versionId }) => setVariant(versionId)}
        help="A surfaces everything on the card (shallow by saturation). B leads with category health and reveals detail on demand (shallow by progression). Both share one config; click a KPI to open the L1→L2→L3 sidecar."
      />
    </>
  );
}

const s = {
  frame: { display: "flex", flexDirection: "column", gap: 20, paddingBottom: 96 },
  intro: { display: "flex", flexDirection: "column", gap: 6 },
  h1: { fontSize: 22, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  lede: { fontSize: 14, color: "var(--color-text-tertiary)", margin: 0, maxWidth: 640 },
  panel: { maxWidth: 1000 },
  overlay: { position: "fixed", inset: 0, background: "rgba(20,24,40,0.32)", zIndex: 50, display: "flex", justifyContent: "flex-end" },
  drawer: { width: 560, maxWidth: "92vw", height: "100%", background: "#fff", boxShadow: "-8px 0 24px rgba(0,0,0,0.12)", padding: "28px 28px 40px", overflowY: "auto", position: "relative" },
  close: { position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--surface-alt)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  note: { fontSize: 12, color: "var(--color-text-tertiary)", background: "var(--surface-alt)", borderRadius: 8, padding: "8px 12px", margin: "8px 0 16px" },
};
