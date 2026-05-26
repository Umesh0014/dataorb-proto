"use client";

import React from "react";
import { FilePlus, FileClock, CheckCircle2 } from "lucide-react";
import InlineStatusAffordance from "./InlineStatusAffordance";
import SelectionAccentBar from "./SelectionAccentBar";
import { formatDateRange } from "./formatDate";
import { DRAFT_SETUP_STEPS } from "./mocks/missionsSeedData";

const TAG_MAX = 15;

function truncate(s, n) {
  if (!s) return s;
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

// resolveState — three states keyed off the mission's setupChecklist:
//   empty       no name + zero items checked
//   incomplete  some items checked, not all six
//   complete    all six mandatory items checked
export function resolveDraftState(mission) {
  const checklist = mission.setupChecklist || {};
  const completed = DRAFT_SETUP_STEPS.reduce((n, s) => n + (checklist[s.id] ? 1 : 0), 0);
  const hasName = Boolean(mission.name && mission.name.trim());
  if (completed === DRAFT_SETUP_STEPS.length) return { state: "complete", completed };
  if (completed === 0 && !hasName) return { state: "empty", completed };
  return { state: "incomplete", completed };
}

// KanbanDraftCard — three visual states for the Draft swimlane. Empty
// shows only an "Untitled draft" + Continue-setup link. Incomplete +
// Complete share the full card shell (title / description / divider /
// chips / setup-progress bar / footer); the only differences are the
// progress-bar tone (warning vs success) and the footer status pill
// (Draft vs Ready to publish).
export default function KanbanDraftCard({ mission, onClick, selected = false }) {
  const [hover, setHover] = React.useState(false);
  const { state, completed } = resolveDraftState(mission);

  const empty = state === "empty";
  const complete = state === "complete";

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...dcStyles.card,
        gap: empty ? 12 : 16,
        boxShadow: hover ? "0 6px 16px rgba(69, 70, 79, 0.16)" : "var(--shadow-card)",
      }}
    >
      {selected && <SelectionAccentBar />}

      {empty ? (
        <EmptyContent />
      ) : (
        <FullContent mission={mission} complete={complete} completed={completed} />
      )}
    </button>
  );
}

function EmptyContent() {
  return (
    <>
      <FilePlus size={16} color="var(--color-text-tertiary)" />
      <div style={dcStyles.untitled}>Untitled draft</div>
      <div style={dcStyles.continueCta}>Continue setup →</div>
    </>
  );
}

function FullContent({ mission, complete, completed }) {
  const hasDesc = Boolean(mission.description);
  const hasAgents = mission.agentCount != null && mission.agentCount > 0;
  const tags = Array.isArray(mission.tags) ? mission.tags : [];
  const firstTag = tags.length > 0 ? truncate(tags[0], TAG_MAX) : null;
  const hasDates = Boolean(mission.startDate && mission.endDate);
  const setupPct = Math.round((completed / DRAFT_SETUP_STEPS.length) * 100);
  const progressTone = complete ? "var(--color-success)" : "var(--color-warning)";

  return (
    <>
      <div style={dcStyles.title}>{mission.name || "—"}</div>
      <div style={hasDesc ? dcStyles.desc : dcStyles.descEmpty}>
        {hasDesc ? mission.description : "--"}
      </div>

      <div style={dcStyles.divider} aria-hidden="true" />

      <div style={dcStyles.chipRow}>
        {hasAgents ? (
          <>
            <span style={dcStyles.countBadge}>{mission.agentCount}</span>
            <span style={dcStyles.chipLabel}>Agents</span>
          </>
        ) : (
          <>
            <span style={dcStyles.placeholderBadge}>--</span>
            <span style={dcStyles.chipLabel}>Agents</span>
          </>
        )}
        <span style={dcStyles.dot} aria-hidden="true">·</span>
        {firstTag ? (
          <>
            <span style={dcStyles.tagChip} title={tags[0]}>{firstTag}</span>
            {tags.length > 1 && (
              <span style={dcStyles.overflowChip} title={tags.slice(1).join("\n")}>
                +{tags.length - 1}
              </span>
            )}
          </>
        ) : (
          <span style={dcStyles.placeholderChip}>--</span>
        )}
      </div>

      <div style={dcStyles.progressRow}>
        <span style={dcStyles.progressTrack}>
          <span
            style={{ ...dcStyles.progressFill, width: `${Math.max(setupPct, 2)}%`, background: progressTone }}
          />
        </span>
        <span style={{ ...dcStyles.progressLabel, color: progressTone }}>{setupPct}%</span>
      </div>

      <div style={dcStyles.footer}>
        <span style={hasDates ? dcStyles.dateRange : dcStyles.placeholderText}>
          {hasDates ? formatDateRange(mission.startDate, mission.endDate) : "--"}
        </span>
        {complete ? (
          <InlineStatusAffordance tone="success" icon={<CheckCircle2 size={12} />}>
            Ready to publish
          </InlineStatusAffordance>
        ) : (
          <InlineStatusAffordance tone="warning" icon={<FileClock size={12} />}>
            Draft
          </InlineStatusAffordance>
        )}
      </div>
    </>
  );
}

const dcStyles = {
  card: {
    position: "relative",
    overflow: "hidden",
    appearance: "none",
    textAlign: "left",
    cursor: "pointer",
    width: "100%",
    flexShrink: 0,
    background: "#FFFFFF",
    border: "none",
    borderRadius: 12,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    transition: "box-shadow 120ms ease",
    fontFamily: "var(--font-sans)",
  },
  // Empty-state pieces
  untitled: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.3,
  },
  continueCta: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--do-brand-blue)",
  },
  // Full-content pieces
  title: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  desc: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-medium)",
    lineHeight: 1.4,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  descEmpty: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },
  divider: {
    height: 1,
    width: "100%",
    background: "var(--color-divider-card)",
  },
  chipRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
  },
  countBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 22,
    height: 20,
    padding: "0 6px",
    borderRadius: 999,
    background: "var(--color-info-bg)",
    color: "var(--color-info)",
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },
  placeholderBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 22,
    height: 20,
    padding: "0 6px",
    borderRadius: 999,
    background: "var(--pill-bg)",
    color: "var(--color-text-tertiary)",
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    flexShrink: 0,
  },
  dot: {
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    flexShrink: 0,
  },
  tagChip: {
    display: "inline-flex",
    alignItems: "center",
    height: 20,
    padding: "0 8px",
    borderRadius: 4,
    background: "var(--pill-bg)",
    color: "var(--color-text-medium)",
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  overflowChip: {
    display: "inline-flex",
    alignItems: "center",
    height: 20,
    padding: "0 6px",
    borderRadius: 4,
    background: "var(--pill-bg)",
    color: "var(--color-text-tertiary)",
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },
  placeholderChip: {
    display: "inline-flex",
    alignItems: "center",
    height: 20,
    padding: "0 8px",
    borderRadius: 4,
    background: "var(--pill-bg)",
    color: "var(--color-text-tertiary)",
    fontSize: 12,
    fontWeight: 500,
  },
  progressRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    background: "var(--color-divider-card)",
    overflow: "hidden",
  },
  progressFill: {
    display: "block",
    height: "100%",
    borderRadius: 3,
    transition: "width 200ms ease",
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    flexShrink: 0,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  dateRange: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    whiteSpace: "nowrap",
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },
};
