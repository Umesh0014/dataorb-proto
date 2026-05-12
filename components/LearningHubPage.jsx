"use client";

import React from "react";
import { Plus } from "lucide-react";
import PageHeader from "./PageHeader";
import TabsRow from "./TabsRow";
import DrillCard from "./DrillCard";
import ComingSoon from "./ComingSoon";
import Button from "./Button";
import { DRILL_CARDS } from "./mocks/drillCards";

const DrillAvatarIcon = () => (
  <span
    className="material-symbols-outlined"
    style={{
      fontSize: 18,
      color: "#245BFF",
      fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
    }}
  >
    co_present
  </span>
);

const DRILL_TABS = [
  { id: "active",  label: "Active" },
  { id: "library", label: "Library" },
];

// LearningHubPage — Drill page. Default route when entering Learning Hub.
// Header band matches the Insights HeaderCard family; tab row hosts the
// `+ Roleplay` CTA on the right; Active tab renders a 3-column DrillCard
// grid; Library tab renders <ComingSoon pageName="Library" />.
export default function LearningHubPage({ onOpenDrill, onCreateRoleplay }) {
  const [activeTab, setActiveTab] = React.useState("active");

  const RoleplayButton = (
    <Button
      variant="primary"
      leadingIcon={<Plus size={16} />}
      onClick={() => onCreateRoleplay?.()}
      style={{ height: 32, minWidth: 0, paddingInline: 16 }}
    >
      Roleplay
    </Button>
  );

  return (
    <div style={lhStyles.column}>
      <PageHeader
        identifier={{
          icon: <DrillAvatarIcon />,
          label: "Drill",
          withDropdown: true,
          // TODO: identifier dropdown menu — decorative for now.
          onClick: () => {},
        }}
      />
      <TabsRow
        tabs={DRILL_TABS}
        activeTab={activeTab}
        onTabClick={setActiveTab}
        action={RoleplayButton}
      />
      {activeTab === "active" ? (
        <div style={lhStyles.grid}>
          {DRILL_CARDS.map((card) => (
            <DrillCard
              key={card.id}
              {...card}
              onViewDetails={() => onOpenDrill?.(card.id)}
            />
          ))}
        </div>
      ) : (
        <ComingSoon pageName="Library" />
      )}
    </div>
  );
}

const lhStyles = {
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    width: "100%",
    flex: 1,
    minHeight: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
  },
};
