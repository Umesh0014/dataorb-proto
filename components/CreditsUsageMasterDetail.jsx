"use client";

import React from "react";
import { Gauge, SlidersHorizontal, Bell } from "lucide-react";
import PageHeader from "./PageHeader";
import Button from "./Button";
import {
  InfoBanner,
  CapacityBar,
  MetricTile,
  CompositionBadge,
  AdditionalUsageChoice,
  RequestRoutingField,
  AgentBannerPreview,
  RingInput,
  Field,
  cadenceShort,
} from "./CreditsUsageParts";
import { TENANT_SAMPLE, TEAMS_SAMPLE, AGENTS_SAMPLE, CADENCES, EMAIL_RE } from "./mocks/creditsUsage";

// CreditsUsageMasterDetail — Variant B of the Credits & Usage surface.
//
// Management-first two-pane layout: the tenant-capacity strip stays pinned
// on top, a left rail lists every team plus the two tenant-level controls
// (Spend control, Requests & alerts), and the right pane shows the detail
// of whatever is selected. Same locked model as the incumbent — credit at
// the tenant, quota distributed per team with a per-team cadence — but the
// IA scales to many teams and keeps one thing in focus at a time. All
// sample data is mock; reuses the shared CreditsUsageParts atoms.

const AVATAR_COLORS = [
  "var(--chart-blue)",
  "var(--chart-teal)",
  "var(--chart-lavender)",
  "var(--chart-orange)",
  "var(--chart-pink)",
  "var(--chart-green)",
];

