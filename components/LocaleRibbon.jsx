"use client";

import React from "react";
import { ArrowLeftRight } from "lucide-react";
import Card from "./Card";
import {
  LH_LOCALES,
  lhText,
  lhRegion,
  lhDirectionLabel,
  lhDir,
} from "./learningHubLocale";

// LocaleRibbon — variant B of the Learning Hub localization surface.
//
// A dedicated context strip between the page header and the tabs that
// makes the locale *parameters* first-class and separate from the page
// identity (UI-7): a native-name segmented language switcher on the
// leading side, and Region + Direction status badges on the trailing
// side. This is the "RTL readiness, legible at a glance" direction the
// ticket asks for.
//
// Renders inside the page's `dir` wrapper, so it mirrors with the rest of
// the GUI. State is owned by the host; this is a controlled control.
//
// Switcher note (INT-3): the canonical option switcher is `VersionBar`,
// but it is tuned for ≤3 options. The localization surface exposes five
// languages (en/es/de/fr/ar), which is exactly the case the guideline says
// to flag rather than force into `VersionBar`. This segmented control is
// the deliberate, surfaced alternative for a >3 language set — flag to Neil
// if the canonical switcher should grow to cover it.
export default function LocaleRibbon({ locale, onChange }) {
  const dir = lhDir(locale);
  return (
    <Card padX={20} padY={16} tone="muted" style={lrStyles.shell}>
      <style>{LR_FOCUS_STYLE}</style>
      <div style={lrStyles.group}>
        <span style={lrStyles.groupLabel}>{lhText(locale, "language")}</span>
        <div
          style={lrStyles.segmented}
          role="group"
          aria-label={lhText(locale, "language")}
        >
          {LH_LOCALES.map((l) => {
            const active = l.id === locale;
            return (
              <button
                key={l.id}
                type="button"
                className="lr-seg"
                aria-pressed={active}
                lang={l.id}
                onClick={() => onChange(l.id)}
                style={active ? lrStyles.segActive : lrStyles.seg}
              >
                {l.native}
              </button>
            );
          })}
        </div>
      </div>

      <div style={lrStyles.badges}>
        <Badge label={lhText(locale, "region")} value={lhRegion(locale)} />
        <Badge
          label={lhText(locale, "direction")}
          value={dir.toUpperCase()}
          title={lhDirectionLabel(locale)}
          icon={<ArrowLeftRight size={13} aria-hidden="true" />}
          highlight={dir === "rtl"}
        />
      </div>
    </Card>
  );
}

function Badge({ label, value, icon, title, highlight = false }) {
  return (
    <span
      style={highlight ? { ...lrStyles.badge, ...lrStyles.badgeHi } : lrStyles.badge}
      title={title}
    >
      <span style={lrStyles.badgeLabel}>{label}</span>
      <span style={lrStyles.badgeValue}>
        {icon}
        {value}
      </span>
    </span>
  );
}

const lrStyles = {
  shell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  group: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  groupLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    whiteSpace: "nowrap",
  },
  segmented: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: 4,
    background: "var(--surface-white)",
    border: "1px solid var(--color-border-tab)",
    borderRadius: 999,
    flexWrap: "wrap",
  },
  seg: {
    appearance: "none",
    minHeight: 44,
    padding: "8px 16px",
    borderRadius: 999,
    border: "1px solid transparent",
    background: "transparent",
    color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 150ms ease, color 150ms ease",
  },
  segActive: {
    appearance: "none",
    minHeight: 44,
    padding: "8px 16px",
    borderRadius: 999,
    border: "1px solid var(--color-button-primary-bg)",
    background: "var(--color-button-primary-bg)",
    color: "var(--color-button-primary-fg)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 150ms ease, color 150ms ease",
  },
  badges: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 32,
    paddingInline: 12,
    borderRadius: 8,
    background: "var(--surface-white)",
    border: "1px solid var(--color-border-tab)",
  },
  badgeHi: {
    borderColor: "var(--color-button-primary-bg)",
    background: "var(--color-primary-alpha-08)",
  },
  badgeLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    color: "var(--color-text-placeholder)",
  },
  badgeValue: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
};

// Scoped focus ring on the segmented buttons, matching the app's blue
// focus treatment (WCAG-3). Inline styles can't target :focus-visible.
const LR_FOCUS_STYLE = `
.lr-seg:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px var(--do-brand-blue);
}
`;
