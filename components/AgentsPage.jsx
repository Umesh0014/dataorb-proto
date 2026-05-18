"use client";

import React from "react";
import { SlidersHorizontal, ChevronsLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";
import Card from "./Card";
import PageHeader from "./PageHeader";
import TrendArrow from "./TrendArrow";
import { AgentsIcon } from "./SideNav/icons";
import { LEARNING_AGENTS } from "./mocks/learningAgents";

const PAGE_SIZE = 9;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Search-by selector options. The screenshot defaults to "Agent ID".
// TODO: confirm the full search-by option list (spec: other options TBD).
const SEARCH_BY_OPTIONS = [
  { id: "id", label: "Agent ID" },
  { id: "name", label: "Agent name" },
];

// Column labels follow the written spec. The reference screenshot shows
// "Last Session" / "Sessions"; the spec labels are authoritative.
const COLS = [
  { key: "agent", label: "Agents", width: "30%" },
  { key: "lastRoleplay", label: "Last Roleplay", width: "20%" },
  { key: "roleplays", label: "Roleplays", width: "16%" },
  { key: "qaScore", label: "QA Score", width: "18%" },
  { key: "missions", label: "Missions", width: "16%" },
];

const TREND_VARIANTS = {
  up: { bg: "var(--color-success-bg)", fg: "var(--color-success)" },
  down: { bg: "var(--color-error-bg)", fg: "var(--color-error)" },
  // TODO: confirm zero-delta ("flat") trend chip treatment — neutral for now.
  flat: { bg: "var(--color-chip-bg)", fg: "var(--color-text-tertiary)" },
};

// AgentsPage — Learning Hub › Agents sub-page. Resolved by app/page.jsx
// (LEARNING_PAGES) and rendered inside <PageLayout>. Self-contained: holds
// its own mock data, search, and pagination state — mirrors InteractionsPage.
export default function AgentsPage({ onOpenAgent }) {
  const [searchBy, setSearchBy] = React.useState("id");
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);

  const selected = SEARCH_BY_OPTIONS.find((o) => o.id === searchBy) || SEARCH_BY_OPTIONS[0];

  // TODO: confirm client-side vs server-side search — client-side filter
  // over the full list is used for the prototype.
  const q = query.trim().toLowerCase();
  const filtered = q
    ? LEARNING_AGENTS.filter((a) => {
        const field = searchBy === "name" ? a.name : a.id;
        return String(field).toLowerCase().includes(q);
      })
    : LEARNING_AGENTS;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const searchByFilter = {
    id: "search-by",
    label: "",
    value: selected.label,
    options: SEARCH_BY_OPTIONS.map((o) => ({ label: o.label, value: o.label })),
    onSelect: (label) => {
      const opt = SEARCH_BY_OPTIONS.find((o) => o.label === label);
      if (opt) setSearchBy(opt.id);
      setPage(1);
    },
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageHeader
        identifier={{
          icon: <AgentsIcon size={18} />,
          label: "Agents",
          withDropdown: true,
          // TODO: connect the Learning Hub sub-page list to this dropdown.
          onClick: () => {},
        }}
        filters={[searchByFilter]}
        search={{
          value: query,
          onChange: (v) => {
            setQuery(v);
            setPage(1);
          },
          placeholder: "Search by ID and name",
        }}
        toolbar={[
          // TODO: wire the sort menu.
          { id: "sort", icon: <SortIcon />, label: "Sort", onClick: () => {} },
          // TODO: wire the filter panel.
          { id: "filter", icon: <SlidersHorizontal size={20} />, label: "Filter", onClick: () => {} },
        ]}
      />
      <Card padX={0} padY={0} style={{ overflow: "hidden" }}>
        <Table
          rows={pageRows}
          onRowClick={(agent) => onOpenAgent?.(agent.id)}
        />
        <Pagination
          page={safePage}
          totalPages={totalPages}
          total={filtered.length}
          onPageChange={(next) => setPage(Math.min(Math.max(1, next), totalPages))}
        />
      </Card>
    </div>
  );
}

