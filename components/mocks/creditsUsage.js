// creditsUsage.js — sample data for the Credits & Usage admin surface.
//
// Bucket / folding model (locked): the weekly practice cap belongs to the
// AGENT; a bucket is only a *folding* — a fixed weekly cap you sort agents
// into. Buckets never change value; you move agents between them. Tenant
// total committed = Σ (agents in a bucket × that bucket's cap). Cadence is
// weekly (a per-day cap is an optional secondary limit, never primary).
// All mock; no backend.

// Tenant credit utilisation for the current committed window. The card is
// the shared header across assignment approaches A/B/C — same copy and
// figures in every variant.
export const WEEKLY_QUOTA = {
  totalMin: 24000,
  consumedMin: 14880,
  remainingMin: 9120,
  periodLabel: "Jun 1 – Jun 30",
  resetDay: "Monday",
  totalSub: "Committed · Jun 1 – Jun 30",
  consumedSub: "Across role play, guide & probe",
  remainingSub: "Resets in 2 days",
};

// Fixed quota buckets — the only place a weekly cap value is defined.
// `note` flags the tenant default bucket (ECI). agentCount is the tenant-
// wide membership (the agent table below is a sample slice, not the total).
export const QUOTA_BUCKETS = [
  { id: "maintenance", name: "Warm-up", capMin: 10, agentCount: 38 },
  { id: "standard", name: "Stride", capMin: 15, agentCount: 512 },
  { id: "onboarding", name: "Kickstart", capMin: 30, agentCount: 206, note: "ECI default" },
  { id: "rampup", name: "Momentum", capMin: 45, agentCount: 74 },
  { id: "intensive", name: "Sprint", capMin: 60, agentCount: 41 },
];

// Four-tier variant (approach C4) — a simpler ladder that folds Stride into
// Kickstart. Separate dataset with its own roster; the page swaps to it only
// in C4 (and remounts so state never mixes with the five-tier world).
export const QUOTA_BUCKETS_4 = [
  { id: "warmup4", name: "Warm-up", capMin: 10, agentCount: 130 },
  { id: "kickstart4", name: "Kickstart", capMin: 25, agentCount: 430, note: "ECI default" },
  { id: "momentum4", name: "Momentum", capMin: 45, agentCount: 240 },
  { id: "sprint4", name: "Sprint", capMin: 60, agentCount: 100 },
];

// Three-tier variant (approach C5 — the feedback-incorporated direction).
// Exactly the three buckets the product feedback locks: Kickstart 30 (the
// standard default every new agent starts in), Momentum 45, Sprint 60.
// Ordered low → high so "upgrade to the next tier" is the next entry.
export const QUOTA_BUCKETS_3 = [
  { id: "kickstart3", name: "Kickstart", capMin: 30, agentCount: 430, note: "Default" },
  { id: "momentum3", name: "Momentum", capMin: 45, agentCount: 240 },
  { id: "sprint3", name: "Sprint", capMin: 60, agentCount: 100 },
];

// Tenure tag presentation. Tags are surfaced now; filtering by tag is a
// later version. Tones reuse the Settings pastel tile tokens.
export const TAG_META = {
  new: { label: "New", bg: "var(--tile-blue-bg)", fg: "var(--tile-blue-fg)" },
  onboarding: { label: "Onboarding", bg: "var(--tile-orange-bg)", fg: "var(--tile-orange-fg)" },
  tenured: { label: "Tenured", bg: "var(--tile-emerald-bg)", fg: "var(--tile-emerald-fg)" },
};

