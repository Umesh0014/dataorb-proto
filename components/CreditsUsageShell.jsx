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
//   C4 — Four-tier ladder, list attached to the selected bucket (preferred)
//   C5 — Feedback-incorporated direction: three fixed buckets (Kickstart 30
//        default / Momentum 45 / Sprint 60), a "Manage agents" 4-tab manager,
//        an amber→red over-limit banner, never-block grace period, and Save
//        moved to the bottom of the page.
//   C6a — C5 with editable tiers, edited inline on each card (add up to 5).
//   C6b — C5 with editable tiers, edited via a dialog (click a card / Add tier).
//   C7  — C6b's dialog editing with tiers stacked vertically (up to 10) and the
//         rules shared through a modal instead of the in-card FYI.
//
// C4 is the preferred (starred) direction. A, B, C1 and C2 are kept but parked
// in the Discarded dropdown — still selectable for comparison, just out of the
// main row. Variant state is in-memory and resets when the session ends.
const CU_VERSIONS = [
  { id: "c3", label: "C3", iterations: [] },
  { id: "c4", label: "C4", iterations: [], preferred: true },
  { id: "c5", label: "C5", iterations: [] },
  { id: "c6a", label: "C6a", iterations: [] },
  { id: "c6b", label: "C6b", iterations: [] },
  { id: "c7", label: "C7", iterations: [] },
  // Bulk action exp — a comparison of where the bulk "move selected agents"
  // action sits. i1 floating bar · i2 inline in the toolbar · i3 footer.
  { id: "bulk", label: "Bulk action exp", iterations: ["i1", "i2", "i3"] },
];
const CU_DISCARDED = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
  { id: "c1", label: "C1" },
  { id: "c2", label: "C2" },
];
const CU_BASELINE = [{ id: "cu", label: "Credit & Usage" }];
const BULK_PLACEMENTS = { i1: "floating", i2: "inline", i3: "footer" };

export default function CreditsUsageShell({ onBack }) {
  const [sel, setSel] = React.useState({ versionId: "c3", iterationId: null });
  const variant = sel.versionId.toUpperCase();
  const bulkPlacement = sel.versionId === "bulk" ? BULK_PLACEMENTS[sel.iterationId || "i1"] : null;

  return (
    <>
      {/* Re-key across the tier-dataset boundaries so the page remounts with
          its own state (four-tier C4, three-tier C5/C6a/C6b/C7); the rest share
          one mounted instance. */}
      <CreditsUsagePage
        key={["C4", "C5", "C6A", "C6B", "C7"].includes(variant) ? variant.toLowerCase() : "main"}
        onBack={onBack}
        assignmentMode={variant}
        bulkPlacement={bulkPlacement}
      />

      <VersionBar
        versions={CU_VERSIONS}
        discarded={CU_DISCARDED}
        baselineOptions={CU_BASELINE}
        staticBaseline
        value={sel}
        onChange={setSel}
      />
    </>
  );
}
