// currentUser — minimal role-check shim. Real auth wires in here when
// the backend ships; for the prototype, return a fixed role so the
// role-gated UI (Upcoming sub-section on Missions Kanban per Part B
// revisions) is visible end-to-end.
//
// Roles in use:
//   "team_viewer"  — most-restricted member; sees own assignments only,
//                    Upcoming sub-section visible on Active swimlane
//   "team_lead"    — manages a team
//   "manager"      — multi-team rollup
//   "admin"        — tenant-wide
//
// Default = "team_viewer" so the Upcoming surface demos. Flip via
// localStorage `dataorb.role` for ad-hoc role-switching during review.

const DEFAULT_ROLE = "team_viewer";
const STORAGE_KEY = "dataorb.role";

export function getCurrentRole() {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
  } catch {
    // ignore — localStorage unavailable
  }
  return DEFAULT_ROLE;
}

export function isTeamViewer() {
  return getCurrentRole() === "team_viewer";
}
