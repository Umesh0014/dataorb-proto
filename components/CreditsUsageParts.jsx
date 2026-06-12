"use client";

import React from "react";
import { Info } from "lucide-react";
import Card from "./Card";
import { CADENCES } from "./mocks/creditsUsage";

// CreditsUsageParts — shared primitives for the Credits & Usage surface
// (CreditsUsagePage + CreditsUsageHero). The reusable atoms + their chrome
// live here; layout/composition lives in the page.

export function cadenceShort(id) {
  return (CADENCES.find((c) => c.id === id) || CADENCES[1]).short;
}

// Contract-terms banner — the legal framing that opens the page.
export function InfoBanner() {
  return (
    <div style={partStyles.infoBanner}>
      <Info size={14} color="var(--color-icon-tertiary-fg)" style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={partStyles.infoBannerText}>
        Practice minutes for this tenant are committed and any additional
        usage is governed as per your contract terms.
      </span>
    </div>
  );
}

// Section — titled card surface. headerRight slots a badge/control.
export function Section({ title, description, children, style, headerRight }) {
  return (
    <Card padX={0} padY={0} style={{ ...partStyles.sectionCard, ...style }}>
      <header style={partStyles.sectionHeader}>
        <div style={partStyles.sectionTitleBlock}>
          <h2 style={partStyles.sectionTitle}>{title}</h2>
          {description && <p style={partStyles.sectionDescription}>{description}</p>}
        </div>
        {headerRight}
      </header>
      <div style={partStyles.sectionBody}>{children}</div>
    </Card>
  );
}

export function Field({ label, children }) {
  return (
    <div style={partStyles.field}>
      <span style={partStyles.fieldLabel}>{label}</span>
      <div style={partStyles.fieldBody}>{children}</div>
    </div>
  );
}

export function FieldNote({ children }) {
  return <p style={partStyles.fieldNote}>{children}</p>;
}

export function NumberInput({ value, onChange, suffix, ariaLabel }) {
  return (
    <label style={partStyles.numberInput}>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        aria-label={ariaLabel}
        style={partStyles.numberInputField}
      />
      {suffix && <span style={partStyles.numberInputSuffix}>{suffix}</span>}
    </label>
  );
}

export function EmailInput({ value, onChange, placeholder, ariaLabel, hasError }) {
  return (
    <input
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      aria-invalid={hasError || undefined}
      style={{
        ...partStyles.emailInput,
        borderColor: hasError ? "var(--color-error)" : "var(--color-border-card-soft)",
      }}
    />
  );
}

export function InlineError({ message }) {
  return (
    <div style={partStyles.inlineError} role="alert">
      {message}
    </div>
  );
}

export function MetricTile({ label, value, sub, chipLabel }) {
  return (
    <div style={partStyles.metricTile}>
      <span style={partStyles.metricTileLabel}>{label}</span>
      <div style={partStyles.metricTileValueRow}>
        <span style={partStyles.metricTileValue}>{value}</span>
        {chipLabel && <span style={partStyles.chip}>{chipLabel}</span>}
      </div>
      {sub && <span style={partStyles.metricTileSub}>{sub}</span>}
    </div>
  );
}

// CapacityBar — used / total progress. Goes amber past 80%, red at 100%.
export function CapacityBar({ used, total, height = 8 }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const color =
    pct >= 100
      ? "var(--color-error)"
      : pct >= 80
        ? "var(--color-warning)"
        : "var(--color-icon-tertiary-fg)";
  return (
    <div style={{ ...partStyles.barTrack, height }} aria-hidden="true">
      <div style={{ ...partStyles.barFill, width: `${pct}%`, background: color }} />
    </div>
  );
}

// Composition badge — Tenured / New / Mixed team make-up.
export function CompositionBadge({ composition }) {
  const tone = COMPOSITION_TONES[composition] || COMPOSITION_TONES.Mixed;
  return (
    <span style={{ ...partStyles.compBadge, background: tone.bg, color: tone.fg }}>
      {composition}
    </span>
  );
}

