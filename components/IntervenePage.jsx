"use client";

import React from "react";
import VersionBar from "./VersionBar";
import InterveneTriageQueue from "./InterveneTriageQueue";
import InterveneCommandDeck from "./InterveneCommandDeck";
import IntervenePipelineBoard from "./IntervenePipelineBoard";
import InterveneCampaignWizard from "./InterveneCampaignWizard";
import { CAMPAIGNS, RUNS, RECRUITS } from "./mocks/intervene";

/**
 * IntervenePage — customer-side proactive outreach command center.
 * Hosts three structurally distinct direction prototypes behind the
 * VersionBar; review state (shortlist/dismiss/export) is shared so
 * switching directions keeps the reviewer's progress.
 *
 * @param {{ pageName: string }} props
 */
export default function IntervenePage({ pageName }) {
  const [versionId, setVersionId] = React.useState("v1");
  // Status overrides on top of the mock data's seeded statuses.
  const [statuses, setStatuses] = React.useState({});
  const [wizardOpen, setWizardOpen] = React.useState(false);

  const recruits = React.useMemo(
    () =>
      RECRUITS.map((r) =>
        statuses[r.id] ? { ...r, status: statuses[r.id] } : r,
      ),
    [statuses],
  );

  const setStatus = (id, status) =>
    setStatuses((m) => ({ ...m, [id]: status }));

  const exportRecruits = (ids) =>
    setStatuses((m) => {
      const next = { ...m };
      ids.forEach((id) => {
        next[id] = "exported";
      });
      return next;
    });

  const shared = {
    pageName,
    campaigns: CAMPAIGNS,
    runs: RUNS,
    recruits,
    onSetStatus: setStatus,
    onExport: exportRecruits,
    onCreateCampaign: () => setWizardOpen(true),
  };

  let content;
  if (versionId === "v2") content = <InterveneCommandDeck {...shared} />;
  else if (versionId === "v3") content = <IntervenePipelineBoard {...shared} />;
  else content = <InterveneTriageQueue {...shared} />;

  return (
    <div style={ivStyles.host}>
      {wizardOpen ? (
        <InterveneCampaignWizard onClose={() => setWizardOpen(false)} />
      ) : (
        content
      )}
      <VersionBar
        tabsMode
        versions={VERSIONS}
        value={{ versionId }}
        onChange={({ versionId: next }) => setVersionId(next)}
        help={<DirectionHelp versionId={versionId} />}
      />
    </div>
  );
}

const VERSIONS = [
  { id: "v1", label: "Triage Queue", iterations: [] },
  { id: "v2", label: "Command Deck", iterations: [] },
  { id: "v3", label: "Pipeline Board", iterations: [] },
];

// "?" popover — pros/cons first, then the reference → insight chain
// each direction was built from.
const DIRECTION_NOTES = {
  v1: {
    title: "v1 · Triage Queue",
    pros: [
      "Highest review throughput — keyboard-first, item by item",
      "Sidecar keeps full context without leaving the list",
      "Run-as-dated-work-queue matches the audit boundary",
    ],
    cons: [
      "Per-item pace can feel slow on large runs",
      "Less orientation before diving in",
    ],
    insight:
      "Linear Triage + PatternFly primary-detail: a pre-processing zone where items arrive and get judged one at a time; the sidecar locks open and follows the selection. Batch-queue mental model (Gainsight/ChurnZero research) fits the 7-day run cycle.",
  },
  v2: {
    title: "v2 · Command Deck",
    pros: [
      "Orientation first — counts and pending work before detail",
      "AI-recommended shortlist: accept-with-modifications is fast",
      "Bulk actions suit 50+ candidate runs",
    ],
    cons: [
      "Weaker per-item scrutiny — risks rubber-stamping",
      "Recommendation trust must be earned before this shines",
    ],
    insight:
      "Outreach.io cohort-activation + Vitally command center: the system proposes a cohort, the human approves with edits. Apollo's score transparency (top contributing signals shown inline) keeps the human genuinely in the loop.",
  },
  v3: {
    title: "v3 · Pipeline Board",
    pros: [
      "Review state is spatial — recruited → shortlisted → exported at a glance",
      "Answers the ticket's open kanban-vs-split question concretely",
      "Export bucket doubles as the no-duplicate-export tracker",
    ],
    cons: [
      "Card density limits visible signal detail",
      "Drag/move is slower than keyboard triage for volume",
    ],
    insight:
      "Dynamics 365 kanban + CSVBox batch states: lanes as state machine, counts as headers. The exported column carries batch + item-level state so re-export vs already-sent stays visible.",
  },
};

function DirectionHelp({ versionId }) {
  const note = DIRECTION_NOTES[versionId] || DIRECTION_NOTES.v1;
  const [tab, setTab] = React.useState("summary");
  return (
    <div>
      <span style={ivStyles.helpTitle}>{note.title}</span>
      <div style={ivStyles.helpTabs}>
        <HelpTab on={tab === "summary"} onClick={() => setTab("summary")}>
          Pros / cons
        </HelpTab>
        <HelpTab on={tab === "detail"} onClick={() => setTab("detail")}>
          More detail
        </HelpTab>
      </div>
      {tab === "summary" ? (
        <div>
          <p style={ivStyles.helpLabel}>Pros</p>
          <ul style={ivStyles.helpList}>
            {note.pros.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p style={ivStyles.helpLabel}>Cons</p>
          <ul style={ivStyles.helpList}>
            {note.cons.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p style={ivStyles.helpText}>{note.insight}</p>
      )}
    </div>
  );
}

function HelpTab({ on, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...ivStyles.helpTab,
        color: on ? "var(--vb-accent, #F4D63E)" : "inherit",
        fontWeight: on ? 700 : 500,
      }}
    >
      {children}
    </button>
  );
}

const ivStyles = {
  host: { width: "100%" },
  helpTitle: {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
  },
  helpTabs: {
    display: "flex",
    gap: 4,
    marginBottom: 8,
  },
  helpTab: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 11,
    padding: "2px 6px",
    borderRadius: 6,
  },
  helpLabel: {
    margin: "6px 0 2px",
    fontSize: 11,
    fontWeight: 700,
    opacity: 0.7,
  },
  helpList: {
    margin: 0,
    paddingLeft: 16,
    fontSize: 12,
    lineHeight: 1.5,
    opacity: 0.85,
  },
  helpText: {
    margin: 0,
    fontSize: 12,
    lineHeight: 1.5,
    opacity: 0.85,
  },
};
