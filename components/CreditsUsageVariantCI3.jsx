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

// Variant C · Iteration I3 — calm team drill-down. Teams are divider-
// separated rows (not cards): name with an agent count beneath it, a
// prominent usage bar, and the quota value with a cadence dropdown beside
// it. Multiple teams can be expanded at once; an open team reveals its
// agents as light secondary rows, each with a plain quota text box (agents
// inherit the team cadence). I1 and I2 are retained as earlier iterations.

const AVATAR_COLORS = [
  "var(--chart-blue)",
  "var(--chart-teal)",
  "var(--chart-lavender)",
  "var(--chart-orange)",
  "var(--chart-pink)",
  "var(--chart-green)",
];

export default function CreditsUsageVariantCI3({ vm }) {
  const [openTeams, setOpenTeams] = React.useState(() => new Set());

  const toggleTeam = (id) =>
    setOpenTeams((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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
          {vm.teams.map((team, idx) => (
            <TeamRow
              key={team.id}
              team={team}
              agents={agentsByTeam[team.id] || []}
              open={openTeams.has(team.id)}
              last={idx === vm.teams.length - 1}
              onToggleOpen={() => toggleTeam(team.id)}
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

function TeamRow({ team, agents, open, last, onToggleOpen, onCadence, onPerAgent, onSetAgentQuota }) {
  const pct = team.allocated > 0 ? Math.round((team.used / team.allocated) * 100) : 0;
  const cad = cadenceShort(team.cadence);

  return (
    <div style={{ ...c3Styles.team, borderBottom: last ? "none" : "1px solid var(--color-border-card-soft)" }}>
      <div style={c3Styles.row}>
        <button type="button" onClick={onToggleOpen} aria-expanded={open} style={c3Styles.identity}>
          <span style={c3Styles.chevron}>
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
          <span style={c3Styles.identityText}>
            <span style={c3Styles.teamTitleRow}>
              <span style={c3Styles.teamName}>{team.name}</span>
              <CompositionBadge composition={team.composition} />
            </span>
            <span style={c3Styles.teamAgentCount}>{agents.length} agents</span>
          </span>
        </button>

        <div style={c3Styles.usage}>
          <CapacityBar used={team.used} total={team.allocated} height={10} />
          <span style={c3Styles.usageVal}>
            {team.used.toLocaleString()} / {team.allocated.toLocaleString()} min · {pct}%
          </span>
        </div>

        <div style={c3Styles.quota}>
          <CadenceDropdown
            value={team.cadence}
            onChange={(v) => onCadence(team.id, v)}
            ariaLabel={`Quota cadence for ${team.name}`}
          />
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
        </div>
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

function Avatar({ name, index }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return (
    <span style={{ ...c3Styles.avatar, background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
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

  // Divider-separated rows (not cards). The Section card is the only
  // surface; teams are rows within it.
  teamList: { display: "flex", flexDirection: "column" },
  team: { display: "flex", flexDirection: "column" },
  row: { display: "flex", alignItems: "center", gap: 20, padding: "18px 4px" },

  identity: {
    display: "flex",
    alignItems: "flex-start",
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
  chevron: { display: "flex", color: "var(--color-text-tertiary)", flexShrink: 0, marginTop: 2 },
  identityText: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  teamTitleRow: { display: "flex", alignItems: "center", gap: 8 },
  teamName: { fontSize: 15, fontWeight: 600, color: "var(--color-text-deep)" },
  teamAgentCount: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },

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

  avatar: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.2px",
    flexShrink: 0,
  },

  agentPanel: {
    display: "flex",
    flexDirection: "column",
    padding: "4px 8px 12px 46px",
    background: "var(--color-card-emoji-bg)",
    borderRadius: 10,
    marginBottom: 12,
  },
  agentRow: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    padding: "12px 8px",
    borderBottom: "1px solid #ECECF4",
  },
  agentIdentity: { display: "flex", alignItems: "center", gap: 10, width: 220, flexShrink: 0 },
  agentName: { fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)" },
  agentUsage: { display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 },
  agentUsageVal: { fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" },

  pairRow: { display: "flex", gap: 16, alignItems: "stretch" },
  pairCard: { flex: 1, minWidth: 0 },
};
