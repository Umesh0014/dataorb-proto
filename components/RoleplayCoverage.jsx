"use client";

import React from "react";
import { Download } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import InlineNBA from "./InlineNBA";
import TabsRow from "./TabsRow";
import ContactDriverTable from "./ContactDriverTable";
import useMeasuredWidth from "./useMeasuredWidth";
import { INLINE_NBA } from "./mocks/nextBestActions";

// Seed data for the Activity tab. Each point:
//   date      ISO date string — formatted at render time
//   roleplays number          — total roleplays for the day
//   drivers   [{ name, count }] — contact-driver breakdown shown in the tooltip
const activityData = [
  { date: "2026-03-20", roleplays: 7, drivers: [
    { name: "Proper greeting protocol", count: 3 },
    { name: "Empathy and patience", count: 2 },
    { name: "Data privacy protocols", count: 2 },
  ] },
  { date: "2026-03-21", roleplays: 11, drivers: [
    { name: "Proper greeting protocol", count: 5 },
    { name: "Empathy and patience", count: 4 },
    { name: "Data privacy protocols", count: 2 },
  ] },
  { date: "2026-03-22", roleplays: 9, drivers: [
    { name: "Proper greeting protocol", count: 4 },
    { name: "Empathy and patience", count: 3 },
    { name: "Data privacy protocols", count: 2 },
  ] },
  { date: "2026-03-23", roleplays: 11, drivers: [
    { name: "Proper greeting protocol", count: 4 },
    { name: "Empathy and patience", count: 4 },
    { name: "Data privacy protocols", count: 3 },
  ] },
  { date: "2026-03-24", roleplays: 17, drivers: [
    { name: "Proper greeting protocol", count: 6 },
    { name: "Empathy and patience", count: 6 },
    { name: "Data privacy protocols", count: 5 },
  ] },
  { date: "2026-03-25", roleplays: 16, drivers: [
    { name: "Proper greeting protocol", count: 6 },
    { name: "Empathy and patience", count: 5 },
    { name: "Data privacy protocols", count: 5 },
  ] },
  { date: "2026-03-26", roleplays: 16, drivers: [
    { name: "Proper greeting protocol", count: 6 },
    { name: "Empathy and patience", count: 5 },
    { name: "Data privacy protocols", count: 5 },
  ] },
];

// TODO: confirm target source — per-agent, per-mission, or org-wide.
// Hardcoded constant for the prototype.
const targetRoleplays = 20;

