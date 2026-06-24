"use client";

import React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, Phone, Info } from "lucide-react";
import { OutcomeBar, RagChip, SkeletonRows, sortAgents, statusLabelFor, rule, InfoTip } from "./KpiSidecarParts";

const PAGE = 20;
const FETCH_MS = 650;
const POPPINS = "'Poppins', sans-serif";
// Metric pill tints per RAG (matches the Figma sidecar table).
const PILL = {
  green: { bg: "#F1FEF5", fg: "#00711D" },
  amber: { bg: "#FFFBF5", fg: "#8C620E" },
  red: { bg: "#FEF2F2", fg: "#BA1A1A" },
};

// Layer 1 — sidecar overview (Figma node 1887-70681). A summary card (headline
// rate + trend + outcome breakdown + segmented bar + legend) over a compact
// agents table (avatar · interactions · metric pill · call). Header/back is
// owned by KpiDrillInline; this is the body.
export default function KpiSidecarLayer1({ kpi, onSelectAgent }) {
  const sorted = React.useMemo(() => sortAgents(kpi), [kpi]);
  const [shown, setShown] = React.useState(PAGE);
  const [fetching, setFetching] = React.useState(false);
  // PRD default sort: Type A/D ascending by value (worst first); Type C
  // descending by value (highest effort first); Type E descending by volume.
  const [sort, setSort] = React.useState(() =>
    kpi.kpiType === "E" ? { col: "interactions", dir: "desc" }
      : kpi.kpiType === "C" ? { col: "value", dir: "desc" }
        : { col: "value", dir: "asc" });
  const toggleSort = (col) => setSort((s) => (!s || s.col !== col)
    ? { col, dir: "desc" } : s.dir === "desc" ? { col, dir: "asc" } : null);

  const displayed = React.useMemo(() => {
    if (!sort) return sorted;
    const zeros = sorted.filter((a) => a.rag === null);
    const live = sorted.filter((a) => a.rag !== null)
      .sort((a, b) => (sort.dir === "asc" ? a[sort.col] - b[sort.col] : b[sort.col] - a[sort.col]));
    return [...live, ...zeros];
  }, [sorted, sort]);
  const visible = displayed.slice(0, shown);
  const hasMore = shown < displayed.length;

  const onScroll = (e) => {
    if (fetching || !hasMore) return;
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 48) {
      setFetching(true);
      window.setTimeout(() => { setShown((n) => n + PAGE); setFetching(false); }, FETCH_MS);
    }
  };

  // Type-aware headline RAG: Type C (lower-is-better) inverts the comparison;
  // Type E (no target) shows a neutral chip and hides the gap pill.
  const r = rule(kpi);
  const noTarget = kpi.target == null;
  const rateRag = noTarget ? "amber"
    : ((r.higherIsBetter ? kpi.campaignRate >= kpi.target : kpi.campaignRate <= kpi.target) ? "green" : "red");
  const delta = noTarget ? null : +(kpi.campaignRate - kpi.target).toFixed(1);

  return (
    <div style={s.wrap}>
      {/* Summary card */}
      <div style={s.summary}>
        <div style={s.sumTop}>
          <div style={s.rateRow}>
            <span style={s.rate}>{kpi.campaignRate}{kpi.unit}</span>
            <RagChip rag={rateRag} label={statusLabelFor(kpi, rateRag)} />
          </div>
          <div style={s.metaRow}>
            <span style={s.meta}><strong style={s.metaStrong}>{kpi.total.toLocaleString()}</strong> interactions · Target {noTarget ? "—" : `${kpi.target}${kpi.unit}`}</span>
            {!noTarget && (
              <span style={{ ...s.trendPill, background: PILL[rateRag].bg, color: PILL[rateRag].fg }}>
                {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}{kpi.unit === "%" ? "pp" : ""}
              </span>
            )}
            {kpi.gapVolumeLabel && rateRag === "red" && (
              <span style={s.gapVol}>≈ ~{Math.round(Math.abs(delta) * kpi.total / 100).toLocaleString()} {kpi.gapVolumeLabel}</span>
            )}
          </div>
        </div>
        <div style={s.sumBottom}>
          <span style={s.sectionLabel}>Outcome breakdown</span>
          <OutcomeBar outcomes={kpi.outcomes} />
        </div>
      </div>

      {/* Agents */}
      <span style={s.agentsLabel}>Agents</span>
      {kpi.mixedPopulation && (
        <div style={s.callout}><Info size={14} color="#5B5E6F" style={{ flexShrink: 0, marginTop: 1 }} />{kpi.mixedPopulation}</div>
      )}
      <div style={s.table}>
        <div style={s.thead}>
          <span style={s.thAgent}>Agent</span>
          <span style={s.thNum}>Interactions{kpi.interactionsTip && <InfoTip text={kpi.interactionsTip} />}<SortControl col="interactions" sort={sort} onToggle={toggleSort} /></span>
          <span style={s.thMetric}>{kpi.name}{kpi.metricTip && <InfoTip text={kpi.metricTip} />}<SortControl col="value" sort={sort} onToggle={toggleSort} /></span>
          <span style={s.thIcon} />
        </div>
        <div style={s.tbody} onScroll={onScroll}>
          {visible.map((a) => {
            const zero = a.rag === null;
            const pill = PILL[a.rag] || PILL.amber;
            return (
              <button key={a.id} type="button" style={{ ...s.row, opacity: zero ? 0.55 : 1 }} onClick={() => onSelectAgent(a)}>
                <span style={s.tdAgent}>
                  <span style={s.avatar} aria-hidden="true">{a.initials}</span>
                  <span style={s.aname}>{a.name}</span>
                </span>
                <span style={s.tdNum}>{zero ? "0" : a.interactions.toLocaleString()}</span>
                <span style={s.tdMetric}>
                  {zero ? <span style={s.dash}>—</span> : (
                    <span style={{ ...s.pill, background: pill.bg, color: pill.fg }}>{a.value}{kpi.unit}</span>
                  )}
                </span>
                <span style={s.tdIcon}><Phone size={17} color="var(--color-text-tertiary)" /></span>
              </button>
            );
          })}
          {fetching && <SkeletonRows count={3} />}
        </div>
      </div>
    </div>
  );
}

