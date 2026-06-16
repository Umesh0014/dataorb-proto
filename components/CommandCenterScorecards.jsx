"use client";

import React from "react";
import Card from "./Card";
import { ChevronRight } from "lucide-react";
import InlineStatusAffordance from "./InlineStatusAffordance";
import ScoreTrend from "./ScoreTrend";
import CommandCenterScoreboard from "./CommandCenterScoreboard";
import CommandCenterTasks from "./CommandCenterTasks";
import { TEAM_ROSTER, ENGAGEMENT_META, rosterStatus, toneInk } from "./mocks/commandCenter";

// CommandCenterScorecards (Variant B) — the same dashboard with the roster as
// a scorecard grid: each agent's CSAT + composite as number + trendline +
// dotted target, at a glance. Clicking a card opens the agent's detail page;
// actions live in the Tasks section above.
export default function CommandCenterScorecards({
  items,
  onLaunch,
  onOpenAgent,
  onSnooze,
  onDismiss,
  onMarkHandled,
}) {
  const ordered = React.useMemo(() => orderRoster(TEAM_ROSTER), []);
  const taskProps = { items, onLaunch, onOpenAgent, onSnooze, onDismiss, onMarkHandled };

  return (
    <div style={sStyles.page}>
      <CommandCenterScoreboard subtitle="Scorecard view — every agent's CSAT and composite at a glance" />
      <CommandCenterTasks {...taskProps} />

      <section style={sStyles.section}>
        <h2 style={sStyles.heading}>Agents</h2>
        <div style={sStyles.grid}>
          {ordered.map((agent) => (
            <AgentScorecard key={agent.id} agent={agent} onOpenAgent={onOpenAgent} />
          ))}
        </div>
      </section>
    </div>
  );
}

function AgentScorecard({ agent, onOpenAgent }) {
  const eng = ENGAGEMENT_META[agent.engagement];
  return (
    <Card tone="outline" padX={0} padY={0}>
      <button
        type="button"
        className="cc-focusable"
        onClick={() => onOpenAgent?.(agent.id)}
        style={sStyles.card}
        aria-label={`Open ${agent.name}'s detail page`}
      >
        <div style={sStyles.head}>
          <span style={sStyles.avatar}>{agent.initials}</span>
          <div style={sStyles.identity}>
            <span style={sStyles.name}>{agent.name}</span>
            <InlineStatusAffordance tone={eng.tone} icon={<Dot tone={eng.tone} />} style={{ color: toneInk(eng.tone) }}>
              {eng.label}
            </InlineStatusAffordance>
          </div>
          <ChevronRight size={18} aria-hidden="true" style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }} />
        </div>
        <div style={sStyles.scores}>
          <ScoreTrend label="CSAT" value={`${agent.csat}%`} unit="%" points={agent.csatTrend} target={agent.csatTarget} width={92} />
          <ScoreTrend label="Composite" value={`${agent.composite}`} points={agent.compositeTrend} target={agent.target} width={92} />
        </div>
      </button>
    </Card>
  );
}

function Dot({ tone }) {
  const color = {
    danger: "var(--color-error)", warning: "var(--color-warning)",
    info: "var(--color-info)", success: "var(--color-success)", tertiary: "var(--color-text-tertiary)",
  }[tone] || "var(--color-text-tertiary)";
  return <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

function orderRoster(roster) {
  return [...roster].sort((a, b) => {
    const aHelp = rosterStatus(a) === "needs_help" ? 0 : 1;
    const bHelp = rosterStatus(b) === "needs_help" ? 0 : 1;
    if (aHelp !== bHelp) return aHelp - bHelp;
    return aHelp === 0 ? a.composite - b.composite : b.composite - a.composite;
  });
}

const sStyles = {
  page: { display: "flex", flexDirection: "column", gap: 28 },
  section: { display: "flex", flexDirection: "column", gap: 14 },
  heading: { margin: 0, fontFamily: "var(--font-sans)", fontSize: 17, fontWeight: 700, color: "var(--color-text-deep)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, alignItems: "start" },
  card: {
    display: "flex", flexDirection: "column", gap: 16, width: "100%",
    background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
    padding: 18, borderRadius: 8,
  },
  head: { display: "flex", alignItems: "center", gap: 12 },
  avatar: {
    flexShrink: 0, width: 40, height: 40, borderRadius: "50%",
    background: "var(--grey-100)", color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  },
  identity: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1 },
  name: { fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  scores: { display: "flex", gap: 20, flexWrap: "wrap" },
};
