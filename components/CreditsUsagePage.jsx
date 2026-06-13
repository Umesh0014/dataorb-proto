"use client";

import React from "react";
import { Gauge, ChevronDown, ChevronRight } from "lucide-react";
import PageHeader from "./PageHeader";
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
import { TENANT_SAMPLE, TEAMS_SAMPLE, AGENTS_SAMPLE, CADENCES, EMAIL_RE } from "./mocks/creditsUsage";

// CreditsUsagePage — Credits & Usage admin surface.
//
// Team-level quota model: credit is committed at the tenant, quota is
// distributed per team, and cadence (daily/weekly/monthly) is a per-team
// variable because tenured and new agents consume very differently. Teams
// are divider-separated rows under a prominent committed-capacity hero;
// opening a team reveals its agents with agent-level usage and a plain
// per-agent quota box (agents inherit the team cadence). When capacity runs
// out the tenant either caps spend or allows capped additional usage; an
// out-of-quota agent raises a routed request. All sample data is mock.

const AVATAR_COLORS = [
  "var(--chart-blue)",
  "var(--chart-teal)",
  "var(--chart-lavender)",
  "var(--chart-orange)",
  "var(--chart-pink)",
  "var(--chart-green)",
];

export default function CreditsUsagePage({ onBack }) {
  const allocatedCap = TENANT_SAMPLE.allocatedCap;
  const [usageMode, setUsageMode] = React.useState("additional"); // "cap" | "additional"
  const [additionalCap, setAdditionalCap] = React.useState(TENANT_SAMPLE.additionalCap);
  const [teams, setTeams] = React.useState(TEAMS_SAMPLE);
  const [agents, setAgents] = React.useState(AGENTS_SAMPLE);
  const [routingEmail, setRoutingEmail] = React.useState("");
  const [openTeams, setOpenTeams] = React.useState(() => new Set());

  const emailError =
    routingEmail.trim() && !EMAIL_RE.test(routingEmail.trim())
      ? "Enter a valid email address."
      : null;

  const toggleTeam = (id) =>
    setOpenTeams((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const setTeamCadence = (id, cadence) =>
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, cadence } : t)));

  const setTeamPerAgent = (id, perAgent) =>
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, perAgent } : t)));

  // Editing an agent's quota inline also marks them as overriding the team
  // default.
  const setAgentQuota = (id, limit) =>
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, limit, hasCustom: true } : a)));

  const agentsByTeam = React.useMemo(() => {
    const map = {};
    agents.forEach((a) => {
      (map[a.team] = map[a.team] || []).push(a);
    });
    return map;
  }, [agents]);

  const handleSave = () => {
    if (emailError) return;
    console.log("save credits & usage settings");
  };

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

      <InfoBanner />

      <TenantCapacityHero
        allocatedCap={allocatedCap}
        usageMode={usageMode}
        additionalCap={additionalCap}
        onSave={handleSave}
        saveDisabled={Boolean(emailError)}
      />

      <Section
        title="Teams & agents"
        description="Quota is distributed per team. Open a team to adjust its agents."
        headerRight={<span style={styles.teamCount}>{teams.length} teams</span>}
      >
        <div style={styles.teamList}>
          {teams.map((team, idx) => (
            <TeamRow
              key={team.id}
              team={team}
              agents={agentsByTeam[team.id] || []}
              open={openTeams.has(team.id)}
              last={idx === teams.length - 1}
              onToggleOpen={() => toggleTeam(team.id)}
              onCadence={setTeamCadence}
              onPerAgent={setTeamPerAgent}
              onSetAgentQuota={setAgentQuota}
            />
          ))}
        </div>
      </Section>

      <div style={styles.pairRow}>
        <Section
          title="When capacity runs out"
          description="Cap spend, or allow capped additional usage."
          style={styles.pairCard}
        >
          <AdditionalUsageChoice
            mode={usageMode}
            onMode={setUsageMode}
            additionalCap={additionalCap}
            onAdditionalCap={setAdditionalCap}
          />
        </Section>
        <Section
          title="Quota-exceeded requests"
          description="Routing plus the agent-facing banner."
          style={styles.pairCard}
        >
          <RequestRoutingField value={routingEmail} onChange={setRoutingEmail} error={emailError} />
          <AgentBannerPreview />
        </Section>
      </div>
    </div>
  );
}

