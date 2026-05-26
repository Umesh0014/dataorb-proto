"use client";

import React from "react";
import { CheckCircle2, Circle, ChevronRight } from "lucide-react";
import Card from "./Card";
import { DRAFT_SETUP_STEPS } from "./mocks/missionsSeedData";

// KanbanDraftDetail — curtain body for Draft missions. Renders the six
// mandatory setup steps as a click-through list; each row routes to its
// corresponding wizard step (stubbed to console.log for the prototype, per
// the existing DraftMissionCard wiring).
//
// The curtain header (title, status, kebab "Delete draft", close X) is
// owned by the Kanban layout, not this component.
export default function KanbanDraftDetail({ mission, onOpenStep }) {
  const checklist = mission.setupChecklist || {};
  const completed = DRAFT_SETUP_STEPS.reduce((n, s) => n + (checklist[s.id] ? 1 : 0), 0);
  const handleOpen = onOpenStep || ((stepId) => console.log("open wizard step", stepId));

  return (
    <div style={kddStyles.wrap}>
      <Card tone="outline" padX={20} padY={20}>
        <div style={kddStyles.header}>
          <div style={kddStyles.title}>Setup Checklist</div>
          <div style={kddStyles.progress}>
            {completed} of {DRAFT_SETUP_STEPS.length} complete
          </div>
        </div>
        <ul style={kddStyles.list}>
          {DRAFT_SETUP_STEPS.map((step, i) => {
            const done = Boolean(checklist[step.id]);
            return (
              <ChecklistRow
                key={step.id}
                step={step}
                done={done}
                isLast={i === DRAFT_SETUP_STEPS.length - 1}
                onOpen={() => handleOpen(step.id)}
              />
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function ChecklistRow({ step, done, isLast, onOpen }) {
  const [hover, setHover] = React.useState(false);
  return (
    <li
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...kddStyles.row,
        borderBottom: isLast ? "none" : "1px solid var(--color-divider-card)",
        background: hover ? "var(--pill-bg)" : "transparent",
      }}
    >
      {done ? (
        <CheckCircle2 size={18} color="var(--color-success)" style={{ flexShrink: 0 }} />
      ) : (
        <Circle size={18} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
      )}
      <span style={{ ...kddStyles.label, color: done ? "var(--color-text-deep)" : "var(--color-text-medium)" }}>
        {step.label}
      </span>
      <ChevronRight size={16} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
    </li>
  );
}

const kddStyles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  progress: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 8px",
    cursor: "pointer",
    transition: "background 120ms ease",
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
    minWidth: 0,
  },
};
