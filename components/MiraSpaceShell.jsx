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
import MiraStoriesBoard from "./MiraStoriesBoard";
import MiraStoriesReuse from "./MiraStoriesReuse";
import MiraStoriesTrend from "./MiraStoriesTrend";
import MiraStoryPublished from "./MiraStoryPublished";
import MiraStoryScrolly from "./MiraStoryScrolly";
import MiraChatColumn from "./MiraChatColumn";
import VersionBar from "./VersionBar";

// MiraSpaceShell — demo-only host for the "Ask Mira Pro" landing directions.
// Two categories sit in the VersionBar as chips, each with iterations:
//
//   Stories — the current direction (Jun 19 sharpening): arrive to authored
//             stories, not a blank prompt. Default-public, reuse-over-regenerate.
//               Landings:  1 Story Board · 2 Ask-to-Reuse · 3 Living Trend
//               Artifacts: 4 Published Story · 5 Scrolly Story
//   Archive — earlier explorations kept for comparison:
//               A Briefing · B Room · C Player (concepts)
//               D Combined · E Canvas · F Three-Pane · G Dashboard (workspace v1)
//               H Connected Rail · I Connected Tabs · J Assistant-Forward (workspace v2)
//
// Default lands on Stories · 1 (Story Board). Archive A/B/C keep the collapsible
// right chat column; everything else is full-bleed and owns its chat. State is
// in-memory only (G5).

const STORIES_DIRS = {
  1: MiraStoriesBoard, 2: MiraStoriesReuse, 3: MiraStoriesTrend,
  4: MiraStoryPublished, 5: MiraStoryScrolly,
};

const ARCHIVE = {
  A: MiraSpaceBriefing, B: MiraSpaceRoom, C: MiraSpacePlayer,
  D: MiraWorkspaceCombined, E: MiraWorkspaceCanvas, F: MiraWorkspaceThreePane, G: MiraWorkspaceDashboard,
  H: MiraWorkspaceConnectedRail, I: MiraWorkspaceConnectedTabs, J: MiraWorkspaceAssistantForward,
};
const ARCHIVE_CONCEPTS = new Set(["A", "B", "C"]); // use the right chat column

const VERSIONS = [
  { id: "stories", label: "Stories", iterations: ["1", "2", "3", "4", "5"] },
  { id: "archive", label: "Archive", iterations: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] },
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

  "archive:H": { name: "Archive · H — Connected Rail", model: "One unified card; selected metric connects into the detail (workspace v2)",
    pros: ["Metric list + detail share one white card.", "Selection by background play: gray → hover → connected white."],
    cons: ["Parked: this is Neil's Phase ① (analyse next to the outcome), now folded into Stories.", "No authored-story front."],
    refs: [["macOS/iOS source-list + Gmail settings", "Selected row should merge into its detail", "Selected item's white bleeds across the seam."]] },
  "archive:I": { name: "Archive · I — Connected Tabs", model: "Unified card; horizontal metric strip connects down (workspace v2)",
    pros: ["Wider, full-width detail beneath the strip.", "Selected tab connects down into the detail."],
    cons: ["Parked alongside the connected set.", "Less vertical metric overview."],
    refs: [["Connected tab → panel", "An active tab should join its panel seamlessly", "Selected tab's white merges into the detail below."]] },
  "archive:J": { name: "Archive · J — Assistant-Forward", model: "Connected card + Mira as a co-equal column (workspace v2)",
    pros: ["Mira open by default; \"ask anything\" felt immediately.", "Metric rail collapses to widen the detail."],
    cons: ["Parked alongside the connected set.", "Still chat-forward, not story-forward."],
    refs: [["Copilot / Cursor side panel", "The assistant should be a real column", "Mira opens co-equal by default."]] },

  "stories:1": { name: "Stories · 1 — Story Board", model: "Arrive to a board of authored story-objects (the default)",
    pros: ["Front surface is authored stories, never a blank prompt.", "Story is the atomic unit; KPIs live inside cards; \"run analysis\" makes a new one.", "Best home for multi-team scale — cross-team stories drop onto the board."],
    cons: ["Boards can decay into clutter without curation.", "Less opinionated about the one thing that moved than a briefing."],
    refs: [["Gemini Enterprise Projects · Notion/Coda", "A space is a board of co-authored artifacts, not one doc", "Story cards (default-public) fill the board for everyone."]] },
  "stories:2": { name: "Stories · 2 — Ask-to-Reuse", model: "A question searches existing stories before spending a token",
    pros: ["Operationalizes \"author once, view many\" — token discipline you can feel.", "Intercepts with \"Marco already explored this\" before regenerating.", "Explicit \"ask fresh anyway\" escape hatch."],
    cons: ["A wrong \"already answered\" is worse than a blank prompt.", "Quality hinges on match relevance."],
    refs: [["Stack Overflow duplicate intercept · GitHub \"marked as answer\"", "\"Avoid redundant regeneration\" IS the duplicate-question problem", "Typed question → search existing stories/explorations first; story = accepted answer."]] },
  "stories:3": { name: "Stories · 3 — Living Trend", model: "The outcome as a living annotated trend (stock-tracker pattern)",
    pros: ["Execs read a line, not a table — tap a \"key moment\" for \"what happened here?\".", "Compare-across-windows is first-class.", "Stories that explain each move are crawled in alongside."],
    cons: ["Forces a time axis — weak for non-temporal cuts (segment mix, who/what).", "One metric in focus at a time."],
    refs: [["Koyfin · Bloomberg · AlphaSense · Public.com", "The chart is the index into the narrative", "Key moments on the trend expand to a Mira mini-analysis; related stories attach."]] },
  "stories:4": { name: "Stories · 4 — Published Story (artifact)", model: "A story as a published object (Perplexity Pages / Hex app)",
    pros: ["Maps 1:1 to \"story = generated HTML/CSS/React component\".", "Builder-vs-viewer split = default-public-view / opt-in-private-edit.", "Every section carries lineage; pins are live pointers with an \"as of\"."],
    cons: ["Perplexity's export dead-end — needs the \"send to deck\" exit (stubbed).", "Authoring controls add surface."],
    refs: [["Perplexity Pages \"Convert to Page\" · Hex data apps", "Analysis is the source; the story is the published build", "One promotion from analysis → durable, sectioned, citation-bearing story."]] },
  "stories:5": { name: "Stories · 5 — Scrolly Story (artifact)", model: "A story as a guided scrollytelling narrative",
    pros: ["One insight per step — highest comprehension for the no-SQL exec.", "Sticky chart; scrolling moves the \"key moment\".", "Ends on a recommended action; TL;DR keeps it usable muted."],
    cons: ["Linear — poor for jumping straight to a metric (needs the board/timeline for that).", "Authored pacing won't suit every reader."],
    refs: [["Flourish · Tableau Story Points", "Non-technical execs lose dense dashboards; build up one step at a time", "Stepped reveals over a sticky annotated trend, ending in an action."]] },
};

export default function MiraSpaceShell({
  conversation, pendingTurnId, queriesUsed, queriesTotal, onSubmit, onReset,
  setupContextOpen, onToggleSetupContext,
}) {
  const [sel, setSel] = React.useState({ versionId: "stories", iterationId: "1" });
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
    // Archive D–J (parked workspaces) and all Stories directions are full-bleed
    // and own their chat.
    const Direction = isArchive ? (ARCHIVE[sel.iterationId] || ARCHIVE.D) : (STORIES_DIRS[sel.iterationId] || STORIES_DIRS[1]);
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
  const r = RATIONALE[`${sel.versionId}:${sel.iterationId}`] || RATIONALE["stories:1"];
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
