// Replay mock data — Learning Hub Replay module.
//
// One Replay "collection" orchestrates how many AI-built replays exist,
// how far back calls are sampled, refresh cadence, and the publish mode
// (auto vs human-in-loop). Each replay is a coached playback of one real
// call, broken into moments with a single coach commentary per moment.
//
// Locked structure (Jun 11 call): collections own everything (no
// top-level actions), the review action set is Edit / Approve only —
// never "reject" (archive instead), and audio is cost-deferred until a
// replay is approved or edited. Collections + replays carry a clear
// AI-maintained vs self-maintained signal and an AI disclaimer that an
// editor's credit replaces once a human touches the content.

// Outcome → avatar tint. The avatar colour is tied to the collection's
// outcome (not its driver) — an 8-swatch palette lifted from the Settings
// tile tokens so colours stay consistent with the rest of the app.
export const OUTCOME_TINTS = {
  retention: { bg: "var(--tile-emerald-bg)", fg: "var(--tile-emerald-fg)" },
  acquisition: { bg: "var(--tile-blue-bg)", fg: "var(--tile-blue-fg)" },
  resolution: { bg: "var(--tile-violet-bg)", fg: "var(--tile-violet-fg)" },
  compliance: { bg: "var(--tile-orange-bg)", fg: "var(--tile-orange-fg)" },
  upsell: { bg: "var(--tile-cyan-bg)", fg: "var(--tile-cyan-fg)" },
  csat: { bg: "var(--tile-rose-bg)", fg: "var(--tile-rose-fg)" },
  collections: { bg: "var(--tile-yellow-bg)", fg: "var(--tile-yellow-fg)" },
  onboarding: { bg: "var(--tile-fuchsia-bg)", fg: "var(--tile-fuchsia-fg)" },
};

export const OUTCOME_LABELS = {
  retention: "Retention",
  acquisition: "Acquisition",
  resolution: "First-call Resolution",
  compliance: "Compliance",
  upsell: "Upsell",
  csat: "CSAT",
  collections: "Collections",
  onboarding: "Onboarding",
};

// Author monogram → pastel tone (mirrors guides.js so monograms read the
// same across the app).
const PERSON_PALETTE = {
  emerald: { bg: "#ECFDF5", fg: "#10B981" },
  blue: { bg: "#EFF6FF", fg: "#3B82F6" },
  orange: { bg: "#FFF7ED", fg: "#F97316" },
  violet: { bg: "#F5F3FF", fg: "#8B5CF6" },
  lavender: { bg: "#EDE9FE", fg: "#6650A5" },
};
function person(name, initial, tone) {
  return { name, initial, ...PERSON_PALETTE[tone] };
}

export const REPLAY_STATES = ["active", "draft", "archived"];

// ---- Field option lists (Create flow) ---------------------------------

export const REPLAY_FIELD_MAX = { name: 60, description: 300, objective: 200 };

export const LANGUAGE_OPTIONS = [
  "English (US)", "English (UK)", "Spanish", "French", "German", "Portuguese",
];

// "Language" is the language of the replay OUTPUT, not a filter (Jun 11).
// Two modes: keep each call in its original language, or render the whole
// collection in one chosen language.
export const OUTPUT_LANGUAGE_MODES = [
  {
    id: "original",
    label: "Keep original conversation language",
    help: "Each replay plays back in the language the call happened in.",
  },
  {
    id: "unified",
    label: "Render all replays in one language",
    help: "Spanish / French / mixed source calls are unified into a single chosen language.",
  },
];

export const DRIVER_OPTIONS = [
  "Churn risk", "Billing dispute", "Plan change", "New activation",
  "Technical fault", "Complaint",
];
export const CALL_OUTCOME_OPTIONS = [
  "Saved", "Resolved", "Escalated", "Upsold", "Unresolved", "Callback booked",
];
export const BUSINESS_OUTCOME_OPTIONS = Object.values(OUTCOME_LABELS);
export const DOMAIN_OPTIONS = ["Consumer", "Business", "Enterprise", "Public sector"];
export const TARGET_AUDIENCE_OPTIONS = [
  "New hires (0–30 days)", "Tenured agents", "Retention specialists",
  "Tier-2 technical", "All agents",
];

export const ELIGIBILITY_WINDOW_OPTIONS = [
  "Last 7 days", "Last 30 days", "Last 90 days", "Last 6 months",
];
export const REFRESH_FREQUENCY_OPTIONS = ["Daily", "Weekly", "Fortnightly", "Monthly"];
export const MAX_REPLAY_OPTIONS = [5, 10, 15, 20, 30];

// Publish mode is mandatory (Jun 11). Auto = AI publishes directly;
// manual = replays arrive "suggested" and a human approves/edits first.
export const PUBLISH_MODES = [
  {
    id: "auto",
    label: "AI publishes directly",
    help: "New replays go live as soon as the AI builds them. The collection is AI-maintained.",
  },
  {
    id: "manual",
    label: "I review before publishing",
    help: "New replays arrive as suggestions. Audio is only generated once you approve or edit.",
  },
];

