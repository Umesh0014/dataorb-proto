// Mock data for the AI Recruiter (AI Interviewer) — hiring-manager surface.
//
// Entity model (from the ticket brief + 12 Jun review): Candidate → AI
// Screening (the AI Interviewer runs the screening round) → AI evidence
// (coverage, never a verdict) → the hiring manager decides → Push to
// Interview → Offer → Hired. A Talent Community pools candidates who can be
// re-activated and hired later. Compliance spine: the AI reports how much of
// the assigned knowledge a candidate covered — never whether they passed;
// the human owns every stage move; screenings are recorded for compliance.
//
// Every number carries its unit at the callsite (coverage is "13 of 18
// topics", ROI stats state their basis), so no figure is unexplained.

// Job family → tint token pair. Tints come straight from the Settings pastel
// tile palette in globals.css (no new tokens). Colour marks a true difference
// in kind (job family), not decoration.
export const FAMILY_TINTS = {
  support:    { bg: "var(--tile-blue-bg)",    fg: "var(--tile-blue-fg)" },
  sales:      { bg: "var(--tile-emerald-bg)", fg: "var(--tile-emerald-fg)" },
  retention:  { bg: "var(--tile-violet-bg)",  fg: "var(--tile-violet-fg)" },
  onboarding: { bg: "var(--tile-orange-bg)",  fg: "var(--tile-orange-fg)" },
  compliance: { bg: "var(--tile-cyan-bg)",    fg: "var(--tile-cyan-fg)" },
  field:      { bg: "var(--tile-rose-bg)",    fg: "var(--tile-rose-fg)" },
};

export const FAMILY_LABELS = {
  support:    "Technical Support",
  sales:      "Sales",
  retention:  "Retention",
  onboarding: "Onboarding",
  compliance: "Compliance",
  field:      "Field Ops",
};

// Pipeline stages, in order. `community` is the off-pipeline talent pool —
// re-activatable, so it sits outside the linear funnel. Each stage carries a
// tile tint (paired with its label everywhere, never colour alone — G9) and
// the label of the action that advances a candidate OUT of it. `null` advance
// label = terminal or manual-only stage.
export const STAGES = [
  { id: "applied",      label: "Applied",      advance: "Start AI screening", next: "ai_screening", tint: { bg: "var(--pill-bg)",        fg: "var(--color-text-medium)" } },
  { id: "ai_screening", label: "AI Screening", advance: "Push to Interview",  next: "interview",    tint: { bg: "var(--tile-blue-bg)",   fg: "var(--tile-blue-fg)" } },
  { id: "interview",    label: "Interview",    advance: "Move to Offer",      next: "offer",        tint: { bg: "var(--tile-violet-bg)", fg: "var(--tile-violet-fg)" } },
  { id: "offer",        label: "Offer",        advance: "Mark Hired",         next: "hired",        tint: { bg: "var(--tile-orange-bg)", fg: "var(--tile-orange-fg)" } },
  { id: "hired",        label: "Hired",        advance: null,                 next: null,           tint: { bg: "var(--tile-emerald-bg)", fg: "var(--tile-emerald-fg)" } },
];

// Talent Community — separate stage descriptor; activation re-enters a
// candidate into the live pipeline at "Applied".
export const COMMUNITY_STAGE = {
  id: "community", label: "Talent Community", advance: "Activate candidate",
  next: "applied", tint: { bg: "var(--tile-cyan-bg)", fg: "var(--tile-cyan-fg)" },
};

export const STAGE_META = [...STAGES, COMMUNITY_STAGE].reduce((acc, s) => {
  acc[s.id] = s;
  return acc;
}, {});

