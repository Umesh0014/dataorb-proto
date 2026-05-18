"use client";

import React from "react";
import { FileText, ChevronDown, ChevronsLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";
import TrendArrow from "./TrendArrow";

const PAGE_SIZE = 5;

const COLS = [
  { key: "name", label: "", width: "40%" },
  { key: "roleplays", label: "Roleplays", width: "18%" },
  { key: "adherence", label: "Adherence Rate", width: "26%" },
  { key: "change", label: "Change%", width: "16%" },
];

// Change% chip — "higher is better" polarity: up = good (success / green),
// down = bad (danger / red). This is the OPPOSITE of the Coaching
// recommendations Change% column.
// TODO: confirm direction-to-color polarity for adherence change.
const CHANGE_VARIANTS = {
  up: { bg: "var(--color-success-bg)", fg: "var(--color-success)" },
  down: { bg: "var(--color-error-bg)", fg: "var(--color-error)" },
  // TODO: confirm zero / flat change chip state.
  flat: { bg: "var(--color-chip-bg)", fg: "var(--color-text-tertiary)" },
};

// AdherenceScopeTable — shared paginated table for the Quality adherence
// card's "By metric" and "By skills" tabs. `scopeNoun` is "Metrics" or
// "Skills"; the two tabs pass different `rows`. Mirrors the AgentsPage /
// ContactDriverTable table + pagination pattern.
export default function AdherenceScopeTable({ rows, scopeNoun }) {
  const [page, setPage] = React.useState(1);

  // TODO: confirm whether this table respects the global page-level date filter.
  // TODO: confirm per-page count and page-total with Akash (5 per page here).

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const goToPage = (next) => setPage(Math.min(Math.max(1, next), totalPages));

  return (
    <div style={astStyles.wrap}>
      <ScopeDropdown scopeNoun={scopeNoun} />

      <table style={astStyles.table}>
        <colgroup>
          {COLS.map((c) => (
            <col key={c.key} style={{ width: c.width }} />
          ))}
        </colgroup>
        <thead>
          <tr style={astStyles.headRow}>
            {COLS.map((c) => (
              <th key={c.key} scope="col" style={astStyles.th}>
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

      <div style={astStyles.footer}>
        <div style={astStyles.total}>
          Total {rows.length} {scopeNoun}
        </div>
        <div style={astStyles.ctrls}>
          <PageBtn ariaLabel="First page" disabled={safePage <= 1} onClick={() => goToPage(1)}>
            <ChevronsLeft size={16} />
          </PageBtn>
          <span style={astStyles.pageLabel} aria-live="polite">
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

// ScopeDropdown — "For All {scopeNoun}" filter trigger. Options are stubbed.
function ScopeDropdown({ scopeNoun }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={astStyles.scopeWrap}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={astStyles.scopeBtn}>
        <FileText size={16} style={{ color: "var(--color-text-tertiary)" }} />
        <span style={astStyles.scopeFor}>For</span>
        <span style={astStyles.scopeValue}>All {scopeNoun}</span>
        <ChevronDown size={14} style={{ color: "var(--color-text-placeholder)" }} />
      </button>
      {open && (
        <div role="menu" style={astStyles.scopeMenu}>
          <button type="button" role="menuitemradio" aria-checked="true" style={astStyles.scopeMenuItem}>
            All {scopeNoun}
          </button>
          {/* TODO: confirm metric / skill category options with Akash */}
        </div>
      )}
    </div>
  );
}

function Row({ row, isLast }) {
  const [hover, setHover] = React.useState(false);
  return (
    <tr
      onClick={() => {
        // TODO: drill into metric / skill detail
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...astStyles.row,
        borderBottom: isLast ? "none" : "1px solid var(--table-row-border)",
        background: hover ? "var(--table-row-hover)" : "transparent",
      }}
    >
      <Cell>
        <span style={astStyles.nameText}>{row.name}</span>
      </Cell>
      <Cell>
        {row.roleplays == null ? (
          <span style={astStyles.placeholder}>--</span>
        ) : (
          <span style={astStyles.cellText}>{row.roleplays.toLocaleString()}</span>
        )}
      </Cell>
      <Cell>
        <AdherenceCell value={row.adherence} />
      </Cell>
      <Cell>
        <ChangeCell change={row.change} />
      </Cell>
    </tr>
  );
}

function Cell({ children }) {
  return <td style={astStyles.cell}>{children}</td>;
}

// AdherenceCell — threshold-coloured progress bar + percentage value.
function AdherenceCell({ value }) {
  if (value == null) return <span style={astStyles.placeholder}>--</span>;
  // TODO: confirm exact threshold boundaries with Akash.
  const color =
    value < 50
      ? "var(--color-error)"
      : value < 80
      ? "var(--color-warning)"
      : "var(--color-success)";
  return (
    <span style={astStyles.adherenceCell}>
      <span style={astStyles.barTrack}>
        <span style={{ ...astStyles.barFill, width: `${value}%`, background: color }} />
      </span>
      <span style={astStyles.adherenceVal}>{value}%</span>
    </span>
  );
}

// ChangeCell — trend chip; mirrors the AgentsPage QA-score chip composition.
function ChangeCell({ change }) {
  if (change == null) return <span style={astStyles.placeholder}>--</span>;
  const variant = CHANGE_VARIANTS[change.direction] || CHANGE_VARIANTS.flat;
  // TODO: confirm capping behaviour for extreme change values (e.g. 2000%).
  return (
    <span style={{ ...astStyles.changeChip, background: variant.bg, color: variant.fg }}>
      {change.direction !== "flat" && <TrendArrow up={change.direction === "up"} />}
      {change.pct}%
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

const astStyles = {
  wrap: {
    marginTop: 16,
  },
  scopeWrap: {
    position: "relative",
    marginBottom: 12,
  },
  scopeBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: 0,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
  },
  scopeFor: {
    fontSize: 13,
    color: "var(--text-secondary)",
  },
  scopeValue: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--do-ink)",
  },
  scopeMenu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    minWidth: 180,
    background: "var(--surface-white)",
    border: "1px solid var(--color-border-tab)",
    borderRadius: 8,
    boxShadow: "var(--shadow-4)",
    padding: "4px 0",
    zIndex: 30,
  },
  scopeMenuItem: {
    display: "block",
    width: "100%",
    padding: "8px 16px",
    background: "var(--pill-bg)",
    border: "none",
    textAlign: "left",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-tab-active)",
    cursor: "pointer",
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
  placeholder: {
    fontSize: 13,
    color: "var(--color-text-placeholder)",
  },
  adherenceCell: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    paddingRight: 16,
  },
  barTrack: {
    flex: 1,
    minWidth: 0,
    height: 4,
    borderRadius: 2,
    background: "var(--table-header-border)",
    overflow: "hidden",
  },
  barFill: {
    display: "block",
    height: "100%",
    borderRadius: 2,
  },
  adherenceVal: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--do-ink)",
    flexShrink: 0,
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
};
