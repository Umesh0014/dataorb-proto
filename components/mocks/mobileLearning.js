// mobileLearning — agent-facing mock data for the mobile Learning Hub
// surface (Guide / Replay / Drill on the go). This is the agent's *own*
// view: what's assigned to them, their practice streak, and the script for
// one in-frame Guide voice session. Titles are reused from the desktop
// guides / replays / drill mocks so the two surfaces read as one product.
//
// All data is mock and in-memory; the mobile surface reuses these the way
// the desktop pages reuse their own mocks (no backend).

export const MOBILE_AGENT = { name: "María Torres", initial: "M", role: "Frontline agent" };

// Activity-type → label + accent tint (reuses the Learning Hub lavender
// tertiary + outcome tile tokens so the mobile chips match desktop).
export const ACTIVITY_META = {
  guide:  { label: "Guide",  bg: "var(--color-icon-tertiary-bg)", fg: "var(--color-icon-tertiary-fg)", glyph: "school" },
  replay: { label: "Replay", bg: "var(--tile-emerald-bg)",        fg: "var(--tile-emerald-fg)",        glyph: "replay" },
  drill:  { label: "Drill",  bg: "var(--tile-blue-bg)",           fg: "var(--tile-blue-fg)",           glyph: "co_present" },
};

// Assignments inbox — what's due for this agent. `due` is a human label;
// `state` drives the status pill (overdue / today / upcoming / done).
export const MOBILE_ASSIGNMENTS = [
  {
    id: "asg-guide-tariff",
    type: "guide",
    title: "Handling Tariff Change Conversation",
    subtitle: "Retention · voice practice",
    minutes: 3,
    due: "Due today",
    state: "today",
    from: "Priya (Team Lead)",
    languages: ["English", "Spanish"],
  },
  {
    id: "asg-replay-save",
    type: "replay",
    title: "How María saved a high-ARPU churn",
    subtitle: "Retention · coached replay",
    minutes: 5,
    due: "Overdue · 1d",
    state: "overdue",
    from: "Priya (Team Lead)",
    languages: ["English"],
  },
  {
    id: "asg-drill-billing",
    type: "drill",
    title: "Billing dispute after a promotion",
    subtitle: "Retention · roleplay",
    minutes: 6,
    due: "Due Fri",
    state: "upcoming",
    from: "Mission: Q2 Save Rate",
    languages: ["Spanish"],
  },
  {
    id: "asg-guide-upsell",
    type: "guide",
    title: "Upselling Opportunities",
    subtitle: "Upsell · voice practice",
    minutes: 4,
    due: "Done · yesterday",
    state: "done",
    from: "Priya (Team Lead)",
    languages: ["English", "German"],
  },
];

// My Growth — lightweight streak + weekly goal. The ring is a goal gauge
// only (Apple-watch mental model), never a verdict on the person.
export const MOBILE_GROWTH = {
  streakDays: 6,
  weeklyDone: 3,
  weeklyGoal: 5,
  minutesThisWeek: 21,
  bestStreak: 11,
};

// The one Guide session wired for the demo. Short script + a calm summary
// scorecard. `graceSec` is when the time-remaining warning surfaces before
// the hard end (the audit fix the brief calls for).
export const MOBILE_GUIDE_SESSION = {
  id: "asg-guide-tariff",
  title: "Handling Tariff Change Conversation",
  scenario: "High-ARPU customer with a competing offer in hand.",
  totalSec: 180,
  graceSec: 30,
  transcript: [
    { role: "coach", text: "Let's practise the save. I'll be Daniel — six years with us, and Movistar just offered me a Galaxy S25." },
    { role: "you",   text: "Hi Daniel, thanks for being with us so long. Before we talk numbers, what's making you think about switching?" },
    { role: "coach", text: "Good — you opened with the relationship and asked, didn't pitch. Keep going." },
    { role: "you",   text: "I hear you on the price. Let me see what loyalty options I can put on the table for you today." },
    { role: "coach", text: "Nice acknowledge-then-act. Try naming a concrete next step so Daniel feels momentum." },
  ],
  summary: {
    score: 82,
    scoreMax: 100,
    durationLabel: "2m 38s of 3m",
    strengths: [
      "Opened on the relationship before price",
      "Acknowledged the competing offer without conceding early",
    ],
    focus: [
      "Name a concrete next step to build momentum",
      "Confirm the save before closing the call",
    ],
  },
};

// Bottom-tab destinations shared by every variant.
export const MOBILE_TABS = [
  { id: "home",       label: "Home",     glyph: "home" },
  { id: "activities", label: "Activities", glyph: "playlist_add_check" },
  { id: "growth",     label: "Growth",   glyph: "trending_up" },
];
