"use client";

import React from "react";
import CreditsUsagePage from "./CreditsUsagePage";
import VersionBar from "./VersionBar";
import IterationRail from "./IterationRail";

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
//   C4 — Four-tier ladder, list attached to the selected bucket (preferred)
//   C5 — Feedback-incorporated direction: three fixed buckets (Kickstart 30
//        default / Momentum 45 / Sprint 60), a "Manage agents" 4-tab manager,
//        an amber→red over-limit banner, never-block grace period, and Save
//        moved to the bottom of the page.
//   C7  — Dialog-edited tiers stacked vertically (up to 10), rules in a popover.
//   C8  — C7's editing + a selectable roster: checkboxes drive a card-level
//         "Manage agents" → move-to-tier dialog, and the red banner opens an
//         over-limit dialog that moves agents up one or two tiers. Its two
//         iterations are the tier-card layout: a = horizontal cards on top of
//         the list, b = a vertical rail beside it. (C6 folded in here.)
//
// Iterations (C8 a/b, the bulk study's i1/i2/i3) render in a vertical floating
// IterationRail on the right; the bottom VersionBar shows versions only, so its
// `versions` are passed with iterations stripped.
//
// C4 is the preferred (starred) direction. A, B, C1–C3 and the Bulk action exp
// study are parked in the Discarded dropdown — still selectable for comparison,
// just out of the main row. Variant state is in-memory; resets on session end.
const CU_VERSIONS = [
  { id: "c4", label: "C4", iterations: [], preferred: true },
  { id: "c5", label: "C5", iterations: [] },
  { id: "c7", label: "C7", iterations: [] },
  { id: "c8", label: "C8", iterations: [] },
];
const CU_DISCARDED = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
  { id: "c1", label: "C1" },
  { id: "c2", label: "C2" },
  { id: "c3", label: "C3" },
  { id: "bulk", label: "Bulk action exp" },
];
const CU_BASELINE = [{ id: "cu", label: "Credit & Usage" }];
const BULK_PLACEMENTS = { i1: "floating", i2: "inline", i3: "footer" };
// Iterations live in the floating rail, keyed by version id (whether the version
// sits in the main row or in Discarded). The bulk study's i1/i2/i3 pick where
// its move action sits: i1 floating · i2 inline · i3 footer.
const CU_ITERATIONS = { c8: ["a", "b"], bulk: ["i1", "i2", "i3"] };
// The bottom bar shows versions only; iterations move to the IterationRail.
const CU_BAR_VERSIONS = CU_VERSIONS.map((v) => ({ ...v, iterations: [] }));

export default function CreditsUsageShell({ onBack }) {
  const [sel, setSel] = React.useState({ versionId: "c4", iterationId: null });
  const iterations = CU_ITERATIONS[sel.versionId] || [];
  const activeIter = iterations.includes(sel.iterationId) ? sel.iterationId : iterations[0] || null;
  // C8's a/b iterations map to the C8A/C8B the page knows (layout only); bulk
  // maps to placements.
  const variant =
    sel.versionId === "c8" ? (activeIter === "b" ? "C8B" : "C8A") : sel.versionId.toUpperCase();
  const bulkPlacement = sel.versionId === "bulk" ? BULK_PLACEMENTS[activeIter || "i1"] : null;

  return (
    <>
      {/* Re-key across the tier-dataset boundaries so the page remounts with its
          own state. C8 a/b share one mount (same data, layout differs); the
          rest get their own. */}
      <CreditsUsagePage
        key={variant === "C8A" || variant === "C8B" ? "c8" : ["C4", "C5", "C7"].includes(variant) ? variant.toLowerCase() : "main"}
        onBack={onBack}
        assignmentMode={variant}
        bulkPlacement={bulkPlacement}
      />

      <VersionBar
        versions={CU_BAR_VERSIONS}
        discarded={CU_DISCARDED}
        baselineOptions={CU_BASELINE}
        staticBaseline
        value={sel}
        onChange={setSel}
      />
      <IterationRail
        iterations={iterations}
        value={activeIter}
        onChange={(it) => setSel((s) => ({ ...s, iterationId: it }))}
      />
    </>
  );
}
