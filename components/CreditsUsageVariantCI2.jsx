"use client";

import React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import Toggle from "./Toggle";
import TenantCapacityHero from "./CreditsUsageHero";
import {
  InfoBanner,
  Section,
  CapacityBar,
  CompositionBadge,
  CadenceSelect,
  AdditionalUsageChoice,
  RequestRoutingField,
  AgentBannerPreview,
  cadenceShort,
} from "./CreditsUsageParts";

// Variant C · Iteration I2 — team allocation dashboard with agents nested
// under each team (review feedback on I1). Team rows show team-level usage
// + quota control; expanding a team drills into its agents with agent-level
// usage bars and per-agent quota adjustment. Cadence reads Daily / Weekly /
// Monthly. I1 (CreditsUsageVariantC) stays as the prior iteration.

export default function CreditsUsageVariantCI2({ vm }) {
  const [openTeam, setOpenTeam] = React.useState(vm.teams[0]?.id ?? null);

  const agentsByTeam = React.useMemo(() => {
    const map = {};
    vm.agents.forEach((a) => {
      (map[a.team] = map[a.team] || []).push(a);
    });
    return map;
  }, [vm.agents]);

  return (
    <div style={ciStyles.column}>
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
        description="Quota is distributed per team. Open a team to see its agents, their usage, and per-agent quota."
        headerRight={<span style={ciStyles.teamCount}>{vm.teams.length} teams</span>}
      >
        <div style={ciStyles.teamList}>
          {vm.teams.map((team) => (
            <TeamRow
              key={team.id}
              team={team}
              agents={agentsByTeam[team.id] || []}
              open={openTeam === team.id}
              onToggleOpen={() => setOpenTeam((cur) => (cur === team.id ? null : team.id))}
              onCadence={vm.setTeamCadence}
              onPerAgent={vm.setTeamPerAgent}
              onToggleAgentCustom={vm.toggleAgentCustom}
              onSetAgentLimit={vm.setAgentLimit}
            />
          ))}
        </div>
      </Section>

      <div style={ciStyles.pairRow}>
        <Section
          title="When capacity runs out"
          description="Cap spend, or allow capped additional usage."
          style={ciStyles.pairCard}
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
          style={ciStyles.pairCard}
        >
          <RequestRoutingField value={vm.routingEmail} onChange={vm.setRoutingEmail} error={vm.emailError} />
          <AgentBannerPreview />
        </Section>
      </div>
    </div>
  );
}

