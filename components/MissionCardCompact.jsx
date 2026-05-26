"use client";

import React from "react";
import { Clock, CheckCircle2 } from "lucide-react";
import InlineStatusAffordance from "./InlineStatusAffordance";
import SelectionAccentBar from "./SelectionAccentBar";
import { formatDateRange } from "./formatDate";

const TAG_MAX = 15;

// progressTone — kanban progress-bar banding. Spec thresholds (>=75 green,
// 40-74 orange, <40 red), matching MissionDetailContent's targetMetColor.
// Intentionally distinct from MissionsTable.progressColor (80/50).
function progressTone(pct) {
  if (pct >= 75) return "var(--color-success)";
  if (pct >= 40) return "var(--color-warning)";
  return "var(--color-error)";
}

function truncate(s, n) {
  if (!s) return s;
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

// daysSinceStart — whole days elapsed from the mission's startDate to today
// (UTC). Returns null when the start date is missing or in the future.
function daysSinceStart(m) {
  if (!m.startDate) return null;
  const start = Date.parse(`${m.startDate}T00:00:00Z`);
  if (Number.isNaN(start)) return null;
  const diff = Math.floor((Date.now() - start) / 86400000);
  return diff >= 0 ? diff : null;
}

// runningStateBadge — Iteration 7 sub-state badge for the Active and
// At Risk lanes. Returns null for draft / completed / unknown-daysLeft
// missions (those lanes carry their own affordances). The five running
// sub-states are mutually exclusive:
//   daysLeft > 14, daysSinceStart <= 7   → Just Started   (info)
//   daysLeft > 14, daysSinceStart > 7    → On Track       (success)
//   daysLeft 1–14                        → Ending Soon    (warning)
//   daysLeft = 0, agentsBelowTarget > 0  → Ends Today     (danger)
//   daysLeft = 0, agentsBelowTarget = 0  → Ready to Close (success)
export function runningStateBadge(m) {
  if (!m || m.state === "draft" || m.state === "completed") return null;
  const d = m.daysLeft;
  if (d == null) return null;
  if (d > 14) {
    const since = daysSinceStart(m);
    return since != null && since <= 7
      ? { tone: "info", label: "Just Started" }
      : { tone: "success", label: "On Track" };
  }
  if (d === 0) {
    const behind = m.kpis?.agentsBelowTarget?.current ?? 0;
    return behind > 0
      ? { tone: "danger", label: "Ends Today" }
      : { tone: "success", label: "Ready to Close" };
  }
  return { tone: "warning", label: "Ending Soon" };
}

// missionStatusAffordance — footer/header status derived from the same
// signals the board uses for lane assignment (state + daysLeft). Returns
// props for <InlineStatusAffordance>. Shared with the Kanban side curtain.
// There is no reusable "broken-pie clock" icon in the library, so the
// ends-today case uses the standard Clock glyph in the danger tone.
export function missionStatusAffordance(mission) {
  if (mission.state === "completed") {
    return { tone: "success", icon: <CheckCircle2 size={12} />, label: "Closed" };
  }
  const d = mission.daysLeft;
  if (d == null) return { tone: "tertiary", icon: <Clock size={12} />, label: "—" };
  if (d <= 2) {
    return {
      tone: "danger",
      icon: <Clock size={12} />,
      label: d <= 0 ? "Ends Today" : `${d} days left`,
    };
  }
  if (d <= 14) {
    return { tone: "warning", icon: <Clock size={12} />, label: `${d} days left` };
  }
  return { tone: "tertiary", icon: <Clock size={12} />, label: `${d} days left` };
}

// MissionCardCompact — kanban card. Full variant (running lanes) carries a
// progress bar; the Completed variant drops it (completed missions are all
// at 100% target met by definition). The whole card is the click target —
// it opens the side curtain. The selected card carries the
// SelectionAccentBar on its top edge.
//
// runningStateBadge() above stays exported as a derivation helper for
// consumers that need the sub-state label (analytics, sort, future
// surfaces). The card no longer renders an inline badge — title gets the
// full content width and any state cue stays in the footer chip.
export default function MissionCardCompact({ mission, onClick, selected = false }) {
  const [hover, setHover] = React.useState(false);
  const completed = mission.state === "completed";
  const pct = Math.max(0, Math.min(100, mission.progress ?? 0));
  const tone = progressTone(pct);
  const status = missionStatusAffordance(mission);

  const tags = mission.tags || [];
  const extraTags = tags.length - 1;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...kcStyles.card,
        boxShadow: hover ? "0 6px 16px rgba(69, 70, 79, 0.16)" : "var(--shadow-card)",
      }}
    >
      {selected && <SelectionAccentBar />}

      <span style={kcStyles.title}>{mission.name}</span>
      <div style={mission.description ? kcStyles.desc : kcStyles.descEmpty}>
        {mission.description || "--"}
      </div>

      <div style={kcStyles.divider} aria-hidden="true" />

      <div style={kcStyles.chipRow}>
        <span style={kcStyles.countBadge}>{mission.agentCount}</span>
        <span style={kcStyles.chipLabel}>Agents</span>
        {tags.length > 0 && (
          <>
            <span style={kcStyles.dot} aria-hidden="true">·</span>
            <span style={kcStyles.tagChip} title={tags[0]}>
              {truncate(tags[0], TAG_MAX)}
            </span>
          </>
        )}
        {extraTags > 0 && (
          <span style={kcStyles.overflowChip} title={tags.slice(1).join("\n")}>
            +{extraTags}
          </span>
        )}
      </div>

      {!completed && (
        <div style={kcStyles.progressRow}>
          <span style={kcStyles.progressTrack}>
            <span style={{ ...kcStyles.progressFill, width: `${pct}%`, background: tone }} />
          </span>
          <span style={{ ...kcStyles.progressLabel, color: tone }}>{pct}%</span>
        </div>
      )}

      <div style={kcStyles.footer}>
        <span style={kcStyles.dateRange}>
          {formatDateRange(mission.startDate, mission.endDate)}
        </span>
        <InlineStatusAffordance tone={status.tone} icon={status.icon}>
          {status.label}
        </InlineStatusAffordance>
      </div>
    </button>
  );
}

const kcStyles = {
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
    borderRadius: 8,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    transition: "box-shadow 120ms ease",
    fontFamily: "var(--font-sans)",
  },
  title: {
    display: "block",
    minWidth: 0,
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
    minWidth: 0,
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
};
