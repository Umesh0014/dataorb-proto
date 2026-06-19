"use client";

import React from "react";
import MiraSpaceBriefing from "./MiraSpaceBriefing";
import MiraSpaceRoom from "./MiraSpaceRoom";
import MiraSpacePlayer from "./MiraSpacePlayer";
import MiraWorkspaceCombined from "./MiraWorkspaceCombined";
import MiraWorkspaceCanvas from "./MiraWorkspaceCanvas";
import MiraWorkspaceThreePane from "./MiraWorkspaceThreePane";
import MiraWorkspaceDashboard from "./MiraWorkspaceDashboard";
import MiraChatColumn from "./MiraChatColumn";
import VersionBar from "./VersionBar";

// MiraSpaceShell — demo-only host for the "Ask Mira Pro" landing directions.
// Two categories sit in the VersionBar as chips, each with iterations:
//
//   Archive   — the earlier concept explorations (A Briefing · B Room · C Player).
//   Workspace — the chosen direction, now with four versions:
//                 1 Combined Explorer (accordion)
//                 2 Full-Canvas Master–Detail (two-pane)
//                 3 Three-Pane Pro (cards · detail · context rail)
//                 4 Dashboard → Focus (overview grid ⇄ focus)
//
// Default lands on Workspace · 1. Archive directions keep the collapsible
// right chat column; Workspace versions are full-bleed and own the bottom
// Facebook-style chat. State is in-memory only (G5).

const ARCHIVE = { A: MiraSpaceBriefing, B: MiraSpaceRoom, C: MiraSpacePlayer };
const WORKSPACE = { 1: MiraWorkspaceCombined, 2: MiraWorkspaceCanvas, 3: MiraWorkspaceThreePane, 4: MiraWorkspaceDashboard };

const VERSIONS = [
  { id: "archive", label: "Archive", iterations: ["A", "B", "C"] },
  { id: "workspace", label: "Workspace", iterations: ["1", "2", "3", "4"] },
];

const RATIONALE = {
  "archive:A": { name: "Archive · A — Briefing", model: "Arrive to be briefed (newspaper / Amazon-memo)",
    pros: ["Insight on screen before any input.", "Narrative brief pre-ranks what matters."],
    cons: ["Parked: superseded by Workspace.", "Collaboration is a sidebar."],
    refs: [["Tableau Pulse + Amazon six-pager", "Briefing-over-dashboard pre-ranks what matters", "Lead with authored prose, not a TTS of numbers."]] },
  "archive:B": { name: "Archive · B — Room", model: "A furnished space you inhabit (Notion / Coda)",
    pros: ["Collaboration is the spine.", "Blocks map to the four things."],
    cons: ["Parked: superseded by Workspace.", "Briefing shares the stage."],
    refs: [["Notion AI Home / Coda", "A space is a living doc of blocks", "KPIs, player, explorations as blocks; members comment."]] },
  "archive:C": { name: "Archive · C — Player", model: "Your outcome has a podcast (Spotify / NotebookLM)",
    pros: ["Audio brief is the hero.", "Episode feed makes it a serial."],
    cons: ["Parked: superseded by Workspace.", "Over-indexes on audio for the desk."],
    refs: [["NotebookLM Audio Overview", "Two-voice format is the engagement engine", "One-click play; transcript keeps it usable muted."]] },

  "workspace:1": { name: "Workspace · 1 — Combined Explorer", model: "Accordion: metrics + details in one surface",
    pros: ["Metric and its detail are one unit — expand in place.", "Celebrated metric cards, no list↔detail switch.", "Bottom chat frees the full width."],
    cons: ["One metric open at a time.", "Less side-by-side comparison."],
    refs: [["Combine metrics + details (your feedback)", "Browsing and drilling shouldn't split panes", "Cards expand inline to reveal trend + read + clip + chats."]] },
  "workspace:2": { name: "Workspace · 2 — Full-Canvas Master–Detail", model: "Two-pane: card rail + persistent detail",
    pros: ["Detail always visible beside the metric list.", "Full width for data; chat at bottom.", "Fast metric-to-metric scanning."],
    cons: ["Detail column can feel wide on big metrics.", "No team/context pane."],
    refs: [["Full width + bottom chat (your feedback)", "Maximise data; chat on demand", "Card rail + detail own 100% width; Ask Mira is a bottom widget."]] },
  "workspace:3": { name: "Workspace · 3 — Three-Pane Pro", model: "Cards · detail · context rail (everything visible)",
    pros: ["Adds collaborators-with-quota + shared chats per metric.", "Power-user, all-at-once surface.", "Celebrated cards + clean panes."],
    cons: ["Densest of the four.", "Needs the most width."],
    refs: [["Exec collaboration + quota", "Context (who, shared work) belongs next to the metric", "A right rail carries collaborators + the metric's shared chats."]] },
  "workspace:4": { name: "Workspace · 4 — Dashboard → Focus", model: "Overview grid ⇄ focused metric",
    pros: ["See every metric at a glance first.", "Focus view is distraction-free.", "Familiar dashboard entry."],
    cons: ["Extra click to reach detail.", "Two screens to maintain."],
    refs: [["Overview-first navigation", "Execs scan all metrics before drilling", "A celebrated-card grid opens into a focused detail; Back returns."]] },
};

