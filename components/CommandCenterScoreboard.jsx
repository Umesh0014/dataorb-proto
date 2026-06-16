"use client";

import React from "react";
import PageHeader from "./PageHeader";
import AgentLearningImpact from "./AgentLearningImpact";
import { CommandCenterIcon } from "./SideNav/icons";
import { TEAM_CONTEXT } from "./mocks/commandCenter";
import { getTeamImpact } from "./mocks/agentLearningImpact";

// CommandCenterScoreboard — the dashboard's top band: the shared PageHeader (so
// the Dashboard's chrome matches every other module page), then the team
// Learning Hub impact chart — the team's QA, CSAT, and average composite over
// time with every Learning Hub intervention marked, so a team lead can track
// performance against the interventions taken.
export default function CommandCenterScoreboard({ subtitle }) {
  const teamImpact = React.useMemo(() => getTeamImpact(), []);

  return (
    <div style={sbStyles.wrap}>
      <PageHeader
        identifier={{
          icon: <CommandCenterIcon size={18} color="#245BFF" />,
          label: "Dashboard",
          withDropdown: true,
          onClick: () => {},
        }}
        subtitle={subtitle || `${TEAM_CONTEXT.team} · ${TEAM_CONTEXT.lead} (you) · coach by exception`}
      />

      <AgentLearningImpact
        fullImpact={teamImpact}
        title="Team learning impact"
        subtitle="Your team's QA, CSAT, and average composite over time, with every Learning Hub intervention marked — so you can see practice lift performance."
      />
    </div>
  );
}

const sbStyles = {
  wrap: { display: "flex", flexDirection: "column", gap: 16 },
};
