// Seed data for the "Workflows landing — driver grid" direction
// (WorkflowsLandingPage). Mirrors the Figma frame content exactly,
// including the two invisible placeholder grid cells (row 2, cols 2–3)
// the design leaves blank — reserved space, not additional cards.

export const WORKFLOW_METRIC_CARDS = [
  {
    id: "billing",
    icon: "receipt_long",
    tile: "emerald",
    title: "Billing and payments",
    chips: [{ label: "Service", tone: "neutral" }, { label: "Complaint", tone: "neutral" }],
    workflow: { active: 3, draft: 1 },
    replays: { active: 3 },
  },
  {
    id: "cancellation",
    icon: "warning_amber",
    tile: "rose",
    title: "Cancellation & retention",
    chips: [{ label: "Retention", tone: "neutral" }],
    workflow: { active: 3, draft: 1 },
    replays: { active: 3 },
  },
  {
    id: "meter",
    icon: "electric_meter",
    tile: "fuchsia",
    title: "Meter service",
    chips: [{ label: "Service", tone: "neutral" }, { label: "Complaint", tone: "neutral" }],
    workflow: { active: 3, draft: 1 },
    replays: { active: 3 },
  },
  {
    id: "energy",
    icon: "electric_bolt",
    tile: "yellow",
    title: "Energy service",
    chips: [{ label: "Sales", tone: "neutral" }, { label: "Complaint", tone: "neutral" }],
    workflow: { active: 3, draft: 1 },
    replays: { active: 3 },
  },
  // Figma leaves row 2 / cols 2–3 as invisible (opacity: 0) placeholder
  // cards — reserves the grid's second row height without showing
  // duplicate content. Rendered as blank spacer cells, not real cards.
  { id: "spacer-1", spacer: true },
  { id: "spacer-2", spacer: true },
];

// Category chip background varies per row in the source file (gray-50 vs
// gray-100) — kept row-accurate rather than normalized to one shade.
// Driver-detail workflows table ("03 · Driver detail — workflows table",
// reconciled against "04 · Create workflow — source dropdown" which shows
// the same table unclipped — row 1's name was previously invented past a
// truncation in 03; 04 has the full string, used here). `isNew` mirrors
// the inline "New" pill Figma shows only on the generating row.
//
// Row 1 is GW-12BC's own lifecycle, not two separate rows: "08 · Driver
// detail — workflow generating row" and "09 · ... — generated draft row"
// are the SAME row (same id) before/after generation completes — "Home
// WiFi dropping out…" / Generating flips to "New workflow - review to
// confirm" / Draft + the New pill. WorkflowDriverDetailPage runs that
// transition on a timer; this seed only needs the starting state.
export const WORKFLOW_TABLE_ROWS = [
  { id: "GW-12BC", name: "Home WiFi dropping out — connectivity triage", roleplays: 2, status: "generating", isNew: true },
  { id: "GW-13BC", name: "Set up a payment plan", roleplays: 2, status: "active" },
  { id: "GW-14BC", name: "Update direct-debit bank account", roleplays: 2, status: "active" },
  { id: "GW-15BC", name: "Update direct-debit bank account", roleplays: 2, status: "active" },
  { id: "GW-16BC", name: "Dispute an unexpected charge", roleplays: 2, status: "active" },
  { id: "GW-17BC", name: "Refund a duplicate payment", roleplays: 2, status: "archived" },
];

export const WORKFLOW_DRIVER_ROWS = [
  {
    id: "technical-support",
    icon: "headset_mic",
    name: "Technical support",
    categories: [{ label: "Service", shade: "50" }, { label: "Complaint", shade: "50" }],
    coverage: "Needs coverage",
    // Pending PM decision (Figma annotation): driver-card kebab actions
    // aren't defined yet. No trailing action for this row.
    trailing: "none",
  },
  {
    id: "commercial-sales",
    icon: "sell",
    name: "Commercial & sales",
    categories: [{ label: "Sales", shade: "100" }],
    coverage: "Needs coverage",
    trailing: "chevron",
  },
  {
    id: "move-home",
    icon: "home",
    name: "Move home",
    categories: [{ label: "Service", shade: "50" }],
    coverage: "Needs coverage",
    // Figma shows a literal "--" placeholder here (no tracking value yet).
    trailing: "dash",
  },
  {
    id: "complaints-handling",
    icon: "chat_bubble_outline",
    name: "Complaints handling",
    categories: [{ label: "Complaint", shade: "50" }],
    coverage: "Needs coverage",
    trailing: "dash",
  },
  {
    id: "account-access",
    icon: "person",
    name: "Account access",
    categories: [{ label: "Service", shade: "50" }],
    coverage: "Needs coverage",
    trailing: "none",
  },
];

// "05 · Interaction picker — filters (sales)" — the customer-interaction
// list the "+Workflow" create menu's first option opens. fcr/salesWon/
// retained render a check when true, a dash otherwise — the source frame
// only shows a checked or dashed state (no distinct "false" glyph), so
// these stay boolean rather than inventing a third visual. csat is a 0–5
// dot rating.
export const WORKFLOW_INTERACTIONS = [
  { id: "000028", agentInitials: "AT", fcr: true, salesWon: true, retained: false, csat: 3, quality: 68, duration: "1h 1m 45s", date: "Dec 4, 2025" },
  { id: "000031", agentInitials: "MK", fcr: true, salesWon: true, retained: true, csat: 4, quality: 74, duration: "42m 18s", date: "Dec 4, 2025" },
  { id: "000033", agentInitials: "JR", fcr: false, salesWon: true, retained: true, csat: 5, quality: 91, duration: "18m 52s", date: "Dec 3, 2025" },
  { id: "000037", agentInitials: "AT", fcr: true, salesWon: false, retained: false, csat: 2, quality: 55, duration: "1h 14m 03s", date: "Dec 3, 2025" },
  { id: "000041", agentInitials: "SN", fcr: true, salesWon: true, retained: true, csat: 4, quality: 80, duration: "27m 40s", date: "Dec 2, 2025" },
  { id: "000045", agentInitials: "MK", fcr: false, salesWon: false, retained: false, csat: 3, quality: 62, duration: "51m 11s", date: "Dec 2, 2025" },
  { id: "000049", agentInitials: "JR", fcr: true, salesWon: true, retained: true, csat: 5, quality: 88, duration: "22m 37s", date: "Dec 1, 2025" },
  { id: "000052", agentInitials: "SN", fcr: true, salesWon: true, retained: false, csat: 4, quality: 77, duration: "35m 09s", date: "Dec 1, 2025" },
];
