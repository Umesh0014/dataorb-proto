// Canonical mock response template for Ask Mira Pro.
// Every submitted question maps to this same response — branching
// conversation logic is out of scope for the prototype. Only the
// `question` field on each turn varies.

export const RESPONSE_TEMPLATE = {
  thought:
    "The user is asking about pain points reported this month. I'll need to query the Customer Experience Graph for interactions in the current month, group by pain-point taxonomy, and surface the highest-volume themes.",
  narrative:
    "I'll query the database to find the top pain points reported by customers this month (May 2026).",
  tool: {
    label: "Fetching data from the Customer Experience Graph",
    status: "Completed",
  },
  answer: {
    intro:
      "No pain points were found for this month (May 1–10, 2026) in the current dataset. This could indicate that:",
    bullets: [
      {
        bold: "No interactions have been recorded yet this month",
        rest: "The data may not be fully updated for May 2026",
      },
      {
        bold: "No pain points were identified",
        rest: "Customers in the analyzed interactions may not have reported specific pain points",
      },
      {
        bold: "Data timing",
        rest: "We're only 10 days into May, so the sample size may be limited",
      },
    ],
    followUpHeader: "Would you like me to:",
    followUpBullets: [
      "Expand the timeframe to include the last 30 days to see recent pain point trends?",
      "Check a different time period (such as last month - April 2026)?",
      "Verify if there are any interactions recorded for May 2026 at all?",
    ],
    closing:
      "This will help provide you with actionable insights about customer pain points from a period with available data.",
  },
  tokens: "0.35 DO tokens",
  followUps: [
    "Can We See The Top Pain Points That Were Identified As High Severity?",
    "What Are The Underlying Drivers For These Top Pain Points?",
    "Which Business Segments Or Channels Are Most Affected By These Pain Points?",
    "How Do These Top Pain Points Correlate With Customer Satisfaction Levels?",
  ],
};

// Second canonical template — used for the seeded "WHat my contact center
// should improve" conversation. Same structural shape as RESPONSE_TEMPLATE.
export const CONTACT_CENTER_RESPONSE_TEMPLATE = {
  thought:
    "The user wants improvement areas for their contact center. I'll pull recent volume, resolution, and CSAT signals across channels, then surface the few drivers with the largest gap to benchmark.",
  narrative:
    "I'll review contact center performance across volume, resolution, and CSAT to surface the most impactful improvement areas.",
  tool: {
    label: "Fetching data from the Contact Center Performance Graph",
    status: "Completed",
  },
  answer: {
    intro:
      "Three improvement areas stand out across the most recent reporting window:",
    bullets: [
      {
        bold: "First-contact resolution on Billing and Collections",
        rest: "31% of volume but the lowest resolution rate — coaching on dispute workflows would compound across all channels",
      },
      {
        bold: "Cancellation and Retention handle time",
        rest: "Above-target AHT with high negative-sentiment share — a focused save-offer playbook would shorten the call and lift retention",
      },
      {
        bold: "Technical Support deflection",
        rest: "Mobile and Fixed support are 25% of volume; targeted self-serve content for the top three intents would reduce inbound load",
      },
    ],
    followUpHeader: "Next steps to consider:",
    followUpBullets: [
      "Stand up a weekly QA loop on Billing dispute calls?",
      "Draft a save-offer playbook for Cancellation and Retention?",
      "Map the top three Technical Support intents to a self-serve article each?",
    ],
    closing:
      "Picking one area to focus on first will give you the cleanest before/after read.",
  },
  tokens: "0.42 DO tokens",
  followUps: [
    "Which Agents Are Top Performers In These Improvement Areas?",
    "How Does Our Resolution Rate Compare To Industry Benchmarks?",
    "What Training Programs Would Address These Gaps Fastest?",
    "Which Channel Mix Shifts Would Reduce Cost-To-Serve?",
  ],
};

// Seed conversations loaded into the store on first mount. Times are
// computed at module load so they read as relative ("6 minutes ago") via
// `formatRelativeTime` below; rebuilding the page won't shift these
// because the store initializer only runs once.
const NOW = Date.now();
const MINUTES = 60 * 1000;
const WEEKS   = 7 * 24 * 60 * 60 * 1000;

function turn(question, response) {
  return { id: `seed-${question.length}-${response.tokens}`, question, response };
}

export const INITIAL_MIRA_CONVERSATIONS = [
  {
    id: "seed-1",
    firstQuestion: "What are the top pain points reported by customers this month?",
    createdAt: NOW - 6 * MINUTES,
    turns: [
      turn(
        "What are the top pain points reported by customers this month?",
        RESPONSE_TEMPLATE
      ),
    ],
  },
  {
    id: "seed-2",
    firstQuestion: "What are the top pain points reported by customers this month?",
    createdAt: NOW - 9 * MINUTES,
    turns: [
      turn(
        "What are the top pain points reported by customers this month?",
        RESPONSE_TEMPLATE
      ),
    ],
  },
  {
    id: "seed-3",
    firstQuestion: "WHat my contact center should improve",
    createdAt: NOW - 1 * WEEKS,
    turns: [
      turn(
        "WHat my contact center should improve",
        CONTACT_CENTER_RESPONSE_TEMPLATE
      ),
    ],
  },
];

// Compact relative-time formatter for chat-list rows. Keeps the format
// matching the spec ("6 minutes ago", "1 week ago") without pulling in
// a date library.
export function formatRelativeTime(timestamp) {
  const diff = Math.max(0, (Date.now() - timestamp) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `${m} minute${m === 1 ? "" : "s"} ago`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `${h} hour${h === 1 ? "" : "s"} ago`;
  }
  if (diff < 604800) {
    const d = Math.floor(diff / 86400);
    return `${d} day${d === 1 ? "" : "s"} ago`;
  }
  if (diff < 2592000) {
    const w = Math.floor(diff / 604800);
    return `${w} week${w === 1 ? "" : "s"} ago`;
  }
  if (diff < 31536000) {
    const mo = Math.floor(diff / 2592000);
    return `${mo} month${mo === 1 ? "" : "s"} ago`;
  }
  const y = Math.floor(diff / 31536000);
  return `${y} year${y === 1 ? "" : "s"} ago`;
}
