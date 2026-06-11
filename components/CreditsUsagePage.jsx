"use client";

import React from "react";
import { Gauge } from "lucide-react";
import PageHeader from "./PageHeader";
import DarkPillSwitcher from "./DarkPillSwitcher";
import CreditsUsageVariantA from "./CreditsUsageVariantA";
import CreditsUsageVariantB from "./CreditsUsageVariantB";
import CreditsUsageVariantC from "./CreditsUsageVariantC";
import { TENANT_SAMPLE, TEAMS_SAMPLE, AGENTS_SAMPLE, EMAIL_RE } from "./mocks/creditsUsage";

// CreditsUsagePage — Credits & Usage admin surface.
//
// Thin shell: owns the team-level quota model state (committed capacity,
// additional-usage policy, per-team cadence/quota, per-agent overrides,
// request routing) and hands a single view-model to whichever design
// variant is selected. Three genuinely distinct directions sit behind the
// floating A/B/C switcher (demo-only) — Umesh picks the winner:
//
//   A — Stacked governance form (everything in one scroll)
//   B — Guided setup stepper (one concern per step + review)
//   C — Team allocation dashboard (capacity hero + team card grid)
//
// State lives here so flipping the switcher preserves edits across
// variants. All sample data is mock; no backend.

const VARIANTS = ["A", "B", "C"];

const VARIANT_COMPONENTS = {
  A: CreditsUsageVariantA,
  B: CreditsUsageVariantB,
  C: CreditsUsageVariantC,
};

export default function CreditsUsagePage({ onBack }) {
  const [variant, setVariant] = React.useState("A");
  const [allocatedCap, setAllocatedCap] = React.useState(TENANT_SAMPLE.allocatedCap);
  const [usageMode, setUsageMode] = React.useState("additional"); // "cap" | "additional"
  const [additionalCap, setAdditionalCap] = React.useState(TENANT_SAMPLE.additionalCap);
  const [teams, setTeams] = React.useState(TEAMS_SAMPLE);
  const [agents, setAgents] = React.useState(AGENTS_SAMPLE);
  const [agentSearch, setAgentSearch] = React.useState("");
  const [routingEmail, setRoutingEmail] = React.useState("");

  const emailError =
    routingEmail.trim() && !EMAIL_RE.test(routingEmail.trim())
      ? "Enter a valid email address."
      : null;

  const setTeamCadence = (id, cadence) =>
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, cadence } : t)));

  const setTeamPerAgent = (id, perAgent) =>
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, perAgent } : t)));

  const toggleAgentCustom = (id) =>
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, hasCustom: !a.hasCustom } : a)),
    );

  const setAgentLimit = (id, limit) =>
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, limit } : a)));

  const teamById = React.useMemo(
    () => Object.fromEntries(teams.map((t) => [t.id, t])),
    [teams],
  );

  const filteredAgents = agents.filter(
    (a) =>
      !agentSearch ||
      a.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(agentSearch.toLowerCase()),
  );

  const handleSave = () => {
    if (emailError) return;
    console.log("save credits & usage settings");
  };

  const vm = {
    allocatedCap,
    setAllocatedCap,
    usageMode,
    setUsageMode,
    additionalCap,
    setAdditionalCap,
    teams,
    setTeamCadence,
    setTeamPerAgent,
    agents,
    filteredAgents,
    totalAgents: agents.length,
    agentSearch,
    setAgentSearch,
    teamById,
    toggleAgentCustom,
    setAgentLimit,
    routingEmail,
    setRoutingEmail,
    emailError,
    onSave: handleSave,
  };

  const ActiveVariant = VARIANT_COMPONENTS[variant];

  return (
    <div style={styles.column}>
      <PageHeader
        back={onBack}
        identifier={{
          icon: <Gauge size={16} color="var(--color-icon-tertiary-fg)" />,
          label: "Credits & Usage",
          iconBg: "var(--color-icon-tertiary-bg)",
          iconColor: "var(--color-icon-tertiary-fg)",
        }}
        subtitle="Manage practice capacity, team quotas, and usage visibility for your tenant."
      />

      <ActiveVariant vm={vm} />

      <div style={styles.switcherWrap}>
        <DarkPillSwitcher
          ariaLabel="Credits & Usage variant switcher"
          value={variant}
          options={VARIANTS}
          onChange={setVariant}
        />
      </div>
    </div>
  );
}

const styles = {
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: "100%",
    fontFamily: "var(--font-sans)",
  },
  switcherWrap: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 1000,
  },
};
