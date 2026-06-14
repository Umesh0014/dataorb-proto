"use client";

import React from "react";
import { CheckCircle2, Target } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import InlineStatusAffordance from "./InlineStatusAffordance";
import CommandCenterTeamStrip from "./CommandCenterTeamStrip";
import { ScoreBar } from "./AgentScoreRow";
import {
  TEAM_ROSTER, ENGAGEMENT_META, INTERVENTION_META, rosterStatus, rankItems, toneInk,
} from "./mocks/commandCenter";

// CommandCenterScorecards (Variant B) — the same agent-roster dashboard as a
// scorecard grid. Team metrics on top, then one card per agent: CSAT,
// composite-vs-target bar, and the single highest-priority action with a
// 1-click launch. Denser at-a-glance read than the expandable roster;
// per-agent detail still reaches the shared drawer via "Details".

export default function CommandCenterScorecards({
  items,
  onLaunch,
  onOpenDetail,
  onOpenAgent,
}) {
  const ordered = React.useMemo(() => orderRoster(TEAM_ROSTER), []);
  const itemsFor = (agentId) => rankItems(items.filter((it) => it.agent.id === agentId));

  return (
    <div style={sStyles.page}>
      <CommandCenterTeamStrip subtitle="Scorecard view — every agent's CSAT, composite score, and next action" />
      <h2 style={sStyles.heading}>Agents</h2>
      <div style={sStyles.grid}>
        {ordered.map((agent) => {
          const agentItems = itemsFor(agent.id);
          return (
            <AgentScorecard
              key={agent.id}
              agent={agent}
              topItem={agentItems[0] || null}
              actionCount={agentItems.length}
              onLaunch={onLaunch}
              onOpenDetail={onOpenDetail}
              onOpenAgent={onOpenAgent}
            />
          );
        })}
      </div>
    </div>
  );
}

function AgentScorecard({ agent, topItem, actionCount = 0, onLaunch, onOpenDetail, onOpenAgent }) {
  const onTrack = rosterStatus(agent) === "on_track";
  const eng = ENGAGEMENT_META[agent.engagement];
  const interv = topItem ? INTERVENTION_META[topItem.intervention.kind] : null;

  return (
    <Card tone="outline" padX={18} padY={18} style={sStyles.card}>
      <div style={sStyles.head}>
        <button
          type="button"
          className="cc-focusable"
          onClick={() => onOpenAgent?.(agent.id)}
          style={sStyles.avatar}
          aria-label={`Open ${agent.name}'s profile`}
        >
          {agent.initials}
        </button>
        <div style={sStyles.identity}>
          <span style={sStyles.name}>{agent.name}</span>
          <InlineStatusAffordance tone={eng.tone} icon={<Dot tone={eng.tone} />} style={{ color: toneInk(eng.tone) }}>
            {eng.label}
          </InlineStatusAffordance>
        </div>
      </div>

      <div style={sStyles.scores}>
        <div style={sStyles.csat}>
          <span style={sStyles.metricLabel}>CSAT</span>
          <span style={sStyles.metricValue}>{agent.csat}%</span>
        </div>
        <div style={sStyles.composite}>
          <div style={sStyles.scoreTop}>
            <span style={sStyles.metricLabel}>Composite</span>
            <span style={sStyles.metricValue}>{agent.composite} <span style={sStyles.scoreMax}>/ 100</span></span>
          </div>
          <ScoreBar composite={agent.composite} target={agent.target} onTrack={onTrack} />
        </div>
      </div>

      <div style={sStyles.action}>
        {onTrack || !topItem ? (
          <div style={sStyles.onTrack}>
            <CheckCircle2 size={15} style={{ color: "var(--color-success)", flexShrink: 0 }} aria-hidden="true" />
            <span style={sStyles.onTrackText}>On track — above target</span>
          </div>
        ) : (
          <>
            <div style={sStyles.actionHead}>
              <span style={sStyles.actionLabel}>Top action</span>
              {actionCount > 1 && <span style={sStyles.moreChip}>{actionCount} open</span>}
            </div>
            <div style={sStyles.topItem}>
              <Target size={14} aria-hidden="true" style={{ color: "var(--color-text-tertiary)", flexShrink: 0, marginTop: 2 }} />
              <span style={sStyles.topItemText}>
                <span style={sStyles.topItemComp}>{topItem.competency}</span>
                <span style={sStyles.topItemInterv}>{interv.label} · {topItem.intervention.duration}</span>
              </span>
            </div>
            <div style={sStyles.actionRow}>
              <Button variant="primary" onClick={() => onLaunch(topItem.id)} style={sStyles.launch}>Launch</Button>
              <Button variant="text" uppercase={false} onClick={() => onOpenDetail(topItem.id)}>
                {actionCount > 1 ? "View plan" : "Details"}
              </Button>
            </div>
          </>
        )}
      </div>
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
  page: { display: "flex", flexDirection: "column", gap: 24 },
  heading: { margin: 0, fontFamily: "var(--font-sans)", fontSize: 17, fontWeight: 700, color: "var(--color-text-deep)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, alignItems: "start" },
  card: { display: "flex", flexDirection: "column", gap: 16 },
  head: { display: "flex", alignItems: "center", gap: 12 },
  avatar: {
    flexShrink: 0, width: 40, height: 40, borderRadius: "50%", border: "none",
    background: "var(--grey-100)", color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  },
  identity: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  name: { fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  scores: { display: "flex", gap: 16, alignItems: "flex-end" },
  csat: { display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 },
  composite: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 },
  scoreTop: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 },
  metricLabel: {
    fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
    textTransform: "uppercase", color: "var(--color-text-tertiary)",
  },
  metricValue: { fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)" },
  scoreMax: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  action: { display: "flex", flexDirection: "column", gap: 12 },
  actionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  actionLabel: {
    fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
    textTransform: "uppercase", color: "var(--color-text-tertiary)",
  },
  moreChip: {
    fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700,
    color: "var(--color-text-medium)", background: "var(--pill-bg)",
    padding: "2px 8px", borderRadius: 999,
  },
  topItem: { display: "flex", alignItems: "flex-start", gap: 8 },
  topItemText: { display: "flex", flexDirection: "column", gap: 1, minWidth: 0 },
  topItemComp: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  topItemInterv: { fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 400, color: "var(--text-secondary)" },
  actionRow: { display: "flex", alignItems: "center", gap: 8 },
  launch: { flex: 1, height: 38, minWidth: 0 },
  onTrack: { display: "flex", alignItems: "center", gap: 8 },
  onTrackText: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },
};
