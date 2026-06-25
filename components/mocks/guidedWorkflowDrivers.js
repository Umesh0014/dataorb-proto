// guidedWorkflowDrivers — mock data for the TEAM-LEAD *browse* surface of
// Guided Workflows: the contact-driver landing, the per-driver workflow
// list, the contact-reason sub-view, and the create-workflow modal.
//
// This is a DIFFERENT surface from the authoring/editor library in
// `guidedWorkflows.js` (broadband-telco flagship). That file owns the
// step-level authoring experience reached via Drill; this one owns the
// navigation hierarchy locked on Jun 25:
//
//   Tenant → Contact Driver → Contact Reason → Guided Workflow
//
// Domain here is utility/energy (Billing & Payments, Meter Services, Supply
// & Grid …) to match the reference screenshots. All mock; in-memory only.
// Akash owns the real interaction/agent source — flagged out-of-scope.

// Driver avatar monogram tones — drawn from the existing Settings tile
// palette tokens (no new colors). Paired bg + fg, label always with the
// initials so color never carries meaning alone.
const AVATAR_TONES = {
  blue:     { bg: "var(--tile-blue-bg)",     fg: "var(--tile-blue-fg)" },
  emerald:  { bg: "var(--tile-emerald-bg)",  fg: "var(--tile-emerald-fg)" },
  violet:   { bg: "var(--tile-violet-bg)",   fg: "var(--tile-violet-fg)" },
  rose:     { bg: "var(--tile-rose-bg)",     fg: "var(--tile-rose-fg)" },
  orange:   { bg: "var(--tile-orange-bg)",   fg: "var(--tile-orange-fg)" },
  cyan:     { bg: "var(--tile-cyan-bg)",     fg: "var(--tile-cyan-fg)" },
  green:    { bg: "var(--tile-green-bg)",    fg: "var(--tile-green-fg)" },
  fuchsia:  { bg: "var(--tile-fuchsia-bg)",  fg: "var(--tile-fuchsia-fg)" },
};

export function gwAvatarTone(tone) {
  return AVATAR_TONES[tone] || AVATAR_TONES.blue;
}

// ---- Category tags ------------------------------------------------------
// The five lanes a workflow can carry. Mapped to EXISTING semantic tokens
// only — no new color system. FLAG (Neil): final category→color mapping is
// his to confirm; this is a reasonable placeholder built from the existing
// success / error / info / warning / icon-tertiary token pairs.
const CATEGORY_META = {
  service:       { id: "service",       label: "Service",      bg: "var(--color-success-bg)", fg: "var(--color-success-text)" },
  complaint:     { id: "complaint",     label: "Complaint",    bg: "var(--color-error-bg)",   fg: "var(--color-error)" },
  "tech support":{ id: "tech support",  label: "Tech support", bg: "var(--color-info-bg)",    fg: "var(--color-info-text)" },
  retention:     { id: "retention",     label: "Retention",    bg: "var(--color-icon-tertiary-bg)", fg: "var(--color-icon-tertiary-fg)" },
  sales:         { id: "sales",         label: "Sales",        bg: "var(--color-warning-bg)", fg: "var(--color-warning-text)" },
};

export function gwCategoryMeta(id) {
  return CATEGORY_META[id] || CATEGORY_META.service;
}

// Distinct lanes, in display order — drives the "All lanes" filter on the
// driver-detail controls row.
export const GW_LANES = ["service", "complaint", "tech support", "retention", "sales"];

// ---- Workflow status ----------------------------------------------------
// Active (green) / Draft (amber) plus the "Unpublished changes" amber flag.
// Maps to StatusBadge tones; the green/amber dot is composed in the pill.
export function gwStatusMeta(status) {
  switch (status) {
    case "active":
      return { tone: "success", label: "Active", dot: "var(--color-success)" };
    default:
      return { tone: "warning", label: "Draft", dot: "var(--color-warning)" };
  }
}

