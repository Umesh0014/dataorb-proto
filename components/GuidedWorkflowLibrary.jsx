"use client";

import React from "react";
import { Plus, Link2, History, FileStack } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import TabsRow from "./TabsRow";
import StatusBadge from "./StatusBadge";
import { gwStateTone } from "./mocks/guidedWorkflows";

// GuidedWorkflowLibrary — the manage / view surface. Lists every guided
// workflow with its audit metadata first-class (last edit, who, edit count)
// and the attachment map (how many drill personas use it), filtered by
// lifecycle state. This is the landing for the Drill "Guided Workflows" tab;
// "Create" and opening a row are lifted to the host.

const STATE_TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "draft", label: "Draft" },
  { id: "calibration", label: "Calibration" },
  { id: "archived", label: "Archived" },
];

export default function GuidedWorkflowLibrary({ workflows, onOpen, onCreate }) {
  const [filter, setFilter] = React.useState("all");

  const tabs = STATE_TABS.map((t) => ({
    ...t,
    count: t.id === "all" ? workflows.length : workflows.filter((w) => w.state === t.id).length,
  }));
  const shown = filter === "all" ? workflows : workflows.filter((w) => w.state === filter);

  return (
    <div style={styles.wrap}>
      <div style={styles.intro}>
        <div style={styles.introText}>
          <h2 style={styles.h2}>Guided workflows</h2>
          <p style={styles.sub}>
            The checklist behind each drill — author it once, attach it to a persona, and agents
            practise against it with the safety wheel on.
          </p>
        </div>
        <Button variant="primary" leadingIcon={<Plus size={16} />} onClick={onCreate}>
          Create guided workflow
        </Button>
      </div>

      <TabsRow tabs={tabs} activeTab={filter} onTabClick={setFilter} />

      <div style={styles.list}>
        {shown.map((w) => (
          <WorkflowRow key={w.id} w={w} onOpen={() => onOpen(w.id)} />
        ))}
      </div>
    </div>
  );
}

function WorkflowRow({ w, onOpen }) {
  const badge = gwStateTone(w.state);
  return (
    <Card shadow padX={20} padY={18} style={styles.row}>
      <button type="button" onClick={onOpen} style={styles.rowBtn} className="gw-focusable" aria-label={`Open ${w.title}`}>
        <span style={styles.rowMain}>
          <span style={styles.rowTitleLine}>
            <span style={styles.rowTitle}>{w.title}</span>
            <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
          </span>
          <span style={styles.reason}>{w.contactReason}</span>
          <span style={styles.metaRow}>
            <span style={styles.metaItem}>
              <FileStack size={13} color="var(--color-text-tertiary)" aria-hidden="true" />
              {w.stepCount} steps · {w.requiredCount} required
            </span>
            <span style={styles.metaItem}>
              <Link2 size={13} color="var(--color-text-tertiary)" aria-hidden="true" />
              {w.attachedPersonas.length > 0
                ? `${w.attachedPersonas.length} persona${w.attachedPersonas.length > 1 ? "s" : ""}`
                : "Not attached"}
            </span>
            <span style={styles.metaItem}>
              {w.source.kind === "interactions" ? `Mined from ${w.source.count} interactions` : "From pasted transcript"}
              {w.groundingPct > 0 && ` · ${w.groundingPct}% grounded`}
            </span>
          </span>
        </span>
      </button>

      <div style={styles.rowSide}>
        <span style={styles.audit}>
          <History size={13} color="var(--color-text-tertiary)" aria-hidden="true" />
          Edited {w.updatedAt} · {w.editCount} edits
        </span>
        <span style={styles.author}>
          <span style={{ ...styles.monogram, background: w.author.bg, color: w.author.fg }}>{w.author.initial}</span>
          {w.lastEditedBy}
        </span>
      </div>
    </Card>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 20 },
  intro: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 },
  introText: { display: "flex", flexDirection: "column", gap: 6, maxWidth: 640 },
  h2: { margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-deep)" },
  sub: { margin: 0, fontSize: 13.5, color: "var(--color-text-tertiary)", lineHeight: 1.55 },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 },
  rowBtn: { flex: 1, minWidth: 0, background: "transparent", border: "none", padding: 0, cursor: "pointer", textAlign: "left", fontFamily: "inherit" },
  rowMain: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 },
  rowTitleLine: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  rowTitle: { fontSize: 15.5, fontWeight: 700, color: "var(--color-text-deep)" },
  reason: { fontSize: 13, color: "var(--color-text-medium)", lineHeight: 1.45 },
  metaRow: { display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 2 },
  metaItem: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-tertiary)" },
  rowSide: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 },
  audit: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },
  author: { display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: "var(--color-text-medium)" },
  monogram: { width: 22, height: 22, borderRadius: 999, display: "inline-grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 },
};
