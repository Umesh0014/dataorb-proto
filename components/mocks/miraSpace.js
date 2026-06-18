// miraSpace.js — mock content for the "Ask Mira Pro" collaborative
// outcome-space directions (Notion ticket: [Ask Mira Pro] Landing page).
//
// One pre-populated "Sales" space. Every direction (Briefing-first / Room /
// Player) renders from THIS data — only the arrangement differs, so the
// Gate-1 comparison is about mental model, not content. KPI deltas carry a
// label + unit (G3); every claim carries a `source` for lineage (research:
// 89% of execs won't trust unverified AI numbers).

export const SPACE = {
  id: "sales",
  name: "Sales",
  outcome: "Win more of the revenue we're already talking to.",
  // Pre-populated, not built-from-scratch (decision: ~7–10 known KPIs).
  populated: true,
};

export const OWNER = {
  id: "u-priya",
  name: "Priya Nair",
  role: "VP, Sales",
  initials: "PN",
  bg: "#EDE9FE",
  fg: "#6650A5",
};

// Collaborators hold quota (ties to Credit & Usage). Quota is shown as a
// share of this space's monthly query allowance — read-only here.
export const COLLABORATORS = [
  { id: "u-priya", name: "Priya Nair", role: "VP, Sales", initials: "PN", bg: "#EDE9FE", fg: "#6650A5", quotaUsed: 142, quotaTotal: 300 },
  { id: "u-marco", name: "Marco Díaz", role: "Director, Mid-Market", initials: "MD", bg: "#DCF5E8", fg: "#1B7A4B", quotaUsed: 88, quotaTotal: 150 },
  { id: "u-lena", name: "Lena Okafor", role: "RevOps Lead", initials: "LO", bg: "#FFE8D6", fg: "#B5531B", quotaUsed: 61, quotaTotal: 150 },
  { id: "u-sam", name: "Sam Whitfield", role: "Chief Revenue Officer", initials: "SW", bg: "#E3ECFF", fg: "#2456C9", quotaUsed: 9, quotaTotal: 100 },
];

// The daily/weekly briefing — authored narrative (Amazon-memo model), not a
// TTS readout of numbers. Two voices, chapter markers (one per KPI theme),
// a text TL;DR peer to the audio, and explicit source attribution.
export const BRIEFING = {
  id: "ep-2026-06-18",
  title: "Sales this week: win rate slipped, but mid-market is turning",
  episodeLabel: "Thursday briefing",
  date: "Jun 18, 2026",
  durationLabel: "4 min",
  durationSec: 240,
  generatedIn: "en",
  source: "Closed-won + open pipeline through Tue Jun 17",
  // One-line TL;DR so the brief is equally usable muted (a11y + meeting ctx).
  tldr:
    "Win rate dipped to 31% as Northwind undercut us on three enterprise deals — but mid-market win rate climbed 6pp and the new Insights add-on is now in 1 of 4 won deals.",
  // The same brief listened to in Arabic — one click on the player re-renders
  // (generate in English, listen in Arabic). RTL handled by the layout.
  titleAr: "المبيعات هذا الأسبوع: تراجع معدل الفوز، لكن السوق المتوسطة تتحسّن",
  tldrAr:
    "انخفض معدل الفوز إلى 31٪ بعدما تفوّقت Northwind علينا سعريًّا في ثلاث صفقات مؤسسية — لكن معدل الفوز في السوق المتوسطة ارتفع 6 نقاط، وإضافة Insights أصبحت الآن في صفقة من كل أربع صفقات رابحة.",
  chapters: [
    { id: "c1", label: "What moved", at: "0:00", kpiId: "win-rate" },
    { id: "c2", label: "Why win rate slipped", at: "0:48", kpiId: "top-competitor" },
    { id: "c3", label: "Mid-market is turning", at: "2:05", kpiId: "segment-winrate" },
    { id: "c4", label: "What's pulling deals through", at: "3:10", kpiId: "leading-products" },
  ],
  transcript: [
    { speaker: "Maya", line: "Morning. Three things moved this week, and the headline isn't the one you'd expect." },
    { speaker: "Theo", line: "Right — overall win rate slipped to 31%, down four points. But that number is hiding a split." },
    { speaker: "Maya", line: "It is. Almost all of the drop is three enterprise deals we lost to Northwind, and in every one the deciding factor was price." },
    { speaker: "Theo", line: "Meanwhile mid-market quietly had its best week of the quarter — win rate there is up six points to 44%." },
    { speaker: "Maya", line: "And the Insights add-on is showing up in one of every four won deals now. Where it's attached, deals close about nine days faster." },
    { speaker: "Theo", line: "So the read: don't chase the enterprise losses on price. Lean into what's already working in mid-market." },
  ],
  past: [
    { id: "ep-2026-06-11", title: "Pipeline held flat; discounting crept up again", episodeLabel: "Thursday briefing", date: "Jun 11, 2026", durationLabel: "3 min", durationSec: 195 },
    { id: "ep-2026-06-04", title: "A strong close to May — three logos over $50k", episodeLabel: "Thursday briefing", date: "Jun 4, 2026", durationLabel: "5 min", durationSec: 305 },
    { id: "ep-2026-05-28", title: "Northwind enters two of our top accounts", episodeLabel: "Thursday briefing", date: "May 28, 2026", durationLabel: "4 min", durationSec: 250 },
  ],
};