// ---- Drivers ------------------------------------------------------------
export const GW_DRIVERS = [
  { id: "billing-payments",        name: "Billing & Payments",       initials: "BP", tone: "blue",    workflows: 4, active: 3, toReview: 1, roleplays: 4, tags: ["service", "complaint"] },
  { id: "cancellation-retention",  name: "Cancellation & Retention", initials: "CR", tone: "emerald", workflows: 2, active: 1, toReview: 1, roleplays: 3, tags: ["retention"] },
  { id: "meter-services",          name: "Meter Services",           initials: "MS", tone: "violet",  workflows: 3, active: 2, toReview: 1, roleplays: 3, tags: ["complaint", "tech support", "service"] },
  { id: "supply-grid",             name: "Supply & Grid",            initials: "SG", tone: "rose",    workflows: 2, active: 1, toReview: 1, roleplays: 4, tags: ["tech support", "complaint"] },
  { id: "energy-services",         name: "Energy Services",          initials: "ES", tone: "orange",  workflows: 2, active: 2, toReview: 0, roleplays: 3, tags: ["sales", "service"] },
  { id: "contract-management",     name: "Contract Management",      initials: "CM", tone: "cyan",    workflows: 1, active: 1, toReview: 0, roleplays: 1, tags: ["service"] },
  { id: "account-administration",  name: "Account Administration",   initials: "AA", tone: "green",   workflows: 2, active: 1, toReview: 1, roleplays: 1, tags: ["service"] },
  { id: "digital-channel-support", name: "Digital Channel Support",  initials: "DC", tone: "fuchsia", workflows: 1, active: 1, toReview: 0, roleplays: 2, tags: ["tech support"] },
  { id: "commercial-sales",        name: "Commercial & Sales",       initials: "CS", tone: "emerald", workflows: 1, active: 0, toReview: 1, roleplays: 0, tags: ["sales"] },
];

export function gwDriver(id) {
  return GW_DRIVERS.find((d) => d.id === id) || null;
}

// ---- Workflows (one per contact reason) ---------------------------------
// Keyed by driver id. `reasonId` ties each back to its contact reason.
// `unpublished: true` adds the amber "Unpublished changes" flag on an
// otherwise-active workflow. Audit metadata (edited + author) is first-class.
export const GW_WORKFLOWS = {
  "billing-payments": [
    { id: "GW-1B2C", reasonId: "bp-payment-plan",   title: "Set up a payment plan",            roleplays: 0, edited: "1 hour ago", author: "You",     category: "service",   status: "draft" },
    { id: "GW-7F3A", reasonId: "bp-direct-debit",   title: "Update direct-debit bank account", roleplays: 1, edited: "5 min ago",  author: "You",     category: "service",   status: "active", unpublished: true },
    { id: "GW-3K9A", reasonId: "bp-dispute-charge", title: "Dispute an unexpected charge",     roleplays: 2, edited: "2 days ago", author: "Maya R.", category: "complaint", status: "active" },
    { id: "GW-8H2N", reasonId: "bp-refund",         title: "Refund a duplicate payment",       roleplays: 1, edited: "4 days ago", author: "Tom B.",  category: "complaint", status: "active" },
  ],
  "cancellation-retention": [
    { id: "GW-5R1K", reasonId: "cr-save-offer", title: "Cancellation save — retention offer", roleplays: 2, edited: "3 hours ago", author: "Sara N.", category: "retention", status: "active" },
    { id: "GW-9R4M", reasonId: "cr-win-back",   title: "Win-back after disconnection",        roleplays: 1, edited: "1 day ago",   author: "You",     category: "retention", status: "draft" },
  ],
  "meter-services": [
    { id: "GW-2M8P", reasonId: "ms-smart-install", title: "Smart meter install booking", roleplays: 1, edited: "2 hours ago", author: "Omar H.", category: "tech support", status: "active" },
    { id: "GW-6M3T", reasonId: "ms-reading-dispute", title: "Meter reading dispute",     roleplays: 2, edited: "3 days ago",  author: "Maya R.", category: "complaint",    status: "active" },
    { id: "GW-4M7Q", reasonId: "ms-prepayment",     title: "Switch to smart prepayment", roleplays: 0, edited: "20 min ago", author: "You",     category: "service",      status: "draft" },
  ],
  "supply-grid": [
    { id: "GW-3S9L", reasonId: "sg-outage",  title: "Power outage reassurance & ETA", roleplays: 3, edited: "5 hours ago", author: "Omar H.", category: "tech support", status: "active" },
    { id: "GW-7S2H", reasonId: "sg-voltage", title: "Voltage complaint triage",       roleplays: 1, edited: "2 days ago",  author: "You",     category: "complaint",    status: "draft" },
  ],
  "energy-services": [
    { id: "GW-1E5N", reasonId: "es-efficiency", title: "Energy efficiency upsell",   roleplays: 2, edited: "6 hours ago", author: "Lena F.", category: "sales",   status: "active" },
    { id: "GW-8E2R", reasonId: "es-renewal",    title: "Tariff renewal & retention", roleplays: 1, edited: "4 days ago",  author: "Tom B.",  category: "service", status: "active", unpublished: true },
  ],
  "contract-management": [
    { id: "GW-2C7V", reasonId: "cm-renewal", title: "Business contract renewal", roleplays: 1, edited: "1 day ago", author: "Tom B.", category: "service", status: "active" },
  ],
  "account-administration": [
    { id: "GW-5A3D", reasonId: "aa-holder-details", title: "Update account holder details", roleplays: 1, edited: "7 hours ago", author: "Maya R.", category: "service", status: "active" },
    { id: "GW-9A6F", reasonId: "aa-bereavement",    title: "Close account on bereavement",  roleplays: 0, edited: "30 min ago", author: "You",     category: "service", status: "draft" },
  ],
  "digital-channel-support": [
    { id: "GW-4D8K", reasonId: "dc-login-reset", title: "App login & password reset", roleplays: 2, edited: "2 days ago", author: "Sara N.", category: "tech support", status: "active" },
  ],
  "commercial-sales": [
    { id: "GW-7K1S", reasonId: "cs-new-quote", title: "New connection quote", roleplays: 0, edited: "10 min ago", author: "You", category: "sales", status: "draft" },
  ],
};

