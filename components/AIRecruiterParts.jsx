"use client";

import React from "react";
import {
  Headset, TrendingUp, ShieldCheck, Rocket, Scale, Wrench,
  Sparkles, User, ShieldCheck as RecordIcon,
} from "lucide-react";
import { FAMILY_TINTS, FAMILY_LABELS } from "./mocks/recruiter";

// AIRecruiterParts — shared pieces for the three AI Recruiter landing
// variants (Library / Table / Pipeline). Extracted under the rule-of-three:
// the family avatar, status chip, coverage meter, mode + maintained tags,
// and the compliance copy each render in all three variants, so the
// composition lives once here to prevent drift across the demo set.
//
// Compliance spine (rubric G4): the AI surfaces coverage + evidence; it
// never asserts mastery and never frames a hire decision. That copy is a
// shared constant so all three variants say it identically.

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
    "The AI Interviewer reports how much of the assigned knowledge a candidate " +
    "covered — never whether they passed. Hiring decisions stay with you, and " +
    "every interview is recorded for compliance.",
};

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

// StatusChip — live / draft / archived. Pairs a coloured dot with a text
// label so status never rides on colour alone (G9). Archived is neutral —
// StatusBadge has no neutral tone, which is why this lives here.
const STATUS_CHIP = {
  live:     { label: "Live",     dot: "var(--color-success)", fg: "var(--color-success-text)", bg: "var(--color-success-bg)" },
  draft:    { label: "Draft",    dot: "var(--color-info)",    fg: "var(--color-info-text)",    bg: "var(--color-info-bg)" },
  archived: { label: "Archived", dot: "var(--color-text-tertiary)", fg: "var(--color-text-tertiary)", bg: "var(--pill-bg)" },
};

export function StatusChip({ status }) {
  const m = STATUS_CHIP[status] || STATUS_CHIP.draft;
  return (
    <span style={{ ...partStyles.chip, background: m.bg, color: m.fg }}>
      <span style={{ ...partStyles.chipDot, background: m.dot }} aria-hidden="true" />
      {m.label}
    </span>
  );
}

// RecordedTag — compliance affordance shown on every plan. Icon is paired
// with the word "Recorded" so it isn't an icon-only label (UI-8 / WCAG-7).
export function RecordedTag() {
  return (
    <span style={partStyles.recorded}>
      <RecordIcon size={13} color="var(--color-text-tertiary)" aria-hidden="true" />
      Recorded
    </span>
  );
}

export function MaintainedTag({ maintainedBy }) {
  const isAi = maintainedBy === "ai";
  return (
    <span style={partStyles.maintain}>
      {isAi
        ? <Sparkles size={13} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
        : <User size={13} color="var(--color-text-tertiary)" aria-hidden="true" />}
      <span style={{ color: isAi ? "var(--color-icon-tertiary-fg)" : "var(--color-text-tertiary)" }}>
        {isAi ? "AI-maintained" : "Self-maintained"}
      </span>
    </span>
  );
}

export function ModeTag({ mode, assisted }) {
  return (
    <span style={partStyles.modeWrap}>
      <span style={partStyles.modeText}>{mode}</span>
      {assisted && <span style={partStyles.assisted}>Assisted</span>}
    </span>
  );
}

// CoverageMeter — labelled knowledge-coverage bar. Every number carries its
// unit + the interview sample it summarises (G3): "72% coverage · 13 of 18
// topics across 25 interviews". A draft with no runs reads "Not started",
// never a bare 0. The bar is decorative reinforcement; the text is the
// source of truth (G9), so colourblind + zoomed users lose nothing.
export function CoverageMeter({ coverage, compact = false }) {
  const started = coverage.from > 0;
  const pct = Math.max(0, Math.min(100, coverage.pct));
  return (
    <div style={partStyles.coverWrap}>
      <div style={partStyles.coverHead}>
        <span style={partStyles.coverPct}>
          {started ? `${pct}% coverage` : "Not started"}
        </span>
        <span style={partStyles.coverSample}>
          {started
            ? `${coverage.covered} of ${coverage.total} topics · ${coverage.from} interviews`
            : `0 of ${coverage.total} topics`}
        </span>
      </div>
      <div
        style={partStyles.coverTrack}
        role="img"
        aria-label={
          started
            ? `${pct}% knowledge coverage: ${coverage.covered} of ${coverage.total} topics across ${coverage.from} interviews`
            : `Not started: 0 of ${coverage.total} topics covered`
        }
      >
        <div style={{ ...partStyles.coverFill, width: `${pct}%` }} />
      </div>
      {!compact && started && (
        <span style={partStyles.coverHint}>
          Coverage of assigned knowledge — not a score
        </span>
      )}
    </div>
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
  maintain: {
    display: "inline-flex", alignItems: "center", gap: 4,
    fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700,
    letterSpacing: "0.2px", whiteSpace: "nowrap",
  },
  modeWrap: { display: "inline-flex", alignItems: "center", gap: 8 },
  modeText: {
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  assisted: {
    display: "inline-flex", alignItems: "center", height: 18, padding: "0 6px",
    borderRadius: 4, background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)", fontFamily: "var(--font-sans)",
    fontSize: 10, fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase",
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
    height: "100%", borderRadius: 999, background: "var(--chart-blue)",
    transition: "width 150ms ease",
  },
  coverHint: {
    fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 400,
    color: "var(--color-text-placeholder)",
  },
};
