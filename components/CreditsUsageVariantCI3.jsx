"use client";

import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import TenantCapacityHero from "./CreditsUsageHero";
import {
  InfoBanner,
  Section,
  CapacityBar,
  CompositionBadge,
  AdditionalUsageChoice,
  RequestRoutingField,
  AgentBannerPreview,
  cadenceShort,
} from "./CreditsUsageParts";
import { CADENCES } from "./mocks/creditsUsage";

// Variant C · Iteration I3 — calmer take on the team drill-down (I2 read as
// busy). Each team is a single line: name · prominent usage bar · quota
// value with a cadence dropdown beside it · agent face-pile. Opening a team
// reveals its agents as light secondary rows, each with a plain quota text
// box (no toggle, no per-agent cadence). More negative space and a clearer
// team-over-agent hierarchy. I1 and I2 are retained as earlier iterations.

const AVATAR_COLORS = [
  "var(--chart-blue)",
  "var(--chart-teal)",
  "var(--chart-lavender)",
  "var(--chart-orange)",
  "var(--chart-pink)",
  "var(--chart-green)",
];

export default function CreditsUsageVariantCI3({ vm }) {
  const [openTeam, setOpenTeam] = React.useState(null);

  const agentsByTeam = React.useMemo(() => {
    const map = {};
    vm.agents.forEach((a) => {
      (map[a.team] = map[a.team] || []).push(a);
    });
    return map;
  }, [vm.agents]);

  return (
    <div style={c3Styles.column}>
      <InfoBanner />

      <TenantCapacityHero
        allocatedCap={vm.allocatedCap}
        usageMode={vm.usageMode}
        additionalCap={vm.additionalCap}
        onSave={vm.onSave}
        saveDisabled={Boolean(vm.emailError)}
      />

      <Section
        title="Teams & agents"
        description="Quota is distributed per team. Open a team to adjust its agents."
        headerRight={<span style={c3Styles.teamCount}>{vm.teams.length} teams</span>}
      >
        <div style={c3Styles.teamList}>
          {vm.teams.map((team) => (
            <TeamRow
              key={team.id}
              team={team}
              agents={agentsByTeam[team.id] || []}
              open={openTeam === team.id}
              onToggleOpen={() => setOpenTeam((cur) => (cur === team.id ? null : team.id))}
              onCadence={vm.setTeamCadence}
              onPerAgent={vm.setTeamPerAgent}
              onSetAgentQuota={vm.setAgentQuota}
            />
          ))}
        </div>
      </Section>

      <div style={c3Styles.pairRow}>
        <Section
          title="When capacity runs out"
          description="Cap spend, or allow capped additional usage."
          style={c3Styles.pairCard}
        >
          <AdditionalUsageChoice
            mode={vm.usageMode}
            onMode={vm.setUsageMode}
            additionalCap={vm.additionalCap}
            onAdditionalCap={vm.setAdditionalCap}
          />
        </Section>
        <Section
          title="Quota-exceeded requests"
          description="Routing plus the agent-facing banner."
          style={c3Styles.pairCard}
        >
          <RequestRoutingField value={vm.routingEmail} onChange={vm.setRoutingEmail} error={vm.emailError} />
          <AgentBannerPreview />
        </Section>
      </div>
    </div>
  );
}

