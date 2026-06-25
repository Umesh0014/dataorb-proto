"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, CircleSlash, ChevronsLeft, ChevronLeft, ChevronRight, Search, ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Select from "./Select";
import { CapacityBar } from "./CreditsUsageParts";
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
  showAdjust = true,
  showTag = true,
  showBucket,
  paginate = false,
  pageSizeOptions = [10, 20, 30, 50],
  bare = false,
  emptyLabel = "No agents yet — agents appear here once your tenant is provisioned.",
  // bulkBar + bulkPlacement let a parent host its move bar inside the table
  // ("inline" below the toolbar, or "footer" above pagination) instead of
  // pinned above it. Other placements (top / floating) are owned by parents.
  bulkBar = null,
  bulkPlacement = null,
  // Optional action rendered on the right of the toolbar, beside the search
  // (e.g. the page's "Manage agents" button).
  toolbarAction = null,
}) {
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(pageSizeOptions[0]);
  const [query, setQuery] = React.useState("");
  const [tagFilter, setTagFilter] = React.useState("all");
  const [sortKey, setSortKey] = React.useState(null);
  const [sortDir, setSortDir] = React.useState("asc");

  // Searching / filtering resets to the first page so results aren't hidden
  // on a stale page index.
  const fkey = `${query}|${tagFilter}`;
  const [prevFkey, setPrevFkey] = React.useState(fkey);
  if (fkey !== prevFkey) {
    setPrevFkey(fkey);
    setPage(1);
  }

  if (agents.length === 0) {
    const empty = <span style={styles.empty}>{emptyLabel}</span>;
    return bare ? <div style={styles.emptyBare}>{empty}</div> : (
      <Card tone="outline" padX={20} padY={32} style={styles.empty}>{emptyLabel}</Card>
    );
  }

  // The per-row Bucket column is dropped for the folder views (bare) and
  // whenever a caller filters to one tier (showBucket=false); A/B keep it
  // since their agents span buckets. Defaults to !bare when unspecified.
  const showBucketCol = showBucket ?? !bare;
  let base = showBucketCol ? GRID : GRID_BARE;
  if (showAdjust) base += " 84px";
  const cols = selectable ? `28px ${base}` : base;
  const grid = { display: "grid", gridTemplateColumns: cols, alignItems: "center", gap: 12 };

  // Toolbar owns name search + tenure tag. Columns are sortable: clicking a
  // header sorts by it (the active column shows the direction arrow); with no
  // header clicked the parent's order is preserved. Selection / pagination
  // operate on the resulting list.
  const q = query.trim().toLowerCase();
  const matched = agents.filter(
    (a) => (!q || a.name.toLowerCase().includes(q)) && (tagFilter === "all" || a.tag === tagFilter),
  );
  const ratioOf = (a) => {
    const cap = appliedCap(a, buckets);
    return cap > 0 ? a.usedMin / cap : 0;
  };
  const SEVERITY = { on_track: 0, near_limit: 1, at_cap: 2 };
  const sevOf = (a) => SEVERITY[statusOf(a.usedMin, appliedCap(a, buckets))];
  const SORTERS = {
    name: (a, b) => a.name.localeCompare(b.name),
    bucket: (a, b) => appliedCap(a, buckets) - appliedCap(b, buckets),
    usage: (a, b) => ratioOf(a) - ratioOf(b),
    status: (a, b) => sevOf(a) - sevOf(b),
  };
  const filtered = sortKey
    ? [...matched].sort((a, b) => SORTERS[sortKey](a, b) * (sortDir === "desc" ? -1 : 1))
    : matched;
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const allSelected = selectable && filtered.length > 0 && selectedIds.length === filtered.length;
  const totalPages = paginate ? Math.max(1, Math.ceil(filtered.length / rowsPerPage)) : 1;
  const safePage = Math.min(page, totalPages);
  const visible = paginate ? filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage) : filtered;
  const goToPage = (next) => setPage(Math.min(Math.max(1, next), totalPages));
  const changeRows = (n) => { setRowsPerPage(n); setPage(1); };

  const Wrapper = bare ? BareWrap : CardWrap;

  return (
    <Wrapper>
      {paginate && (
        <TableToolbar
          bare={bare}
          query={query}
          onQuery={setQuery}
          tagFilter={tagFilter}
          onTag={setTagFilter}
          showTag={showTag}
          toolbarAction={toolbarAction}
        />
      )}
      {bulkPlacement === "inline" && bulkBar && (
        <div style={bare ? styles.slotBare : styles.slot}>{bulkBar}</div>
      )}
      <div style={{ ...grid, ...(bare ? styles.headRowBare : styles.headRow) }}>
        {selectable && (
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => onToggleSelectAll(filtered.map((a) => a.id))}
            aria-label="Select all agents"
            style={styles.checkbox}
          />
        )}
        <SortTh label="Agent" col="name" sortKey={sortKey} dir={sortDir} onSort={toggleSort} />
        {showBucketCol && <SortTh label="Bucket" col="bucket" sortKey={sortKey} dir={sortDir} onSort={toggleSort} />}
        <SortTh label="Used / Cap" col="usage" sortKey={sortKey} dir={sortDir} onSort={toggleSort} />
        <SortTh label="Status" col="status" sortKey={sortKey} dir={sortDir} onSort={toggleSort} />
        {showAdjust && <span style={styles.th} aria-hidden="true" />}
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
              <span style={styles.identityText}>
                <span style={styles.name}>{agent.name}</span>
                {showTag && <span style={{ ...styles.tag, background: tag.bg, color: tag.fg }}>{tag.label}</span>}
              </span>
            </span>
            {showBucketCol && (
              <span style={styles.bucket}>
                {bucket ? `${bucket.name} (${bucket.capMin})` : "—"}
                {agent.override && <span style={styles.override}>custom</span>}
              </span>
            )}
            <div style={styles.usageCell}>
              <CapacityBar used={agent.usedMin} total={cap} height={6} />
              <span style={styles.usageCaption}>
                {agent.usedMin} / {cap} min · last active {agent.lastActive}
              </span>
            </div>
            <span style={{ ...styles.status, color: status.color }}>
              <StatusIcon size={14} aria-hidden="true" />
              {status.label}
            </span>
            {showAdjust && (
              <span style={styles.action}>
                <Button variant="text" uppercase={false} onClick={() => onAdjust(agent)}>
                  Adjust
                </Button>
              </span>
            )}
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={bare ? styles.noMatchBare : styles.noMatch}>
          No agents match your search or filters.
        </div>
      )}

      {bulkPlacement === "footer" && bulkBar && (
        <div style={bare ? styles.slotBare : styles.slot}>{bulkBar}</div>
      )}

      {paginate && filtered.length > 0 && (
        <div style={bare ? styles.footerBare : styles.footer}>
          <span style={styles.total}>
            {filtered.length === agents.length
              ? `Total ${agents.length} agents`
              : `${filtered.length} of ${agents.length} agents`}
          </span>
          <div style={styles.ctrls}>
            <span style={styles.rowsWrap}>
              <span style={styles.rowsLabel}>Rows</span>
              <Select
                size="sm"
                value={String(rowsPerPage)}
                onChange={(v) => changeRows(Number(v))}
                ariaLabel="Rows per page"
                options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
              />
            </span>
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

const TAG_OPTIONS = [
  { value: "all", label: "All tags" },
  { value: "new", label: "New" },
  { value: "onboarding", label: "Onboarding" },
  { value: "tenured", label: "Tenured" },
];
// Sortable column header: label + a direction arrow. The active column shows
// up/down; the others show a faint up-down hint. A role="button" span (not
// <button>) keeps it clickable + keyboard-operable without the chrome a Button
// carries. Click toggles the sort key / direction in the parent.
function SortTh({ label, col, sortKey, dir, onSort }) {
  const active = sortKey === col;
  const Arrow = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => onSort(col)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSort(col);
        }
      }}
      aria-label={`Sort by ${label}${active ? (dir === "asc" ? ", ascending" : ", descending") : ""}`}
      style={styles.thSort}
    >
      {label}
      <Arrow
        size={13}
        aria-hidden="true"
        style={{ opacity: active ? 1 : 0.45, color: active ? "var(--color-text-medium)" : "var(--color-text-tertiary)" }}
      />
    </span>
  );
}

