"use client";

import React from "react";
import CreditsUsagePage from "./CreditsUsagePage";
import CreditsUsageMasterDetail from "./CreditsUsageMasterDetail";
import CreditsUsageMonitor from "./CreditsUsageMonitor";
import CreditsUsageAgentCaps from "./CreditsUsageAgentCaps";
import VersionBar from "./VersionBar";

// CreditsUsageShell — demo-only host for the Credits & Usage design
// directions (take-ticket: Credit & Usage tracking). Holds the variant
// state in-memory (resets to "D" when the session ends, deletable in a
// single commit) and mounts the VersionBar switcher bottom-right. Each
// variant is a self-contained page reusing the shared CreditsUsageParts
// atoms.
//
//   A — Stacked sections (team-level, config-first)
//   B — Master–detail two-pane (team-level, management-first)
//   C — Monitoring dashboard + edit-on-demand (team-level, monitor-first)
//   D — Agent weekly session caps (Jun 15 V1: org-level, per-agent;
//       team-level distribution deferred to a later version)
//
// A/B/C are the earlier team-level directions, retained for comparison; D
// is the default because it reflects the locked Jun 15 V1 scope.

const CU_VERSIONS = [
  { id: "a", label: "A", iterations: [] },
  { id: "b", label: "B", iterations: [] },
  { id: "c", label: "C", iterations: [] },
  { id: "d", label: "D", iterations: [] },
];
const CU_BASELINE = [{ id: "cu", label: "Credits & Usage" }];

export default function CreditsUsageShell({ onBack }) {
  const [variant, setVariant] = React.useState("D");

  return (
    <>
      {variant === "A" && <CreditsUsagePage onBack={onBack} />}
      {variant === "B" && <CreditsUsageMasterDetail onBack={onBack} />}
      {variant === "C" && <CreditsUsageMonitor onBack={onBack} />}
      {variant === "D" && <CreditsUsageAgentCaps onBack={onBack} />}

      <VersionBar
        versions={CU_VERSIONS}
        baselineOptions={CU_BASELINE}
        staticBaseline
        value={{ versionId: variant.toLowerCase(), iterationId: null }}
        onChange={({ versionId }) => setVariant(versionId.toUpperCase())}
        notionHref="https://app.notion.com/p/36e7c82646568161bd49f771f96f2a1d"
      />
    </>
  );
}
