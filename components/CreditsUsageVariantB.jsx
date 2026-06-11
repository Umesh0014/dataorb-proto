"use client";

import React from "react";
import { Check } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import {
  InfoBanner,
  Field,
  FieldNote,
  NumberInput,
  AdditionalUsageChoice,
  RequestRoutingField,
  cadenceShort,
} from "./CreditsUsageParts";
import CreditsUsageTeamTable from "./CreditsUsageTeamTable";
import CreditsUsageAgentTable from "./CreditsUsageAgentTable";

// Variant B — guided setup stepper. One concern per step (Capacity → Team
// quotas → Agent overrides → Review), driven by a left step-rail. Built
// for first-run configuration where the stacked form is overwhelming; the
// final step summarises before saving.

const STEPS = [
  { id: "capacity", label: "Capacity", hint: "Commitment & additional usage" },
  { id: "teams", label: "Team quotas", hint: "Distribute per team" },
  { id: "agents", label: "Agent overrides", hint: "Per-agent exceptions" },
  { id: "review", label: "Requests & review", hint: "Routing & confirm" },
];

export default function CreditsUsageVariantB({ vm }) {
  const [step, setStep] = React.useState(0);
  const isLast = step === STEPS.length - 1;
  const customCount = vm.agents.filter((a) => a.hasCustom).length;
  const blockNext = isLast && Boolean(vm.emailError);

  return (
    <div style={bStyles.column}>
      <InfoBanner />
      <div style={bStyles.shell}>
        <StepRail current={step} onSelect={setStep} />

        <Card padX={0} padY={0} style={bStyles.panel}>
          <header style={bStyles.panelHeader}>
            <span style={bStyles.panelStepLabel}>Step {step + 1} of {STEPS.length}</span>
            <h2 style={bStyles.panelTitle}>{STEPS[step].label}</h2>
            <p style={bStyles.panelHint}>{STEPS[step].hint}</p>
          </header>

          <div style={bStyles.panelBody}>
            {step === 0 && (
              <>
                <Field label="Committed capacity">
                  <NumberInput
                    value={vm.allocatedCap}
                    onChange={vm.setAllocatedCap}
                    suffix="min / period"
                    ariaLabel="Committed capacity minutes"
                  />
                  <FieldNote>Customer-defined, billed whether used or not, then distributed to teams.</FieldNote>
                </Field>
                <Field label="When capacity runs out">
                  <AdditionalUsageChoice
                    mode={vm.usageMode}
                    onMode={vm.setUsageMode}
                    additionalCap={vm.additionalCap}
                    onAdditionalCap={vm.setAdditionalCap}
                  />
                </Field>
              </>
            )}

            {step === 1 && (
              <CreditsUsageTeamTable
                teams={vm.teams}
                onCadence={vm.setTeamCadence}
                onPerAgent={vm.setTeamPerAgent}
              />
            )}

            {step === 2 && (
              <CreditsUsageAgentTable
                agents={vm.filteredAgents}
                totalCount={vm.totalAgents}
                search={vm.agentSearch}
                onSearchChange={vm.setAgentSearch}
                teamById={vm.teamById}
                onToggleCustom={vm.toggleAgentCustom}
                onSetLimit={vm.setAgentLimit}
              />
            )}

            {step === 3 && (
              <>
                <RequestRoutingField
                  value={vm.routingEmail}
                  onChange={vm.setRoutingEmail}
                  error={vm.emailError}
                />
                <ReviewSummary vm={vm} customCount={customCount} />
              </>
            )}
          </div>

          <footer style={bStyles.panelFooter}>
            <Button
              variant="text"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{ height: 36, paddingInline: 8 }}
            >
              Back
            </Button>
            {isLast ? (
              <Button
                variant="primary"
                onClick={vm.onSave}
                disabled={blockNext}
                style={{ height: 36, paddingInline: 20 }}
              >
                Save changes
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                style={{ height: 36, paddingInline: 20 }}
              >
                Next
              </Button>
            )}
          </footer>
        </Card>
      </div>
    </div>
  );
}

