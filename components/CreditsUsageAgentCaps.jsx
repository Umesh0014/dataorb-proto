"use client";

import React from "react";
import { Gauge, CheckCircle2, AlertTriangle, CircleSlash } from "lucide-react";
import PageHeader from "./PageHeader";
import Button from "./Button";
import {
  InfoBanner,
  Section,
  MetricTile,
  CapacityBar,
  AdditionalUsageChoice,
  AgentBannerPreview,
  RingInput,
  Field,
  FieldNote,
} from "./CreditsUsageParts";
import {
  POOL_SAMPLE,
  AGENT_CAP_DEFAULTS,
  AGENT_SESSION_SAMPLE,
  OVERAGE_RULES,
} from "./mocks/creditsUsage";

// CreditsUsageAgentCaps — Variant D of the Credits & Usage surface.
//
// The Jun 15 V1 scope: team-level distribution is deferred, so this is an
// org-level, per-agent design. Tenant credit-utilization up top (pool given
// / consumed / remaining over the period), then the V1 control — a per-agent
// WEEKLY session cap with an optional per-day cap, an estimated-impact banner
// on the cap, and a single overage rule (hard stop / allow-after-request /
// manual). The agent table shows weekly session usage, status (green→red at
// ≥90%), last active, and a per-agent override. Tenure tags are surfaced now;
// filtering by tag is a later version. All sample data is mock.

const AVATAR_COLORS = [
  "var(--chart-blue)",
  "var(--chart-teal)",
  "var(--chart-lavender)",
  "var(--chart-orange)",
  "var(--chart-pink)",
  "var(--chart-green)",
];

const TAG_TONES = {
  Tenured: { bg: "var(--tile-emerald-bg)", fg: "var(--tile-emerald-fg)" },
  New: { bg: "var(--tile-blue-bg)", fg: "var(--tile-blue-fg)" },
  Onboarding: { bg: "var(--tile-orange-bg)", fg: "var(--tile-orange-fg)" },
};

const OVERRIDE_OPTIONS = [
  { id: "default", label: "Follow rule" },
  { id: "allow", label: "Allow overage" },
  { id: "manual", label: "Hold at cap" },
];

