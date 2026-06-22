"use client";

import React from "react";
import { ArrowLeft, Link2, Target, Check } from "lucide-react";
import Button from "./Button";
import StatusBadge from "./StatusBadge";
import { AiMark } from "./GuidedWorkflowBits";
import { GW_FLAGSHIP_META } from "./mocks/guidedWorkflows";

// Chrome for the Guided Workflow authoring surface: the Drill-section
// breadcrumb, the editor header (title, state, publish/save journeys, audit
// strip), and the VersionBar "?" reasoning popover. Extracted from
// GuidedWorkflowsPage to keep that orchestrator lean.

// Real breadcrumb navigation, not simulated tabs (G12): the sibling Drill
// sections are buttons that route back to Drill; the current page is marked
// aria-current.
export function TabContext({ onBack }) {
  return (
    <nav style={styles.tabContext} aria-label="Drill sections">
      <button type="button" onClick={onBack} style={styles.backLink} className="gw-focusable">
        <ArrowLeft size={15} color="var(--color-text-medium)" />
        Drill
      </button>
      <span style={styles.crumbDot} aria-hidden="true" />
      <div style={styles.miniTabs}>
        <button type="button" onClick={onBack} style={styles.miniTab} className="gw-focusable">Active drills</button>
        <button type="button" onClick={onBack} style={styles.miniTab} className="gw-focusable">Library</button>
        <span style={{ ...styles.miniTab, ...styles.miniTabActive }} aria-current="page">Guided workflows</span>
      </div>
    </nav>
  );
}

export function EditorChrome({ isNew, state, saved, justPublished, attachedCount, onBack, onAttach, onSave, onPublish }) {
  const meta = GW_FLAGSHIP_META;
  const isDraft = state === "draft";
  return (
    <div style={styles.chrome}>
      <div role="status" aria-live="polite" style={styles.srOnly}>
        {saved && "Draft saved."}
        {justPublished && ` Published — live to ${attachedCount} persona${attachedCount === 1 ? "" : "s"}.`}
      </div>
      <div style={styles.chromeTop}>
        <button type="button" onClick={onBack} style={styles.backLink} className="gw-focusable">
          <ArrowLeft size={15} color="var(--color-text-medium)" />
          Guided workflows
        </button>
        <div style={styles.chromeActions}>
          <Button variant="text" uppercase={false} leadingIcon={<Link2 size={15} />} onClick={onAttach} className="gw-focusable">
            {attachedCount > 0 ? `Attached to ${attachedCount}` : "Attach to persona"}
          </Button>
          <Button variant="text" uppercase={false} onClick={onSave} leadingIcon={saved ? <Check size={15} /> : undefined} className="gw-focusable">
            {saved ? "Saved" : "Save draft"}
          </Button>
          <Button variant="primary" onClick={onPublish} className="gw-focusable">{isDraft ? "Publish" : "Update & republish"}</Button>
        </div>
      </div>

      <div style={styles.chromeTitleRow}>
        <h2 style={styles.chromeTitle}>{isNew ? "Untitled guided workflow" : meta.title}</h2>
        <StatusBadge tone={isDraft ? "info" : "success"}>{isDraft ? "Draft" : "Active"}</StatusBadge>
        {!isDraft && (
          <span style={styles.liveNote}>
            <Check size={13} color="var(--color-success-text)" aria-hidden="true" />
            Live to {attachedCount} persona{attachedCount === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div style={styles.chromeMeta}>
        <span style={styles.chromeMetaItem}><Target size={13} color="var(--color-text-tertiary)" />{meta.jobToBeDone}</span>
      </div>

      <div style={styles.auditStrip}>
        <AiMark label={isNew ? "Drafted from 3 interactions" : "AI-generated · last edited by María Ruiz today"} />
        <span style={styles.auditDot} aria-hidden="true" />
        <span style={styles.auditText}>Unlimited guided attempts per agent</span>
        <span style={styles.auditDot} aria-hidden="true" />
        <span style={styles.auditText}>Flat checklist · no branching</span>
      </div>
    </div>
  );
}

export function DirectionsHelp() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={vbHelp.title}>3-Column — triage canvas + sidecar</span>
      <p style={vbHelp.text}>The Jun-18 layout: linear stages (Open/Verify/Discover/Close) are plain checklists; <b>Act is triage</b> — one “field card” <b>column per symptom</b>, side by side.</p>
      <p style={vbHelp.text}>Each item is <b>2 lines</b> (type pill + text, hint counter); selecting one opens the <b>right sidecar</b> with its hints (say / best-practice / if-then), type, attribution and a link-an-answer-card slot.</p>
      <p style={vbHelp.hint}>Parallel columns, not a decision tree — the minimalist-checklist target. <b>Checklist</b> (stacked “If” scenarios) is retained as a version; earlier explorations sit in the “Bombed ideas” dropdown.</p>
    </div>
  );
}

const styles = {
  tabContext: { display: "flex", alignItems: "center", gap: 12 },
  backLink: { display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },
  crumbDot: { width: 3, height: 3, borderRadius: 999, background: "var(--color-text-tertiary)" },
  miniTabs: { display: "inline-flex", alignItems: "center", gap: 4 },
  miniTab: { fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)", padding: "4px 10px", borderRadius: 999, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" },
  miniTabActive: { color: "var(--color-button-primary-bg)", background: "var(--color-primary-alpha-12)", fontWeight: 700, cursor: "default" },
  liveNote: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "var(--color-success-text)" },
  chrome: { display: "flex", flexDirection: "column", gap: 12, paddingBottom: 16, borderBottom: "1px solid var(--color-divider-card)" },
  chromeTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  chromeActions: { display: "inline-flex", alignItems: "center", gap: 16 },
  chromeTitleRow: { display: "flex", alignItems: "center", gap: 12 },
  chromeTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: "var(--color-text-deep)" },
  chromeMeta: { display: "flex", flexWrap: "wrap", gap: 16 },
  chromeMetaItem: { display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--color-text-medium)", lineHeight: 1.5 },
  auditStrip: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  auditDot: { width: 3, height: 3, borderRadius: 999, background: "var(--color-text-tertiary)" },
  auditText: { fontSize: 12, color: "var(--color-text-tertiary)" },
  srOnly: { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 },
};

const vbHelp = {
  title: { fontSize: 13, fontWeight: 700, color: "var(--vb-txt)" },
  text: { margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--vb-txt)" },
  hint: { margin: "4px 0 0", fontSize: 11, lineHeight: 1.5, color: "var(--vb-muted)" },
};