// Per-agent weekly usage. `usedMin` is this Mon–Sun window. `bucketId`
// folds the agent into a bucket (the cap source). `override` is an optional
// per-agent manual cap that wins over the bucket value. The roster is
// generated so each bucket actually holds `agentCount` members (the lists
// match the bucket cards) plus a pool of unassigned "active" agents that
// the Add-agents flow surfaces. Deterministic — no random — so the demo is
// stable across reloads.
const FIRST_NAMES = [
  "Mira", "Daniel", "Aisha", "Tom", "Carlos", "Priya", "Lena", "Omar", "Nadia", "Sam",
  "Ivy", "Leo", "Hana", "Noah", "Zara", "Eli", "Maya", "Kofi", "Rosa", "Yuki",
  "Arjun", "Bea", "Caleb", "Dina", "Esha", "Finn", "Gita", "Hugo", "Isla", "Jad",
];
const LAST_NAMES = [
  "Joshi", "Osei", "Khan", "Becker", "Reyes", "Nair", "Fischer", "Farah", "Rahman", "Okafor",
  "Chen", "Martins", "Silva", "Novak", "Haddad", "Park", "Ibrahim", "Costa", "Mwangi", "Tan",
  "Lopez", "Singh", "Adeyemi", "Petrov", "Yamada", "Bauer", "Diaz", "Kapoor", "Nakamura", "Oduya",
];
const TENURE_TAGS = ["new", "onboarding", "tenured"];
const LAST_ACTIVE = ["just now", "2h ago", "5h ago", "1d ago", "2d ago", "3d ago", "1w ago"];

// includeUnassigned — append the 12-strong "active pool" tail (A/B/C1–C4).
// C5 leaves it off: every agent already sits in a bucket. grace — push the
// over-cap agents meaningfully past their cap (≈20–40%) so the never-block
// grace period reads clearly (e.g. 39/30) instead of a single minute over.
function buildRoster(bucketList, { includeUnassigned = true, grace = false } = {}) {
  const plan = bucketList.map((b) => [b.id, b.agentCount, b.capMin]);
  if (includeUnassigned) plan.push([null, 12, 0]); // unassigned / active pool
  const out = [];
  let id = 1;
  for (const [bucketId, count, cap] of plan) {
    for (let k = 0; k < count; k += 1) {
      const first = FIRST_NAMES[(id * 7) % FIRST_NAMES.length];
      const last = LAST_NAMES[(id * 13) % LAST_NAMES.length];
      const spread = (id * 37) % 100; // 0–99, deterministic
      let usedMin = 0;
      if (bucketId) {
        const over = grace
          ? Math.round(cap * (1.2 + ((id % 5) * 0.05)))
          : cap + (id % 3) + 1;
        usedMin = spread >= 98 ? over : Math.round((cap * spread) / 100);
      }
      out.push({
        id,
        name: `${first} ${last}`,
        tag: TENURE_TAGS[id % TENURE_TAGS.length],
        bucketId,
        usedMin,
        lastActive: bucketId ? LAST_ACTIVE[id % LAST_ACTIVE.length] : "—",
        override: null,
      });
      id += 1;
    }
  }
  return out;
}

export const AGENT_BUCKET_SAMPLE = buildRoster(QUOTA_BUCKETS);
export const AGENT_BUCKET_SAMPLE_4 = buildRoster(QUOTA_BUCKETS_4);
export const AGENT_BUCKET_SAMPLE_3 = buildRoster(QUOTA_BUCKETS_3, { includeUnassigned: false, grace: true });

// ── Usage Governance spec V1.1 (C100) ──────────────────────────────────────
// The three-tier model: a DataOrb-set tenant ceiling (monthly allowance +
// overage buffer), four fixed Usage Groups (Level 1–4, weekly per-learner
// allowance, one default), and learners who inherit their group's allowance.
// Minutes only; "Learner" not "agent"; usedThisMonth is set to ~82% to show
// the 80% threshold banner.
export const GOV_PLAN = {
  monthlyAllowanceMin: 24000,
  overageBufferMin: 3600,
  usedThisMonthMin: 19800,
  resetLabel: "1 Jul",
};
// capMin = the group's weekly per-learner allowance; null = "Not set" (dormant,
// no pacing). Level 4 ships unset + empty to show that state. id is the stable
// internal group_n; label is the renameable display string.
export const GOV_GROUPS = [
  { id: "group_1", name: "Level 1", capMin: 25, agentCount: 142, isDefault: true },
  { id: "group_2", name: "Level 2", capMin: 35, agentCount: 88, isDefault: false },
  { id: "group_3", name: "Level 3", capMin: 50, agentCount: 40, isDefault: false },
  { id: "group_4", name: "Level 4", capMin: null, agentCount: 0, isDefault: false },
];
export const GOV_LEARNERS = buildRoster(GOV_GROUPS, { includeUnassigned: false, grace: true });
export const AVG_WEEKS_PER_MONTH = 4.33;

