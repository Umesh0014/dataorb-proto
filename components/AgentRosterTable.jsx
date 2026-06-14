"use client";

import React from "react";
import { ChevronRight, ArrowUp, ArrowDown } from "lucide-react";
import Card from "./Card";
import InlineStatusAffordance from "./InlineStatusAffordance";
import ScoreTrend from "./ScoreTrend";
import { ENGAGEMENT_META, toneInk } from "./mocks/commandCenter";

// AgentRosterTable — the team roster as a simple, sortable table. Column
// headers carry the CSAT / Composite labels once (no per-row repetition); each
// score cell shows the number + its trendline. Clicking a row opens the
// agent's detail page. Real <table> semantics with sortable <th> buttons and
// aria-sort.

const COLUMNS = [
  { key: "name", label: "Agent" },
  { key: "composite", label: "Composite" },
  { key: "qa", label: "QA score" },
  { key: "csat", label: "CSAT" },
];

function sortAgents(agents, { key, dir }) {
  const m = dir === "asc" ? 1 : -1;
  return [...agents].sort((a, b) => {
    if (key === "name") return a.name.localeCompare(b.name) * m;
    return (a[key] - b[key]) * m;
  });
}

export default function AgentRosterTable({ agents, onOpenAgent }) {
  // Default: most at-risk first (lowest composite).
  const [sort, setSort] = React.useState({ key: "composite", dir: "asc" });
  const sorted = React.useMemo(() => sortAgents(agents, sort), [agents, sort]);

  const onSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));

  return (
    <Card padX={0} padY={0} style={{ overflow: "hidden" }}>
      <table style={tStyles.table}>
        <thead>
          <tr>
            {COLUMNS.map((col) => {
              const active = sort.key === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                  style={tStyles.th}
                >
                  <button type="button" className="cc-focusable" onClick={() => onSort(col.key)} style={tStyles.thBtn}>
                    {col.label}
                    {active
                      ? (sort.dir === "asc"
                        ? <ArrowUp size={13} aria-hidden="true" />
                        : <ArrowDown size={13} aria-hidden="true" />)
                      : <ArrowDown size={13} aria-hidden="true" style={{ opacity: 0.25 }} />}
                  </button>
                </th>
              );
            })}
            <th scope="col" style={{ ...tStyles.th, width: 44 }} aria-label="Open" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((agent) => {
            const eng = ENGAGEMENT_META[agent.engagement];
            return (
              <tr key={agent.id} className="cc-agent-row" style={tStyles.row}>
                <td style={tStyles.tdAgent}>
                  <button
                    type="button"
                    className="cc-focusable"
                    onClick={() => onOpenAgent?.(agent.id)}
                    style={tStyles.agentBtn}
                    aria-label={`Open ${agent.name}'s detail page`}
                  >
                    <span style={tStyles.avatar}>{agent.initials}</span>
                    <span style={tStyles.identity}>
                      <span style={tStyles.name}>{agent.name}</span>
                      <InlineStatusAffordance tone={eng.tone} icon={<Dot tone={eng.tone} />} style={{ color: toneInk(eng.tone) }}>
                        {eng.label}
                      </InlineStatusAffordance>
                    </span>
                  </button>
                </td>
                <td style={tStyles.tdScore}>
                  <ScoreTrend value={`${agent.composite}`} points={agent.compositeTrend} target={agent.target} width={80} />
                </td>
                <td style={tStyles.tdScore}>
                  <ScoreTrend value={`${agent.qa}%`} unit="%" points={agent.qaTrend} target={agent.qaTarget} width={80} />
                </td>
                <td style={tStyles.tdScore}>
                  <ScoreTrend value={`${agent.csat}%`} unit="%" points={agent.csatTrend} target={agent.csatTarget} width={80} />
                </td>
                <td style={tStyles.tdChev}>
                  <ChevronRight size={18} aria-hidden="true" style={{ color: "var(--color-text-tertiary)" }} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

function Dot({ tone }) {
  const color = {
    danger: "var(--color-error)", warning: "var(--color-warning)",
    info: "var(--color-info)", success: "var(--color-success)", tertiary: "var(--color-text-tertiary)",
  }[tone] || "var(--color-text-tertiary)";
  return <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

const tStyles = {
  table: { width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)" },
  th: {
    textAlign: "left",
    padding: "12px 20px",
    borderBottom: "1px solid var(--color-divider-card)",
    background: "var(--surface-dim)",
  },
  thBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "2px 4px",
    margin: "-2px -4px",
    borderRadius: 4,
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
  },
  row: { borderBottom: "1px solid var(--color-divider-card)", transition: "background 120ms ease" },
  tdAgent: { padding: "10px 20px", verticalAlign: "middle" },
  agentBtn: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px 6px",
    margin: "-4px -6px",
    borderRadius: 8,
    textAlign: "left",
    width: "100%",
  },
  avatar: {
    flexShrink: 0,
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "var(--grey-100)",
    color: "var(--color-text-medium)",
    fontSize: 13,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  identity: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  name: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  tdScore: { padding: "10px 20px", verticalAlign: "middle", width: 150 },
  tdChev: { padding: "10px 16px", verticalAlign: "middle", width: 44, textAlign: "right" },
};
