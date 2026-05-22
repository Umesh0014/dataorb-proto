"use client";

import React from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
} from "lucide-react";
import Card from "./Card";
import MissionDetailContent from "./MissionDetailContent";
import KebabMenu from "./KebabMenu";

// Per-row action menu options — sourced verbatim from the Active
// DetailHeader in MissionsPage. Uniform across all mission states in the
// Dense/Hybrid table (open question: per-state option sets).
const ROW_ACTIONS = ["Edit mission", "Duplicate mission", "Close mission", "Delete mission"];

// MissionsTable — shared dense table for the Dense table (Option 2) and
// Hybrid table (Option 4) layouts. The two layouts differ only in row
// interaction: Option 2 navigates to a detail page, Option 4 toggles an
// inline expanded panel rendered directly beneath the clicked row.
//
// Sizing rules (from the polish prompt):
//   - Body row min-height 56 (16px padding top+bottom + content).
//   - Header row 48 high, slightly heavier bottom border.
//   - Horizontal padding 16 on every cell.
//   - table-layout: fixed + explicit column widths so the table never
//     horizontal-scrolls; only the Mission column truncates.

const AVATAR_PALETTE = [
  "#E3867F", "#F0B775", "#8DC99E", "#7CB0D6",
  "#C59BD8", "#6DC6B9", "#E88FA2", "#A7AAD1",
];

function avatarColor(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = seed.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

// Maps the raw mission state to the four labels the column actually
// renders. Drafts are filtered out upstream so they don't appear here.
function displayStatus(state) {
  if (state === "completed") return { label: "Completed", tone: "grey", order: 3 };
  if (state === "ends_today") return { label: "At Risk", tone: "red", order: 1 };
  if (state === "ending_soon") return { label: "Ending Soon", tone: "orange", order: 2 };
  return { label: "Active", tone: "blue", order: 0 };
}

const STATUS_TONE = {
  blue:   { bg: "var(--color-info-bg)",    fg: "var(--color-info-text)" },
  red:    { bg: "var(--color-error-bg)",   fg: "var(--color-error)" },
  orange: { bg: "var(--color-warning-bg)", fg: "var(--color-warning)" },
  grey:   { bg: "var(--pill-bg)",          fg: "var(--color-text-tertiary)" },
};

function progressColor(pct) {
  if (pct >= 80) return "var(--color-success)";
  if (pct >= 50) return "var(--color-warning)";
  return "var(--color-error)";
}

function ownerInitial(mission) {
  if (mission.ownerInitials) return mission.ownerInitials;
  return mission.name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();
}

const STATUS_ORDER = {
  Active: 0,
  "At Risk": 1,
  "Ending Soon": 2,
  Completed: 3,
};

// Sort comparators. Each takes a mission and returns a comparable value
// matching the spec's per-column semantics.
const SORT_KEYS = {
  name:     (m) => m.name.toLowerCase(),
  // Workflow-order: Active < At Risk < Ending Soon < Completed.
  status:   (m) => STATUS_ORDER[displayStatus(m.state).label] ?? 99,
  agents:   (m) => m.agentCount ?? 0,
  progress: (m) => m.progress ?? 0,
  // Last roleplay: `—` sorts to the top (oldest first) so missions that
  // never had one surface as the most stale.
  last:     (m) => {
    const v = m.kpis?.lastRoleplay;
    if (!v) return Number.NEGATIVE_INFINITY;
    const parsed = Date.parse(v);
    return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
  },
  daysLeft: (m) => m.daysLeft ?? Number.POSITIVE_INFINITY,
};

const SORT_STORAGE_KEY = "dataorb.missions.tableSort";
const DEFAULT_SORT = { key: "status", dir: "asc" };

function readStoredSort() {
  if (typeof window === "undefined") return DEFAULT_SORT;
  try {
    const raw = window.localStorage.getItem(SORT_STORAGE_KEY);
    if (!raw) return DEFAULT_SORT;
    const parsed = JSON.parse(raw);
    if (parsed && SORT_KEYS[parsed.key] && (parsed.dir === "asc" || parsed.dir === "desc")) {
      return parsed;
    }
  } catch {
    // ignore malformed JSON
  }
  return DEFAULT_SORT;
}

function writeStoredSort(sort) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(sort));
  } catch {
    // ignore write errors
  }
}

