"use client";

import React from "react";
import KpiSidecarLayer1 from "./KpiSidecarLayer1";
import KpiSidecarLayer2 from "./KpiSidecarLayer2";
import KpiSidecarLayer3 from "./KpiSidecarLayer3";

// Variant A — Standard (ship-now). The approved fallback: full L1 → L2 → L3
// drill, navigation held in a small in-memory stack. Back steps one layer.
export default function KpiSidecarStandard({ kpi }) {
  const [agent, setAgent] = React.useState(null);
  const [week, setWeek] = React.useState(null);

  if (agent && week) {
    return (
      <KpiSidecarLayer3 kpi={kpi} agent={agent} week={week} onBack={() => setWeek(null)} />
    );
  }
  if (agent) {
    return (
      <KpiSidecarLayer2
        kpi={kpi}
        agent={agent}
        onBack={() => setAgent(null)}
        onSelectWeek={setWeek}
      />
    );
  }
  return <KpiSidecarLayer1 kpi={kpi} onSelectAgent={setAgent} />;
}
