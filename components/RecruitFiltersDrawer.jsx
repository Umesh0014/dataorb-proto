"use client";

import React from "react";
import { X, Search, ChevronDown, ChevronUp, Check } from "lucide-react";
import { TEAMS } from "./mocks/missionAgents";

const LAST_ACTIVE_OPTIONS = [
  { value: "7d",  label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "3m",  label: "Last 3 months" },
  { value: "6m",  label: "Last 6 months" },
  { value: "12m", label: "Last 12 months" },
  { value: "all", label: "All time" },
];

const ACTIVE_MISSIONS_OPTIONS = [
  { value: 0, label: "0" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
];

const QA_SCORE_OPTIONS = [
  { value: "high", label: "≥ 90%" },
  { value: "mid",  label: "70–89%" },
  { value: "low",  label: "< 70%" },
];

const PANEL_WIDTH = 360;

const EMPTY_FILTERS = {
  lastActive: "all",
  teams: [],
  activeMissions: [],
  qaScore: [],
};

export { EMPTY_FILTERS };

export default function RecruitFiltersDrawer({
  open,
  onClose,
  filters,
  onApply,
}) {
  const [local, setLocal] = React.useState(filters);
  const [search, setSearch] = React.useState("");
  const [expanded, setExpanded] = React.useState("lastActive");

  React.useEffect(() => {
    if (open) {
      setLocal(filters);
      setSearch("");
    }
  }, [open, filters]);

  if (!open) return null;

  const q = search.trim().toLowerCase();

  const sections = [
    { key: "lastActive",      label: "Last Active" },
    { key: "teams",           label: "Team" },
    { key: "activeMissions",  label: "Active Missions" },
    { key: "qaScore",         label: "QA Score" },
  ].filter((s) => !q || s.label.toLowerCase().includes(q));

  const hasChanges =
    local.lastActive !== filters.lastActive ||
    JSON.stringify(local.teams) !== JSON.stringify(filters.teams) ||
    JSON.stringify(local.activeMissions) !== JSON.stringify(filters.activeMissions) ||
    JSON.stringify(local.qaScore) !== JSON.stringify(filters.qaScore);

  const hasAny =
    local.lastActive !== "all" ||
    local.teams.length > 0 ||
    local.activeMissions.length > 0 ||
    local.qaScore.length > 0;

  const deselectAll = () => setLocal({ ...EMPTY_FILTERS });

  const toggle = (key) =>
    setExpanded((prev) => (prev === key ? null : key));

  const setField = (key, val) => setLocal((prev) => ({ ...prev, [key]: val }));

  const toggleMulti = (key, val) => {
    setLocal((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(val)
          ? arr.filter((v) => v !== val)
          : [...arr, val],
      };
    });
  };

  return (
    <aside
      role="complementary"
      aria-label="Filters"
      style={rfdStyles.panel}
    >
      <div style={rfdStyles.header}>
        <span style={rfdStyles.title}>Filters</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          style={rfdStyles.closeBtn}
        >
          <X size={18} />
        </button>
      </div>

      <div style={rfdStyles.searchWrap}>
        <Search size={16} style={rfdStyles.searchIcon} aria-hidden="true" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by filter name"
          aria-label="Search filters"
          style={rfdStyles.searchInput}
        />
      </div>

      <div style={rfdStyles.body}>
        {sections.map((sec) => (
          <div key={sec.key} style={rfdStyles.section}>
            <button
              type="button"
              onClick={() => toggle(sec.key)}
              style={rfdStyles.sectionHeader}
            >
              <span style={rfdStyles.sectionLabel}>{sec.label}</span>
              {expanded === sec.key
                ? <ChevronUp size={18} color="var(--color-text-tertiary)" />
                : <ChevronDown size={18} color="var(--color-text-tertiary)" />}
            </button>

            {expanded === sec.key && (
              <div style={rfdStyles.sectionBody}>
                {sec.key === "lastActive" && (
                  <SingleSelectList
                    options={LAST_ACTIVE_OPTIONS}
                    value={local.lastActive}
                    onChange={(v) => setField("lastActive", v)}
                  />
                )}
                {sec.key === "teams" && (
                  <MultiSelectList
                    options={TEAMS.map((t) => ({ value: t, label: t }))}
                    selected={local.teams}
                    onToggle={(v) => toggleMulti("teams", v)}
                  />
                )}
                {sec.key === "activeMissions" && (
                  <MultiSelectList
                    options={ACTIVE_MISSIONS_OPTIONS}
                    selected={local.activeMissions}
                    onToggle={(v) => toggleMulti("activeMissions", v)}
                  />
                )}
                {sec.key === "qaScore" && (
                  <MultiSelectList
                    options={QA_SCORE_OPTIONS}
                    selected={local.qaScore}
                    onToggle={(v) => toggleMulti("qaScore", v)}
                  />
                )}
              </div>
            )}
          </div>
        ))}

        {sections.length === 0 && (
          <div style={rfdStyles.emptySearch}>
            No filters match &ldquo;{search}&rdquo;.
          </div>
        )}
      </div>

      <div style={rfdStyles.footer}>
        <button
          type="button"
          onClick={deselectAll}
          disabled={!hasAny}
          style={{
            ...rfdStyles.footerBtn,
            color: hasAny
              ? "var(--color-text-medium)"
              : "var(--color-text-tertiary)",
            cursor: hasAny ? "pointer" : "default",
          }}
        >
          Deselect all
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            ...rfdStyles.footerBtn,
            color: "var(--color-text-medium)",
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => { onApply(local); onClose(); }}
          disabled={!hasChanges}
          style={{
            ...rfdStyles.applyBtn,
            opacity: hasChanges ? 1 : 0.5,
            cursor: hasChanges ? "pointer" : "default",
          }}
        >
          Apply
        </button>
      </div>
    </aside>
  );
}

