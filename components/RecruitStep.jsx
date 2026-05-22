"use client";

import React from "react";
import { Search, SlidersHorizontal, ArrowUp, ArrowDown, Info } from "lucide-react";
import { AGENTS, MISSION_CAP } from "./mocks/missionAgents";
import RecruitFiltersDrawer, { EMPTY_FILTERS } from "./RecruitFiltersDrawer";
import { formatDate } from "./formatDate";


function matchesFilters(agent, filters) {
  if (filters.lastActive !== "all") {
    const ref = new Date();
    let cutoff;
    if (filters.lastActive === "7d")  cutoff = new Date(ref.getTime() - 7 * 86400000);
    else if (filters.lastActive === "30d") cutoff = new Date(ref.getTime() - 30 * 86400000);
    else if (filters.lastActive === "3m")  cutoff = new Date(ref.getFullYear(), ref.getMonth() - 3, ref.getDate());
    else if (filters.lastActive === "6m")  cutoff = new Date(ref.getFullYear(), ref.getMonth() - 6, ref.getDate());
    else if (filters.lastActive === "12m") cutoff = new Date(ref.getFullYear() - 1, ref.getMonth(), ref.getDate());
    if (cutoff && new Date(agent.lastActive) < cutoff) return false;
  }
  if (filters.teams.length > 0 && !filters.teams.includes(agent.team)) return false;
  if (filters.activeMissions.length > 0 && !filters.activeMissions.includes(agent.missions)) return false;
  if (filters.qaScore.length > 0) {
    const bucket = agent.qaScore >= 90 ? "high" : agent.qaScore >= 70 ? "mid" : "low";
    if (!filters.qaScore.includes(bucket)) return false;
  }
  return true;
}

function sortAgents(list, sort) {
  const sorted = [...list];
  sorted.sort((a, b) => {
    let cmp = 0;
    if (sort.field === "qaScore") cmp = a.qaScore - b.qaScore;
    else if (sort.field === "lastActive") cmp = a.lastActive.localeCompare(b.lastActive);
    return sort.direction === "desc" ? -cmp : cmp;
  });
  return sorted;
}

