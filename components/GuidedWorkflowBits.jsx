"use client";

import React from "react";
import { Sparkles, Link2, PenLine } from "lucide-react";
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
      style={{ ...bitStyles.grounding, cursor: onClick ? "pointer" : "default" }}
      aria-label={`Grounded in interaction ${grounding.interactionId}`}
    >
      <Link2 size={11} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
      Interaction {grounding.interactionId}
    </Wrapper>
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
};
