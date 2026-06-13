"use client";

import React from "react";
import MetricSparkline from "./MetricSparkline";
import TrendArrow from "./TrendArrow";
import { CONFIDENCE, METHODS, belowSample } from "./mocks/learningImpact";

// LearningImpactParts — shared presentational atoms for the Learning Impact
// variants (Scoreboard / Report / Ledger). Extracted because all three
// callsites compose the same impact primitives (rule of three): the
// improvement pill, confidence badge, method badge, unit tag, the
// baseline→current movement block, and the honesty notes. Every number here
// renders with its unit + label, every status pairs colour with text (G3/G9),
// and a below-sample unit withholds its % rather than printing a noisy claim.

// CONF_TONE — confidence tone → token pair. Text label always renders, so
// colour is reinforcement, never the sole signal.
const CONF_TONE = {
  success: { bg: "var(--color-success-bg)", fg: "var(--color-success-text)" },
  warning: { bg: "var(--color-warning-bg)", fg: "var(--color-warning-text)" },
  neutral: { bg: "var(--pill-bg)", fg: "var(--color-text-tertiary)" },
};

// formatValue — render a metric value in its own unit.
export function formatValue(v, unit) {
  if (unit === "min") return `${(Math.round(v * 10) / 10).toFixed(1)} min`;
  return `${Math.round(v)}${unit === "%" ? "%" : ""}`;
}

// ImprovementPill — signed % improvement with an arrow + text. For a unit
// under the sample floor the caller passes `withheld` and we say so instead.
export function ImprovementPill({ metric, withheld = false }) {
  if (withheld) {
    return (
      <span style={{ ...partStyles.pill, background: "var(--pill-bg)", color: "var(--color-text-tertiary)" }}>
        % withheld
      </span>
    );
  }
  const up = metric.improved;
  const flat = metric.improvedPct === 0;
  const tone = flat
    ? { bg: "var(--pill-bg)", fg: "var(--color-text-tertiary)" }
    : up
      ? { bg: "var(--color-success-bg)", fg: "var(--color-success-text)" }
      : { bg: "var(--color-error-bg)", fg: "var(--color-error-text)" };
  return (
    <span style={{ ...partStyles.pill, background: tone.bg, color: tone.fg }}>
      {!flat && <TrendArrow up={up} />}
      {metric.improvedPct > 0 ? "+" : ""}
      {metric.improvedPct}% improvement
    </span>
  );
}

// ConfidenceBadge — High/Med/Low attribution confidence, text-labelled.
export function ConfidenceBadge({ level }) {
  const conf = CONFIDENCE[level] || CONFIDENCE.low;
  const tone = CONF_TONE[conf.tone] || CONF_TONE.neutral;
  return (
    <span style={{ ...partStyles.badge, background: tone.bg, color: tone.fg }}>
      {conf.label}
    </span>
  );
}

// MethodBadge — the comparison method used for this unit's numbers.
export function MethodBadge({ method }) {
  const m = METHODS[method] || METHODS.prepost;
  return <span style={partStyles.methodBadge}>{m.label}</span>;
}

// UnitTag — driver/competency tag. Kind is spelled out so the colour split
// (driver vs competency) is never the only signal (G9, UI-6).
export function UnitTag({ tag }) {
  const isDriver = tag.kind === "driver";
  return (
    <span
      style={{
        ...partStyles.tag,
        background: isDriver ? "var(--color-info-bg)" : "var(--color-icon-tertiary-bg)",
        color: isDriver ? "var(--color-info-text)" : "var(--color-icon-tertiary-fg)",
      }}
    >
      {isDriver ? "Driver" : "Competency"} · {tag.label}
    </span>
  );
}

// SampleNote — "based on N of M interactions" honesty line.
export function SampleNote({ unit }) {
  return (
    <span style={partStyles.sampleNote}>
      based on {unit.sampleN} of {unit.samplePool} evaluated interactions
    </span>
  );
}

// CaveatNote — the method caveat, surfaced as a calm callout so the
// credibility of a number never outruns what the method supports.
export function CaveatNote({ method }) {
  const m = METHODS[method] || METHODS.prepost;
  return (
    <p style={partStyles.caveat} role="note">
      <span className="material-symbols-outlined" style={partStyles.caveatIcon} aria-hidden="true">
        info
      </span>
      <span>
        <strong style={partStyles.caveatLead}>{m.label}.</strong> {m.caveat}
      </span>
    </p>
  );
}

