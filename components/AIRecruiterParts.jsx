"use client";

import React from "react";
import {
  Headset, TrendingUp, ShieldCheck, Rocket, Scale, Wrench, ArrowRight, RotateCcw,
} from "lucide-react";
import Button from "./Button";
import { FAMILY_TINTS, STAGE_META } from "./mocks/recruiter";

// AIRecruiterParts — shared pieces for the three AI Recruiter candidate-pipeline
// variants (Board / Table / Funnel). Extracted under the rule-of-three: the
// family avatar, stage badge, screening-coverage meter, recorded tag, and the
// compliance copy each render in all three variants, so the composition lives
// once here to prevent drift across the demo set.
//
// Compliance spine (rubric G4): the AI surfaces coverage + evidence; it never
// asserts mastery and never frames a hire decision. That copy is a shared
// constant so all three variants say it identically.

const FAMILY_ICON_CMP = {
  support: Headset,
  sales: TrendingUp,
  retention: ShieldCheck,
  onboarding: Rocket,
  compliance: Scale,
  field: Wrench,
};

export const COMPLIANCE_COPY = {
  heading: "Evidence, not a verdict",
  body:
    "The AI Interviewer reports how much of the assigned knowledge each candidate " +
    "covered — never whether they passed. You decide who advances, and every " +
    "screening is recorded for compliance.",
};

// FamilyAvatar — job-family glyph in the family tint. Decorative reinforcement
// of the family already named in text, so aria-hidden (WCAG-7).
export function FamilyAvatar({ family, size = 40 }) {
  const tint = FAMILY_TINTS[family] || FAMILY_TINTS.support;
  const Icon = FAMILY_ICON_CMP[family] || Headset;
  const glyph = Math.round(size * 0.5);
  return (
    <span
      style={{
        width: size, height: size, borderRadius: 999, flexShrink: 0,
        background: tint.bg, color: tint.fg,
        display: "inline-grid", placeItems: "center",
      }}
      aria-hidden="true"
    >
      <Icon size={glyph} />
    </span>
  );
}

// CandidateMonogram — initials chip in the family tint. Pairs with the
// candidate's name in text, so aria-hidden.
export function CandidateMonogram({ candidate, size = 36 }) {
  const tint = FAMILY_TINTS[candidate.family] || FAMILY_TINTS.support;
  return (
    <span
      style={{
        width: size, height: size, borderRadius: 999, flexShrink: 0,
        background: tint.bg, color: tint.fg,
        display: "inline-grid", placeItems: "center",
        fontFamily: "var(--font-sans)", fontSize: Math.round(size * 0.36),
        fontWeight: 700, letterSpacing: "0.3px",
      }}
      aria-hidden="true"
    >
      {candidate.initial}
    </span>
  );
}

// StageBadge — pipeline stage as a coloured dot + text label so stage never
// rides on colour alone (G9). The dot carries the hue (decorative, paired with
// the label); the label itself uses a deep text token so it clears the 4.5:1
// AA floor on the light tint background (G8) — the tile foreground is an
// icon-weight colour, too light for 11px text. Tints resolve through
// STAGE_META → :root tokens.
export function StageBadge({ stage }) {
  const m = STAGE_META[stage] || STAGE_META.applied;
  return (
    <span style={{ ...partStyles.chip, background: m.tint.bg, color: "var(--color-text-deep)" }}>
      <span style={{ ...partStyles.chipDot, background: m.tint.fg }} aria-hidden="true" />
      {m.label}
    </span>
  );
}

// RecordedTag — compliance affordance. Icon is paired with the word
// "Recorded" so it isn't an icon-only label (WCAG-7).
export function RecordedTag() {
  return (
    <span style={partStyles.recorded}>
      <ShieldCheck size={13} color="var(--color-text-tertiary)" aria-hidden="true" />
      Recorded
    </span>
  );
}