export const EMPTY_REPLAY_DRAFT = {
  name: "",
  language: "",
  outputLanguageMode: "original",
  description: "",
  objective: "",
  domain: "",
  driver: "",
  callOutcome: "",
  businessOutcome: "",
  targetAudience: "",
  // Step 2 — configuration
  eligibilityWindow: "Last 30 days",
  maxReplays: 10,
  refreshFrequency: "Weekly",
  publishMode: "",
};

// ---- Customer profile (player sidecar) --------------------------------

export const SAMPLE_CUSTOMER = {
  name: "Daniela Reyes",
  initial: "D",
  tenure: "4 yr customer",
  plan: "Unlimited Plus · 2 lines",
  arpu: "$94 / mo",
  sentiment: "Frustrated → Calm",
  context:
    "High-ARPU household on a competitor's switch offer. Called about a $40 overage she didn't expect; second billing surprise in three months.",
};

// ---- Moments (one coach commentary per moment) ------------------------

const SAMPLE_MOMENTS = [
  {
    id: "m1",
    label: "Opening & acknowledgement",
    timestamp: "00:12",
    customerLine:
      "This is the second month I've been overcharged. I'm honestly about ready to switch — your competitor quoted me half this.",
    agentLine:
      "I hear you, and I'm sorry — two surprises in a row isn't the experience you signed up for. Let me pull the bill up right now and walk through it with you.",
    coach: {
      scenario: "Customer opens with a switch threat and a concrete competing offer.",
      why: "Naming the frustration before touching the bill lowers the temperature. The agent doesn't defend the charge yet — acknowledgement first, facts second.",
    },
  },
  {
    id: "m2",
    label: "Diagnosing the overage",
    timestamp: "01:48",
    customerLine: "So what is the $40 even for? Nobody told me about any overage.",
    agentLine:
      "It's a data add-on that auto-applied when the line went over 50GB. That should have been flagged to you — it wasn't, and that's on us. I can reverse this month and set an alert so it never silently happens again.",
    coach: {
      scenario: "Customer asks a direct question about an unexplained charge.",
      why: "Owning the process gap ('that's on us') instead of explaining policy keeps trust. Pairing the reversal with a forward-looking fix (the alert) answers the unspoken 'will this keep happening?'.",
    },
  },
  {
    id: "m3",
    label: "Handling the competitor offer",
    timestamp: "03:30",
    customerLine: "Okay, but they're still cheaper. Give me one reason to stay.",
    agentLine:
      "Fair question. On their plan you'd lose the multi-line discount and the hotspot data you used 14GB of last month — so the real gap is about $9, not half. I'd rather earn it back than lose you over a billing miss.",
    coach: {
      scenario: "Customer reduces the decision to price.",
      why: "Reframing 'cheaper' into the true like-for-like gap reuses the customer's own usage data. It's specific, not a script — which is why it lands.",
    },
  },
  {
    id: "m4",
    label: "Securing the save",
    timestamp: "05:02",
    customerLine: "Alright. If you can sort the alert and the credit, I'll stay for now.",
    agentLine:
      "Done — credit's applied, you'll see it in 24 hours, and the usage alert is on at 45GB. I'll add a note so if you call back, whoever picks up has the full picture.",
    coach: {
      scenario: "Customer agrees conditionally.",
      why: "Closing the loop on every promise made and leaving a handoff note removes the next reason to churn. This is the moment that converts a save into a retained relationship.",
    },
    isLast: true,
  },
];

// ---- Replays ----------------------------------------------------------
// status: "published" (live) | "suggested" (human-in-loop, pending review)
//         | "generating" (audio being produced post-approval) | "archived"
// publishedBy: "ai" → AI-published (mirror icon); a person name → human.
// edited: once true, the AI disclaimer is replaced by the editor credit.

function replay(over) {
  return {
    durationSec: 312,
    moments: SAMPLE_MOMENTS,
    edited: false,
    editor: null,
    audioReady: true,
    ...over,
  };
}

const SAVE_THE_SWITCH_REPLAYS = [
  replay({
    id: "rp-save-1",
    title: "Reversing a silent overage on a switch threat",
    outcome: "retention",
    status: "published",
    publishedBy: "ai",
    publishedAt: "2026-06-10",
  }),
  replay({
    id: "rp-save-2",
    title: "Winning back a multi-line household on price",
    outcome: "retention",
    status: "published",
    publishedBy: "Ayushi",
    edited: true,
    editor: person("Ayushi", "A", "violet"),
    publishedAt: "2026-06-09",
  }),
  replay({
    id: "rp-save-3",
    title: "De-escalating a third billing surprise",
    outcome: "retention",
    status: "suggested",
    publishedBy: "ai",
    publishedAt: null,
    audioReady: false,
  }),
  replay({
    id: "rp-save-4",
    title: "Save attempt that lost the hotspot argument",
    outcome: "retention",
    status: "suggested",
    publishedBy: "ai",
    publishedAt: null,
    audioReady: false,
  }),
  replay({
    id: "rp-save-5",
    title: "Recovering after a dropped promise from a prior call",
    outcome: "retention",
    status: "generating",
    publishedBy: "Neil",
    edited: true,
    editor: person("Neil", "N", "blue"),
    publishedAt: "2026-06-11",
    audioReady: false,
  }),
];