export default function MissionsTable({
  missions,
  expandable = false,
  onSelectMission,
  expandedId = null,
  onToggleExpand,
}) {
  const [sort, setSort] = React.useState(readStoredSort);

  const sorted = React.useMemo(() => {
    const list = [...missions];
    const primary = SORT_KEYS[sort.key] || (() => 0);
    // Stable secondary sort: when the user has not chosen Days left, fall
    // back to days-left ascending so ties read "most urgent first".
    const secondary = sort.key === "daysLeft" ? () => 0 : SORT_KEYS.daysLeft;
    list.sort((a, b) => {
      const av = primary(a);
      const bv = primary(b);
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      const sa = secondary(a);
      const sb = secondary(b);
      if (sa < sb) return -1;
      if (sa > sb) return 1;
      return 0;
    });
    return list;
  }, [missions, sort]);

  const onHeaderClick = (key) => {
    setSort((cur) => {
      const next = cur.key === key
        ? { key, dir: cur.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" };
      writeStoredSort(next);
      return next;
    });
  };

  // Column schema: order, label, sort key (or null when not sortable),
  // and explicit min/max widths. The Mission column claims the leftover
  // space via `width: auto` + table-layout: fixed; every other column
  // gets a fixed pixel width.
  // Column widths sized to fit the narrow 1068px PageLayout chassis.
  // Fixed columns sum to ≈748; Mission column flexes with a 200 minimum.
  // Owner stays removed; Actions (kebab) re-added at the trailing edge.
  const cols = [
    expandable && { id: "expand", label: "", sortKey: null, width: 36, align: "center" },
    { id: "name",     label: "Mission",       sortKey: "name",     align: "left",  flex: true },
    { id: "status",   label: "Status",        sortKey: "status",   align: "left",  width: 96 },
    { id: "days",     label: "Days left",     sortKey: "daysLeft", align: "left",  width: 100 },
    { id: "agents",   label: "Agents",        sortKey: "agents",   align: "right", width: 64 },
    { id: "focus",    label: "Focus areas",   sortKey: null,       align: "left",  width: 160 },
    { id: "progress", label: "Progress",      sortKey: "progress", align: "left",  width: 180 },
    { id: "last",     label: "Last roleplay", sortKey: "last",     align: "left",  width: 100 },
    { id: "actions",  label: "",              sortKey: null,       align: "center", width: 48 },
  ].filter(Boolean);

  return (
    <Card padX={0} padY={0} style={mtStyles.card}>
      <table style={mtStyles.table}>
        <colgroup>
          {cols.map((c) => (
            <col
              key={c.id}
              style={{
                width: c.flex ? "auto" : c.width,
                minWidth: c.flex ? 200 : c.width,
              }}
            />
          ))}
        </colgroup>
        <thead>
          <tr style={mtStyles.theadRow}>
            {cols.map((c) => {
              const sortable = Boolean(c.sortKey);
              const isActive = sortable && sort.key === c.sortKey;
              return (
                <th
                  key={c.id}
                  style={{
                    ...mtStyles.th,
                    textAlign: c.align,
                    cursor: sortable ? "pointer" : "default",
                  }}
                  onClick={sortable ? () => onHeaderClick(c.sortKey) : undefined}
                  onMouseEnter={sortable
                    ? (e) => { e.currentTarget.style.background = "#F5F4FB"; }
                    : undefined}
                  onMouseLeave={sortable
                    ? (e) => { e.currentTarget.style.background = "#F8F7FB"; }
                    : undefined}
                  aria-sort={
                    isActive
                      ? sort.dir === "asc" ? "ascending" : "descending"
                      : sortable ? "none" : undefined
                  }
                >
                  <span
                    style={{
                      ...mtStyles.thInner,
                      justifyContent: c.align === "right" ? "flex-end" : "flex-start",
                    }}
                  >
                    {c.label}
                    {isActive && (
                      sort.dir === "asc"
                        ? <ChevronUp size={12} />
                        : <ChevronDown size={12} />
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((m) => {
            const expanded = expandable && expandedId === m.id;
            return (
              <React.Fragment key={m.id}>
                <Row
                  mission={m}
                  expandable={expandable}
                  expanded={expanded}
                  onClick={() => {
                    if (expandable) onToggleExpand?.(expanded ? null : m.id);
                    else onSelectMission?.(m.id);
                  }}
                />
                {expanded && (
                  <tr style={mtStyles.expandedRow}>
                    <td colSpan={cols.length} style={mtStyles.expandedCell}>
                      <MissionDetailContent mission={m} compact />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <div style={mtStyles.empty}>No missions match these filters.</div>
      )}
    </Card>
  );
}

function Row({ mission, expandable, expanded, onClick }) {
  const [hover, setHover] = React.useState(false);
  const status = displayStatus(mission.state);
  const statusTone = STATUS_TONE[status.tone];
  const focusTags = mission.tags || [];
  const lastDate = mission.kpis?.lastRoleplay;
  const lastDateStale = (() => {
    if (!lastDate) return false;
    const parsed = Date.parse(lastDate);
    if (Number.isNaN(parsed)) return false;
    const days = (Date.now() - parsed) / 86_400_000;
    return days > 7;
  })();
  const daysLeft = mission.daysLeft;
  const daysLeftUrgent = daysLeft != null && daysLeft <= 3 && daysLeft >= 0;

  return (
    <tr
      style={{
        ...mtStyles.row,
        background: expanded ? "#FAFAFC" : hover ? "#F5F4FB" : "#FFFFFF",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
    >
      {expandable && (
        <td style={{ ...mtStyles.td, padding: "16px 0", textAlign: "center" }}>
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 120ms ease",
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              color: "#1F2440",
            }}
          >
            <ChevronRight size={14} />
          </span>
        </td>
      )}
      <td style={mtStyles.td}>
        <span style={mtStyles.name} title={mission.name}>
          {mission.name}
        </span>
      </td>
      <td style={mtStyles.td}>
        <span
          style={{
            ...mtStyles.statusPill,
            background: statusTone.bg,
            color: statusTone.fg,
          }}
        >
          {status.label}
        </span>
      </td>
      <td style={mtStyles.td}>
        {daysLeft == null ? (
          <span style={mtStyles.muted}>—</span>
        ) : daysLeft < 0 ? (
          <span style={mtStyles.muted}>Closed</span>
        ) : daysLeft === 0 ? (
          <span style={{ ...mtStyles.daysLeftUrgent, color: "var(--color-error)" }}>
            <Clock size={12} /> Ends today
          </span>
        ) : daysLeftUrgent ? (
          <span style={{ ...mtStyles.daysLeftUrgent, color: "var(--color-error)" }}>
            <Clock size={12} /> {daysLeft} days left
          </span>
        ) : (
          <span>{daysLeft} days left</span>
        )}
      </td>
      <td style={{ ...mtStyles.td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
        {mission.agentCount}
      </td>
      <td style={mtStyles.td}>
        <FocusChips tags={focusTags} />
      </td>
      <td style={mtStyles.td}>
        <ProgressCell pct={mission.progress} />
      </td>
      <td style={{ ...mtStyles.td, color: lastDateStale ? "var(--color-text-tertiary)" : "var(--color-text-deep)" }}>
        {lastDate || "—"}
      </td>
      <td
        style={{ ...mtStyles.td, padding: "16px 0", textAlign: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        <KebabMenu
          ariaLabel="Mission actions"
          items={ROW_ACTIONS.map((label) => ({
            label,
            onClick: () => console.log(label),
          }))}
        />
      </td>
    </tr>
  );
}

function FocusChips({ tags }) {
  if (!tags || tags.length === 0) return <span style={mtStyles.muted}>—</span>;
  const visible = tags.slice(0, 2);
  const overflow = tags.length - visible.length;
  const overflowList = tags.slice(2).join("\n");
  return (
    <span style={mtStyles.chipsRow}>
      {visible.map((t) => (
        <span key={t} style={mtStyles.focusChip} title={t}>{t}</span>
      ))}
      {overflow > 0 && (
        <span
          style={{ ...mtStyles.focusChip, ...mtStyles.focusChipOverflow }}
          title={overflowList}
        >
          +{overflow}
        </span>
      )}
    </span>
  );
}

function ProgressCell({ pct }) {
  const v = Math.max(0, Math.min(100, pct ?? 0));
  const color = progressColor(v);
  return (
    <span style={mtStyles.progressRow}>
      <span style={mtStyles.progressTrack}>
        <span style={{ ...mtStyles.progressFill, width: `${v}%`, background: color }} />
      </span>
      <span style={{ ...mtStyles.progressLabel, color }}>{v}% target met</span>
    </span>
  );
}

const mtStyles = {
  card: { overflow: "hidden" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontSize: 13,
    fontFamily: "var(--font-sans)",
  },
  theadRow: {
    background: "#F8F7FB",
  },
  th: {
    height: 48,
    padding: "0 12px",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    borderBottom: "1.5px solid var(--color-divider-card)",
    userSelect: "none",
    whiteSpace: "nowrap",
    transition: "background 120ms ease",
  },
  thInner: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  },
  row: {
    transition: "background 120ms ease",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  td: {
    padding: "16px 12px",
    verticalAlign: "middle",
    color: "var(--color-text-deep)",
    overflow: "hidden",
  },
  name: {
    fontWeight: 600,
    color: "#1F2440",
    fontSize: 14,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "block",
    width: "100%",
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  chipsRow: {
    display: "inline-flex",
    gap: 4,
    flexWrap: "nowrap",
    overflow: "hidden",
    maxWidth: "100%",
  },
  focusChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    background: "#EEEEF8",
    color: "#3A3F58",
    whiteSpace: "nowrap",
    maxWidth: 110,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  focusChipOverflow: {
    background: "#F4F3F8",
    color: "var(--color-text-tertiary)",
    flexShrink: 0,
    maxWidth: "none",
  },
  progressRow: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    background: "#EEEEF8",
    overflow: "hidden",
    minWidth: 60,
  },
  progressFill: {
    display: "block",
    height: "100%",
    transition: "width 200ms ease",
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  daysLeftUrgent: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  muted: { color: "var(--color-text-tertiary)" },
  owner: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: 12,
    fontFamily: "var(--font-sans)",
    flexShrink: 0,
  },
  kebab: {
    appearance: "none",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "var(--color-text-tertiary)",
    width: 28,
    height: 28,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  expandedRow: { background: "#FAFAFC" },
  expandedCell: {
    padding: 16,
    background: "#FAFAFC",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  empty: {
    padding: "48px 24px",
    textAlign: "center",
    color: "var(--color-text-tertiary)",
    fontSize: 13,
  },
};

export { displayStatus, STATUS_TONE, progressColor, avatarColor, ownerInitial };
