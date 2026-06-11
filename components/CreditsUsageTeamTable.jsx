"use client";

import React from "react";
import { CapacityBar, CompositionBadge, CadenceSelect, cadenceShort } from "./CreditsUsageParts";

// CreditsUsageTeamTable — editable team-quota grid shared by the stacked
// form (A) and the guided stepper (B). Credit sits at the tenant; quota is
// distributed here per team, with cadence and per-agent allowance editable
// inline because tenured vs new teams consume very differently. (Variant C
// renders the same model as a card grid instead.)

export default function CreditsUsageTeamTable({ teams, onCadence, onPerAgent }) {
  return (
    <div style={ttStyles.tableWrap}>
      <table style={ttStyles.table}>
        <thead>
          <tr>
            <th style={{ ...ttStyles.th, width: "26%" }}>Team</th>
            <th style={{ ...ttStyles.th, width: "14%" }}>Agents</th>
            <th style={{ ...ttStyles.th, width: "24%" }}>Cadence</th>
            <th style={{ ...ttStyles.th, width: "16%" }}>Per agent</th>
            <th style={{ ...ttStyles.th, width: "20%" }}>Used this period</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id} style={ttStyles.tr}>
              <td style={ttStyles.td}>
                <div style={ttStyles.teamCell}>
                  <span style={ttStyles.teamName}>{team.name}</span>
                  <CompositionBadge composition={team.composition} />
                </div>
              </td>
              <td style={ttStyles.td}>
                <span style={ttStyles.agentCount}>{team.tenured + team.newAgents}</span>
                <span style={ttStyles.agentSplit}>
                  {team.tenured} tenured · {team.newAgents} new
                </span>
              </td>
              <td style={ttStyles.td}>
                <CadenceSelect
                  value={team.cadence}
                  onChange={(c) => onCadence(team.id, c)}
                  ariaLabel={`Quota cadence for ${team.name}`}
                />
              </td>
              <td style={ttStyles.td}>
                <label style={ttStyles.miniInput}>
                  <input
                    type="number"
                    min={1}
                    value={team.perAgent}
                    onChange={(e) => onPerAgent(team.id, Number(e.target.value) || 0)}
                    aria-label={`Per-agent quota for ${team.name}`}
                    style={ttStyles.miniInputField}
                  />
                  <span style={ttStyles.miniInputSuffix}>min{cadenceShort(team.cadence)}</span>
                </label>
              </td>
              <td style={ttStyles.td}>
                <div style={ttStyles.usageCell}>
                  <span style={ttStyles.usageLabel}>
                    {team.used.toLocaleString()} / {team.allocated.toLocaleString()} min
                  </span>
                  <CapacityBar used={team.used} total={team.allocated} height={6} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const ttStyles = {
  tableWrap: {
    borderRadius: 8,
    border: "1px solid var(--color-border-card-soft)",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "10px 14px",
    fontWeight: 600,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.3px",
    color: "var(--color-text-tertiary)",
    background: "#FAFBFC",
    borderBottom: "1px solid var(--color-border-card-soft)",
    textAlign: "left",
  },
  tr: { borderBottom: "1px solid #F5F5F7" },
  td: { padding: "12px 14px", verticalAlign: "middle" },
  teamCell: { display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" },
  teamName: { fontWeight: 600, color: "var(--color-text-deep)", fontSize: 13 },
  agentCount: {
    display: "block",
    fontWeight: 700,
    color: "var(--color-text-deep)",
    fontSize: 14,
    fontVariantNumeric: "tabular-nums",
  },
  agentSplit: { fontSize: 11, color: "var(--color-text-tertiary)" },
  miniInput: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
  },
  miniInputField: {
    width: 52,
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    background: "transparent",
    appearance: "textfield",
  },
  miniInputSuffix: { fontSize: 11, color: "var(--color-text-tertiary)", whiteSpace: "nowrap" },
  usageCell: { display: "flex", flexDirection: "column", gap: 6 },
  usageLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-medium)",
    fontVariantNumeric: "tabular-nums",
  },
};