function Table({ rows, onRowClick }) {
  return (
    <table style={apStyles.table}>
      <colgroup>
        {COLS.map((c) => (
          <col key={c.key} style={{ width: c.width }} />
        ))}
      </colgroup>
      <thead>
        <tr style={apStyles.headRow}>
          {COLS.map((c) => (
            <th key={c.key} scope="col" style={apStyles.th}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={COLS.length} style={apStyles.emptyCell}>
              No agents found
            </td>
          </tr>
        ) : (
          rows.map((agent, i) => (
            <Row
              key={agent.id}
              agent={agent}
              isLast={i === rows.length - 1}
              onClick={() => onRowClick(agent)}
            />
          ))
        )}
      </tbody>
    </table>
  );
}

function Row({ agent, isLast, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...apStyles.row,
        borderBottom: isLast ? "none" : "1px solid var(--table-row-border)",
        background: hover ? "var(--table-row-hover)" : "transparent",
      }}
    >
      <Cell>
        <AgentCell agent={agent} />
      </Cell>
      <Cell>
        <span style={apStyles.dateText}>{formatDate(agent.lastRoleplayDate)}</span>
      </Cell>
      <Cell>
        <CountChip value={agent.roleplaysCount} />
      </Cell>
      <Cell>
        <ScoreCell score={agent.qaScore} trend={agent.qaScoreTrend} />
      </Cell>
      <Cell>
        <MissionsCell missions={agent.missions} />
      </Cell>
    </tr>
  );
}

function Cell({ children }) {
  return <td style={apStyles.cell}>{children}</td>;
}

// AgentCell — avatar + name. Hovering the group shows a dark tooltip with
// the agent's id + email. The tooltip is position:fixed so it is never
// clipped by the table card's overflow.
// TODO: confirm hover target — spec allows avatar only or avatar + name.
function AgentCell({ agent }) {
  const [rect, setRect] = React.useState(null);
  return (
    <span
      style={apStyles.agentAnchor}
      onMouseEnter={(e) => setRect(e.currentTarget.getBoundingClientRect())}
      onMouseLeave={() => setRect(null)}
    >
      <span style={apStyles.avatar} aria-hidden="true">
        {agent.initials}
      </span>
      <span style={apStyles.agentName}>{agent.name}</span>
      {rect && <DarkTooltip rect={rect} agent={agent} />}
    </span>
  );
}

function DarkTooltip({ rect, agent }) {
  return (
    <div
      role="tooltip"
      style={{ ...apStyles.darkTooltip, left: rect.left, top: rect.bottom + 8 }}
    >
      <div style={apStyles.tooltipId}>{agent.id}</div>
      <div style={apStyles.tooltipEmail}>{agent.email}</div>
    </div>
  );
}

function ScoreCell({ score, trend }) {
  if (score == null) return <ScoreUnavailable />;
  return (
    <span style={apStyles.scoreCell}>
      {/* TODO: confirm whether the QA Score % is threshold-coloured
          (e.g. red < 50, amber 50-70, green > 70) or always neutral —
          neutral text used here. */}
      <span style={apStyles.scoreValue}>{score}%</span>
      {trend && <TrendChip trend={trend} />}
    </span>
  );
}

// ScoreUnavailable — rendered when qaScore is null.
// TODO: confirm the unavailable-score icon component (spec describes a
// broken / incomplete pie with an exclamation mark).
function ScoreUnavailable() {
  return (
    <span style={apStyles.unavailable}>
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M8 2.4a5.6 5.6 0 1 1-4 1.68" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
        <line x1={8} y1={5} x2={8} y2={8.6} stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
        <circle cx={8} cy={11} r={0.9} fill="currentColor" />
      </svg>
      <span style={{ fontSize: 13 }}>N/A</span>
    </span>
  );
}

function TrendChip({ trend }) {
  const variant = TREND_VARIANTS[trend.direction] || TREND_VARIANTS.flat;
  return (
    <span style={{ ...apStyles.trendChip, background: variant.bg, color: variant.fg }}>
      {trend.direction !== "flat" && <TrendArrow up={trend.direction === "up"} />}
      {trend.deltaPct}%
    </span>
  );
}

function CountChip({ value }) {
  return <span style={apStyles.countChip}>{value}</span>;
}

// MissionsCell — neutral count chip; hovering shows a light card with the
// per-mission breakdown. The hover card is position:fixed (never clipped).
function MissionsCell({ missions }) {
  const [rect, setRect] = React.useState(null);
  return (
    <span
      style={apStyles.missionsAnchor}
      onMouseEnter={(e) => setRect(e.currentTarget.getBoundingClientRect())}
      onMouseLeave={() => setRect(null)}
    >
      <CountChip value={missions.length} />
      {rect && missions.length > 0 && <MissionsHoverCard rect={rect} missions={missions} />}
    </span>
  );
}

