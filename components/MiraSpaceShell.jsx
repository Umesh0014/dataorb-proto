"use client";

import React from "react";
import MiraSpaceBriefing from "./MiraSpaceBriefing";
import MiraSpaceRoom from "./MiraSpaceRoom";
import MiraSpacePlayer from "./MiraSpacePlayer";
import MiraWorkspaceCombined from "./MiraWorkspaceCombined";
import MiraWorkspaceCanvas from "./MiraWorkspaceCanvas";
import MiraWorkspaceThreePane from "./MiraWorkspaceThreePane";
import MiraWorkspaceDashboard from "./MiraWorkspaceDashboard";
import MiraWorkspaceConnectedRail from "./MiraWorkspaceConnectedRail";
import MiraWorkspaceConnectedTabs from "./MiraWorkspaceConnectedTabs";
import MiraWorkspaceAssistantForward from "./MiraWorkspaceAssistantForward";
import MiraChatColumn from "./MiraChatColumn";
import VersionBar from "./VersionBar";

// MiraSpaceShell — demo-only host for the "Ask Mira Pro" landing directions.
// Two categories sit in the VersionBar as chips, each with iterations:
//
//   Workspace — the chosen direction (current): one unified connected card for
//               metrics + detail, Ask Mira as a full collapsible column.
//                 1 Connected Rail      (vertical rail; selected connects in)
//                 2 Connected Tabs      (horizontal strip; selected connects down)
//                 3 Assistant-Forward   (Mira co-equal column, rail collapsible)
//   Archive   — earlier explorations kept for comparison:
//                 A Briefing · B Room · C Player (concepts)
//                 D Combined · E Canvas · F Three-Pane · G Dashboard (workspace v1)
//
// Default lands on Workspace · 1. Archive A/B/C keep the collapsible right chat
// column; Archive D–G and all Workspace versions are full-bleed and own their
// chat. State is in-memory only (G5).

const ARCHIVE = {
  A: MiraSpaceBriefing, B: MiraSpaceRoom, C: MiraSpacePlayer,
  D: MiraWorkspaceCombined, E: MiraWorkspaceCanvas, F: MiraWorkspaceThreePane, G: MiraWorkspaceDashboard,
};
const ARCHIVE_CONCEPTS = new Set(["A", "B", "C"]); // use the right chat column
const WORKSPACE = { 1: MiraWorkspaceConnectedRail, 2: MiraWorkspaceConnectedTabs, 3: MiraWorkspaceAssistantForward };

const VERSIONS = [
  { id: "workspace", label: "Workspace", iterations: ["1", "2", "3"] },
  { id: "archive", label: "Archive", iterations: ["A", "B", "C", "D", "E", "F", "G"] },
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

  "archive:D": { name: "Archive · D — Combined Explorer", model: "Accordion; metric cards expand in place (workspace v1)",
    pros: ["Metric + detail are one unit.", "Bottom chat frees the full width."],
    cons: ["Parked: superseded by the connected card.", "One metric open at a time."],
    refs: [["Combine metrics + details", "Browsing and drilling shouldn't split panes", "Cards expand inline."]] },
  "archive:E": { name: "Archive · E — Full-Canvas", model: "Two-pane card rail + detail (workspace v1)",
    pros: ["Detail always beside the list.", "Full width for data."],
    cons: ["Parked: superseded.", "Separate cards, no unified surface."],
    refs: [["Full width + bottom chat", "Maximise data, chat on demand", "Card rail + detail own 100% width."]] },
  "archive:F": { name: "Archive · F — Three-Pane Pro", model: "Cards · detail · context rail (workspace v1)",
    pros: ["Collaborators + quota + shared chats visible.", "All-at-once power surface."],
    cons: ["Parked: superseded.", "Densest layout."],
    refs: [["Exec collaboration + quota", "Context belongs next to the metric", "Right rail carries collaborators + shared chats."]] },
  "archive:G": { name: "Archive · G — Dashboard → Focus", model: "Overview grid ⇄ focus (workspace v1)",
    pros: ["Every metric at a glance.", "Focus view is distraction-free."],
    cons: ["Parked: superseded.", "Extra click to detail."],
    refs: [["Overview-first navigation", "Scan all before drilling", "Card grid opens a focused detail."]] },

  "workspace:1": { name: "Workspace · 1 — Connected Rail", model: "One unified card; selected metric connects into the detail",
    pros: ["Metric list + detail share one white card — no separate panes.", "Selection by background play: gray → hover card → connected white.", "Ask Mira is a full column (button → column), not a bubble."],
    cons: ["Rail caps how many metrics show at once.", "The connection seam needs care at small widths."],
    refs: [["macOS/iOS source-list + Gmail settings", "Selected row should merge into its detail, not sit in a separate pane", "Selected item's white bleeds across the rail/detail seam."]] },
  "workspace:2": { name: "Workspace · 2 — Connected Tabs", model: "Unified card; horizontal metric strip connects down to the detail",
    pros: ["Wider, full-width detail beneath the strip.", "Scan metrics across the top; selected tab connects down.", "Ask Mira is a full column."],
    cons: ["Horizontal strip scrolls with many metrics.", "Less vertical metric overview."],
    refs: [["Connected tab → panel (segmented controls)", "An active tab should join its panel seamlessly", "Selected tab's white merges into the detail below."]] },
  "workspace:3": { name: "Workspace · 3 — Assistant-Forward", model: "Connected card + Mira as a co-equal column, open by default",
    pros: ["“Ask anything, start here” is felt immediately.", "Metric rail collapses to widen the detail.", "Mira is a prominent first-class column."],
    cons: ["Less room for the detail by default.", "Assistant-first may not suit pure scanning."],
    refs: [["Copilot / Cursor side panel as primary", "The assistant should be a real column, not an afterthought", "Mira opens co-equal by default; the rail yields space."]] },
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
  if (isArchive && ARCHIVE_CONCEPTS.has(sel.iterationId)) {
    // A/B/C concepts use the collapsible right chat column.
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
    // Archive D–G (old workspace) and all current Workspace versions are
    // full-bleed and own their chat.
    const Direction = isArchive ? (ARCHIVE[sel.iterationId] || ARCHIVE.D) : (WORKSPACE[sel.iterationId] || WORKSPACE[1]);
    body = <Direction {...chatProps} />;
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