function TeamRow({ team, agents, open, onToggleOpen, onCadence, onPerAgent, onSetAgentQuota }) {
  const teamUsed = agents.reduce((sum, a) => sum + a.used, 0);
  const pct = team.allocated > 0 ? Math.round((teamUsed / team.allocated) * 100) : 0;
  const cad = cadenceShort(team.cadence);

  return (
    <div style={c3Styles.team}>
      <div style={c3Styles.row}>
        <button type="button" onClick={onToggleOpen} aria-expanded={open} style={c3Styles.identity}>
          <span style={c3Styles.chevron}>
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
          <span style={c3Styles.teamName}>{team.name}</span>
          <CompositionBadge composition={team.composition} />
        </button>

        <div style={c3Styles.usage}>
          <CapacityBar used={teamUsed} total={team.allocated} height={10} />
          <span style={c3Styles.usageVal}>
            {teamUsed.toLocaleString()} / {team.allocated.toLocaleString()} min · {pct}%
          </span>
        </div>

        <div style={c3Styles.quota}>
          <label style={c3Styles.quotaInput}>
            <input
              type="number"
              min={1}
              value={team.perAgent}
              onChange={(e) => onPerAgent(team.id, Number(e.target.value) || 0)}
              aria-label={`Per-agent quota for ${team.name}`}
              style={c3Styles.quotaInputField}
            />
            <span style={c3Styles.quotaSuffix}>min</span>
          </label>
          <CadenceDropdown
            value={team.cadence}
            onChange={(v) => onCadence(team.id, v)}
            ariaLabel={`Quota cadence for ${team.name}`}
          />
        </div>

        <FacePile agents={agents} />
      </div>

      {open && (
        <div style={c3Styles.agentPanel}>
          {agents.map((agent, i) => {
            const quota = agent.hasCustom ? agent.limit : team.perAgent;
            const aPct = quota > 0 ? Math.round((agent.used / quota) * 100) : 0;
            return (
              <div key={agent.id} style={c3Styles.agentRow}>
                <span style={c3Styles.agentIdentity}>
                  <Avatar name={agent.name} index={i} />
                  <span style={c3Styles.agentName}>{agent.name}</span>
                </span>
                <div style={c3Styles.agentUsage}>
                  <CapacityBar used={agent.used} total={quota} height={6} />
                  <span style={c3Styles.agentUsageVal}>
                    {agent.used} / {quota} min{cad} · {aPct}%
                  </span>
                </div>
                <label style={c3Styles.quotaInput}>
                  <input
                    type="number"
                    min={1}
                    value={quota}
                    onChange={(e) => onSetAgentQuota(agent.id, Number(e.target.value) || 0)}
                    aria-label={`Quota for ${agent.name}`}
                    style={c3Styles.quotaInputField}
                  />
                  <span style={c3Styles.quotaSuffix}>min{cad}</span>
                </label>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CadenceDropdown({ value, onChange, ariaLabel }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      style={c3Styles.select}
    >
      {CADENCES.map((c) => (
        <option key={c.id} value={c.id}>
          {c.adjective}
        </option>
      ))}
    </select>
  );
}

function FacePile({ agents }) {
  const shown = agents.slice(0, 4);
  const extra = agents.length - shown.length;
  return (
    <div style={c3Styles.facePile}>
      {shown.map((a, i) => (
        <span key={a.id} style={{ ...c3Styles.facePileItem, marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar name={a.name} index={i} ring />
        </span>
      ))}
      {extra > 0 && <span style={c3Styles.facePileMore}>+{extra}</span>}
    </div>
  );
}

function Avatar({ name, index, ring }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <span
      style={{
        ...c3Styles.avatar,
        background: AVATAR_COLORS[index % AVATAR_COLORS.length],
        boxShadow: ring ? "0 0 0 2px #FFFFFF" : undefined,
      }}
    >
      {initials}
    </span>
  );
}

const c3Styles = {
  column: { display: "flex", flexDirection: "column", gap: 16, width: "100%" },

  teamCount: {
    padding: "3px 10px",
    borderRadius: 999,
    background: "#F3F4F6",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    whiteSpace: "nowrap",
  },

  teamList: { display: "flex", flexDirection: "column", gap: 12 },
  team: {
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 12,
    background: "#FFFFFF",
    overflow: "hidden",
  },
  row: { display: "flex", alignItems: "center", gap: 20, padding: "18px 20px" },

  identity: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: 240,
    flexShrink: 0,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    padding: 0,
  },
  chevron: { display: "flex", color: "var(--color-text-tertiary)", flexShrink: 0 },
  teamName: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },

  usage: { display: "flex", flexDirection: "column", gap: 7, flex: 1, minWidth: 0 },
  usageVal: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" },

  quota: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  quotaInput: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
  },
  quotaInputField: {
    width: 44,
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    background: "transparent",
    appearance: "textfield",
  },
  quotaSuffix: { fontSize: 11, color: "var(--color-text-tertiary)", whiteSpace: "nowrap" },
  select: {
    height: 36,
    padding: "0 10px",
    borderRadius: 8,
    border: "1px solid var(--color-border-card-soft)",
    background: "#FFFFFF",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-medium)",
    cursor: "pointer",
    appearance: "auto",
  },

  facePile: { display: "flex", alignItems: "center", width: 116, flexShrink: 0, justifyContent: "flex-end" },
  facePileItem: { display: "inline-flex" },
  facePileMore: { marginLeft: 6, fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)" },

  avatar: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.2px",
    flexShrink: 0,
  },

  agentPanel: {
    display: "flex",
    flexDirection: "column",
    padding: "4px 20px 8px 46px",
    background: "var(--color-card-emoji-bg)",
    borderTop: "1px solid var(--color-border-card-soft)",
  },
  agentRow: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    padding: "12px 0",
    borderBottom: "1px solid #ECECF4",
  },
  agentIdentity: { display: "flex", alignItems: "center", gap: 10, width: 220, flexShrink: 0 },
  agentName: { fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)" },
  agentUsage: { display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 },
  agentUsageVal: { fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" },

  pairRow: { display: "flex", gap: 16, alignItems: "stretch" },
  pairCard: { flex: 1, minWidth: 0 },
};
