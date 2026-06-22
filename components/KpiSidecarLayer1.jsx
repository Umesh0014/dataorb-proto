"use client";

import React from "react";
import { ArrowLeft, Search } from "lucide-react";
import {
  AgentCell, InfoTip, OutcomeBar, RagChip, SkeletonRows, StatPill,
  gapFor, sortAgents, statusLabelFor,
} from "./KpiSidecarParts";

const PAGE = 20;
const FETCH_MS = 650;

// Layer 1 — the priority surface. Header + 4-pill stats block + segmented
// outcome bar (collapsible) + agent table with client-side search and
// scroll-driven lazy loading (no pagination, no "load more").
export default function KpiSidecarLayer1({ kpi, onSelectAgent, onBack }) {
  const sorted = React.useMemo(() => sortAgents(kpi), [kpi]);
  const [query, setQuery] = React.useState("");
  const [shown, setShown] = React.useState(PAGE);
  const [fetching, setFetching] = React.useState(false);
  const [outcomesOpen, setOutcomesOpen] = React.useState(true);

  const filtered = React.useMemo(
    () => sorted.filter((a) => a.name.toLowerCase().includes(query.trim().toLowerCase())),
    [sorted, query],
  );
  const visible = filtered.slice(0, shown);
  const hasMore = shown < filtered.length;

  const onScroll = (e) => {
    if (fetching || !hasMore) return;
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 48) {
      setFetching(true);
      window.setTimeout(() => {
        setShown((n) => n + PAGE);
        setFetching(false);
      }, FETCH_MS);
    }
  };

  const gap = gapFor(kpi);

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <div style={s.titleWrap}>
          {onBack && (
            <button type="button" style={s.back} onClick={onBack} aria-label="Back">
              <ArrowLeft size={16} color="var(--color-text-medium)" />
            </button>
          )}
          <div>
            <h2 style={s.title}>{kpi.name}</h2>
            <p style={s.subtitle}>{kpi.subtitle}</p>
          </div>
        </div>
        <span style={s.dateBadge}>{kpi.dateRange}</span>
      </header>

      {/* Block 1 — four stat pills */}
      <div style={s.statRow}>
        <StatPill label="Total" value={kpi.total.toLocaleString()} sub="interactions" />
        <StatPill
          label="Campaign Rate"
          value={`${kpi.campaignRate}${kpi.unit}`}
          rag={kpi.campaignRate >= kpi.target ? "green" : "red"}
          trend={kpi.campaignRate >= kpi.target ? "up" : "down"}
        />
        <StatPill label="Target" value={kpi.target == null ? "—" : `${kpi.target}${kpi.unit}`} />
        {!gap.hidden && <StatPill label="Gap" value={gap.value} tone={gap.tone} />}
      </div>

      {/* Block 2 — collapsible outcome bar (context only) */}
      <section style={s.outcomeCard}>
        <button type="button" style={s.outcomeToggle} onClick={() => setOutcomesOpen((o) => !o)}>
          <span style={s.outcomeTitle}>Outcome distribution</span>
          <span style={s.chevron}>{outcomesOpen ? "▾" : "▸"}</span>
        </button>
        {outcomesOpen && <OutcomeBar outcomes={kpi.outcomes} />}
      </section>

      {/* Block 3 — agent table */}
      <section style={s.tableCard}>
        <div style={s.tableToolbar}>
          <div style={s.searchWrap}>
            <Search size={15} color="var(--color-text-tertiary)" />
            <input
              style={s.searchInput}
              placeholder="Search agents"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShown(PAGE); }}
            />
          </div>
          <span style={s.count}>Showing {visible.length} of {filtered.length} agents</span>
        </div>

        <div style={s.tableHead}>
          <span>#</span>
          <span>Agent</span>
          <span style={s.headRight}>Interactions<InfoTip text={kpi.interactionsTip} /></span>
          <span style={s.headRight}>{kpi.name}<InfoTip text={kpi.metricTip} /></span>
        </div>

        <div style={s.tableBody} onScroll={onScroll}>
          {visible.map((a, i) => {
            const zero = a.rag === null;
            return (
              <button
                key={a.id}
                type="button"
                style={{ ...s.row, opacity: zero ? 0.55 : 1 }}
                onClick={() => onSelectAgent(a)}
              >
                <span style={s.rank}>{i + 1}</span>
                <AgentCell name={a.name} initials={a.initials} muted={zero} />
                <span style={s.cellRight}>{zero ? "0" : a.interactions.toLocaleString()}</span>
                <span style={s.metricCell}>
                  {zero ? <span style={s.dash}>—</span> : (
                    <>
                      <span style={s.metricValue}>{a.value}{kpi.unit}</span>
                      <RagChip rag={a.rag} label={statusLabelFor(kpi, a.rag)} />
                    </>
                  )}
                </span>
              </button>
            );
          })}
          {fetching && <SkeletonRows count={3} />}
          {!filtered.length && <p style={s.empty}>No agents match “{query}”.</p>}
        </div>
      </section>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 18 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  titleWrap: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 },
  back: { flexShrink: 0, width: 30, height: 30, borderRadius: 8, border: "1px solid var(--color-divider-card)", background: "#fff", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  title: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)", margin: 0 },
  subtitle: { fontSize: 12, color: "var(--color-text-tertiary)", margin: "2px 0 0" },
  dateBadge: {
    flexShrink: 0, fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)",
    background: "var(--surface-alt)", borderRadius: 999, padding: "5px 12px",
  },
  statRow: { display: "flex", gap: 12 },
  outcomeCard: { border: "1px solid var(--color-divider-card)", borderRadius: 10, padding: "14px 16px" },
  outcomeToggle: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
    background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 12,
  },
  outcomeTitle: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  chevron: { fontSize: 12, color: "var(--color-text-tertiary)" },
  tableCard: { border: "1px solid var(--color-divider-card)", borderRadius: 10, overflow: "hidden" },
  tableToolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px" },
  searchWrap: {
    display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", flex: 1, maxWidth: 280,
    background: "var(--surface-alt)", borderRadius: 8,
  },
  searchInput: { border: "none", background: "none", outline: "none", fontSize: 13, width: "100%", fontFamily: "var(--font-sans)", color: "var(--color-text-deep)" },
  count: { fontSize: 12, color: "var(--color-text-tertiary)", whiteSpace: "nowrap" },
  tableHead: {
    display: "grid", gridTemplateColumns: "40px 1fr 120px 160px", alignItems: "center", gap: 12,
    padding: "8px 16px", background: "var(--surface-alt)", fontSize: 11, fontWeight: 700,
    color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em",
  },
  headRight: { display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: 2 },
  tableBody: { maxHeight: 360, overflowY: "auto" },
  row: {
    width: "100%", display: "grid", gridTemplateColumns: "40px 1fr 120px 160px", alignItems: "center", gap: 12,
    padding: "10px 16px", background: "none", border: "none", borderTop: "1px solid var(--color-divider-card)",
    cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)",
  },
  rank: { fontSize: 13, fontWeight: 700, color: "var(--color-text-tertiary)" },
  cellRight: { textAlign: "right", fontSize: 13, color: "var(--color-text-medium)" },
  metricCell: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  metricValue: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  dash: { color: "var(--color-text-placeholder)" },
  empty: { padding: "24px 16px", fontSize: 13, color: "var(--color-text-tertiary)", textAlign: "center" },
};
