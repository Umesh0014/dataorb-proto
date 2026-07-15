"use client";

import React from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

// GenerateWorkflowModal — "07 · Interaction picker — select language modal"
// from Figma. Opened by InteractionPickerPage's "Generate" action. Same
// language set as NewRoleplayPage's PERSONA_LANGUAGES — kept as its own
// local copy (content, not a component) rather than importing a page-local
// const across unrelated features.
const LANGUAGES = ["English (UK)", "English (US)", "Spanish", "German", "French"];

export default function GenerateWorkflowModal({ open, onDismiss, onGenerate }) {
  const [languages, setLanguages] = React.useState([]);

  const addLanguage = (lang) => setLanguages((current) => [...current, lang]);
  const removeLanguage = (lang) => setLanguages((current) => current.filter((l) => l !== lang));

  return (
    <Modal
      open={open}
      onDismiss={onDismiss}
      title="Generate workflow"
      width="min(720px, 100%)"
      confirmLabel="Generate"
      confirmDisabled={languages.length === 0}
      onConfirm={() => onGenerate(languages)}
      body={
        <div style={gwStyles.body}>
          <span style={gwStyles.label}>Language</span>
          <LanguageSelect
            selected={languages}
            options={LANGUAGES.filter((l) => !languages.includes(l))}
            onAdd={addLanguage}
          />
          {languages.length > 0 && (
            <div style={gwStyles.chips}>
              {languages.map((lang) => (
                <span key={lang} style={gwStyles.chip}>
                  {lang}
                  <Button
                    variant="icon"
                    aria-label={`Remove ${lang}`}
                    onClick={() => removeLanguage(lang)}
                    style={gwStyles.chipRemove}
                  >
                    <X size={12} />
                  </Button>
                </span>
              ))}
            </div>
          )}
        </div>
      }
    />
  );
}

// Menu renders in a portal at document.body, positioned from the trigger's
// getBoundingClientRect — same fix as KebabMenu: Modal's panel scrolls
// (overflowY: auto for long bodies), and a same-context absolutely
// positioned menu gets clipped by that ancestor scroll container instead
// of floating above it. Closes on scroll/resize so it never drifts from
// the trigger; reopening re-measures.
function LanguageSelect({ selected, options, onAdd }) {
  const [open, setOpen] = React.useState(false);
  const [coords, setCoords] = React.useState(null);
  const triggerRef = React.useRef(null);
  const menuRef = React.useRef(null);

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current || !menuRef.current) return;
    const t = triggerRef.current.getBoundingClientRect();
    setCoords({ top: t.bottom + 4, left: t.left, width: t.width });
  }, [open]);

  React.useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    const onMouseDown = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      close();
    };
    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <div ref={triggerRef} style={{ position: "relative", width: "100%" }}>
      <Button
        variant="text"
        uppercase={false}
        fullWidth
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        trailingIcon={<ChevronDown size={20} color="var(--color-text-tertiary)" />}
        style={gwStyles.select}
      >
        <span style={gwStyles.selectValue}>
          {selected.length > 0 ? `${selected.length} language${selected.length > 1 ? "s" : ""} selected` : "Choose the workflow language"}
        </span>
      </Button>
      {open && options.length > 0 && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          role="listbox"
          style={{
            ...gwStyles.menu,
            top: coords ? coords.top : 0,
            left: coords ? coords.left : 0,
            width: coords ? coords.width : undefined,
            visibility: coords ? "visible" : "hidden",
          }}
        >
          {options.map((opt) => (
            <Button
              key={opt}
              variant="text"
              uppercase={false}
              fullWidth
              role="option"
              aria-selected={false}
              onClick={() => { onAdd(opt); setOpen(false); }}
              style={gwStyles.menuItem}
            >
              {opt}
            </Button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

const gwStyles = {
  body: { display: "flex", flexDirection: "column", gap: 8, width: "100%" },
  label: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  select: {
    width: "100%",
    height: 56,
    justifyContent: "space-between",
    paddingInline: 12,
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
  },
  selectValue: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-medium)",
  },
  menu: {
    position: "fixed",
    display: "flex",
    flexDirection: "column",
    background: "#FFFFFF",
    borderRadius: 8,
    border: "1px solid var(--color-border-tab)",
    boxShadow: "var(--shadow-8)",
    padding: "4px 0",
    zIndex: 61, // above Modal's scrim (zIndex 60)
    maxHeight: 220,
    overflowY: "auto",
  },
  menuItem: {
    width: "100%",
    justifyContent: "flex-start",
    height: "auto",
    padding: "10px 16px",
    borderRadius: 0,
    fontSize: 14,
    color: "var(--color-text-medium)",
  },
  chips: { display: "flex", flexWrap: "wrap", gap: 10 },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    height: 24,
    padding: "4px 6px",
    borderRadius: 4,
    background: "var(--tile-blue-bg)",
    color: "var(--tile-blue-fg)",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 400,
  },
  chipRemove: {
    width: 16,
    height: 16,
    minWidth: 16,
    color: "inherit",
  },
};
