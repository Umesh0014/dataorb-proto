"use client";

import React from "react";
import { Clipboard, Clock, BadgeCheck, Sparkles, ArrowRight } from "lucide-react";
import Button from "./Button";
import Card from "./Card";

// ActiveMissionCard — one active mission, rendered as a card-within-the-card:
// header (title + roleplay / days-left meta) and a body containing the
// mission's focus-area table.
export default function ActiveMissionCard({ mission, onViewMission }) {
  // TODO: confirm days-left urgency threshold (red at <= 3 days for now).
  const urgent = mission.daysLeft <= 3;

  return (
    <Card tone="muted">
      <div style={amStyles.header}>
        <span style={amStyles.title}>{mission.title}</span>
        <div style={amStyles.meta}>
          <span style={amStyles.metaItem}>
            <Clipboard size={14} />
            {mission.roleplaysCompleted}/{mission.roleplaysTotal} Roleplays
          </span>
          <span
            style={{
              ...amStyles.metaItem,
              color: urgent ? "var(--color-error)" : "var(--color-text-tertiary)",
            }}
          >
            <Clock size={14} />
            {mission.daysLeft} days left
          </span>
          <Button
            variant="text"
            uppercase={false}
            trailingIcon={<ArrowRight size={14} />}
            style={amStyles.viewCta}
            onClick={() => onViewMission?.(mission.pageMissionId)}
          >
            View mission
          </Button>
        </div>
      </div>

      <div style={amStyles.body}>
        <FocusAreaTable focusAreas={mission.focusAreas} />
      </div>
    </Card>
  );
}

// FA_COLS — four-column layout for the focus-area table. Proportions follow
// the Quality adherence By Metric / By Skills table, with the Achieved
// column widened so the progress bar dominates.
// TODO: confirm column widths inside the Active Missions table read well at typical viewport widths
const FA_COLS = [
  { key: "name", label: "Focus Area", width: "32%" },
  { key: "target", label: "Target", width: "12%" },
  { key: "achieved", label: "Achieved", width: "34%" },
  { key: "status", label: "Status", width: "22%", align: "right" },
];

// FocusAreaTable — the mission's focus areas as a structured table that
// reads like the Quality adherence By Metric / By Skills tables: a header
// row, fixed column widths, divider lines, and per-row hover. Each mission
// sub-card renders its own header row.
function FocusAreaTable({ focusAreas }) {
  return (
    <div style={amStyles.faList}>
      <table style={amStyles.table}>
        <colgroup>
          {FA_COLS.map((c) => (
            <col key={c.key} style={{ width: c.width }} />
          ))}
        </colgroup>
        <thead>
          <tr style={amStyles.headRow}>
            {FA_COLS.map((c) => (
              <th
                key={c.key}
                scope="col"
                style={{ ...amStyles.th, textAlign: c.align || "left" }}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {focusAreas.map((fa, i) => (
            <FocusAreaRow key={fa.id} fa={fa} isLast={i === focusAreas.length - 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FocusAreaRow({ fa, isLast }) {
  const [hover, setHover] = React.useState(false);
  const Icon = fa.isAiInsight ? Sparkles : BadgeCheck;
  return (
    <tr
      onClick={
        fa.drillable
          ? () => {
              // TODO: drill into focus area detail
            }
          : undefined
      }
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...amStyles.row,
        cursor: fa.drillable ? "pointer" : "default",
        borderBottom: isLast ? "none" : "1px solid var(--table-row-border)",
        background: fa.drillable && hover ? "var(--table-row-hover)" : "transparent",
      }}
    >
      <td style={amStyles.cell}>
        <span style={amStyles.faName}>
          <Icon size={14} style={{ flexShrink: 0, color: "var(--color-icon-tertiary-fg)" }} />
          <span style={amStyles.faNameText}>{fa.name}</span>
        </span>
      </td>
      <td style={amStyles.cell}>
        <span style={amStyles.faTarget}>{fa.target}%</span>
      </td>
      <td style={amStyles.cell}>
        <span style={amStyles.achievedCell}>
          <ProgressBar value={fa.actual} targetPct={fa.target} />
          <span style={amStyles.faActual}>{fa.actual}%</span>
        </span>
      </td>
      <td style={amStyles.cell}>
        <span style={amStyles.statusCell}>
          <StatusPill status={fa.status} gapPct={fa.gapPct} actual={fa.actual} />
        </span>
      </td>
    </tr>
  );
}

// thresholdTone — shared bar-fill / status-pill banding. Matches the
// Quality adherence By Metric / By Skills table: <50 low, 50–79 mid,
// >=80 high. Routing both the progress bar and the status pill through
// this keeps their colours in agreement.
// TODO: confirm the exact threshold breakpoints match Quality Adherence's table
function thresholdTone(value) {
  if (value < 50) {
    return { fill: "var(--color-error)", bg: "var(--color-error-bg)", fg: "var(--color-error)" };
  }
  if (value < 80) {
    return { fill: "var(--color-warning)", bg: "var(--color-warning-bg)", fg: "var(--color-warning)" };
  }
  return { fill: "var(--color-success)", bg: "var(--color-success-bg)", fg: "var(--color-success)" };
}

// ProgressBar — threshold-coloured fill plus a 1px tick on the track at the
// target %, so the gap between actual and target reads at a glance.
// TODO: confirm target tick treatment with Akash if extending the bar primitive
function ProgressBar({ value, targetPct }) {
  return (
    <span style={amStyles.barTrack}>
      <span
        style={{ ...amStyles.barFill, width: `${value}%`, background: thresholdTone(value).fill }}
      />
      {targetPct != null && <span style={{ ...amStyles.barTick, left: `${targetPct}%` }} />}
    </span>
  );
}

// StatusPill — "Met" / "Below {gap}%" chip. Text comes from the focus
// area's status; the colour is routed through the shared threshold tone so
// the pill always agrees with the Achieved progress bar.
// TODO: confirm gap-percentage formula for status pills with Akash.
function StatusPill({ status, gapPct, actual }) {
  const tone = thresholdTone(actual);
  const label = status === "met" ? "Met" : gapPct != null ? `Below ${gapPct}%` : "Below";
  return (
    <span style={{ ...amStyles.pill, background: tone.bg, color: tone.fg }}>{label}</span>
  );
}

const amStyles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--do-ink)",
  },
  meta: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexShrink: 0,
  },
  metaItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  viewCta: {
    color: "var(--color-button-primary-bg)",
    flexShrink: 0,
  },
  body: {
    marginTop: 16,
  },
  faList: {
    flex: 1,
    minWidth: 0,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontFamily: "var(--font-sans)",
  },
  headRow: {
    borderBottom: "1px solid var(--table-header-border)",
  },
  th: {
    padding: "14px 0",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "0.2px",
    whiteSpace: "nowrap",
  },
  row: {
    height: 56,
    transition: "background 120ms ease",
  },
  cell: {
    padding: 0,
    verticalAlign: "middle",
  },
  faName: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    minWidth: 0,
  },
  faNameText: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--do-ink)",
    minWidth: 0,
  },
  faTarget: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  achievedCell: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    paddingRight: 16,
  },
  barTrack: {
    flex: 1,
    minWidth: 0,
    height: 4,
    borderRadius: 2,
    background: "var(--table-header-border)",
    overflow: "hidden",
    position: "relative",
  },
  barFill: {
    display: "block",
    height: "100%",
    borderRadius: 2,
  },
  barTick: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    background: "var(--text-secondary)",
  },
  faActual: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--do-ink)",
    flexShrink: 0,
  },
  statusCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    width: "100%",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
};