export default function RecruitStep({ draft, onChange }) {
  const recruit = draft.recruit || { agentIds: [], filters: EMPTY_FILTERS, sort: { field: "qaScore", direction: "asc" }, search: "" };
  const [filtersOpen, setFiltersOpen] = React.useState(false);

  const setRecruit = (patch) =>
    onChange({ ...draft, recruit: { ...recruit, ...patch } });

  const agentIds = recruit.agentIds;
  const search = recruit.search;
  const sort = recruit.sort;
  const filters = recruit.filters || EMPTY_FILTERS;

  const focusAreaCount = (draft.focusArea?.rows ?? []).filter((r) => r.focusAreaId).length;

  let visible = AGENTS;
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    visible = visible.filter((a) => a.name.toLowerCase().includes(q));
  }
  visible = visible.filter((a) => matchesFilters(a, filters));
  visible = sortAgents(visible, sort);

  const selectableVisible = visible.filter((a) => a.missions < MISSION_CAP);
  const allSelectableChecked = selectableVisible.length > 0 && selectableVisible.every((a) => agentIds.includes(a.id));

  const toggleAgent = (id) => {
    setRecruit({
      agentIds: agentIds.includes(id)
        ? agentIds.filter((x) => x !== id)
        : [...agentIds, id],
    });
  };

  const toggleAll = () => {
    if (allSelectableChecked) {
      const visIds = new Set(selectableVisible.map((a) => a.id));
      setRecruit({ agentIds: agentIds.filter((id) => !visIds.has(id)) });
    } else {
      const merged = new Set(agentIds);
      selectableVisible.forEach((a) => merged.add(a.id));
      setRecruit({ agentIds: [...merged] });
    }
  };

  const toggleSort = (field) => {
    if (sort.field === field) {
      setRecruit({ sort: { field, direction: sort.direction === "asc" ? "desc" : "asc" } });
    } else {
      setRecruit({ sort: { field, direction: "asc" } });
    }
  };

  const SortIcon = ({ field }) => {
    if (sort.field !== field) return <ArrowDown size={14} color="var(--color-text-placeholder)" />;
    return sort.direction === "asc"
      ? <ArrowUp size={14} color="var(--color-text-deep)" />
      : <ArrowDown size={14} color="var(--color-text-deep)" />;
  };

  const initials = (name) => {
    const parts = name.split(" ");
    return parts.map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  };

  const avatarColor = (name) => {
    const colors = ["#245BFF", "#2AC5A0", "#F5A623", "#FF6B6B", "#A78BFA", "#38BDF8"];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
    return colors[Math.abs(h) % colors.length];
  };

  const qaBadge = (score) => {
    if (score >= 90) return { bg: "var(--color-success-bg)", color: "var(--color-success)", label: `${score}%` };
    if (score >= 70) return { bg: "var(--color-warning-bg)", color: "var(--color-warning)", label: `${score}%` };
    return { bg: "var(--color-error-bg)", color: "var(--color-error)", label: `${score}%` };
  };

  return (
    <>
      <div style={rsStyles.headerRow}>
        <div style={rsStyles.headerLeft}>
          <div style={rsStyles.title}>Recruit Agents</div>
          <div style={rsStyles.subtitle}>
            Select agents for this mission. Agents can have up to 3 active missions.
          </div>
        </div>
        <div style={rsStyles.chips}>
          <span style={rsStyles.chip}>
            <span style={rsStyles.chipLabel}>Focus Areas</span>
            <span style={rsStyles.chipCount}>{focusAreaCount}</span>
          </span>
          <span style={rsStyles.chip}>
            <span style={rsStyles.chipLabel}>Agents Recruited</span>
            <span style={rsStyles.chipCount}>{agentIds.length}</span>
          </span>
        </div>
      </div>

      <div style={rsStyles.toolbar}>
        <div style={rsStyles.searchWrap}>
          <Search size={16} style={rsStyles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setRecruit({ search: e.target.value })}
            placeholder="Search by agent name"
            aria-label="Search agents"
            style={rsStyles.searchInput}
          />
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen(true)}
          aria-label="Open filters"
          style={rsStyles.filterBtn}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      <div style={rsStyles.tableWrap}>
        <div style={rsStyles.thead}>
          <div style={rsStyles.thCheck}>
            <input
              type="checkbox"
              checked={allSelectableChecked}
              onChange={toggleAll}
              aria-label="Select all agents"
              style={rsStyles.checkbox}
            />
          </div>
          <div style={rsStyles.thAgent}>Agent</div>
          <div style={rsStyles.thTeam}>Team Name</div>
          <div style={rsStyles.thMissions}>
            <span>Missions</span>
            <span
              title="An agent can only have a maximum of 3 active missions at any given time."
              style={rsStyles.infoIcon}
            >
              <Info size={14} />
            </span>
          </div>
          <div style={rsStyles.thSortable} onClick={() => toggleSort("lastActive")}>
            <span>Last Active</span>
            <SortIcon field="lastActive" />
          </div>
          <div style={rsStyles.thSortable} onClick={() => toggleSort("qaScore")}>
            <span>QA Score</span>
            <SortIcon field="qaScore" />
          </div>
        </div>

        {visible.map((agent) => {
          const atCap = agent.missions >= MISSION_CAP;
          const checked = agentIds.includes(agent.id);
          const badge = qaBadge(agent.qaScore);
          return (
            <div
              key={agent.id}
              style={{
                ...rsStyles.row,
                opacity: atCap ? 0.55 : 1,
              }}
            >
              <div style={rsStyles.cellCheck}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={atCap}
                  onChange={() => toggleAgent(agent.id)}
                  title={atCap ? "This agent already has 3 active missions. Complete or remove one to assign a new mission." : undefined}
                  aria-label={`Select ${agent.name}`}
                  style={rsStyles.checkbox}
                />
              </div>
              <div style={rsStyles.cellAgent}>
                <span
                  style={{
                    ...rsStyles.avatar,
                    background: avatarColor(agent.name),
                  }}
                >
                  {initials(agent.name)}
                </span>
                <span style={rsStyles.agentName}>{agent.name}</span>
              </div>
              <div style={rsStyles.cellTeam}>{agent.team}</div>
              <div style={rsStyles.cellMissions}>{agent.missions}/{MISSION_CAP}</div>
              <div style={rsStyles.cellDate}>{formatDate(agent.lastActive)}</div>
              <div style={rsStyles.cellQa}>
                <span
                  style={{
                    ...rsStyles.qaBadge,
                    background: badge.bg,
                    color: badge.color,
                  }}
                >
                  {badge.label}
                </span>
              </div>
            </div>
          );
        })}

        {visible.length === 0 && (
          <div style={rsStyles.emptyRow}>No agents match the current search or filters.</div>
        )}
      </div>

      <RecruitFiltersDrawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        onApply={(next) => setRecruit({ filters: next })}
      />
    </>
  );
}