// CoverageMeter — labelled screening-coverage bar for one candidate. Every
// number carries its unit (G3): "83% covered · 15 of 18 topics". A candidate
// whose screening hasn't run reads "Not started", in progress reads
// "Screening in progress" — never a bare 0. The bar is decorative
// reinforcement; the text is the source of truth (G9), so colourblind +
// zoomed users lose nothing. Coverage is never framed as a score (G4).
export function CoverageMeter({ screen, compact = false }) {
  const { status, coverage } = screen;
  const { covered, total } = coverage;
  const pct = total > 0 ? Math.round((covered / total) * 100) : 0;
  const done = status === "completed";
  const running = status === "in_progress";

  const headline = done
    ? `${pct}% covered`
    : running
      ? "Screening in progress"
      : "Not started";
  const sample = done || running
    ? `${covered} of ${total} topics`
    : `0 of ${total} topics`;
  const ariaLabel = done
    ? `${pct}% knowledge coverage: ${covered} of ${total} assigned topics covered`
    : running
      ? `Screening in progress: ${covered} of ${total} assigned topics covered so far`
      : `Not started: 0 of ${total} assigned topics covered`;

  return (
    <div style={partStyles.coverWrap}>
      <div style={partStyles.coverHead}>
        <span style={partStyles.coverPct}>{headline}</span>
        <span style={partStyles.coverSample}>{sample}</span>
      </div>
      <div style={partStyles.coverTrack} role="img" aria-label={ariaLabel}>
        <div
          style={{
            ...partStyles.coverFill,
            width: `${pct}%`,
            background: running ? "var(--color-text-tertiary)" : "var(--chart-blue)",
          }}
        />
      </div>
      {!compact && done && (
        <span style={partStyles.coverHint}>
          Coverage of assigned knowledge — not a score
        </span>
      )}
    </div>
  );
}

// AdvanceButton — the hiring manager's stage-move control, shared across all
// three variants (Board card / Table sidecar / Funnel list). The label is the
// next stage's action ("Push to Interview", "Move to Offer", "Activate
// candidate"…). The push out of AI Screening is visibly blocked until the
// screening completes (INT-8) rather than failing silently — the human only
// advances a candidate the AI has finished gathering evidence on. Terminal
// stages (Hired) render nothing.
export function AdvanceButton({ candidate, onAdvance, fullWidth = false }) {
  const meta = STAGE_META[candidate.stage];
  if (!meta?.advance) return null;
  const blocked =
    candidate.stage === "ai_screening" && candidate.screen.status !== "completed";
  const isActivate = candidate.stage === "community";
  return (
    <Button
      variant="primary"
      fullWidth={fullWidth}
      disabled={blocked}
      leadingIcon={isActivate ? <RotateCcw size={15} /> : <ArrowRight size={15} />}
      onClick={() => onAdvance?.(candidate.id)}
      aria-label={
        blocked
          ? `${meta.advance} — available once ${candidate.name}'s AI screening completes`
          : `${meta.advance} — ${candidate.name}`
      }
    >
      {meta.advance}
    </Button>
  );
}

const partStyles = {
  chip: {
    display: "inline-flex", alignItems: "center", gap: 6,
    height: 22, padding: "0 8px", borderRadius: 999,
    fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700,
    letterSpacing: "0.2px", whiteSpace: "nowrap", flexShrink: 0,
  },
  chipDot: { width: 6, height: 6, borderRadius: 999, flexShrink: 0 },

  recorded: {
    display: "inline-flex", alignItems: "center", gap: 4,
    fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600,
    color: "var(--color-text-tertiary)", whiteSpace: "nowrap",
  },

  coverWrap: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 },
  coverHead: {
    display: "flex", alignItems: "baseline", justifyContent: "space-between",
    gap: 8, flexWrap: "wrap",
  },
  coverPct: {
    fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700,
    color: "var(--color-text-deep)", fontVariantNumeric: "tabular-nums",
  },
  coverSample: {
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 400,
    color: "var(--color-text-tertiary)", fontVariantNumeric: "tabular-nums",
  },
  coverTrack: {
    height: 6, borderRadius: 999, width: "100%",
    background: "var(--grey-200)", overflow: "hidden",
  },
  coverFill: {
    height: "100%", borderRadius: 999, transition: "width 150ms ease",
  },
  coverHint: {
    fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 400,
    color: "var(--color-text-placeholder)",
  },
};
