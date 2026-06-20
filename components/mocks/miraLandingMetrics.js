// Landing "pulse" cards for the Ask Mira Pro home (Launchpad direction).
// One entry per DataOrb metric category: the headline rows shown on the
// card, plus the detail-view payload (a written report + the public chats
// other users have run on that category). Figures are lifted from the
// Insights Hub category cards so they stay in sync with the analytics
// surface. Clicking a card opens the two-column metric detail.
import {
  MessageSquare,
  CheckCircle2,
  Smile,
  TrendingDown,
  Tags,
  Target,
} from "lucide-react";

// Shared x-axis for the in-card trend sparklines (last 8 months).
export const TREND_MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];

export const LANDING_METRICS = [
  {
    id: "interactions",
    label: "Interactions",
    Icon: MessageSquare,
    accent: "var(--chart-blue)",
    unit: "",
    trend: [300, 310, 330, 420, 680, 920, 840, 1050],
    target: 900,
    rows: [
      { label: "This month", value: "1,050" },
      { label: "Call", value: "6,018" },
      { label: "WhatsApp", value: "1,117" },
    ],
    summary:
      "Interaction volume reached 1,050 this month — a 25% lift over April and the highest in the trailing year. Voice remains the dominant channel at 6,018 contacts, with WhatsApp the fastest-growing at 1,117.",
    findings: [
      "Volume has climbed every month since January, led by Call and WhatsApp.",
      "WhatsApp is up 3.4× since launch and now carries 15% of contacts.",
      "Email and Chat remain unconfigured — no volume recorded.",
    ],
    publicChats: [
      { id: "pc-int-1", user: "Priya Nair", initials: "PN", question: "Why did interaction volume spike in May?", time: "2 hours ago", messages: 14 },
      { id: "pc-int-2", user: "Marco Rossi", initials: "MR", question: "Which channels are driving the WhatsApp growth?", time: "Yesterday", messages: 9 },
      { id: "pc-int-3", user: "Sofia Almeida", initials: "SA", question: "Forecast next month's volume by channel", time: "3 days ago", messages: 21 },
    ],
  },
  {
    id: "resolution",
    label: "Resolution Rate",
    Icon: CheckCircle2,
    accent: "var(--chart-teal)",
    unit: "%",
    trend: [34, 35, 36, 38, 40, 39, 37, 36],
    target: 45,
    rows: [
      { label: "Summary", value: "36%" },
      { label: "Call", value: "35%" },
      { label: "WhatsApp", value: "39%" },
    ],
    summary:
      "Overall resolution sits at 36%, with WhatsApp (39%) edging out Call (35%). The gap to benchmark is widest on Billing and Collections, where first-contact resolution drags the blended rate down.",
    findings: [
      "WhatsApp resolves 4 points higher than Call despite lower volume.",
      "Billing & Collections is the largest drag on first-contact resolution.",
      "Coaching on dispute workflows would compound across every channel.",
    ],
    publicChats: [
      { id: "pc-res-1", user: "James Park", initials: "JP", question: "What's pulling our resolution rate below benchmark?", time: "5 hours ago", messages: 17 },
      { id: "pc-res-2", user: "Lena Fischer", initials: "LF", question: "Compare resolution by channel and reason", time: "2 days ago", messages: 12 },
    ],
  },
  {
    id: "sentiment",
    label: "Customer Sentiment",
    Icon: Smile,
    accent: "var(--chart-green)",
    unit: "%",
    trend: [50, 52, 55, 53, 54, 55, 55, 55],
    target: 60,
    rows: [
      { label: "Positive", value: "55%", tone: "positive" },
      { label: "Negative", value: "29%", tone: "negative" },
      { label: "Neutral", value: "16%" },
    ],
    summary:
      "Positive sentiment holds a 55% share, but the 29% negative band is concentrated in Cancellations and Billing disputes. Sentiment tracks closely with handle time — the longest calls skew most negative.",
    findings: [
      "Negative sentiment clusters in Cancellation and Retention contacts.",
      "Positive share has stayed above 50% for four consecutive months.",
      "High-AHT calls correlate with the steepest negative-sentiment share.",
    ],
    publicChats: [
      { id: "pc-sen-1", user: "Diego Santos", initials: "DS", question: "Which contact reasons have the worst sentiment?", time: "1 hour ago", messages: 11 },
      { id: "pc-sen-2", user: "Priya Nair", initials: "PN", question: "Has sentiment improved since the new script?", time: "4 days ago", messages: 19 },
      { id: "pc-sen-3", user: "Marco Rossi", initials: "MR", question: "Correlate sentiment with handle time", time: "1 week ago", messages: 8 },
    ],
  },
  {
    id: "churn",
    label: "Churn Risk",
    Icon: TrendingDown,
    accent: "var(--chart-coral)",
    unit: "",
    trend: [1, 1, 4, 18, 22, 20, 10, 10],
    target: 5,
    rows: [
      { label: "High risk", value: "10", tone: "negative" },
      { label: "Moderate", value: "5" },
      { label: "Churned", value: "8" },
    ],
    summary:
      "Ten customers are flagged high-risk and eight have already churned this period. Risk concentrates among Retention and Portability contacts, where negative sentiment and unresolved disputes overlap.",
    findings: [
      "High-risk accounts share unresolved Billing disputes in their history.",
      "Churned customers averaged 2+ negative-sentiment contacts beforehand.",
      "A proactive save-offer on high-risk accounts could blunt the trend.",
    ],
    publicChats: [
      { id: "pc-chu-1", user: "Sofia Almeida", initials: "SA", question: "Who are our highest churn-risk customers right now?", time: "30 minutes ago", messages: 23 },
      { id: "pc-chu-2", user: "James Park", initials: "JP", question: "What signals precede churn in our data?", time: "Yesterday", messages: 15 },
    ],
  },
  {
    id: "reasons",
    label: "Contact Reasons",
    Icon: Tags,
    accent: "var(--chart-lavender)",
    unit: "",
    trend: [900, 1100, 1300, 1600, 1900, 2100, 2250, 2316],
    target: 2000,
    rows: [
      { label: "Account & Billing", value: "2,316" },
      { label: "Cancellations", value: "947" },
      { label: "Broadband", value: "609" },
    ],
    summary:
      "Account & Billing Management leads contact reasons at 2,316 — nearly a third of all volume — followed by Service Cancellations (947) and Internet & Broadband Support (609). The top three account for the majority of inbound load.",
    findings: [
      "Account & Billing is 31% of volume but has the lowest resolution rate.",
      "Cancellations carry the highest negative sentiment of the top reasons.",
      "Self-serve content for the top three intents would cut inbound load.",
    ],
    publicChats: [
      { id: "pc-rea-1", user: "Lena Fischer", initials: "LF", question: "What are the top contact reasons this quarter?", time: "3 hours ago", messages: 10 },
      { id: "pc-rea-2", user: "Diego Santos", initials: "DS", question: "Which reasons are growing fastest?", time: "2 days ago", messages: 13 },
      { id: "pc-rea-3", user: "Priya Nair", initials: "PN", question: "Map contact reasons to resolution rate", time: "5 days ago", messages: 7 },
    ],
  },
  {
    id: "sales",
    label: "Sales Outcomes",
    Icon: Target,
    accent: "var(--chart-amber)",
    unit: "",
    trend: [0, 1, 2, 5, 8, 6, 7, 8],
    target: 10,
    rows: [
      { label: "Accepted", value: "8", tone: "positive" },
      { label: "Declined", value: "35", tone: "negative" },
      { label: "Postponed", value: "12" },
    ],
    summary:
      "Of offers presented, 8 were accepted against 35 declined and 12 postponed. Acceptance is strongest when paired with a retention save-offer; cold upsells drive most of the declines.",
    findings: [
      "Decline rate is highest on unprompted upsell attempts.",
      "Save-offers tied to a cancellation request convert best.",
      "Postponed offers rarely convert without a scheduled follow-up.",
    ],
    publicChats: [
      { id: "pc-sal-1", user: "Marco Rossi", initials: "MR", question: "Why are so many offers being declined?", time: "6 hours ago", messages: 16 },
      { id: "pc-sal-2", user: "Sofia Almeida", initials: "SA", question: "Which agents convert offers best?", time: "4 days ago", messages: 18 },
    ],
  },
];
