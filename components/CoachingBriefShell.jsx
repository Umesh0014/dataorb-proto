"use client";

import React from "react";
import DarkPillSwitcher from "./DarkPillSwitcher";
import CoachingBriefDeck from "./CoachingBriefDeck";
import CoachingBriefEditorial from "./CoachingBriefEditorial";
import CoachingBriefDocument from "./CoachingBriefDocument";
import { getCoachingBrief } from "./mocks/coachingBrief";

/**
 * CoachingBriefShell — preview host for the three Coaching Brief redesign
 * variants. Owns the per-session narrative edit overrides + the variant
 * pick so flipping the switcher keeps the user's in-progress edits.
 *
 * Three variants:
 *   A — Slide Deck (one-section-at-a-time, vertical chapter rail)
 *   B — Editorial Reader (long-scroll editorial article)
 *   C — Two-Pane Document (reader + read-only data sidecar)
 *
 * All three drop the legacy green/yellow focus-area card backgrounds
 * (UI-6) and expose inline per-card editing through MultiLineInput
 * (INT-7). Quantitative data (KPIs, benchmarks, sample sizes) is rendered
 * read-only across every variant.
 */
export default function CoachingBriefShell({ taskId, onBack, pageName }) {
  const brief = React.useMemo(() => getCoachingBrief(taskId), [taskId]);
  const [variant, setVariant] = React.useState("A");
  const [edits, setEdits] = React.useState({});
  const onEdit = React.useCallback((path, value) => {
    setEdits((prev) => ({ ...prev, [path]: value }));
  }, []);

  const variantProps = { brief, edits, onEdit, onBack };

  return (
    <>
      {variant === "A" && <CoachingBriefDeck {...variantProps} />}
      {variant === "B" && <CoachingBriefEditorial {...variantProps} />}
      {variant === "C" && <CoachingBriefDocument {...variantProps} />}
      <div style={dockStyles.dock} aria-live="polite">
        <span style={dockStyles.label}>Coaching Brief variant</span>
        <DarkPillSwitcher
          ariaLabel="Coaching Brief variant switcher"
          value={variant}
          options={VARIANTS}
          onChange={setVariant}
        />
      </div>
    </>
  );
}

const VARIANTS = ["A", "B", "C"];

const dockStyles = {
  dock: {
    position: "fixed",
    bottom: 28,
    right: 28,
    zIndex: 60,
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 12px 8px 16px",
    background: "#171717",
    border: "1px solid #404040",
    borderRadius: 999,
    boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)",
    fontFamily: "var(--font-sans)",
  },
  label: {
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#A3A3A3",
    textTransform: "uppercase",
  },
};
