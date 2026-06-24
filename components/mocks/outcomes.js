// Outcome tiles for the Ask Mira Pro "Outcomes" landing direction. Each
// outcome is a KPI the user scans on landing: a current value, a delta vs the
// prior period (with a trend direction + good/bad tone), and a short monthly
// series that drives the in-tile sparkline. `span` declares the tile shape
// ("wide" = 2 columns / metric-left, "tall" = 1 column / sparkline-top); the
// grid arrangement is driven by this order, not hand-placed. A couple are
// pinned (sort to the front) and a couple archived (hidden behind the
// Archived filter). Figures are illustrative — no live data.

// Shared x-axis for the in-tile sparklines (last 8 months).
export const OUTCOME_MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];

export const OUTCOMES = [
  {
    id: "sales-conversion",
    name: "Sales Conversion",
    value: "24.8%",
    delta: { value: "+3.1%", dir: "up", good: true },
    series: [18, 19, 20, 21, 22, 23, 24, 24.8],
    accent: "var(--chart-blue)",
    span: "wide",
    pinned: true,
    archived: false,
  },
  {
    id: "net-revenue-retention",
    name: "Net Revenue Retention",
    value: "112%",
    delta: { value: "+5%", dir: "up", good: true },
    series: [101, 103, 104, 106, 108, 109, 110, 112],
    accent: "var(--chart-teal)",
    span: "wide",
    pinned: true,
    archived: false,
  },
  {
    id: "churn-rate",
    name: "Churn Rate",
    value: "4.6%",
    delta: { value: "-0.8%", dir: "down", good: true },
    series: [6.2, 6.0, 5.8, 5.5, 5.2, 5.0, 4.9, 4.6],
    accent: "var(--chart-coral)",
    span: "tall",
    pinned: false,
    archived: false,
  },
  {
    id: "csat",
    name: "CSAT",
    value: "88%",
    delta: { value: "+2%", dir: "up", good: true },
    series: [82, 83, 84, 85, 85, 86, 87, 88],
    accent: "var(--chart-green)",
    span: "wide",
    pinned: false,
    archived: false,
  },
  {
    id: "first-contact-resolution",
    name: "First Contact Resolution",
    value: "71%",
    delta: { value: "-3%", dir: "down", good: false },
    series: [76, 75, 75, 74, 73, 73, 72, 71],
    accent: "var(--chart-lavender)",
    span: "tall",
    pinned: false,
    archived: false,
  },
  {
    id: "avg-handle-time",
    name: "Avg Handle Time",
    value: "5m 42s",
    delta: { value: "-18s", dir: "down", good: true },
    series: [402, 396, 390, 384, 372, 360, 351, 342],
    accent: "var(--chart-amber)",
    span: "tall",
    pinned: false,
    archived: false,
  },
  {
    id: "nps",
    name: "Net Promoter Score",
    value: "+52",
    delta: { value: "+6", dir: "up", good: true },
    series: [38, 40, 42, 45, 47, 49, 50, 52],
    accent: "var(--chart-blue)",
    span: "wide",
    pinned: false,
    archived: false,
  },
  {
    id: "upsell-rate",
    name: "Upsell Rate",
    value: "9.3%",
    delta: { value: "+1.2%", dir: "up", good: true },
    series: [6.1, 6.6, 7.0, 7.5, 8.1, 8.6, 9.0, 9.3],
    accent: "var(--chart-teal)",
    span: "tall",
    pinned: false,
    archived: false,
  },
  {
    id: "refund-rate",
    name: "Refund Rate",
    value: "2.1%",
    delta: { value: "+0.4%", dir: "up", good: false },
    series: [1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1],
    accent: "var(--chart-coral)",
    span: "wide",
    pinned: false,
    archived: true,
  },
  {
    id: "cancellation-save-rate",
    name: "Cancellation Save Rate",
    value: "33%",
    delta: { value: "-2%", dir: "down", good: false },
    series: [40, 39, 38, 37, 36, 35, 34, 33],
    accent: "var(--chart-lavender)",
    span: "tall",
    pinned: false,
    archived: true,
  },
];
