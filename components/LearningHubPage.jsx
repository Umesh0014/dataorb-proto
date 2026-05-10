"use client";

import React from "react";
import { Plus } from "lucide-react";
import DrillHeader from "./DrillHeader";
import TabsRow from "./TabsRow";
import DrillCard from "./DrillCard";
import ComingSoon from "./ComingSoon";
import Button from "./Button";
import { DRILL_CARDS } from "./mocks/drillCards";

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
      <DrillHeader title="Drill" />
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
