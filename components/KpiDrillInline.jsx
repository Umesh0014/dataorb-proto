"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import KpiSidecarLayer1 from "./KpiSidecarLayer1";
import KpiSidecarLayer2 from "./KpiSidecarLayer2";
import KpiSidecarLayer3 from "./KpiSidecarLayer3";

// Approach #3 — expand-in-place drill. The same footprint hosts L1 → L2 → L3,
// navigated by a `KPI ▸ Agent ▸ Week` breadcrumb (no drawer, no modal). State
// lives here so a parent only has to mount it for the selected KPI.
export default function KpiDrillInline({ kpi, onClose }) {
  const [agent, setAgent] = React.useState(null);
  const [week, setWeek] = React.useState(null);

  const crumbs = [{ label: kpi.name, go: () => { setAgent(null); setWeek(null); } }];
  if (agent) crumbs.push({ label: agent.name, go: () => setWeek(null) });
  if (week) crumbs.push({ label: week, go: () => {} });

  return (
    <div style={s.wrap}>
      <div style={s.bar}>
        <nav style={s.crumbs}>
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <React.Fragment key={c.label}>
                {i > 0 && <ChevronRight size={13} color="var(--color-text-placeholder)" />}
                <button type="button" disabled={last} onClick={c.go}
                  style={{ ...s.crumb, ...(last ? s.crumbActive : null) }}>
                  {c.label}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
        {onClose && <button type="button" style={s.close} onClick={onClose}>Close</button>}
      </div>

      {agent && week ? (
        <KpiSidecarLayer3 kpi={kpi} agent={agent} week={week} hideBack />
      ) : agent ? (
        <KpiSidecarLayer2 kpi={kpi} agent={agent} hideBack onSelectWeek={setWeek} />
      ) : (
        <KpiSidecarLayer1 kpi={kpi} onSelectAgent={setAgent} />
      )}
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 16 },
  bar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingBottom: 12, borderBottom: "1px solid var(--color-divider-card)" },
  crumbs: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  crumb: { border: "none", background: "none", cursor: "pointer", padding: 0, fontSize: 13, fontWeight: 600, color: "var(--do-brand-blue)", fontFamily: "var(--font-sans)" },
  crumbActive: { color: "var(--color-text-deep)", fontWeight: 700, cursor: "default" },
  close: { border: "none", background: "var(--surface-alt)", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, color: "var(--color-text-medium)", cursor: "pointer", fontFamily: "var(--font-sans)" },
};