function SortControl({ col, sort, onToggle }) {
  const active = sort?.col === col;
  const Icon = !active ? ChevronsUpDown : sort.dir === "desc" ? ArrowDown : ArrowUp;
  return (
    <button type="button" style={s.sortBtn} onClick={() => onToggle(col)} aria-label={`Sort by ${col}`}>
      <Icon size={13} color={active ? "var(--do-brand-blue)" : "var(--color-text-placeholder)"} />
    </button>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 16, fontFamily: POPPINS },
  summary: { background: "#FCFBFF", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 16 },
  sumTop: { display: "flex", flexDirection: "column", gap: 8, paddingBottom: 16, borderBottom: "1px solid #EFEFFF" },
  rateRow: { display: "flex", alignItems: "center", gap: 10 },
  rate: { fontSize: 24, fontWeight: 700, color: "#2C2F42", lineHeight: 1 },
  metaRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" },
  meta: { fontSize: 12, color: "#5B5E6F", letterSpacing: "0.4px" },
  metaStrong: { color: "#2C2F42", fontWeight: 700 },
  trendPill: { display: "inline-flex", alignItems: "center", gap: 3, height: 22, padding: "0 6px", borderRadius: 4, fontSize: 11, fontWeight: 600 },
  sumBottom: { display: "flex", flexDirection: "column", gap: 10 },
  sectionLabel: { fontSize: 14, fontWeight: 500, color: "#5B5E6F", letterSpacing: "0.1px" },
  agentsLabel: { fontSize: 14, fontWeight: 500, color: "#5B5E6F", letterSpacing: "0.1px" },
  gapVol: { fontSize: 11, fontWeight: 600, color: "#BA1A1A" },
  callout: { display: "flex", alignItems: "flex-start", gap: 8, background: "#F7F8FC", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#5B5E6F", lineHeight: 1.45 },
  table: { border: "1px solid #EFEFFF", borderRadius: 8, overflow: "hidden" },
  thead: { display: "grid", gridTemplateColumns: "1fr 112px 110px 40px", alignItems: "center", height: 40, background: "#FCFBFF", padding: "0 4px" },
  thAgent: { padding: "0 12px", fontSize: 11, fontWeight: 600, color: "#5B5E6F", letterSpacing: "0.5px" },
  thNum: { padding: "0 8px", display: "inline-flex", alignItems: "center", justifyContent: "flex-start", fontSize: 11, fontWeight: 600, color: "#5B5E6F", letterSpacing: "0.5px" },
  thMetric: { padding: "0 8px", display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, color: "#5B5E6F", letterSpacing: "0.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  thIcon: {},
  tbody: { maxHeight: 360, overflowY: "auto" },
  row: { width: "100%", display: "grid", gridTemplateColumns: "1fr 112px 110px 40px", alignItems: "center", background: "#fff", border: "none", borderTop: "1px solid #F4F4FB", cursor: "pointer", textAlign: "left", fontFamily: POPPINS },
  tdAgent: { display: "flex", alignItems: "center", gap: 10, minWidth: 0, padding: "14px 12px" },
  avatar: { width: 24, height: 24, borderRadius: 999, background: "#DDE1FF", color: "#6650A5", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "'Lato', sans-serif", fontSize: 11 },
  aname: { fontSize: 13, fontWeight: 600, color: "#2C2F42", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  tdNum: { padding: "14px 12px", fontSize: 14, fontWeight: 600, color: "#2C2F42" },
  tdMetric: { padding: "14px 12px" },
  pill: { display: "inline-flex", alignItems: "center", height: 24, padding: "0 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, letterSpacing: "0.5px" },
  dash: { color: "var(--color-text-placeholder)" },
  tdIcon: { display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 0" },
  sortBtn: { display: "inline-flex", alignItems: "center", border: "none", background: "none", padding: 2, marginLeft: 2, cursor: "pointer" },
};