const COMPOSITION_TONES = {
  New: { bg: "var(--tile-blue-bg)", fg: "var(--tile-blue-fg)" },
  Tenured: { bg: "var(--tile-emerald-bg)", fg: "var(--tile-emerald-fg)" },
  Mixed: { bg: "var(--color-icon-tertiary-bg)", fg: "var(--color-icon-tertiary-fg)" },
};

// AdditionalUsageChoice — the Jun 11 billing reframe: either cap spend
// (hard stop) or allow additional minutes, but also capped. Deliberately
// avoids the word "overage".
export function AdditionalUsageChoice({ mode, onMode, additionalCap, onAdditionalCap }) {
  return (
    <div style={partStyles.choiceWrap}>
      <SegmentedOption
        selected={mode === "cap"}
        onClick={() => onMode("cap")}
        label="Cap spend"
        description="Hard stop once committed minutes are used. No additional usage."
      />
      <SegmentedOption
        selected={mode === "additional"}
        onClick={() => onMode("additional")}
        label="Allow additional — capped"
        description="Continue past the commitment, up to an additional cap you set."
      />
      {mode === "additional" && (
        <div style={partStyles.additionalCapRow}>
          <Field label="Additional cap">
            <NumberInput
              value={additionalCap}
              onChange={onAdditionalCap}
              suffix="min on top of commitment"
              ariaLabel="Additional usage cap minutes"
            />
          </Field>
          <FieldNote>
            Going past a team quota raises an approval request before any
            additional minutes are consumed.
          </FieldNote>
        </div>
      )}
    </div>
  );
}

function SegmentedOption({ selected, onClick, label, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        ...partStyles.segOption,
        borderColor: selected ? "var(--color-icon-tertiary-fg)" : "var(--color-border-card-soft)",
        background: selected ? "var(--color-icon-tertiary-bg)" : "#FFFFFF",
      }}
    >
      <span style={partStyles.segDot}>{selected && <span style={partStyles.segDotInner} />}</span>
      <div style={partStyles.segText}>
        <span style={partStyles.segLabel}>{label}</span>
        <span style={partStyles.segDesc}>{description}</span>
      </div>
    </button>
  );
}

export function RequestRoutingField({ value, onChange, error }) {
  return (
    <Field label="Route requests to">
      <EmailInput
        value={value}
        onChange={onChange}
        placeholder="admin@yourcompany.example"
        ariaLabel="Request routing email address"
        hasError={Boolean(error)}
      />
      {error && <InlineError message={error} />}
      <FieldNote>
        Teams are inherited from the Contact Center hierarchy — once mapped,
        requests route to the relevant team lead automatically.
      </FieldNote>
    </Field>
  );
}

// AgentBannerPreview — admin-side preview of the agent-facing out-of-quota
// banner (request more + reset timing) called for in the brief.
export function AgentBannerPreview() {
  return (
    <div style={partStyles.agentBanner}>
      <div style={partStyles.agentBannerTop}>
        <span style={partStyles.agentBannerTitle}>Agent view · out of quota</span>
        <span style={partStyles.agentBannerTag}>Preview</span>
      </div>
      <p style={partStyles.agentBannerBody}>
        You&apos;ve used all your practice minutes for this week. Request more
        from your admin — your quota resets Monday.
      </p>
      <span style={partStyles.agentBannerCta}>Request more minutes</span>
    </div>
  );
}

