"use client";

import React from "react";
import { Plus, Search, ArrowUpDown } from "lucide-react";
import PageHeader from "./PageHeader";
import { MissionsIcon } from "./SideNav/icons";
import MissionsTable from "./MissionsTable";

// MissionsHybridTableLayout — Option 4. Identical chrome to the Dense
// table layout, but rows expand inline instead of routing to a detail
// page. Only one row is expanded at a time (single-expand per V1).

export default function MissionsHybridTableLayout({
  missions,
  statusFilter,
  onStatusFilter,
  onCreateMission,
}) {
  const [expandedId, setExpandedId] = React.useState(null);
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
            {
              id: "status",
              label: "Status",
              value: statusFilter,
              options: [
                { label: "Active",    value: "Active" },
                { label: "Draft",     value: "Draft" },
                { label: "Completed", value: "Completed" },
              ],
              onSelect: onStatusFilter,
            },
          ]}
          toolbar={[
            { id: "search", icon: <Search size={18} />,     label: "Search", onClick: () => console.log("search") },
            { id: "sort",   icon: <ArrowUpDown size={18} />, label: "Sort",   onClick: () => console.log("sort") },
          ]}
        />
        <MissionsTable
          missions={missions}
          expandable
          expandedId={expandedId}
          onToggleExpand={setExpandedId}
        />
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
};
