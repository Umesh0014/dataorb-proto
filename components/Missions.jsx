"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import Card from "./Card";
import ActiveMissionCard from "./ActiveMissionCard";
import ClosedMissions from "./ClosedMissions";

// Active missions seed.
const activeMissions = [
  {
    id: "mission-1",
    pageMissionId: "mission-b",
    title: "Customer support enhancement",
    roleplaysCompleted: 9,
    roleplaysTotal: 12,
    daysLeft: 3,
    focusAreas: [
      { id: "fa-1-1", name: "Active listening", target: 60, actual: 56, isAiInsight: false, gapPct: 40, status: "below" },
      { id: "fa-1-2", name: "Solution clarity", target: 86, actual: 90, isAiInsight: false, gapPct: null, status: "met", drillable: true },
      { id: "fa-1-3", name: "Follow-up quality", target: 72, actual: 80, isAiInsight: false, gapPct: null, status: "met" },
      { id: "fa-1-4", name: "Feedback loops", target: 98, actual: 100, isAiInsight: true, gapPct: null, status: "met" },
    ],
  },
  {
    id: "mission-2",
    pageMissionId: "mission-a",
    title: "Retention save readiness — Q2",
    roleplaysCompleted: 4,
    roleplaysTotal: 15,
    daysLeft: 20,
    focusAreas: [
      { id: "fa-2-1", name: "Refund / extension policy", target: 78, actual: 20, isAiInsight: false, gapPct: 80, status: "below" },
      { id: "fa-2-2", name: "Save / retention offer usage", target: 86, actual: 60, isAiInsight: false, gapPct: 40, status: "below", drillable: true },
      { id: "fa-2-3", name: "Step-by-step guidance", target: 60, actual: 56, isAiInsight: false, gapPct: 40, status: "below" },
      { id: "fa-2-4", name: "Service area awareness", target: 72, actual: 80, isAiInsight: false, gapPct: null, status: "met" },
      { id: "fa-2-5", name: "Empathy & tone", target: 98, actual: 100, isAiInsight: true, gapPct: null, status: "met" },
    ],
  },
];

// Closed missions seed — 30 rows, paginated 8 per page (4 pages).
const closedMissionsMetrics = {
  closedMissionsTotal: 30,
  totalRoleplays: { completed: 13, total: 50 },
  targetsAchieved: { met: 25, total: 30 },
};

const closedMissions = [
  { id: "cm-1", title: "Empathy in communication", target: "met", roleplays: 15, closingDate: "2026-04-30", completionStatus: "closed" },
  { id: "cm-2", title: "Conflict resolution", target: "met", roleplays: 12, closingDate: "2026-04-27", completionStatus: "expired" },
  { id: "cm-3", title: "Persuasive communication", target: "below", roleplays: 12, closingDate: "2026-04-21", completionStatus: "completed" },
  { id: "cm-4", title: "Clarity of speech", target: "met", roleplays: 12, closingDate: "2026-04-02", completionStatus: "completed" },
  { id: "cm-5", title: "Active listening", target: "below", roleplays: 11, closingDate: "2026-04-01", completionStatus: "expired" },
  { id: "cm-6", title: "Empathy in communication", target: "met", roleplays: 10, closingDate: "2026-03-30", completionStatus: "expired" },
  { id: "cm-7", title: "Non-verbal cues", target: "below", roleplays: 10, closingDate: "2026-03-05", completionStatus: "closed" },
  { id: "cm-8", title: "Non-verbal cues", target: "below", roleplays: 10, closingDate: "2026-03-01", completionStatus: "expired" },
  { id: "cm-9", title: "Tone modulation", target: "met", roleplays: 14, closingDate: "2026-02-26", completionStatus: "completed" },
  { id: "cm-10", title: "Closing the sale", target: "met", roleplays: 13, closingDate: "2026-02-22", completionStatus: "closed" },
  { id: "cm-11", title: "Handling escalations", target: "below", roleplays: 9, closingDate: "2026-02-18", completionStatus: "expired" },
  { id: "cm-12", title: "Product knowledge depth", target: "met", roleplays: 12, closingDate: "2026-02-14", completionStatus: "completed" },
  { id: "cm-13", title: "Discovery questioning", target: "met", roleplays: 11, closingDate: "2026-02-09", completionStatus: "closed" },
  { id: "cm-14", title: "Objection reframing", target: "below", roleplays: 8, closingDate: "2026-02-03", completionStatus: "expired" },
  { id: "cm-15", title: "Call control", target: "met", roleplays: 13, closingDate: "2026-01-29", completionStatus: "completed" },
  { id: "cm-16", title: "Summarizing accurately", target: "met", roleplays: 10, closingDate: "2026-01-24", completionStatus: "closed" },
  { id: "cm-17", title: "Setting expectations", target: "below", roleplays: 7, closingDate: "2026-01-20", completionStatus: "expired" },
  { id: "cm-18", title: "Cross-sell timing", target: "met", roleplays: 12, closingDate: "2026-01-15", completionStatus: "completed" },
  { id: "cm-19", title: "Compliance adherence", target: "met", roleplays: 14, closingDate: "2026-01-11", completionStatus: "closed" },
  { id: "cm-20", title: "Rapport building", target: "met", roleplays: 11, closingDate: "2026-01-06", completionStatus: "completed" },
  { id: "cm-21", title: "Note-taking discipline", target: "below", roleplays: 6, closingDate: "2025-12-30", completionStatus: "expired" },
  { id: "cm-22", title: "Warm transfers", target: "met", roleplays: 10, closingDate: "2025-12-22", completionStatus: "closed" },
  { id: "cm-23", title: "Hold etiquette", target: "met", roleplays: 9, closingDate: "2025-12-17", completionStatus: "completed" },
  { id: "cm-24", title: "Upsell positioning", target: "below", roleplays: 8, closingDate: "2025-12-11", completionStatus: "expired" },
  { id: "cm-25", title: "Sentiment recovery", target: "met", roleplays: 13, closingDate: "2025-12-04", completionStatus: "completed" },
  { id: "cm-26", title: "First-contact resolution", target: "met", roleplays: 12, closingDate: "2025-11-28", completionStatus: "closed" },
  { id: "cm-27", title: "Knowledge base usage", target: "below", roleplays: 7, closingDate: "2025-11-21", completionStatus: "expired" },
  { id: "cm-28", title: "Brand voice consistency", target: "met", roleplays: 11, closingDate: "2025-11-14", completionStatus: "completed" },
  { id: "cm-29", title: "Callback commitment", target: "met", roleplays: 10, closingDate: "2025-11-07", completionStatus: "closed" },
  { id: "cm-30", title: "Survey invitation", target: "below", roleplays: 6, closingDate: "2025-10-31", completionStatus: "expired" },
];

