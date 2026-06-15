"use client";

import React from "react";
import { Gauge, ChevronDown, ChevronRight, Pencil } from "lucide-react";
import PageHeader from "./PageHeader";
import Button from "./Button";
import {
  InfoBanner,
  Section,
  CapacityBar,
  MetricTile,
  CompositionBadge,
  AdditionalUsageChoice,
  RequestRoutingField,
  AgentBannerPreview,
  UsageTrendChart,
  RingInput,
  Field,
  cadenceShort,
} from "./CreditsUsageParts";
import {
  TENANT_SAMPLE,
  TEAMS_SAMPLE,
  AGENTS_SAMPLE,
  TREND_DATA,
  CADENCES,
  EMAIL_RE,
} from "./mocks/creditsUsage";

// CreditsUsageMonitor — Variant C of the Credits & Usage surface.
//
// Monitor-first: the page opens as a read-only "how are we tracking" view
// — KPI tiles, the tenant capacity bar, and the usage trend up top, then
// teams as a read-only usage table. Configuration is revealed on demand:
// "Adjust" expands a team row into its cadence/quota controls + agents,
// and the tenant-level Spend control and Requests panels start as read
// summaries with an inline "Edit" toggle. Same locked model and the same
// shared atoms as the other variants; all sample data is mock.

const AVATAR_COLORS = [
  "var(--chart-blue)",
  "var(--chart-teal)",
  "var(--chart-lavender)",
  "var(--chart-orange)",
  "var(--chart-pink)",
  "var(--chart-green)",
];

export default function CreditsUsageMonitor({ onBack }) {
  const allocatedCap = TENANT_SAMPLE.allocatedCap;
  const [usageMode, setUsageMode] = React.useState("additional");
  const [additionalCap, setAdditionalCap] = React.useState(TENANT_SAMPLE.additionalCap);
  const [teams, setTeams] = React.useState(TEAMS_SAMPLE);
  const [agents, setAgents] = React.useState(AGENTS_SAMPLE);
  const [routingEmail, setRoutingEmail] = React.useState("");
  const [editTeam, setEditTeam] = React.useState(null); // team id whose controls are open
  const [editSpend, setEditSpend] = React.useState(false);
  const [editRequests, setEditRequests] = React.useState(false);

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

      {/* Monitoring summary */}
      <Section
        title="Usage this period"
        description={`${TENANT_SAMPLE.usedThisPeriod.toLocaleString()} of ${allocatedCap.toLocaleString()} committed min used · ${TENANT_SAMPLE.periodLabel}`}
        headerRight={
          <Button variant="primary" onClick={handleSave} disabled={Boolean(emailError)} style={{ height: 36, paddingInline: 20 }}>
            Save changes
          </Button>
        }
      >
        <div style={styles.bar}>
          <div style={styles.barTop}>
            <span style={styles.barPct}>{usedPct}%</span>
            <span style={styles.barNote}>of committed capacity</span>
          </div>
          <CapacityBar used={TENANT_SAMPLE.usedThisPeriod} total={allocatedCap} height={10} />
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
        <UsageTrendChart data={TREND_DATA} />
      </Section>

      {/* Teams — read-only usage, edit on demand */}
      <Section
        title="Teams & agents"
        description="Read-only usage by team. Adjust a team to set its cadence and quotas."
        headerRight={<span style={styles.teamCount}>{teams.length} teams</span>}
      >
        <div style={styles.teamList}>
          {teams.map((team, idx) => (
            <TeamMonitorRow
              key={team.id}
              team={team}
              agents={agentsByTeam[team.id] || []}
              open={editTeam === team.id}
              last={idx === teams.length - 1}
              onToggle={() => setEditTeam((cur) => (cur === team.id ? null : team.id))}
              onCadence={setTeamCadence}
              onPerAgent={setTeamPerAgent}
              onSetAgentQuota={setAgentQuota}
            />
          ))}
        </div>
      </Section>

      {/* Tenant controls — read summary + inline edit */}
      <div style={styles.pairRow}>
        <Section
          title="When capacity runs out"
          description="Cap spend, or allow capped additional usage."
          style={styles.pairCard}
          headerRight={<EditToggle open={editSpend} onClick={() => setEditSpend((o) => !o)} label="spend control" />}
        >
          {editSpend ? (
            <AdditionalUsageChoice
              mode={usageMode}
              onMode={setUsageMode}
              additionalCap={additionalCap}
              onAdditionalCap={setAdditionalCap}
            />
          ) : (
            <ReadRow
              label={usageMode === "additional" ? "Allow additional — capped" : "Cap spend"}
              value={
                usageMode === "additional"
                  ? `Up to ${additionalCap.toLocaleString()} additional min on top of commitment`
                  : "Hard stop once committed minutes are used"
              }
            />
          )}
        </Section>

        <Section
          title="Quota-exceeded requests"
          description="Routing plus the agent-facing banner."
          style={styles.pairCard}
          headerRight={<EditToggle open={editRequests} onClick={() => setEditRequests((o) => !o)} label="requests" />}
        >
          {editRequests ? (
            <>
              <RequestRoutingField value={routingEmail} onChange={setRoutingEmail} error={emailError} />
              <AgentBannerPreview />
            </>
          ) : (
            <ReadRow
              label="Route requests to"
              value={routingEmail.trim() && !emailError ? routingEmail.trim() : "Not set — add an email to route requests"}
            />
          )}
        </Section>
      </div>
    </div>
  );
}

