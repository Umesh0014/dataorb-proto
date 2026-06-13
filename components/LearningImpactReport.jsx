"use client";

import React from "react";
import Card from "./Card";
import ExportButton from "./ExportButton";
import {
  ImprovementPill,
  ConfidenceBadge,
  UnitTag,
  MetricMovement,
  EvidenceList,
  CaveatNote,
} from "./LearningImpactParts";
import { primaryMetric, belowSample } from "./mocks/learningImpact";

// LearningImpactReport (Variant B) — editorial before/after artifact. A unit
// picker, then the selected unit rendered as a ~720px readable document: the
// hero answers who/what (identity) and the metadata snapshot below holds the
// inputs — window, method, sample, time-to-impact (UI-7 keeps the two
// separate). Editorial treatment for content (UI-10): white surface, generous
// whitespace, export-ready for a QBR. Read-only (G4).

const READABLE = 720;

export default function LearningImpactReport({ units, window: windowLabel }) {
  const [selectedId, setSelectedId] = React.useState(units[0]?.id ?? null);
  // Derive the active unit — when the unit-type filter changes upstream and
  // the stored id is no longer in range, fall back to the first unit (no
  // effect / setState needed to stay valid; the picker keys off this unit).
  const unit = units.find((u) => u.id === selectedId) || units[0] || null;

  if (!unit) {
    return (
      <Card>
        <div style={rpStyles.empty}>
          <span className="material-symbols-outlined" style={rpStyles.emptyIcon} aria-hidden="true">
            description
          </span>
          <span style={rpStyles.emptyTitle}>No unit to report on in this view</span>
          <span style={rpStyles.emptyBody}>
            Pick another unit type, or widen the window — a report needs a completed
            intervention with a measured post-window.
          </span>
        </div>
      </Card>
    );
  }

  const pm = primaryMetric(unit);
  const withheld = belowSample(unit);

  return (
    <div style={rpStyles.page}>
      {/* Selection chips (not a tablist): up to 10 units exceeds VersionBar's
          ≤3 switcher range, so a token-bound pressed-chip group is the right
          pattern. Promote to a shared PillGroup once a 3rd callsite needs it. */}
      <div style={rpStyles.pickerRow} role="group" aria-label="Pick a unit to report on">
        {units.map((u) => {
          const on = u.id === unit.id;
          return (
            <button
              key={u.id}
              type="button"
              aria-pressed={on}
              className="li-focusable"
              onClick={() => setSelectedId(u.id)}
              style={{
                ...rpStyles.pickerPill,
                background: on ? "var(--do-brand-blue)" : "var(--surface-white)",
                color: on ? "var(--color-button-primary-fg)" : "var(--color-text-medium)",
                borderColor: on ? "var(--do-brand-blue)" : "var(--color-divider-card)",
              }}
            >
              {u.name}
            </button>
          );
        })}
      </div>

      <Card padX={0} padY={0}>
        <article style={rpStyles.article}>
          {/* Hero — identity (who / what / when). */}
          <header style={rpStyles.hero}>
            <div style={rpStyles.heroTop}>
              <UnitTag tag={unit.tag} />
              <ExportButton formats={["pdf", "png", "table-copy"]} label="Export report" variant="text" />
            </div>
            <h1 style={rpStyles.title}>{unit.name}</h1>
            <p style={rpStyles.sub}>{unit.sub}</p>
            <p style={rpStyles.lede}>
              How Learning Hub moved {unit.name} on production performance over the{" "}
              {windowLabel.toLowerCase()}, attributed to the activities below.
            </p>
          </header>

          {/* Metadata snapshot — the inputs, held apart from the identity. */}
          <dl style={rpStyles.snapshot}>
            <Snap k="Window" v={windowLabel} />
            <Snap k="Time to impact" v={unit.timeToImpact} />
            <Snap k="Sample" v={`${unit.sampleN} of ${unit.samplePool} interactions`} />
            <Snap
              k="Confidence"
              v={<ConfidenceBadge level={unit.confidence} />}
            />
          </dl>

          <div style={rpStyles.headline}>
            <span style={rpStyles.headlineLabel}>Headline movement · {pm.label}</span>
            <ImprovementPill metric={pm} withheld={withheld} />
          </div>
          {unit.goal && (
            <p style={rpStyles.goalLine}>
              <span className="material-symbols-outlined" style={rpStyles.goalIcon} aria-hidden="true">
                {unit.goal.hit ? "flag_circle" : "outlined_flag"}
              </span>
              Mission goal — {unit.goal.label}:{" "}
              <strong style={{ color: unit.goal.hit ? "var(--color-success-text)" : "var(--color-warning-text)" }}>
                {unit.goal.hit ? "met" : "not met"}
              </strong>
            </p>
          )}

          <Divider />

          {/* What we did. */}
          <section style={rpStyles.section}>
            <h2 style={rpStyles.sectionTitle}>What we did</h2>
            <p style={rpStyles.sectionLede}>
              The completed Learning Hub activities this movement is attributed to.
            </p>
            <EvidenceList evidence={unit.evidence} />
          </section>

          <Divider />

          {/* What moved. */}
          <section style={rpStyles.section}>
            <h2 style={rpStyles.sectionTitle}>What moved</h2>
            <p style={rpStyles.sectionLede}>
              Production metrics, baseline versus current, over the {windowLabel.toLowerCase()}.
            </p>
            <div style={rpStyles.movements}>
              {unit.metrics.map((m) => (
                <Card key={m.key} tone="outline" padX={20} padY={18}>
                  <MetricMovement metric={m} unit={unit} />
                </Card>
              ))}
            </div>
          </section>

          <Divider />

          {/* How confident. */}
          <section style={rpStyles.section}>
            <h2 style={rpStyles.sectionTitle}>How confident</h2>
            <p style={rpStyles.sectionLede}>
              {withheld
                ? "This unit is below the minimum sample for a published %, so the figures above show the movement without a headline claim."
                : "The comparison method and its caveat — stated so the number never outruns what it can support."}
            </p>
            <CaveatNote method={unit.method} />
          </section>
        </article>
      </Card>
    </div>
  );
}