const SCOPE_OPTIONS = [
  { value: "active", label: "Active Missions" },
  { value: "closed", label: "Closed Missions" },
];

// Missions — interior of the Agent Profile "Missions" card. A scope dropdown
// in the header switches between the Active Missions stack (mission sub-cards
// with spider charts) and the Closed Missions metric strip + table.
export default function Missions({ onViewMission }) {
  const [scope, setScope] = React.useState("active");

  return (
    <Card>
      <div style={mxStyles.header}>
        <div>
          <div style={mxStyles.title}>Missions</div>
          <div style={mxStyles.subtitle}>Evaluate performance across quality metrics.</div>
        </div>
        <ScopeDropdown value={scope} onChange={setScope} />
      </div>

      {scope === "active" ? (
        <div style={mxStyles.activeStack}>
          {activeMissions.map((mission) => (
            <ActiveMissionCard
              key={mission.id}
              mission={mission}
              onViewMission={onViewMission}
            />
          ))}
        </div>
      ) : (
        <ClosedMissions metrics={closedMissionsMetrics} rows={closedMissions} />
      )}
    </Card>
  );
}

// ScopeDropdown — Active / Closed selector. Mirrors the Quality adherence
// card's scope dropdown pattern.
function ScopeDropdown({ value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = SCOPE_OPTIONS.find((o) => o.value === value) || SCOPE_OPTIONS[0];

  return (
    <div ref={ref} style={mxStyles.scopeWrap}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={mxStyles.scopeBtn}>
        <span style={mxStyles.scopeValue}>{selected.label}</span>
        <ChevronDown size={14} style={{ color: "var(--color-text-placeholder)" }} />
      </button>
      {open && (
        <div role="menu" style={mxStyles.scopeMenu}>
          {SCOPE_OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                style={{
                  ...mxStyles.scopeMenuItem,
                  background: isSelected ? "var(--pill-bg)" : "transparent",
                  color: isSelected ? "var(--color-text-tab-active)" : "var(--color-text-medium)",
                  fontWeight: isSelected ? 700 : 500,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const mxStyles = {
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
  activeStack: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginTop: 16,
  },
  scopeWrap: {
    position: "relative",
    flexShrink: 0,
  },
  scopeBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    height: 32,
    paddingInline: 12,
    borderRadius: 8,
    background: "var(--pill-bg)",
    border: "1px solid var(--color-border-tab)",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
  },
  scopeValue: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--do-ink)",
  },
  scopeMenu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    right: 0,
    minWidth: 180,
    background: "var(--surface-white)",
    border: "1px solid var(--color-border-tab)",
    borderRadius: 8,
    boxShadow: "var(--shadow-4)",
    padding: "4px 0",
    zIndex: 30,
  },
  scopeMenuItem: {
    display: "block",
    width: "100%",
    padding: "8px 16px",
    border: "none",
    textAlign: "left",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    cursor: "pointer",
  },
};
