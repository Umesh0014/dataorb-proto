"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import Card from "./Card";
import ExportButton from "./ExportButton";
import {
  ImprovementPill,
  ConfidenceBadge,
  MethodBadge,
  UnitTag,
  MetricMovement,
  EvidenceList,
  CaveatNote,
  SampleNote,
  formatValue,
} from "./LearningImpactParts";
import { primaryMetric, belowSample } from "./mocks/learningImpact";

// LearningImpactLedger (Variant C) — the recorded intervention→outcome ledger
// made visible. One entry per unit (an intervention bundle and the production
// movement attributed to it), time-sorted most-recent-first. Reads as a
// chronological audit trail — intervention → agent acted → metric moved —
// rather than a unit table. Each entry expands in place for the full metric
// detail, evidence and method caveat. Read-only (G4).

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

// whenValue — sortable number from a unit's earliest evidence date label.
// Handles "May 2", ranges ("May 1–15" → start), month ranges ("Apr–May"),
// and "Q2" (mid-quarter fallback). Pure ordering aid for the mock.
function whenValue(unit) {
  const label = unit.evidence[0]?.date ?? "";
  const lower = label.toLowerCase();
  if (lower.startsWith("q2")) return 4 * 100 + 1; // ~start of Q2 window
  const m = lower.match(/([a-z]{3})[a-z]*\s*(\d+)?/);
  if (m && MONTHS[m[1]] != null) {
    return MONTHS[m[1]] * 100 + (m[2] ? parseInt(m[2], 10) : 1);
  }
  return 0;
}

export default function LearningImpactLedger({ units, window: windowLabel }) {
  const entries = React.useMemo(
    () => [...units].sort((a, b) => whenValue(b) - whenValue(a)),
    [units],
  );

  return (
    <Card padX={0} padY={0}>
      <div style={lgStyles.head}>
        <div style={lgStyles.titleWrap}>
          <h2 style={lgStyles.title}>Attribution ledger</h2>
          <span style={lgStyles.sub}>
            {windowLabel} · most recent first · every entry carries its method, confidence and sample
          </span>
        </div>
        <ExportButton formats={["table-copy", "csv", "pdf"]} />
      </div>

      {entries.length === 0 ? (
        <div style={lgStyles.empty}>
          <span className="material-symbols-outlined" style={lgStyles.emptyIcon} aria-hidden="true">
            history_toggle_off
          </span>
          <span style={lgStyles.emptyTitle}>No recorded interventions in this view</span>
          <span style={lgStyles.emptyBody}>
            Completed Replays, Guides and Missions land here with the metric movement
            measured in their post-window. Switch unit type or widen the window.
          </span>
        </div>
      ) : (
        <ol style={lgStyles.list} role="list">
          {entries.map((u, i) => (
            <LedgerEntry key={u.id} unit={u} last={i === entries.length - 1} />
          ))}
        </ol>
      )}
    </Card>
  );
}

