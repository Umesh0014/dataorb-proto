"use client";

import React from "react";
import {
  Check,
  Download,
  Gauge,
  Info,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Toggle from "./Toggle";
import PageHeader from "./PageHeader";
import Banner from "./Banner";
import {
  CREDITS_USAGE_SAMPLE,
  poolBarTone,
  poolPercentUsed,
} from "./SettingsPage";

// CreditsUsagePage — Surface B of the Credits & Usage feature (spec §4).
//
// Single config page reached from the Settings landing's Credits & Usage
// card. Sections render top-to-bottom: Overview (4 metric tiles +
// progress bar, with Consumption forecast as the 4th tile), Limits,
// Alerts, Audit log. Edge-case banners surface above the section stack
// when their trigger condition holds. The Pool exhaustion mode card was
// removed in the revisions pass — with the only required setting gone,
// the page header no longer carries a setup-complete badge.
//
// Wiring scope (spec §2): the page is presentational with local state
// so every control demonstrates its state. Real persistence, audit
// emission, and CSV export wiring land in a follow-up. The pool stat
// reads from the same CREDITS_USAGE_SAMPLE that powers the Settings
// card so both surfaces stay in sync.

const ALERT_LEVELS = [75, 90, 100];

const DEFAULT_RECIPIENTS = [
  { id: "alice", name: "Alice Martin", email: "alice@dataorb.example" },
  { id: "bilal", name: "Bilal Khan",   email: "bilal@dataorb.example" },
  { id: "chiyo", name: "Chiyo Tanaka", email: "chiyo@dataorb.example" },
  { id: "dawit", name: "Dawit Hailu",  email: "dawit@dataorb.example" },
];

const AUDIT_LOG_SAMPLE = [
  { id: "a-1", at: "May 22, 2026 · 14:08", who: "Alice Martin", change: "Soft threshold raised 75% → 80%" },
  { id: "a-2", at: "May 18, 2026 · 09:41", who: "Bilal Khan",   change: "Per-agent cap turned on (120 min / month)" },
  { id: "a-3", at: "May 12, 2026 · 17:22", who: "Alice Martin", change: "Alert recipient added — Chiyo Tanaka" },
  { id: "a-4", at: "May 02, 2026 · 11:05", who: "DataOrb Ops",  change: "Pool increased 18,000 → 24,000 min" },
  { id: "a-5", at: "Apr 28, 2026 · 16:30", who: "Alice Martin", change: "Setup completed — Mode A selected" },
];

const FORECAST_TODAY = { d: 12, D: 30 };

export default function CreditsUsagePage({ onBack }) {
  // ---- Settings state (sample defaults from spec §4.2) -----------------
  const [softThreshold, setSoftThreshold] = React.useState(80);
  const [alertEnabled, setAlertEnabled] = React.useState({ 75: true, 90: true, 100: true });
  const [recipients, setRecipients] = React.useState(DEFAULT_RECIPIENTS.map((r) => r.id));
  const [perRoleplayEnabled, setPerRoleplayEnabled] = React.useState(false);
  const [perRoleplayCap, setPerRoleplayCap] = React.useState(45);
  const [perAgentEnabled, setPerAgentEnabled] = React.useState(false);
  const [perAgentCap, setPerAgentCap] = React.useState(120);
  const [perAgentFrequency, setPerAgentFrequency] = React.useState("monthly"); // "daily" | "monthly"
  const [poolIncreaseDismissed, setPoolIncreaseDismissed] = React.useState(false);

  // Per-roleplay cap inline error: cap < MTD consumed (spec §4.5).
  const mtdConsumedRoleplayMinutes = 52; // sample
  const perRoleplayError = perRoleplayEnabled && perRoleplayCap < mtdConsumedRoleplayMinutes
    ? `Cap (${perRoleplayCap} min) is below already-consumed (${mtdConsumedRoleplayMinutes} min) for this month. Choose ≥${mtdConsumedRoleplayMinutes} or wait until the next cycle.`
    : null;

  const handleSave = () => {
    if (perRoleplayError) return;
    // TODO: persist settings + emit audit entries. Stubbed for now.
    // eslint-disable-next-line no-console
    console.log("save credits & usage settings");
  };

  return (
    <div style={styles.column}>
      <PageHeader
        breadcrumb={[
          { label: "Settings", onClick: onBack },
          { label: "Learning Hub" },
          { label: "Credits & Usage" },
        ]}
        back={onBack}
        identifier={{
          icon: <Gauge size={16} color="var(--color-icon-tertiary-fg)" />,
          label: "Credits & Usage",
          iconBg: "var(--color-icon-tertiary-bg)",
          iconColor: "var(--color-icon-tertiary-fg)",
        }}
        subtitle="Manage Learning Hub credit allocation and usage limits."
      />

      {!poolIncreaseDismissed && (
        <Banner
          tone="info"
          heading="Pool increased to 24,000 min"
          body="Pool increased from 18,000 to 24,000 min on May 02. Review caps and thresholds."
          actions={[{ label: "Dismiss", onClick: () => setPoolIncreaseDismissed(true) }]}
        />
      )}

      <OverviewSection />
      <LimitsSection
        perRoleplayEnabled={perRoleplayEnabled}
        onPerRoleplayToggle={setPerRoleplayEnabled}
        perRoleplayCap={perRoleplayCap}
        onPerRoleplayCapChange={setPerRoleplayCap}
        perRoleplayError={perRoleplayError}
        perAgentEnabled={perAgentEnabled}
        onPerAgentToggle={setPerAgentEnabled}
        perAgentCap={perAgentCap}
        onPerAgentCapChange={setPerAgentCap}
        perAgentFrequency={perAgentFrequency}
        onPerAgentFrequencyChange={setPerAgentFrequency}
      />
      <AlertsSection
        softThreshold={softThreshold}
        onSoftThresholdChange={setSoftThreshold}
        alertEnabled={alertEnabled}
        onAlertToggle={(level, next) =>
          setAlertEnabled((cur) => ({ ...cur, [level]: next }))
        }
        recipients={recipients}
        onRecipientsChange={setRecipients}
      />
      <AuditSection />

      <div style={styles.actionRow}>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={Boolean(perRoleplayError)}
          style={{ height: 36, paddingInline: 20 }}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}

// ---- Overview ----------------------------------------------------------

function OverviewSection() {
  const pool = CREDITS_USAGE_SAMPLE.poolMinutes;
  const consumed = CREDITS_USAGE_SAMPLE.consumedMTD;
  const pct = poolPercentUsed(CREDITS_USAGE_SAMPLE);
  const tone = poolBarTone(pct);
  const fillPct = Math.min(100, pct);
  const consumedHrs = (consumed / 60).toFixed(1);
  const poolHrs = (pool / 60).toFixed(0);
  const forecast = computeForecast(pool, consumed, FORECAST_TODAY.d, FORECAST_TODAY.D);

  return (
    <Section title="Overview" description="Tenant pool, consumption to date, and end-of-month forecast.">
      <div style={styles.overviewGrid}>
        <ReadonlyStat
          label="Tenant pool"
          value={`${pool.toLocaleString()} min`}
          sub={`${poolHrs} hrs · contracted`}
        />
        <ReadonlyStat
          label="Consumed this month"
          value={`${consumed.toLocaleString()} min`}
          sub={`${consumedHrs} hrs`}
        />
        <ReadonlyStat
          label="% pool used"
          value={`${pct}%`}
          sub={pct >= 100 ? "Overage active" : pct >= 90 ? "Critical" : pct >= 80 ? "Warning" : "Healthy"}
          tone={tone.fg}
        />
        <ReadonlyStat
          label="Consumption forecast"
          value={forecast.primary}
          sub={forecast.tertiary}
        />
      </div>
      <div style={styles.overviewBar}>
        <span style={{ ...styles.barTrack, background: tone.bg }} aria-hidden="true">
          <span
            style={{
              ...styles.barFill,
              width: `${fillPct}%`,
              background: tone.fg,
            }}
          />
        </span>
        <span style={{ ...styles.barLabel, color: tone.fg }}>{pct}%</span>
      </div>
    </Section>
  );
}

// computeForecast — maps the four §1.3 forecast states onto the existing
// ReadonlyStat tile's primary + tertiary slots. Returns plain strings so
// the tile inherits its default color (no health tinting per spec §1.2 —
// the "% pool used" tile already carries the color-coded health state).
//
//   d  — current day-of-month
//   D  — last day of month
//   Confidence band: ±15% for d 7–13, ±8% for d ≥ 14. Band omitted in
//   the insufficient-data and pool-exceeded states.
function computeForecast(pool, consumed, d, D) {
  if (d < 7) {
    return { primary: "—", tertiary: "Forecast available after Day 7" };
  }
  if (consumed >= pool) {
    const overage = consumed - pool;
    return { primary: `+${overage.toLocaleString()} min`, tertiary: "Overage active" };
  }
  const band = d >= 14 ? "±8%" : "±15%";
  const dailyRate = consumed / Math.max(1, d);
  const projectedMonthEnd = Math.round(consumed + dailyRate * (D - d));
  const exhaustsDay = Math.ceil(d + (pool - consumed) / Math.max(1, dailyRate));
  if (exhaustsDay >= D) {
    return { primary: `${projectedMonthEnd.toLocaleString()} min`, tertiary: `On track · ${band}` };
  }
  return { primary: `Day ${exhaustsDay}`, tertiary: `Confidence band ${band}` };
}

// Tenant-pool read-only stat tile.
function ReadonlyStat({ label, value, sub, tone }) {
  return (
    <div style={styles.statTile}>
      <span style={styles.statTileLabel}>{label}</span>
      <span style={{ ...styles.statTileValue, color: tone || "var(--color-text-deep)" }}>{value}</span>
      {sub && <span style={styles.statTileSub}>{sub}</span>}
    </div>
  );
}

// ---- Alerts ------------------------------------------------------------

function AlertsSection({
  softThreshold,
  onSoftThresholdChange,
  alertEnabled,
  onAlertToggle,
  recipients,
  onRecipientsChange,
}) {
  return (
    <Section
      title="Alerts"
      description="Warn admins as the pool approaches its cap and pick who hears about it."
    >
      <Field
        label="Soft threshold"
        helper={`Triggers a warning email when usage crosses ${softThreshold}%. Range 50–100%.`}
      >
        <div style={styles.sliderRow}>
          <input
            type="range"
            min={50}
            max={100}
            step={5}
            value={softThreshold}
            onChange={(e) => onSoftThresholdChange(Number(e.target.value))}
            aria-label="Soft threshold percent"
            style={styles.slider}
          />
          <span style={styles.sliderValue}>{softThreshold}%</span>
        </div>
      </Field>

      <Field
        label="Alert levels"
        helper="Each level fires an in-app notification and email when crossed for the first time this month."
      >
        <div style={styles.alertLevels}>
          {ALERT_LEVELS.map((level) => (
            <div key={level} style={styles.alertLevelRow}>
              <div style={styles.alertLevelLabel}>
                <span style={styles.alertLevelPct}>{level}%</span>
                <span style={styles.alertLevelMeta}>
                  {level === 100 ? "Pool exhausted" : level === 90 ? "Critical" : "Warning"}
                </span>
              </div>
              <Toggle
                enabled={alertEnabled[level]}
                onChange={(next) => onAlertToggle(level, next)}
                ariaLabel={`Alert at ${level}%`}
              />
            </div>
          ))}
        </div>
      </Field>

      <Field
        label="Recipients"
        helper="Defaults to all tenant admins. Pick a subset to limit who gets notified."
      >
        <RecipientList
          options={DEFAULT_RECIPIENTS}
          selected={recipients}
          onChange={onRecipientsChange}
        />
      </Field>
    </Section>
  );
}

function RecipientList({ options, selected, onChange }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };
  return (
    <div style={styles.recipientList}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            aria-pressed={isSelected}
            style={{
              ...styles.recipientChip,
              background: isSelected ? "var(--color-info-bg)" : "#FFFFFF",
              borderColor: isSelected ? "var(--color-info)" : "var(--color-border-card-soft)",
            }}
          >
            <span style={styles.recipientCheck} aria-hidden="true">
              {isSelected && <Check size={12} color="var(--color-info)" strokeWidth={3} />}
            </span>
            <span style={styles.recipientName}>{opt.name}</span>
            <span style={styles.recipientEmail}>{opt.email}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---- Limits ------------------------------------------------------------

function LimitsSection({
  perRoleplayEnabled,
  onPerRoleplayToggle,
  perRoleplayCap,
  onPerRoleplayCapChange,
  perRoleplayError,
  perAgentEnabled,
  onPerAgentToggle,
  perAgentCap,
  onPerAgentCapChange,
  perAgentFrequency,
  onPerAgentFrequencyChange,
}) {
  return (
    <Section
      title="Limits"
      description="Optional caps that protect the pool from a single roleplay or agent over-consuming."
    >
      <Field
        label="Per-roleplay minute cap"
        helper="Maximum minutes a single roleplay can consume per month. Off by default."
        action={(
          <Toggle
            enabled={perRoleplayEnabled}
            onChange={onPerRoleplayToggle}
            ariaLabel="Per-roleplay cap on"
          />
        )}
      >
        {perRoleplayEnabled && (
          <div style={styles.limitRow}>
            <NumberInput
              value={perRoleplayCap}
              onChange={onPerRoleplayCapChange}
              suffix="min / month"
              ariaLabel="Per-roleplay cap minutes"
              hasError={Boolean(perRoleplayError)}
            />
          </div>
        )}
        {perRoleplayError && <InlineError message={perRoleplayError} />}
      </Field>

      <Field
        label="Per-agent cap"
        helper="Maximum minutes any one agent can consume in the selected window. Off by default."
        action={(
          <Toggle
            enabled={perAgentEnabled}
            onChange={onPerAgentToggle}
            ariaLabel="Per-agent cap on"
          />
        )}
      >
        {perAgentEnabled && (
          <div style={styles.limitRow}>
            <NumberInput
              value={perAgentCap}
              onChange={onPerAgentCapChange}
              suffix="min"
              ariaLabel="Per-agent cap minutes"
            />
            <FrequencySelect
              value={perAgentFrequency}
              onChange={onPerAgentFrequencyChange}
            />
          </div>
        )}
      </Field>
    </Section>
  );
}

function FrequencySelect({ value, onChange }) {
  // Phase 1 ships Daily + Monthly. Weekly flagged for stakeholder
  // confirmation (spec §10 #2) — rendered disabled with a note for now.
  return (
    <div style={styles.segmented} role="radiogroup" aria-label="Per-agent cap frequency">
      {[
        { id: "daily",   label: "Daily" },
        { id: "weekly",  label: "Weekly", disabled: true },
        { id: "monthly", label: "Monthly" },
      ].map((opt) => {
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={opt.disabled}
            role="radio"
            aria-checked={selected}
            onClick={() => !opt.disabled && onChange(opt.id)}
            title={opt.disabled ? "Weekly cap — pending stakeholder confirmation" : undefined}
            style={{
              ...styles.segmentedBtn,
              background: selected ? "var(--do-brand-blue)" : "transparent",
              color: selected
                ? "#FFFFFF"
                : opt.disabled
                  ? "var(--color-text-placeholder)"
                  : "var(--color-text-medium)",
              cursor: opt.disabled ? "not-allowed" : "pointer",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function NumberInput({ value, onChange, suffix, ariaLabel, hasError }) {
  return (
    <label style={{ ...styles.numberInput, borderColor: hasError ? "var(--color-error)" : "var(--color-border-card-soft)" }}>
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

// ---- Audit -------------------------------------------------------------

function AuditSection() {
  const handleExport = () => {
    // TODO: wire CSV export — stubbed for now.
    // eslint-disable-next-line no-console
    console.log("export audit log csv");
  };
  return (
    <Section
      title="Audit log"
      description="Every settings change for the last 30 days. Export the full log as CSV."
      action={(
        <Button
          variant="text"
          onClick={handleExport}
          leadingIcon={<Download size={14} />}
          style={{ height: 32, paddingInline: 12 }}
        >
          Export CSV
        </Button>
      )}
    >
      <table style={styles.auditTable}>
        <thead>
          <tr>
            <th style={{ ...styles.auditTh, width: "26%" }}>When</th>
            <th style={{ ...styles.auditTh, width: "22%" }}>Who</th>
            <th style={styles.auditTh}>Change</th>
          </tr>
        </thead>
        <tbody>
          {AUDIT_LOG_SAMPLE.map((row) => (
            <tr key={row.id}>
              <td style={styles.auditTd}>{row.at}</td>
              <td style={styles.auditTd}>{row.who}</td>
              <td style={styles.auditTd}>{row.change}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

// ---- Shared primitives -------------------------------------------------

function Section({ title, description, required, action, children }) {
  return (
    <Card padX={0} padY={0} style={styles.sectionCard}>
      <header style={styles.sectionHeader}>
        <div style={styles.sectionTitleBlock}>
          <div style={styles.sectionTitleRow}>
            <h2 style={styles.sectionTitle}>{title}</h2>
            {required && <span style={styles.requiredBadge}>Required</span>}
          </div>
          {description && <p style={styles.sectionDescription}>{description}</p>}
        </div>
        {action}
      </header>
      <div style={styles.sectionBody}>{children}</div>
    </Card>
  );
}

function Field({ label, helper, action, children }) {
  return (
    <div style={styles.field}>
      <div style={styles.fieldHead}>
        <div style={styles.fieldHeadText}>
          <span style={styles.fieldLabel}>{label}</span>
          {helper && <span style={styles.fieldHelper}>{helper}</span>}
        </div>
        {action}
      </div>
      {children && <div style={styles.fieldBody}>{children}</div>}
    </div>
  );
}

function InlineError({ message }) {
  return (
    <div style={styles.inlineError} role="alert">
      <Info size={14} color="var(--color-error)" aria-hidden="true" />
      <span>{message}</span>
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
  sectionTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    lineHeight: "22px",
    color: "var(--color-text-deep)",
  },
  requiredBadge: {
    padding: "2px 8px",
    borderRadius: 999,
    background: "var(--color-warning-bg)",
    color: "var(--color-warning)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.2px",
    textTransform: "uppercase",
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
  fieldHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  fieldHeadText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  fieldHelper: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    lineHeight: "18px",
  },
  fieldBody: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  // Overview stats + bar. Auto-fit handles 4-at-desktop → 2×2 → 1
  // wrapping without bespoke breakpoints (minmax floor 180px clamps the
  // tile so labels stay legible before they wrap).
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
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
  statTileValue: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: "28px",
    fontVariantNumeric: "tabular-nums",
  },
  statTileSub: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },
  overviewBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    display: "block",
  },
  barFill: {
    display: "block",
    height: "100%",
    borderRadius: 3,
    transition: "width 200ms ease",
  },
  barLabel: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    minWidth: 44,
    textAlign: "right",
  },

  // Alerts
  sliderRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    maxWidth: 360,
  },
  slider: {
    flex: 1,
    accentColor: "var(--do-brand-blue)",
  },
  sliderValue: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    minWidth: 44,
    textAlign: "right",
    color: "var(--color-text-deep)",
  },
  alertLevels: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  alertLevelRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 8,
    background: "var(--color-card-emoji-bg)",
  },
  alertLevelLabel: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  alertLevelPct: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
  alertLevelMeta: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },

  // Recipients
  recipientList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  recipientChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid var(--color-border-card-soft)",
    background: "#FFFFFF",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 120ms ease, border-color 120ms ease",
  },
  recipientCheck: {
    width: 14,
    height: 14,
    borderRadius: 4,
    border: "1px solid var(--color-border-card-soft)",
    background: "#FFFFFF",
    display: "inline-grid",
    placeItems: "center",
    flexShrink: 0,
  },
  recipientName: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  recipientEmail: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },

  // Limits
  limitRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  numberInput: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
    transition: "border-color 120ms ease",
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
  segmented: {
    display: "inline-flex",
    padding: 2,
    background: "var(--color-card-emoji-bg)",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
  },
  segmentedBtn: {
    appearance: "none",
    border: "none",
    background: "transparent",
    padding: "6px 12px",
    borderRadius: 6,
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 120ms ease, color 120ms ease",
  },

  // Inline error
  inlineError: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 8,
    background: "var(--color-error-bg)",
    color: "var(--color-error)",
    fontSize: 12,
    fontWeight: 500,
    lineHeight: "18px",
  },

  // Audit
  auditTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  auditTh: {
    textAlign: "left",
    padding: "10px 12px",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    borderBottom: "1px solid var(--color-border-card-soft)",
  },
  auditTd: {
    padding: "12px",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    borderBottom: "1px solid var(--color-border-card-soft)",
    verticalAlign: "top",
  },

  // Action row
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: 4,
  },
};