function SingleSelectList({ options, value, onChange }) {
  return (
    <div style={rfdStyles.optionList}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              ...rfdStyles.optionRow,
              fontWeight: active ? 600 : 400,
              background: active ? "var(--pill-bg)" : "transparent",
            }}
          >
            <span>{opt.label}</span>
            {active && <Check size={16} color="var(--color-button-primary-bg)" />}
          </button>
        );
      })}
    </div>
  );
}

function MultiSelectList({ options, selected, onToggle }) {
  return (
    <div style={rfdStyles.optionList}>
      {options.map((opt) => {
        const checked = selected.includes(opt.value);
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onToggle(opt.value)}
            style={{
              ...rfdStyles.optionRow,
              fontWeight: checked ? 600 : 400,
              background: checked ? "var(--pill-bg)" : "transparent",
            }}
          >
            <span style={rfdStyles.checkboxWrap}>
              <span
                style={{
                  ...rfdStyles.checkbox,
                  background: checked
                    ? "var(--color-button-primary-bg)"
                    : "var(--surface-white)",
                  borderColor: checked
                    ? "var(--color-button-primary-bg)"
                    : "var(--color-divider-card)",
                }}
              >
                {checked && <Check size={12} color="#fff" />}
              </span>
              <span>{opt.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

const rfdStyles = {
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: PANEL_WIDTH,
    background: "var(--surface-white)",
    borderLeft: "1px solid var(--color-divider-card)",
    boxShadow: "-4px 0 24px rgba(0,0,0,0.10)",
    display: "flex",
    flexDirection: "column",
    zIndex: 40,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: 20,
    height: 56,
    borderBottom: "1px solid var(--color-divider-card)",
    flexShrink: 0,
  },
  title: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    color: "var(--color-text-medium)",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    height: 44,
    paddingInline: 20,
    borderBottom: "1px solid var(--color-divider-card)",
    flexShrink: 0,
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
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
  },
  section: {
    borderBottom: "1px solid var(--color-divider-card)",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "14px 20px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },
  sectionLabel: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  sectionBody: {
    padding: "0 12px 12px",
  },
  optionList: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: "10px 12px",
    border: "none",
    borderRadius: 6,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    color: "var(--color-text-deep)",
    cursor: "pointer",
    textAlign: "left",
  },
  checkboxWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    border: "2px solid",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  emptySearch: {
    padding: "24px 20px",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    textAlign: "center",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 56,
    paddingInline: 20,
    borderTop: "1px solid var(--color-divider-card)",
    flexShrink: 0,
    gap: 12,
  },
  footerBtn: {
    border: "none",
    background: "transparent",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 700,
    padding: 0,
  },
  applyBtn: {
    height: 36,
    paddingInline: 20,
    borderRadius: 8,
    border: "none",
    background: "var(--color-button-primary-bg)",
    color: "var(--color-button-primary-fg)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
};
