"use client";

import React from "react";
import Card from "./Card";
import ExportButton from "./ExportButton";
import AgentImpactChart from "./AgentImpactChart";
import { getAgentImpact } from "./mocks/agentLearningImpact";

// AgentLearningImpact — "Learning Hub impact" section on the Agent detail page.
// One chart, two trend lines (QA score + CSAT, both %), with every Learning Hub
// activity the agent did marked along the time axis since they joined. The
// point: you can see practice — drills, guides, replays, probes, missions —
// translate into rising performance. Read-only (G4).

// Marker legend — maps each pin code to the activity it stands for.
const MARKER_LEGEND = [
  { code: "R", label: "Replay" },
  { code: "D", label: "Drill" },
  { code: "G", label: "Guide" },
  { code: "P", label: "Probe" },
  { code: "M", label: "Mission" },
];

export default function AgentLearningImpact({ agent }) {
  const data = React.useMemo(() => getAgentImpact(agent), [agent]);

  return (
    <Card padX={24} padY={24}>
      <div style={aliStyles.header}>
        <div>
          <div style={aliStyles.title}>Learning Hub impact</div>
          <div style={aliStyles.subtitle}>
            {data.firstName}&rsquo;s QA and CSAT scores since joining ({data.joinedLabel}),
            with each Learning Hub activity marked — so you can see practice lift performance.
          </div>
        </div>
        <ExportButton formats={["table-copy", "csv", "png"]} />
      </div>

      <div style={aliStyles.legend}>
        <LineKey color="var(--chart-green)" label="QA score" value={`${data.qaEnd}%`} />
        <LineKey color="var(--chart-blue)" label="CSAT" value={`${data.csatEnd}%`} />
        <span style={aliStyles.legendDivider} aria-hidden="true" />
        <span style={aliStyles.markerLead}>Activities</span>
        {MARKER_LEGEND.map((m) => (
          <span key={m.code} style={aliStyles.markerKey}>
            <span style={aliStyles.markerPin} aria-hidden="true">{m.code}</span>
            {m.label}
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
    marginBottom: 16,
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
  legend: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 8,
  },
  lineKey: { display: "inline-flex", alignItems: "center", gap: 6 },
  lineSwatch: {
    width: 14,
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
  legendDivider: {
    width: 1,
    height: 16,
    background: "var(--color-divider-card)",
  },
  markerLead: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  markerKey: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  markerPin: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 18,
    height: 18,
    borderRadius: 9,
    background: "var(--grey-800)",
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: 800,
  },
};
