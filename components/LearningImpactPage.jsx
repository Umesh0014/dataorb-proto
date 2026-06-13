"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import PageHeader from "./PageHeader";
import TabsRow from "./TabsRow";
import VersionBar from "./VersionBar";
import LearningImpactScoreboard from "./LearningImpactScoreboard";
import LearningImpactReport from "./LearningImpactReport";
import LearningImpactLedger from "./LearningImpactLedger";
import { IMPACT_UNITS, UNIT_TYPES, IMPACT_WINDOW } from "./mocks/learningImpact";

// LearningImpactPage — Learning Impact surface entry point. Hosts the demo
// variant state (Scoreboard / Report / Ledger) + the unit-type filter, and
// mounts the floating VersionBar switcher in the same pattern as
// MissionsLandingShell. All three variants render the same shared impact
// dataset three ways, so the switcher is an apples-to-apples compare.
//
// Both states are in-memory only (INT-6) — a reload resets to All +
// Scoreboard. The variant switcher reuses VersionBar (INT-3 canonical
// switcher) rather than a bespoke control.
//
// Placement note (flagged to Akash, not resolved here): which module owns
// this surface is an open product question. It is mounted on a Learning Hub
// route for the preview without claiming a permanent rail slot.

const VARIANTS = [
  { id: "scoreboard", label: "Scoreboard", iterations: [] },
  { id: "report", label: "Report", iterations: [] },
  { id: "ledger", label: "Ledger", iterations: [] },
];
const SWITCHER_BASELINE = [{ id: "li", label: "Learning Impact" }];

export default function LearningImpactPage({ pageName = "Learning Impact" }) {
  const [variant, setVariant] = React.useState("scoreboard");
  const [unitType, setUnitType] = React.useState("all");

  React.useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const previous = document.title;
    document.title = `${pageName} — Learning Hub`;
    return () => {
      document.title = previous;
    };
  }, [pageName]);

  const units =
    unitType === "all"
      ? IMPACT_UNITS
      : IMPACT_UNITS.filter((u) => u.type === unitType);

  const tabs = UNIT_TYPES.map((t) => ({
    id: t.id,
    label: t.label,
    count:
      t.id === "all"
        ? IMPACT_UNITS.length
        : IMPACT_UNITS.filter((u) => u.type === t.id).length,
  }));

  const View =
    variant === "report"
      ? LearningImpactReport
      : variant === "ledger"
        ? LearningImpactLedger
        : LearningImpactScoreboard;

  return (
    <div style={liStyles.page}>
      <style>{LI_STYLESHEET}</style>

      <PageHeader
        identifier={{
          icon: <TrendingUp size={18} />,
          label: pageName,
        }}
        subtitle="Proof that Learning Hub moved production performance — baseline → current, attributed by method, with an honest confidence read."
        meta={
          <>
            <span className="material-symbols-outlined" style={liStyles.metaIcon} aria-hidden="true">
              calendar_today
            </span>
            {IMPACT_WINDOW} · read-only grounding (narrative lives elsewhere)
          </>
        }
      />

      <TabsRow tabs={tabs} activeTab={unitType} onTabClick={setUnitType} />

      <View units={units} window={IMPACT_WINDOW} />

      <VersionBar
        versions={VARIANTS}
        baselineOptions={SWITCHER_BASELINE}
        staticBaseline
        value={{ versionId: variant, iterationId: null }}
        onChange={({ versionId }) => setVariant(versionId)}
        help={
          <div style={liStyles.help}>
            <span style={liStyles.helpTitle}>Three readings of the same impact data</span>
            <p style={liStyles.helpLine}><strong>Scoreboard</strong> — dense table, scan many units.</p>
            <p style={liStyles.helpLine}><strong>Report</strong> — one unit as an export-ready brief.</p>
            <p style={liStyles.helpLine}><strong>Ledger</strong> — interventions over time, newest first.</p>
          </div>
        }
      />
    </div>
  );
}

const liStyles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    width: "100%",
    flex: 1,
    minHeight: 0,
  },
  metaIcon: {
    fontSize: 14,
    color: "var(--color-text-tertiary)",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  },
  help: { display: "flex", flexDirection: "column", gap: 4 },
  helpTitle: { fontSize: 13, fontWeight: 700, marginBottom: 4 },
  helpLine: { margin: 0, fontSize: 12, lineHeight: 1.5 },
};

// Self-contained focus + hover styling for the impact variants. The focus
// ring matches the design-guidelines spec (white inner + brand-blue outer)
// via tokens; row hover is the standard 150ms ease, disabled under
// prefers-reduced-motion (G10 / G13 / MOT-1).
const LI_STYLESHEET = `
.li-focusable:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--surface-white), 0 0 0 4px var(--do-brand-blue);
}
.li-row { transition: background 150ms ease; }
.li-row:hover { background: var(--table-row-hover); }
@media (prefers-reduced-motion: reduce) {
  .li-row, .li-row * { transition: none !important; }
}
`;
