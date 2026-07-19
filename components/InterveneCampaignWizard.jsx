"use client";

import React from "react";
import { ArrowLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Select from "./Select";
import {
  GATING_SIGNALS,
  COMPOUNDING_SIGNALS,
  COVERAGE_OPTIONS,
} from "./mocks/intervene";

const STEPS = [
  { id: "coverage", label: "Coverage" },
  { id: "signals",  label: "Signals" },
  { id: "review",   label: "Review & publish" },
];

const COVERAGE_FIELDS = [
  { key: "lineOfBusiness", label: "Line of business" },
  { key: "queue",          label: "Queue" },
  { key: "skill",          label: "Skill" },
];

/**
 * InterveneCampaignWizard — campaign-creation stepper for Intervene.
 * A campaign is a STATIC cohort setting (coverage + signal logic). Full-page,
 * same shell pattern as CreateGuideWizardPage (stepper card, body card,
 * footer card). Steps are gated — Continue stays disabled until the current
 * step validates; completed steps collapse into clickable summary chips.
 *
 * @param {{ onClose: () => void }} props
 *   onClose — fired by back/cancel and by Done after publish.
 */
export default function InterveneCampaignWizard({ onClose }) {
  const [stepIdx, setStepIdx] = React.useState(0);
  const [coverage, setCoverage] = React.useState({ lineOfBusiness: "", queue: "", skill: "" });
  const [gating, setGating] = React.useState([]);
  // signal -> raw slider weight (0–100). Display normalizes to sum 100.
  const [compounding, setCompounding] = React.useState({});
  const [published, setPublished] = React.useState(false);

  const coverageValid = COVERAGE_FIELDS.every((f) => coverage[f.key]);
  const signalsValid = gating.length >= 1;
  const stepValid = stepIdx === 0 ? coverageValid : stepIdx === 1 ? signalsValid : true;

  const compoundingEntries = COMPOUNDING_SIGNALS.filter((s) => s in compounding);
  const weightTotal = compoundingEntries.reduce((sum, s) => sum + compounding[s], 0);
  const normalized = (s) =>
    weightTotal > 0 ? Math.round((compounding[s] / weightTotal) * 100) : 0;

  const toggleGating = (signal) =>
    setGating((list) =>
      list.includes(signal) ? list.filter((s) => s !== signal) : [...list, signal],
    );

  // New inclusion keeps existing raw values and enters at their mean, so
  // it lands with an equal normalized share by default.
  const toggleCompounding = (signal) =>
    setCompounding((map) => {
      if (signal in map) {
        const { [signal]: _drop, ...rest } = map;
        return rest;
      }
      const values = Object.values(map);
      const mean = values.length
        ? Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        : 50;
      return { ...map, [signal]: mean };
    });

  const stepSummary = (i) => {
    if (i === 0) return `Coverage · ${coverage.lineOfBusiness} / ${coverage.queue}`;
    return `Signals · ${gating.length} gating · ${compoundingEntries.length} compounding`;
  };

  return (
    <div style={cwStyles.column}>
      <Card padX={20} padY={16}>
        <div style={cwStyles.stepperRow}>
          <Button variant="text" uppercase={false} onClick={onClose} leadingIcon={<ArrowLeft size={16} />}>
            Back to Intervene
          </Button>
          <span style={cwStyles.stepperDivider} aria-hidden="true" />
          <div style={cwStyles.crumbs}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                {i < stepIdx && !published ? (
                  <button type="button" onClick={() => setStepIdx(i)} style={cwStyles.doneChip}>
                    <CheckCircle2 size={14} color="var(--color-success)" />
                    {stepSummary(i)}
                  </button>
                ) : (
                  <span
                    style={{
                      ...cwStyles.crumbLabel,
                      color: i === stepIdx ? "var(--color-button-primary-bg)" : "var(--color-text-tertiary)",
                      fontWeight: i === stepIdx ? 700 : 500,
                    }}
                  >
                    {s.label}
                  </span>
                )}
                {i < STEPS.length - 1 && <ChevronRight size={14} color="var(--color-text-tertiary)" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Card>

      <Card padX={24} padY={24} style={cwStyles.body}>
        {stepIdx === 0 && (
          <>
            <StepHeader
              title="Coverage"
              subtitle="Scope the static cohort this campaign recruits from"
            />
            <div style={cwStyles.coverageGrid}>
              {COVERAGE_FIELDS.map((f) => (
                <div key={f.key} style={cwStyles.field}>
                  <span style={cwStyles.fieldLabel}>{f.label}</span>
                  <Select
                    fullWidth
                    ariaLabel={f.label}
                    placeholder={`Select ${f.label.toLowerCase()}`}
                    value={coverage[f.key]}
                    onChange={(v) => setCoverage((c) => ({ ...c, [f.key]: v }))}
                    options={COVERAGE_OPTIONS[f.key].map((o) => ({ value: o, label: o }))}
                  />
                </div>
              ))}
            </div>
            <p style={cwStyles.helperNote}>
              Campaign is a static cohort setting — to change it later, duplicate into a
              new campaign (no cohort drift).
            </p>
          </>
        )}

        {stepIdx === 1 && (
          <>
            <StepHeader
              title="Signals"
              subtitle="Gating decides who qualifies; compounding decides who ranks first"
            />
            <div style={cwStyles.signalSection}>
              <span style={cwStyles.sectionLabel}>
                Gating signals (mandatory — at least one must be true)
              </span>
              {GATING_SIGNALS.map((s) => (
                <label key={s} style={cwStyles.checkRow}>
                  <input type="checkbox" checked={gating.includes(s)} onChange={() => toggleGating(s)} style={cwStyles.checkbox} />
                  <span style={cwStyles.checkLabel}>{s}</span>
                </label>
              ))}
            </div>
            <div style={cwStyles.signalSection}>
              <span style={cwStyles.sectionLabel}>
                Compounding signals (optional — weighted into a composite priority score)
              </span>
              {COMPOUNDING_SIGNALS.map((s) => {
                const on = s in compounding;
                return (
                  <div key={s} style={cwStyles.compoundRow}>
                    <label style={{ ...cwStyles.checkRow, width: 220, flexShrink: 0 }}>
                      <input type="checkbox" checked={on} onChange={() => toggleCompounding(s)} style={cwStyles.checkbox} />
                      <span style={cwStyles.checkLabel}>{s}</span>
                    </label>
                    {on && (
                      <>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={compounding[s]}
                          onChange={(e) => setCompounding((m) => ({ ...m, [s]: Number(e.target.value) }))}
                          aria-label={`${s} weight`}
                          style={cwStyles.slider}
                        />
                        <span style={cwStyles.weightReadout}>{normalized(s)}%</span>
                      </>
                    )}
                  </div>
                );
              })}
              {compoundingEntries.length > 0 && (
                <Card tone="muted" padX={16} padY={12}>
                  <span style={cwStyles.miniLabel}>Composite weights</span>
                  <div style={cwStyles.miniRow}>
                    {compoundingEntries.map((s) => (
                      <span key={s} style={cwStyles.miniChip}>{s} · {normalized(s)}%</span>
                    ))}
                  </div>
                </Card>
              )}
              <p style={cwStyles.mutedNote}>
                Default is equal weightage. Sliders tune relative influence.
              </p>
            </div>
          </>
        )}

        {stepIdx === 2 && !published && (
          <>
            <StepHeader
              title="Review & publish"
              subtitle="Confirm the cohort setting — runs recruit against it later"
            />
            <Card tone="outline" padX={20} padY={16}>
              <ReviewRow label="COVERAGE">
                {COVERAGE_FIELDS.map((f) => coverage[f.key]).join(" / ")}
              </ReviewRow>
              <ReviewRow label="GATING (ANY MUST BE TRUE)">{gating.join(", ")}</ReviewRow>
              <ReviewRow label="COMPOUNDING (NORMALIZED)" last>
                {compoundingEntries.length
                  ? compoundingEntries.map((s) => `${s} ${normalized(s)}%`).join(", ")
                  : "None — priority defaults to gating recency"}
              </ReviewRow>
            </Card>
            <p style={cwStyles.mutedNote}>
              No volume preview at campaign level — runs recruit within a date window.
            </p>
          </>
        )}

        {published && (
          <div style={cwStyles.successWrap}>
            <CheckCircle2 size={40} color="var(--color-success)" />
            <span style={cwStyles.successTitle}>
              Campaign published — create a run to start recruiting
            </span>
            <Button variant="primary" uppercase={false} onClick={onClose}>Done</Button>
          </div>
        )}
      </Card>

      {!published && (
        <Card padX={24} padY={16}>
          <div style={cwStyles.footerRow}>
            <Button variant="text" uppercase={false} onClick={onClose}>Cancel</Button>
            <div style={cwStyles.footerRight}>
              {stepIdx > 0 && (
                <Button variant="text" uppercase={false} onClick={() => setStepIdx(stepIdx - 1)}>
                  Back
                </Button>
              )}
              <Button
                variant="primary"
                uppercase={false}
                disabled={!stepValid}
                onClick={() => (stepIdx === 2 ? setPublished(true) : setStepIdx(stepIdx + 1))}
                trailingIcon={stepIdx < 2 ? <ChevronRight size={16} /> : undefined}
                style={{ minWidth: 0, paddingInline: 20 }}
              >
                {stepIdx === 2 ? "Publish campaign" : "Continue"}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function StepHeader({ title, subtitle }) {
  return (
    <div style={cwStyles.headerText}>
      <h2 style={cwStyles.title}>{title}</h2>
      <p style={cwStyles.subtitle}>{subtitle}</p>
    </div>
  );
}

function ReviewRow({ label, children, last }) {
  return (
    <div style={{ ...cwStyles.reviewRow, borderBottom: last ? "none" : "1px solid var(--color-border-card-soft)" }}>
      <span style={cwStyles.reviewLabel}>{label}</span>
      <span style={cwStyles.reviewValue}>{children}</span>
    </div>
  );
}

const cwStyles = {
  column: { display: "flex", flexDirection: "column", gap: 16, width: "100%", flex: 1, minHeight: 0 },
  body: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 24 },

  // Stepper
  stepperRow: { display: "flex", alignItems: "center", gap: 12 },
  stepperDivider: { width: 1, height: 20, background: "var(--color-divider-card)", flexShrink: 0 },
  crumbs: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  crumbLabel: { fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: "20px", letterSpacing: "0.17px" },
  doneChip: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 28, paddingInline: 10,
    borderRadius: 999, border: "1px solid var(--color-border-card-soft)",
    background: "var(--color-card-emoji-bg)", cursor: "pointer",
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)",
  },

  // Step header
  headerText: { display: "flex", flexDirection: "column", gap: 4 },
  title: { margin: 0, fontSize: 20, fontWeight: 500, lineHeight: "32px", letterSpacing: "0.15px", color: "var(--color-text-medium)" },
  subtitle: { margin: 0, fontSize: 12, fontWeight: 400, lineHeight: "20px", letterSpacing: "0.4px", color: "var(--color-text-tertiary)" },

  // Coverage
  coverageGrid: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 24 },
  field: { display: "flex", flexDirection: "column", gap: 8, minWidth: 0 },
  fieldLabel: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, lineHeight: "20px", color: "var(--color-text-medium)" },
  helperNote: { margin: 0, fontSize: 12, lineHeight: "20px", letterSpacing: "0.4px", color: "var(--color-text-tertiary)" },

  // Signals
  signalSection: { display: "flex", flexDirection: "column", gap: 12 },
  sectionLabel: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, lineHeight: "20px", color: "var(--color-text-medium)" },
  checkRow: { display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" },
  checkbox: { width: 16, height: 16, accentColor: "var(--color-button-primary-bg)", cursor: "pointer", flexShrink: 0 },
  checkLabel: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 400, color: "var(--color-text-medium)" },
  compoundRow: { display: "flex", alignItems: "center", gap: 16, minHeight: 28 },
  slider: { flex: 1, minWidth: 0, accentColor: "var(--color-icon-tertiary-fg)", cursor: "pointer" },
  weightReadout: {
    width: 44, flexShrink: 0, textAlign: "right",
    fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-tertiary)",
  },
  miniLabel: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  miniRow: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 },
  miniChip: {
    display: "inline-flex", alignItems: "center", height: 24, paddingInline: 8, borderRadius: 4,
    background: "var(--color-chip-bg)", color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)", fontSize: 12,
  },
  mutedNote: { margin: 0, fontSize: 12, lineHeight: "20px", letterSpacing: "0.4px", color: "var(--color-text-tertiary)" },

  // Review
  reviewRow: { display: "flex", flexDirection: "column", gap: 4, padding: "12px 0" },
  reviewLabel: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  reviewValue: { fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: "20px", letterSpacing: "0.17px", color: "var(--color-text-medium)" },

  // Success
  successWrap: {
    flex: 1, minHeight: 240, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center",
  },
  successTitle: { fontSize: 16, fontWeight: 600, color: "var(--color-text-deep)" },

  // Footer
  footerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  footerRight: { display: "flex", alignItems: "center", gap: 16 },
};