function Snap({ k, v }) {
  return (
    <div style={rpStyles.snapItem}>
      <dt style={rpStyles.snapKey}>{k}</dt>
      <dd style={rpStyles.snapVal}>{v}</dd>
    </div>
  );
}

function Divider() {
  return <div style={rpStyles.divider} aria-hidden="true" />;
}

const rpStyles = {
  page: { display: "flex", flexDirection: "column", gap: 16 },
  pickerRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  pickerPill: {
    height: 32,
    padding: "0 14px",
    borderRadius: 999,
    border: "1px solid",
    cursor: "pointer",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: "nowrap",
    transition: "background 150ms ease, color 150ms ease, border-color 150ms ease",
  },
  article: {
    maxWidth: READABLE,
    marginInline: "auto",
    padding: "40px 48px 48px",
    display: "flex",
    flexDirection: "column",
  },
  hero: { display: "flex", flexDirection: "column", gap: 8 },
  heroTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  title: {
    margin: "8px 0 0",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 30,
    fontWeight: 800,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
    color: "var(--color-text-deep)",
  },
  sub: {
    margin: 0,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  lede: {
    margin: "10px 0 0",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.6,
    color: "var(--color-text-medium)",
  },
  snapshot: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 16,
    margin: "24px 0 0",
    padding: "16px 20px",
    background: "var(--color-card-emoji-bg)",
    borderRadius: 8,
  },
  snapItem: { display: "flex", flexDirection: "column", gap: 4 },
  snapKey: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
  },
  snapVal: {
    margin: 0,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  headline: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    marginTop: 24,
  },
  headlineLabel: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  goalLine: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    margin: "12px 0 0",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  goalIcon: {
    fontSize: 18,
    color: "var(--color-text-tertiary)",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  },
  divider: {
    height: 1,
    background: "var(--color-divider-card)",
    margin: "28px 0",
  },
  section: { display: "flex", flexDirection: "column", gap: 12 },
  sectionTitle: {
    margin: 0,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 18,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  sectionLede: {
    margin: 0,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.6,
    color: "var(--color-text-tertiary)",
  },
  movements: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
    marginTop: 4,
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "40px 24px",
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
