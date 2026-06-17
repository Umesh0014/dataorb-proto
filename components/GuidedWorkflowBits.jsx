"use client";

import React from "react";
import { Sparkles, Link2, PenLine, TrendingUp, Quote, Plus } from "lucide-react";
import Button from "./Button";
import { gwTypeMeta, gwRequirementMeta } from "./mocks/guidedWorkflows";

// GuidedWorkflowBits — the small presentational atoms shared by all three
// authoring editors (Checklist / Board / Studio). They encode the step
// schema's visible contract: the type tag, the requirement tag, and the
// grounding chip (which production interaction a step was mined from, or a
// hand-added marker when ungrounded). Kept in one file because three editor
// callsites repeat them verbatim (rule of three).

// Step type pill — Compliance / Action / Decision. Color is always paired
// with the word so meaning never rides on hue alone.
export function TypeTag({ type }) {
  const t = gwTypeMeta(type);
  return <span style={{ ...bitStyles.tag, color: t.color, background: t.bg }}>{t.label}</span>;
}

// Requirement pill — Required / Conditional / Recommended.
export function RequirementTag({ requirement }) {
  const r = gwRequirementMeta(requirement);
  return (
    <span
      style={{
        ...bitStyles.tag,
        color: r.color,
        background: r.bg,
        fontWeight: r.weight,
        border: r.bg === "transparent" ? "1px solid var(--color-divider-card)" : "none",
      }}
    >
      {r.label}
    </span>
  );
}

// Grounding chip — verifiability. A grounded step shows the interaction it
// was mined from (clickable to inspect the evidence); a null grounding reads
// as a hand-added step so the lead can see what isn't backed by data.
export function GroundingChip({ grounding, onClick }) {
  if (!grounding) {
    return (
      <span style={bitStyles.handAdded}>
        <PenLine size={11} color="var(--color-text-tertiary)" aria-hidden="true" />
        Added by you
      </span>
    );
  }
  const Wrapper = onClick ? "button" : "span";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={onClick ? "gw-focusable" : undefined}
      style={{ ...bitStyles.grounding, cursor: onClick ? "pointer" : "default" }}
      aria-label={`Grounded in interaction ${grounding.interactionId}`}
    >
      <Link2 size={11} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
      Interaction {grounding.interactionId}
    </Wrapper>
  );
}

// ScriptQuote — the step's script as read-only quoted evidence (the actual
// phrasing pulled from a real call), attributed to its source interaction.
// Not a free-text field: the script IS evidence, so it reads as a quote.
export function ScriptQuote({ script, grounding }) {
  if (!script) return null;
  return (
    <figure style={bitStyles.scriptQuote}>
      <blockquote style={bitStyles.scriptText}>“{script}”</blockquote>
      {grounding && <figcaption style={bitStyles.scriptCite}>— from interaction {grounding.interactionId}</figcaption>}
    </figure>
  );
}

// AI sparkle marker — the consistent "AI generated this" signal across the
// create entry and the editor.
export function AiMark({ label = "AI-generated" }) {
  return (
    <span style={bitStyles.aiMark}>
      <Sparkles size={12} color="var(--color-button-primary-bg)" aria-hidden="true" />
      {label}
    </span>
  );
}

// SuccessChip — the compact evidence signal: how often following this step
// landed the outcome, across how many calls. Color-with-label, never alone.
export function SuccessChip({ evidence }) {
  if (!evidence) return null;
  return (
    <span style={bitStyles.successChip} title={`Followed in ${evidence.callCount} calls`}>
      <TrendingUp size={11} color="var(--color-success-text)" aria-hidden="true" />
      {evidence.successRate}% · {evidence.callCount} calls
    </span>
  );
}

