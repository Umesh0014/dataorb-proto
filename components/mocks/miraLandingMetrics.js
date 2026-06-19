// Landing "pulse" cards for the Ask Mira Pro home (Launchpad direction).
// One card per DataOrb metric category — the headline number plus the two
// next-most-relevant rows, lifted from the Insights Hub category cards so
// the figures stay in sync with the analytics surface. Clicking a card
// seeds a Mira question about that category (the `ask` string), tying the
// at-a-glance pulse back to the module's core action.
import {
  MessageSquare,
  CheckCircle2,
  Smile,
  TrendingDown,
  Tags,
  Target,
} from "lucide-react";

export const LANDING_METRICS = [
  {
    id: "interactions",
    label: "Interactions",
    Icon: MessageSquare,
    ask: "How are our customer interactions trending this month?",
    rows: [
      { label: "This month", value: "1,050" },
      { label: "Call", value: "6,018" },
      { label: "WhatsApp", value: "1,117" },
    ],
  },
  {
    id: "resolution",
    label: "Resolution Rate",
    Icon: CheckCircle2,
    ask: "What's driving our resolution rate across channels?",
    rows: [
      { label: "Summary", value: "36%" },
      { label: "Call", value: "35%" },
      { label: "WhatsApp", value: "39%" },
    ],
  },
  {
    id: "sentiment",
    label: "Customer Sentiment",
    Icon: Smile,
    ask: "How is customer sentiment shifting over time?",
    rows: [
      { label: "Positive", value: "55%", tone: "positive" },
      { label: "Negative", value: "29%", tone: "negative" },
      { label: "Neutral", value: "16%" },
    ],
  },
  {
    id: "churn",
    label: "Churn Risk",
    Icon: TrendingDown,
    ask: "Which customers are most at risk of churning, and why?",
    rows: [
      { label: "High risk", value: "10", tone: "negative" },
      { label: "Moderate", value: "5" },
      { label: "Churned", value: "8" },
    ],
  },
  {
    id: "reasons",
    label: "Contact Reasons",
    Icon: Tags,
    ask: "What are the top contact reasons this month?",
    rows: [
      { label: "Account & Billing", value: "2,316" },
      { label: "Cancellations", value: "947" },
      { label: "Broadband", value: "609" },
    ],
  },
  {
    id: "sales",
    label: "Sales Outcomes",
    Icon: Target,
    ask: "How are our sales offers performing?",
    rows: [
      { label: "Accepted", value: "8", tone: "positive" },
      { label: "Declined", value: "35", tone: "negative" },
      { label: "Postponed", value: "12" },
    ],
  },
];
