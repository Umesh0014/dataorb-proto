"use client";

import React from "react";
import { ChevronDown, Languages } from "lucide-react";
import { LH_LOCALES, lhLocale, lhText } from "./learningHubLocale";

// LanguageSelect — standalone language pill for Learning Hub surfaces that
// use a bespoke header instead of <PageHeader> (e.g. Interactions). Mirrors
// the Drill page's inline language affordance: a pill showing the active
// language's native name that opens a menu of all locales. Selection is
// global — `onLocaleChange` lifts the new locale to the app root.
export default function LanguageSelect({ locale = "en", onLocaleChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const active = lhLocale(locale);

  React.useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={lsStyles.wrap}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={lhText(locale, "language")}
        style={lsStyles.trigger}
      >
        <Languages size={15} color="var(--color-text-tertiary)" />
        <span style={lsStyles.value}>{active.native}</span>
        <ChevronDown size={14} color="var(--color-text-tertiary)" />
      </button>
      {open && (
        <div role="listbox" style={lsStyles.menu}>
          {LH_LOCALES.map((l) => (
            <button
              key={l.id}
              type="button"
              role="option"
              aria-selected={l.id === locale}
              onClick={() => { onLocaleChange?.(l.id); setOpen(false); }}
              style={{
                ...lsStyles.option,
                color: l.id === locale ? "var(--color-text-tab-active)" : "var(--color-text-medium)",
                fontWeight: l.id === locale ? 600 : 500,
                background: l.id === locale ? "var(--pill-bg)" : "transparent",
              }}
            >
              {`${l.native} · ${l.label}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const lsStyles = {
  wrap: { position: "relative" },
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 32,
    padding: "0 12px",
    borderRadius: 6,
    background: "var(--pill-bg)",
    border: "1px solid var(--color-border-tab)",
    fontFamily: "var(--font-sans)",
    cursor: "pointer",
  },
  value: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  menu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    insetInlineEnd: 0,
    minWidth: 200,
    background: "var(--surface-white)",
    borderRadius: 8,
    border: "1px solid var(--color-border-tab)",
    boxShadow: "0 4px 12px rgba(15,20,60,0.10)",
    overflow: "hidden",
    zIndex: 60,
  },
  option: {
    display: "block",
    width: "100%",
    textAlign: "start",
    padding: "10px 14px",
    border: "none",
    background: "transparent",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};
