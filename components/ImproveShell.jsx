"use client";

import React from "react";
import DarkPillSwitcher from "./DarkPillSwitcher";
import ImproveLanes from "./ImproveLanes";
import ImproveTable from "./ImproveTable";
import ImproveMatrix from "./ImproveMatrix";

// ImproveShell — entry point for the "Improve" surface (Jul 17 pivot).
// Hosts 3 structurally distinct direction variants behind a DarkPillSwitcher
// pinned to the bottom-right corner (floating, non-intrusive).
// Supports multiselect: toggle multiple directions visible at once.

const VARIANTS = ["Lanes", "Table", "Matrix"];

export default function ImproveShell() {
  const [active, setActive] = React.useState(["Lanes"]);

  return (
    <div style={shellStyles.wrap}>
      {active.includes("Lanes") && (
        <div style={active.length > 1 ? shellStyles.section : undefined}>
          {active.length > 1 && <h3 style={shellStyles.sectionLabel}>Lanes</h3>}
          <ImproveLanes />
        </div>
      )}
      {active.includes("Table") && (
        <div style={active.length > 1 ? shellStyles.section : undefined}>
          {active.length > 1 && <h3 style={shellStyles.sectionLabel}>Table</h3>}
          <ImproveTable />
        </div>
      )}
      {active.includes("Matrix") && (
        <div style={active.length > 1 ? shellStyles.section : undefined}>
          {active.length > 1 && <h3 style={shellStyles.sectionLabel}>Matrix</h3>}
          <ImproveMatrix />
        </div>
      )}
      <div style={shellStyles.switcherFloat}>
        <DarkPillSwitcher
          value={active}
          options={VARIANTS}
          onChange={setActive}
          ariaLabel="Improve direction switcher"
          multiSelect
        />
      </div>
    </div>
  );
}

const shellStyles = {
  wrap: { position: "relative", minHeight: "100%" },
  switcherFloat: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 100,
  },
  section: {
    marginBottom: 40,
    paddingBottom: 40,
    borderBottom: "1px solid var(--color-divider-card, rgba(0,0,0,0.08))",
  },
  sectionLabel: {
    margin: "0 0 16px",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    color: "var(--color-text-tertiary)",
  },
};
