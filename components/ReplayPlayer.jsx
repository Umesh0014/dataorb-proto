"use client";

import React from "react";
import Card from "./Card";
import DarkPillSwitcher from "./DarkPillSwitcher";
import { PlayerHeader } from "./ReplayPlayerParts";
import ReplayPlayerGuide from "./ReplayPlayerGuide";
import ReplayPlayerEditorial from "./ReplayPlayerEditorial";
import ReplayPlayerFocus from "./ReplayPlayerFocus";

// ReplayPlayer — coached playback of one replay. Three finalize directions
// for the playback surface live behind a demo switcher (ticket: Replay
// finalize) — flip A / B / C to compare:
//   A · Guided   — the locked Guide two-column, now with skippable coaching.
//   B · Editorial — reading-mode transcript spine with margin coach notes.
//   C · Focus    — one moment at a time, context cover, reveal/skip coaching.
//
// Each variant owns its own navigation + coaching-visibility state; this
// host owns only the variant selection (in-memory — leaving Replay resets
// it) and the shared header shell every variant renders inside. The switcher
// reuses DarkPillSwitcher (demo meta-tooling), mounted in a floating
// bottom-right cluster — the same pattern as the Missions variant switcher.

const VARIANTS = ["A", "B", "C"];
const VARIANT_LABELS = { A: "Guided", B: "Editorial", C: "Focus" };
const VARIANT_BODY = {
  A: ReplayPlayerGuide,
  B: ReplayPlayerEditorial,
  C: ReplayPlayerFocus,
};

export default function ReplayPlayer({ collection, replay, onBack }) {
  const [variant, setVariant] = React.useState("A");
  const Body = VARIANT_BODY[variant];

  return (
    <div className="replay-player" style={s.column}>
      <Card padX={0} padY={0} style={s.shell}>
        <PlayerHeader replay={replay} collectionName={collection.name} onBack={onBack} />
        <Body collection={collection} replay={replay} />
      </Card>

      <div style={s.switcherCluster}>
        <span style={s.switcherCaption}>{VARIANT_LABELS[variant]} layout</span>
        <DarkPillSwitcher
          ariaLabel="Replay playback layout variant"
          value={variant}
          options={VARIANTS}
          onChange={setVariant}
        />
      </div>
    </div>
  );
}

const s = {
  column: { display: "flex", flexDirection: "column", width: "100%", fontFamily: "var(--font-sans)" },
  shell: { display: "flex", flexDirection: "column", minHeight: 640, overflow: "hidden", border: "1px solid var(--color-border-card-soft)" },

  switcherCluster: { position: "fixed", right: 24, bottom: 24, zIndex: 50, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 },
  switcherCaption: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", color: "#D4D4D4", background: "#171717", border: "1px solid #404040", borderRadius: 6, padding: "4px 10px", boxShadow: "0 12px 32px rgba(0, 0, 0, 0.4)" },
};
