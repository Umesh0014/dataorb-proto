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
import MiraHome from "./MiraHome";
import MiraStoriesBoard from "./MiraStoriesBoard";
import MiraStoriesReuse from "./MiraStoriesReuse";
import MiraStoriesTrend from "./MiraStoriesTrend";
import MiraStoryPublished from "./MiraStoryPublished";
import MiraStoryScrolly from "./MiraStoryScrolly";
import MiraChatColumn from "./MiraChatColumn";
import VersionBar from "./VersionBar";

// MiraSpaceShell — demo-only host for the "Ask Mira Pro" landing directions.
// Each direction carries a real name in the VersionBar (no bare A/B/1 tokens).
// Three categories sit as chips, each with named iterations:
//
//   Home    — the current direction (ChatGPT-5 home borrow): greeting → one
//             "ask anything" input → top metrics per category → your chats.
//               By Category (3 cards) · Top Metrics (6 cards)
//   Stories — parked: arrive-to-authored-stories explorations.
//               Story Board · Ask-to-Reuse · Living Trend · Published · Scrolly
//   Archive — parked: earlier explorations kept for comparison.
//               Briefing · Room · Player (concepts; use the right chat column)
//               Combined · Canvas · Three-Pane · Dashboard (workspace v1)
//               Connected Rail · Connected Tabs · Assistant-Forward (workspace v2)
//
// Default lands on Home · By Category. State is in-memory only (G5).

const STORIES_DIRS = {
  board: MiraStoriesBoard, reuse: MiraStoriesReuse, trend: MiraStoriesTrend,
  published: MiraStoryPublished, scrolly: MiraStoryScrolly,
};

const ARCHIVE = {
  briefing: MiraSpaceBriefing, room: MiraSpaceRoom, player: MiraSpacePlayer,
  combined: MiraWorkspaceCombined, canvas: MiraWorkspaceCanvas, threepane: MiraWorkspaceThreePane, dashboard: MiraWorkspaceDashboard,
  rail: MiraWorkspaceConnectedRail, tabs: MiraWorkspaceConnectedTabs, assistant: MiraWorkspaceAssistantForward,
};
const ARCHIVE_CONCEPTS = new Set(["briefing", "room", "player"]); // use the right chat column

const DEFAULT_ITER = { home: "cat3", stories: "board", archive: "briefing" };

const VERSIONS = [
  { id: "home", label: "Home", iterations: [
    { id: "cat3", label: "By Category" }, { id: "kpi6", label: "Top Metrics" },
    { id: "bento", label: "Bento" },
  ] },
  { id: "stories", label: "Stories", iterations: [
    { id: "board", label: "Story Board" }, { id: "reuse", label: "Ask-to-Reuse" },
    { id: "trend", label: "Living Trend" }, { id: "published", label: "Published Story" },
    { id: "scrolly", label: "Scrolly Story" },
  ] },
  { id: "archive", label: "Archive", iterations: [
    { id: "briefing", label: "Briefing" }, { id: "room", label: "Room" }, { id: "player", label: "Player" },
    { id: "combined", label: "Combined" }, { id: "canvas", label: "Canvas" }, { id: "threepane", label: "Three-Pane" },
    { id: "dashboard", label: "Dashboard" }, { id: "rail", label: "Connected Rail" },
    { id: "tabs", label: "Connected Tabs" }, { id: "assistant", label: "Assistant-Forward" },
  ] },
];