function LedgerEntry({ unit, last }) {
  const [open, setOpen] = React.useState(false);
  const pm = primaryMetric(unit);
  const withheld = belowSample(unit);
  const when = unit.evidence[0]?.date ?? "—";
  const activityCount = unit.evidence.length;

  return (
    <li style={lgStyles.entry}>
      <div style={lgStyles.rail} aria-hidden="true">
        <span style={lgStyles.node} />
        {!last && <span style={lgStyles.line} />}
      </div>

      <div style={lgStyles.entryBody}>
        <button
          type="button"
          className="li-focusable li-row"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          style={lgStyles.entryBtn}
        >
          <div style={lgStyles.entryMain}>
            <div style={lgStyles.entryTopline}>
              <span style={lgStyles.when}>{when}</span>
              <UnitTag tag={unit.tag} />
            </div>
            <span style={lgStyles.unitName}>{unit.name}</span>
            <span style={lgStyles.interventionLine}>
              {activityCount} {activityCount === 1 ? "activity" : "activities"} →{" "}
              <span style={lgStyles.metricInline}>
                {pm.label} {formatValue(pm.baseline, pm.unit)}
                <span style={lgStyles.inlineArrow} aria-hidden="true"> → </span>
                {formatValue(pm.current, pm.unit)}
              </span>
              <span style={lgStyles.ttImpact}> · moved in {unit.timeToImpact}</span>
            </span>
          </div>

          <div style={lgStyles.entryRight}>
            <ImprovementPill metric={pm} withheld={withheld} />
            <div style={lgStyles.entryRightMeta}>
              <MethodBadge method={unit.method} />
              <ConfidenceBadge level={unit.confidence} />
            </div>
            <ChevronDown
              size={18}
              style={{
                color: "var(--color-text-tertiary)",
                transform: open ? "rotate(180deg)" : "none",
                transition: "transform 150ms ease",
                flexShrink: 0,
              }}
              aria-hidden="true"
            />
          </div>
        </button>

        {open && (
          <div style={lgStyles.detail}>
            {withheld && (
              <p style={lgStyles.withheldNote} role="note">
                Below the published-% floor — movement shown, headline withheld.{" "}
                <SampleNote unit={unit} />
              </p>
            )}
            <div style={lgStyles.metricsGrid}>
              {unit.metrics.map((m) => (
                <Card key={m.key} tone="outline" padX={16} padY={16}>
                  <MetricMovement metric={m} unit={unit} />
                </Card>
              ))}
            </div>
            <div style={lgStyles.evidenceBlock}>
              <span style={lgStyles.detailLabel}>Recorded activities</span>
              <EvidenceList evidence={unit.evidence} />
            </div>
            <CaveatNote method={unit.method} />
          </div>
        )}
      </div>
    </li>
  );
}

const lgStyles = {
  head: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    padding: "20px 24px 16px",
  },
  titleWrap: { display: "flex", flexDirection: "column", gap: 2 },
  title: {
    margin: 0,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  sub: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  list: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    padding: "0 24px 8px",
  },
  entry: { display: "flex", gap: 16 },
  rail: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexShrink: 0,
    paddingTop: 22,
  },
  // Neutral structural node — the rail is chrome marking sequence, not a
  // per-entry highlight (UI-6: reserve colour for genuine differences; the
  // improvement pill + confidence badge carry the distinct signal).
  node: {
    width: 11,
    height: 11,
    borderRadius: "50%",
    background: "var(--surface-white)",
    border: "2px solid var(--grey-400)",
    flexShrink: 0,
  },
  line: {
    width: 2,
    flex: 1,
    background: "var(--color-border-tab)",
    marginTop: 4,
  },
  entryBody: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 16,
    borderBottom: "1px solid var(--table-row-border)",
  },
  entryBtn: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    width: "100%",
    padding: "12px",
    margin: "4px 0",
    borderRadius: 8,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  entryMain: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  entryTopline: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  when: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
  },
  unitName: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  interventionLine: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.5,
    color: "var(--color-text-tertiary)",
  },
  metricInline: { color: "var(--color-text-medium)", fontWeight: 600 },
  inlineArrow: { color: "var(--color-text-placeholder)" },
  ttImpact: { color: "var(--color-text-tertiary)", fontWeight: 500 },
  entryRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
  },
  entryRightMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
  },
  detail: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: "8px 12px 16px",
  },
  withheldNote: {
    margin: 0,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.5,
    color: "var(--color-warning-text)",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 12,
  },
  evidenceBlock: { display: "flex", flexDirection: "column", gap: 8 },
  detailLabel: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 700,
    color: "var(--color-text-medium)",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "48px 24px",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: 32,
    color: "var(--color-text-placeholder)",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  },
  emptyTitle: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-medium)",
  },
  emptyBody: {
    maxWidth: 420,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.5,
    color: "var(--color-text-tertiary)",
  },
};