// screen.status: "completed" (evidence available) · "in_progress" (AI
// Interviewer running) · "not_started". coverage = topics the candidate
// covered out of those assigned to the role's screening (per-candidate).
// `thin` = count of assigned topics with the thinnest coverage, surfaced as a
// follow-up cue (not a score).
export const CANDIDATES = [
  {
    id: "c-aanya", name: "Aanya Sharma", initial: "AS",
    role: "Tier 1 Support Advisor", family: "support", source: "Inbound",
    stage: "ai_screening",
    screen: { status: "completed", coverage: { covered: 15, total: 18 }, thin: 1, completedAt: "2026-06-11" },
    appliedAt: "2026-06-07", lastActivity: "AI screening completed",
  },
  {
    id: "c-diego", name: "Diego Fernández", initial: "DF",
    role: "Inside Sales Rep", family: "sales", source: "Referral",
    stage: "ai_screening",
    screen: { status: "completed", coverage: { covered: 11, total: 14 }, thin: 2, completedAt: "2026-06-11" },
    appliedAt: "2026-06-06", lastActivity: "AI screening completed",
  },
  {
    id: "c-meera", name: "Meera Iyer", initial: "MI",
    role: "Retention Specialist", family: "retention", source: "Sourced",
    stage: "ai_screening",
    screen: { status: "in_progress", coverage: { covered: 4, total: 12 }, thin: null, completedAt: null },
    appliedAt: "2026-06-09", lastActivity: "AI screening in progress",
  },
  {
    id: "c-pavel", name: "Pavel Novak", initial: "PN",
    role: "Onboarding Cohort (any LOB)", family: "onboarding", source: "Inbound",
    stage: "applied",
    screen: { status: "not_started", coverage: { covered: 0, total: 14 }, thin: null, completedAt: null },
    appliedAt: "2026-06-11", lastActivity: "Application received",
  },
  {
    id: "c-leila", name: "Leila Haddad", initial: "LH",
    role: "Compliance Associate", family: "compliance", source: "Inbound",
    stage: "applied",
    screen: { status: "not_started", coverage: { covered: 0, total: 11 }, thin: null, completedAt: null },
    appliedAt: "2026-06-10", lastActivity: "Application received",
  },
  {
    id: "c-tomas", name: "Tomás Ribeiro", initial: "TR",
    role: "Field Service Technician", family: "field", source: "Sourced",
    stage: "applied",
    screen: { status: "not_started", coverage: { covered: 0, total: 16 }, thin: null, completedAt: null },
    appliedAt: "2026-06-10", lastActivity: "Application received",
  },
  {
    id: "c-hana", name: "Hana Kobayashi", initial: "HK",
    role: "Premium Care Advisor", family: "sales", source: "Referral",
    stage: "interview",
    screen: { status: "completed", coverage: { covered: 13, total: 15 }, thin: 1, completedAt: "2026-06-09" },
    appliedAt: "2026-06-04", lastActivity: "Pushed to Interview",
  },
  {
    id: "c-omar", name: "Omar Al-Rashid", initial: "OA",
    role: "Tier 1 Support Advisor", family: "support", source: "Inbound",
    stage: "interview",
    screen: { status: "completed", coverage: { covered: 14, total: 18 }, thin: 2, completedAt: "2026-06-08" },
    appliedAt: "2026-06-03", lastActivity: "Pushed to Interview",
  },
  {
    id: "c-sofia", name: "Sofia Almeida", initial: "SA",
    role: "Retention Specialist", family: "retention", source: "Sourced",
    stage: "offer",
    screen: { status: "completed", coverage: { covered: 11, total: 12 }, thin: 0, completedAt: "2026-06-05" },
    appliedAt: "2026-05-30", lastActivity: "Offer extended",
  },
  {
    id: "c-noah", name: "Noah Williams", initial: "NW",
    role: "Onboarding Cohort (any LOB)", family: "onboarding", source: "Referral",
    stage: "hired",
    screen: { status: "completed", coverage: { covered: 13, total: 14 }, thin: 0, completedAt: "2026-05-28" },
    appliedAt: "2026-05-22", lastActivity: "Hired",
  },
  {
    id: "c-yuki", name: "Yuki Tanaka", initial: "YT",
    role: "Inside Sales Rep", family: "sales", source: "Inbound",
    stage: "hired",
    screen: { status: "completed", coverage: { covered: 12, total: 14 }, thin: 1, completedAt: "2026-05-26" },
    appliedAt: "2026-05-20", lastActivity: "Hired",
  },
  {
    id: "c-fatima", name: "Fatima Zahra", initial: "FZ",
    role: "Compliance Associate", family: "compliance", source: "Community",
    stage: "community",
    screen: { status: "completed", coverage: { covered: 9, total: 11 }, thin: 1, completedAt: "2026-04-18" },
    appliedAt: "2026-04-12", lastActivity: "Added to community",
  },
  {
    id: "c-victor", name: "Victor Costa", initial: "VC",
    role: "Field Service Technician", family: "field", source: "Community",
    stage: "community",
    screen: { status: "completed", coverage: { covered: 10, total: 16 }, thin: 3, completedAt: "2026-03-30" },
    appliedAt: "2026-03-24", lastActivity: "Added to community",
  },
];

// stageCounts — tally candidates per stage id (includes community).
export function stageCounts(candidates) {
  return candidates.reduce((acc, c) => {
    acc[c.stage] = (acc[c.stage] || 0) + 1;
    return acc;
  }, {});
}

