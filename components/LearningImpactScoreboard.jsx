"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import Card from "./Card";
import StatCard from "./StatCard";
import ExportButton from "./ExportButton";
import {
  ImprovementPill,
  ConfidenceBadge,
  MethodBadge,
  UnitTag,
  SampleNote,
  CaveatNote,
  MetricMovement,
  EvidenceList,
  formatValue,
} from "./LearningImpactParts";
import { primaryMetric, belowSample } from "./mocks/learningImpact";

// LearningImpactScoreboard (Variant A) — operational dashboard reading.
// Program-level KPI tiles, then the filtered units as a scannable impact
// table; each row drills in place (visible chevron → inline evidence +
// method caveat + supporting metrics), keeping the primary surface dense
// and scannable (UI-9 / UI-10). Read-only throughout (G4).

// Header grid template shared by the header row and every data row so the
// columns line up. Last track is the chevron affordance.
const ROW_GRID =
  "minmax(200px, 1.6fr) minmax(190px, 1.4fr) 132px 150px 28px";

export default function LearningImpactScoreboard({ units, window: windowLabel }) {
  const measured = units.filter((u) => !belowSample(u) && primaryMetric(u).improved);
  const avgImprovement =
    measured.length > 0
      ? Math.round(
          measured.reduce((sum, u) => sum + primaryMetric(u).improvedPct, 0) /
            measured.length,
        )
      : 0;
  const bestMover = measured.reduce(
    (best, u) =>
      !best || primaryMetric(u).improvedPct > primaryMetric(best).improvedPct ? u : best,
    null,
  );

  return (
    <div style={sbStyles.page}>
      <div style={sbStyles.kpiRow}>
        <StatCard
          size="lg"
          icon="insights"
          label="Units with a measurable delta"
          value={`${measured.length} of ${units.length}`}
        />
        <StatCard
          size="lg"
          icon="trending_up"
          label="Avg. improvement (measured)"
          value={`+${avgImprovement}%`}
        />
        <StatCard
          size="lg"
          icon="workspace_premium"
          label="Best mover"
          value={
            bestMover
              ? `+${primaryMetric(bestMover).improvedPct}%`
              : "—"
          }
        />
      </div>

      <Card padX={0} padY={0}>
        <div style={sbStyles.tableHead}>
          <div style={sbStyles.tableTitleWrap}>
            <h2 style={sbStyles.tableTitle}>Impact by unit</h2>
            <span style={sbStyles.tableSub}>
              {windowLabel} · every number labelled with its method, confidence and sample
            </span>
          </div>
          <ExportButton formats={["table-copy", "csv", "pdf"]} />
        </div>

        <div style={{ ...sbStyles.headerRow, gridTemplateColumns: ROW_GRID }} role="row">
          <span style={sbStyles.headCell}>Unit</span>
          <span style={sbStyles.headCell}>Primary metric · baseline → current</span>
          <span style={sbStyles.headCell}>Improvement</span>
          <span style={sbStyles.headCell}>Confidence</span>
          <span style={sbStyles.headCell} aria-hidden="true" />
        </div>

        {units.length === 0 ? (
          <EmptyState />
        ) : (
          units.map((u) => <ImpactRow key={u.id} unit={u} />)
        )}
      </Card>
    </div>
  );
}