export function isRecruitValid(draft) {
  return (draft.recruit?.agentIds ?? []).length >= 1;
}

export const DEMO_DRAFT_RECRUIT = {
  agentIds: ["ag-malik", "ag-priya", "ag-kenji", "ag-omar"],
  filters: { ...EMPTY_FILTERS },
  sort: { field: "qaScore", direction: "asc" },
  search: "",
};

const COL_TEMPLATE = "48px 1fr 140px 90px 130px 100px";

const rsStyles = {
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 24,
  },
  headerLeft: { display: "flex", flexDirection: "column", gap: 4 },
  title: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 20,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
  },
  subtitle: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.5,
  },
  chips: { display: "flex", gap: 12, flexShrink: 0 },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 32,
    paddingInline: 12,
    borderRadius: 999,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    color: "var(--color-text-deep)",
  },
  chipLabel: { fontWeight: 500, color: "var(--color-text-tertiary)" },
  chipCount: { fontWeight: 700 },

  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
    height: 40,
    paddingInline: 12,
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
  },
  searchIcon: { color: "var(--color-text-tertiary)", flexShrink: 0 },
  searchInput: {
    flex: 1,
    height: "100%",
    background: "transparent",
    border: "none",
    outline: "none",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-medium)",
    minWidth: 0,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    color: "var(--color-text-medium)",
    flexShrink: 0,
  },

  tableWrap: {
    display: "flex",
    flexDirection: "column",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 8,
    overflow: "hidden",
  },
  thead: {
    display: "grid",
    gridTemplateColumns: COL_TEMPLATE,
    alignItems: "center",
    height: 44,
    paddingInline: 16,
    background: "var(--color-card-emoji-bg)",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  thCheck: { display: "flex", alignItems: "center", justifyContent: "center" },
  thAgent: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    paddingLeft: 8,
  },
  thTeam: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  thMissions: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  thSortable: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    cursor: "pointer",
    userSelect: "none",
  },
  infoIcon: {
    display: "inline-flex",
    alignItems: "center",
    color: "var(--color-text-tertiary)",
    cursor: "help",
  },

  row: {
    display: "grid",
    gridTemplateColumns: COL_TEMPLATE,
    alignItems: "center",
    height: 52,
    paddingInline: 16,
    borderBottom: "1px solid var(--table-row-border)",
    transition: "background 80ms",
  },
  cellCheck: { display: "flex", alignItems: "center", justifyContent: "center" },
  cellAgent: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    paddingLeft: 8,
    minWidth: 0,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    flexShrink: 0,
  },
  agentName: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cellTeam: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    color: "var(--color-text-medium)",
  },
  cellMissions: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  cellDate: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    color: "var(--color-text-medium)",
  },
  cellQa: { display: "flex", alignItems: "center" },
  qaBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 24,
    paddingInline: 10,
    borderRadius: 999,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 700,
  },
  checkbox: { cursor: "pointer", width: 16, height: 16, accentColor: "var(--color-button-primary-bg)" },

  emptyRow: {
    padding: "32px 16px",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    textAlign: "center",
  },
};
