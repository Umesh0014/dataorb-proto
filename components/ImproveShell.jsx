"use client";

import React from "react";
import DarkPillSwitcher from "./DarkPillSwitcher";
import ImproveLanes from "./ImproveLanes";
import ImproveTable from "./ImproveTable";
import ImproveMatrix from "./ImproveMatrix";

// ImproveShell — entry point for the "Improve" surface (Jul 17 pivot).
// Hosts 3 structurally distinct direction variants behind a DarkPillSwitcher:
//   A — Lanes (competency swimlanes, browse-all-at-once)
//   B — Table (tabbed table + sidecar, one-lane-at-a-time focus)
//   C — Matrix (agent × competency heatmap, cluster-spotting)
// All state resets on reload — no persistence by design (G5).

const VARIANTS = ["Lanes", "Table", "Matrix"];

export default function ImproveShell() {
  const [variant, setVariant] = React.useState("Lanes");

  return (
    <div style={shellStyles.wrap}>
      <div style={shellStyles.switcherRow}>
        <DarkPillSwitcher
          value={variant}
          options={VARIANTS}
          onChange={setVariant}
          ariaLabel="Improve direction switcher"
        />
      </div>
      {variant === "Lanes" && <ImproveLanes />}
      {variant === "Table" && <ImproveTable />}
      {variant === "Matrix" && <ImproveMatrix />}
    </div>
  );
}

const shellStyles = {
  wrap: { display: "flex", flexDirection: "column", gap: 20 },
  switcherRow: { display: "flex", justifyContent: "center" },
};
