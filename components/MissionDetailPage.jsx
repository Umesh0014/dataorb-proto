"use client";

import React from "react";
import { ArrowLeft, MoreVertical, Clock } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import PageLayout from "./PageLayout";
import { SANDBOX_MISSIONS } from "./mocks/missionsExtra";
import MissionDetailContent from "./MissionDetailContent";
import SandboxSwitcher from "./sandbox/SandboxSwitcher";
import { SANDBOX_OPTIONS } from "./MissionsLandingShell";
import { displayStatus, STATUS_TONE } from "./MissionsTable";

// MissionDetailPage — full-page mission detail rendered at the
// /learning/missions/{missionId} route under Options 2 (Dense table)
// and 3 (Kanban) of the sandbox. Sits in the narrow Agents-page
// chassis (PageLayout 1068px). Header mirrors the Card-based sticky
// header pattern used by TaskRecordPage / SkillRecordPage.

const SANDBOX_STORAGE_KEY = "dataorb.missions.layoutSandbox";

function readSandboxLayout() {
  if (typeof window === "undefined") return "current";
  try {
    return window.localStorage.getItem(SANDBOX_STORAGE_KEY) || "current";
  } catch {
    return "current";
  }
}

export default function MissionDetailPage({ missionId, onBack, onSelectLayout }) {
  const mission = React.useMemo(
    () => SANDBOX_MISSIONS.find((m) => m.id === missionId) || SANDBOX_MISSIONS[0],
    [missionId],
  );
  const [layout, setLayout] = React.useState(readSandboxLayout);

  const handleLayoutChange = (next) => {
    setLayout(next);
    onSelectLayout?.(next);
  };

  if (!mission) {
    return (
      <PageLayout>
        <p style={mdpStyles.notFound}>Mission not found.</p>
      </PageLayout>
    );
  }

  const status = displayStatus(mission.state);
  const statusTone = STATUS_TONE[status.tone];
  const daysLeft = mission.daysLeft;
  const urgent = daysLeft != null && daysLeft <= 3 && daysLeft >= 0;
  const daysLabel =
    daysLeft == null
      ? null
      : daysLeft < 0
        ? "Closed"
        : daysLeft === 0
          ? "Ends today"
          : `${daysLeft} days left`;

  return (
    <>
      <PageLayout>
        <Card padX={20} padY={16} tone="default" shadow style={mdpStyles.headerBar}>
          <div style={mdpStyles.headerInner}>
            <Button variant="icon" size="sm" aria-label="Back to Missions" onClick={onBack}>
              <ArrowLeft size={20} color="var(--color-text-medium)" />
            </Button>
            <span style={mdpStyles.title}>{mission.name}</span>
            <span style={mdpStyles.flexSpacer} />
            <span
              style={{
                ...mdpStyles.statusChip,
                background: statusTone.bg,
                color: statusTone.fg,
              }}
            >
              {status.label}
            </span>
            {daysLabel && (
              <span
                style={{
                  ...mdpStyles.daysChip,
                  color: urgent ? "var(--color-error)" : "var(--color-text-tertiary)",
                  background: urgent ? "var(--color-error-bg)" : "var(--pill-bg)",
                }}
              >
                {urgent && <Clock size={12} />}
                {daysLabel}
              </span>
            )}
            <Button
              variant="icon"
              size="sm"
              aria-label="Mission actions"
              onClick={() => console.log("mission kebab", mission.id)}
            >
              <MoreVertical size={18} color="var(--color-text-medium)" />
            </Button>
          </div>
        </Card>

        {mission.description && (
          <p style={mdpStyles.description}>{mission.description}</p>
        )}

        <MissionDetailContent mission={mission} />
      </PageLayout>
      <SandboxSwitcher
        options={SANDBOX_OPTIONS}
        activeId={layout}
        onChange={handleLayoutChange}
        storageKey={SANDBOX_STORAGE_KEY}
        orientation="horizontal"
      />
    </>
  );
}

const mdpStyles = {
  headerBar: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    flexShrink: 0,
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  flexSpacer: { flex: 1 },
  statusChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  daysChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  description: {
    fontSize: 14,
    color: "var(--text-secondary)",
    margin: 0,
    maxWidth: 720,
    lineHeight: 1.5,
  },
  notFound: {
    fontSize: 14,
    color: "var(--color-text-tertiary)",
    padding: 24,
  },
};
