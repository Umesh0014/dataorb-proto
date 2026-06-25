"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import Card from "../Card";
import { CategoryChip, Monogram } from "./GuidedWorkflowParts";

// DriverCard — one contact driver on the Guided Workflows landing grid.
// Shows the driver monogram + name, the headline workflows count, a
// three-stat row (Active / To review / Roleplays), and its lane tags.
// The whole card is a single button → driver detail.

/* DriverCard — paste Figma CSS */

export default function DriverCard({ driver, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="gw-focusable"
      aria-label={`${driver.name} — ${driver.workflows} workflows`}
      style={styles.wrap}
    >
      <Card shadow padX={24} padY={22} style={styles.card}>
        <span style={styles.headRow}>
          <Monogram initials={driver.initials} tone={driver.tone} size={40} />
          <span style={styles.name}>{driver.name}</span>
        </span>

        <span style={styles.countRow}>
          <span style={styles.count}>{driver.workflows}</span>
          <span style={styles.countLabel}>{driver.workflows === 1 ? "workflow" : "workflows"}</span>
        </span>

        <span style={styles.divider} />

        <span style={styles.statRow}>
          <span style={styles.stat}>
            <span style={styles.statValue}>{driver.active}</span>
            <span style={styles.statLabel}>Active</span>
          </span>
          <span style={styles.stat}>
            <span style={driver.toReview > 0 ? styles.reviewPill : styles.statValueMuted}>
              {driver.toReview > 0 ? (
                <>
                  {driver.toReview}
                  <ChevronRight size={12} aria-hidden="true" />
                </>
              ) : (
                driver.toReview
              )}
            </span>
            <span style={styles.statLabel}>To review</span>
          </span>
          <span style={styles.stat}>
            <span style={styles.statValue}>{driver.roleplays}</span>
            <span style={styles.statLabel}>Roleplays</span>
          </span>
        </span>

        <span style={styles.tags}>
          {driver.tags.map((t) => (
            <CategoryChip key={t} category={t} />
          ))}
        </span>
      </Card>
    </button>
  );
}

const styles = {
  wrap: {
    display: "block",
    width: "100%",
    padding: 0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    borderRadius: 12,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    height: "100%",
  },
  headRow: { display: "flex", alignItems: "center", gap: 12 },
  name: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  countRow: { display: "flex", alignItems: "baseline", gap: 8 },
  count: { fontSize: 30, fontWeight: 800, color: "var(--color-text-deep)", lineHeight: 1 },
  countLabel: { fontSize: 13, color: "var(--color-text-tertiary)" },
  divider: { height: 1, background: "var(--color-divider-card)", width: "100%" },
  statRow: { display: "flex", alignItems: "flex-start", gap: 28 },
  stat: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  statValue: { fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1 },
  statValueMuted: { fontSize: 18, fontWeight: 700, color: "var(--color-text-placeholder)", lineHeight: 1 },
  reviewPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 2,
    alignSelf: "flex-start",
    padding: "2px 8px",
    borderRadius: 999,
    background: "var(--color-warning-bg)",
    color: "var(--color-warning-text)",
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.3,
  },
  statLabel: { fontSize: 12, color: "var(--color-text-tertiary)" },
  tags: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
};
