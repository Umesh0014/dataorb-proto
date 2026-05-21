"use client";

import React from "react";
import { Plus, Search, ArrowUpDown } from "lucide-react";
import PageLayout from "./PageLayout";
import PageHeader from "./PageHeader";
import { MissionsIcon } from "./SideNav/icons";
import MissionsTable from "./MissionsTable";

// MissionsDenseTableLayout — Option 2. Page header + filter bar + a
// full-width missions table. Borrows the narrow Agents-page chassis
// (<PageLayout> at --page-content-max-width = 1068) so the dense table
// reads as a sibling of the Agents landing.

export default function MissionsDenseTableLayout({
  missions,
  statusFilter,
  onStatusFilter,
  onOpenMission,
  onCreateMission,
}) {
  return (
    <PageLayout>
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
      <MissionsTable missions={missions} onSelectMission={onOpenMission} />
    </PageLayout>
  );
}
