"use client";

import React from "react";
import { ChevronsLeft, ChevronLeft, ChevronRight, Info } from "lucide-react";
import TrendArrow from "./TrendArrow";

// Seed data for the All recommendations table. Each row:
//   id, title, roleplayVolume (int), volumePct (int %),
//   change { direction: "up" | "down" | "flat", pct }, context? (optional)
const allRecommendations = [
  { id: "1", title: "Resolution and expectations", roleplayVolume: 10, volumePct: 59, change: { direction: "down", pct: 14 } },
  { id: "2", title: "Service recovery workflow", roleplayVolume: 8, volumePct: 46, change: { direction: "up", pct: 10 }, context: "Flagged in 8 sessions across retention and technical support drivers. Often paired with refund-policy questions." },
  { id: "3", title: "Correct silence handling", roleplayVolume: 7, volumePct: 13, change: { direction: "down", pct: 5 } },
  { id: "4", title: "Interaction opening", roleplayVolume: 6, volumePct: 50, change: { direction: "up", pct: 16 } },
  { id: "5", title: "Interaction completion", roleplayVolume: 3, volumePct: 11, change: { direction: "down", pct: 15 } },
  { id: "6", title: "Acknowledgment statements", roleplayVolume: 8, volumePct: 42, change: { direction: "up", pct: 6 } },
  { id: "7", title: "Options and benefits", roleplayVolume: 4, volumePct: 22, change: { direction: "up", pct: 3 } },
  { id: "8", title: "Assurance statements", roleplayVolume: 2, volumePct: 12, change: { direction: "down", pct: 4 } },
  { id: "9", title: "Positive outlook", roleplayVolume: 2, volumePct: 10, change: { direction: "down", pct: 2 } },
  { id: "10", title: "Explore needs", roleplayVolume: 2, volumePct: 14, change: { direction: "up", pct: 5 } },
  { id: "11", title: "Upsell attempt", roleplayVolume: 2, volumePct: 9, change: { direction: "down", pct: 3 } },
  { id: "12", title: "Active listening cues", roleplayVolume: 5, volumePct: 28, change: { direction: "up", pct: 8 } },
  { id: "13", title: "Empathy and tone", roleplayVolume: 4, volumePct: 19, change: { direction: "down", pct: 6 } },
  { id: "14", title: "Follow-up quality", roleplayVolume: 3, volumePct: 17, change: { direction: "up", pct: 4 } },
  { id: "15", title: "Data privacy reminders", roleplayVolume: 1, volumePct: 6, change: { direction: "down", pct: 1 } },
];

const PAGE_SIZE = 5;

// Only Roleplay Volume is sortable in this task.
// TODO: confirm whether Volume % and Change% should also support sort.
const COLS = [
  { key: "title", label: "Title", width: "42%", sortable: false },
  { key: "roleplayVolume", label: "Roleplay Volume", width: "20%", sortable: true },
  { key: "volumePct", label: "Volume %", width: "18%", sortable: false },
  { key: "change", label: "Change%", width: "20%", sortable: false },
];

// Change% chip colours — matches the Top recommendations treemap mapping:
// down = volume decreasing = good (success / green); up = bad (danger / red).
// TODO: confirm down=good=green / up=bad=red matches the Top recommendations tab.
const CHANGE_VARIANTS = {
  down: { bg: "var(--color-success-bg)", fg: "var(--color-success)" },
  up: { bg: "var(--color-error-bg)", fg: "var(--color-error)" },
  // TODO: confirm zero / flat change chip state.
  flat: { bg: "var(--color-chip-bg)", fg: "var(--color-text-tertiary)" },
};

