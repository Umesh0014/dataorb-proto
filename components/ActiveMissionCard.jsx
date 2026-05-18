"use client";

import React from "react";
import { Clipboard, Clock, BadgeCheck, Sparkles, ChevronRight } from "lucide-react";
import Card from "./Card";

// Spider chart geometry.
const CHART_W = 240;
const CHART_H = 190;
const CX = CHART_W / 2;
const CY = CHART_H / 2;
const RADIUS = 52;
const RINGS = [25, 50, 75, 100];

// ActiveMissionCard — one active mission, rendered as a card-within-the-card:
// header (title + roleplay / days-left meta) and a two-column body with a
// spider chart (target vs. actual) on the left and a focus-area list right.
export default function ActiveMissionCard({ mission }) {
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
        </div>
      </div>

      <div style={amStyles.body}>
        <MissionSpiderChart focusAreas={mission.focusAreas} />
        <FocusAreaList focusAreas={mission.focusAreas} />
      </div>
    </Card>
  );
}

// MissionSpiderChart — hand-rolled SVG radar. Target polygon (dashed neutral)
// is the set criteria; actual polygon (accent fill) is current performance.
// Colours mirror the Roleplay coverage line chart (actual) and the Quality
// adherence org-average dashed line (target).
function MissionSpiderChart({ focusAreas }) {
  const n = focusAreas.length;
  const angleAt = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pointAt = (i, value) => {
    const r = (value / 100) * RADIUS;
    const a = angleAt(i);
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  };
  const polygon = (key) =>
    focusAreas.map((fa, i) => pointAt(i, fa[key]).map((v) => v.toFixed(1)).join(",")).join(" ");

  return (
    <div style={amStyles.spiderWrap}>
      <svg width={CHART_W} height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
        {RINGS.map((lvl) => (
          <polygon
            key={lvl}
            points={focusAreas.map((_, i) => pointAt(i, lvl).map((v) => v.toFixed(1)).join(",")).join(" ")}
            fill="none"
            style={{ stroke: "var(--color-divider-card)" }}
            strokeWidth={1}
          />
        ))}
        {focusAreas.map((_, i) => {
          const [x, y] = pointAt(i, 100);
          return (
            <line
              key={i}
              x1={CX}
              y1={CY}
              x2={x}
              y2={y}
              style={{ stroke: "var(--color-divider-card)" }}
              strokeWidth={1}
            />
          );
        })}

        {/* Target polygon — the set criteria. Outline only.
            TODO: confirm whether the target polygon should be filled. */}
        <polygon
          points={polygon("target")}
          fill="none"
          style={{ stroke: "var(--chart-grey)" }}
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />

        {/* Actual polygon — current performance. */}
        <polygon
          points={polygon("actual")}
          style={{ stroke: "var(--chart-blue)", fill: "var(--nav-rail-active-bg)" }}
          strokeWidth={2}
        />

        {focusAreas.map((fa, i) => {
          const a = angleAt(i);
          const lr = RADIUS + 15;
          const lx = CX + lr * Math.cos(a);
          const ly = CY + lr * Math.sin(a);
          const cos = Math.cos(a);
          const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
          // TODO: confirm axis-label truncation behaviour for long focus-area names.
          const label = fa.name.length > 13 ? `${fa.name.slice(0, 12)}…` : fa.name;
          return (
            <text
              key={fa.id}
              x={lx}
              y={ly + 3}
              textAnchor={anchor}
              fontSize={11}
              style={{ fill: "var(--text-secondary)" }}
            >
              {label}
            </text>
          );
        })}
      </svg>

      <div style={amStyles.legend}>
        <span style={amStyles.legendItem}>
          <span style={amStyles.legendDashed} />
          <span style={amStyles.legendLabel}>Target</span>
        </span>
        <span style={amStyles.legendItem}>
          <span style={amStyles.legendSolid} />
          <span style={amStyles.legendLabel}>Actual</span>
        </span>
      </div>
    </div>
  );
}

function FocusAreaList({ focusAreas }) {
  return (
    <div style={amStyles.faList}>
      {focusAreas.map((fa) => {
        const Icon = fa.isAiInsight ? Sparkles : BadgeCheck;
        return (
          <div
            key={fa.id}
            onClick={
              fa.drillable
                ? () => {
                    // TODO: drill into focus area detail
                  }
                : undefined
            }
            style={{ ...amStyles.faRow, cursor: fa.drillable ? "pointer" : "default" }}
          >
            <span style={amStyles.faName}>
              <Icon size={14} style={{ flexShrink: 0, color: "var(--color-icon-tertiary-fg)" }} />
              <span style={amStyles.faNameText}>{fa.name}</span>
            </span>
            <span style={amStyles.faTarget}>{fa.target}%</span>
            <span style={amStyles.faProgress}>
              <ProgressBar value={fa.actual} />
              <span style={amStyles.faActual}>{fa.actual}%</span>
            </span>
            <span style={amStyles.faStatus}>
              <StatusPill status={fa.status} gapPct={fa.gapPct} />
            </span>
            <span style={amStyles.faChevron}>
              {fa.drillable && <ChevronRight size={16} style={{ color: "var(--color-text-tertiary)" }} />}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ProgressBar — threshold-coloured fill; mirrors the Quality adherence bar.
function ProgressBar({ value }) {
  const color =
    value < 50
      ? "var(--color-error)"
      : value < 80
      ? "var(--color-warning)"
      : "var(--color-success)";
  return (
    <span style={amStyles.barTrack}>
      <span style={{ ...amStyles.barFill, width: `${value}%`, background: color }} />
    </span>
  );
}

// StatusPill — "Met" / "Below {gap}%" chip.
// TODO: confirm gap-percentage formula for status pills with Akash.
function StatusPill({ status, gapPct }) {
  if (status === "met") {
    return (
      <span style={{ ...amStyles.pill, background: "var(--color-success-bg)", color: "var(--color-success)" }}>
        Met
      </span>
    );
  }
  return (
    <span style={{ ...amStyles.pill, background: "var(--color-warning-bg)", color: "var(--color-warning)" }}>
      {gapPct != null ? `Below ${gapPct}%` : "Below"}
    </span>
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
  body: {
    display: "flex",
    alignItems: "flex-start",
    gap: 24,
    marginTop: 16,
  },
  spiderWrap: {
    flexShrink: 0,
    width: CHART_W,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  legend: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    marginTop: 4,
  },
  legendItem: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  legendSolid: {
    width: 16,
    height: 2,
    borderRadius: 1,
    background: "var(--chart-blue)",
  },
  legendDashed: {
    width: 16,
    borderTop: "2px dashed var(--chart-grey)",
  },
  legendLabel: {
    fontSize: 12,
    color: "var(--color-text-tertiary)",
  },
  faList: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
  },
  faRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    height: 48,
    borderBottom: "1px solid var(--table-row-border)",
  },
  faName: {
    flex: 1,
    minWidth: 0,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  faNameText: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--do-ink)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  faTarget: {
    width: 44,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  faProgress: {
    width: 150,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  barTrack: {
    flex: 1,
    minWidth: 0,
    height: 4,
    borderRadius: 2,
    background: "var(--table-header-border)",
    overflow: "hidden",
  },
  barFill: {
    display: "block",
    height: "100%",
    borderRadius: 2,
  },
  faActual: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--do-ink)",
    flexShrink: 0,
  },
  faStatus: {
    width: 104,
    flexShrink: 0,
    display: "flex",
  },
  faChevron: {
    width: 16,
    flexShrink: 0,
    display: "flex",
    justifyContent: "flex-end",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
  },
};