export function gwWorkflows(driverId) {
  return GW_WORKFLOWS[driverId] || [];
}

// ---- Contact reasons ----------------------------------------------------
// Every reason under a driver. `workflowId: null` = no workflow yet → the
// reason surfaces a "Create workflow" CTA in the contact-reason sub-view.
export const GW_REASONS = {
  "billing-payments": [
    { id: "bp-payment-plan",   name: "Set up a payment plan",            workflowId: "GW-1B2C" },
    { id: "bp-direct-debit",   name: "Update direct-debit bank account", workflowId: "GW-7F3A" },
    { id: "bp-dispute-charge", name: "Dispute an unexpected charge",     workflowId: "GW-3K9A" },
    { id: "bp-refund",         name: "Refund a duplicate payment",       workflowId: "GW-8H2N" },
    { id: "bp-final-bill",     name: "Final bill after moving home",     workflowId: null },
    { id: "bp-card-declined",  name: "Payment failed / card declined",   workflowId: null },
    { id: "bp-paperless",      name: "Paperless billing & statements",   workflowId: null },
  ],
  "cancellation-retention": [
    { id: "cr-save-offer", name: "Cancellation save — retention offer", workflowId: "GW-5R1K" },
    { id: "cr-win-back",   name: "Win-back after disconnection",        workflowId: "GW-9R4M" },
    { id: "cr-switch-away", name: "Switching supplier away",            workflowId: null },
    { id: "cr-etf-waiver",  name: "Early-termination fee waiver",       workflowId: null },
  ],
  "meter-services": [
    { id: "ms-smart-install",  name: "Smart meter install booking", workflowId: "GW-2M8P" },
    { id: "ms-reading-dispute", name: "Meter reading dispute",      workflowId: "GW-6M3T" },
    { id: "ms-prepayment",     name: "Switch to smart prepayment",  workflowId: "GW-4M7Q" },
    { id: "ms-access-issue",   name: "Meter exchange access issue", workflowId: null },
    { id: "ms-ihd",            name: "In-home display not working", workflowId: null },
  ],
  "supply-grid": [
    { id: "sg-outage",   name: "Power outage reassurance & ETA", workflowId: "GW-3S9L" },
    { id: "sg-voltage",  name: "Voltage complaint triage",       workflowId: "GW-7S2H" },
    { id: "sg-new-conn", name: "New supply connection",          workflowId: null },
    { id: "sg-safety",   name: "Tree / cable safety report",     workflowId: null },
  ],
  "energy-services": [
    { id: "es-efficiency", name: "Energy efficiency upsell",   workflowId: "GW-1E5N" },
    { id: "es-renewal",    name: "Tariff renewal & retention", workflowId: "GW-8E2R" },
    { id: "es-solar",      name: "Solar export (SEG) setup",   workflowId: null },
    { id: "es-ev",         name: "EV tariff switch",           workflowId: null },
  ],
  "contract-management": [
    { id: "cm-renewal",    name: "Business contract renewal",  workflowId: "GW-2C7V" },
    { id: "cm-multi-site", name: "Multi-site contract change", workflowId: null },
    { id: "cm-end-notice", name: "Contract end notification",  workflowId: null },
  ],
  "account-administration": [
    { id: "aa-holder-details", name: "Update account holder details", workflowId: "GW-5A3D" },
    { id: "aa-bereavement",    name: "Close account on bereavement",  workflowId: "GW-9A6F" },
    { id: "aa-poa",            name: "Add a power of attorney",       workflowId: null },
    { id: "aa-marketing",      name: "Marketing preferences",         workflowId: null },
  ],
  "digital-channel-support": [
    { id: "dc-login-reset", name: "App login & password reset", workflowId: "GW-4D8K" },
    { id: "dc-chat-handoff", name: "Web chat handoff to voice", workflowId: null },
    { id: "dc-notifications", name: "Notifications not arriving", workflowId: null },
  ],
  "commercial-sales": [
    { id: "cs-new-quote", name: "New connection quote",  workflowId: "GW-7K1S" },
    { id: "cs-tender",    name: "Large-business tender",  workflowId: null },
    { id: "cs-ppa",       name: "Renewable PPA enquiry",  workflowId: null },
  ],
};

