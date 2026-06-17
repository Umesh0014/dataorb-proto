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
  { id: "maintenance", name: "Maintenance", capMin: 10, agentCount: 38 },
  { id: "standard", name: "Standard", capMin: 15, agentCount: 512 },
  { id: "onboarding", name: "Onboarding", capMin: 30, agentCount: 206, note: "ECI default" },
  { id: "rampup", name: "Ramp-up", capMin: 45, agentCount: 74 },
  { id: "intensive", name: "Intensive", capMin: 60, agentCount: 41 },
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

function buildRoster() {
  const plan = QUOTA_BUCKETS.map((b) => [b.id, b.agentCount, b.capMin]);
  plan.push([null, 12, 0]); // unassigned / active pool
  const out = [];
  let id = 1;
  for (const [bucketId, count, cap] of plan) {
    for (let k = 0; k < count; k += 1) {
      const first = FIRST_NAMES[(id * 7) % FIRST_NAMES.length];
      const last = LAST_NAMES[(id * 13) % LAST_NAMES.length];
      const spread = (id * 37) % 100; // 0–99, deterministic
      let usedMin = 0;
      if (bucketId) {
        usedMin = spread >= 98 ? cap + (id % 3) + 1 : Math.round((cap * spread) / 100);
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

export const AGENT_BUCKET_SAMPLE = buildRoster();

// The single "what happens when an agent reaches their weekly cap" control.
// `allow_additional` is last and reveals the additional-minutes input.
export const LIMIT_RULES = [
  { id: "hard_stop", label: "Hard stop", description: "No more practice until the weekly cap resets." },
  { id: "manual", label: "Manual override per agent", description: "You decide, per agent, who can practise past the cap." },
  { id: "allow_additional", label: "Allow additional", description: "Practice continues past the cap, up to an additional cap you set." },
];

// Decision-to-confirm defaults + the global rule state.
export const RULE_DEFAULTS = {
  limitBehavior: "hard_stop", // "hard_stop" | "manual" | "allow_additional"
  additionalCapMin: 1000,
  conflictRule: "higher_cap", // "higher_cap" | "manual_wins" | "last_assigned"
  bucketValuesLocked: true,
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
