"use client";

import React from "react";
import CreditsUsagePage from "./CreditsUsagePage";
import CreditsUsageMasterDetail from "./CreditsUsageMasterDetail";
import CreditsUsageMonitor from "./CreditsUsageMonitor";
import DarkPillSwitcher from "./DarkPillSwitcher";

// CreditsUsageShell — demo-only host for the three Credits & Usage design
// directions (take-ticket: Credit & Usage tracking). Holds the variant
// state in-memory (resets to "A" when the session ends, deletable in a
// single commit) and mounts the floating switcher cluster bottom-right,
// mirroring MissionsLandingShell. Each variant is a self-contained page
// that reuses the shared CreditsUsageParts atoms.
//
//   A — Stacked sections (incumbent baseline, config-first)
//   B — Master–detail two-pane (management-first)
//   C — Monitoring dashboard + edit-on-demand (monitor-first)

const VARIANTS = ["A", "B", "C"];

export default function CreditsUsageShell({ onBack }) {
  const [variant, setVariant] = React.useState("A");

  return (
    <>
      {variant === "A" && <CreditsUsagePage onBack={onBack} />}
      {variant === "B" && <CreditsUsageMasterDetail onBack={onBack} />}
      {variant === "C" && <CreditsUsageMonitor onBack={onBack} />}

      <div style={styles.cluster}>
        <DarkPillSwitcher
          ariaLabel="Credits & Usage layout variant"
          value={variant}
          options={VARIANTS}
          onChange={setVariant}
        />
      </div>
    </>
  );
}

const styles = {
  cluster: {
    position: "fixed",
    right: 24,
    bottom: 24,
    zIndex: 40,
  },
};
