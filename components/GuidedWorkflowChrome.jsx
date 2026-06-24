"use client";

import React from "react";
import { Link2, Check, ListChecks, Globe, Clock } from "lucide-react";
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
        breadcrumb={[{ label: "Guided Workflow · Review & publish" }]}
        identifier={{
          icon: <ListChecks size={16} color="var(--color-icon-tertiary-fg)" />,
          label: isNew ? "Untitled guided workflow" : meta.title,
          iconBg: "var(--color-icon-tertiary-bg)",
          iconColor: "var(--color-icon-tertiary-fg)",
          withDropdown: true,
          onClick: () => {},
        }}
        subtitle={meta.jobToBeDone}
        meta={
          <div style={styles.metaRow}>
            <div style={styles.metaLeft}>
              <AiMark label="AI-generated" />
              <StatusBadge tone={isDraft ? "info" : "success"}>{isDraft ? "Draft" : "Active"}</StatusBadge>
              <span style={styles.metaSep} aria-hidden="true" />
              {meta.outcomes.map((o) => (
                <span key={o} style={styles.outcomePill}><Check size={12} aria-hidden="true" />{o}</span>
              ))}
              <span style={styles.metaSep} aria-hidden="true" />
              <span style={styles.localeChip}><Globe size={12} color="var(--color-text-tertiary)" aria-hidden="true" />{meta.locale}</span>
            </div>
            <span style={styles.genText}><Clock size={12} color="var(--color-text-tertiary)" aria-hidden="true" />{isNew ? "Drafting" : "Generated"} · {meta.generatedAt}</span>
          </div>
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
      <span style={vbHelp.title}>Stepper + sidecar — pick stage, read steps, open one</span>
      <p style={vbHelp.text}>A horizontal <b>stepper</b> of categories (Open→Close) with each stage's steps <b>marked as type-coloured pips</b>. <b>Click a category</b> → it's selected and its steps show below (Act offers a triage-path selector first).</p>
      <p style={vbHelp.text}><b>Click a step</b> → a docked <b>sidecar slides in</b> with the full detail (instruction, type, requirement, script, knowledge, evidence). One click per level: stage → step → detail.</p>
      <p style={vbHelp.hint}><b>Review stepper</b>, <b>3-Column</b> and <b>Checklist</b> are retained as versions; earlier explorations sit in the “Bombed ideas” dropdown.</p>
    </div>
  );
}

const styles = {
  chromeActions: { display: "inline-flex", alignItems: "center", gap: 16 },
  metaRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", width: "100%" },
  metaLeft: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  metaSep: { width: 1, height: 14, background: "var(--color-divider-card)" },
  outcomePill: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--color-success-text)", background: "var(--color-success-bg)", borderRadius: 999, padding: "2px 9px" },
  localeChip: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", background: "var(--color-chip-bg)", borderRadius: 999, padding: "3px 9px" },
  genText: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", marginLeft: "auto" },
  srOnly: { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 },
};

const vbHelp = {
  title: { fontSize: 13, fontWeight: 700, color: "var(--vb-txt)" },
  text: { margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--vb-txt)" },
  hint: { margin: "4px 0 0", fontSize: 11, lineHeight: 1.5, color: "var(--vb-muted)" },
};
