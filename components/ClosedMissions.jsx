"use client";

import React from "react";
import { ChevronsLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

const PAGE_SIZE = 8;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const COLS = [
  { key: "title", label: "Closed Missions", width: "36%" },
  { key: "target", label: "Target", width: "16%" },
  { key: "roleplays", label: "Roleplays", width: "14%" },
  { key: "closingDate", label: "Closing Date", width: "18%" },
  { key: "completionStatus", label: "Completion Status", width: "16%" },
];

// ClosedMissions — Closed Missions view of the Missions card: a three-tile
// metric strip above a paginated table. Table + pagination mirror the
// ContactDriverTable pattern.
export default function ClosedMissions({ metrics, rows }) {
  const [page, setPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const goToPage = (next) => setPage(Math.min(Math.max(1, next), totalPages));

  return (
    <div style={cmStyles.wrap}>
      <div style={cmStyles.metricStrip}>
        <MetricTile label="Closed Missions" value={String(metrics.closedMissionsTotal)} />
        <MetricTile
          label="Total Roleplays"
          value={`${metrics.totalRoleplays.completed}/${metrics.totalRoleplays.total}`}
        />
        <MetricTile
          label="Targets Achieved"
          value={`${metrics.targetsAchieved.met}/${metrics.targetsAchieved.total}`}
        />
      </div>

      <div>
        <table style={cmStyles.table}>
          <colgroup>
            {COLS.map((c) => (
              <col key={c.key} style={{ width: c.width }} />
            ))}
          </colgroup>
          <thead>
            <tr style={cmStyles.headRow}>
              {COLS.map((c) => (
                <th key={c.key} scope="col" style={cmStyles.th}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <Row key={row.id} row={row} isLast={i === pageRows.length - 1} />
            ))}
          </tbody>
        </table>

        <div style={cmStyles.footer}>
          <div style={cmStyles.total}>
            {pageRows.length} of {rows.length} closed missions
          </div>
          <div style={cmStyles.ctrls}>
            <PageBtn ariaLabel="First page" disabled={safePage <= 1} onClick={() => goToPage(1)}>
              <ChevronsLeft size={16} />
            </PageBtn>
            <span style={cmStyles.pageLabel} aria-live="polite">
              Page {safePage} of {totalPages}
            </span>
            <PageBtn ariaLabel="Previous page" disabled={safePage <= 1} onClick={() => goToPage(safePage - 1)}>
              <ChevronLeft size={16} />
            </PageBtn>
            <PageBtn ariaLabel="Next page" disabled={safePage >= totalPages} onClick={() => goToPage(safePage + 1)}>
              <ChevronRight size={16} />
            </PageBtn>
            {/* No last-page button — mirrors the AgentsPage pagination. */}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, value }) {
  return (
    <div style={cmStyles.tile}>
      <div style={cmStyles.tileLabel}>{label}</div>
      <div style={cmStyles.tileValue}>{value}</div>
    </div>
  );
}

function Row({ row, isLast }) {
  const [hover, setHover] = React.useState(false);
  return (
    <tr
      onClick={() => {
        // TODO: drill into closed mission detail
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...cmStyles.row,
        borderBottom: isLast ? "none" : "1px solid var(--table-row-border)",
        background: hover ? "var(--table-row-hover)" : "transparent",
      }}
    >
      <Cell>
        <span style={cmStyles.nameText}>{row.title}</span>
      </Cell>
      <Cell>
        <TargetPill status={row.target} />
      </Cell>
      <Cell>
        <span style={cmStyles.cellText}>{row.roleplays}</span>
      </Cell>
      <Cell>
        <span style={cmStyles.cellText}>{formatClosingDate(row.closingDate)}</span>
      </Cell>
      <Cell>
        {/* TODO: confirm closing-state vocabulary — "Completion Status"
            (Closed / Expired / Completed) used; an earlier mockup used
            "Closing Type" (Archived / Deadline / Completion). */}
        <span style={cmStyles.cellText}>{capitalize(row.completionStatus)}</span>
      </Cell>
    </tr>
  );
}

function Cell({ children }) {
  return <td style={cmStyles.cell}>{children}</td>;
}

function TargetPill({ status }) {
  const met = status === "met";
  return (
    <span
      style={{
        ...cmStyles.pill,
        background: met ? "var(--color-success-bg)" : "var(--color-error-bg)",
        color: met ? "var(--color-success)" : "var(--color-error)",
      }}
    >
      {met ? "Met" : "Below"}
    </span>
  );
}

function PageBtn({ children, onClick, disabled, ariaLabel }) {
  return (
    <Button variant="icon" size="sm" aria-label={ariaLabel} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  );
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// formatClosingDate — ISO date → "DD MMM, YYYY" (e.g. "30 Apr, 2026").
function formatClosingDate(iso) {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${day} ${MONTHS[d.getUTCMonth()]}, ${d.getUTCFullYear()}`;
}

const cmStyles = {
  wrap: {
    marginTop: 16,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  metricStrip: {
    display: "flex",
    gap: 16,
  },
  tile: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: 16,
    background: "var(--surface-alt)",
    borderRadius: "var(--radius-md)",
  },
  tileLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  tileValue: {
    fontSize: 24,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.2,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontFamily: "var(--font-sans)",
  },
  headRow: {
    borderBottom: "1px solid var(--table-header-border)",
  },
  th: {
    padding: "14px 0",
    textAlign: "left",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "0.2px",
    whiteSpace: "nowrap",
  },
  row: {
    height: 56,
    transition: "background 120ms ease",
    cursor: "pointer",
  },
  cell: {
    padding: 0,
    verticalAlign: "middle",
  },
  nameText: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--do-ink)",
  },
  cellText: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--do-ink)",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 0",
    borderTop: "1px solid var(--table-header-border)",
  },
  total: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  ctrls: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  pageLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--do-ink)",
    padding: "0 4px",
  },
};