function TeamRow({
  team,
  agents,
  open,
  onToggleOpen,
  onCadence,
  onPerAgent,
  onToggleAgentCustom,
  onSetAgentLimit,
}) {
  const teamUsed = agents.reduce((sum, a) => sum + a.used, 0);
  const pct = team.allocated > 0 ? Math.round((teamUsed / team.allocated) * 100) : 0;
  const cad = cadenceShort(team.cadence);

  return (
    <div style={{ ...ciStyles.team, borderColor: open ? "var(--color-icon-tertiary-fg)" : "var(--color-border-card-soft)" }}>
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={open}
        style={ciStyles.teamHeader}
      >
        <span style={ciStyles.teamChevron}>
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <span style={ciStyles.teamHeaderName}>
          <span style={ciStyles.teamName}>{team.name}</span>
          <CompositionBadge composition={team.composition} />
        </span>
        <span style={ciStyles.teamHeaderUsage}>
          <span style={ciStyles.teamUsageVal}>
            {teamUsed.toLocaleString()} / {team.allocated.toLocaleString()} min
          </span>
          <span style={ciStyles.teamUsageBar}>
            <CapacityBar used={teamUsed} total={team.allocated} height={6} />
          </span>
          <span style={ciStyles.teamUsagePct}>{pct}%</span>
        </span>
        <span style={ciStyles.teamHeaderCount}>{agents.length} agents</span>
      </button>

      {/* Team-level quota control — visible on the row at all times. */}
      <div style={ciStyles.teamControls}>
        <span style={ciStyles.controlLabel}>Team quota</span>
        <CadenceSelect
          value={team.cadence}
          onChange={(c) => onCadence(team.id, c)}
          ariaLabel={`Quota cadence for ${team.name}`}
          useAdjective
        />
        <label style={ciStyles.miniInput}>
          <input
            type="number"
            min={1}
            value={team.perAgent}
            onChange={(e) => onPerAgent(team.id, Number(e.target.value) || 0)}
            aria-label={`Per-agent quota for ${team.name}`}
            style={ciStyles.miniInputField}
          />
          <span style={ciStyles.miniInputSuffix}>min{cad} / agent</span>
        </label>
      </div>

      {open && (
        <div style={ciStyles.agentList}>
          {agents.map((agent) => {
            const quota = agent.hasCustom ? agent.limit : team.perAgent;
            const aPct = quota > 0 ? Math.round((agent.used / quota) * 100) : 0;
            return (
              <div key={agent.id} style={ciStyles.agentRow}>
                <span style={ciStyles.agentIdentity}>
                  <span style={ciStyles.agentName}>{agent.name}</span>
                  <span style={ciStyles.agentEmail}>{agent.email}</span>
                </span>
                <span style={ciStyles.agentUsage}>
                  <span style={ciStyles.agentUsageVal}>
                    {agent.used} / {quota} min{cad} · {aPct}%
                  </span>
                  <CapacityBar used={agent.used} total={quota} height={5} />
                </span>
                <span style={ciStyles.agentControl}>
                  <Toggle
                    enabled={agent.hasCustom}
                    onChange={() => onToggleAgentCustom(agent.id)}
                    ariaLabel={`Custom quota for ${agent.name}`}
                  />
                  {agent.hasCustom ? (
                    <label style={ciStyles.miniInput}>
                      <input
                        type="number"
                        min={1}
                        value={agent.limit}
                        onChange={(e) => onSetAgentLimit(agent.id, Number(e.target.value) || 0)}
                        aria-label={`Custom quota for ${agent.name}`}
                        style={ciStyles.miniInputField}
                      />
                      <span style={ciStyles.miniInputSuffix}>min{cad}</span>
                    </label>
                  ) : (
                    <span style={ciStyles.defaultChip}>Team default</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const ciStyles = {
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

  teamList: { display: "flex", flexDirection: "column", gap: 10 },
  team: {
    border: "1px solid",
    borderRadius: 12,
    background: "#FFFFFF",
    overflow: "hidden",
    transition: "border-color 120ms ease",
  },
  teamHeader: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    width: "100%",
    padding: "14px 16px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
  },
  teamChevron: { display: "flex", color: "var(--color-text-tertiary)", flexShrink: 0 },
  teamHeaderName: { display: "flex", alignItems: "center", gap: 10, width: 220, flexShrink: 0 },
  teamName: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)" },
  teamHeaderUsage: { display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 },
  teamUsageVal: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-medium)",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  },
  teamUsageBar: { flex: 1, minWidth: 60 },
  teamUsagePct: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    fontVariantNumeric: "tabular-nums",
    width: 36,
    textAlign: "right",
  },
  teamHeaderCount: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", whiteSpace: "nowrap", flexShrink: 0 },

  teamControls: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    padding: "10px 16px 14px 44px",
    borderTop: "1px solid #F5F5F7",
  },
  controlLabel: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.3px" },

  agentList: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "6px 16px 12px 44px",
    background: "var(--color-card-emoji-bg)",
    borderTop: "1px solid #F5F5F7",
  },
  agentRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "10px 0",
    borderBottom: "1px solid #EEEEF6",
  },
  agentIdentity: { display: "flex", flexDirection: "column", gap: 1, width: 200, flexShrink: 0 },
  agentName: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  agentEmail: { fontSize: 11, color: "var(--color-text-tertiary)" },
  agentUsage: { display: "flex", flexDirection: "column", gap: 5, flex: 1, minWidth: 0 },
  agentUsageVal: { fontSize: 11, fontWeight: 600, color: "var(--color-text-medium)", fontVariantNumeric: "tabular-nums" },
  agentControl: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },

  miniInput: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
  },
  miniInputField: {
    width: 48,
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    background: "transparent",
    appearance: "textfield",
  },
  miniInputSuffix: { fontSize: 11, color: "var(--color-text-tertiary)", whiteSpace: "nowrap" },
  defaultChip: {
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: 999,
    background: "#F3F4F6",
    color: "var(--color-text-tertiary)",
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },

  pairRow: { display: "flex", gap: 16, alignItems: "stretch" },
  pairCard: { flex: 1, minWidth: 0 },
};
