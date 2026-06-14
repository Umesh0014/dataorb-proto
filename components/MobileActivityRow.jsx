"use client";

import React from "react";
import Card from "./Card";
import { ACTIVITY_META } from "./mocks/mobileLearning";

// MobileActivityRow — one assignment tile, shared by the Activities tab
// and each variant's home. A tinted activity glyph, the title + a
// status/meta line, and a trailing affordance. Guide (V1) gets a real
// "Start" button that opens the voice session; Replay (V2) and Drill (V3)
// are shown but visibly marked as a later phase rather than failing
// silently (INT-8); done items show a check. Status is conveyed with text
// *and* colour, never colour alone (G9).

const PHASE = { replay: "V2 · soon", drill: "V3 · soon" };

const STATE_PILL = {
  overdue: { label: "Overdue", bg: "var(--color-error-bg)", fg: "var(--color-error-text)" },
  today:   { label: "Today",   bg: "var(--color-primary-alpha-08)", fg: "var(--color-button-primary-bg)" },
  upcoming:{ label: "Upcoming", bg: "var(--color-chip-bg)", fg: "var(--color-text-tertiary)" },
  done:    { label: "Done",     bg: "var(--color-success-bg)", fg: "var(--color-success-text)" },
};

export default function MobileActivityRow({ activity, onStart }) {
  const meta = ACTIVITY_META[activity.type];
  const pill = STATE_PILL[activity.state] || STATE_PILL.upcoming;
  const isDone = activity.state === "done";
  const isGuide = activity.type === "guide";

  return (
    <Card shadow padX={14} padY={14} style={styles.row}>
      <span style={{ ...styles.glyph, background: meta.bg, color: meta.fg }} aria-hidden="true">
        <span className="material-symbols-outlined" style={styles.glyphIcon}>{meta.glyph}</span>
      </span>

      <div style={styles.body}>
        <div style={styles.topLine}>
          <span style={styles.type}>{meta.label}</span>
          <span style={styles.dot} aria-hidden="true">·</span>
          <span style={styles.minutes}>{activity.minutes} min</span>
        </div>
        <span style={styles.title} dir="auto">{activity.title}</span>
        <div style={styles.metaLine}>
          <span style={{ ...styles.pill, background: pill.bg, color: pill.fg }}>{pill.label}</span>
          <span style={styles.due} dir="auto">{activity.due}</span>
        </div>
      </div>

      <div style={styles.action}>
        {isDone ? (
          <span className="material-symbols-outlined" style={styles.doneCheck} aria-label="Completed">check_circle</span>
        ) : isGuide ? (
          <button
            type="button"
            className="cc-focusable"
            onClick={() => onStart?.(activity)}
            style={styles.startBtn}
            aria-label={`Start ${activity.title}`}
          >
            Start
          </button>
        ) : (
          <span style={styles.phase} aria-label={`${PHASE[activity.type]}`}>{PHASE[activity.type]}</span>
        )}
      </div>
    </Card>
  );
}

const styles = {
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
  },
  glyph: { width: 40, height: 40, borderRadius: 12, display: "inline-grid", placeItems: "center", flexShrink: 0 },
  glyphIcon: { fontSize: 22 },
  body: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0, flex: 1 },
  topLine: { display: "flex", alignItems: "center", gap: 6 },
  type: { fontSize: 11, fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  dot: { fontSize: 11, color: "var(--color-text-tertiary)" },
  minutes: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)" },
  title: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" },
  metaLine: { display: "flex", alignItems: "center", gap: 8, marginTop: 2 },
  pill: { display: "inline-flex", alignItems: "center", height: 20, paddingInline: 8, borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: "0.2px" },
  due: { fontSize: 11, color: "var(--color-text-tertiary)" },
  action: { flexShrink: 0, display: "inline-flex", alignItems: "center" },
  startBtn: { appearance: "none", border: "none", background: "var(--color-button-primary-bg)", color: "#FFFFFF", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, minHeight: 44, minWidth: 64, paddingInline: 16, borderRadius: 999, cursor: "pointer" },
  phase: { display: "inline-flex", alignItems: "center", height: 28, paddingInline: 12, borderRadius: 999, background: "var(--color-chip-bg)", color: "var(--color-text-tertiary)", fontSize: 11, fontWeight: 700, letterSpacing: "0.2px" },
  doneCheck: { fontSize: 26, color: "var(--color-success)" },
};
