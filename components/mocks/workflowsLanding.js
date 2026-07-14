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
// Driver-detail workflows table ("03 · Driver detail — workflows table").
// Row 1's name intentionally overflows its column — Figma shows it
// ellipsized; the full string is invented past the visible "…the direct".
export const WORKFLOW_TABLE_ROWS = [
  { id: "GW-12BC", name: "Review customer request to update the direct debit", roleplays: 2, status: "draft" },
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
