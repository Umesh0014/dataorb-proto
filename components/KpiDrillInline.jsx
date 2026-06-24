"use client";

import React from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import KpiSidecarLayer1 from "./KpiSidecarLayer1";
import KpiSidecarLayer2 from "./KpiSidecarLayer2";
import KpiSidecarLayer3 from "./KpiSidecarLayer3";

// Approach #3 — expand-in-place drill. One footprint hosts L1 → L2 → L3,
// headed by a breadcrumb (`KPI ▸ Agent ▸ Week`) with a small ← arrow that
// steps back one level (and closes at L1). State lives here.
export default function KpiDrillInline({ kpi, onClose }) {
  // Two drill paths off L1: a Week-over-Week row → week detail (L2), or the
  // "Outcome Insights" action → outcome insights (L3).
  const [week, setWeek] = React.useState(null);
  const [action, setAction] = React.useState(null);

  const crumbs = [{ label: kpi.name, go: () => { setWeek(null); setAction(null); } }];
  if (week) crumbs.push({ label: week.name, go: () => {} });
  if (action) crumbs.push({ label: action, go: () => {} });

  const goBack = () => {
    if (week) setWeek(null);
    else if (action) setAction(null);
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
      {!week && !action && <p style={s.subtitle}>{kpi.subtitle}</p>}

      {week ? (
        <KpiSidecarLayer2 kpi={kpi} agent={week} />
      ) : action === "Outcome Insights" ? (
        <KpiSidecarLayer3 kpi={kpi} />
      ) : (
        <KpiSidecarLayer1 kpi={kpi} onSelectAgent={setWeek} onAction={setAction} />
      )}
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 14 },
  bar: { display: "flex", alignItems: "center", gap: 8 },
  arrow: { display: "inline-flex", alignItems: "center", justifyContent: "center", border: "none", background: "none", padding: 2, cursor: "pointer", color: "var(--color-text-medium)" },
  crumbs: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  crumb: { border: "none", background: "none", cursor: "pointer", padding: 0, fontSize: 16, fontWeight: 500, lineHeight: "24px", color: "var(--do-brand-blue)", fontFamily: "var(--font-sans)" },
  crumbActive: { color: "#171B2C", fontWeight: 600, cursor: "default" },
  subtitle: { fontSize: 12, fontWeight: 400, lineHeight: "18px", color: "#5B5E6F", margin: "-4px 0 0 28px", fontFamily: "var(--font-sans)" },
};
