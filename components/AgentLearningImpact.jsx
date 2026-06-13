"use client";

import React from "react";
import Card from "./Card";
import ExportButton from "./ExportButton";
import AgentImpactChart, { ActivityIcon } from "./AgentImpactChart";
import { getAgentImpact } from "./mocks/agentLearningImpact";

// AgentLearningImpact — "Learning Hub impact" section on the Agent detail page.
// One chart, two trend lines (QA score + CSAT, both %), with every Learning Hub
// activity the agent did marked along the time axis since they joined. The
// point: you can see practice — drills, guides, replays, probes, missions —
// translate into rising performance. Read-only (G4).

// Activity types shown as marker pins on the chart, listed in the legend.
const ACTIVITY_TYPES = ["Replay", "Drill", "Guide", "Probe", "Mission"];

export default function AgentLearningImpact({ agent }) {
  const data = React.useMemo(() => getAgentImpact(agent), [agent]);

  return (
    <Card padX={24} padY={24}>
      <div style={aliStyles.header}>
        <div>
          <div style={aliStyles.title}>Learning Hub impact</div>
          <div style={aliStyles.subtitle}>
            {data.firstName}&rsquo;s QA and CSAT scores since joining, with each Learning Hub
            activity marked — so you can see practice lift performance.
          </div>
        </div>
        <ExportButton formats={["table-copy", "csv", "png"]} />
      </div>

      <div style={aliStyles.legendRow}>
        <LineKey color="var(--chart-green)" label="QA score" value={`${data.qaEnd}%`} />
        <LineKey color="var(--chart-blue)" label="CSAT" value={`${data.csatEnd}%`} />
      </div>

      <div style={aliStyles.markerRow}>
        <span style={aliStyles.markerLead}>Learning Hub activity</span>
        {ACTIVITY_TYPES.map((kind) => (
          <span key={kind} style={aliStyles.markerKey}>
            <span style={aliStyles.markerPin} aria-hidden="true">
              <ActivityIcon kind={kind} size={12} />
            </span>
            {kind}
          </span>
        ))}
      </div>

      <AgentImpactChart data={data} />
    </Card>
  );
}

function LineKey({ color, label, value }) {
  return (
    <span style={aliStyles.lineKey}>
      <span style={{ ...aliStyles.lineSwatch, background: color }} aria-hidden="true" />
      <span style={aliStyles.lineLabel}>{label}</span>
      <span style={aliStyles.lineValue}>{value}</span>
    </span>
  );
}

const aliStyles = {
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
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
    maxWidth: 600,
  },
  legendRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 28,
    marginBottom: 12,
  },
  lineKey: { display: "inline-flex", alignItems: "center", gap: 8 },
  lineSwatch: {
    width: 16,
    height: 3,
    borderRadius: 2,
    flexShrink: 0,
  },
  lineLabel: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  lineValue: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  markerRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 18,
    paddingTop: 14,
    marginBottom: 8,
    borderTop: "1px solid var(--color-divider-card)",
  },
  markerLead: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    letterSpacing: "0.02em",
  },
  markerKey: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  markerPin: {
    display: "grid",
    placeItems: "center",
    width: 22,
    height: 22,
    borderRadius: 11,
    background: "var(--grey-800)",
    flexShrink: 0,
  },
};

