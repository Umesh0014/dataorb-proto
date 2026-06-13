"use client";

import React from "react";
import { ChevronsLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";
import { formatDate } from "./formatDate";
import {
  lhAM, lhI, lhPageOf, lhSkill, lhClosedCount, lhCompletionStatus,
} from "./learningHubLocale";

const PAGE_SIZE = 8;

const COLS = [
  { key: "title", labelKey: "col_closed", width: "36%" },
  { key: "target", labelKey: "fa_target", width: "16%" },
  { key: "roleplays", labelKey: "col_roleplays", width: "14%" },
  { key: "closingDate", labelKey: "col_closingDate", width: "18%" },
  { key: "completionStatus", labelKey: "col_completion", width: "16%" },
];

// ClosedMissions — Closed Missions view of the Missions card: a three-tile
// metric strip above a paginated table. Table + pagination mirror the
// ContactDriverTable pattern.
export default function ClosedMissions({ metrics, rows, locale = "en" }) {
  const [page, setPage] = React.useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const goToPage = (next) => setPage(Math.min(Math.max(1, next), totalPages));

  return (
    <div style={cmStyles.wrap}>
      <div style={cmStyles.metricStrip}>
        <MetricTile label={lhAM(locale, "tile_closed")} value={String(metrics.closedMissionsTotal)} />
        <MetricTile
          label={lhAM(locale, "tile_totalRoleplays")}
          value={`${metrics.totalRoleplays.completed}/${metrics.totalRoleplays.total}`}
        />
        <MetricTile
          label={lhAM(locale, "tile_targetsAchieved")}
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
                  {lhAM(locale, c.labelKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <Row key={row.id} row={row} isLast={i === pageRows.length - 1} locale={locale} />
            ))}
          </tbody>
        </table>

        <div style={cmStyles.footer}>
          <div style={cmStyles.total}>
            {lhClosedCount(locale, pageRows.length, rows.length)}
          </div>
          <div style={cmStyles.ctrls}>
            <PageBtn ariaLabel={lhI(locale, "firstPage")} disabled={safePage <= 1} onClick={() => goToPage(1)}>
              <ChevronsLeft size={16} />
            </PageBtn>
            <span style={cmStyles.pageLabel} aria-live="polite">
              {lhPageOf(locale, safePage, totalPages)}
            </span>
            <PageBtn ariaLabel={lhI(locale, "prevPage")} disabled={safePage <= 1} onClick={() => goToPage(safePage - 1)}>
              <ChevronLeft size={16} />
            </PageBtn>
            <PageBtn ariaLabel={lhI(locale, "nextPage")} disabled={safePage >= totalPages} onClick={() => goToPage(safePage + 1)}>
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

function Row({ row, isLast, locale = "en" }) {
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
        <span style={cmStyles.nameText} dir="auto">{lhSkill(locale, row.title)}</span>
      </Cell>
      <Cell>
        <TargetPill status={row.target} locale={locale} />
      </Cell>
      <Cell>
        <span style={cmStyles.cellText}>{row.roleplays}</span>
      </Cell>
      <Cell>
        <span style={cmStyles.cellText}>{formatDate(row.closingDate, locale)}</span>
      </Cell>
      <Cell>
        <span style={cmStyles.cellText}>{lhCompletionStatus(locale, row.completionStatus)}</span>
      </Cell>
    </tr>
  );
}

function Cell({ children }) {
  return <td style={cmStyles.cell}>{children}</td>;
}

function TargetPill({ status, locale = "en" }) {
  const met = status === "met";
  return (
    <span
      style={{
        ...cmStyles.pill,
        background: met ? "var(--color-success-bg)" : "var(--color-error-bg)",
        color: met ? "var(--color-success)" : "var(--color-error)",
      }}
    >
      {met ? lhAM(locale, "met") : lhAM(locale, "below")}
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
    textAlign: "start",
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