const TABS = [
  { id: "activity", label: "Activity" },
  { id: "driver", label: "By contact driver" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Fixed chart region height — structural; mirrors ChannelEngagementCard's
// `height` chart prop. The codebase has no height token scale.
const CHART_HEIGHT = 300;

// RoleplayCoverage — interior of the Agent Profile "Roleplay coverage"
// card: title + subtitle + download action, two sub-tabs, and a roleplay-
// volume line chart on the Activity tab. Self-contained <Card>, mirroring
// ChannelEngagementCard and the other DataOrb metric cards.
export default function RoleplayCoverage({
  data = activityData,
  target = targetRoleplays,
  onNbaAssign,
}) {
  const [tab, setTab] = React.useState("activity");

  // TODO: confirm whether the chart should respect the global page-level
  // date filter once that filter is wired.

  // TODO: confirm subtitle copy variants with Akash — "session" (Activity)
  // vs "interaction" (By contact driver) wording is deliberate.
  const subtitle =
    tab === "driver"
      ? "Track how every interaction measures up against your quality, process, and performance standards."
      : "Track how every session measures up against your quality, process, and performance standards.";

  return (
    <Card>
      <div style={rcStyles.header}>
        <div>
          <div style={rcStyles.title}>Roleplay coverage</div>
          <div style={rcStyles.subtitle}>{subtitle}</div>
        </div>
        <Button
          variant="text"
          uppercase={false}
          leadingIcon={<Download size={16} />}
          onClick={() => {
            // TODO: export roleplay coverage as CSV
          }}
        >
          Download
        </Button>
      </div>

      <InlineNBA
        text={INLINE_NBA.roleplay.text}
        ctaLabel={INLINE_NBA.roleplay.ctaLabel}
        onAction={() =>
          onNbaAssign?.({
            name: INLINE_NBA.roleplay.asset,
            duration: INLINE_NBA.roleplay.duration,
          })
        }
      />

      <div style={rcStyles.tabs}>
        <TabsRow tabs={TABS} activeTab={tab} onTabClick={setTab} />
      </div>

      {tab === "activity" ? (
        <RoleplayChart data={data} target={target} />
      ) : (
        <ContactDriverTable />
      )}
    </Card>
  );
}

// RoleplayChart — hand-rolled SVG line chart, mirroring the chart treatment
// in ChannelEngagementCard (measured width, padding, gridlines, axis text).
function RoleplayChart({ data, target }) {
  const [ref, width] = useMeasuredWidth(0);
  const [hover, setHover] = React.useState(null); // { index, rect }

  const pad = { top: 16, right: 20, bottom: 36, left: 56 };
  const innerW = Math.max(0, width - pad.left - pad.right);
  const innerH = CHART_HEIGHT - pad.top - pad.bottom;

  // Auto-fit the Y scale above both the data max and the target, with
  // headroom so the target line is not pinned to the top edge.
  const dataMax = Math.max(...data.map((d) => d.roleplays), target);
  const maxY = Math.max(10, Math.ceil((dataMax * 1.2) / 10) * 10);
  const labelsY = [0, 1, 2, 3].map((i) => Math.round((maxY / 3) * i));

  const xAt = (i) =>
    pad.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const yAt = (v) => pad.top + innerH - (v / maxY) * innerH;

  const points = data.map((d, i) => ({ x: xAt(i), y: yAt(d.roleplays) }));
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const targetY = yAt(target);

  return (
    <div ref={ref} style={rcStyles.chartWrap}>
      {width > 0 && (
        <svg
          width={width}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
          style={{ display: "block" }}
        >
          {labelsY.map((v) => {
            const y = yAt(v);
            return (
              <g key={v}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={width - pad.right}
                  y2={y}
                  style={{ stroke: "var(--table-header-border)" }}
                  strokeWidth={1}
                />
                <text
                  x={pad.left - 12}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={11}
                  style={{ fill: "var(--text-disabled)" }}
                >
                  {v}
                </text>
              </g>
            );
          })}

          <text
            x={16}
            y={pad.top + innerH / 2}
            textAnchor="middle"
            fontSize={11}
            style={{ fill: "var(--text-disabled)" }}
            transform={`rotate(-90, 16, ${pad.top + innerH / 2})`}
          >
            Roleplays
          </text>

          {/* Target reference line.
              TODO: confirm reference-line styling — no existing reference-
              line pattern in the codebase; a neutral dashed line is used. */}
          <line
            x1={pad.left}
            y1={targetY}
            x2={width - pad.right}
            y2={targetY}
            style={{ stroke: "var(--grey-500)" }}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <text
            x={width - pad.right}
            y={targetY - 6}
            textAnchor="end"
            fontSize={11}
            style={{ fill: "var(--color-text-tertiary)" }}
          >
            Target {target}
          </text>

          <path
            d={linePath}
            fill="none"
            style={{ stroke: "var(--chart-blue)" }}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hover && hover.index === i ? 6 : 4}
                style={{ fill: "var(--surface-white)", stroke: "var(--chart-blue)" }}
                strokeWidth={2}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={16}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) =>
                  setHover({ index: i, rect: e.currentTarget.getBoundingClientRect() })
                }
                onMouseLeave={() => setHover(null)}
                onClick={() => {
                  // TODO: drill into roleplays for this date
                }}
              />
            </g>
          ))}

          {points.map((p, i) => {
            const last = data.length - 1;
            const anchor = i === 0 ? "start" : i === last ? "end" : "middle";
            return (
              <text
                key={i}
                x={p.x}
                y={CHART_HEIGHT - 12}
                textAnchor={anchor}
                fontSize={11}
                style={{ fill: "var(--text-disabled)" }}
              >
                {formatDate(data[i].date)}
              </text>
            );
          })}
        </svg>
      )}
      {hover && <ChartTooltip rect={hover.rect} point={data[hover.index]} />}
    </div>
  );
}

// ChartTooltip — per-point hover card: "Roleplays" header + the day's
// contact-driver breakdown. Position:fixed so it is never clipped.
function ChartTooltip({ rect, point }) {
  return (
    <Card
      shadow
      padX={16}
      padY={14}
      style={{
        position: "fixed",
        left: rect.left + rect.width / 2,
        top: rect.bottom + 8,
        transform: "translateX(-50%)",
        width: 248,
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      <div style={rcStyles.tipHeader}>Roleplays</div>
      <div style={rcStyles.tipDate}>{formatDate(point.date)}</div>
      <div style={rcStyles.tipDivider} />
      <div style={rcStyles.tipList}>
        {point.drivers.map((dr) => (
          <div key={dr.name} style={rcStyles.tipRow}>
            <span style={rcStyles.tipName}>{dr.name}</span>
            <span style={rcStyles.tipCount}>{dr.count}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// formatDate — ISO date → "DD MMM YYYY" (e.g. "20 Mar 2026").
function formatDate(iso) {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${day} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const rcStyles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--text-secondary)",
    lineHeight: 1.4,
  },
  tabs: {
    marginTop: 16,
  },
  chartWrap: {
    position: "relative",
    width: "100%",
    marginTop: 16,
  },
  tipHeader: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  tipDate: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--text-secondary)",
    marginTop: 2,
  },
  tipDivider: {
    height: 1,
    background: "var(--color-divider-card)",
    margin: "10px 0",
  },
  tipList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  tipRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  tipName: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  tipCount: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
};
