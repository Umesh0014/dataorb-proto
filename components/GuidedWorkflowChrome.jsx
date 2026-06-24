"use client";

import React from "react";
import { ListChecks, Archive } from "lucide-react";
import Button from "./Button";
import PageHeader from "./PageHeader";
import { GW_FLAGSHIP_META } from "./mocks/guidedWorkflows";

// Chrome for the Guided Workflow authoring surface: the editor header
// (back + title, with Publish / Archive actions) and the VersionBar "?"
// reasoning popover. Extracted from GuidedWorkflowsPage to keep that
// orchestrator lean.

export function EditorChrome({ isNew, state, onBack, onPublish, onArchive }) {
  const meta = GW_FLAGSHIP_META;
  const isDraft = state === "draft";
  return (
    <PageHeader
      back={onBack}
      identifier={{
        icon: <ListChecks size={16} color="var(--color-icon-tertiary-fg)" />,
        label: isNew ? "Untitled guided workflow" : meta.title,
        iconBg: "var(--color-icon-tertiary-bg)",
        iconColor: "var(--color-icon-tertiary-fg)",
      }}
      actions={
        <div style={styles.chromeActions}>
          <Button variant="text" uppercase={false} leadingIcon={<Archive size={15} />} onClick={onArchive} className="gw-focusable" style={styles.actionBtn}>Archive</Button>
          <Button variant="primary" onClick={onPublish} className="gw-focusable" style={styles.actionBtn}>{isDraft ? "Publish" : "Update & republish"}</Button>
        </div>
      }
    />
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
  chromeActions: { display: "inline-flex", alignItems: "center", gap: 12 },
  actionBtn: { height: 32, minWidth: 0, paddingInline: 16 },
};

const vbHelp = {
  title: { fontSize: 13, fontWeight: 700, color: "var(--vb-txt)" },
  text: { margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--vb-txt)" },
  hint: { margin: "4px 0 0", fontSize: 11, lineHeight: 1.5, color: "var(--vb-muted)" },
};
