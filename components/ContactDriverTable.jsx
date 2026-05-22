"use client";

import React from "react";
import { ChevronsLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";
import { formatDate } from "./formatDate";

// Seed data for the By contact driver table. Each row:
//   id, name, roleplays (int), lastRoleplayDate (ISO), qaScore (int %)
const driverData = [
  { id: "1", name: "Cancellation and retention", roleplays: 2531, lastRoleplayDate: "2026-01-14", qaScore: 76 },
  { id: "2", name: "Commercial and sales", roleplays: 2421, lastRoleplayDate: "2026-01-22", qaScore: 55 },
  { id: "3", name: "Technical support fixed", roleplays: 1542, lastRoleplayDate: "2026-02-21", qaScore: 23 },
  { id: "4", name: "Technical support mobile", roleplays: 1753, lastRoleplayDate: "2026-02-25", qaScore: 78 },
  { id: "5", name: "Technical support TV", roleplays: 1750, lastRoleplayDate: "2026-03-19", qaScore: 33 },
  { id: "6", name: "Digital channel support", roleplays: 1750, lastRoleplayDate: "2026-03-20", qaScore: 56 },
  { id: "7", name: "Billing inquiries", roleplays: 1432, lastRoleplayDate: "2026-03-12", qaScore: 64 },
  { id: "8", name: "Account management", roleplays: 1218, lastRoleplayDate: "2026-03-08", qaScore: 71 },
  { id: "9", name: "Service activation", roleplays: 987, lastRoleplayDate: "2026-02-28", qaScore: 49 },
  { id: "10", name: "Complaints resolution", roleplays: 854, lastRoleplayDate: "2026-02-15", qaScore: 41 },
  { id: "11", name: "Plan upgrades", roleplays: 712, lastRoleplayDate: "2026-02-10", qaScore: 82 },
];

// Rows per page. 4 keeps the footer at "Page 1 of 3" for 11 drivers.
// TODO: confirm per-page count (4) vs the AgentsPage convention (9 there).
const PAGE_SIZE = 4;


const COLS = [
  { key: "name", label: "Drivers", width: "46%" },
  { key: "roleplays", label: "Roleplays", width: "18%" },
  { key: "lastRoleplay", label: "Last Roleplay", width: "20%" },
  { key: "qaScore", label: "QA Score", width: "16%" },
];

// ContactDriverTable — paginated table for the Roleplay coverage card's
// "By contact driver" sub-tab. Mirrors the AgentsPage table + pagination
// pattern; the codebase has no shared table component — each Learning Hub
// page inlines its own.
export default function ContactDriverTable({ rows = driverData }) {
  const [page, setPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goToPage = (next) => setPage(Math.min(Math.max(1, next), totalPages));

  // TODO: confirm whether this table should respect the global page-level
  // date filter from the header once that filter is wired.

  return (
    <div style={cdtStyles.wrap}>
      <table style={cdtStyles.table}>
        <colgroup>
          {COLS.map((c) => (
            <col key={c.key} style={{ width: c.width }} />
          ))}
        </colgroup>
        <thead>
          <tr style={cdtStyles.headRow}>
            {COLS.map((c) => (
              <th key={c.key} scope="col" style={cdtStyles.th}>
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

      <div style={cdtStyles.footer}>
        <div style={cdtStyles.total}>Total {rows.length} Drivers</div>
        <div style={cdtStyles.ctrls}>
          <PageBtn ariaLabel="First page" disabled={safePage <= 1} onClick={() => goToPage(1)}>
            <ChevronsLeft size={16} />
          </PageBtn>
          <span style={cdtStyles.pageLabel} aria-live="polite">
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
  );
}

function Row({ row, isLast }) {
  const [hover, setHover] = React.useState(false);
  return (
    <tr
      onClick={() => {
        // TODO: drill into roleplays filtered by this contact driver
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...cdtStyles.row,
        borderBottom: isLast ? "none" : "1px solid var(--table-row-border)",
        background: hover ? "var(--table-row-hover)" : "transparent",
      }}
    >
      <Cell>
        <span style={cdtStyles.nameText}>{row.name}</span>
      </Cell>
      <Cell>
        <span style={cdtStyles.cellText}>{row.roleplays.toLocaleString()}</span>
      </Cell>
      <Cell>
        <span style={cdtStyles.cellText}>{formatDate(row.lastRoleplayDate)}</span>
      </Cell>
      <Cell>
        {/* TODO: confirm QA Score threshold colouring — neutral for now. */}
        <span style={cdtStyles.cellText}>{row.qaScore}%</span>
      </Cell>
    </tr>
  );
}

function Cell({ children }) {
  return <td style={cdtStyles.cell}>{children}</td>;
}

function PageBtn({ children, onClick, disabled, ariaLabel }) {
  return (
    <Button variant="icon" size="sm" aria-label={ariaLabel} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  );
}


const cdtStyles = {
  wrap: {
    marginTop: 16,
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
