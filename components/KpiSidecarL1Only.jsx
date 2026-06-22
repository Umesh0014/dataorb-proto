"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import KpiSidecarTrend from "./KpiSidecarTrend";
import {
  AgentCell, OutcomeBar, RagChip, StatPill,
  gapFor, rule, sortAgents, statusLabelFor,
} from "./KpiSidecarParts";

// Variant B — L1-only (exploration). Everything reachable from Layer 1 with
// no deep back-nav: the stats + outcomes + agent table stay, and the per-agent
// trend (the L2 essential) collapses inline under the selected row instead of
// pushing a new panel. Shares the same config + data layer as Standard.
export default function KpiSidecarL1Only({ kpi }) {
  const sorted = React.useMemo(() => sortAgents(kpi), [kpi]);
  const [openId, setOpenId] = React.useState(null);
  const r = rule(kpi);
  const gap = gapFor(kpi);

  return (
    <div style={s.wrap}>
      <header style={s.header}>
        <div>
          <h2 style={s.title}>{kpi.name}</h2>
          <p style={s.subtitle}>{kpi.subtitle}</p>
        </div>
        <span style={s.dateBadge}>{kpi.dateRange}</span>
      </header>

      <div style={s.statRow}>
        <StatPill label="Total" value={kpi.total.toLocaleString()} sub="interactions" />
        <StatPill label="Campaign Rate" value={`${kpi.campaignRate}${kpi.unit}`} rag={kpi.campaignRate >= kpi.target ? "green" : "red"} trend={kpi.campaignRate >= kpi.target ? "up" : "down"} />
        <StatPill label="Target" value={kpi.target == null ? "—" : `${kpi.target}${kpi.unit}`} />
        {!gap.hidden && <StatPill label="Gap" value={gap.value} tone={gap.tone} />}
      </div>

      <section style={s.block}>
        <span style={s.blockTitle}>Outcome distribution</span>
        <OutcomeBar outcomes={kpi.outcomes} />
      </section>

      <section style={s.block}>
        <span style={s.blockTitle}>Agents — tap to expand trend</span>
        <div style={s.list}>
          {sorted.slice(0, 12).map((a, i) => {
            const zero = a.rag === null;
            const open = openId === a.id;
            return (
              <div key={a.id} style={s.rowWrap}>
                <button
                  type="button"
                  style={{ ...s.row, opacity: zero ? 0.55 : 1 }}
                  onClick={() => !zero && setOpenId(open ? null : a.id)}
                >
                  <span style={s.rank}>{i + 1}</span>
                  <AgentCell name={a.name} initials={a.initials} muted={zero} />
                  <span style={s.metricCell}>
                    {zero ? <span style={s.dash}>—</span> : (
                      <>
                        <span style={s.metricValue}>{a.value}{kpi.unit}</span>
                        <RagChip rag={a.rag} label={statusLabelFor(kpi, a.rag)} />
                        <ChevronDown size={15} color="var(--color-text-tertiary)" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
                      </>
                    )}
                  </span>
                </button>
                {open && (
                  <div style={s.expand}>
                    <KpiSidecarTrend data={kpi.trend} target={kpi.target} unit={kpi.unit} lowerIsBetter={!r.higherIsBetter} height={170} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 18 },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 18, fontWeight: 800, color: "var(--color-text-deep)", margin: 0 },
  subtitle: { fontSize: 13, color: "var(--color-text-tertiary)", margin: "4px 0 0" },
  dateBadge: { flexShrink: 0, fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)", background: "var(--surface-alt)", borderRadius: 999, padding: "5px 12px" },
  statRow: { display: "flex", gap: 12 },
  block: { border: "1px solid var(--color-divider-card)", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 },
  blockTitle: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  list: { display: "flex", flexDirection: "column" },
  rowWrap: { borderTop: "1px solid var(--color-divider-card)" },
  row: { width: "100%", display: "grid", gridTemplateColumns: "40px 1fr auto", alignItems: "center", gap: 12, padding: "10px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)" },
  rank: { fontSize: 13, fontWeight: 700, color: "var(--color-text-tertiary)" },
  metricCell: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 },
  metricValue: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  dash: { color: "var(--color-text-placeholder)" },
  expand: { padding: "4px 0 14px" },
};