function ImpactRow({ unit }) {
  const [open, setOpen] = React.useState(false);
  const pm = primaryMetric(unit);
  const withheld = belowSample(unit);

  return (
    <div style={sbStyles.rowGroup}>
      <button
        type="button"
        className="li-focusable li-row"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{ ...sbStyles.row, gridTemplateColumns: ROW_GRID }}
      >
        <span style={sbStyles.unitCell}>
          <span style={sbStyles.unitName}>{unit.name}</span>
          <span style={sbStyles.unitSub}>{unit.sub}</span>
          <span style={sbStyles.unitTagRow}>
            <UnitTag tag={unit.tag} />
          </span>
        </span>

        <span style={sbStyles.metricCell}>
          <span style={sbStyles.metricLabel}>{pm.label}</span>
          <span style={sbStyles.metricMove}>
            <span style={sbStyles.baseline}>{formatValue(pm.baseline, pm.unit)}</span>
            <span style={sbStyles.moveArrow} aria-hidden="true">→</span>
            <span style={sbStyles.current}>{formatValue(pm.current, pm.unit)}</span>
          </span>
          <span style={sbStyles.methodRow}>
            <MethodBadge method={unit.method} />
            <span style={sbStyles.nWord}>N = {unit.sampleN}</span>
          </span>
        </span>

        <span style={sbStyles.improveCell}>
          <ImprovementPill metric={pm} withheld={withheld} />
        </span>

        <span style={sbStyles.confCell}>
          <ConfidenceBadge level={unit.confidence} />
        </span>

        <span style={sbStyles.chevronCell} aria-hidden="true">
          <ChevronDown
            size={18}
            style={{
              color: "var(--color-text-tertiary)",
              transform: open ? "rotate(180deg)" : "none",
              transition: "transform 150ms ease",
            }}
          />
        </span>
      </button>

      {open && (
        <div style={sbStyles.detail}>
          {withheld && (
            <p style={sbStyles.withheldNote} role="note">
              Below the {unit.sampleN}-interaction floor for a published % — showing the
              movement, withholding the headline claim. <SampleNote unit={unit} />
            </p>
          )}
          <div style={sbStyles.detailMeta}>
            <span style={sbStyles.detailMetaItem}>
              <span style={sbStyles.detailMetaKey}>Time to impact</span>
              <span style={sbStyles.detailMetaVal}>{unit.timeToImpact}</span>
            </span>
            <span style={sbStyles.detailMetaItem}>
              <span style={sbStyles.detailMetaKey}>Sample</span>
              <span style={sbStyles.detailMetaVal}>
                {unit.sampleN} of {unit.samplePool} interactions
              </span>
            </span>
            {unit.goal && (
              <span style={sbStyles.detailMetaItem}>
                <span style={sbStyles.detailMetaKey}>Mission goal</span>
                <span style={sbStyles.detailMetaVal}>
                  {unit.goal.label} · {unit.goal.hit ? "met" : "not met"}
                </span>
              </span>
            )}
          </div>

          <div style={sbStyles.metricsGrid}>
            {unit.metrics.map((m) => (
              <Card key={m.key} tone="outline" padX={16} padY={16}>
                <MetricMovement metric={m} unit={unit} />
              </Card>
            ))}
          </div>

          <div style={sbStyles.evidenceBlock}>
            <span style={sbStyles.detailLabel}>Attributed activities</span>
            <EvidenceList evidence={unit.evidence} />
          </div>

          <CaveatNote method={unit.method} />
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div style={sbStyles.empty}>
      <span className="material-symbols-outlined" style={sbStyles.emptyIcon} aria-hidden="true">
        query_stats
      </span>
      <span style={sbStyles.emptyTitle}>No measured units in this view yet</span>
      <span style={sbStyles.emptyBody}>
        Impact appears here once a completed intervention has a post-window of production
        metrics to compare against. Switch unit type or widen the window.
      </span>
    </div>
  );
}

const sbStyles = {
  page: { display: "flex", flexDirection: "column", gap: 24 },
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
  },
  tableHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "20px 24px 12px",
  },
  tableTitleWrap: { display: "flex", flexDirection: "column", gap: 2 },
  tableTitle: {
    margin: 0,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  tableSub: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  headerRow: {
    display: "grid",
    alignItems: "center",
    gap: 16,
    padding: "8px 24px",
    borderTop: "1px solid var(--color-border-tab)",
    borderBottom: "1px solid var(--color-border-tab)",
  },
  headCell: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
  },
  rowGroup: { borderBottom: "1px solid var(--table-row-border)" },
  row: {
    display: "grid",
    alignItems: "center",
    gap: 16,
    width: "100%",
    padding: "16px 24px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  unitCell: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  unitName: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  unitSub: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  unitTagRow: { marginTop: 2 },
  metricCell: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  metricLabel: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  metricMove: { display: "flex", alignItems: "baseline", gap: 6 },
  baseline: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  moveArrow: { color: "var(--color-text-placeholder)", fontSize: 13 },
  current: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 18,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  methodRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 2 },
  nWord: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  improveCell: { display: "flex" },
  confCell: { display: "flex" },
  chevronCell: { display: "flex", justifyContent: "center", alignItems: "center" },

  detail: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: "4px 24px 24px",
    background: "var(--color-card-emoji-bg)",
  },
  withheldNote: {
    margin: 0,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.5,
    color: "var(--color-warning-text)",
  },
  detailMeta: { display: "flex", flexWrap: "wrap", gap: 24, paddingTop: 12 },
  detailMetaItem: { display: "flex", flexDirection: "column", gap: 2 },
  detailMetaKey: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
  },
  detailMetaVal: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
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
