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
// `theme` groups the metric in the Workspace direction's left column;
// `explain` is the AI read of the metric; `clip` is its per-metric 2-voice
// audio explanation.
export const KPIS = [
  {
    id: "win-rate",
    label: "Win rate",
    value: "31%",
    delta: "-4 pp vs last week",
    tone: "down",
    theme: "growth",
    source: "Won ÷ (won + lost), closed deals, trailing 7 days",
    spark: [38, 36, 37, 35, 34, 33, 31],
    explain: "Win rate fell four points this week. Almost the entire drop is three enterprise deals lost to Northwind on price — mid-market actually improved, so this is a segment story, not a broad decline.",
    clip: { durationLabel: "0:48", durationSec: 48, transcript: [
      { speaker: "Maya", line: "Win rate's down to 31%, off four points." },
      { speaker: "Theo", line: "But it's concentrated — three enterprise losses to Northwind, all on price. Strip those and the trend's flat." },
    ] },
  },
  {
    id: "top-competitor",
    label: "Top competitor in losses",
    value: "Northwind",
    delta: "3 of 5 losses this week",
    tone: "warn",
    theme: "risk",
    source: "Competitor tagged on closed-lost deals",
    spark: null,
    explain: "Northwind appeared in three of five losses, every time underbidding us. Two of those deals had budget approved — the blocker was our 12-month term, not headline price.",
    clip: { durationLabel: "0:39", durationSec: 39, transcript: [
      { speaker: "Maya", line: "Northwind took three of our five losses." },
      { speaker: "Theo", line: "And it wasn't pure price — two were winnable if we'd flexed the contract term." },
    ] },
  },
  {
    id: "segment-winrate",
    label: "Mid-market win rate",
    value: "44%",
    delta: "+6 pp vs last week",
    tone: "up",
    theme: "growth",
    source: "Win rate filtered to mid-market segment",
    spark: [37, 38, 39, 40, 41, 42, 44],
    explain: "Mid-market had its best week of the quarter, up six points. The Insights add-on is doing a lot of the lifting here — attach and win rate are climbing together.",
    clip: { durationLabel: "0:42", durationSec: 42, transcript: [
      { speaker: "Maya", line: "Mid-market quietly hit 44% — best of the quarter." },
      { speaker: "Theo", line: "The Insights add-on is the common thread in those wins." },
    ] },
  },
  {
    id: "leading-products",
    label: "Insights add-on attach",
    value: "26%",
    delta: "+5 pp vs last week",
    tone: "up",
    theme: "growth",
    source: "Won deals including the Insights add-on ÷ all won deals",
    spark: [18, 19, 21, 22, 23, 24, 26],
    explain: "The Insights add-on is now in one of every four won deals. Where it's attached, deals close about nine days faster — it's becoming a velocity lever, not just upsell.",
    clip: { durationLabel: "0:44", durationSec: 44, transcript: [
      { speaker: "Maya", line: "Insights attach is up to 26% of won deals." },
      { speaker: "Theo", line: "And those deals close nine days quicker — that's the real story." },
    ] },
  },
  {
    id: "avg-deal",
    label: "Avg. deal size",
    value: "$48.2k",
    delta: "+$2.1k vs last week",
    tone: "up",
    theme: "efficiency",
    source: "Mean closed-won contract value, trailing 7 days",
    spark: [44, 45, 46, 45, 47, 47, 48],
    explain: "Average deal size ticked up $2.1k, driven by add-on attach rather than list-price increases. Healthy: we're growing value without leaning harder on discounts.",
    clip: { durationLabel: "0:36", durationSec: 36, transcript: [
      { speaker: "Maya", line: "Deals are running a touch bigger — up $2.1k." },
      { speaker: "Theo", line: "And it's from attach, not discounting less. Good kind of growth." },
    ] },
  },
  {
    id: "cycle-time",
    label: "Avg. sales cycle",
    value: "37 days",
    delta: "-9 days when Insights attached",
    tone: "up",
    theme: "efficiency",
    source: "Days from opportunity created to closed-won",
    spark: [46, 45, 44, 42, 41, 39, 37],
    explain: "Cycle time keeps shortening. The headline: deals with the Insights add-on close nine days faster than those without — the clearest efficiency signal in the space.",
    clip: { durationLabel: "0:40", durationSec: 40, transcript: [
      { speaker: "Maya", line: "Sales cycle is down to 37 days." },
      { speaker: "Theo", line: "Nine of those days come straight from the Insights add-on." },
    ] },
  },
  {
    id: "discount",
    label: "Avg. discount given",
    value: "14%",
    delta: "+3 pp vs last week",
    tone: "down",
    theme: "risk",
    source: "Discount off list on closed-won deals",
    spark: [9, 10, 11, 11, 12, 13, 14],
    explain: "Discounting crept up three points as reps chased the enterprise deals we ultimately lost. Worth watching — early data says heavier discounting isn't actually buying wins.",
    clip: { durationLabel: "0:37", durationSec: 37, transcript: [
      { speaker: "Maya", line: "Discounting's up to 14% — three points." },
      { speaker: "Theo", line: "And it didn't even win the deals. That's the part to flag." },
    ] },
  },
  {
    id: "pipeline",
    label: "Qualified pipeline",
    value: "$3.1M",
    delta: "flat vs last week",
    tone: "flat",
    theme: "growth",
    source: "Open opportunities past qualification stage",
    spark: [30, 31, 31, 30, 31, 31, 31],
    explain: "Pipeline held flat at $3.1M. Stable coverage, but no new top-of-funnel momentum this week — something to revisit if win rate stays soft.",
    clip: { durationLabel: "0:34", durationSec: 34, transcript: [
      { speaker: "Maya", line: "Pipeline's flat at $3.1M." },
      { speaker: "Theo", line: "Coverage is fine; we just didn't add much new this week." },
    ] },
  },
];