function StepRail({ current, onSelect }) {
  return (
    <Card padX={0} padY={0} style={bStyles.rail}>
      {STEPS.map((s, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(i)}
            aria-current={active ? "step" : undefined}
            style={{ ...bStyles.railItem, background: active ? "var(--color-icon-tertiary-bg)" : "transparent" }}
          >
            <span
              style={{
                ...bStyles.railDot,
                background: done ? "var(--color-icon-tertiary-fg)" : active ? "#FFFFFF" : "#FFFFFF",
                borderColor: active || done ? "var(--color-icon-tertiary-fg)" : "var(--color-border-card-soft)",
                color: active ? "var(--color-icon-tertiary-fg)" : "#FFFFFF",
              }}
            >
              {done ? <Check size={12} color="#FFFFFF" /> : i + 1}
            </span>
            <span style={bStyles.railText}>
              <span style={{ ...bStyles.railLabel, color: active ? "var(--color-text-deep)" : "var(--color-text-medium)" }}>
                {s.label}
              </span>
              <span style={bStyles.railHint}>{s.hint}</span>
            </span>
          </button>
        );
      })}
    </Card>
  );
}

function ReviewSummary({ vm, customCount }) {
  const rows = [
    { k: "Committed capacity", v: `${vm.allocatedCap.toLocaleString()} min / period` },
    {
      k: "When capacity runs out",
      v: vm.usageMode === "additional"
        ? `Allow additional — capped at ${vm.additionalCap.toLocaleString()} min`
        : "Cap spend (hard stop)",
    },
    { k: "Teams configured", v: `${vm.teams.length} teams` },
    { k: "Agent overrides", v: `${customCount} custom` },
  ];
  return (
    <div style={bStyles.summary}>
      {rows.map((r) => (
        <div key={r.k} style={bStyles.summaryRow}>
          <span style={bStyles.summaryKey}>{r.k}</span>
          <span style={bStyles.summaryVal}>{r.v}</span>
        </div>
      ))}
      <div style={bStyles.summaryTeams}>
        {vm.teams.map((t) => (
          <span key={t.id} style={bStyles.summaryTeamChip}>
            {t.name}: {t.perAgent} min{cadenceShort(t.cadence)}
          </span>
        ))}
      </div>
    </div>
  );
}

const bStyles = {
  column: { display: "flex", flexDirection: "column", gap: 16, width: "100%" },
  shell: { display: "flex", gap: 16, alignItems: "flex-start" },

  rail: {
    width: 232,
    flexShrink: 0,
    border: "1px solid var(--color-border-card-soft)",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: 8,
  },
  railItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 12px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    transition: "background 120ms ease",
  },
  railDot: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 700,
    fontVariantNumeric: "tabular-nums",
  },
  railText: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  railLabel: { fontSize: 13, fontWeight: 600 },
  railHint: { fontSize: 11, fontWeight: 400, color: "var(--color-text-tertiary)" },

  panel: {
    flex: 1,
    minWidth: 0,
    border: "1px solid var(--color-border-card-soft)",
    display: "flex",
    flexDirection: "column",
  },
  panelHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "16px 20px",
    borderBottom: "1px solid #F9F9FF",
  },
  panelStepLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--color-icon-tertiary-fg)",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  panelTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  panelHint: { margin: 0, fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)" },
  panelBody: { display: "flex", flexDirection: "column", gap: 20, padding: 20, minHeight: 220 },
  panelFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderTop: "1px solid var(--color-border-card-soft)",
  },

  summary: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: 16,
    borderRadius: 10,
    background: "var(--color-card-emoji-bg)",
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "8px 0",
    borderBottom: "1px solid #EEEEF6",
  },
  summaryKey: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  summaryVal: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", textAlign: "right" },
  summaryTeams: { display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 12 },
  summaryTeamChip: {
    padding: "4px 10px",
    borderRadius: 999,
    background: "#FFFFFF",
    border: "1px solid var(--color-border-card-soft)",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
};
