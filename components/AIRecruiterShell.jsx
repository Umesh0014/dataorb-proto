"use client";

import React from "react";
import VersionBar from "./VersionBar";
import AIRecruiterBoard from "./AIRecruiterBoard";
import AIRecruiterTable from "./AIRecruiterTable";
import CandidateRecordPage from "./CandidateRecordPage";
import AddCandidateModal from "./AddCandidateModal";
import { CANDIDATES, STAGE_META } from "./mocks/recruiter";

// AIRecruiterShell — AI Recruiter (AI Interviewer) product landing entry
// point: the hiring manager's candidate pipeline. Hosts the demo-only
// candidate state, the shared stage-advance handler, and the floating
// view switcher (VersionBar — the same meta-tooling Missions uses) that
// flips between the two surviving directions:
//   Board — candidate stage swimlanes (direction R1)
//   Table — candidate table + detail sidecar (direction R2)
// (Option C · Funnel was discarded per review.)
//
// Candidate + stage state is in-memory only (no browser storage — G5),
// mirroring the MissionsLandingShell / page.jsx tasks pattern: advancing a
// candidate ("Push to Interview") moves them through the pipeline in place,
// adding a candidate prepends to the list, and opening a record swaps in the
// full-page CandidateRecordPage. See docs/tickets/ai-recruiter/directions.md.

// View options rendered in the VersionBar's baseline dropdown. ids match the
// resolver below; the bar always shows the current view's label.
const VIEW_OPTIONS = [
  { id: "board", label: "Board" },
  { id: "table", label: "Table" },
];

export default function AIRecruiterShell({ pageName }) {
  const [view, setView] = React.useState("board");
  const [candidates, setCandidates] = React.useState(CANDIDATES);
  const [recordId, setRecordId] = React.useState(null);
  const [addOpen, setAddOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const previous = document.title;
    document.title = pageName || "AI Recruiter";
    return () => { document.title = previous; };
  }, [pageName]);

  // advance — the hiring manager's stage move (Start AI screening → Push to
  // Interview → Move to Offer → Mark Hired; Activate from the community). The
  // human owns every move; the AI only ever supplies coverage evidence (G4).
  const advance = React.useCallback((id) => {
    setCandidates((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const meta = STAGE_META[c.stage];
        if (!meta?.next) return c;
        return { ...c, stage: meta.next, lastActivity: `Moved to ${STAGE_META[meta.next].label}` };
      }),
    );
  }, []);

  // addCandidate — prepend a new applicant from the Add-candidate form. New
  // applicants land at "Applied" with their AI screening not yet started.
  const addCandidate = React.useCallback((draft) => {
    setCandidates((prev) => [draft, ...prev]);
    setAddOpen(false);
  }, []);

  const record = recordId ? candidates.find((c) => c.id === recordId) : null;

  // Full-page candidate record takes over the surface (no switcher), mirroring
  // how Learning Hub swaps in DrillDetailPage / AgentProfile over its landing.
  if (record) {
    return (
      <CandidateRecordPage
        candidate={record}
        onBack={() => setRecordId(null)}
        onAdvance={advance}
      />
    );
  }

  const View = view === "table" ? AIRecruiterTable : AIRecruiterBoard;

  return (
    <>
      <View
        candidates={candidates}
        onAdvance={advance}
        onOpenCandidate={(id) => setRecordId(id)}
        onAddCandidate={() => setAddOpen(true)}
      />
      <VersionBar
        versions={[]}
        baselineOptions={VIEW_OPTIONS}
        value={{ versionId: view, iterationId: null }}
        onChange={({ versionId }) => setView(versionId)}
      />
      <AddCandidateModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addCandidate}
      />
    </>
  );
}