const RATIONALE = {
  "home:cat3": { name: "Home · By Category", model: "ChatGPT-5 home borrow: ask box → metrics by category → your chats",
    pros: ["Familiar home: greeting + one \"ask anything\" input on top.", "Top metrics grouped into 3 category cards directly under the input.", "Your chat interactions are right there — tabbed (chats / stories / pinned / prompts)."],
    cons: ["Category roll-up hides individual metric trends until you ask.", "Less of an authored-story front than the Stories set."],
    refs: [["ChatGPT-5 home", "Greeting + single input + glanceable cards + recent threads is a proven home", "Ask box on top; metrics per category below; chat history beneath."]] },
  "home:kpi6": { name: "Home · Top Metrics", model: "Same home; the metric band shows the 6 headline KPIs",
    pros: ["Six headline KPIs with value + delta + sparkline at a glance.", "Same ask-on-top + chat-history-below structure.", "Trends are visible without drilling in."],
    cons: ["Six tiles compete for the \"one thing that moved\".", "No category grouping."],
    refs: [["ChatGPT-5 home + stat-card grid", "Glanceable KPI tiles beat a table for the no-SQL exec", "6 KPI cards under the ask box; colour never alone for deltas."]] },

  "home:bento": { name: "Home · Bento", model: "Same home; metrics in a bento grid with visual flair",
    pros: ["Fewer, hero-weighted metric cards in an asymmetric bento grid.", "Visual flair: tinted gradients, big numerals, sparklines — scannable at a glance.", "Same ask-on-top + chat-history-below structure."],
    cons: ["Hero weighting editorialises which metric matters most.", "Shows fewer metrics than the 6-up grid."],
    refs: [["Bento-grid dashboards (Vercel / Linear / Apple)", "An asymmetric grid with a hero tile reads faster than equal tiles", "One hero KPI + a few supporting tiles, each with a sparkline and tinted tone."]] },

  "stories:board": { name: "Stories · Story Board", model: "Arrive to a board of authored story-objects",
    pros: ["Front surface is authored stories, never a blank prompt.", "Story is the atomic unit; KPIs live inside cards.", "Best home for multi-team scale — cross-team stories drop onto the board."],
    cons: ["Parked behind Home.", "Boards can decay into clutter without curation."],
    refs: [["Gemini Enterprise Projects · Notion/Coda", "A space is a board of co-authored artifacts, not one doc", "Story cards (default-public) fill the board for everyone."]] },
  "stories:reuse": { name: "Stories · Ask-to-Reuse", model: "A question searches existing stories before spending a token",
    pros: ["Operationalizes \"author once, view many\".", "Intercepts with \"Marco already explored this\" before regenerating.", "Explicit \"ask fresh anyway\" escape."],
    cons: ["Parked behind Home.", "A wrong \"already answered\" is worse than a blank prompt."],
    refs: [["Stack Overflow duplicate intercept", "\"Avoid redundant regeneration\" IS the duplicate-question problem", "Typed question → search existing stories first; story = accepted answer."]] },
  "stories:trend": { name: "Stories · Living Trend", model: "The outcome as a living annotated trend (stock-tracker pattern)",
    pros: ["Tap a \"key moment\" for \"what happened here?\".", "Compare-across-windows is first-class.", "Stories that explain each move are crawled in alongside."],
    cons: ["Parked behind Home.", "Forces a time axis — weak for non-temporal cuts."],
    refs: [["Koyfin · Bloomberg · AlphaSense", "The chart is the index into the narrative", "Key moments expand to a Mira mini-analysis; related stories attach."]] },
  "stories:published": { name: "Stories · Published Story", model: "A story as a published object (Perplexity Pages / Hex app)",
    pros: ["Maps 1:1 to \"story = generated component\".", "Builder-vs-viewer split = default-public-view / opt-in-private-edit.", "Every section carries lineage; pins are live pointers with an \"as of\"."],
    cons: ["Parked behind Home.", "Export dead-end risk — needs the \"send to deck\" exit (stubbed)."],
    refs: [["Perplexity Pages · Hex data apps", "Analysis is the source; the story is the published build", "One promotion from analysis → durable, citation-bearing story."]] },
  "stories:scrolly": { name: "Stories · Scrolly Story", model: "A story as a guided scrollytelling narrative",
    pros: ["One insight per step — highest comprehension for the no-SQL exec.", "Sticky chart; scrolling moves the \"key moment\".", "Ends on a recommended action."],
    cons: ["Parked behind Home.", "Linear — poor for jumping straight to a metric."],
    refs: [["Flourish · Tableau Story Points", "Non-technical execs lose dense dashboards; build up one step at a time", "Stepped reveals over a sticky annotated trend, ending in an action."]] },

  "archive:briefing": { name: "Archive · Briefing", model: "Arrive to be briefed (newspaper / Amazon-memo)",
    pros: ["Insight on screen before any input.", "Narrative brief pre-ranks what matters."],
    cons: ["Parked.", "Collaboration is a sidebar."],
    refs: [["Tableau Pulse + Amazon six-pager", "Briefing-over-dashboard pre-ranks what matters", "Lead with authored prose, not a TTS of numbers."]] },
  "archive:room": { name: "Archive · Room", model: "A furnished space you inhabit (Notion / Coda)",
    pros: ["Collaboration is the spine.", "Blocks map to the four things."],
    cons: ["Parked.", "Briefing shares the stage."],
    refs: [["Notion AI Home / Coda", "A space is a living doc of blocks", "KPIs, player, explorations as blocks; members comment."]] },
  "archive:player": { name: "Archive · Player", model: "Your outcome has a podcast (Spotify / NotebookLM)",
    pros: ["Audio brief is the hero.", "Episode feed makes it a serial."],
    cons: ["Parked.", "Over-indexes on audio for the desk."],
    refs: [["NotebookLM Audio Overview", "Two-voice format is the engagement engine", "One-click play; transcript keeps it usable muted."]] },
  "archive:combined": { name: "Archive · Combined Explorer", model: "Accordion; metric cards expand in place (workspace v1)",
    pros: ["Metric + detail are one unit.", "Bottom chat frees the full width."],
    cons: ["Parked.", "One metric open at a time."],
    refs: [["Combine metrics + details", "Browsing and drilling shouldn't split panes", "Cards expand inline."]] },
  "archive:canvas": { name: "Archive · Full-Canvas", model: "Two-pane card rail + detail (workspace v1)",
    pros: ["Detail always beside the list.", "Full width for data."],
    cons: ["Parked.", "Separate cards, no unified surface."],
    refs: [["Full width + bottom chat", "Maximise data, chat on demand", "Card rail + detail own 100% width."]] },
  "archive:threepane": { name: "Archive · Three-Pane Pro", model: "Cards · detail · context rail (workspace v1)",
    pros: ["Collaborators + quota + shared chats visible.", "All-at-once power surface."],
    cons: ["Parked.", "Densest layout."],
    refs: [["Exec collaboration + quota", "Context belongs next to the metric", "Right rail carries collaborators + shared chats."]] },
  "archive:dashboard": { name: "Archive · Dashboard → Focus", model: "Overview grid ⇄ focus (workspace v1)",
    pros: ["Every metric at a glance.", "Focus view is distraction-free."],
    cons: ["Parked.", "Extra click to detail."],
    refs: [["Overview-first navigation", "Scan all before drilling", "Card grid opens a focused detail."]] },
  "archive:rail": { name: "Archive · Connected Rail", model: "One unified card; selected metric connects into the detail (workspace v2)",
    pros: ["Metric list + detail share one white card.", "Selection by background play: gray → hover → connected white."],
    cons: ["Parked.", "No authored-story front."],
    refs: [["macOS/iOS source-list + Gmail settings", "Selected row should merge into its detail", "Selected item's white bleeds across the seam."]] },
  "archive:tabs": { name: "Archive · Connected Tabs", model: "Unified card; horizontal metric strip connects down (workspace v2)",
    pros: ["Wider, full-width detail beneath the strip.", "Selected tab connects down into the detail."],
    cons: ["Parked.", "Less vertical metric overview."],
    refs: [["Connected tab → panel", "An active tab should join its panel seamlessly", "Selected tab's white merges into the detail below."]] },
  "archive:assistant": { name: "Archive · Assistant-Forward", model: "Connected card + Mira as a co-equal column (workspace v2)",
    pros: ["Mira open by default; \"ask anything\" felt immediately.", "Metric rail collapses to widen the detail."],
    cons: ["Parked.", "Chat-forward, not story-forward."],
    refs: [["Copilot / Cursor side panel", "The assistant should be a real column", "Mira opens co-equal by default."]] },
};

export default function MiraSpaceShell({
  conversation, pendingTurnId, queriesUsed, queriesTotal, onSubmit, onReset,
  setupContextOpen, onToggleSetupContext,
}) {
  const [sel, setSel] = React.useState({ versionId: "home", iterationId: "cat3" });
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
  if (sel.versionId === "home") {
    // The ChatGPT-5-style home; iteration id selects the metric-band variant.
    body = <MiraHome variant={sel.iterationId} {...chatProps} />;
  } else if (isArchive && ARCHIVE_CONCEPTS.has(sel.iterationId)) {
    // Concept archive (Briefing/Room/Player) uses the collapsible right chat.
    const Direction = ARCHIVE[sel.iterationId] || ARCHIVE.briefing;
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
    // Parked workspaces (Archive) and all Stories directions are full-bleed.
    const Direction = isArchive ? (ARCHIVE[sel.iterationId] || ARCHIVE.combined) : (STORIES_DIRS[sel.iterationId] || STORIES_DIRS.board);
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
          setSel({ versionId, iterationId: iterationId ?? DEFAULT_ITER[versionId] ?? "cat3" })
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
  const r = RATIONALE[`${sel.versionId}:${sel.iterationId}`] || RATIONALE["home:cat3"];
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
