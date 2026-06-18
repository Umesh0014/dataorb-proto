"use client";

import React from "react";
import MiraSpaceBriefing from "./MiraSpaceBriefing";
import MiraSpaceRoom from "./MiraSpaceRoom";
import MiraSpacePlayer from "./MiraSpacePlayer";
import VersionBar from "./VersionBar";

// MiraSpaceShell — demo-only host for the "Ask Mira Pro" landing-page
// directions (Notion ticket: [Ask Mira Pro] Landing page). Mirrors the
// CreditsUsageShell precedent: holds the active-direction state in-memory
// (G5 — resets when the session ends, deletable in one commit) and mounts the
// VersionBar switcher bottom-right. Each direction renders the SAME space
// content (one pre-populated "Sales" space) arranged to a distinct mental
// model, so the Gate-1 comparison is structural, not cosmetic.
//
//   A — Briefing-first front page  (arrive to be briefed; newspaper/memo)
//   B — The Room                   (furnished blocks you inhabit; Notion/Coda)
//   C — Player-centric             (your outcome has a podcast; Spotify/NotebookLM)
//
// The VersionBar "?" popover carries each direction's pros/cons (top layer)
// and the reference → insight chain it was built from (More detail), per the
// notion-ticket factory's Gate-1 contract.

const DIRECTIONS = {
  A: { label: "Briefing", Component: MiraSpaceBriefing },
  B: { label: "Room", Component: MiraSpaceRoom },
  C: { label: "Player", Component: MiraSpacePlayer },
};

const VERSIONS = Object.entries(DIRECTIONS).map(([id, d]) => ({
  id: id.toLowerCase(),
  label: d.label,
  iterations: [],
}));

// Per-direction reasoning, surfaced in the "?" popover.
const RATIONALE = {
  A: {
    name: "A · Briefing-first front page",
    model: "Arrive to be briefed (newspaper / Amazon-memo)",
    pros: [
      "Insight is on screen before any input — kills the chatbot-homepage.",
      "Narrative brief pre-ranks what matters; KPIs are the appendix.",
      "Lowest-risk, strongest fit for “insight arrives to them”.",
    ],
    cons: [
      "Collaboration is a sidebar, not the spine — quieter on teamwork.",
      "Long page; the brief dominates the first screen.",
    ],
    refs: [
      ["Tableau Pulse “Today’s Pulse” + Amazon six-pager", "Briefing-over-dashboard pre-ranks what matters", "Lead with authored prose that takes a position, not a TTS of numbers."],
      ["Exec push-vs-pull behaviour", "Execs consume insight where it arrives, not by visiting a tool", "The brief is the hero; chat is a quiet follow-up."],
    ],
  },
  B: {
    name: "B · The Room",
    model: "A furnished space you inhabit with your team (Notion / Coda)",
    pros: [
      "Collaboration is the spine — every block has presence + comments.",
      "Heterogeneous blocks map exactly to Neil’s four things.",
      "Explorations pin back into the room as first-class blocks.",
    ],
    cons: [
      "Risks reintroducing blank-canvas friction if not strictly templated.",
      "Briefing shares the stage rather than leading it.",
    ],
    refs: [
      ["Notion AI Home / Coda “documents as applications”", "A space is a living doc of blocks members comment on", "KPI cards, player, explorations are blocks; collaborators are members."],
      ["Neil: “private vs shared got it wrong”", "Ambiguous visibility default makes execs self-censor", "Explicit Shared/Private badge + deliberate add-to-space promotion."],
    ],
  },
  C: {
    name: "C · Player-centric",
    model: "Your outcome has a podcast (Spotify / NotebookLM)",
    pros: [
      "Audio brief is the hero — built for dead-time, hands/eyes-busy consumption.",
      "Episode feed makes the brief a serial you follow.",
      "One-click play; transcript + TL;DR keep it usable muted.",
    ],
    cons: [
      "Over-indexes on audio for the desk / muted context.",
      "KPIs demoted to show-notes — less glanceable than A.",
    ],
    refs: [
      ["NotebookLM Audio Overview (100M+ plays)", "Two-voice format is the engagement engine, not a gimmick", "One-click-to-play hero; EN→AR toggle lives on the player."],
      ["Audio-in-enterprise pitfalls", "Open floors / back-to-back meetings make audio-only hostile", "Never autoplay; transcript + 1-line TL;DR are equal peers."],
    ],
  },
};