// "What happens when an agent reaches their weekly cap." The legacy set
// (A/B/C1/C2/C3) is the original minute-based model; `allow_additional`
// reveals the additional-minutes input.
export const LIMIT_RULES = [
  { id: "hard_stop", label: "Hard stop", description: "No more practice until the weekly cap resets." },
  { id: "manual", label: "Manual override per agent", description: "You decide, per agent, who can practise past the cap." },
  { id: "allow_additional", label: "Allow additional", description: "Practice continues past the cap, up to an additional cap you set." },
];

// Bucket-model set (C4 only): three postures — stop, gate behind approval,
// or auto-promote up the tier ladder. `auto_bump` is last so its revealed
// scope selector sits directly beneath the option.
export const LIMIT_RULES_BUCKET = [
  { id: "hard_stop", label: "Hard stop", description: "Practice pauses until the weekly cap resets." },
  { id: "require_approval", label: "Require approval", description: "The agent is paused and can request more; you approve case by case." },
  { id: "auto_bump", label: "Auto-bump to the next bucket", description: "Move the agent up one tier for more cap. Caps out at the top tier." },
];

// Scope of an auto-bump: just this cycle, or a permanent tier move.
export const BUMP_SCOPES = [
  { id: "week", label: "This week only" },
  { id: "permanent", label: "Move permanently" },
];

// Decision-to-confirm defaults + the global rule state. `bumpScope` only
// applies to the C4 bucket set; the page seeds limitBehavior per approach.
export const RULE_DEFAULTS = {
  limitBehavior: "hard_stop", // legacy: hard_stop | manual | allow_additional
  additionalCapMin: 1000,
  bumpScope: "week", // "week" | "permanent" (C4 auto_bump only)
  conflictRule: "higher_cap", // legacy only: higher_cap | manual_wins | last_assigned
  bucketValuesLocked: true, // legacy only (toggle)
  tierEditing: "locked", // C4 only: "locked" | "edit_caps" | "add_tiers"
  unassignedDefault: "none", // "none" | "lowest" | "blocked"
};

// Rule-builder (assignment approach A) field vocabulary. Declarative
// conditions map a cohort of agents to a target bucket at tenant scale.
export const RULE_FIELDS = [
  { id: "department", label: "Department", options: ["Sales", "Support", "Retention", "Billing"] },
  { id: "tenure", label: "Tenure", options: ["New", "Onboarding", "Tenured"] },
  { id: "location", label: "Location", options: ["Remote", "On-site"] },
];

// Seed rules for approach A (Assign by rule).
export const ASSIGNMENT_RULES_SAMPLE = [
  { id: "r1", fieldId: "department", value: "Sales", tenureId: "tenure", tenureValue: "New", bucketId: "onboarding" },
  { id: "r2", fieldId: "tenure", value: "Tenured", tenureId: "department", tenureValue: "Support", bucketId: "standard" },
];

// estimateMonthlyDelta — mid-fi forecast for the bill-impact banner. A move
// of `count` agents into a `capMin` bucket scales the additional monthly
// spend; deterministic so the preview is stable. Not a real billing model.
export function estimateMonthlyDelta(count, capMin) {
  return Math.round(count * capMin * 0.19);
}
