"use client";

import React from "react";
import Card from "./Card";
import Button from "./Button";

// DrillCard — presentation card for a single Drill scenario.
// Reuses the Card primitive (white surface, 12px radius). All visual
// decisions inherit from existing tokens; chip color states map to the
// existing success/warning/error token sets.
//
// Layout per card:
//   1. Mood emoji + customer name (bold)
//   2. Scenario title
//   3. Description (3-4 lines, clamps with ellipsis)
//   4. Two chips (category, difficulty)
//   5. Full-width primary "View Details" CTA
//
// Localization (ticket: GUI multilingual + RTL): the GUI strings — the
// taxonomy chips and the CTA — accept localized display labels via
// `categoryLabel` / `difficultyLabel` / `ctaLabel` while `difficulty`
// stays the English semantic key that drives the color band. The raw
// scenario content (customer name, title, description) is the ground-truth
// transcript and is never translated, so it renders `dir="auto"` to keep
// its own reading direction even when the surrounding GUI is RTL.
export default function DrillCard({
  mood,
  customer,
  title,
  description,
  category,
  difficulty,
  categoryLabel,
  difficultyLabel,
  ctaLabel = "View Details",
  onViewDetails,
}) {
  return (
    <Card padX={24} padY={24} shadow style={dcStyles.card}>
      <div style={dcStyles.header}>
        <span style={dcStyles.mood} aria-hidden="true">{mood}</span>
        <span style={dcStyles.customer} dir="auto">{customer}</span>
      </div>

      <div style={dcStyles.divider} />

      <div style={dcStyles.title} dir="auto">{title}</div>
      <div style={dcStyles.description} dir="auto">{description}</div>

      <div style={dcStyles.chipRow}>
        <CategoryChip>{categoryLabel ?? category}</CategoryChip>
        <DifficultyChip level={difficulty} label={difficultyLabel ?? difficulty} />
      </div>

      <Button
        variant="primary"
        fullWidth
        onClick={onViewDetails}
        style={dcStyles.cta}
      >
        {ctaLabel}
      </Button>
    </Card>
  );
}

function CategoryChip({ children }) {
  return (
    <span style={dcStyles.chipNeutral}>{children}</span>
  );
}

function DifficultyChip({ level, label }) {
  const palette = DIFFICULTY_PALETTE[level] || DIFFICULTY_PALETTE.Simple;
  return (
    <span
      style={{
        ...dcStyles.chipBase,
        background: palette.bg,
        color: palette.text,
      }}
    >
      {label ?? level}
    </span>
  );
}

const DIFFICULTY_PALETTE = {
  Simple: {
    bg: "var(--color-success-bg)",
    text: "var(--color-success-text)",
  },
  Moderate: {
    bg: "var(--color-warning-bg)",
    text: "var(--color-warning-text)",
  },
  Complex: {
    bg: "var(--color-error-bg)",
    text: "var(--color-error-text)",
  },
};

const dcStyles = {
  card: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  mood: {
    fontSize: 18,
    lineHeight: 1,
  },
  customer: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  divider: {
    height: 1,
    background: "var(--color-divider-card)",
  },
  title: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-medium)",
    lineHeight: 1.45,
  },
  description: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 4,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  chipRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  chipBase: {
    display: "inline-flex",
    alignItems: "center",
    height: 24,
    padding: "3px 10px",
    borderRadius: 999,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.4,
  },
  chipNeutral: {
    display: "inline-flex",
    alignItems: "center",
    height: 24,
    padding: "3px 10px",
    borderRadius: 999,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.4,
    background: "transparent",
    color: "var(--color-text-medium)",
    border: "1px solid var(--color-divider-card)",
  },
  cta: {
    marginTop: 4,
  },
};
