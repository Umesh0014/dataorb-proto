"use client";

import React from "react";
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
import CreditsUsageAgentTable from "./CreditsUsageAgentTable";

// Variant C — team allocation dashboard. Tenant-capacity KPIs lead as a
// hero; team distribution is the centre of gravity (a card grid you adjust
// inline). Built for governing many teams/brands at scale, where the
// table-driven forms (A/B) don't surface where capacity is actually going.

export default function CreditsUsageVariantC({ vm }) {
  return (
    <div style={cStyles.column}>
      <InfoBanner />

      <TenantCapacityHero
        allocatedCap={vm.allocatedCap}
        usageMode={vm.usageMode}
        additionalCap={vm.additionalCap}
        onSave={vm.onSave}
        saveDisabled={Boolean(vm.emailError)}
      />

      <Section
        title="Team allocation"
        description="Where committed capacity is going. Adjust each team's cadence and per-agent quota inline."
        headerRight={<span style={cStyles.teamCount}>{vm.teams.length} teams</span>}
      >
        <div style={cStyles.grid}>
          {vm.teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onCadence={vm.setTeamCadence}
              onPerAgent={vm.setTeamPerAgent}
            />
          ))}
        </div>
      </Section>

      <Section
        title="Agent overrides"
        description="Individual exceptions to a team's per-agent quota."
      >
        <CreditsUsageAgentTable
          agents={vm.filteredAgents}
          totalCount={vm.totalAgents}
          search={vm.agentSearch}
          onSearchChange={vm.setAgentSearch}
          teamById={vm.teamById}
          onToggleCustom={vm.toggleAgentCustom}
          onSetLimit={vm.setAgentLimit}
        />
      </Section>

      <div style={cStyles.pairRow}>
        <Section
          title="When capacity runs out"
          description="Cap spend, or allow capped additional usage."
          style={cStyles.pairCard}
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
          style={cStyles.pairCard}
        >
          <RequestRoutingField
            value={vm.routingEmail}
            onChange={vm.setRoutingEmail}
            error={vm.emailError}
          />
          <AgentBannerPreview />
        </Section>
      </div>
    </div>
  );
}

function TeamCard({ team, onCadence, onPerAgent }) {
  const pct = Math.round((team.used / team.allocated) * 100);
  return (
    <div style={cStyles.card}>
      <div style={cStyles.cardTop}>
        <span style={cStyles.cardName}>{team.name}</span>
        <CompositionBadge composition={team.composition} />
      </div>
      <div style={cStyles.cardUsage}>
        <div style={cStyles.cardUsageTop}>
          <span style={cStyles.cardUsageVal}>
            {team.used.toLocaleString()} / {team.allocated.toLocaleString()} min
          </span>
          <span style={cStyles.cardUsagePct}>{pct}%</span>
        </div>
        <CapacityBar used={team.used} total={team.allocated} height={8} />
      </div>
      <div style={cStyles.cardMeta}>
        <span style={cStyles.cardMetaItem}>
          <strong style={cStyles.cardMetaStrong}>{team.tenured + team.newAgents}</strong> agents
        </span>
        <span style={cStyles.cardMetaDot}>·</span>
        <span style={cStyles.cardMetaItem}>{team.tenured} tenured</span>
        <span style={cStyles.cardMetaDot}>·</span>
        <span style={cStyles.cardMetaItem}>{team.newAgents} new</span>
      </div>
      <div style={cStyles.cardControls}>
        <CadenceSelect
          value={team.cadence}
          onChange={(c) => onCadence(team.id, c)}
          ariaLabel={`Quota cadence for ${team.name}`}
        />
        <label style={cStyles.miniInput}>
          <input
            type="number"
            min={1}
            value={team.perAgent}
            onChange={(e) => onPerAgent(team.id, Number(e.target.value) || 0)}
            aria-label={`Per-agent quota for ${team.name}`}
            style={cStyles.miniInputField}
          />
          <span style={cStyles.miniInputSuffix}>min{cadenceShort(team.cadence)}</span>
        </label>
      </div>
    </div>
  );
}

const cStyles = {
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 16,
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 12,
    background: "#FFFFFF",
  },
  cardTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  cardName: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  cardUsage: { display: "flex", flexDirection: "column", gap: 6 },
  cardUsageTop: { display: "flex", alignItems: "baseline", justifyContent: "space-between" },
  cardUsageVal: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-medium)",
    fontVariantNumeric: "tabular-nums",
  },
  cardUsagePct: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    fontVariantNumeric: "tabular-nums",
  },
  cardMeta: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  cardMetaItem: { fontSize: 11, color: "var(--color-text-tertiary)" },
  cardMetaStrong: { color: "var(--color-text-deep)", fontWeight: 700 },
  cardMetaDot: { color: "var(--color-text-placeholder)" },
  cardControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    paddingTop: 4,
    borderTop: "1px solid #F5F5F7",
  },
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

  pairRow: { display: "flex", gap: 16, alignItems: "stretch" },
  pairCard: { flex: 1, minWidth: 0 },
};
