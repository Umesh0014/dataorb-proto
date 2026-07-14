"use client";

import React from "react";
import { Search, ChevronDown, X } from "lucide-react";
import Button from "./Button";

// WorkflowFilterPanel — the faceted filter panel from "03 · Driver detail —
// workflows table". Passed as <PageLayout rightPanel> by the host route;
// PageLayout owns width (320 vs Figma's 310 — layout system wins) and
// dock-vs-overlay behaviour. Facet rows are display-only accordions in the
// source frame (no expanded state drawn) — clicking is wired but inert.
// Deselect all / Apply render disabled, matching the frame.
export default function WorkflowFilterPanel({ onClose }) {
  const [search, setSearch] = React.useState("");
  const isDocked = useIsDocked();

  return (
    <div style={isDocked ? wfStyles.panelDocked : wfStyles.panelOverlay}>
      <div style={wfStyles.header}>
        <span style={wfStyles.heading}>Filters</span>
        <Button variant="icon" size="sm" aria-label="Close filters" onClick={onClose}>
          <X size={20} color="var(--color-text-medium)" />
        </Button>
      </div>

      <div style={wfStyles.searchRow}>
        <Search size={16} color="var(--color-text-placeholder)" style={{ flexShrink: 0 }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by filter name"
          aria-label="Search by filter name"
          style={wfStyles.searchInput}
        />
      </div>

      <div style={wfStyles.body}>
        <FacetRow label="Status" bordered />
        <FacetRow label="Roleplay category" />
      </div>

      <div style={wfStyles.footer}>
        <Button
          variant="text"
          uppercase={false}
          disabled
          style={wfStyles.footerBtnDisabled}
        >
          Deselect all
        </Button>
        <div style={wfStyles.footerRight}>
          <Button variant="text" uppercase={false} onClick={onClose} style={wfStyles.footerBtn}>
            Cancel
          </Button>
          <Button variant="text" uppercase={false} disabled style={wfStyles.footerBtnDisabled}>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

// useIsDocked — mirrors PageLayout's own dock-vs-overlay check (read-only;
// PageLayout itself is untouched). Needed because PageLayout's OverlayPanel
// applies its own drawer box-shadow to the <aside> — stacking our card
// shadow on top of that produces a visible double-box artifact. In dock
// mode the aside has no shadow/radius of its own, so the floating-card
// treatment renders clean; in overlay mode we defer to the aside's own
// shadow instead of layering a second one, matching how FilterPanel
// (Insights Hub's identical panel slot) already renders flush there.
function useIsDocked() {
  const [isDocked, setIsDocked] = React.useState(false);
  React.useEffect(() => {
    const check = () => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--page-right-panel-dock-min")
        .trim();
      const dockMin = parseInt(raw, 10) || 1620;
      setIsDocked(window.innerWidth >= dockMin);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isDocked;
}

function FacetRow({ label, bordered = false }) {
  return (
    <button
      type="button"
      aria-expanded="false"
      style={{
        ...wfStyles.facetRow,
        borderBottom: bordered ? "1px solid var(--color-border-card-soft)" : "none",
      }}
    >
      <span style={wfStyles.facetLabel}>{label}</span>
      <ChevronDown size={16} color="var(--color-text-tertiary)" />
    </button>
  );
}

const wfStyles = {
  // Dock mode: PageLayout's DockedRow aside has no radius/shadow of its
  // own, so margin + --shadow-card (the same depth trick <Card> uses)
  // reads cleanly as a floating rounded card, matching Figma. No left
  // margin — DockedRow already places --page-right-panel-gap (40px)
  // between content and this aside; adding our own would stack on top
  // of that system gap instead of replacing it.
  panelDocked: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    margin: "16px 16px 16px 0",
    background: "#FFFFFF",
    borderRadius: 12,
    boxShadow: "var(--shadow-card)",
    overflow: "hidden",
  },
  // Overlay mode: PageLayout's OverlayPanel aside already carries its own
  // drawer box-shadow — adding our own margin/radius/shadow on top
  // produced a visible double-box artifact (a card floating inside a
  // shadowed drawer). Render flush instead, matching how FilterPanel
  // (Insights Hub's identical panel slot) already renders in this mode —
  // the aside's own shadow is the only depth cue here.
  panelOverlay: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minHeight: 0,
    background: "#FFFFFF",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: 56,
    paddingInline: 20,
    flexShrink: 0,
  },
  heading: {
    flex: 1,
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: 54,
    paddingInline: 20,
    borderTop: "1px solid var(--color-border-card-soft)",
    borderBottom: "1px solid var(--color-border-card-soft)",
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-medium)",
    minWidth: 0,
  },
  body: { flex: 1, display: "flex", flexDirection: "column", minHeight: 0 },
  // FacetRow renders a real <button>; exempt from the Button-primitive rule
  // the same way GuidedWorkflowLibrary's rowBtn is — it's a full-width row
  // affordance, not a button-shaped control.
  facetRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "16px 20px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "start",
    width: "100%",
  },
  facetLabel: {
    flex: 1,
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-row)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 8px",
    flexShrink: 0,
  },
  footerRight: { display: "flex", alignItems: "center", gap: 12 },
  footerBtn: { fontWeight: 700, fontSize: 14, color: "var(--grey-900)", paddingInline: 12 },
  footerBtnDisabled: { fontWeight: 700, fontSize: 14, color: "var(--grey-900)", opacity: 0.38, paddingInline: 12 },
};