// ---- Pieces ----------------------------------------------------------------

function EditToggle({ open, onClick, label }) {
  return (
    <Button
      variant="text"
      uppercase={false}
      onClick={onClick}
      leadingIcon={<Pencil size={14} />}
      aria-expanded={open ? "true" : "false"}
      style={{ height: 28, color: "var(--do-brand-blue)" }}
    >
      {open ? "Done" : `Edit ${label}`}
    </Button>
  );
}

function ReadRow({ label, value }) {
  return (
    <div style={styles.readRow}>
      <span style={styles.readLabel}>{label}</span>
      <span style={styles.readValue}>{value}</span>
    </div>
  );
}

function TeamMonitorRow({ team, agents, open, last, onToggle, onCadence, onPerAgent, onSetAgentQuota }) {
  const pct = team.allocated > 0 ? Math.round((team.used / team.allocated) * 100) : 0;
  const cad = cadenceShort(team.cadence);
  const cadenceWord = team.cadence === "day" ? "daily" : team.cadence === "week" ? "weekly" : "monthly";

  return (
    <div style={{ ...styles.team, borderBottom: last && !open ? "none" : "1px solid var(--color-border-card-soft)" }}>
      <div style={styles.row}>
        <span style={styles.identity}>
          <span style={styles.teamTitleRow}>
            <span style={styles.teamName}>{team.name}</span>
            <CompositionBadge composition={team.composition} />
          </span>
          <span style={styles.teamAgentCount}>
            {agents.length} agents · {cadenceWord} · {team.perAgent} min{cad}/agent
          </span>
        </span>

        <div style={styles.usage}>
          <CapacityBar used={team.used} total={team.allocated} height={10} />
          <span style={styles.usageVal}>
            {team.used.toLocaleString()} / {team.allocated.toLocaleString()} min · {pct}%
          </span>
        </div>

        <Button
          variant="text"
          uppercase={false}
          onClick={onToggle}
          aria-expanded={open ? "true" : "false"}
          trailingIcon={open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          style={{ height: 32, color: "var(--do-brand-blue)", flexShrink: 0 }}
        >
          {open ? "Done" : "Adjust"}
        </Button>
      </div>

      {open && (
        <div style={styles.editPanel}>
          <div style={styles.teamControls}>
            <Field label="Quota cadence">
              <CadenceSelect value={team.cadence} onChange={(v) => onCadence(team.id, v)} ariaLabel={`Quota cadence for ${team.name}`} />
            </Field>
            <Field label="Per-agent quota">
              <RingInput value={team.perAgent} onChange={(v) => onPerAgent(team.id, v)} suffix={`min${cad}`} ariaLabel={`Per-agent quota for ${team.name}`} />
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
                  </span>
                  <div style={styles.agentUsage}>
                    <CapacityBar used={agent.used} total={quota} height={6} />
                    <span style={styles.agentUsageVal}>
                      {agent.used} / {quota} min{cad} · {aPct}%
                    </span>
                  </div>
                  <RingInput value={quota} onChange={(v) => onSetAgentQuota(agent.id, v)} suffix={`min${cad}`} ariaLabel={`Quota for ${agent.name}`} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
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

  bar: { display: "flex", flexDirection: "column", gap: 8 },
  barTop: { display: "flex", alignItems: "baseline", gap: 8 },
  barPct: { fontSize: 22, fontWeight: 600, color: "var(--color-text-deep)", fontVariantNumeric: "tabular-nums" },
  barNote: { fontSize: 12, color: "var(--color-text-tertiary)" },
  kpiRow: { display: "flex", gap: 12 },

  teamCount: {
    padding: "3px 10px",
    borderRadius: 999,
    background: "var(--color-card-emoji-bg)",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    whiteSpace: "nowrap",
  },

  teamList: { display: "flex", flexDirection: "column" },
  team: { display: "flex", flexDirection: "column" },
  row: { display: "flex", alignItems: "center", gap: 20, padding: "16px 4px" },

  identity: { display: "flex", flexDirection: "column", gap: 3, width: 260, flexShrink: 0 },
  teamTitleRow: { display: "flex", alignItems: "center", gap: 8 },
  teamName: { fontSize: 15, fontWeight: 600, color: "var(--color-text-deep)" },
  teamAgentCount: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },

  usage: { display: "flex", flexDirection: "column", gap: 7, flex: 1, minWidth: 0 },
  usageVal: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" },

  editPanel: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: "8px 8px 16px 8px",
    background: "var(--color-card-emoji-bg)",
    borderRadius: 10,
    marginBottom: 12,
  },
  teamControls: { display: "flex", gap: 20, flexWrap: "wrap", padding: "8px 8px 0" },

  agentList: { display: "flex", flexDirection: "column", paddingInline: 8 },
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

  readRow: { display: "flex", flexDirection: "column", gap: 4 },
  readLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  readValue: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)" },

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

  pairRow: { display: "flex", gap: 16, alignItems: "stretch" },
  pairCard: { flex: 1, minWidth: 0 },
};
