"use client";

import React from "react";
import { Gauge } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import PageHeader from "./PageHeader";
import { CREDITS_USAGE_SAMPLE } from "./SettingsPage";

// CreditsUsagePage — Credits & Usage admin surface, streamlined per the
// Jun 2 call (Patch 6). The model locked down to three things, so the
// page is now three small section cards stacked:
//
//   1. Tenant capacity   — read-only hard cap, set by Ops at deployment.
//   2. Agent weekly quota — the only configurable number; one general
//      pool of minutes per agent per week, spent across Roleplay / Guide
//      / Probe (not split per activity).
//   3. Quota-exceeded requests — a single email address that out-of-quota
//      requests route to until Teams-based routing ships.
//
// Everything from the prior design (tenant-pool consumption %, forecast,
// soft threshold, alert levels + recipients, per-roleplay cap, per-agent
// daily/monthly frequency, pool-increase banner, audit log) was stripped
// — without pooling those framings are meaningless. See the patch spec
// §2 for the full removal list; do not reintroduce any of them here.
//
// Wiring scope: presentational with local state so each control shows its
// state. Real persistence lands in a follow-up. The tenant capacity number
// reads from CREDITS_USAGE_SAMPLE.poolMinutes so it stays in sync with the
// Settings card. With a single required field, there's no setup gate, so
// the header carries no setup-complete badge.

const DEFAULT_WEEKLY_QUOTA = 30; // ECI baseline from the Jun 2 call (§3.3)

// Standard email shape — validation is format-only (spec §6 #5). Tenant-
// domain restriction is a future call, not assumed here.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CreditsUsagePage({ onBack }) {
  const [weeklyQuota, setWeeklyQuota] = React.useState(DEFAULT_WEEKLY_QUOTA);
  const [routingEmail, setRoutingEmail] = React.useState("");

  const emailError = routingEmail.trim() && !EMAIL_RE.test(routingEmail.trim())
    ? "Enter a valid email address."
    : null;

  const handleSave = () => {
    if (emailError) return;
    // TODO: persist weekly quota + routing email. Stubbed for now.
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
        subtitle="Set the total practice capacity for your tenant and the weekly quota per agent."
      />

      <div style={styles.topRow}>
        <TenantCapacitySection />
        <AgentWeeklyQuotaSection value={weeklyQuota} onChange={setWeeklyQuota} />
      </div>
      <RequestRoutingSection
        value={routingEmail}
        onChange={setRoutingEmail}
        error={emailError}
      />

      <div style={styles.actionRow}>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={Boolean(emailError)}
          style={{ height: 36, paddingInline: 20 }}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}

// ---- Section 1 — Tenant capacity (read-only) ---------------------------

function TenantCapacitySection() {
  const pool = CREDITS_USAGE_SAMPLE.poolMinutes;
  return (
    <Section
      title="Tenant capacity"
      description="The total practice capacity provisioned for this tenant at deployment."
      style={styles.topRowCard}
    >
      <div style={styles.statTile}>
        <span style={styles.statTileLabel}>Tenant capacity</span>
        <div style={styles.statTileValueRow}>
          <span style={styles.statTileValue}>{pool.toLocaleString()} min</span>
          <span style={styles.chip}>Contracted</span>
        </div>
        <span style={styles.statTileSub}>
          Total practice minutes available to this tenant
        </span>
      </div>
    </Section>
  );
}

// ---- Section 2 — Agent weekly quota (configurable) ---------------------

function AgentWeeklyQuotaSection({ value, onChange }) {
  return (
    <Section
      title="Agent weekly quota"
      description="Set how many practice minutes each agent can use per week across Roleplay, Guide, and Probe."
      style={styles.topRowCard}
    >
      <Field label="Default quota">
        <NumberInput
          value={value}
          onChange={onChange}
          suffix="min / week per agent"
          ariaLabel="Default weekly quota minutes"
        />
        <p style={styles.fieldNote}>
          This single quota covers all Learning Hub activities — Roleplay,
          Guide, and Probe — for each agent.
        </p>
      </Field>
    </Section>
  );
}

// ---- Section 3 — Quota-exceeded request routing ------------------------