// ---- Collections ------------------------------------------------------

export const REPLAY_COLLECTIONS = [
  {
    id: "col-save-the-switch",
    name: "Save the Switch",
    outcome: "retention",
    driver: "Churn risk",
    description:
      "How top retention agents turn a switch threat into a save — built from last quarter's highest-value saves.",
    maintainedBy: "ai",
    publishMode: "manual",
    state: "active",
    createdBy: person("María", "M", "emerald"),
    replayCount: 12,
    reviewCount: 3,
    lastUpdated: "2026-06-10",
    config: {
      eligibilityWindow: "Last 90 days",
      maxReplays: 15,
      refreshFrequency: "Weekly",
      outputLanguageMode: "original",
    },
    objective:
      "New hires can hear what a real save sounds like before their first retention shift.",
    replays: SAVE_THE_SWITCH_REPLAYS,
  },
  {
    id: "col-first-call-fix",
    name: "First-Call Fix",
    outcome: "resolution",
    driver: "Technical fault",
    description:
      "Closing technical faults in one call without an escalation — the patterns Tier-2 keeps asking us to bottle.",
    maintainedBy: "ai",
    publishMode: "auto",
    state: "active",
    createdBy: person("Akash", "A", "blue"),
    replayCount: 18,
    reviewCount: 0,
    lastUpdated: "2026-06-08",
    objective: "Cut needless escalations by showing what a clean first-call fix sounds like.",
    replays: [],
  },
  {
    id: "col-billing-empathy",
    name: "Billing Empathy",
    outcome: "csat",
    driver: "Billing dispute",
    description:
      "Acknowledge-first billing conversations that keep CSAT high even when the answer is no.",
    maintainedBy: "self",
    publishMode: "manual",
    state: "active",
    createdBy: person("Vidhi", "V", "orange"),
    replayCount: 9,
    reviewCount: 5,
    lastUpdated: "2026-06-07",
    objective: "Model the acknowledge-before-explain rhythm on hard billing calls.",
    replays: [],
  },
  {
    id: "col-upsell-without-pushing",
    name: "Upsell Without Pushing",
    outcome: "upsell",
    driver: "Plan change",
    description:
      "Reading genuine intent and offering the higher tier only when it actually fits the customer's usage.",
    maintainedBy: "ai",
    publishMode: "auto",
    state: "active",
    createdBy: person("Carlos", "C", "lavender"),
    replayCount: 7,
    reviewCount: 0,
    lastUpdated: "2026-06-03",
    objective: "Show usage-led upsell that customers thank you for.",
    replays: [],
  },
  {
    id: "col-activation-day-one",
    name: "Activation Day One",
    outcome: "onboarding",
    driver: "New activation",
    description:
      "First-14-days activation calls — setting expectations so the second call never happens.",
    maintainedBy: "self",
    publishMode: "manual",
    state: "draft",
    createdBy: person("Neil", "N", "blue"),
    replayCount: 0,
    reviewCount: 0,
    lastUpdated: "2026-06-11",
    objective: "Build the new-hire's first sense of a confident activation call.",
    replays: [],
  },
  {
    id: "col-incident-comms-q4",
    name: "Incident Comms — Q4 (Retired)",
    outcome: "compliance",
    driver: "Complaint",
    description:
      "Archived. Superseded by the unified Incident Comms collection in March 2026.",
    maintainedBy: "ai",
    publishMode: "auto",
    state: "archived",
    createdBy: person("Hana", "H", "lavender"),
    replayCount: 6,
    reviewCount: 0,
    lastUpdated: "2025-12-18",
    objective: "Back-reference only.",
    replays: [],
  },
];

export function tabCounts(collections) {
  return collections.reduce(
    (acc, c) => {
      acc[c.state] = (acc[c.state] || 0) + 1;
      return acc;
    },
    { active: 0, draft: 0, archived: 0 },
  );
}

// Action box (sidecar) — how many replays are waiting on the human across
// the manual-review collections, plus draft collections pending publish.
export function actionBoxItems(collections) {
  const toReview = collections.reduce((n, c) => n + (c.reviewCount || 0), 0);
  const drafts = collections.filter((c) => c.state === "draft").length;
  return { toReview, drafts };
}
