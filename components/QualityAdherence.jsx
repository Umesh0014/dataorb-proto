"use client";

import React from "react";
import { Download } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import TabsRow from "./TabsRow";
import AdherenceRateChart from "./AdherenceRateChart";
import AdherenceScopeTable from "./AdherenceScopeTable";

// By metric seed — 30 rows. roleplays / adherence / change may be null.
const metricsData = [
  { id: "1", name: "Corporate greeting", roleplays: 14870, adherence: 78, change: { direction: "down", pct: 1 } },
  { id: "2", name: "GDPR notice", roleplays: 12023, adherence: 84, change: null },
  { id: "3", name: "States call purpose", roleplays: null, adherence: null, change: { direction: "down", pct: 2000 } },
  { id: "4", name: "Handles initial objection", roleplays: 15010, adherence: 40, change: { direction: "up", pct: 3 } },
  { id: "5", name: "Avoids early scheduling", roleplays: 20000, adherence: 80, change: { direction: "up", pct: 1 } },
  { id: "6", name: "Verifies caller identity", roleplays: 18200, adherence: 91, change: { direction: "up", pct: 2 } },
  { id: "7", name: "Confirms account details", roleplays: 16540, adherence: 73, change: { direction: "down", pct: 4 } },
  { id: "8", name: "Offers alternatives", roleplays: 9870, adherence: 56, change: { direction: "up", pct: 5 } },
  { id: "9", name: "Closes with summary", roleplays: 11200, adherence: 88, change: { direction: "up", pct: 1 } },
  { id: "10", name: "Active listening confirmation", roleplays: 13400, adherence: 47, change: { direction: "down", pct: 3 } },
  { id: "11", name: "Empathetic acknowledgement", roleplays: 8900, adherence: 64, change: { direction: "up", pct: 2 } },
  { id: "12", name: "Explains next steps", roleplays: 19300, adherence: 82, change: { direction: "up", pct: 3 } },
  { id: "13", name: "Handles pricing questions", roleplays: 7600, adherence: 38, change: { direction: "down", pct: 6 } },
  { id: "14", name: "Recaps customer concern", roleplays: 21500, adherence: 76, change: { direction: "up", pct: 1 } },
  { id: "15", name: "Avoids dead air", roleplays: 6200, adherence: 52, change: { direction: "down", pct: 2 } },
  { id: "16", name: "Uses positive language", roleplays: 17800, adherence: 90, change: { direction: "up", pct: 4 } },
  { id: "17", name: "Manages call duration", roleplays: 10400, adherence: 61, change: null },
  { id: "18", name: "Escalation handling", roleplays: 5400, adherence: 44, change: { direction: "down", pct: 5 } },
  { id: "19", name: "Probes for root cause", roleplays: 12700, adherence: 69, change: { direction: "up", pct: 2 } },
  { id: "20", name: "Confirms resolution", roleplays: 23100, adherence: 85, change: { direction: "up", pct: 1 } },
  { id: "21", name: "Tone and pacing", roleplays: 9100, adherence: 58, change: { direction: "down", pct: 1 } },
  { id: "22", name: "Compliance disclosure", roleplays: 15600, adherence: 93, change: { direction: "up", pct: 2 } },
  { id: "23", name: "Cross-sell relevance", roleplays: 6800, adherence: 35, change: { direction: "down", pct: 8 } },
  { id: "24", name: "Personalises greeting", roleplays: 13900, adherence: 71, change: { direction: "up", pct: 3 } },
  { id: "25", name: "Handles interruptions", roleplays: 8300, adherence: 49, change: { direction: "down", pct: 2 } },
  { id: "26", name: "Sets accurate expectations", roleplays: 18900, adherence: 79, change: { direction: "up", pct: 1 } },
  { id: "27", name: "Documents call outcome", roleplays: 24500, adherence: 87, change: { direction: "up", pct: 2 } },
  { id: "28", name: "De-escalation technique", roleplays: 5900, adherence: 42, change: { direction: "down", pct: 4 } },
  { id: "29", name: "Confirms contact preference", roleplays: 11800, adherence: 66, change: null },
  { id: "30", name: "Closes with branding", roleplays: 16100, adherence: 81, change: { direction: "up", pct: 1 } },
];

// By skills seed — 10 rows, same shape as metricsData.
const skillsData = [
  { id: "1", name: "Building rapport", roleplays: 14870, adherence: 78, change: { direction: "down", pct: 1 } },
  { id: "2", name: "Demonstrating ownership", roleplays: 12023, adherence: 84, change: null },
  { id: "3", name: "Communicating clearly", roleplays: null, adherence: null, change: { direction: "down", pct: 2000 } },
  { id: "4", name: "Overcoming objections", roleplays: 15010, adherence: 40, change: { direction: "up", pct: 3 } },
  { id: "5", name: "Active listening", roleplays: 20000, adherence: 80, change: { direction: "up", pct: 1 } },
  { id: "6", name: "Problem solving", roleplays: 11500, adherence: 72, change: { direction: "up", pct: 2 } },
  { id: "7", name: "Empathy and patience", roleplays: 9800, adherence: 88, change: { direction: "up", pct: 4 } },
  { id: "8", name: "Handling difficult calls", roleplays: 8200, adherence: 45, change: { direction: "down", pct: 6 } },
  { id: "9", name: "Closing techniques", roleplays: 7400, adherence: 67, change: { direction: "up", pct: 1 } },
  { id: "10", name: "Time management", roleplays: 6900, adherence: 82, change: { direction: "up", pct: 2 } },
];

const TABS = [
  { id: "rate", label: "Adherence rate" },
  { id: "metric", label: "By metric" },
  { id: "skills", label: "By skills" },
];

// QualityAdherence — interior of the Agent Profile "Quality adherence"
// card: title + subtitle + download action, three sub-tabs. Self-contained
// <Card>, mirroring RoleplayCoverage and the other DataOrb metric cards.
export default function QualityAdherence() {
  const [tab, setTab] = React.useState("rate");

  return (
    <Card>
      <div style={qaStyles.header}>
        <div>
          <div style={qaStyles.title}>Quality adherence</div>
          <div style={qaStyles.subtitle}>
            Track how every interaction measures up against your quality,
            process, and performance standards.
          </div>
        </div>
        <Button
          variant="text"
          uppercase={false}
          leadingIcon={<Download size={16} />}
          onClick={() => {
            // TODO: export quality adherence as CSV (the active tab's view)
          }}
        >
          Download
        </Button>
      </div>

      <div style={qaStyles.tabs}>
        <TabsRow tabs={TABS} activeTab={tab} onTabClick={setTab} />
      </div>

      {tab === "rate" && <AdherenceRateChart />}
      {tab === "metric" && <AdherenceScopeTable rows={metricsData} scopeNoun="Metrics" />}
      {tab === "skills" && <AdherenceScopeTable rows={skillsData} scopeNoun="Skills" />}
    </Card>
  );
}

const qaStyles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--text-secondary)",
    lineHeight: 1.4,
  },
  tabs: {
    marginTop: 16,
  },
};