export default function CreditsUsageAgentCaps({ onBack }) {
  const [usageMode, setUsageMode] = React.useState("additional");
  const [additionalCap, setAdditionalCap] = React.useState(4000);
  const [weeklyCap, setWeeklyCap] = React.useState(AGENT_CAP_DEFAULTS.weeklySessionCap);
  const [perDayEnabled, setPerDayEnabled] = React.useState(AGENT_CAP_DEFAULTS.perDayEnabled);
  const [perDayCap, setPerDayCap] = React.useState(AGENT_CAP_DEFAULTS.perDayCap);
  const [overageRule, setOverageRule] = React.useState(AGENT_CAP_DEFAULTS.overageRule);
  const [agents, setAgents] = React.useState(AGENT_SESSION_SAMPLE);

  const setOverride = (id, override) =>
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, override } : a)));

  // Estimated impact: how many agents are already over the weekly cap, so
  // the admin sees the consequence of the number before saving.
  const overCapCount = agents.filter((a) => a.sessionsUsed > weeklyCap).length;

  const consumedPct = Math.round((POOL_SAMPLE.consumedMinutes / POOL_SAMPLE.totalMinutes) * 100);

  const handleSave = () => {
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
        subtitle="Manage practice capacity, per-agent session limits, and usage visibility for your tenant."
      />

      <InfoBanner />

      {/* Tenant credit utilisation */}
      <Section
        title="Credit utilisation"
        description={`${POOL_SAMPLE.consumedMinutes.toLocaleString()} of ${POOL_SAMPLE.totalMinutes.toLocaleString()} committed min used · ${POOL_SAMPLE.periodLabel}`}
        headerRight={
          <Button variant="primary" onClick={handleSave} style={{ height: 36, paddingInline: 20 }}>
            Save changes
          </Button>
        }
      >
        <div style={styles.bar}>
          <div style={styles.barTop}>
            <span style={styles.barPct}>{consumedPct}%</span>
            <span style={styles.barNote}>of committed capacity consumed</span>
          </div>
          <CapacityBar used={POOL_SAMPLE.consumedMinutes} total={POOL_SAMPLE.totalMinutes} height={10} />
        </div>
        <div style={styles.kpiRow}>
          <MetricTile label="Total pool" value={`${POOL_SAMPLE.totalMinutes.toLocaleString()} min`} sub={`Committed · ${POOL_SAMPLE.periodLabel}`} />
          <MetricTile label="Consumed" value={`${POOL_SAMPLE.consumedMinutes.toLocaleString()} min`} sub="Across role play, guide & probe" />
          <MetricTile label="Remaining" value={`${POOL_SAMPLE.remainingMinutes.toLocaleString()} min`} sub={`Resets in ${POOL_SAMPLE.daysToReset} days`} />
        </div>
      </Section>

      {/* Billing + session limits side by side to use the horizontal space */}
      <div style={styles.pairRow}>
      <Section
        title="When the pool runs out"
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

      {/* V1 control — per-agent weekly session limits */}
      <Section
        title="Practice session limits"
        description="A weekly session cap applies to every agent over a Mon–Sun window."
        style={styles.pairCard}
      >
        <div style={styles.limitsRow}>
          <Field label="Weekly session cap">
            <RingInput
              value={weeklyCap}
              onChange={setWeeklyCap}
              suffix="sessions/wk"
              ariaLabel="Weekly session cap"
            />
          </Field>
          <Field label="Daily limit">
            <div style={styles.dayLimit}>
              <button
                type="button"
                role="switch"
                aria-checked={perDayEnabled}
                aria-label="Also cap sessions per day"
                onClick={() => setPerDayEnabled((v) => !v)}
                style={{
                  ...styles.switchBtn,
                  background: perDayEnabled ? "var(--color-icon-tertiary-fg)" : "var(--color-card-emoji-bg)",
                  borderColor: perDayEnabled ? "var(--color-icon-tertiary-fg)" : "var(--color-border-card-soft)",
                }}
              >
                <span
                  style={{
                    ...styles.switchKnob,
                    transform: perDayEnabled ? "translateX(16px)" : "translateX(0)",
                    background: "#FFFFFF",
                  }}
                />
              </button>
              <span style={styles.dayLimitLabel}>Also cap sessions per day</span>
              {perDayEnabled && (
                <RingInput
                  value={perDayCap}
                  onChange={setPerDayCap}
                  suffix="sessions/day"
                  ariaLabel="Sessions per day cap"
                  width={56}
                />
              )}
            </div>
          </Field>
        </div>

        {/* Estimated-impact banner */}
        {overCapCount > 0 && (
          <div style={styles.impact} role="status">
            <AlertTriangle size={15} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
            <span style={styles.impactText}>
              <strong>{overCapCount} agents</strong> are over {weeklyCap} sessions this week — they&apos;ll be
              limited at the next weekly reset (in {POOL_SAMPLE.daysToReset} days).
            </span>
          </div>
        )}

        <Field label="When an agent reaches the cap">
          <div style={styles.ruleGroup} role="radiogroup" aria-label="Overage rule">
            {OVERAGE_RULES.map((rule) => {
              const selected = overageRule === rule.id;
              return (
                <button
                  key={rule.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setOverageRule(rule.id)}
                  style={{
                    ...styles.ruleOption,
                    borderColor: selected ? "var(--color-icon-tertiary-fg)" : "var(--color-border-card-soft)",
                    background: selected ? "var(--color-icon-tertiary-bg)" : "#FFFFFF",
                  }}
                >
                  <span style={styles.ruleDot}>
                    {selected && <span style={styles.ruleDotInner} />}
                  </span>
                  <span style={styles.ruleText}>
                    <span style={styles.ruleLabel}>{rule.label}</span>
                    <span style={styles.ruleDesc}>{rule.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </Field>

        <AgentBannerPreview />
      </Section>
      </div>

      {/* Per-agent usage */}
      <Section
        title="Agent usage"
        description="Weekly practice sessions per agent. Tenure tags are shown now; filtering by tag comes later."
        headerRight={<span style={styles.count}>{agents.length} agents</span>}
      >
        <div style={styles.agentList}>
          {agents.map((agent, i) => (
            <AgentRow
              key={agent.id}
              agent={agent}
              index={i}
              cap={weeklyCap}
              overageRule={overageRule}
              onOverride={setOverride}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

// ---- Agent row -------------------------------------------------------------

function AgentRow({ agent, index, cap, overageRule, onOverride }) {
  const pct = cap > 0 ? Math.round((agent.sessionsUsed / cap) * 100) : 0;
  const status = pct >= 100 ? "atCap" : pct >= 90 ? "near" : "ok";
  const meta = STATUS_META[status];
  const StatusIcon = meta.Icon;

  return (
    <div style={styles.agentRow}>
      <span style={styles.agentIdentity}>
        <Avatar name={agent.name} index={index} />
        <span style={styles.agentNameBlock}>
          <span style={styles.agentName}>{agent.name}</span>
          <TagBadge tag={agent.tag} />
        </span>
      </span>

      <div style={styles.agentUsage}>
        <CapacityBar used={agent.sessionsUsed} total={cap} height={6} />
        <span style={styles.agentUsageVal}>
          {agent.sessionsUsed} / {cap} sessions · last active {agent.lastActive}
        </span>
      </div>

      <span style={{ ...styles.status, color: meta.color }}>
        <StatusIcon size={14} aria-hidden="true" />
        {meta.label}
      </span>

      <label style={styles.overrideWrap}>
        <span style={styles.srOnly}>Overage for {agent.name}</span>
        <select
          value={agent.override}
          onChange={(e) => onOverride(agent.id, e.target.value)}
          aria-label={`Overage rule for ${agent.name}`}
          disabled={overageRule !== "manual"}
          style={{
            ...styles.overrideSelect,
            opacity: overageRule === "manual" ? 1 : 0.5,
            cursor: overageRule === "manual" ? "pointer" : "not-allowed",
          }}
        >
          {OVERRIDE_OPTIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

const STATUS_META = {
  ok: { label: "On track", color: "var(--color-success)", Icon: CheckCircle2 },
  near: { label: "Near limit", color: "var(--color-warning)", Icon: AlertTriangle },
  atCap: { label: "At cap", color: "var(--color-error)", Icon: CircleSlash },
};

function TagBadge({ tag }) {
  const tone = TAG_TONES[tag] || TAG_TONES.New;
  return <span style={{ ...styles.tag, background: tone.bg, color: tone.fg }}>{tag}</span>;
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

  pairRow: { display: "flex", gap: 16, alignItems: "flex-start" },
  pairCard: { flex: 1, minWidth: 0 },

  limitsRow: { display: "flex", gap: 28, flexWrap: "wrap" },
  dayLimit: { display: "flex", alignItems: "center", gap: 10 },
  switchBtn: {
    width: 36,
    height: 20,
    borderRadius: 999,
    border: "1px solid",
    padding: 1,
    cursor: "pointer",
    flexShrink: 0,
    transition: "background 120ms ease, border-color 120ms ease",
  },
  switchKnob: {
    display: "block",
    width: 16,
    height: 16,
    borderRadius: "50%",
    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
    transition: "transform 120ms ease",
  },
  dayLimitLabel: { fontSize: 13, color: "var(--color-text-medium)" },

  impact: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 10,
    background: "var(--color-warning-bg)",
    border: "1px solid rgba(239, 108, 0, 0.18)",
  },
  impactText: { fontSize: 12, fontWeight: 500, lineHeight: "18px", color: "var(--color-warning-text)" },

  ruleGroup: { display: "flex", flexDirection: "column", gap: 8, width: "100%" },
  ruleOption: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "12px 16px",
    borderRadius: 10,
    border: "1.5px solid",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    width: "100%",
    transition: "border-color 120ms ease, background 120ms ease",
  },
  ruleDot: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    border: "2px solid var(--color-icon-tertiary-fg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  ruleDotInner: { width: 9, height: 9, borderRadius: "50%", background: "var(--color-icon-tertiary-fg)" },
  ruleText: { display: "flex", flexDirection: "column", gap: 2 },
  ruleLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  ruleDesc: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: "18px" },

  count: {
    padding: "3px 10px",
    borderRadius: 999,
    background: "var(--color-card-emoji-bg)",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    whiteSpace: "nowrap",
  },

  agentList: { display: "flex", flexDirection: "column" },
  agentRow: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    padding: "14px 4px",
    borderBottom: "1px solid var(--color-border-card-soft)",
  },
  agentIdentity: { display: "flex", alignItems: "center", gap: 10, width: 220, flexShrink: 0 },
  agentNameBlock: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  agentName: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  tag: {
    alignSelf: "flex-start",
    padding: "1px 8px",
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.2px",
  },

  agentUsage: { display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 },
  agentUsageVal: { fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums" },

  status: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    width: 96,
    flexShrink: 0,
    fontSize: 12,
    fontWeight: 600,
  },

  overrideWrap: { flexShrink: 0 },
  overrideSelect: {
    height: 34,
    padding: "0 10px",
    borderRadius: 8,
    border: "1px solid var(--color-border-card-soft)",
    background: "#FFFFFF",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-medium)",
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

  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    whiteSpace: "nowrap",
    border: 0,
  },
};
