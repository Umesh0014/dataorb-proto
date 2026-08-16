"use client";

import React from "react";
import Card from "./Card";
import VersionBar from "./VersionBar";
import KpiSidecarStandard from "./KpiSidecarStandard";
import KpiSidecarL1Only from "./KpiSidecarL1Only";
import { KPI_CONFIGS, DEFAULT_KPI_ID } from "./mocks/kpiSidecar";

// KPI Sidecar review surface. Both variants share the same per-KPI config +
// data layer; the VersionBar switcher exposes them side by side for review
// with Neil (do not auto-merge or drop either):
//   A — Standard (ship-now): full L1 → L2 → L3 drill.
//   B — L1-only (exploration): everything surfaced on Layer 1, no deep nav.
const VARIANTS = [
  { id: "a", label: "A · Standard", iterations: [] },
  { id: "b", label: "B · L1-only", iterations: [] },
];

export default function KpiSidecarShell({ kpiId = DEFAULT_KPI_ID }) {
  const kpi = KPI_CONFIGS[kpiId] || KPI_CONFIGS[DEFAULT_KPI_ID];
  const [variant, setVariant] = React.useState("a");

  return (
    <>
      <div style={s.frame}>
        <div style={s.intro}>
          <h1 style={s.h1}>KPI Sidecar</h1>
          <p style={s.lede}>
            Standardized drill-down template — one config per KPI drives every label,
            bucket and sort. Showing <strong>{kpi.name}</strong> (Type {kpi.kpiType}).
          </p>
        </div>
        <Card shadow style={s.panel}>
          {variant === "a" ? <KpiSidecarStandard kpi={kpi} /> : <KpiSidecarL1Only kpi={kpi} />}
        </Card>
      </div>

      <VersionBar
        versions={VARIANTS}
        baselineOptions={[{ id: "kpi-sidecar", label: "KPI Sidecar" }]}
        staticBaseline
        value={{ versionId: variant, iterationId: null }}
        onChange={({ versionId }) => setVariant(versionId)}
        help="A is the approved ship-now drill (L1→L2→L3). B explores surfacing everything on Layer 1 with inline expansion — no deep back-nav. Both share one config + data layer."
      />
    </>
  );
}

const s = {
  frame: { display: "flex", flexDirection: "column", gap: 20, paddingBottom: 96 },
  intro: { display: "flex", flexDirection: "column", gap: 6 },
  h1: { fontSize: 22, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  lede: { fontSize: 14, color: "var(--color-text-tertiary)", margin: 0, maxWidth: 620 },
  panel: { maxWidth: 720 },
};
