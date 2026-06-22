"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import TabsRow from "./TabsRow";
import KpiSidecarTrend from "./KpiSidecarTrend";
import { AgentCell } from "./KpiSidecarParts";
import { rule } from "./KpiSidecarParts";

// Layer 2 — agent drill: 3 comparison pills + trend chart + WoW tabs
// (Week by Week | By Outcome). Selecting a week opens Layer 3.
export default function KpiSidecarLayer2({ kpi, agent, onBack, onSelectWeek, hideBack = false }) {
  const [tab, setTab] = React.useState("weeks");
  const r = rule(kpi);
  const orgAvg = kpi.campaignRate;
  const diff = +(agent.value - orgAvg).toFixed(1);
  const gapTone = (r.higherIsBetter ? diff >= 0 : diff <= 0) ? "green" : "red";

  return (
    <div style={s.wrap}>
      {!hideBack && (
        <button type="button" style={s.back} onClick={onBack}>
          <ArrowLeft size={15} /> All agents
        </button>
      )}

      <div style={s.headRow}>
        <AgentCell name={agent.name} initials={agent.initials} />
        <span style={s.kpiTag}>{kpi.name}</span>
      </div>

      <div style={s.pills}>
        <Pill label="This agent" value={`${agent.value}${kpi.unit}`} />
        <Pill label="Org avg" value={`${orgAvg}${kpi.unit}`} />
        <Pill
          label="Gap"
          value={`${diff >= 0 ? "▲" : "▼"} ${Math.abs(diff)}${kpi.unit === "%" ? "pp" : kpi.unit}`}
          tone={gapTone}
        />
      </div>

      <section style={s.chartCard}>
        <KpiSidecarTrend
          data={kpi.trend}
          target={kpi.target}
          unit={kpi.unit}
          lowerIsBetter={!r.higherIsBetter}
        />
      </section>

      <TabsRow
        tabs={[
          { id: "weeks", label: "Week by Week" },
          { id: "outcome", label: "By Outcome" },
        ]}
        activeTab={tab}
        onTabClick={setTab}
      />

      {tab === "weeks" ? (
        <div style={s.weekGrid}>
          {kpi.trend.map((w) => {
            const empty = w.agent == null;
            return (
              <button
                key={w.week}
                type="button"
                disabled={empty}
                style={{ ...s.weekCell, opacity: empty ? 0.5 : 1, cursor: empty ? "default" : "pointer" }}
                onClick={() => !empty && onSelectWeek(w.week)}
              >
                <span style={s.weekLabel}>{w.week}</span>
                <span style={s.weekValue}>{empty ? "—" : `${w.agent}${kpi.unit}`}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={s.outcomeTable}>
          <div style={s.outRowHead}><span>Outcome</span><span style={s.right}>Share</span></div>
          {kpi.outcomes.map((o) => (
            <div key={o.key} style={s.outRow}>
              <span style={s.outLabel}><span style={{ ...s.dot, background: o.color }} />{o.label}</span>
              <span style={s.right}>{o.pct}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Pill({ label, value, tone }) {
  const color = tone === "green" ? "#00711D" : tone === "red" ? "#BA1A1A" : "var(--color-text-deep)";
  return (
    <div style={s.pill}>
      <span style={s.pillLabel}>{label}</span>
      <span style={{ ...s.pillValue, color }}>{value}</span>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 16 },
  back: { display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", fontFamily: "var(--font-sans)" },
  headRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  kpiTag: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", background: "var(--surface-alt)", borderRadius: 999, padding: "4px 10px" },
  pills: { display: "flex", gap: 12 },
  pill: { flex: 1, display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px", background: "var(--surface-alt)", borderRadius: 10 },
  pillLabel: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },
  pillValue: { fontSize: 18, fontWeight: 800 },
  chartCard: { border: "1px solid var(--color-divider-card)", borderRadius: 10, padding: "12px 8px 8px" },
  weekGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 },
  weekCell: { display: "flex", flexDirection: "column", gap: 4, alignItems: "center", padding: "12px 8px", border: "1px solid var(--color-divider-card)", borderRadius: 8, background: "none", fontFamily: "var(--font-sans)" },
  weekLabel: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },
  weekValue: { fontSize: 16, fontWeight: 800, color: "var(--color-text-deep)" },
  outcomeTable: { border: "1px solid var(--color-divider-card)", borderRadius: 8, overflow: "hidden" },
  outRowHead: { display: "flex", justifyContent: "space-between", padding: "8px 14px", background: "var(--surface-alt)", fontSize: 11, fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" },
  outRow: { display: "flex", justifyContent: "space-between", padding: "10px 14px", borderTop: "1px solid var(--color-divider-card)", fontSize: 13, color: "var(--color-text-medium)" },
  outLabel: { display: "inline-flex", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 2 },
  right: { textAlign: "right", fontWeight: 700, color: "var(--color-text-deep)" },
};