// Left-column groupings for the Workspace direction (KPIs grouped by theme).
export const METRIC_GROUPS = [
  { id: "growth", label: "Growth & win", metricIds: ["win-rate", "segment-winrate", "leading-products", "pipeline"] },
  { id: "risk", label: "Risk & pricing", metricIds: ["top-competitor", "discount"] },
  { id: "efficiency", label: "Efficiency", metricIds: ["avg-deal", "cycle-time"] },
];

// Metric-scoped saved chats/explorations — the middle column's "chats about
// this metric". Visibility is explicit (shared into the space vs private).
export const METRIC_THREADS = [
  { id: "t1", metricId: "win-rate", title: "Which Northwind deals were winnable on terms, not price?", author: { name: "Marco Díaz", initials: "MD", bg: "#DCF5E8", fg: "#1B7A4B" }, visibility: "shared", updated: "2h ago" },
  { id: "t2", metricId: "win-rate", title: "Win rate by rep — who's slipping?", author: { name: "Priya Nair", initials: "PN", bg: "#EDE9FE", fg: "#6650A5" }, visibility: "private", updated: "Yesterday" },
  { id: "t3", metricId: "segment-winrate", title: "What's repeatable from the mid-market wins?", author: { name: "Lena Okafor", initials: "LO", bg: "#FFE8D6", fg: "#B5531B" }, visibility: "shared", updated: "3h ago" },
  { id: "t4", metricId: "leading-products", title: "Where does the Insights add-on close fastest?", author: { name: "Lena Okafor", initials: "LO", bg: "#FFE8D6", fg: "#B5531B" }, visibility: "shared", updated: "Yesterday" },
  { id: "t5", metricId: "cycle-time", title: "Does attach really cause the faster close?", author: { name: "Marco Díaz", initials: "MD", bg: "#DCF5E8", fg: "#1B7A4B" }, visibility: "shared", updated: "2d ago" },
  { id: "t6", metricId: "discount", title: "My scratch: discount vs. win-rate by rep", author: { name: "Priya Nair", initials: "PN", bg: "#EDE9FE", fg: "#6650A5" }, visibility: "private", updated: "3d ago" },
  { id: "t7", metricId: "top-competitor", title: "Northwind battlecard — where we keep losing", author: { name: "Sam Whitfield", initials: "SW", bg: "#E3ECFF", fg: "#2456C9" }, visibility: "shared", updated: "4d ago" },
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

// ---------------------------------------------------------------------------
// STORIES — authored analytical narratives (Jun 19 sharpening). You arrive to
// these, not a blank prompt: a story is authored ONCE from an exploration and
// made viewable to everyone (token discipline — no re-asking the same thing).
// Default-PUBLIC (others can view, not edit); private is opt-in. Stories carry
// pinned/highlighted insights (the Kindle-highlight analogy), comments, a KPI
// trend with "key moments", lineage back to the exploration, and related
// stories. `blocks` is the ordered body the story-artifact template renders.
//
// status: "authored" (published) | "draft"      visibility: "public" | "private"
export const STORIES = [
  {
    id: "s-winrate",
    title: "Win rate slipped — but it's a segment story, not a decline",
    question: "Why did win rate drop to 31% this week?",
    titleAr: "تراجع معدل الفوز — لكنها قصة قطاع وليست انخفاضًا عامًّا",
    author: { name: "Marco Díaz", initials: "MD", bg: "#DCF5E8", fg: "#1B7A4B" },
    status: "authored",
    visibility: "public",
    date: "Jun 18, 2026",
    readTimeLabel: "3 min read",
    viewCount: 14,
    commentCount: 3,
    kpiIds: ["win-rate", "top-competitor", "segment-winrate"],
    basedOnExplorationId: "x1",
    relatedStoryIds: ["s-midmarket", "s-discount"],
    tldr: "Overall win rate fell 4pp to 31%, but almost the entire drop is three enterprise deals lost to Northwind on contract terms — mid-market actually climbed. Don't chase enterprise on price.",
    tldrAr: "انخفض معدل الفوز 4 نقاط إلى 31٪، لكن الانخفاض كله تقريبًا ثلاث صفقات مؤسسية خسرناها أمام Northwind بسبب شروط العقد — بينما ارتفع السوق المتوسطة.",
    blocks: [
      { id: "b1", type: "narrative", text: "Win rate dropped four points this week, and the instinct is to read it as a broad slowdown. The data says the opposite: this is concentrated, not systemic." },
      { id: "b2", type: "chart", kpiId: "win-rate", caption: "Win rate, trailing 7 weeks", keyMoments: [
        { at: "Jun 12", label: "Northwind enters", note: "The first of three enterprise deals where Northwind undercut us begins to slip." },
        { at: "Jun 16", label: "Mid-market turns", note: "Insights-attached mid-market deals start closing — the line stabilises underneath." },
      ] },
      { id: "b3", type: "insight", text: "2 of the 3 Northwind losses had budget approved. The blocker wasn't headline price — it was our 12-month term.", source: "Exploration: Which Northwind deals were winnable on terms? (Marco Díaz)", pinnedBy: { name: "Sam Whitfield", initials: "SW", bg: "#E3ECFF", fg: "#2456C9" } },
      { id: "b4", type: "narrative", text: "Strip those three deals and the trend is flat. Meanwhile mid-market win rate climbed 6pp to 44% — its best week of the quarter — with the Insights add-on as the common thread." },
      { id: "b5", type: "recommendation", text: "Don't chase the enterprise losses on price. Pilot a flexible contract term for deals where Northwind is present, and double down on what's working in mid-market." },
    ],
    pinnedInsights: [
      { id: "pi1", blockId: "b3", text: "2 of 3 Northwind losses were winnable on terms, not price.", by: { name: "Sam Whitfield", initials: "SW", bg: "#E3ECFF", fg: "#2456C9" } },
    ],
    comments: [
      { id: "cm1", author: { name: "Sam Whitfield", initials: "SW", bg: "#E3ECFF", fg: "#2456C9" }, anchorBlockId: "b3", at: "1h ago", text: "This is the one. Let's get a flexible-term pilot in front of legal this week." },
      { id: "cm2", author: { name: "Priya Nair", initials: "PN", bg: "#EDE9FE", fg: "#6650A5" }, anchorBlockId: null, at: "40m ago", text: "Pulling in RevOps — Lena, can we quantify the margin hit of a 6-month term?" },
      { id: "cm3", author: { name: "Lena Okafor", initials: "LO", bg: "#FFE8D6", fg: "#B5531B" }, anchorBlockId: null, at: "12m ago", text: "On it. First pass says <2pts of margin for the deals in question." },
    ],
  },
  {
    id: "s-midmarket",
    title: "What's repeatable from the mid-market wins",
    question: "What's working in mid-market that we could repeat?",
    titleAr: "ما الذي يمكن تكراره من مكاسب السوق المتوسطة",
    author: { name: "Lena Okafor", initials: "LO", bg: "#FFE8D6", fg: "#B5531B" },
    status: "authored",
    visibility: "public",
    date: "Jun 17, 2026",
    readTimeLabel: "2 min read",
    viewCount: 9,
    commentCount: 1,
    kpiIds: ["segment-winrate", "leading-products", "cycle-time"],
    basedOnExplorationId: "x2",
    relatedStoryIds: ["s-winrate"],
    tldr: "Mid-market hit 44% win rate on the back of the Insights add-on. Where it's attached, deals close 9 days faster — strongest in the 50–200 seat band.",
    tldrAr: "بلغ السوق المتوسطة معدل فوز 44٪ بفضل إضافة Insights. وحيثما أُضيفت، تُغلق الصفقات أسرع بتسعة أيام.",
    blocks: [
      { id: "b1", type: "narrative", text: "Mid-market quietly had its best week of the quarter. The pattern behind it is repeatable — and it's the Insights add-on." },
      { id: "b2", type: "chart", kpiId: "segment-winrate", caption: "Mid-market win rate, trailing 7 weeks", keyMoments: [
        { at: "Jun 14", label: "Attach inflects", note: "Insights add-on attach crosses 25% in mid-market." },
      ] },
      { id: "b3", type: "insight", text: "9-day faster close where Insights is attached — strongest in the 50–200 seat band.", source: "Exploration: Where does the Insights add-on close fastest? (Lena Okafor)", pinnedBy: { name: "Priya Nair", initials: "PN", bg: "#EDE9FE", fg: "#6650A5" } },
      { id: "b4", type: "recommendation", text: "Make Insights the default line item on mid-market proposals in the 50–200 seat band." },
    ],
    pinnedInsights: [
      { id: "pi1", blockId: "b3", text: "Insights attach → 9-day faster close in the 50–200 seat band.", by: { name: "Priya Nair", initials: "PN", bg: "#EDE9FE", fg: "#6650A5" } },
    ],
    comments: [
      { id: "cm1", author: { name: "Priya Nair", initials: "PN", bg: "#EDE9FE", fg: "#6650A5" }, anchorBlockId: null, at: "Yesterday", text: "Adding this to the SKO playbook." },
    ],
  },
  {
    id: "s-discount",
    title: "Is discounting actually buying wins?",
    question: "Where is discounting hurting more than it helps?",
    titleAr: "هل الخصم يشتري الصفقات فعلًا؟",
    author: { name: "Priya Nair", initials: "PN", bg: "#EDE9FE", fg: "#6650A5" },
    status: "authored",
    visibility: "public",
    date: "Jun 16, 2026",
    readTimeLabel: "2 min read",
    viewCount: 6,
    commentCount: 0,
    kpiIds: ["discount", "win-rate"],
    basedOnExplorationId: "x3",
    relatedStoryIds: ["s-winrate"],
    tldr: "Discounting crept up 3pp to 14% as reps chased the enterprise deals we lost anyway. Early read: heavier discounting isn't buying wins.",
    tldrAr: "ارتفع الخصم 3 نقاط إلى 14٪ بينما طارد المندوبون صفقات مؤسسية خسرناها على أي حال.",
    blocks: [
      { id: "b1", type: "narrative", text: "Discount off list rose to 14% this week. The worry isn't the number — it's that the extra discount didn't convert." },
      { id: "b2", type: "chart", kpiId: "discount", caption: "Average discount given, trailing 7 weeks", keyMoments: [] },
      { id: "b3", type: "insight", text: "The deals with the deepest discounts this week were the three we lost to Northwind — discount didn't move the outcome.", source: "Exploration: discount vs. win-rate by rep (Priya Nair)", pinnedBy: null },
    ],
    pinnedInsights: [],
    comments: [],
  },
  {
    id: "s-northwind",
    title: "Northwind battlecard: where we keep losing",
    question: "Where does Northwind beat us, and on what?",
    titleAr: "بطاقة المواجهة مع Northwind: أين نخسر باستمرار",
    author: { name: "Sam Whitfield", initials: "SW", bg: "#E3ECFF", fg: "#2456C9" },
    status: "authored",
    visibility: "public",
    date: "Jun 14, 2026",
    readTimeLabel: "4 min read",
    viewCount: 21,
    commentCount: 2,
    kpiIds: ["top-competitor", "win-rate"],
    basedOnExplorationId: null,
    relatedStoryIds: ["s-winrate"],
    tldr: "Northwind shows up in 3 of 5 losses, almost always on contract flexibility rather than price. A flexible-term play neutralises most of it.",
    tldrAr: "تظهر Northwind في 3 من 5 خسائر، غالبًا بسبب مرونة العقد لا السعر.",
    blocks: [
      { id: "b1", type: "narrative", text: "Northwind is now our most-tagged competitor in losses. The pattern is consistent enough to build a play around." },
    ],
    pinnedInsights: [],
    comments: [],
  },
  {
    id: "s-pipeline",
    title: "Pipeline coverage heading into Q3 (draft)",
    question: "Do we have enough qualified pipeline for Q3?",
    titleAr: "تغطية خط الأنابيب مع دخول الربع الثالث (مسودة)",
    author: { name: "Lena Okafor", initials: "LO", bg: "#FFE8D6", fg: "#B5531B" },
    status: "draft",
    visibility: "private",
    date: "Jun 19, 2026",
    readTimeLabel: "1 min read",
    viewCount: 0,
    commentCount: 0,
    kpiIds: ["pipeline"],
    basedOnExplorationId: null,
    relatedStoryIds: [],
    tldr: "Pipeline held flat at $3.1M. Coverage is fine for now, but no new top-of-funnel momentum — worth a closer look before Q3.",
    tldrAr: "ظل خط الأنابيب ثابتًا عند 3.1 مليون دولار.",
    blocks: [
      { id: "b1", type: "narrative", text: "Draft — pulling the Q3 coverage picture together. Pipeline is flat; the question is whether current coverage carries the Q3 number." },
    ],
    pinnedInsights: [],
    comments: [],
  },
];
