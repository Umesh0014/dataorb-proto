"use client";

import React from "react";
import {
  Plus,
  Search,
  ArrowUpDown,
  ListFilter,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  Info,
  Target,
  BadgeCheck,
  Gauge,
  RefreshCw,
  Headset,
  Tag,
  AlertTriangle,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import TabsRow from "./TabsRow";
import { TasksIcon } from "./SideNav/icons";

// TasksPage — Ask Mira Pro module's Tasks landing page. Lists every task
// (one run of a skill) the workspace has created, with status-filtered
// tabs and a paginated table. Renders inside the PageLayout from
// app/page.jsx.

const SEARCH_DEBOUNCE_MS = 150;
const PAGE_SIZE = 10;

// lucide-react icon name (skill.iconName) → component.
const ICON_MAP = { Target, BadgeCheck, Gauge, RefreshCw, Headset, Tag, AlertTriangle };

// Category tint → { bg, glyph } token pair — same mapping as SkillsPage.
const TINT = {
  purple: { bg: "var(--color-icon-tertiary-bg)", glyph: "var(--color-icon-tertiary-fg)" },
  green: { bg: "var(--color-success-bg)", glyph: "var(--color-success)" },
  teal: { bg: "var(--color-info-bg)", glyph: "var(--color-info)" },
  pink: { bg: "var(--color-error-bg)", glyph: "var(--color-secondary-500)" },
  orange: { bg: "var(--color-warning-bg)", glyph: "var(--color-warning)" },
  red: { bg: "var(--color-error-bg)", glyph: "var(--color-error)" },
};

// Status → dot colour + label. Colour lives in the dot only — the label
// stays neutral so the column doesn't read as a row of pills.
const STATUS_META = {
  generating: { label: "Generating", dot: "var(--color-primary-500)" },
  queued: { label: "Queued", dot: "var(--color-warning)" },
  completed: { label: "Completed", dot: "var(--color-success)" },
  failed: { label: "Failed", dot: "var(--color-error)" },
};

const TAB_META = [
  { id: "all", label: "All" },
  { id: "generating", label: "Generating" },
  { id: "queued", label: "Queued" },
  { id: "completed", label: "Completed" },
  { id: "failed", label: "Failed" },
];

// Deterministic avatar palette — mirrors the inline pattern in MissionsPage.
const AVATAR_PALETTE = [
  "#E3867F", "#F0B775", "#8DC99E", "#7CB0D6",
  "#C59BD8", "#6DC6B9", "#E88FA2", "#A7AAD1",
];

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

export default function TasksPage({ pageName, tasks = [], onOpenTask, onCreateTask }) {
  const [tab, setTab] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const previous = document.title;
    document.title = pageName || "Tasks";
    return () => {
      document.title = previous;
    };
  }, [pageName]);

  // Debounce the search filter so a burst of keystrokes filters once.
  React.useEffect(() => {
    const t = window.setTimeout(() => setQuery(search), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [search]);

  // Tab change and search change both return to page 1.
  React.useEffect(() => {
    setPage(1);
  }, [tab, query]);

  // Counts come from the data — All equals the sum of the status counts.
  const counts = React.useMemo(() => {
    const c = { all: tasks.length, generating: 0, queued: 0, completed: 0, failed: 0 };
    for (const t of tasks) {
      if (c[t.status] !== undefined) c[t.status] += 1;
    }
    return c;
  }, [tasks]);
  const tabs = TAB_META.map((t) => ({ ...t, count: counts[t.id] }));

  // Tab filter ∩ search filter. Tasks are newest-first.
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (tab !== "all" && t.status !== tab) return false;
      if (!q) return true;
      return (
        t.id.toLowerCase().includes(q) ||
        t.skill.name.toLowerCase().includes(q) ||
        t.runBy.name.toLowerCase().includes(q)
      );
    });
  }, [tab, query, tasks]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const goToPage = (next) => setPage(Math.min(Math.max(1, next), totalPages));

  const openTaskRecord = (id) => {
    if (onOpenTask) onOpenTask(id);
  };
  // TODO: open the detail sidecar once it exists.
  const openTaskDetail = (id) => console.log("open task detail", id);

  return (
    <div style={s.page}>
      <Card padX={28} padY={20} tone="default" style={s.headerCard}>
        <div style={s.headerInner}>
          <div style={s.row1}>
            <div style={s.identifier}>
              <span style={s.identIcon}>
                <TasksIcon size={18} />
              </span>
              <span style={s.identLabel}>Tasks</span>
            </div>
            <Button
              variant="primary"
              leadingIcon={<Plus size={16} />}
              onClick={onCreateTask}
            >
              Task
            </Button>
          </div>

          <div style={s.row2}>
            <Search size={18} color="var(--color-text-placeholder)" />
            <input
              type="text"
              className="tasks-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tasks"
              aria-label="Search tasks"
              style={s.searchInput}
            />
            <div style={s.iconGroup}>
              <Button variant="icon" size="sm" title="Sort" aria-label="Sort tasks">
                <ArrowUpDown size={18} />
              </Button>
              <Button variant="icon" size="sm" title="Filter" aria-label="Filter tasks">
                <ListFilter size={18} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <TabsRow tabs={tabs} activeTab={tab} onTabClick={setTab} />

      <Card padX={0} padY={0} tone="default" style={s.tableCard}>
        {filtered.length > 0 ? (
          <>
            <table style={s.table}>
              <colgroup>
                <col style={{ width: "18%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "22%" }} />
              </colgroup>
              <thead>
                <tr style={s.headRow}>
                  <th style={s.th} scope="col">Task ID</th>
                  <th style={s.th} scope="col">Skills</th>
                  <th style={s.th} scope="col">Run By</th>
                  <th style={s.th} scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((task, i) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    isLast={i === pageRows.length - 1}
                    onOpenRecord={openTaskRecord}
                    onOpenDetail={openTaskDetail}
                  />
                ))}
              </tbody>
            </table>

            <div style={s.footer}>
              <span style={s.footerTotal}>Total {filtered.length} Tasks</span>
              <div style={s.footerCtrls}>
                <PageBtn ariaLabel="First page" disabled={safePage <= 1} onClick={() => goToPage(1)}>
                  <ChevronsLeft size={16} />
                </PageBtn>
                <span style={s.pageLabel} aria-live="polite">
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
          </>
        ) : (
          <EmptyState />
        )}
      </Card>
    </div>
  );
}

