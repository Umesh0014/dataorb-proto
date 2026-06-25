"use client";

import React from "react";
import { Headphones, Pin, Archive, Trash2 } from "lucide-react";
import Card from "../Card";
import Button from "../Button";
import KebabMenu from "../KebabMenu";
import { CategoryChip, WorkflowStatusPill, UnpublishedPill } from "./GuidedWorkflowParts";

// WorkflowRow — one guided workflow on the driver-detail list (Image 2).
// Left: title + system id, roleplay count, last-edited + author. Right:
// lane tag, status pill (+ "Unpublished changes" when flagged), and the
// action button (Edit for active, Review for drafts) with a kebab menu.
// Row click and the action button both open the contact-reason view.

/* WorkflowRow + status/category pills — paste Figma CSS */

export default function WorkflowRow({ workflow, onOpen, onPin, onArchive, onDelete }) {
  const isDraft = workflow.status === "draft";
  const kebabItems = [
    { label: "Pin", icon: <Pin size={16} />, onClick: () => onPin?.(workflow.id) },
    { label: "Archive", icon: <Archive size={16} />, onClick: () => onArchive?.(workflow.id) },
    { label: "Delete", icon: <Trash2 size={16} />, tone: "danger", onClick: () => onDelete?.(workflow.id) },
  ];

  return (
    <Card shadow padX={20} padY={16} style={styles.card}>
      <button
        type="button"
        onClick={onOpen}
        className="gw-focusable"
        aria-label={`Open ${workflow.title}`}
        style={styles.main}
      >
        <span style={styles.title}>{workflow.title}</span>
        <span style={styles.meta}>
          <span style={styles.id}>{workflow.id}</span>
          {workflow.roleplays > 0 && (
            <>
              <span style={styles.sep}>·</span>
              <span style={styles.metaItem}>
                <Headphones size={13} color="var(--color-text-tertiary)" aria-hidden="true" />
                {workflow.roleplays} {workflow.roleplays === 1 ? "roleplay" : "roleplays"}
              </span>
            </>
          )}
          <span style={styles.sep}>·</span>
          <span style={styles.metaItem}>Edited {workflow.edited}</span>
          <span style={styles.sep}>·</span>
          <span style={styles.metaItem}>{workflow.author}</span>
        </span>
      </button>

      <div style={styles.side}>
        <CategoryChip category={workflow.category} />
        <WorkflowStatusPill status={workflow.status} />
        {workflow.unpublished && <UnpublishedPill />}
        <Button variant="text" uppercase={false} onClick={onOpen} style={styles.action}>
          {isDraft ? "Review" : "Edit"}
        </Button>
        <KebabMenu ariaLabel={`More actions for ${workflow.title}`} items={kebabItems} />
      </div>
    </Card>
  );
}

const styles = {
  card: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  main: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 5,
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    borderRadius: 4,
  },
  title: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  meta: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  id: { fontSize: 12, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },
  sep: { fontSize: 12, color: "var(--color-text-placeholder)" },
  metaItem: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--color-text-tertiary)" },
  side: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  action: {
    height: 32,
    paddingInline: 16,
    border: "1px solid var(--color-divider-card)",
    borderRadius: 999,
    fontWeight: 600,
  },
};
