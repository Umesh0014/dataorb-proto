"use client";

import React from "react";
import Card from "./Card";
import ExportButton from "./ExportButton";
import AgentImpactChart from "./AgentImpactChart";
import { getAgentImpact, windowImpact, RANGES } from "./mocks/agentLearningImpact";

// AgentLearningImpact — "Learning Hub impact" section. One chart, two trend
// lines (QA score + CSAT, both %), with every Learning Hub activity marked
// along the time axis. The point: you can see practice — drills, guides,
// replays, probes, missions — translate into rising performance. A timeline
// switcher (1M…All) scopes the window. Read-only (G4).
//
// Per-agent on the Agent detail page (pass `agent`); for the whole team in the
// Command Center (pass a precomputed `fullImpact` from getTeamImpact plus a
// `title` / `subtitle`).
export default function AgentLearningImpact({ agent, fullImpact, title = "Learning Hub impact", subtitle }) {
  const [range, setRange] = React.useState("1Y");
  // The point under the scrubber; null = not scrubbing, so the headline shows
  // the latest (current) value. Set live from the chart as the cursor moves.
  const [scrub, setScrub] = React.useState(null);
  const full = React.useMemo(() => fullImpact || getAgentImpact(agent), [fullImpact, agent]);
  const view = React.useMemo(() => windowImpact(full, range), [full, range]);

  const changeRange = (next) => {
    setScrub(null);
    setRange(next);
  };
  const qaValue = scrub ? `${Math.round(scrub.qa)}%` : `${full.qaEnd}%`;
  const csatValue = scrub ? `${Math.round(scrub.csat)}%` : `${full.csatEnd}%`;
  const hasComposite = full.compositeEnd != null;
  const compositeValue = scrub && scrub.composite != null
    ? `${Math.round(scrub.composite)}`
    : `${full.compositeEnd}`;

  return (
    <Card padX={24} padY={24}>
      <div style={aliStyles.header}>
        <div>
          <div style={aliStyles.title}>{title}</div>
          <div style={aliStyles.subtitle}>
            {subtitle || (
              <>
                {full.firstName}&rsquo;s QA and CSAT scores since joining, with each Learning Hub
                activity marked — so you can see practice lift performance.
              </>
            )}
          </div>
        </div>
        <div style={aliStyles.headerRight}>
          <RangeSwitcher value={range} onChange={changeRange} />
          <ExportButton formats={["table-copy", "csv", "png"]} />
        </div>
      </div>

      <div style={aliStyles.legendRow}>
        {hasComposite && <LineKey color="var(--chart-lavender)" label="Composite" value={compositeValue} />}
        <LineKey color="var(--chart-green)" label="QA score" value={qaValue} />
        <LineKey color="var(--chart-blue)" label="CSAT" value={csatValue} />
      </div>

      <AgentImpactChart data={view} onScrub={setScrub} />
    </Card>
  );
}

// RangeSwitcher — compact segmented timeline scope (1M / 3M / 6M / 1Y / All).
// Raw <button>s: Button.jsx has no segmented variant and there is no shared
// SegmentedControl primitive yet (see eslint config note). Promote when a 2nd
// callsite needs it.
function RangeSwitcher({ value, onChange }) {
  return (
    <div style={rsStyles.group} role="group" aria-label="Timeline range">
      {RANGES.map((r) => {
        const on = r.id === value;
        return (
          <button
            key={r.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(r.id)}
            style={{
              ...rsStyles.seg,
              background: on ? "var(--surface-white)" : "transparent",
              color: on ? "var(--color-text-deep)" : "var(--color-text-tertiary)",
              boxShadow: on ? "var(--shadow-1)" : "none",
            }}
          >
            {r.id}
          </button>
        );
      })}
    </div>
  );
}

function LineKey({ color, label, value }) {
  return (
    <span style={aliStyles.lineKey}>
      <span style={{ ...aliStyles.lineSwatch, background: color }} aria-hidden="true" />
      <span style={aliStyles.lineKeyText}>
        <span style={aliStyles.lineLabel}>{label}</span>
        <span style={aliStyles.lineValue}>{value}</span>
      </span>
    </span>
  );
}

const rsStyles = {
  group: {
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
    padding: 3,
    borderRadius: 8,
    background: "var(--pill-bg)",
  },
  seg: {
    appearance: "none",
    border: "none",
    cursor: "pointer",
    height: 28,
    minWidth: 36,
    paddingInline: 10,
    borderRadius: 6,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 700,
    transition: "background 150ms ease, color 150ms ease",
  },
};

const aliStyles = {
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexShrink: 0,
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
    lineHeight: 1.5,
    maxWidth: 560,
  },
  legendRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 48,
    marginBottom: 16,
  },
  lineKey: { display: "inline-flex", alignItems: "center", gap: 12 },
  lineSwatch: {
    width: 18,
    height: 4,
    borderRadius: 2,
    flexShrink: 0,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  lineKeyText: { display: "flex", flexDirection: "column", gap: 2 },
  lineLabel: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  lineValue: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 40,
    fontWeight: 800,
    color: "var(--color-text-deep)",
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
  },
};