// CANDIDATE_PROFILES — résumé-derived profile shown on the candidate detail
// view: a downloadable résumé handle plus work experience and education. Keyed
// by candidate id; candidates added in-session (no résumé on file) fall back
// to a placeholder via getProfile().
export const CANDIDATE_PROFILES = {
  "c-aanya": {
    resume: "AanyaSharma_Resume.pdf",
    experience: [
      { title: "Customer Support Associate", org: "BrightTel", period: "2023 – 2026" },
      { title: "Helpdesk Intern", org: "NimbusCare", period: "2022 – 2023" },
    ],
    education: [{ credential: "B.Com, Commerce", org: "University of Pune", year: "2022" }],
  },
  "c-diego": {
    resume: "DiegoFernandez_Resume.pdf",
    experience: [
      { title: "SDR", org: "Vela Software", period: "2022 – 2026" },
      { title: "Retail Associate", org: "Mercado Sur", period: "2020 – 2022" },
    ],
    education: [{ credential: "BBA, Marketing", org: "Universidad de Sevilla", year: "2020" }],
  },
  "c-meera": {
    resume: "MeeraIyer_Resume.pdf",
    experience: [{ title: "Account Manager", org: "Skylark Telecom", period: "2021 – 2026" }],
    education: [{ credential: "BA, Economics", org: "Christ University", year: "2021" }],
  },
  "c-pavel": {
    resume: "PavelNovak_Resume.pdf",
    experience: [{ title: "Operations Trainee", org: "CzechConnect", period: "2024 – 2026" }],
    education: [{ credential: "BSc, Business Informatics", org: "Charles University", year: "2024" }],
  },
  "c-leila": {
    resume: "LeilaHaddad_Resume.pdf",
    experience: [
      { title: "Compliance Analyst", org: "Atlas Bank", period: "2022 – 2026" },
      { title: "AML Intern", org: "Atlas Bank", period: "2021 – 2022" },
    ],
    education: [{ credential: "LLB, Law", org: "American University of Beirut", year: "2021" }],
  },
  "c-tomas": {
    resume: "TomasRibeiro_Resume.pdf",
    experience: [{ title: "Field Technician", org: "IberFibra", period: "2020 – 2026" }],
    education: [{ credential: "Diploma, Electronics", org: "IPL Leiria", year: "2020" }],
  },
  "c-hana": {
    resume: "HanaKobayashi_Resume.pdf",
    experience: [
      { title: "Premium Care Advisor", org: "Sakura Mobile", period: "2021 – 2026" },
      { title: "Concierge", org: "Hotel Ginza", period: "2019 – 2021" },
    ],
    education: [{ credential: "BA, Hospitality", org: "Waseda University", year: "2019" }],
  },
  "c-omar": {
    resume: "OmarAlRashid_Resume.pdf",
    experience: [
      { title: "Support Team Lead", org: "GulfNet", period: "2020 – 2026" },
      { title: "Support Advisor", org: "GulfNet", period: "2018 – 2020" },
    ],
    education: [{ credential: "BSc, Computer Science", org: "Qatar University", year: "2018" }],
  },
  "c-sofia": {
    resume: "SofiaAlmeida_Resume.pdf",
    experience: [
      { title: "Retention Specialist", org: "LusoMobile", period: "2021 – 2026" },
      { title: "Customer Advisor", org: "LusoMobile", period: "2019 – 2021" },
    ],
    education: [{ credential: "BA, Communication", org: "University of Lisbon", year: "2019" }],
  },
  "c-noah": {
    resume: "NoahWilliams_Resume.pdf",
    experience: [{ title: "Onboarding Coordinator", org: "Northstar BPO", period: "2022 – 2026" }],
    education: [{ credential: "BA, Psychology", org: "University of Leeds", year: "2022" }],
  },
  "c-yuki": {
    resume: "YukiTanaka_Resume.pdf",
    experience: [{ title: "Inside Sales Rep", org: "Tokyo Cloud", period: "2021 – 2026" }],
    education: [{ credential: "BBA, Business", org: "Keio University", year: "2021" }],
  },
  "c-fatima": {
    resume: "FatimaZahra_Resume.pdf",
    experience: [{ title: "Compliance Associate", org: "Maghreb Finance", period: "2020 – 2025" }],
    education: [{ credential: "MSc, Risk & Compliance", org: "Mohammed V University", year: "2020" }],
  },
  "c-victor": {
    resume: "VictorCosta_Resume.pdf",
    experience: [{ title: "Field Service Tech", org: "BrasilFibra", period: "2019 – 2025" }],
    education: [{ credential: "Technical Diploma, Telecom", org: "SENAI São Paulo", year: "2019" }],
  },
};

export function getProfile(id) {
  return CANDIDATE_PROFILES[id] || null;
}

// INTERVIEW_FEEDBACK — human interviewer notes, shown on candidates at the
// Interview stage. This is the human's record (not an AI verdict — G4 applies
// only to AI output); the hiring manager owns it.
export const INTERVIEW_FEEDBACK = {
  "c-hana": [
    { by: "Priya Menon", role: "Hiring Manager", date: "2026-06-11", notes: "Strong on consent capture and offer-fit discovery; walked through a real save scenario cleanly. Probe pricing edge-cases in the next round." },
  ],
  "c-omar": [
    { by: "Daniel Cho", role: "Support Lead", date: "2026-06-10", notes: "Confident on escalation thresholds and billing disputes. Coverage gap on disclosure rules matched the AI screening — confirmed live, worth a short follow-up." },
  ],
};

export function getFeedback(id) {
  return INTERVIEW_FEEDBACK[id] || [];
}

// OFFERS — offer details, shown on candidates at the Offer stage. Status is a
// factual state (Extended / Accepted / Declined), never a recommendation.
export const OFFERS = {
  "c-sofia": {
    title: "Retention Specialist",
    band: "Band 3 · Mid",
    start: "2026-07-07",
    status: "Extended",
    extendedOn: "2026-06-05",
  },
};

export function getOffer(id) {
  return OFFERS[id] || null;
}