export default function MiraSpaceShell({
  conversation, pendingTurnId, queriesUsed, queriesTotal, onSubmit, onReset,
  setupContextOpen, onToggleSetupContext,
}) {
  const [sel, setSel] = React.useState({ versionId: "workspace", iterationId: "1" });
  const [chatOpen, setChatOpen] = React.useState(false);

  const isArchive = sel.versionId === "archive";

  // Archive directions (A/B/C) use the collapsible right chat column; a card's
  // ask affordance opens it pre-scoped and submits.
  const handleAsk = (text) => {
    setChatOpen(true);
    if (text && text.trim() && !pendingTurnId) onSubmit(text);
  };

  const chatProps = {
    conversation, pendingTurnId, queriesUsed, queriesTotal, onSubmit, onReset,
  };

  let body;
  if (isArchive) {
    const Direction = ARCHIVE[sel.iterationId] || ARCHIVE.A;
    body = (
      <div style={row}>
        <div style={main}><Direction onAsk={handleAsk} /></div>
        <MiraChatColumn
          open={chatOpen}
          onToggle={setChatOpen}
          setupContextOpen={setupContextOpen}
          onToggleSetupContext={onToggleSetupContext}
          {...chatProps}
        />
      </div>
    );
  } else {
    const Version = WORKSPACE[sel.iterationId] || WORKSPACE[1];
    body = <Version {...chatProps} />;
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <style>{`@keyframes mira-spin { to { transform: rotate(360deg); } }`}</style>

      {body}

      <VersionBar
        versions={VERSIONS}
        tabsMode
        value={{ versionId: sel.versionId, iterationId: sel.iterationId }}
        onChange={({ versionId, iterationId }) =>
          setSel({ versionId, iterationId: iterationId ?? (versionId === "archive" ? "A" : "1") })
        }
        help={<DirectionHelp sel={sel} />}
      />
    </div>
  );
}

const row = { display: "flex", alignItems: "flex-start", gap: 20, width: "100%" };
const main = { flex: 1, minWidth: 0 };

// Help popover — pros/cons on top, the reference → insight chain behind a
// "More detail" toggle. Styled for the VersionBar's dark popover.
function DirectionHelp({ sel }) {
  const [detail, setDetail] = React.useState(false);
  const r = RATIONALE[`${sel.versionId}:${sel.iterationId}`] || RATIONALE["workspace:1"];
  return (
    <div style={h.wrap}>
      <span style={h.name}>{r.name}</span>
      <span style={h.model}>{r.model}</span>
      {!detail ? (
        <>
          <span style={h.heading}>Pros</span>
          <ul style={h.list}>{r.pros.map((p, i) => <li key={i} style={h.li}>{p}</li>)}</ul>
          <span style={h.heading}>Cons</span>
          <ul style={h.list}>{r.cons.map((c, i) => <li key={i} style={h.li}>{c}</li>)}</ul>
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
