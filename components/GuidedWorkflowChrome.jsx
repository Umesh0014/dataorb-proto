"use client";

import React from "react";
import { Link2, Check, ListChecks } from "lucide-react";
import Button from "./Button";
import StatusBadge from "./StatusBadge";
import PageHeader from "./PageHeader";
import { AiMark } from "./GuidedWorkflowBits";
import { GW_FLAGSHIP_META } from "./mocks/guidedWorkflows";

// Chrome for the Guided Workflow authoring surface: the Drill-section
// breadcrumb, the editor header (title, state, publish/save journeys, audit
// strip), and the VersionBar "?" reasoning popover. Extracted from
// GuidedWorkflowsPage to keep that orchestrator lean.

export function EditorChrome({ isNew, state, saved, justPublished, attachedCount, onBack, onAttach, onSave, onPublish }) {
  const meta = GW_FLAGSHIP_META;
  const isDraft = state === "draft";
  return (
    <>
      <div role="status" aria-live="polite" style={styles.srOnly}>
        {saved && "Draft saved."}
        {justPublished && ` Published — live to ${attachedCount} persona${attachedCount === 1 ? "" : "s"}.`}
      </div>
      <PageHeader
        back={onBack}
        identifier={{
          icon: <ListChecks size={16} color="var(--color-icon-tertiary-fg)" />,
          label: isNew ? "Untitled guided workflow" : meta.title,
          iconBg: "var(--color-icon-tertiary-bg)",
          iconColor: "var(--color-icon-tertiary-fg)",
        }}
        subtitle={meta.jobToBeDone}
        meta={
          <span style={styles.metaRow}>
            <StatusBadge tone={isDraft ? "info" : "success"}>{isDraft ? "Draft" : "Active"}</StatusBadge>
            <AiMark label={isNew ? "Drafted from 3 interactions" : "AI-generated · last edited by María Ruiz today"} />
            {!isDraft && (
              <>
                <span style={styles.auditDot} aria-hidden="true" />
                <span style={styles.liveNote}>
                  <Check size={13} color="var(--color-success-text)" aria-hidden="true" />
                  Live to {attachedCount} persona{attachedCount === 1 ? "" : "s"}
                </span>
              </>
            )}
          </span>
        }
        actions={
          <div style={styles.chromeActions}>
            <Button variant="text" uppercase={false} leadingIcon={<Link2 size={15} />} onClick={onAttach} className="gw-focusable">
              {attachedCount > 0 ? `Attached to ${attachedCount}` : "Attach to persona"}
            </Button>
            <Button variant="text" uppercase={false} onClick={onSave} leadingIcon={saved ? <Check size={15} /> : undefined} className="gw-focusable">
              {saved ? "Saved" : "Save draft"}
            </Button>
            <Button variant="primary" onClick={onPublish} className="gw-focusable">{isDraft ? "Publish" : "Update & republish"}</Button>
          </div>
        }
      />
    </>
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
  liveNote: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "var(--color-success-text)" },
  chromeActions: { display: "inline-flex", alignItems: "center", gap: 16 },
  metaRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  auditDot: { width: 3, height: 3, borderRadius: 999, background: "var(--color-text-tertiary)" },
  srOnly: { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 },
};

const vbHelp = {
  title: { fontSize: 13, fontWeight: 700, color: "var(--vb-txt)" },
  text: { margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--vb-txt)" },
  hint: { margin: "4px 0 0", fontSize: 11, lineHeight: 1.5, color: "var(--vb-muted)" },
};
