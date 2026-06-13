"use client";

import React from "react";
import StatCard from "./StatCard";
import { TEAM_KPIS, TEAM_CONTEXT } from "./mocks/commandCenter";

// CommandCenterTeamStrip — the shared top band for all three Command Center
// variants. Keeps identity (who/where: the team + lead) separate from the
// metrics snapshot below it (UI-7). The KPI tiles reuse StatCard (size md);
// every value carries a label + unit and trend sublabels pair an arrow glyph
// with text, never colour alone.
//
//   subtitle  optional override for the second identity line (a variant can
//             pass the active grouping/scope here without forking the strip).
export default function CommandCenterTeamStrip({ subtitle }) {
  return (
    <div style={stripStyles.wrap}>
      <div style={stripStyles.identity}>
        <h1 style={stripStyles.title}>Command Center</h1>
        <p style={stripStyles.context}>
          {subtitle || `${TEAM_CONTEXT.team} · ${TEAM_CONTEXT.lead} (you) · coach by exception`}
        </p>
      </div>
      <div style={stripStyles.kpiRow}>
        {TEAM_KPIS.map((k) => (
          <StatCard key={k.id} size="md" label={k.label} value={k.value} sublabel={k.sublabel} />
        ))}
      </div>
    </div>
  );
}

const stripStyles = {
  wrap: { display: "flex", flexDirection: "column", gap: 16 },
  identity: { display: "flex", flexDirection: "column", gap: 4 },
  title: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 24,
    fontWeight: 800,
    color: "var(--color-text-deep)",
    lineHeight: 1.2,
  },
  context: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 400,
    color: "var(--text-secondary)",
  },
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
  },
};
