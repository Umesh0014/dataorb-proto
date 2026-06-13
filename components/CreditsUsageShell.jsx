"use client";

import React from "react";
import CreditsUsagePage from "./CreditsUsagePage";
import CreditsUsageMasterDetail from "./CreditsUsageMasterDetail";
import CreditsUsageMonitor from "./CreditsUsageMonitor";
import VersionBar from "./VersionBar";

// CreditsUsageShell — demo-only host for the three Credits & Usage design
// directions (take-ticket: Credit & Usage tracking). Holds the variant
// state in-memory (resets to "A" when the session ends, deletable in a
// single commit) and mounts the VersionBar switcher bottom-right. Each
// variant is a self-contained page reusing the shared CreditsUsageParts
// atoms.
//
//   A — Stacked sections (incumbent baseline, config-first)
//   B — Master–detail two-pane (management-first)
//   C — Monitoring dashboard + edit-on-demand (monitor-first)

// VersionBar config — the three directions as sibling version chips. The
// baseline block is a static "Credits & Usage" label (staticBaseline), so
// this surface shows no design-phase dropdown — just the A/B/C switcher.
const CU_VERSIONS = [
  { id: "a", label: "A", iterations: [] },
  { id: "b", label: "B", iterations: [] },
  { id: "c", label: "C", iterations: [] },
];
const CU_BASELINE = [{ id: "cu", label: "Credits & Usage" }];

export default function CreditsUsageShell({ onBack }) {
  const [variant, setVariant] = React.useState("A");

  return (
    <>
      {variant === "A" && <CreditsUsagePage onBack={onBack} />}
      {variant === "B" && <CreditsUsageMasterDetail onBack={onBack} />}
      {variant === "C" && <CreditsUsageMonitor onBack={onBack} />}

      <VersionBar
        versions={CU_VERSIONS}
        baselineOptions={CU_BASELINE}
        staticBaseline
        value={{ versionId: variant.toLowerCase(), iterationId: null }}
        onChange={({ versionId }) => setVariant(versionId.toUpperCase())}
      />
    </>
  );
}