export function gwReasons(driverId) {
  return GW_REASONS[driverId] || [];
}

// ---- Agents (drives the create-modal agent filter) ----------------------
export const GW_AGENTS = [
  { id: "ag-maya", name: "Maya Rao",      short: "Maya R.", initials: "MR", tone: "blue" },
  { id: "ag-tom",  name: "Tom Becker",    short: "Tom B.",  initials: "TB", tone: "emerald" },
  { id: "ag-sara", name: "Sara Nguyen",   short: "Sara N.", initials: "SN", tone: "violet" },
  { id: "ag-omar", name: "Omar Haddad",   short: "Omar H.", initials: "OH", tone: "orange" },
  { id: "ag-lena", name: "Lena Fischer",  short: "Lena F.", initials: "LF", tone: "fuchsia" },
];

export function gwAgent(id) {
  return GW_AGENTS.find((a) => a.id === id) || null;
}

// ---- Source interactions (positive-outcome only) ------------------------
// Every interaction here landed the outcome — these are the only ones the
// create modal lists ("pick a call that already landed the outcome you want
// to standardise"). `lane` reuses the category vocabulary. FLAG (Akash):
// real source + the lane/outcome/competitor filters beyond agent are his.
export const GW_INTERACTIONS = [
  { id: "INT-4471", agentId: "ag-maya", customer: "R. Patel",   contactReason: "Dispute an unexpected charge",     lane: "complaint",     language: "en", snippet: "Talked the customer through the charge line by line and reversed it on the call." },
  { id: "INT-4490", agentId: "ag-maya", customer: "G. Owens",   contactReason: "Update direct-debit bank account", lane: "service",       language: "en", snippet: "Verified ID, switched the mandate, and confirmed the next collection date." },
  { id: "INT-4502", agentId: "ag-tom",  customer: "D. Cole",    contactReason: "Refund a duplicate payment",       lane: "complaint",     language: "en", snippet: "Spotted the double charge, raised the refund, and set the expectation cleanly." },
  { id: "INT-4518", agentId: "ag-tom",  customer: "N. Khan",    contactReason: "Set up a payment plan",            lane: "service",       language: "en", snippet: "Built an affordable plan and got agreement without escalating." },
  { id: "INT-4533", agentId: "ag-sara", customer: "L. Romero",  contactReason: "Cancellation save",                lane: "retention",     language: "es", snippet: "Surfaced the loyalty offer at the right moment and saved the account." },
  { id: "INT-4547", agentId: "ag-sara", customer: "M. Bianchi", contactReason: "Meter reading dispute",            lane: "complaint",     language: "en", snippet: "Walked the meter read back, corrected the bill, and de-escalated calmly." },
  { id: "INT-4560", agentId: "ag-omar", customer: "F. Haddad",  contactReason: "Smart meter install booking",      lane: "tech support",  language: "ar", snippet: "Booked the install and explained the in-home display setup end to end." },
  { id: "INT-4578", agentId: "ag-omar", customer: "P. Lund",    contactReason: "Power outage reassurance",         lane: "tech support",  language: "en", snippet: "Gave a firm restoration ETA and registered a text alert — no repeat call." },
  { id: "INT-4591", agentId: "ag-lena", customer: "S. Adeyemi", contactReason: "Energy efficiency upsell",         lane: "sales",         language: "en", snippet: "Matched the efficiency bundle to usage and closed the upsell." },
  { id: "INT-4604", agentId: "ag-lena", customer: "T. Sousa",   contactReason: "Tariff renewal",                   lane: "service",       language: "pt", snippet: "Renewed onto the best-fit tariff and confirmed the savings clearly." },
  { id: "INT-4612", agentId: "ag-maya", customer: "B. Stone",   contactReason: "Final bill after moving home",     lane: "service",       language: "en", snippet: "Closed the old account, opened the new supply, and aligned both bills." },
  { id: "INT-4625", agentId: "ag-tom",  customer: "K. Ortega",  contactReason: "Solar export setup",               lane: "sales",         language: "en", snippet: "Set up the SEG export account and confirmed first payment timing." },
];

export function gwInteractionsByAgent(agentId) {
  if (!agentId) return GW_INTERACTIONS;
  return GW_INTERACTIONS.filter((i) => i.agentId === agentId);
}

// ---- Languages (create-modal language picker) ---------------------------
// Representative BCP-47 subset; the real picker supports 80+.
export const GW_LANGUAGES = [
  { code: "en", label: "English",    native: "English" },
  { code: "es", label: "Spanish",    native: "Español" },
  { code: "pt", label: "Portuguese", native: "Português" },
  { code: "fr", label: "French",     native: "Français" },
  { code: "ar", label: "Arabic",     native: "العربية" },
  { code: "de", label: "German",     native: "Deutsch" },
];
