"use client";

import React from "react";
import Card from "./Card";
import KebabMenu from "./KebabMenu";

// RoleplayLibraryCard — Roleplay Library list-card (Phase 2 of the
// Team Lead Roleplay rebuild). One card per persona; renders inside the
// 2-col grid driven by LearningHubPage.
//
// Layout per Figma "In review - V2" Drill spec:
//   • Header row — emoji thumbnail + persona title + kebab (Team Lead only)
//   • Author name beneath the title
//   • Description, clamped to 2 lines
//   • Footer tag chip
//
// Cards with status="draft" mute the emoji + author, and the
// LearningHubPage hides the description / author lines entirely when the
// fields come in blank — matches the Figma Draft tab where a half-built
// persona still surfaces as a card.

export default function RoleplayLibraryCard({
  persona,
  showKebab = true,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onClick,
}) {
  const isMuted = persona.status === "draft" || persona.status === "archived";
  // Kebab item set depends on status — archived gets Restore/Delete; the
  // rest get Edit/Archive. Draft cards drop Archive because there is
  // nothing yet to archive.
  const items = React.useMemo(() => {
    if (persona.status === "archived") {
      return [
        { label: "Restore", onClick: () => onRestore?.(persona) },
        { label: "Delete", onClick: () => onDelete?.(persona) },
      ];
    }
    if (persona.status === "draft") {
      return [
        { label: "Edit", onClick: () => onEdit?.(persona) },
      ];
    }
    return [
      { label: "Edit", onClick: () => onEdit?.(persona) },
      { label: "Archive", onClick: () => onArchive?.(persona) },
    ];
  }, [persona, onEdit, onArchive, onRestore, onDelete]);

  return (
    <Card padX={16} padY={16} style={styles.card} shadow>
      <button
        type="button"
        onClick={() => onClick?.(persona)}
        style={styles.surface}
        aria-label={`Open ${persona.title}`}
      >
        <div style={styles.headerRow}>
          <span
            style={{ ...styles.mood, opacity: isMuted ? 0.5 : 1 }}
            aria-hidden="true"
          >
            {persona.mood}
          </span>
          <h3 style={styles.title}>{persona.title}</h3>
        </div>
        {persona.author ? (
          <span style={{ ...styles.author, opacity: isMuted ? 0.6 : 1 }}>
            {persona.author}
          </span>
        ) : (
          <span style={styles.placeholder}>--</span>
        )}
        {persona.description ? (
          <p style={styles.description}>{persona.description}</p>
        ) : (
          <span style={styles.placeholder}>--</span>
        )}
        {persona.tag && (
          <span style={styles.tag}>{persona.tag}</span>
        )}
      </button>

      {showKebab && (
        <span
          style={styles.kebabAnchor}
          onClick={(e) => e.stopPropagation()}
        >
          <KebabMenu
            ariaLabel={`Actions for ${persona.title}`}
            items={items}
          />
        </span>
      )}
    </Card>
  );
}

const styles = {
  card: {
    position: "relative",
    display: "block",
    minHeight: 168,
    padding: 0,
  },
  surface: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    appearance: "none",
    border: "none",
    background: "transparent",
    textAlign: "left",
    padding: 16,
    paddingRight: 40,
    width: "100%",
    minWidth: 0,
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  mood: {
    fontSize: 20,
    lineHeight: 1,
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  author: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-deep)",
  },
  description: {
    margin: 0,
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-medium)",
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  placeholder: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },
  tag: {
    display: "inline-flex",
    alignItems: "center",
    alignSelf: "flex-start",
    height: 22,
    padding: "0 10px",
    borderRadius: 4,
    background: "var(--pill-bg)",
    color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 500,
    marginTop: 6,
  },
  kebabAnchor: {
    position: "absolute",
    top: 12,
    right: 12,
  },
};
