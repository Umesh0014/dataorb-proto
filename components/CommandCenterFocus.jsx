"use client";

import React from "react";
import { PartyPopper, Download } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Banner from "./Banner";
import InlineStatusAffordance from "./InlineStatusAffordance";
import ScoreTrend from "./ScoreTrend";
import AgentScoreRow from "./AgentScoreRow";
import CommandCenterScoreboard from "./CommandCenterScoreboard";
import CommandCenterTasks from "./CommandCenterTasks";
import { TEAM_ROSTER, ENGAGEMENT_META, rosterStatus, toneInk } from "./mocks/commandCenter";

// CommandCenterFocus (Variant C) — the dashboard read top-down for a 5-minute
// Monday triage: the scoreboard, the agent who needs the most help featured
// with their scores + a jump to their detail page, the critical Tasks, the
// rest of the at-risk roster, then a downloadable "this worked" recap.
export default function CommandCenterFocus({
  items,
  resolved,
  onLaunch,
  onOpenAgent,
  onSnooze,
  onDismiss,
  onMarkHandled,
}) {
  const needsHelp = React.useMemo(
    () => TEAM_ROSTER.filter((a) => rosterStatus(a) === "needs_help").sort((a, b) => a.composite - b.composite),
    [],
  );
  const [hero, ...rest] = needsHelp;
  const improved = resolved.filter((r) => r.status === "improved");
  const taskProps = { items, onLaunch, onOpenAgent, onSnooze, onDismiss, onMarkHandled };

  return (
    <div style={fStyles.column}>
      <CommandCenterScoreboard subtitle="Your 5-minute Monday read — who needs you most, and how to lift their score" />

      {hero ? (
        <FocusAgentHero agent={hero} onOpenAgent={onOpenAgent} />
      ) : (
        <Banner
          tone="success"
          leading={<PartyPopper size={20} style={{ color: "var(--color-success)", flexShrink: 0 }} />}
          heading="Every agent is on track"
          body={`No agent is below target or stalled right now. ${improved.length} interventions moved a score this cycle.`}
        />
      )}

      <CommandCenterTasks {...taskProps} />

      {rest.length > 0 && (
        <section style={fStyles.section}>
          <h2 style={fStyles.sectionTitle}>Rest of the at-risk roster</h2>
          <div style={fStyles.list}>
            {rest.map((agent) => (
              <AgentScoreRow key={agent.id} agent={agent} onOpenAgent={onOpenAgent} />
            ))}
          </div>
        </section>
      )}

      {improved.length > 0 && (
        <section style={fStyles.section}>
          <div style={fStyles.recapHeader}>
            <h2 style={fStyles.sectionTitle}>This worked last week</h2>
            <Button variant="text" uppercase={false} trailingIcon={<Download size={15} aria-hidden="true" />} onClick={() => downloadRecap(improved)}>
              Download
            </Button>
          </div>
          <p style={fStyles.sectionLede}>Take these into a 1:1 or up-report — coaching that moved a score.</p>
          <Card tone="outline" padX={20} padY={8}>
            {improved.map((r, i) => (
              <button
                key={r.id}
                type="button"
                className="cc-focusable"
                onClick={() => onOpenAgent?.(r.agent.id)}
                style={{ ...fStyles.recapRow, borderTop: i === 0 ? "none" : "1px solid var(--color-divider-card)" }}
              >
                <span style={fStyles.recapAvatar}>{r.agent.initials}</span>
                <span style={fStyles.recapMain}>
                  <span style={fStyles.recapName}>{r.agent.name}</span>
                  <span style={fStyles.recapComp}>{r.competency} · {r.intervention.asset}</span>
                </span>
                <InlineStatusAffordance tone="success" style={{ color: toneInk("success") }}>↑ {r.delta.label} {r.delta.value}</InlineStatusAffordance>
              </button>
            ))}
          </Card>
        </section>
      )}
    </div>
  );
}