export function UsageTrendChart({ data }) {
  const W = 600;
  const H = 72;
  const PAD_L = 24;
  const PAD_R = 24;
  const PAD_T = 8;
  const PAD_B = 16;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const maxVal = Math.max(...data.map((d) => d.value));

  const points = data.map((d, i) => ({
    x: PAD_L + (i / (data.length - 1)) * chartW,
    y: PAD_T + chartH - (d.value / maxVal) * chartH * 0.9,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD_T + chartH} L ${PAD_L} ${PAD_T + chartH} Z`;

  return (
    <div style={partStyles.trendWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={partStyles.trendSvg} aria-label="Usage trend chart">
        <defs>
          <linearGradient id="cuTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-icon-tertiary-fg)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-icon-tertiary-fg)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#cuTrendFill)" />
        <path d={linePath} fill="none" stroke="var(--color-icon-tertiary-fg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#fff" stroke="var(--color-icon-tertiary-fg)" strokeWidth="1.5" />
        ))}
        {data.map((d, i) => (
          <text key={i} x={points[i].x} y={H - 1} textAnchor="middle" style={{ fontSize: 7, fill: "var(--color-text-tertiary)", fontFamily: "var(--font-sans)" }}>
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

const partStyles = {
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
  sectionTitleBlock: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
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
  sectionBody: { display: "flex", flexDirection: "column", gap: 20, padding: 20 },

  infoBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 10,
    background: "var(--color-icon-tertiary-bg)",
    border: "1px solid rgba(102, 80, 165, 0.12)",
  },
  infoBannerText: {
    fontSize: 12,
    fontWeight: 500,
    lineHeight: "18px",
    color: "var(--color-text-medium)",
  },

  metricTile: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "12px 16px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 12,
    background: "#FFFFFF",
    minWidth: 0,
  },
  metricTileLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  metricTileValueRow: { display: "flex", alignItems: "center", gap: 10 },
  metricTileValue: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: "28px",
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
  metricTileSub: { fontSize: 11, fontWeight: 400, color: "var(--color-text-tertiary)" },
  chip: {
    padding: "2px 8px",
    borderRadius: 999,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.2px",
  },

  barTrack: {
    width: "100%",
    borderRadius: 999,
    background: "#F0F0F6",
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 999, transition: "width 200ms ease" },

  compBadge: {
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.2px",
    whiteSpace: "nowrap",
  },

  field: { display: "flex", flexDirection: "column", gap: 10 },
  fieldLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  fieldBody: { display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" },
  fieldNote: {
    margin: 0,
    fontSize: 12,
    fontWeight: 400,
    lineHeight: "18px",
    color: "var(--color-text-tertiary)",
  },

  numberInput: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
    cursor: "text",
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
  numberInputSuffix: { fontSize: 12, color: "var(--color-text-tertiary)", whiteSpace: "nowrap" },

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
  inlineError: {
    padding: "8px 12px",
    borderRadius: 8,
    background: "var(--color-error-bg)",
    color: "var(--color-error)",
    fontSize: 12,
    fontWeight: 500,
    lineHeight: "18px",
  },

  // Additional-usage choice
  choiceWrap: { display: "flex", flexDirection: "column", gap: 10 },
  additionalCapRow: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "14px 16px",
    borderRadius: 10,
    background: "var(--color-card-emoji-bg)",
  },
  segOption: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 10,
    border: "1.5px solid",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    width: "100%",
    transition: "border-color 120ms ease, background 120ms ease",
  },
  segDot: {
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
  segDotInner: { width: 9, height: 9, borderRadius: "50%", background: "var(--color-icon-tertiary-fg)" },
  segText: { display: "flex", flexDirection: "column", gap: 2 },
  segLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)" },
  segDesc: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: "18px" },

  // Agent out-of-quota banner preview
  agentBanner: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: "14px 16px",
    borderRadius: 10,
    background: "var(--color-warning-bg)",
    border: "1px solid rgba(239, 108, 0, 0.18)",
  },
  agentBannerTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 },
  agentBannerTitle: { fontSize: 12, fontWeight: 700, color: "var(--color-warning-text)", letterSpacing: "0.2px" },
  agentBannerTag: {
    padding: "2px 8px",
    borderRadius: 999,
    background: "#FFFFFF",
    color: "var(--color-warning)",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
  },
  agentBannerBody: { margin: 0, fontSize: 12, fontWeight: 500, lineHeight: "18px", color: "var(--color-warning-text)" },
  agentBannerCta: {
    alignSelf: "flex-start",
    padding: "6px 12px",
    borderRadius: 8,
    background: "var(--color-warning)",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 600,
  },

  // Trend chart
  trendWrap: { width: "100%", borderRadius: 8, overflow: "hidden" },
  trendSvg: { width: "100%", height: "auto", display: "block" },
};
