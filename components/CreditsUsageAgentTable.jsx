"use client";

import React from "react";
import { Search, ChevronsLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Toggle from "./Toggle";
import Button from "./Button";
import { cadenceShort } from "./CreditsUsageParts";

// CreditsUsageAgentTable — per-agent override table shared by all three
// variants. An agent inherits their team's per-agent quota unless a custom
// limit is switched on. Self-contained search + pagination; the parent owns
// the agent list and mutation callbacks.

const PAGE_SIZE = 10;

export default function CreditsUsageAgentTable({
  agents,
  totalCount,
  search,
  onSearchChange,
  teamById,
  onToggleCustom,
  onSetLimit,
}) {
  const [page, setPage] = React.useState(1);

  // Reset to page 1 when the search term changes so filtered results
  // aren't hidden behind a stale page index (adjust during render, not in
  // an effect, to avoid a cascading re-render).
  const [prevSearch, setPrevSearch] = React.useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(agents.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = agents.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const goToPage = (next) => setPage(Math.min(Math.max(1, next), totalPages));

  return (
    <div style={atStyles.wrap}>
      <div style={atStyles.searchRow}>
        <label style={atStyles.searchWrap}>
          <Search size={14} color="var(--color-text-tertiary)" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or email…"
            aria-label="Search agents"
            style={atStyles.searchInput}
          />
        </label>
        <span style={atStyles.countBadge}>{totalCount} agents</span>
      </div>

      <div style={atStyles.tableWrap}>
        <table style={atStyles.table}>
          <thead>
            <tr>
              <th style={{ ...atStyles.th, width: "26%" }}>Name</th>
              <th style={{ ...atStyles.th, width: "30%" }}>Email</th>
              <th style={{ ...atStyles.th, width: "16%" }}>Team</th>
              <th style={{ ...atStyles.th, width: "12%", textAlign: "center" }}>Custom</th>
              <th style={{ ...atStyles.th, width: "16%" }}>Limit</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((agent) => {
              const team = teamById[agent.team];
              const teamDefault = team ? team.perAgent : agent.limit;
              const cad = team ? cadenceShort(team.cadence) : "/wk";
              return (
                <tr key={agent.id} style={atStyles.tr}>
                  <td style={atStyles.td}>
                    <span style={atStyles.agentName}>{agent.name}</span>
                  </td>
                  <td style={atStyles.td}>
                    <span style={atStyles.agentEmail}>{agent.email}</span>
                  </td>
                  <td style={atStyles.td}>
                    <span style={atStyles.agentTeam}>{team ? team.name : "—"}</span>
                  </td>
                  <td style={{ ...atStyles.td, textAlign: "center" }}>
                    <Toggle
                      enabled={agent.hasCustom}
                      onChange={() => onToggleCustom(agent.id)}
                      ariaLabel={`Override team quota for ${agent.name}`}
                    />
                  </td>
                  <td style={atStyles.td}>
                    {agent.hasCustom ? (
                      <label style={atStyles.miniInput}>
                        <input
                          type="number"
                          min={1}
                          value={agent.limit}
                          onChange={(e) => onSetLimit(agent.id, Number(e.target.value) || 0)}
                          aria-label={`Custom limit for ${agent.name}`}
                          style={atStyles.miniInputField}
                        />
                        <span style={atStyles.miniInputSuffix}>min{cad}</span>
                      </label>
                    ) : (
                      <span style={atStyles.defaultChip}>{teamDefault} min{cad}</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {agents.length === 0 && (
              <tr>
                <td colSpan={5} style={{ ...atStyles.td, textAlign: "center", color: "var(--color-text-tertiary)" }}>
                  No agents match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {agents.length > PAGE_SIZE && (
          <div style={atStyles.pageFooter}>
            <div style={atStyles.pageCtrls}>
              <PageBtn ariaLabel="First page" disabled={safePage <= 1} onClick={() => goToPage(1)}>
                <ChevronsLeft size={16} />
              </PageBtn>
              <span style={atStyles.pageLabel} aria-live="polite">
                Page {safePage} of {totalPages}
              </span>
              <PageBtn ariaLabel="Previous page" disabled={safePage <= 1} onClick={() => goToPage(safePage - 1)}>
                <ChevronLeft size={16} />
              </PageBtn>
              <PageBtn ariaLabel="Next page" disabled={safePage >= totalPages} onClick={() => goToPage(safePage + 1)}>
                <ChevronRight size={16} />
              </PageBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PageBtn({ children, onClick, disabled, ariaLabel }) {
  return (
    <Button variant="icon" size="sm" aria-label={ariaLabel} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  );
}

const atStyles = {
  wrap: { display: "flex", flexDirection: "column", gap: 14 },
  searchRow: { display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between" },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
    maxWidth: 320,
    padding: "7px 12px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
    cursor: "text",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-deep)",
    background: "transparent",
  },
  countBadge: {
    padding: "3px 10px",
    borderRadius: 999,
    background: "#F3F4F6",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    whiteSpace: "nowrap",
  },
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
  td: { padding: "10px 14px", verticalAlign: "middle" },
  agentName: { fontWeight: 600, color: "var(--color-text-deep)", fontSize: 13 },
  agentEmail: { fontWeight: 400, color: "var(--color-text-tertiary)", fontSize: 12 },
  agentTeam: { fontWeight: 500, color: "var(--color-text-medium)", fontSize: 12 },
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
  defaultChip: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    background: "#F3F4F6",
    color: "var(--color-text-tertiary)",
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  pageFooter: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "10px 14px",
    borderTop: "1px solid var(--color-border-card-soft)",
  },
  pageCtrls: { display: "flex", alignItems: "center", gap: 8 },
  pageLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    padding: "0 4px",
    fontVariantNumeric: "tabular-nums",
  },
};
