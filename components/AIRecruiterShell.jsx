"use client";

import React from "react";
import DarkPillSwitcher from "./DarkPillSwitcher";
import AIRecruiterLibrary from "./AIRecruiterLibrary";
import AIRecruiterTable from "./AIRecruiterTable";
import AIRecruiterPipeline from "./AIRecruiterPipeline";

// AIRecruiterShell — AI Recruiter (AI Interviewer) landing entry point.
// Hosts the demo-only variant state and the floating A/B/C switcher that
// flips between three structural directions for the interview-plan library:
//   A · Library  — editorial card grid (direction D1)
//   B · Table    — operational table + sidecar (direction D2)
//   C · Pipeline — plan list + aggregate coverage rail (direction D3)
//
// Variant state is in-memory only (no browser storage), mirroring the
// MissionsLandingShell pattern — the page resets to "A" when the session
// ends, and the whole switcher is deletable in one commit once a direction
// is chosen. See docs/tickets/ai-recruiter/directions.md for the cut.

const VARIANTS = ["A", "B", "C"];

export default function AIRecruiterShell({ pageName }) {
  const [variant, setVariant] = React.useState("A");

  React.useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const previous = document.title;
    document.title = pageName || "AI Recruiter";
    return () => { document.title = previous; };
  }, [pageName]);

  // Opening a plan record and creating a plan are net-new flows that are
  // out of scope for this exploration — logged, not wired, so the landing
  // stays interactive without inventing downstream screens.
  const onOpenPlan = (id) => console.log("AI Recruiter — open plan", id);
  const onCreatePlan = () => console.log("AI Recruiter — create interview plan");

  const View =
    variant === "B" ? AIRecruiterTable
    : variant === "C" ? AIRecruiterPipeline
    : AIRecruiterLibrary;

  return (
    <>
      <View onOpenPlan={onOpenPlan} onCreatePlan={onCreatePlan} />
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

// Floating bottom-right cluster — same spatial idea as the Missions
// switcher: out of the content flow, above page chrome, never overlapping
// the side rail.
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
