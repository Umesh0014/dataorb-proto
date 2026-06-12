"use client";

import React from "react";
import DarkPillSwitcher from "./DarkPillSwitcher";
import AIRecruiterBoard from "./AIRecruiterBoard";
import AIRecruiterTable from "./AIRecruiterTable";
import AIRecruiterFunnel from "./AIRecruiterFunnel";
import { CANDIDATES, STAGE_META } from "./mocks/recruiter";

// AIRecruiterShell — AI Recruiter (AI Interviewer) product landing entry
// point: the hiring manager's candidate pipeline. Hosts the demo-only
// candidate state, the shared stage-advance handler, and the floating A/B/C
// switcher that flips between three structural directions for the pipeline:
//   A · Board  — candidate stage columns (direction R1)
//   B · Table  — candidate table + detail sidecar (direction R2)
//   C · Funnel — stage funnel + ROI rail + community (direction R3)
//
// Candidate + stage state is in-memory only (no browser storage — G5),
// mirroring the MissionsLandingShell / page.jsx tasks pattern: advancing a
// candidate (e.g. "Push to Interview") moves them through the pipeline in
// place, and the whole switcher is deletable in one commit once a direction
// is chosen. See docs/tickets/ai-recruiter/directions.md for the cut.

const VARIANTS = ["A", "B", "C"];

export default function AIRecruiterShell({ pageName }) {
  const [variant, setVariant] = React.useState("A");
  const [candidates, setCandidates] = React.useState(CANDIDATES);

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

  // Opening a candidate record is a net-new downstream flow that is out of
  // scope for this exploration — logged, not wired, so the landing stays
  // interactive without inventing the full candidate-record screen.
  const onOpenCandidate = (id) => console.log("AI Recruiter — open candidate record", id);

  const View =
    variant === "B" ? AIRecruiterTable
    : variant === "C" ? AIRecruiterFunnel
    : AIRecruiterBoard;

  return (
    <>
      <View
        candidates={candidates}
        onAdvance={advance}
        onOpenCandidate={onOpenCandidate}
      />
      <div style={clusterStyle}>
        <span style={captionStyle}>Variant</span>
        <DarkPillSwitcher
          ariaLabel="AI Recruiter layout variant switcher"
          value={variant}
          options={VARIANTS}
          onChange={setVariant}
        />
      </div>
    </>
  );
}

// Floating bottom-right cluster — same spatial idea as the Missions switcher:
// out of the content flow, above page chrome, never overlapping the side rail.
const clusterStyle = {
  position: "fixed",
  right: 24,
  bottom: 24,
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  gap: 10,
};
const captionStyle = {
  fontFamily: "var(--font-mono)",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--color-text-tertiary)",
  background: "var(--surface-white)",
  padding: "4px 8px",
  borderRadius: 6,
  boxShadow: "var(--shadow-card)",
};
