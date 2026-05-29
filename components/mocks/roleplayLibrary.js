// Roleplay Library mock — single source for the Drill landing page tabs
// (Active / In Calibration / Draft / Archived). Numbers match the Figma
// "Roleplay - Team Lead" review counts: 20 + 5 + 2 + 2 = 29 personas.
//
// Status values:
//   "active"     — Published, visible to agents, drives runtime sessions
//   "calibration"— Private trial owned by the author (Publish Guide
//                  "calibration" mode lands here)
//   "draft"      — Authoring in progress; not yet generated
//   "archived"   — Removed from the active library; restorable
//
// Mood = emoji on the card thumbnail. Author = persona owner. Tag = the
// driver/category chip rendered at the bottom of each card.

function persona(id, title, author, description, mood, tag, status) {
  return { id, title, author, description, mood, tag, status };
}

export const ROLEPLAY_LIBRARY = [
  // ---- Active (20) -------------------------------------------------------
  persona("rp-001", "Cancel Mobile Plan Data", "Chris Evans",
    "A long-time Orange client is ready to change their address and acquire several Apple items. They are straightforward and expect speedy service.",
    "🙂", "{Driver Name}", "active"),
  persona("rp-002", "Product Lost and Damaged", "Omar Patel",
    "An established Orange customer wants to update their address and buy multiple Apple products. They are decisive and anticipate quick assistance.",
    "🙂", "Delivery Delay", "active"),
  persona("rp-003", "Service Restoration", "Anika Gomez",
    "A dedicated Orange customer is set to update their address and purchase various Apple products. They are clear about their needs and look for fast resolution.",
    "🙂", "Offer", "active"),
  persona("rp-004", "Plan Upgrade Request", "Robert DJ",
    "A loyal Orange customer is looking to change their address and purchase several Apple devices. They value efficiency and expect prompt service.",
    "🙂", "Renewal", "active"),
  persona("rp-005", "Billing Information Change Request", "Zane Wang",
    "Long-time Orange customer, ready to update address and buy multiple Apple devices. They value efficient service and expect a fast resolution.",
    "🙂", "Billing", "active"),
  persona("rp-006", "Lapsed Member Winback", "María González",
    "Former socio cancelled six months ago; open to returning if the contribution amount can be revisited.",
    "🙂", "Retention", "active"),
  persona("rp-007", "Contribution Upgrade", "Pedro Sánchez",
    "Annual socio considering a switch to monthly with a 10% increase. Wants clarity on impact and tax receipts.",
    "🙂", "Upsell", "active"),
  persona("rp-008", "IBAN Change Walkthrough", "Lucía Fernández",
    "Member switched banks; needs SEPA mandate updated mid-cycle without disrupting their annual donation.",
    "🙂", "Account", "active"),
  persona("rp-009", "Tax Certificate Issuance", "Ahmed Khan",
    "Spanish member requesting last year's certificado de donación for IRPF deduction; first time filing.",
    "🙂", "Tax", "active"),
  persona("rp-010", "Welcome Onboarding — Month 1", "Priya Rao",
    "Newly enrolled socio receiving the first welcome touchpoint; gauge expectations and surface program detail.",
    "🙂", "Onboarding", "active"),
  persona("rp-011", "Cancellation Save — Tier 1", "Liam O'Connor",
    "Inbound socio actively requesting to cancel due to budget. Standard concession script.",
    "🙂", "Save", "active"),
  persona("rp-012", "Cancellation Save — Tier 2", "Sofía Romero",
    "Repeat saver, prior concession used. Escalation path required before final cancellation.",
    "🙂", "Save", "active"),
  persona("rp-013", "Program & Impact Inquiry", "Daniel Tan",
    "Curious socio asking about NGO partner outcomes and where their contribution is allocated.",
    "🙂", "Program", "active"),
  persona("rp-014", "Card Replacement Request", "Helena Müller",
    "Member card lost; needs replacement plus address verification.",
    "🙂", "Admin", "active"),
  persona("rp-015", "Communication Preferences Update", "Ravi Mehta",
    "Member opting out of email but keeping SMS. Walk through preference center options.",
    "🙂", "Preferences", "active"),
  persona("rp-016", "Frequency Change — Monthly to Annual", "Yuki Nakamura",
    "Cost-aware member considering an annual lump sum for the discount. Walk through implications.",
    "🙂", "Billing", "active"),
  persona("rp-017", "GDPR Data Access Request", "Camille Dubois",
    "Member exercising GDPR right of access. Confirm identity and route to data team.",
    "🙂", "Privacy", "active"),
  persona("rp-018", "Welcome Onboarding — Month 3", "Tomás Ruiz",
    "Three-month socio checkin; surface impact stories and gather satisfaction feedback.",
    "🙂", "Onboarding", "active"),
  persona("rp-019", "Address Update — Outside Spain", "Nora Hassan",
    "Member relocating internationally; clarify mandate continuity and tax treatment.",
    "🙂", "Account", "active"),
  persona("rp-020", "Emergency Campaign Pitch", "Eva Andersson",
    "Cold lead from emergency campaign list; pitch urgency without breaking warmth.",
    "🙂", "Acquisition", "active"),

  // ---- In Calibration (5) ------------------------------------------------
  persona("rp-021", "Service Restoration v2", "Anika Gomez",
    "Updated script with empathy-first opening. Private until calibration completes.",
    "🙂", "Offer", "calibration"),
  persona("rp-022", "Plan Upgrade — Premium Tier", "Robert DJ",
    "Calibration of upsell pitch for premium tier customers. Owner running internal trial.",
    "🙂", "Upsell", "calibration"),
  persona("rp-023", "Winback — Long Lapsed", "María González",
    "Targets socios lapsed 12+ months. Higher concession authorisation in script.",
    "🙂", "Retention", "calibration"),
  persona("rp-024", "Concession Path — Escalation", "Sofía Romero",
    "Calibration test of revised escalation tree for repeat savers.",
    "🙂", "Save", "calibration"),
  persona("rp-025", "Welcome Onboarding — SMS-first", "Priya Rao",
    "Calibration of SMS-only welcome cadence for members without email on file.",
    "🙂", "Onboarding", "calibration"),

  // ---- Draft (2) ---------------------------------------------------------
  persona("rp-026", "Cancel Mobile Plan Data", "Chris Evans",
    "A long-time Orange client is ready to change their address and acquire several Apple items. They are straightforward and expect speedy service.",
    "🙂", "{Driver Name}", "draft"),
  persona("rp-027", "Package Mishandling & Route Deviation",
    "", "", "🙂", "Billing", "draft"),

  // ---- Archived (2) ------------------------------------------------------
  persona("rp-028", "Cancel Mobile Plan Data", "Chris Evans",
    "A long-time Orange client is ready to change their address and acquire several Apple items. They are straightforward and expect speedy service.",
    "🙂", "{Driver Name}", "archived"),
  persona("rp-029", "Product Lost and Damaged", "Omar Patel",
    "An established Orange customer wants to update their address and buy multiple Apple products. They are decisive and anticipate quick assistance.",
    "🙂", "Delivery Delay", "archived"),
];

// Tab order + labels for the Library page. Counts are derived at render
// time from the mock above so any future edit stays in sync.
export const LIBRARY_TABS = [
  { id: "active",      label: "Active" },
  { id: "calibration", label: "In Calibration" },
  { id: "draft",       label: "Draft" },
  { id: "archived",    label: "Archived" },
];