export default function MiraSpaceShell({ onAsk }) {
  const [dir, setDir] = React.useState("A");
  const { Component } = DIRECTIONS[dir];

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <style>{`@keyframes mira-spin { to { transform: rotate(360deg); } }`}</style>

      <Component onAsk={onAsk} />

      <VersionBar
        versions={VERSIONS}
        tabsMode
        value={{ versionId: dir.toLowerCase(), iterationId: null }}
        onChange={({ versionId }) => setDir(versionId.toUpperCase())}
        help={<DirectionHelp dir={dir} />}
      />
    </div>
  );
}

// Help popover content — pros/cons on top, the reference → insight chain
// behind a "More detail" toggle. Styled for the VersionBar's dark popover.
function DirectionHelp({ dir }) {
  const [detail, setDetail] = React.useState(false);
  const r = RATIONALE[dir];
  return (
    <div style={h.wrap}>
      <span style={h.name}>{r.name}</span>
      <span style={h.model}>{r.model}</span>

      {!detail ? (
        <>
          <span style={h.heading}>Pros</span>
          <ul style={h.list}>
            {r.pros.map((p, i) => <li key={i} style={h.li}>{p}</li>)}
          </ul>
          <span style={h.heading}>Cons</span>
          <ul style={h.list}>
            {r.cons.map((c, i) => <li key={i} style={h.li}>{c}</li>)}
          </ul>
        </>
      ) : (
        <>
          <span style={h.heading}>References → insight</span>
          <div style={h.refs}>
            {r.refs.map((ref, i) => (
              <div key={i} style={h.ref}>
                <span style={h.refSrc}>{ref[0]}</span>
                <span style={h.refIns}>{ref[1]}</span>
                <span style={h.refImp}>→ {ref[2]}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <button type="button" onClick={() => setDetail((v) => !v)} style={h.toggle}>
        {detail ? "← Back to pros / cons" : "More detail — the reasoning →"}
      </button>
    </div>
  );
}

const h = {
  wrap: { display: "flex", flexDirection: "column", gap: 8, fontFamily: "var(--vb-ui)" },
  name: { fontSize: 13, fontWeight: 700, color: "var(--vb-txt)" },
  model: { fontSize: 12, color: "var(--vb-muted)", marginBottom: 2 },
  heading: { fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--vb-accent)", marginTop: 4 },
  list: { margin: 0, paddingInlineStart: 16, display: "flex", flexDirection: "column", gap: 4 },
  li: { fontSize: 12, lineHeight: 1.45, color: "var(--vb-txt)" },
  refs: { display: "flex", flexDirection: "column", gap: 10 },
  ref: { display: "flex", flexDirection: "column", gap: 2, paddingInlineStart: 10, borderInlineStart: "2px solid var(--vb-hairline)" },
  refSrc: { fontFamily: "var(--vb-mono)", fontSize: 11, color: "var(--vb-muted)" },
  refIns: { fontSize: 12, color: "var(--vb-txt)", lineHeight: 1.4 },
  refImp: { fontSize: 12, color: "var(--vb-accent)", lineHeight: 1.4 },
  toggle: { marginTop: 4, alignSelf: "flex-start", border: "none", background: "transparent", padding: 0, cursor: "pointer", fontFamily: "var(--vb-mono)", fontSize: 11, fontWeight: 700, color: "var(--vb-muted)" },
};
