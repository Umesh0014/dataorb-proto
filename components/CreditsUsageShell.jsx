"use client";

import React from "react";
import CreditsUsagePage from "./CreditsUsagePage";
import VersionBar from "./VersionBar";

// CreditsUsageShell — host for the Credit & Usage surface. The locked core
// (utilisation + rules) is the same across versions; the VersionBar swaps
// only the *assignment experience* between four coherent explorations:
//
//   A  — Assign by rule (Workspace conditional-field builder)
//   B  — Select & bulk-move (table-first)
//   C1 — Bucket as folder, inline (separate quota-buckets + assignment
//        cards; agents are added in-page, no dialog)
//   C2 — Bucket as folder, merged (quota buckets + assignment in one card,
//        a vertical bucket rail beside the list; agents added via a dialog)
//   C3 — Bucket as folder, merged with the bucket cards stacked
//        horizontally on top of the list (dialog kept)
//
// A is the default. These are intentional variants held for comparison on
// the deployed URL — not a merged design. Variant state is in-memory and
// resets to A when the session ends.
const CU_VERSIONS = [
  { id: "a", label: "A", iterations: [] },
  { id: "b", label: "B", iterations: [] },
  { id: "c1", label: "C1", iterations: [] },
  { id: "c2", label: "C2", iterations: [] },
  { id: "c3", label: "C3", iterations: [] },
];
const CU_BASELINE = [{ id: "cu", label: "Credit & Usage" }];

export default function CreditsUsageShell({ onBack }) {
  const [variant, setVariant] = React.useState("A");

  return (
    <>
      <CreditsUsagePage onBack={onBack} assignmentMode={variant} />

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
