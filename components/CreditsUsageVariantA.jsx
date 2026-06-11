"use client";

import React from "react";
import Button from "./Button";
import {
  InfoBanner,
  Section,
  Field,
  FieldNote,
  NumberInput,
  MetricTile,
  UsageTrendChart,
  AdditionalUsageChoice,
  RequestRoutingField,
  AgentBannerPreview,
} from "./CreditsUsageParts";
import CreditsUsageTeamTable from "./CreditsUsageTeamTable";
import CreditsUsageAgentTable from "./CreditsUsageAgentTable";
import { TENANT_SAMPLE, TREND_DATA } from "./mocks/creditsUsage";

// Variant A — stacked governance form. Every concern visible in one
// scroll, in governance order: capacity → additional usage → team quotas →
// agent overrides → requests. The familiar, fully-scannable direction;
// closest evolution of the shipped page.

export default function CreditsUsageVariantA({ vm }) {
  const hrs = Math.round(vm.allocatedCap / 60);
  return (
    <div style={aStyles.column}>
      <InfoBanner />

      <Section
        title="Tenant capacity"
        description="The practice minutes committed for this tenant, and how they're being consumed this period."
      >
        <Field label="Committed capacity">
          <NumberInput
            value={vm.allocatedCap}
            onChange={vm.setAllocatedCap}
            suffix={`min / period · ${hrs.toLocaleString()} hrs`}
            ariaLabel="Committed capacity minutes"
          />
          <FieldNote>Customer-defined and billed whether used or not. Distributed to teams below.</FieldNote>
        </Field>
        <div style={aStyles.metricRow}>
          <MetricTile
            label={`Used · ${TENANT_SAMPLE.periodLabel}`}
            value={`${TENANT_SAMPLE.usedThisPeriod.toLocaleString()} min`}
            sub="Across Roleplay, Guide, and Probe"
          />
          <MetricTile
            label="Active agents"
            value={`${TENANT_SAMPLE.activeAgents} of ${TENANT_SAMPLE.totalAgents}`}
            sub={`Practiced ${TENANT_SAMPLE.periodLabel.toLowerCase()}`}
          />
          {vm.usageMode === "additional" && (
            <MetricTile
              label="Additional cap"
              value={`${vm.additionalCap.toLocaleString()} min`}
              sub="Allowed on top of commitment"
              chipLabel="Capped"
            />
          )}
        </div>
        <UsageTrendChart data={TREND_DATA} />
      </Section>

      <Section
        title="When capacity runs out"
        description="Control whether the tenant can spend beyond its commitment — and by how much."
      >
        <AdditionalUsageChoice
          mode={vm.usageMode}
          onMode={vm.setUsageMode}
          additionalCap={vm.additionalCap}
          onAdditionalCap={vm.setAdditionalCap}
        />
      </Section>

      <Section
        title="Team quotas"
        description="Distribute the committed capacity across teams. Cadence and per-agent allowance are set per team — tenured and new agents consume very differently."
      >
        <CreditsUsageTeamTable
          teams={vm.teams}
          onCadence={vm.setTeamCadence}
          onPerAgent={vm.setTeamPerAgent}
        />
      </Section>

      <Section
        title="Agent overrides"
        description="Depart from a team's per-agent quota for individual agents."
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

      <div style={aStyles.pairRow}>
        <Section
          title="Quota-exceeded requests"
          description="Where an agent's request for more minutes is routed."
          style={aStyles.pairCard}
        >
          <RequestRoutingField
            value={vm.routingEmail}
            onChange={vm.setRoutingEmail}
            error={vm.emailError}
          />
        </Section>
        <Section
          title="Agent experience"
          description="What an out-of-quota agent sees in the Learning Hub."
          style={aStyles.pairCard}
        >
          <AgentBannerPreview />
        </Section>
      </div>

      <div style={aStyles.actionRow}>
        <Button
          variant="primary"
          onClick={vm.onSave}
          disabled={Boolean(vm.emailError)}
          style={{ height: 36, paddingInline: 20 }}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}

const aStyles = {
  column: { display: "flex", flexDirection: "column", gap: 16, width: "100%" },
  metricRow: { display: "flex", gap: 12 },
  pairRow: { display: "flex", gap: 16, alignItems: "stretch" },
  pairCard: { flex: 1, minWidth: 0 },
  actionRow: { display: "flex", justifyContent: "flex-end", paddingTop: 4 },
};