export default function CreditsUsageMasterDetail({ onBack }) {
  const allocatedCap = TENANT_SAMPLE.allocatedCap;
  const [usageMode, setUsageMode] = React.useState("additional");
  const [additionalCap, setAdditionalCap] = React.useState(TENANT_SAMPLE.additionalCap);
  const [teams, setTeams] = React.useState(TEAMS_SAMPLE);
  const [agents, setAgents] = React.useState(AGENTS_SAMPLE);
  const [routingEmail, setRoutingEmail] = React.useState("");
  const [selected, setSelected] = React.useState(`team:${TEAMS_SAMPLE[0].id}`);

  const emailError =
    routingEmail.trim() && !EMAIL_RE.test(routingEmail.trim())
      ? "Enter a valid email address."
      : null;

  const setTeamCadence = (id, cadence) =>
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, cadence } : t)));
  const setTeamPerAgent = (id, perAgent) =>
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, perAgent } : t)));
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

  const usedPct = Math.round((TENANT_SAMPLE.usedThisPeriod / allocatedCap) * 100);
  const selectedTeam = selected.startsWith("team:")
    ? teams.find((t) => `team:${t.id}` === selected)
    : null;

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

      {/* Pinned tenant-capacity strip */}
      <div style={styles.capacityStrip}>
        <div style={styles.capacityTop}>
          <div>
            <h2 style={styles.capacityTitle}>Tenant capacity</h2>
            <p style={styles.capacitySub}>
              {TENANT_SAMPLE.usedThisPeriod.toLocaleString()} of {allocatedCap.toLocaleString()}{" "}
              committed min used · {TENANT_SAMPLE.periodLabel}
            </p>
          </div>
          <Button variant="primary" onClick={handleSave} disabled={Boolean(emailError)} style={{ height: 36, paddingInline: 20 }}>
            Save changes
          </Button>
        </div>
        <div style={styles.capacityBarRow}>
          <span style={styles.capacityPct}>{usedPct}%</span>
          <div style={{ flex: 1 }}>
            <CapacityBar used={TENANT_SAMPLE.usedThisPeriod} total={allocatedCap} height={10} />
          </div>
        </div>
        <div style={styles.kpiRow}>
          <MetricTile label="Committed" value={`${allocatedCap.toLocaleString()} min`} sub="Billed per contract" />
          <MetricTile
            label="Additional cap"
            value={usageMode === "additional" ? `${additionalCap.toLocaleString()} min` : "Off"}
            sub={usageMode === "additional" ? "Allowed on top" : "Hard stop at commitment"}
            chipLabel={usageMode === "additional" ? "Capped" : undefined}
          />
          <MetricTile
            label="Active agents"
            value={`${TENANT_SAMPLE.activeAgents} of ${TENANT_SAMPLE.totalAgents}`}
            sub={`Practiced ${TENANT_SAMPLE.periodLabel.toLowerCase()}`}
          />
        </div>
      </div>

      {/* Two-pane master / detail */}
      <div style={styles.pane}>
        <nav style={styles.rail} aria-label="Credits & Usage sections">
          <span style={styles.railGroupLabel}>Teams</span>
          {teams.map((team) => {
            const pct = team.allocated > 0 ? Math.round((team.used / team.allocated) * 100) : 0;
            const key = `team:${team.id}`;
            const active = selected === key;
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => setSelected(key)}
                aria-current={active ? "true" : undefined}
                style={{ ...styles.railItem, ...(active ? styles.railItemActive : null) }}
              >
                <span style={styles.railItemTop}>
                  <span style={styles.railItemName}>{team.name}</span>
                  <CompositionBadge composition={team.composition} />
                </span>
                <CapacityBar used={team.used} total={team.allocated} height={6} />
                <span style={styles.railItemMeta}>
                  {(agentsByTeam[team.id] || []).length} agents · {pct}% used
                </span>
              </button>
            );
          })}

          <span style={styles.railGroupLabel}>Tenant controls</span>
          <RailControl
            icon={<SlidersHorizontal size={15} />}
            label="Spend control"
            meta={usageMode === "additional" ? "Allow additional — capped" : "Cap spend"}
            active={selected === "spend"}
            onClick={() => setSelected("spend")}
          />
          <RailControl
            icon={<Bell size={15} />}
            label="Requests & alerts"
            meta={routingEmail.trim() && !emailError ? "Routing set" : "Routing not set"}
            active={selected === "requests"}
            onClick={() => setSelected("requests")}
          />
        </nav>

        <div style={styles.detail}>
          {selectedTeam && (
            <TeamDetail
              team={selectedTeam}
              agents={agentsByTeam[selectedTeam.id] || []}
              onCadence={setTeamCadence}
              onPerAgent={setTeamPerAgent}
              onSetAgentQuota={setAgentQuota}
            />
          )}
          {selected === "spend" && (
            <DetailFrame title="Spend control" description="Cap spend, or allow capped additional usage when committed minutes run out.">
              <AdditionalUsageChoice
                mode={usageMode}
                onMode={setUsageMode}
                additionalCap={additionalCap}
                onAdditionalCap={setAdditionalCap}
              />
            </DetailFrame>
          )}
          {selected === "requests" && (
            <DetailFrame title="Requests & alerts" description="Where out-of-quota requests route, plus the agent-facing banner.">
              <RequestRoutingField value={routingEmail} onChange={setRoutingEmail} error={emailError} />
              <AgentBannerPreview />
            </DetailFrame>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Rail + detail ---------------------------------------------------------

function RailControl({ icon, label, meta, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      style={{ ...styles.railControl, ...(active ? styles.railItemActive : null) }}
    >
      <span style={styles.railControlIcon}>{icon}</span>
      <span style={styles.railControlText}>
        <span style={styles.railItemName}>{label}</span>
        <span style={styles.railItemMeta}>{meta}</span>
      </span>
    </button>
  );
}

function DetailFrame({ title, description, children }) {
  return (
    <div style={styles.detailFrame}>
      <header style={styles.detailHeader}>
        <h3 style={styles.detailTitle}>{title}</h3>
        {description && <p style={styles.detailDesc}>{description}</p>}
      </header>
      <div style={styles.detailBody}>{children}</div>
    </div>
  );
}

function TeamDetail({ team, agents, onCadence, onPerAgent, onSetAgentQuota }) {
  const cad = cadenceShort(team.cadence);
  return (
    <DetailFrame
      title={team.name}
      description={`${agents.length} agents · quota distributed ${team.cadence === "day" ? "daily" : team.cadence === "week" ? "weekly" : "monthly"}`}
    >
      <div style={styles.teamControls}>
        <Field label="Quota cadence">
          <CadenceSelect
            value={team.cadence}
            onChange={(v) => onCadence(team.id, v)}
            ariaLabel={`Quota cadence for ${team.name}`}
          />
        </Field>
        <Field label="Per-agent quota">
          <RingInput
            value={team.perAgent}
            onChange={(v) => onPerAgent(team.id, v)}
            suffix={`min${cad}`}
            ariaLabel={`Per-agent quota for ${team.name}`}
          />
        </Field>
      </div>

      <div style={styles.agentList}>
        {agents.map((agent, i) => {
          const quota = agent.hasCustom ? agent.limit : team.perAgent;
          const aPct = quota > 0 ? Math.round((agent.used / quota) * 100) : 0;
          return (
            <div key={agent.id} style={styles.agentRow}>
              <span style={styles.agentIdentity}>
                <Avatar name={agent.name} index={i} />
                <span style={styles.agentName}>{agent.name}</span>
                {agent.hasCustom && <span style={styles.customTag}>Custom</span>}
              </span>
              <div style={styles.agentUsage}>
                <CapacityBar used={agent.used} total={quota} height={6} />
                <span style={styles.agentUsageVal}>
                  {agent.used} / {quota} min{cad} · {aPct}%
                </span>
              </div>
              <RingInput
                value={quota}
                onChange={(v) => onSetAgentQuota(agent.id, v)}
                suffix={`min${cad}`}
                ariaLabel={`Quota for ${agent.name}`}
              />
            </div>
          );
        })}
      </div>
    </DetailFrame>
  );
}

function CadenceSelect({ value, onChange, ariaLabel }) {
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
  column: { display: "flex", flexDirection: "column", gap: 16, width: "100%", fontFamily: "var(--font-sans)" },

  // Capacity strip
  capacityStrip: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    padding: 20,
    background: "#FFFFFF",
    borderRadius: 12,
    border: "1px solid var(--color-border-card-soft)",
  },
  capacityTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  capacityTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  capacitySub: { margin: "4px 0 0", fontSize: 12, color: "var(--color-text-tertiary)" },
  capacityBarRow: { display: "flex", alignItems: "center", gap: 12 },
  capacityPct: { fontSize: 22, fontWeight: 700, color: "var(--color-text-deep)", fontVariantNumeric: "tabular-nums", minWidth: 56 },
  kpiRow: { display: "flex", gap: 12 },

  // Two-pane
  pane: { display: "flex", gap: 16, alignItems: "stretch" },
  rail: {
    width: 268,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: 12,
    background: "#FFFFFF",
    borderRadius: 12,
    border: "1px solid var(--color-border-card-soft)",
    alignSelf: "flex-start",
  },
  railGroupLabel: {
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
    padding: "10px 8px 4px",
  },
  railItem: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid transparent",
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    transition: "background 120ms ease, border-color 120ms ease",
  },
  railItemActive: {
    background: "var(--color-icon-tertiary-bg)",
    border: "1px solid var(--color-icon-tertiary-fg)",
  },
  railItemTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  railItemName: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  railItemMeta: { fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" },
  railControl: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid transparent",
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    transition: "background 120ms ease, border-color 120ms ease",
  },
  railControlIcon: { display: "flex", color: "var(--color-icon-tertiary-fg)", flexShrink: 0 },
  railControlText: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },

  // Detail
  detail: { flex: 1, minWidth: 0 },
  detailFrame: {
    display: "flex",
    flexDirection: "column",
    background: "#FFFFFF",
    borderRadius: 12,
    border: "1px solid var(--color-border-card-soft)",
    minHeight: 420,
  },
  detailHeader: { padding: "16px 20px", borderBottom: "1px solid #F9F9FF" },
  detailTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  detailDesc: { margin: "4px 0 0", fontSize: 12, color: "var(--color-text-tertiary)" },
  detailBody: { display: "flex", flexDirection: "column", gap: 20, padding: 20 },

  teamControls: { display: "flex", gap: 20, flexWrap: "wrap" },

  agentList: { display: "flex", flexDirection: "column" },
  agentRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "12px 0",
    borderBottom: "1px solid var(--color-border-card-soft)",
  },
  agentIdentity: { display: "flex", alignItems: "center", gap: 10, width: 220, flexShrink: 0 },
  agentName: { fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)" },
  customTag: {
    padding: "1px 6px",
    borderRadius: 999,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    fontSize: 10,
    fontWeight: 600,
  },
  agentUsage: { display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 },
  agentUsageVal: { fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" },

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
    fontWeight: 700,
    letterSpacing: "0.2px",
    flexShrink: 0,
  },
};
