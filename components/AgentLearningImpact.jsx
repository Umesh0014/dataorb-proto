"use client";

import React from "react";
import Card from "./Card";
import ExportButton from "./ExportButton";
import {
  MethodBadge,
  ConfidenceBadge,
  SampleNote,
  MetricMovement,
  EvidenceList,
  CaveatNote,
} from "./LearningImpactParts";
import { getAgentImpact } from "./mocks/agentLearningImpact";

// AgentLearningImpact — "Learning impact" section on the Agent detail page.
// Sits below the overall performance score and answers two questions for this
// one agent: how did Learning Hub move their production performance (baseline →
// current, per metric), and when did they get help from Learning Hub (the
// drill / guide / replay / probe / mission timeline). Read-only grounding —
// no employment-decision framing (G4). All atoms reuse LearningImpactParts so
// the honesty rules (method + caveat, confidence text, "N of M" sample,
// withheld-% under the floor) hold here exactly as on the rollup.

export default function AgentLearningImpact({ agent }) {
  const impact = React.useMemo(() => getAgentImpact(agent), [agent]);

  return (
    <Card padX={24} padY={24}>
      <div style={aliStyles.header}>
        <div>
          <div style={aliStyles.title}>Learning impact</div>
          <div style={aliStyles.subtitle}>
            When {impact.firstName} got help from Learning Hub — and how it moved
            production performance over the {impact.window.toLowerCase()}.
          </div>
        </div>
        <ExportButton formats={["table-copy", "csv", "pdf"]} />
      </div>

      <div style={aliStyles.metaRow}>
        <MethodBadge method={impact.method} />
        <ConfidenceBadge level={impact.confidence} />
        <SampleNote unit={impact} />
        <span style={aliStyles.metaDot} aria-hidden="true">·</span>
        <span style={aliStyles.ttImpact}>moved in {impact.timeToImpact}</span>
      </div>

      <div style={aliStyles.block}>
        <span style={aliStyles.blockLabel}>What moved</span>
        <div style={aliStyles.metricsGrid}>
          {impact.metrics.map((m) => (
            <Card key={m.key} tone="outline" padX={20} padY={18}>
              <MetricMovement metric={m} unit={impact} />
            </Card>
          ))}
        </div>
      </div>

      <div style={aliStyles.block}>
        <span style={aliStyles.blockLabel}>Help from Learning Hub</span>
        <span style={aliStyles.blockSub}>
          The activities {impact.firstName} completed, newest first.
        </span>
        <EvidenceList
          evidence={impact.interventions.map((i) => ({
            kind: i.kind,
            activity: i.title,
            date: i.date,
            state: i.state,
          }))}
        />
      </div>

      <CaveatNote method={impact.method} />
    </Card>
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
    lineHeight: 1.4,
    maxWidth: 560,
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 20,
    borderBottom: "1px solid var(--color-divider-card)",
  },
  metaDot: { color: "var(--color-text-placeholder)" },
  ttImpact: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  block: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingTop: 20,
  },
  blockLabel: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  blockSub: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    marginTop: -4,
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  },
};