// ---- Team row + drill-down ------------------------------------------------

function TeamRow({ team, agents, open, last, onToggleOpen, onCadence, onPerAgent, onSetAgentQuota }) {
  const pct = team.allocated > 0 ? Math.round((team.used / team.allocated) * 100) : 0;
  const cad = cadenceShort(team.cadence);

  return (
    <div style={{ ...styles.team, borderBottom: last ? "none" : "1px solid var(--color-border-card-soft)" }}>
      <div style={styles.row}>
        <button type="button" onClick={onToggleOpen} aria-expanded={open} style={styles.identity}>
          <span style={styles.chevron}>
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
          <span style={styles.identityText}>
            <span style={styles.teamTitleRow}>
              <span style={styles.teamName}>{team.name}</span>
              <CompositionBadge composition={team.composition} />
            </span>
            <span style={styles.teamAgentCount}>{agents.length} agents</span>
          </span>
        </button>

        <div style={styles.usage}>
          <CapacityBar used={team.used} total={team.allocated} height={10} />
          <span style={styles.usageVal}>
            {team.used.toLocaleString()} / {team.allocated.toLocaleString()} min · {pct}%
          </span>
        </div>

        <div style={styles.quota}>
          <CadenceDropdown
            value={team.cadence}
            onChange={(v) => onCadence(team.id, v)}
            ariaLabel={`Quota cadence for ${team.name}`}
          />
          <QuotaInput
            value={team.perAgent}
            onChange={(v) => onPerAgent(team.id, v)}
            suffix="min"
            ariaLabel={`Per-agent quota for ${team.name}`}
          />
        </div>
      </div>

      {open && (
        <div style={styles.agentPanel}>
          {agents.map((agent, i) => {
            const quota = agent.hasCustom ? agent.limit : team.perAgent;
            const aPct = quota > 0 ? Math.round((agent.used / quota) * 100) : 0;
            return (
              <div key={agent.id} style={styles.agentRow}>
                <span style={styles.agentIdentity}>
                  <Avatar name={agent.name} index={i} />
                  <span style={styles.agentName}>{agent.name}</span>
                </span>
                <div style={styles.agentUsage}>
                  <CapacityBar used={agent.used} total={quota} height={6} />
                  <span style={styles.agentUsageVal}>
                    {agent.used} / {quota} min{cad} · {aPct}%
                  </span>
                </div>
                <QuotaInput
                  value={quota}
                  onChange={(v) => onSetAgentQuota(agent.id, v)}
                  suffix={`min${cad}`}
                  ariaLabel={`Quota for ${agent.name}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// QuotaInput — number field with a visible focus ring (the documented 2px
// white + brand-blue ring) so the team/agent quota edits stay keyboard-
// discoverable (WCAG-3). Mirrors the styling of the original inline input.
function QuotaInput({ value, onChange, suffix, ariaLabel }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label
      style={{
        ...styles.quotaInput,
        boxShadow: focus ? "0 0 0 2px #FFFFFF, 0 0 0 4px var(--do-brand-blue)" : "none",
        borderColor: focus ? "var(--do-brand-blue)" : "var(--color-border-card-soft)",
      }}
    >
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        aria-label={ariaLabel}
        style={styles.quotaInputField}
      />
      <span style={styles.quotaSuffix}>{suffix}</span>
    </label>
  );
}

function CadenceDropdown({ value, onChange, ariaLabel }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={ariaLabel} style={styles.select}>
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
    <span style={{ ...styles.avatar, background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
      {initials}
    </span>
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

  teamCount: {
    padding: "3px 10px",
    borderRadius: 999,
    background: "#F3F4F6",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    whiteSpace: "nowrap",
  },

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
    transition: "box-shadow 120ms ease, border-color 120ms ease",
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