// FocusAgentHero — the single agent to start with: scores with trendlines and
// a jump straight into their detail page. Coaching actions live in Tasks.
function FocusAgentHero({ agent, onOpenAgent }) {
  const eng = ENGAGEMENT_META[agent.engagement];
  const gap = agent.target - agent.composite;
  return (
    <Card padX={28} padY={26} shadow style={fStyles.hero}>
      <span style={fStyles.startHere}>Start with</span>
      <div style={fStyles.heroIdentity}>
        <button
          type="button"
          className="cc-focusable"
          onClick={() => onOpenAgent?.(agent.id)}
          style={fStyles.heroAvatar}
          aria-label={`Open ${agent.name}'s detail page`}
        >
          {agent.initials}
        </button>
        <div style={{ minWidth: 0 }}>
          <h2 style={fStyles.heroName}>{agent.name}</h2>
          <InlineStatusAffordance tone={eng.tone} icon={<Dot tone={eng.tone} />} style={{ color: toneInk(eng.tone) }}>
            {eng.label}
          </InlineStatusAffordance>
        </div>
      </div>

      <div style={fStyles.heroScores}>
        <ScoreTrend label="CSAT" value={`${agent.csat}%`} unit="%" points={agent.csatTrend} target={agent.csatTarget} width={150} size="lg" />
        <ScoreTrend label="Composite" value={`${agent.composite}`} points={agent.compositeTrend} target={agent.target} width={150} size="lg" />
      </div>

      <p style={fStyles.goal}>Goal — lift composite {agent.composite} → {agent.target} (+{gap} pts). Their tasks are below.</p>
      <Button variant="primary" onClick={() => onOpenAgent?.(agent.id)} style={{ alignSelf: "flex-start" }}>Open detail page</Button>
    </Card>
  );
}

function downloadRecap(improved) {
  const lines = ["This worked last week — coaching that moved a score", ""];
  improved.forEach((r) => {
    lines.push(`- ${r.agent.name} · ${r.competency}: ${r.intervention.asset} → ${r.delta.label} ${r.delta.value} ${r.delta.window}`);
  });
  if (typeof document === "undefined") return;
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "command-center-this-worked.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Dot({ tone }) {
  const color = {
    danger: "var(--color-error)", warning: "var(--color-warning)",
    info: "var(--color-info)", success: "var(--color-success)", tertiary: "var(--color-text-tertiary)",
  }[tone] || "var(--color-text-tertiary)";
  return <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

const fStyles = {
  column: { maxWidth: 960, marginInline: "auto", width: "100%", display: "flex", flexDirection: "column", gap: 28 },
  section: { display: "flex", flexDirection: "column", gap: 12 },
  recapHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  sectionTitle: { margin: 0, fontFamily: "var(--font-sans)", fontSize: 17, fontWeight: 700, color: "var(--color-text-deep)" },
  sectionLede: { margin: "-4px 0 4px", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 400, color: "var(--text-secondary)" },
  list: { display: "flex", flexDirection: "column", gap: 12 },

  hero: { display: "flex", flexDirection: "column", gap: 16, borderRadius: 16 },
  startHere: { fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-button-primary-bg)" },
  heroIdentity: { display: "flex", alignItems: "center", gap: 14 },
  heroAvatar: {
    flexShrink: 0, width: 48, height: 48, borderRadius: "50%", border: "none",
    background: "var(--grey-100)", color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 700, cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  },
  heroName: { margin: "0 0 4px", fontFamily: "var(--font-sans)", fontSize: 22, fontWeight: 800, color: "var(--color-text-deep)", lineHeight: 1.2 },
  heroScores: { display: "flex", gap: 36, flexWrap: "wrap" },
  goal: { margin: 0, fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },

  recapRow: { display: "flex", alignItems: "center", gap: 12, width: "100%", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", padding: "12px 0" },
  recapAvatar: {
    flexShrink: 0, width: 32, height: 32, borderRadius: "50%",
    background: "var(--grey-100)", color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  },
  recapMain: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 },
  recapName: { fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  recapComp: { fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 400, color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
};
