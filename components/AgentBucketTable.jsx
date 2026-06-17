"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, CircleSlash, ChevronsLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import { TAG_META } from "./mocks/creditsUsage";

// AgentBucketTable — per-agent weekly usage. Cap is derived: a manual
// override wins over the agent's bucket cap; status is derived from
// used/cap (never hardcoded). When `selectable` (assignment approach B),
// a checkbox column drives the bulk-move action bar owned by the page.
const AVATAR_COLORS = [
  "var(--chart-blue)",
  "var(--chart-teal)",
  "var(--chart-lavender)",
  "var(--chart-orange)",
  "var(--chart-pink)",
  "var(--chart-green)",
];

const STATUS_META = {
  on_track: { label: "On track", color: "var(--color-success)", Icon: CheckCircle2 },
  near_limit: { label: "Near limit", color: "var(--color-warning)", Icon: AlertTriangle },
  at_cap: { label: "At cap", color: "var(--color-error)", Icon: CircleSlash },
};

export function appliedCap(agent, buckets) {
  if (agent.override) return agent.override.capMin;
  const bucket = buckets.find((b) => b.id === agent.bucketId);
  return bucket ? bucket.capMin : 0;
}

export function statusOf(used, cap) {
  if (cap <= 0) return "on_track";
  const pct = used / cap;
  return pct >= 1 ? "at_cap" : pct >= 0.9 ? "near_limit" : "on_track";
}

export default function AgentBucketTable({
  agents,
  buckets,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onAdjust,
  paginate = false,
  pageSizeOptions = [10, 20, 30, 50],
  bare = false,
  emptyLabel = "No agents yet — agents appear here once your tenant is provisioned.",
}) {
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(pageSizeOptions[0]);

  if (agents.length === 0) {
    const empty = <span style={styles.empty}>{emptyLabel}</span>;
    return bare ? <div style={styles.emptyBare}>{empty}</div> : (
      <Card tone="outline" padX={20} padY={32} style={styles.empty}>{emptyLabel}</Card>
    );
  }

  const grid = selectable ? styles.gridSelectable : styles.grid;
  const allSelected = selectable && selectedIds.length === agents.length;

  // Optional pagination — A/B and the bucket-folder (approach C) paginate;
  // rows-per-page is admin-controllable from the footer.
  const totalPages = paginate ? Math.max(1, Math.ceil(agents.length / rowsPerPage)) : 1;
  const safePage = Math.min(page, totalPages);
  const visible = paginate ? agents.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage) : agents;
  const goToPage = (next) => setPage(Math.min(Math.max(1, next), totalPages));
  const changeRows = (n) => { setRowsPerPage(n); setPage(1); };

  const Wrapper = bare ? BareWrap : CardWrap;

  return (
    <Wrapper>
      <div style={{ ...grid, ...(bare ? styles.headRowBare : styles.headRow) }}>
        {selectable && (
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleSelectAll}
            aria-label="Select all agents"
            style={styles.checkbox}
          />
        )}
        <span style={styles.th}>Agent</span>
        <span style={styles.th}>Tag</span>
        <span style={styles.th}>Bucket</span>
        <span style={styles.th}>Used / Cap</span>
        <span style={styles.th}>Status</span>
        <span style={styles.th}>Last active</span>
        <span style={styles.th} aria-hidden="true" />
      </div>

      {visible.map((agent, i) => {
        const bucket = buckets.find((b) => b.id === agent.bucketId);
        const cap = appliedCap(agent, buckets);
        const status = STATUS_META[statusOf(agent.usedMin, cap)];
        const StatusIcon = status.Icon;
        const tag = TAG_META[agent.tag] || TAG_META.new;
        const selected = selectedIds.includes(agent.id);
        return (
          <div key={agent.id} style={{ ...grid, ...(bare ? styles.rowBare : styles.row) }}>
            {selectable && (
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelect(agent.id)}
                aria-label={`Select ${agent.name}`}
                style={styles.checkbox}
              />
            )}
            <span style={styles.identity}>
              <Avatar name={agent.name} index={i} />
              <span style={styles.name}>{agent.name}</span>
            </span>
            <span>
              <span style={{ ...styles.tag, background: tag.bg, color: tag.fg }}>{tag.label}</span>
            </span>
            <span style={styles.bucket}>
              {bucket ? `${bucket.name} (${bucket.capMin})` : "—"}
              {agent.override && <span style={styles.override}>custom</span>}
            </span>
            <span style={styles.usage}>
              {agent.usedMin} / {cap} min
            </span>
            <span style={{ ...styles.status, color: status.color }}>
              <StatusIcon size={14} aria-hidden="true" />
              {status.label}
            </span>
            <span style={styles.lastActive}>{agent.lastActive}</span>
            <span style={styles.action}>
              <Button variant="text" uppercase={false} onClick={() => onAdjust(agent)}>
                Adjust
              </Button>
            </span>
          </div>
        );
      })}

      {paginate && (
        <div style={bare ? styles.footerBare : styles.footer}>
          <span style={styles.total}>Total {agents.length} agents</span>
          <div style={styles.ctrls}>
            <label style={styles.rowsWrap}>
              <span style={styles.rowsLabel}>Rows</span>
              <select
                value={rowsPerPage}
                onChange={(e) => changeRows(Number(e.target.value))}
                aria-label="Rows per page"
                style={styles.rowsSelect}
              >
                {pageSizeOptions.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>
            <PageBtn ariaLabel="First page" disabled={safePage <= 1} onClick={() => goToPage(1)}>
              <ChevronsLeft size={16} />
            </PageBtn>
            <span style={styles.pageLabel} aria-live="polite">Page {safePage} of {totalPages}</span>
            <PageBtn ariaLabel="Previous page" disabled={safePage <= 1} onClick={() => goToPage(safePage - 1)}>
              <ChevronLeft size={16} />
            </PageBtn>
            <PageBtn ariaLabel="Next page" disabled={safePage >= totalPages} onClick={() => goToPage(safePage + 1)}>
              <ChevronRight size={16} />
            </PageBtn>
          </div>
        </div>
      )}
    </Wrapper>
  );
}