// MetricMovement — baseline → current for one metric, with absolute Δ (in the
// metric's unit), the % improvement pill, target line, and a sparkline of the
// post-window trend. The reusable read-only "what moved" block.
export function MetricMovement({ metric, unit, sparkColor }) {
  const color =
    sparkColor ||
    (metric.improved ? "var(--chart-green)" : "var(--chart-coral)");
  const deltaSign = metric.deltaAbs > 0 ? "+" : "";
  const deltaUnit = metric.unit === "%" ? " pp" : metric.unit === "min" ? " min" : "";
  return (
    <div style={partStyles.movement}>
      <div style={partStyles.movementHead}>
        <span style={partStyles.metricLabel}>{metric.label}</span>
        <ImprovementPill metric={metric} withheld={unit ? belowSample(unit) : false} />
      </div>
      <div style={partStyles.movementValues}>
        <span style={partStyles.baseline}>{formatValue(metric.baseline, metric.unit)}</span>
        <span className="material-symbols-outlined" style={partStyles.arrow} aria-hidden="true">
          arrow_forward
        </span>
        <span style={partStyles.current}>{formatValue(metric.current, metric.unit)}</span>
        <span style={partStyles.delta}>
          {deltaSign}
          {metric.deltaAbs}
          {deltaUnit} vs. baseline
        </span>
      </div>
      <div style={partStyles.sparkRow}>
        <MetricSparkline
          points={metric.series}
          color={color}
          formatValue={(v) => formatValue(v, metric.unit)}
        />
      </div>
      {metric.target != null && (
        <span style={partStyles.target}>
          target {formatValue(metric.target, metric.unit)}
        </span>
      )}
    </div>
  );
}

// EvidenceList — the activities the movement is attributed to, with their
// completion state spelled out (icon + word, never colour alone).
export function EvidenceList({ evidence }) {
  return (
    <ul style={partStyles.evidence} role="list">
      {evidence.map((e, i) => (
        <li key={`${e.activity}-${i}`} style={partStyles.evidenceRow}>
          <span style={partStyles.evidenceKind}>{e.kind}</span>
          <span style={partStyles.evidenceActivity}>{e.activity}</span>
          <span style={partStyles.evidenceDate}>{e.date}</span>
          <StateChip state={e.state} />
        </li>
      ))}
    </ul>
  );
}

function StateChip({ state }) {
  const done = state === "completed";
  return (
    <span
      style={{
        ...partStyles.stateChip,
        background: done ? "var(--color-success-bg)" : "var(--badge-amber-bg)",
        color: done ? "var(--color-success-text)" : "var(--badge-amber)",
      }}
    >
      <span className="material-symbols-outlined" style={partStyles.stateIcon} aria-hidden="true">
        {done ? "check_circle" : "schedule"}
      </span>
      {done ? "Completed" : "Partial"}
    </span>
  );
}

const partStyles = {
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    padding: "3px 8px",
    borderRadius: 4,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 4,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  methodBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 4,
    background: "var(--pill-bg)",
    color: "var(--color-text-tertiary)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 999,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  sampleNote: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  caveat: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    margin: 0,
    padding: "10px 12px",
    background: "var(--color-card-emoji-bg)",
    borderRadius: 8,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.5,
    color: "var(--color-text-tertiary)",
  },
  caveatIcon: {
    fontSize: 16,
    color: "var(--color-text-tertiary)",
    flexShrink: 0,
    marginTop: 1,
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  },
  caveatLead: {
    color: "var(--color-text-medium)",
    fontWeight: 700,
  },
  movement: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  movementHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  metricLabel: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  movementValues: {
    display: "flex",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: 8,
  },
  baseline: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 18,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  arrow: {
    fontSize: 16,
    color: "var(--color-text-placeholder)",
    alignSelf: "center",
    fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20",
  },
  current: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 24,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  delta: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  sparkRow: {
    width: "100%",
    marginTop: 2,
  },
  target: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  evidence: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    listStyle: "none",
  },
  evidenceRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  evidenceKind: {
    display: "inline-flex",
    alignItems: "center",
    minWidth: 64,
    padding: "2px 8px",
    borderRadius: 4,
    background: "var(--surface-alt)",
    color: "var(--color-text-tertiary)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
  evidenceActivity: {
    flex: 1,
    minWidth: 160,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  evidenceDate: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  stateChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    padding: "2px 8px",
    borderRadius: 4,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 700,
  },
  stateIcon: {
    fontSize: 13,
    fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20",
  },
};
