"use client";

import React from "react";
import Card from "./Card";
import MobileActivityRow from "./MobileActivityRow";
import { MOBILE_ASSIGNMENTS } from "./mocks/mobileLearning";

// MobileActivitiesTab — the full assignments list, shared by all three
// variants' "Activities" tab. To-do items first, completed below. A
// deliberate all-caught-up empty state covers the zero case (INT-5).

export default function MobileActivitiesTab({ onStart }) {
  const todo = MOBILE_ASSIGNMENTS.filter((a) => a.state !== "done");
  const done = MOBILE_ASSIGNMENTS.filter((a) => a.state === "done");

  return (
    <div style={styles.wrap}>
      <h2 style={styles.h}>Your activities</h2>

      {todo.length === 0 ? (
        <Card shadow padX={24} padY={40} style={styles.empty}>
          <span className="material-symbols-outlined" style={styles.emptyGlyph} aria-hidden="true">task_alt</span>
          <span style={styles.emptyTitle}>You&apos;re all caught up</span>
          <span style={styles.emptyBody}>Nothing due right now. New practice from your team lead shows up here.</span>
        </Card>
      ) : (
        <section style={styles.section}>
          <span style={styles.label}>To do ({todo.length})</span>
          <div style={styles.list}>
            {todo.map((a) => <MobileActivityRow key={a.id} activity={a} onStart={onStart} />)}
          </div>
        </section>
      )}

      {done.length > 0 && (
        <section style={styles.section}>
          <span style={styles.label}>Completed ({done.length})</span>
          <div style={styles.list}>
            {done.map((a) => <MobileActivityRow key={a.id} activity={a} onStart={onStart} />)}
          </div>
        </section>
      )}
    </div>
  );
}

const styles = {
  wrap: { display: "flex", flexDirection: "column", gap: 18, padding: "16px 16px 24px" },
  h: { margin: 0, fontSize: 22, fontWeight: 800, color: "var(--color-text-deep)" },
  section: { display: "flex", flexDirection: "column", gap: 10 },
  label: { fontSize: 12, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  list: { display: "flex", flexDirection: "column", gap: 10 },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8, borderRadius: 16 },
  emptyGlyph: { fontSize: 40, color: "var(--color-success)" },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  emptyBody: { fontSize: 13, color: "var(--color-text-tertiary)", lineHeight: 1.5, maxWidth: 260 },
};