function CardWrap({ children }) {
  return <Card tone="outline" padX={0} padY={0}>{children}</Card>;
}

function BareWrap({ children }) {
  return <div style={styles.bareWrap}>{children}</div>;
}

function PageBtn({ children, onClick, disabled, ariaLabel }) {
  return (
    <Button variant="icon" size="sm" aria-label={ariaLabel} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  );
}

function Avatar({ name, index }) {
  const initials = name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  return (
    <span style={{ ...styles.avatar, background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
      {initials}
    </span>
  );
}

const GRID = "minmax(0,1.7fr) 110px 160px 120px 110px 100px 84px";
const styles = {
  grid: { display: "grid", gridTemplateColumns: GRID, alignItems: "center", gap: 16 },
  gridSelectable: { display: "grid", gridTemplateColumns: `28px ${GRID}`, alignItems: "center", gap: 16 },
  headRow: { padding: "12px 20px", borderBottom: "1px solid var(--color-divider-card)" },
  row: { padding: "12px 20px", borderBottom: "1px solid var(--color-border-card-soft)" },
  headRowBare: { padding: "10px 0", borderBottom: "1px solid var(--color-divider-card)" },
  rowBare: { padding: "12px 0", borderBottom: "1px solid var(--color-border-card-soft)" },
  footerBare: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 0 0" },
  th: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  checkbox: { width: 16, height: 16, accentColor: "var(--do-brand-blue)", cursor: "pointer" },
  identity: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 },
  name: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  tag: { padding: "1px 8px", borderRadius: 999, fontSize: 10, fontWeight: 600, letterSpacing: "0.2px", whiteSpace: "nowrap" },
  bucket: { display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "var(--color-text-medium)" },
  override: {
    padding: "0 6px",
    borderRadius: 999,
    background: "var(--color-card-emoji-bg)",
    color: "var(--color-text-tertiary)",
    fontSize: 9,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  usage: { fontSize: 12, fontWeight: 600, color: "var(--color-text-deep)", fontVariantNumeric: "tabular-nums" },
  status: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600 },
  lastActive: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  action: { display: "flex", justifyContent: "flex-end" },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.2px",
    flexShrink: 0,
  },
  empty: { textAlign: "center", fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  emptyBare: { padding: "28px 4px", textAlign: "center", fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  bareWrap: { display: "flex", flexDirection: "column" },
  footer: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 20px" },
  total: { fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  ctrls: { display: "flex", alignItems: "center", gap: 8 },
  pageLabel: { fontSize: 13, fontWeight: 500, color: "var(--color-text-deep)", padding: "0 4px" },
  rowsWrap: { display: "inline-flex", alignItems: "center", gap: 6, marginRight: 4 },
  rowsLabel: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  rowsSelect: {
    height: 28,
    padding: "0 6px",
    borderRadius: 6,
    border: "1px solid var(--color-border-card-soft)",
    background: "#FFFFFF",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-medium)",
    cursor: "pointer",
    appearance: "auto",
  },
};