function RequestRoutingSection({ value, onChange, error }) {
  return (
    <Section
      title="Quota-exceeded requests"
      description="When an agent exhausts their weekly quota, requests for additional minutes are routed here."
    >
      <Field label="Email address">
        <EmailInput
          value={value}
          onChange={onChange}
          placeholder="admin@yourcompany.example"
          ariaLabel="Request routing email address"
          hasError={Boolean(error)}
        />
        {error && <InlineError message={error} />}
        <p style={styles.fieldNote}>
          Teams-based routing is coming — once you organize agents into Teams,
          requests will route to the relevant team lead automatically.
        </p>
      </Field>
    </Section>
  );
}

// ---- Inputs ------------------------------------------------------------

function NumberInput({ value, onChange, suffix, ariaLabel }) {
  return (
    <label style={styles.numberInput}>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        aria-label={ariaLabel}
        style={styles.numberInputField}
      />
      {suffix && <span style={styles.numberInputSuffix}>{suffix}</span>}
    </label>
  );
}

function EmailInput({ value, onChange, placeholder, ariaLabel, hasError }) {
  return (
    <input
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      aria-invalid={hasError || undefined}
      style={{
        ...styles.emailInput,
        borderColor: hasError ? "var(--color-error)" : "var(--color-border-card-soft)",
      }}
    />
  );
}

// ---- Shared primitives -------------------------------------------------

function Section({ title, description, children, style }) {
  return (
    <Card padX={0} padY={0} style={{ ...styles.sectionCard, ...style }}>
      <header style={styles.sectionHeader}>
        <div style={styles.sectionTitleBlock}>
          <h2 style={styles.sectionTitle}>{title}</h2>
          {description && <p style={styles.sectionDescription}>{description}</p>}
        </div>
      </header>
      <div style={styles.sectionBody}>{children}</div>
    </Card>
  );
}

function Field({ label, children }) {
  return (
    <div style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      <div style={styles.fieldBody}>{children}</div>
    </div>
  );
}

function InlineError({ message }) {
  return (
    <div style={styles.inlineError} role="alert">
      {message}
    </div>
  );
}

// ---- Styles ------------------------------------------------------------

const styles = {
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: "100%",
    fontFamily: "var(--font-sans)",
  },

  // Tenant capacity + Agent weekly quota sit side by side; align-items
  // stretch keeps both cards the same height regardless of content.
  topRow: {
    display: "flex",
    gap: 16,
    alignItems: "stretch",
  },
  topRowCard: {
    flex: 1,
    minWidth: 0,
  },

  // Section / card
  sectionCard: {
    border: "1px solid var(--color-border-card-soft)",
    display: "flex",
    flexDirection: "column",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    padding: "16px 20px",
    borderBottom: "1px solid #F9F9FF",
  },
  sectionTitleBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    lineHeight: "22px",
    color: "var(--color-text-deep)",
  },
  sectionDescription: {
    margin: 0,
    fontSize: 12,
    fontWeight: 400,
    lineHeight: "18px",
    color: "var(--color-text-tertiary)",
  },
  sectionBody: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    padding: 20,
  },

  // Field row
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  fieldBody: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-start",
  },
  fieldNote: {
    margin: 0,
    fontSize: 12,
    fontWeight: 400,
    lineHeight: "18px",
    color: "var(--color-text-tertiary)",
  },

  // Tenant capacity stat tile
  statTile: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "12px 16px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 12,
    background: "#FFFFFF",
  },
  statTileLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  statTileValueRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  statTileValue: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: "28px",
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
  statTileSub: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },
  chip: {
    padding: "2px 8px",
    borderRadius: 999,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.2px",
  },

  // Number input (weekly quota)
  numberInput: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
  },
  numberInputField: {
    width: 80,
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    background: "transparent",
    appearance: "textfield",
  },
  numberInputSuffix: {
    fontSize: 12,
    color: "var(--color-text-tertiary)",
    whiteSpace: "nowrap",
  },

  // Email input (request routing)
  emailInput: {
    width: "100%",
    maxWidth: 360,
    padding: "8px 12px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 120ms ease",
  },

  // Inline error
  inlineError: {
    padding: "8px 12px",
    borderRadius: 8,
    background: "var(--color-error-bg)",
    color: "var(--color-error)",
    fontSize: 12,
    fontWeight: 500,
    lineHeight: "18px",
  },

  // Action row
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: 4,
  },
};
