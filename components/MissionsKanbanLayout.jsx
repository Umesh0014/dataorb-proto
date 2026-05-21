"use client";

import React from "react";
import { Plus, Search, ArrowUpDown } from "lucide-react";
import PageHeader from "./PageHeader";
import { MissionsIcon } from "./SideNav/icons";
import MissionCardCompact from "./MissionCardCompact";
import { displayStatus, STATUS_TONE } from "./MissionsTable";

// MissionsKanbanLayout — Option 3. Four status columns (Active / At
// Risk / Ending Soon / Completed) populated from the same mission list
// the Dense layout uses. Read-only — no drag/drop. Status filter is
// hidden because status is the grouping axis.

const COLUMNS = [
  { id: "active",      label: "Active",       tone: "blue" },
  { id: "at_risk",     label: "At Risk",      tone: "red" },
  { id: "ending_soon", label: "Ending Soon",  tone: "orange" },
  { id: "completed",   label: "Completed",    tone: "grey" },
];

function statusBucket(state) {
  const s = displayStatus(state).label;
  if (s === "At Risk") return "at_risk";
  if (s === "Ending Soon") return "ending_soon";
  if (s === "Completed") return "completed";
  return "active";
}

export default function MissionsKanbanLayout({
  missions,
  onOpenMission,
  onCreateMission,
}) {
  const grouped = React.useMemo(() => {
    const out = { active: [], at_risk: [], ending_soon: [], completed: [] };
    for (const m of missions) {
      const b = statusBucket(m.state);
      if (out[b]) out[b].push(m);
    }
    return out;
  }, [missions]);

  return (
    <div style={layoutStyles.shell}>
      <div style={layoutStyles.content}>
        <PageHeader
          identifier={{
            icon: <MissionsIcon size={18} color="#245BFF" />,
            label: "Missions",
            withDropdown: true,
            onClick: () => {},
          }}
          primaryAction={{
            label: "Missions",
            icon: <Plus size={16} />,
            onClick: onCreateMission,
          }}
          filters={[
            { id: "team",    label: "Team",         value: "All",         onClick: () => console.log("team filter") },
            { id: "created", label: "Created Date", value: "Last 7 days", onClick: () => console.log("created filter") },
          ]}
          toolbar={[
            { id: "search", icon: <Search size={18} />,     label: "Search", onClick: () => console.log("search") },
            { id: "sort",   icon: <ArrowUpDown size={18} />, label: "Sort",   onClick: () => console.log("sort") },
          ]}
        />

        <div style={layoutStyles.board}>
          {COLUMNS.map((col) => {
            const list = grouped[col.id] || [];
            const tone = STATUS_TONE[col.tone];
            return (
              <div key={col.id} style={layoutStyles.column}>
                <div style={{ ...layoutStyles.columnTop, background: tone.fg }} />
                <div style={layoutStyles.columnHeader}>
                  <span style={layoutStyles.columnLabel}>{col.label}</span>
                  <span style={layoutStyles.columnCount}>({list.length})</span>
                </div>
                <div style={layoutStyles.columnBody}>
                  {list.length === 0 ? (
                    <div style={layoutStyles.empty}>No missions in this status</div>
                  ) : (
                    list.map((m) => (
                      <MissionCardCompact
                        key={m.id}
                        mission={m}
                        onClick={() => onOpenMission(m.id)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const layoutStyles = {
  shell: {
    marginLeft: "var(--sidenav-width)",
    minHeight: "100vh",
    background: "var(--surface-canvas)",
    display: "flex",
    flexDirection: "column",
    paddingTop: "var(--page-padding-top)",
    paddingBottom: "var(--page-padding-bottom)",
    paddingInline: "var(--page-gutter)",
    boxSizing: "border-box",
  },
  content: {
    maxWidth: 1440,
    marginInline: "auto",
    width: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    minHeight: 0,
  },
  board: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(220px, 1fr))",
    gap: 16,
    alignItems: "start",
  },
  column: {
    background: "#FFFFFF",
    borderRadius: 12,
    border: "1px solid var(--color-divider-card)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: 200,
  },
  columnTop: {
    height: 4,
    width: "100%",
  },
  columnHeader: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    padding: "12px 16px 8px",
  },
  columnLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1F2440",
  },
  columnCount: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  columnBody: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: "0 12px 12px",
    maxHeight: "calc(100vh - 240px)",
    overflowY: "auto",
  },
  empty: {
    padding: "24px 0",
    textAlign: "center",
    color: "var(--color-text-tertiary)",
    fontSize: 12,
  },
};
