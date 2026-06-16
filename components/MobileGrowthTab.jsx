"use client";

import React from "react";
import Card from "./Card";
import MobileStreakRing from "./MobileStreakRing";
import { MOBILE_GROWTH } from "./mocks/mobileLearning";

// MobileGrowthTab — lightweight "My Growth", shared by all three variants.
// A labelled weekly-goal ring plus stat tiles, all numbers carrying their
// unit (G3). The ring's data is also printed as text right beside it, so
// the chart is never the only way to read it (WCAG-9). Framing is
// progress-and-habit, never a judgement of the person (G4).

export default function MobileGrowthTab() {
  const g = MOBILE_GROWTH;
  return (
    <div style={styles.wrap}>
      <h2 style={styles.h}>My growth</h2>

      <Card shadow padX={18} padY={18} style={styles.ringCard}>
        <MobileStreakRing value={g.weeklyDone} max={g.weeklyGoal} centerTop={`${g.weeklyDone}/${g.weeklyGoal}`} centerSub="this week" />
        <div style={styles.ringText}>
          <span style={styles.ringTitle}>Weekly practice goal</span>
          <span style={styles.ringBody}>{g.weeklyDone} of {g.weeklyGoal} sessions done</span>
          <span style={styles.ringHint}>{Math.max(g.weeklyGoal - g.weeklyDone, 0)} more to hit your goal</span>
        </div>
      </Card>

      <div style={styles.tiles}>
        <Stat value={`${g.streakDays}`} unit="days" label="Current streak" />
        <Stat value={`${g.bestStreak}`} unit="days" label="Best streak" />
        <Stat value={`${g.minutesThisWeek}`} unit="min" label="Practised this week" />
      </div>
    </div>
  );
}

function Stat({ value, unit, label }) {
  return (
    <Card shadow padX={16} padY={16} style={styles.tile}>
      <span style={styles.tileValue}>
        {value}<span style={styles.tileUnit}> {unit}</span>
      </span>
      <span style={styles.tileLabel}>{label}</span>
    </Card>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 16, padding: "16px 16px 24px" },
  h: { margin: 0, fontSize: 22, fontWeight: 800, color: "var(--color-text-deep)" },
  ringCard: { display: "flex", alignItems: "center", gap: 16, borderRadius: 16 },
  ringText: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  ringTitle: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  ringBody: { fontSize: 13, color: "var(--color-text-medium)" },
  ringHint: { fontSize: 12, color: "var(--color-text-tertiary)" },
  tiles: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  tile: { display: "flex", flexDirection: "column", gap: 4, borderRadius: 16 },
  tileValue: { fontSize: 26, fontWeight: 800, color: "var(--color-text-deep)", fontVariantNumeric: "tabular-nums" },
  tileUnit: { fontSize: 13, fontWeight: 600, color: "var(--color-text-tertiary)" },
  tileLabel: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },
};
