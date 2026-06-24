"use client";

import React from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import KpiSidecarLayer1 from "./KpiPrdLayer1";
import KpiSidecarLayer2 from "./KpiPrdLayer2";
import KpiSidecarLayer3 from "./KpiPrdLayer3";

// Approach #3 — expand-in-place drill. One footprint hosts L1 → L2 → L3,
// headed by a breadcrumb (`KPI ▸ Agent ▸ Week`) with a small ← arrow that
// steps back one level (and closes at L1). State lives here.
export default function KpiDrillInline({ kpi, onClose }) {
  const [agent, setAgent] = React.useState(null);
  const [week, setWeek] = React.useState(null);

  const crumbs = [{ label: kpi.name, go: () => { setAgent(null); setWeek(null); } }];
  if (agent) crumbs.push({ label: agent.name, go: () => setWeek(null) });
  if (week) crumbs.push({ label: week, go: () => {} });

  const goBack = () => {
    if (week) setWeek(null);
    else if (agent) setAgent(null);
    else onClose?.();
  };

  return (
    <div style={s.wrap}>
      <div style={s.bar}>
        <button type="button" style={s.arrow} onClick={goBack} aria-label="Back">
          <ArrowLeft size={16} />
        </button>
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
      </div>
      {!agent && <p style={s.subtitle}>{kpi.subtitle}</p>}

      {agent && week ? (
        <KpiSidecarLayer3 kpi={kpi} agent={agent} week={week} hideBack />
      ) : agent ? (
        <KpiSidecarLayer2 kpi={kpi} agent={agent} hideBack onSelectWeek={setWeek} />
      ) : (
        <KpiSidecarLayer1 kpi={kpi} onSelectAgent={setAgent} hideHeader />
      )}
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 14 },
  bar: { display: "flex", alignItems: "center", gap: 8 },
  arrow: { display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", padding: 2, cursor: "pointer", color: "var(--color-text-medium)" },
  crumbs: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  crumb: { border: "none", background: "none", cursor: "pointer", padding: 0, fontSize: 13, fontWeight: 600, color: "var(--do-brand-blue)", fontFamily: "'Poppins', sans-serif" },
  crumbActive: { color: "var(--color-text-deep)", fontWeight: 700, cursor: "default" },
  subtitle: { fontSize: 12, color: "var(--color-text-tertiary)", margin: "-6px 0 0 28px" },
};
