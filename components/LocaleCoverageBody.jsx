"use client";

import React from "react";
import { Check } from "lucide-react";
import {
  LH_LOCALES,
  lhText,
  lhDir,
  lhRegion,
  LH_COVERAGE,
  lhCoverageLabel,
  lhCoverageState,
} from "./learningHubLocale";

// LocaleCoverageBody — body content for the Language & region modal
// (variant C). Two parts:
//   1. A language picker grouped by reading direction (LTR / RTL), so the
//      Arabic/RTL option is visibly its own bucket — the ticket's open
//      problem made explicit.
//   2. A coverage list mapping the brief's five buckets to what is
//      localized vs. deliberately left in source language (eval +
//      user-defined content). Honest scope, on screen.
//
// Controlled: the picked-but-not-yet-applied locale is `pending`; the host
// applies it on the modal's confirm action. The body previews in the
// pending locale's direction.
export default function LocaleCoverageBody({ pending, onPick }) {
  const dir = lhDir(pending);
  const ltr = LH_LOCALES.filter((l) => l.dir === "ltr");
  const rtl = LH_LOCALES.filter((l) => l.dir === "rtl");

  return (
    <div dir={dir} style={lcStyles.body}>
      <style>{LC_FOCUS_STYLE}</style>

      <Group title={lhText(pending, "language")}>
        <DirRow caption="LTR — left to right">
          {ltr.map((l) => (
            <LangChip
              key={l.id}
              locale={l}
              active={l.id === pending}
              onPick={onPick}
            />
          ))}
        </DirRow>
        <DirRow caption="RTL — right to left">
          {rtl.map((l) => (
            <LangChip
              key={l.id}
              locale={l}
              active={l.id === pending}
              onPick={onPick}
            />
          ))}
        </DirRow>
      </Group>

      <div style={lcStyles.regionLine}>
        <span style={lcStyles.regionLabel}>{lhText(pending, "region")}</span>
        <span style={lcStyles.regionValue}>{lhRegion(pending)}</span>
      </div>

      <Group title={lhText(pending, "coverageTitle")}>
        <ul style={lcStyles.coverList}>
          {LH_COVERAGE.map((row) => (
            <li key={row.key} style={lcStyles.coverRow}>
              <span style={lcStyles.coverName}>{lhCoverageLabel(pending, row.key)}</span>
              <span
                style={{
                  ...lcStyles.statePill,
                  ...(row.translated ? lcStyles.statePillYes : lcStyles.statePillNo),
                }}
              >
                {row.translated && <Check size={13} aria-hidden="true" />}
                {lhCoverageState(pending, row.translated)}
              </span>
            </li>
          ))}
        </ul>
      </Group>
    </div>
  );
}

function Group({ title, children }) {
  return (
    <section style={lcStyles.group}>
      <h3 style={lcStyles.groupTitle}>{title}</h3>
      {children}
    </section>
  );
}

function DirRow({ caption, children }) {
  return (
    <div style={lcStyles.dirRow}>
      <span style={lcStyles.dirCaption}>{caption}</span>
      <div style={lcStyles.langWrap} role="radiogroup" aria-label={caption}>
        {children}
      </div>
    </div>
  );
}

function LangChip({ locale, active, onPick }) {
  return (
    <button
      type="button"
      className="lc-chip"
      role="radio"
      aria-checked={active}
      lang={locale.id}
      onClick={() => onPick(locale.id)}
      style={active ? lcStyles.langChipActive : lcStyles.langChip}
    >
      <span style={lcStyles.langNative}>{locale.native}</span>
      <span style={lcStyles.langEnglish}>{locale.label}</span>
    </button>
  );
}

const lcStyles = {
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  group: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  groupTitle: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
  },
  dirRow: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  dirCaption: {
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    color: "var(--color-text-placeholder)",
  },
  langWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  langChip: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
    minWidth: 104,
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid var(--color-border-tab)",
    background: "var(--surface-white)",
    cursor: "pointer",
    transition: "background 150ms ease, border-color 150ms ease",
  },
  langChipActive: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
    minWidth: 104,
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid var(--color-button-primary-bg)",
    background: "var(--color-primary-alpha-08)",
    cursor: "pointer",
    transition: "background 150ms ease, border-color 150ms ease",
  },
  langNative: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  langEnglish: {
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  regionLine: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    paddingBlock: 10,
    paddingInline: 14,
    borderRadius: 8,
    background: "var(--color-card-emoji-bg)",
  },
  regionLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    color: "var(--color-text-placeholder)",
  },
  regionValue: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  coverList: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  coverRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingBlock: 10,
    paddingInline: 14,
    borderRadius: 8,
    border: "1px solid var(--color-border-tab)",
  },
  coverName: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  statePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    height: 24,
    paddingInline: 10,
    borderRadius: 999,
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  statePillYes: {
    background: "var(--color-success-bg)",
    color: "var(--color-success-text)",
  },
  statePillNo: {
    background: "var(--pill-bg)",
    color: "var(--color-text-tertiary)",
  },
};

const LC_FOCUS_STYLE = `
.lc-chip:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px var(--do-brand-blue);
}
`;