// TaskRow — one task. The row navigates to the task record; the
// hover-only info icon opens the detail sidecar.
function TaskRow({ task, isLast, onOpenRecord, onOpenDetail }) {
  const [hover, setHover] = React.useState(false);
  const Icon = ICON_MAP[task.skill.iconName] || Target;
  const tint = TINT[task.skill.tint] || TINT.purple;
  const status = STATUS_META[task.status] || STATUS_META.queued;

  return (
    <tr
      onClick={() => onOpenRecord(task.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{
        ...s.row,
        borderBottom: isLast ? "none" : "1px solid var(--table-row-border)",
        background: hover ? "var(--table-row-hover)" : "transparent",
      }}
    >
      <td style={s.cell}>
        <span style={s.taskId}>{task.id}</span>
      </td>
      <td style={s.cell}>
        <span style={s.skillCell}>
          <span style={{ ...s.skillIcon, background: tint.bg, color: tint.glyph }}>
            <Icon size={16} />
          </span>
          <span style={s.skillName}>{task.skill.name}</span>
        </span>
      </td>
      <td style={s.cell}>
        <span style={s.runByCell}>
          <span
            style={{ ...s.avatar, background: avatarColor(task.runBy.name) }}
            aria-hidden="true"
          >
            {task.runBy.initials}
          </span>
          <span style={s.runByName}>{task.runBy.name}</span>
        </span>
      </td>
      <td style={s.statusCell}>
        <span style={s.statusWrap}>
          <span style={{ ...s.statusDot, background: status.dot }} />
          <span style={s.statusLabel}>{status.label}</span>
        </span>
        <button
          type="button"
          aria-label="View task details"
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetail(task.id);
          }}
          style={{
            ...s.infoBtn,
            opacity: hover ? 1 : 0,
            pointerEvents: hover ? "auto" : "none",
          }}
        >
          <Info size={18} color="var(--color-text-tertiary)" />
        </button>
      </td>
    </tr>
  );
}

function PageBtn({ children, onClick, disabled, ariaLabel }) {
  return (
    <Button variant="icon" size="sm" aria-label={ariaLabel} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  );
}

// EmptyState — shown in the table card when the tab + search yield no
// rows. Day-0 "no tasks at all" is not built — the mock always has data.
function EmptyState() {
  return (
    <div style={s.empty}>
      <span style={s.emptyIcon}>
        <Search size={28} color="var(--color-text-placeholder)" />
      </span>
      <span style={s.emptyHeading}>No tasks found</span>
      <span style={s.emptyBody}>
        No tasks match your search or this status. Try a different term.
      </span>
    </div>
  );
}

const s = {
  page: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    gap: "var(--page-card-gap)",
    fontFamily: "var(--font-sans)",
  },
  headerCard: { flexShrink: 0 },
  headerInner: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  row1: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  identifier: {
    display: "inline-flex",
    alignItems: "center",
  },
  identIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background: "var(--color-card-emoji-bg)",
    color: "var(--color-text-medium)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  identLabel: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  row2: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-deep)",
  },
  iconGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },

  tableCard: { overflow: "hidden" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontFamily: "var(--font-sans)",
  },
  headRow: { borderBottom: "1px solid var(--table-row-border)" },
  th: {
    padding: "14px 24px",
    textAlign: "left",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
    whiteSpace: "nowrap",
  },
  row: { cursor: "pointer", transition: "background 120ms ease" },
  cell: { padding: "16px 24px", verticalAlign: "middle" },
  statusCell: { padding: "16px 24px", verticalAlign: "middle", position: "relative" },
  taskId: { fontSize: 14, fontWeight: 500, color: "var(--color-text-deep)" },

  skillCell: { display: "flex", alignItems: "center", gap: 10, minWidth: 0 },
  skillIcon: {
    width: 28,
    height: 28,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  skillName: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    minWidth: 0,
  },

  runByCell: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 999,
    color: "var(--surface-white)",
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 700,
    flexShrink: 0,
    textTransform: "uppercase",
  },
  runByName: { fontSize: 14, fontWeight: 500, color: "var(--color-text-deep)" },

  statusWrap: { display: "inline-flex", alignItems: "center", gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 999, flexShrink: 0 },
  statusLabel: { fontSize: 14, fontWeight: 500, color: "var(--color-text-medium)" },
  infoBtn: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: "translateY(-50%)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    transition: "opacity 120ms ease",
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    borderTop: "1px solid var(--table-row-border)",
  },
  footerTotal: { fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  footerCtrls: { display: "flex", alignItems: "center", gap: 8 },
  pageLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    padding: "0 4px",
  },

  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 8,
    padding: "64px 24px",
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 999,
    background: "var(--color-card-emoji-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyHeading: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  emptyBody: {
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.5,
  },
};