function TableToolbar({ bare, query, onQuery, tagFilter, onTag, showTag = true, toolbarAction = null }) {
  return (
    <div style={bare ? styles.toolbarBare : styles.toolbar}>
      <label style={styles.searchWrap}>
        <Search size={15} color="var(--color-text-tertiary)" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search agents by name"
          aria-label="Search agents by name"
          style={styles.searchInput}
        />
      </label>
      {(showTag || toolbarAction) && (
        <div style={styles.filters}>
          {showTag && <Select value={tagFilter} onChange={onTag} options={TAG_OPTIONS} ariaLabel="Filter by tag" />}
          {toolbarAction}
        </div>
      )}
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

function Avatar({ name, index }) {
  const initials = name.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  return (
    <span style={{ ...styles.avatar, background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
      {initials}
    </span>
  );
}

const GRID = "minmax(160px,0.9fr) 150px minmax(260px,2fr) 120px"; // + 84px action when shown
const GRID_BARE = "minmax(160px,0.9fr) minmax(260px,2fr) 120px"; // no Bucket column
const styles = {
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    padding: "20px",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  toolbarBare: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 12,
    padding: "0 0 12px",
  },
  searchWrap: {
    flex: 1,
    minWidth: 200,
    maxWidth: 360,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    fontSize: 13,
    color: "var(--color-text-deep)",
    background: "transparent",
    width: "100%",
  },
  filters: { display: "flex", alignItems: "center", gap: 8 },
  noMatch: { padding: "28px 20px", textAlign: "center", fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  noMatchBare: { padding: "24px 0", textAlign: "center", fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  slot: { padding: "12px 20px 0" },
  slotBare: { paddingTop: 12 },
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
  thSort: {
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    cursor: "pointer",
    userSelect: "none",
    width: "fit-content",
  },
  checkbox: { width: 16, height: 16, accentColor: "var(--do-brand-blue)", cursor: "pointer" },
  identity: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 },
  identityText: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  name: { fontSize: 13, fontWeight: 600, color: "var(--color-text-deep)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  tag: { alignSelf: "flex-start", padding: "1px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, letterSpacing: "0.2px", whiteSpace: "nowrap" },
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
  usageCell: { display: "flex", flexDirection: "column", gap: 5, minWidth: 0, paddingRight: 28 },
  usageCaption: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", whiteSpace: "nowrap" },
  status: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600 },
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
};