// AllRecommendationsTable — sortable, paginated table for the Coaching
// recommendations card's "All recommendations" sub-tab. Mirrors the
// AgentsPage / ContactDriverTable table + pagination pattern (the codebase
// has no shared table component — each Learning Hub page inlines its own).
export default function AllRecommendationsTable({ rows = allRecommendations }) {
  const [page, setPage] = React.useState(1);
  const [sortDir, setSortDir] = React.useState("desc");

  // TODO: confirm whether this table should respect the global page-level
  // date filter from the header once that filter is wired.

  const sorted = [...rows].sort((a, b) =>
    sortDir === "desc"
      ? b.roleplayVolume - a.roleplayVolume
      : a.roleplayVolume - b.roleplayVolume
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goToPage = (next) => setPage(Math.min(Math.max(1, next), totalPages));
  const toggleSort = () => {
    setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    setPage(1);
  };

  return (
    <div style={artStyles.wrap}>
      <table style={artStyles.table}>
        <colgroup>
          {COLS.map((c) => (
            <col key={c.key} style={{ width: c.width }} />
          ))}
        </colgroup>
        <thead>
          <tr style={artStyles.headRow}>
            {COLS.map((c) => (
              <th
                key={c.key}
                scope="col"
                aria-sort={
                  c.sortable
                    ? sortDir === "desc"
                      ? "descending"
                      : "ascending"
                    : undefined
                }
                style={artStyles.th}
              >
                {c.sortable ? (
                  <button type="button" onClick={toggleSort} style={artStyles.sortBtn}>
                    {c.label}
                    <span aria-hidden="true" style={artStyles.sortArrow}>
                      {sortDir === "desc" ? "↓" : "↑"}
                    </span>
                  </button>
                ) : (
                  c.label
                )}
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

      <div style={artStyles.footer}>
        <div style={artStyles.total}>Total {rows.length} Recommendations</div>
        <div style={artStyles.ctrls}>
          <PageBtn ariaLabel="First page" disabled={safePage <= 1} onClick={() => goToPage(1)}>
            <ChevronsLeft size={16} />
          </PageBtn>
          <span style={artStyles.pageLabel} aria-live="polite">
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
        // TODO: drill into coaching recommendation detail
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...artStyles.row,
        borderBottom: isLast ? "none" : "1px solid var(--table-row-border)",
        background: hover ? "var(--table-row-hover)" : "transparent",
      }}
    >
      <Cell>
        <span style={artStyles.titleCell}>
          <span style={artStyles.titleText}>{row.title}</span>
          {row.context && (
            <button
              type="button"
              aria-label="Recommendation context"
              title={row.context}
              onClick={(e) => {
                e.stopPropagation();
                // TODO: show recommendation context tooltip
                // TODO: confirm hover vs click as the trigger pattern in DataOrb
              }}
              style={artStyles.infoBtn}
            >
              <Info size={15} />
            </button>
          )}
        </span>
      </Cell>
      <Cell>
        <span style={artStyles.cellText}>{row.roleplayVolume}</span>
      </Cell>
      <Cell>
        {/* TODO: confirm Volume % definition with Akash — values do not
            sum to 100, so it is not a share of total. */}
        <span style={artStyles.cellText}>{row.volumePct}%</span>
      </Cell>
      <Cell>
        <ChangeChip change={row.change} />
      </Cell>
    </tr>
  );
}

function Cell({ children }) {
  return <td style={artStyles.cell}>{children}</td>;
}

// ChangeChip — trend pill mirroring the AgentsPage QA-score chip
// composition (shared <TrendArrow> + a coloured pill).
function ChangeChip({ change }) {
  const variant = CHANGE_VARIANTS[change.direction] || CHANGE_VARIANTS.flat;
  return (
    <span style={{ ...artStyles.changeChip, background: variant.bg, color: variant.fg }}>
      {change.direction !== "flat" && <TrendArrow up={change.direction === "up"} />}
      {change.pct}%
    </span>
  );
}

function PageBtn({ children, onClick, disabled, ariaLabel }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...artStyles.pageBtn,
        background: !disabled && hover ? "var(--pill-bg)" : "transparent",
        color: disabled ? "var(--color-text-placeholder)" : "var(--do-ink)",
        cursor: disabled ? "default" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

const artStyles = {
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
  sortBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: 0,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "0.2px",
  },
  sortArrow: {
    color: "var(--do-ink)",
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
  titleCell: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  titleText: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--do-ink)",
  },
  infoBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 20,
    height: 20,
    padding: 0,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "var(--color-text-tertiary)",
    flexShrink: 0,
  },
  cellText: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--do-ink)",
  },
  changeChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    padding: "3px 8px",
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
  pageBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: "none",
    display: "grid",
    placeItems: "center",
    padding: 0,
    transition: "background 120ms ease",
  },
};