// TODO: confirm the rich hover-card component — composed here from <Card>.
function MissionsHoverCard({ rect, missions }) {
  const below = missions.filter((m) => m.status === "below_target").length;
  return (
    <Card
      shadow
      padX={16}
      padY={14}
      style={{ position: "fixed", left: rect.left, top: rect.bottom + 8, width: 280, zIndex: 1000 }}
    >
      <div style={apStyles.hoverHeader}>
        Missions: {below} of {missions.length} below target
      </div>
      <div style={apStyles.hoverList}>
        {missions.map((m) => (
          <div key={m.id} style={apStyles.hoverRow}>
            <span style={apStyles.hoverName}>{m.name}</span>
            <MissionStatusIcon status={m.status} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function MissionStatusIcon({ status }) {
  const below = status === "below_target";
  const color = below ? "var(--color-error)" : "var(--color-success)";
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      role="img"
      aria-label={below ? "Below target" : "On target"}
      style={{ flexShrink: 0 }}
    >
      <circle cx={8} cy={8} r={8} fill={color} />
      {below ? (
        <>
          <line x1={8} y1={4} x2={8} y2={9} stroke="#FFFFFF" strokeWidth={1.7} strokeLinecap="round" />
          <circle cx={8} cy={11.4} r={1} fill="#FFFFFF" />
        </>
      ) : (
        <path
          d="M4.6 8.2l2.2 2.2 4.6-4.8"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// SortIcon — local inline SVG; the icon set has no sort glyph. Sized 20px
// to match the other toolbar icons.
function SortIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M6.5 4.2v11.6M6.5 4.2L3.7 7M6.5 4.2L9.3 7"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 15.8V4.2M13.5 15.8l2.8-2.8M13.5 15.8l-2.8-2.8"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Pagination({ page, totalPages, total, onPageChange }) {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  return (
    <div style={apStyles.pagination}>
      <div style={apStyles.paginationCount}>Total {total} Agents</div>
      <div style={apStyles.paginationCtrls}>
        <PageBtn ariaLabel="First page" disabled={!canPrev} onClick={() => onPageChange(1)}>
          <ChevronsLeft size={16} />
        </PageBtn>
        <span style={apStyles.pageLabel} aria-live="polite">
          Page {page} of {totalPages}
        </span>
        <PageBtn ariaLabel="Previous page" disabled={!canPrev} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft size={16} />
        </PageBtn>
        <PageBtn ariaLabel="Next page" disabled={!canNext} onClick={() => onPageChange(page + 1)}>
          <ChevronRight size={16} />
        </PageBtn>
        {/* TODO: confirm last-page button inclusion — omitted to match the
            existing InteractionsPage pagination. */}
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

// formatDate — ISO date → "DD MMM YYYY" (e.g. "22 Mar 2026").
function formatDate(iso) {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${day} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const apStyles = {
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
    padding: "14px 16px",
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
    padding: "0 16px",
    verticalAlign: "middle",
    fontSize: 13,
    color: "var(--do-ink)",
  },
  emptyCell: {
    padding: "40px 16px",
    textAlign: "center",
    fontSize: 13,
    color: "var(--color-text-tertiary)",
  },
  dateText: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--do-ink)",
  },
  agentAnchor: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  },
  agentName: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--do-ink)",
    whiteSpace: "nowrap",
  },
  darkTooltip: {
    position: "fixed",
    zIndex: 1000,
    background: "var(--do-ink)",
    color: "#FFFFFF",
    padding: "8px 12px",
    borderRadius: 6,
    fontSize: 12,
    lineHeight: 1.5,
    boxShadow: "var(--shadow-8)",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  },
  tooltipId: {
    fontWeight: 700,
  },
  tooltipEmail: {
    fontWeight: 400,
    color: "rgba(255, 255, 255, 0.72)",
  },
  scoreCell: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--do-ink)",
  },
  unavailable: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    color: "var(--color-text-placeholder)",
  },
  trendChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    padding: "3px 8px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
  },
  countChip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 34,
    padding: "3px 10px",
    borderRadius: 6,
    background: "var(--color-chip-bg)",
    color: "var(--color-chip-text)",
    fontSize: 13,
    fontWeight: 600,
  },
  missionsAnchor: {
    display: "inline-flex",
  },
  hoverHeader: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--do-ink)",
    paddingBottom: 10,
    borderBottom: "1px solid var(--color-divider-card)",
  },
  hoverList: {
    display: "flex",
    flexDirection: "column",
    paddingTop: 4,
  },
  hoverRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "6px 0",
  },
  hoverName: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderTop: "1px solid var(--table-header-border)",
  },
  paginationCount: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  paginationCtrls: {
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