// EvidenceCard — the per-step proof the lead edits against: the success rate
// in plain language, the call volume behind it, and the actual phrasing top
// agents used in those calls (real examples to lift into the script). This
// is the "why the AI proposed this" made auditable.
export function EvidenceCard({ evidence }) {
  if (!evidence) {
    return (
      <div style={bitStyles.evidenceEmpty}>
        No evidence yet — you added this step by hand. It won't carry a success rate until calls run against it.
      </div>
    );
  }
  return (
    <div style={bitStyles.evidence}>
      <div style={bitStyles.evidenceStatRow}>
        <span style={bitStyles.evidenceStat}>{evidence.successRate}%</span>
        <span style={bitStyles.evidenceStatText}>
          of calls that followed this step ended in {evidence.outcome}
          <span style={bitStyles.evidenceVolume}>across {evidence.callCount} interactions</span>
        </span>
      </div>
      <div style={bitStyles.exampleHead}>
        <Quote size={12} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
        What top agents said here
      </div>
      <ul style={bitStyles.exampleList}>
        {evidence.examples.map((ex) => (
          <li key={ex.interactionId + ex.quote.slice(0, 12)} style={bitStyles.example}>
            <span style={bitStyles.exampleQuote}>“{ex.quote}”</span>
            <span style={bitStyles.exampleSource}>Interaction {ex.interactionId}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// SuggestedStepCard — an AI proposal not yet in the workflow. Carries the
// same evidence the base steps do (success rate + agent examples) so the
// lead accepts on proof, then it folds into the checklist as a normal step.
// `expanded` controls whether the full evidence shows; `dense` trims it for
// narrow lanes (the Board).
export function SuggestedStepCard({ step, onAdd, expanded, onToggle, dense = false }) {
  return (
    <div style={{ ...bitStyles.suggest, ...(dense ? bitStyles.suggestDense : null) }}>
      <div style={bitStyles.suggestHead}>
        <AiMark label="Suggested" />
        <SuccessChip evidence={step.evidence} />
      </div>
      <span style={bitStyles.suggestInstruction}>{step.instruction}</span>
      {!dense && <span style={bitStyles.suggestDetail}>{step.detail}</span>}
      <div style={bitStyles.suggestTags}>
        <TypeTag type={step.type} />
        <RequirementTag requirement={step.requirement} />
      </div>
      {expanded && <EvidenceCard evidence={step.evidence} />}
      <div style={bitStyles.suggestFoot}>
        <Button variant="ai" uppercase={false} onClick={onAdd} className="gw-focusable">
          <span style={bitStyles.addInline}><Plus size={14} /> Add to workflow</span>
        </Button>
        {onToggle && (
          <button type="button" onClick={onToggle} style={bitStyles.whyBtn} className="gw-focusable" aria-expanded={!!expanded}>
            {expanded ? "Hide evidence" : "Why this?"}
          </button>
        )}
      </div>
    </div>
  );
}

const bitStyles = {
  tag: {
    display: "inline-flex",
    alignItems: "center",
    height: 20,
    padding: "0 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.3px",
    whiteSpace: "nowrap",
  },
  grounding: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    height: 22,
    padding: "0 9px",
    borderRadius: 999,
    border: "1px solid var(--color-border-tab)",
    background: "var(--surface-dim)",
    color: "var(--color-icon-tertiary-fg)",
    fontSize: 11,
    fontWeight: 700,
    fontFamily: "var(--font-mono)",
    whiteSpace: "nowrap",
  },
  handAdded: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    height: 22,
    padding: "0 9px",
    borderRadius: 999,
    background: "transparent",
    color: "var(--color-text-tertiary)",
    fontSize: 11,
    fontWeight: 600,
    fontStyle: "italic",
    whiteSpace: "nowrap",
  },
  aiMark: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    fontWeight: 700,
    color: "var(--color-button-primary-bg)",
    whiteSpace: "nowrap",
  },
  scriptQuote: {
    margin: 0, padding: "10px 14px", borderRadius: 8, background: "var(--color-icon-tertiary-bg)",
    borderLeft: "3px solid var(--color-icon-tertiary-fg)", display: "flex", flexDirection: "column", gap: 4,
  },
  scriptText: { margin: 0, fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)", lineHeight: 1.55 },
  scriptCite: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },
  successChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    height: 22,
    padding: "0 9px",
    borderRadius: 999,
    background: "var(--color-success-bg)",
    color: "var(--color-success-text)",
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  evidence: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 10,
    background: "var(--surface-dim)",
    border: "1px solid var(--color-border-tab)",
  },
  evidenceEmpty: {
    padding: "10px 12px",
    borderRadius: 10,
    background: "var(--surface-dim)",
    border: "1px dashed var(--color-divider-card)",
    fontSize: 12,
    fontStyle: "italic",
    color: "var(--color-text-tertiary)",
    lineHeight: 1.5,
  },
  evidenceStatRow: { display: "flex", alignItems: "baseline", gap: 10 },
  evidenceStat: { fontSize: 24, fontWeight: 700, color: "var(--color-success-text)", lineHeight: 1, flexShrink: 0 },
  evidenceStatText: { display: "flex", flexDirection: "column", gap: 2, fontSize: 12.5, color: "var(--color-text-medium)", lineHeight: 1.45 },
  evidenceVolume: { fontSize: 11.5, color: "var(--color-text-tertiary)" },
  exampleHead: {
    display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700,
    letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-icon-tertiary-fg)",
  },
  exampleList: { listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 },
  example: { display: "flex", flexDirection: "column", gap: 2 },
  exampleQuote: { fontSize: 12.5, color: "var(--color-text-medium)", lineHeight: 1.5 },
  exampleSource: { fontSize: 10.5, fontWeight: 600, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },
  suggest: {
    display: "flex", flexDirection: "column", gap: 8, padding: "12px 14px", borderRadius: 12,
    background: "var(--color-primary-alpha-12)", border: "1px dashed var(--color-button-primary-bg)",
  },
  suggestDense: { padding: "11px 12px", gap: 7 },
  suggestHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" },
  suggestInstruction: { fontSize: 13.5, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4 },
  suggestDetail: { fontSize: 12.5, color: "var(--color-text-tertiary)", lineHeight: 1.5 },
  suggestTags: { display: "flex", flexWrap: "wrap", gap: 6 },
  suggestFoot: { display: "flex", alignItems: "center", gap: 14, marginTop: 2 },
  addInline: { display: "inline-flex", alignItems: "center", gap: 5 },
  whyBtn: {
    background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit",
    fontSize: 12.5, fontWeight: 600, color: "var(--color-text-tertiary)", textDecoration: "underline",
  },
};