// The ~7–10 KPI cards that matter for THIS outcome. Each carries a labelled,
// unit-bearing delta and a source/definition (lineage). `tone` drives the
// delta treatment (paired with sign + arrow, never colour alone — G9).
export const KPIS = [
  {
    id: "win-rate",
    label: "Win rate",
    value: "31%",
    delta: "-4 pp vs last week",
    tone: "down",
    source: "Won ÷ (won + lost), closed deals, trailing 7 days",
    spark: [38, 36, 37, 35, 34, 33, 31],
  },
  {
    id: "top-competitor",
    label: "Top competitor in losses",
    value: "Northwind",
    delta: "3 of 5 losses this week",
    tone: "warn",
    source: "Competitor tagged on closed-lost deals",
    spark: null,
  },
  {
    id: "segment-winrate",
    label: "Mid-market win rate",
    value: "44%",
    delta: "+6 pp vs last week",
    tone: "up",
    source: "Win rate filtered to mid-market segment",
    spark: [37, 38, 39, 40, 41, 42, 44],
  },
  {
    id: "leading-products",
    label: "Insights add-on attach",
    value: "26%",
    delta: "+5 pp vs last week",
    tone: "up",
    source: "Won deals including the Insights add-on ÷ all won deals",
    spark: [18, 19, 21, 22, 23, 24, 26],
  },
  {
    id: "avg-deal",
    label: "Avg. deal size",
    value: "$48.2k",
    delta: "+$2.1k vs last week",
    tone: "up",
    source: "Mean closed-won contract value, trailing 7 days",
    spark: [44, 45, 46, 45, 47, 47, 48],
  },
  {
    id: "cycle-time",
    label: "Avg. sales cycle",
    value: "37 days",
    delta: "-9 days when Insights attached",
    tone: "up",
    source: "Days from opportunity created to closed-won",
    spark: [46, 45, 44, 42, 41, 39, 37],
  },
  {
    id: "discount",
    label: "Avg. discount given",
    value: "14%",
    delta: "+3 pp vs last week",
    tone: "down",
    source: "Discount off list on closed-won deals",
    spark: [9, 10, 11, 11, 12, 13, 14],
  },
  {
    id: "pipeline",
    label: "Qualified pipeline",
    value: "$3.1M",
    delta: "flat vs last week",
    tone: "flat",
    source: "Open opportunities past qualification stage",
    spark: [30, 31, 31, 30, 31, 31, 31],
  },
];

// Explorations — first-class, persistent, nameable (NOT disposable chats).
// Private scratchpad by default; an explicit "add to space" promotes one to
// shared (research: fix Neil's "private vs shared got it wrong" with a
// visible state at creation).
export const EXPLORATIONS = [
  {
    id: "x1",
    title: "Which Northwind deals were winnable on terms, not price?",
    author: { name: "Marco Díaz", initials: "MD", bg: "#DCF5E8", fg: "#1B7A4B" },
    visibility: "shared",
    updated: "2h ago",
    summary: "2 of the 3 losses had budget approved — the blocker was a 12-month term we wouldn't flex.",
  },
  {
    id: "x2",
    title: "Where does the Insights add-on close fastest?",
    author: { name: "Lena Okafor", initials: "LO", bg: "#FFE8D6", fg: "#B5531B" },
    visibility: "shared",
    updated: "Yesterday",
    summary: "Mid-market + existing customers — 9-day faster close, strongest in the 50–200 seat band.",
  },
  {
    id: "x3",
    title: "My scratch: discount vs. win-rate by rep",
    author: { name: "Priya Nair", initials: "PN", bg: "#EDE9FE", fg: "#6650A5" },
    visibility: "private",
    updated: "3d ago",
    summary: "Looking at whether higher discounting actually buys wins. Early read: not really.",
  },
];

// Suggested follow-ups, pre-scoped to the space so the exec never starts
// from a blank prompt (research: non-technical execs don't know the question).
export const SUGGESTED = [
  "Why did we lose the three Northwind deals?",
  "What's working in mid-market that we could repeat?",
  "Which reps close fastest with the Insights add-on?",
  "Where is discounting hurting more than it helps?",
];
