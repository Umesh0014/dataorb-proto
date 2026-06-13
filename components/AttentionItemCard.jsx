"use client";

import React from "react";
import {
  ChevronRight,
  MoreHorizontal,
  TrendingDown,
  LayoutGrid,
  ClipboardCheck,
  Flag,
  CalendarClock,
  Activity,
  Repeat,
  GraduationCap,
  Target,
  Plus,
  MessageSquare,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import InlineStatusAffordance from "./InlineStatusAffordance";
import MetricSparkline from "./MetricSparkline";
import { SEVERITY_META, SIGNAL_META, INTERVENTION_META, LOOP_META } from "./mocks/commandCenter";

// AttentionItemCard — the shared atom for the Team Leader Command Center.
// One Attention Item = (agent × driver/competency × signal) → recommended
// intervention. Composed by all three switcher variants (Queue / Board /
// Focus), so the card body is identical everywhere and only the container
// differs. Reuses Card, Button, InlineStatusAffordance, MetricSparkline.
//
// The drill-in is an explicit, always-visible "details" chevron (INT-2:
// never hover-only). The primary 1-click is the Launch button; secondary
// actions live in the kebab. When the item has left the Open state, the
// footer shows the loop-status badge instead of Launch.
//
// Props:
//   item          attention item (see mocks/commandCenter.js)
//   status        "open" | "acted" | "improved" | "no_change" (default open)
//   dense         board layout — tightens spacing, drops the sparkline
//   onLaunch      () => void — opens the confirm-launch flow
//   onOpenDetail  () => void — opens the sidecar drawer
//   onOpenAgent   (agentId) => void
//   onSnooze      () => void
//   onDismiss     () => void
//   onMarkHandled () => void

const SIGNAL_ICON = {
  TrendingDown, LayoutGrid, ClipboardCheck, Flag, CalendarClock, Activity,
};
const INTERVENTION_ICON = {
  Repeat, GraduationCap, Target, Plus, MessageSquare,
};

export default function AttentionItemCard({
  item,
  status = "open",
  dense = false,
  onLaunch,
  onOpenDetail,
  onOpenAgent,
  onSnooze,
  onDismiss,
  onMarkHandled,
}) {
  const sev = SEVERITY_META[item.severity];
  const sig = SIGNAL_META[item.signal];
  const SignalIcon = SIGNAL_ICON[sig.icon] || Activity;
  const interv = INTERVENTION_META[item.intervention.kind];
  const IntervIcon = INTERVENTION_ICON[interv.icon] || Target;
  const isOpen = status === "open";
  const isCohort = item.reach > 1;
  const metricLabel = item.metric
    ? `${item.competency} now ${item.metric.current}${item.metric.unit}`
    : undefined;

  return (
    <Card padX={dense ? 16 : 20} padY={dense ? 16 : 18} tone="outline" style={cardStyles.shell}>
      <div style={cardStyles.headerRow}>
        <button
          type="button"
          className="cc-focusable"
          onClick={() => onOpenAgent?.(item.agent.id)}
          style={cardStyles.avatar}
          aria-label={`Open ${item.agent.name}'s profile`}
        >
          {item.agent.initials}
        </button>
        <div style={cardStyles.identity}>
          <span style={cardStyles.name}>{item.agent.name}</span>
          <div style={cardStyles.tagRow}>
            <span style={cardStyles.competencyTag}>{item.competency}</span>
            {item.driver && <span style={cardStyles.driverTag}>{item.driver}</span>}
          </div>
        </div>
        <div style={cardStyles.headerEnd}>
          <InlineStatusAffordance tone={sev.tone} icon={<SeverityDot tone={sev.tone} />}>
            {sev.label}
          </InlineStatusAffordance>
          <Button
            variant="text"
            uppercase={false}
            onClick={onOpenDetail}
            trailingIcon={<ChevronRight size={15} aria-hidden="true" />}
            aria-label={`View details for ${item.agent.name}`}
            style={cardStyles.detailsBtn}
          >
            Details
          </Button>
        </div>
      </div>

      <div style={cardStyles.signalRow}>
        <span style={cardStyles.signalChip}>
          <SignalIcon size={13} aria-hidden="true" style={{ flexShrink: 0 }} />
          {sig.label}
        </span>
        {isCohort && <span style={cardStyles.cohortChip}>{item.reach} agents</span>}
        {item.overdueDays != null && (
          <span style={cardStyles.overdueChip}>{item.overdueDays}d overdue</span>
        )}
      </div>

      <p style={cardStyles.evidence}>{item.evidence}</p>

      {!dense && item.metric && (
        <div style={cardStyles.metricRow}>
          <span style={cardStyles.sparkWrap} role="img" aria-label={metricLabel}>
            <MetricSparkline
              points={item.metric.points}
              labels={item.metric.labels}
              color={`var(--color-${item.severity === "low" ? "info" : item.severity === "medium" ? "warning" : "error"})`}
              formatValue={(v) => `${Math.round(v)}${item.metric.unit}`}
            />
          </span>
          <span style={cardStyles.metricNow}>
            {item.metric.current}
            {item.metric.unit}
          </span>
        </div>
      )}

      <div style={cardStyles.intervBlock}>
        <IntervIcon size={15} aria-hidden="true" style={{ flexShrink: 0, color: "var(--color-text-tertiary)" }} />
        <div style={cardStyles.intervText}>
          <span style={cardStyles.intervVerb}>{interv.label}</span>
          <span style={cardStyles.intervAsset}>{item.intervention.asset}</span>
        </div>
        <span style={cardStyles.durationChip}>{item.intervention.duration}</span>
      </div>

      <div style={cardStyles.footer}>
        {isOpen ? (
          <>
            <Button variant="primary" onClick={onLaunch} style={cardStyles.launchBtn}>
              Launch
            </Button>
            <ItemKebab
              onOpenAgent={() => onOpenAgent?.(item.agent.id)}
              onSnooze={onSnooze}
              onDismiss={onDismiss}
              onMarkHandled={onMarkHandled}
            />
          </>
        ) : (
          <InlineStatusAffordance tone={LOOP_META[status].tone} icon={<SeverityDot tone={LOOP_META[status].tone} />}>
            {LOOP_META[status].label}
          </InlineStatusAffordance>
        )}
      </div>
    </Card>
  );
}

// SeverityDot — tiny filled dot used as the icon next to a tone label so the
// severity / loop state never reads by colour alone (label always present).
function SeverityDot({ tone }) {
  const color = {
    danger: "var(--color-error)",
    warning: "var(--color-warning)",
    info: "var(--color-info)",
    success: "var(--color-success)",
    tertiary: "var(--color-text-tertiary)",
  }[tone] || "var(--color-text-tertiary)";
  return (
    <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
  );
}

function ItemKebab({ onOpenAgent, onSnooze, onDismiss, onMarkHandled }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = [
    { label: "Open agent profile", onClick: onOpenAgent },
    { label: "Snooze 7 days", onClick: onSnooze },
    { label: "Mark handled", onClick: onMarkHandled },
    { label: "Dismiss…", onClick: onDismiss },
  ];

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <Button
        variant="icon"
        size="lg"
        bordered
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={cardStyles.kebabBtn}
      >
        <MoreHorizontal size={16} />
      </Button>
      {open && (
        <div role="menu" style={cardStyles.menu}>
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              className="cc-focusable"
              onClick={() => { it.onClick?.(); setOpen(false); }}
              style={cardStyles.menuItem}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const cardStyles = {
  shell: { display: "flex", flexDirection: "column", gap: 12 },
  headerRow: { display: "flex", alignItems: "flex-start", gap: 12 },
  avatar: {
    flexShrink: 0,
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    background: "var(--grey-100)",
    color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  identity: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 },
  name: {
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
  },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  competencyTag: {
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--color-icon-tertiary-fg)",
    background: "var(--color-icon-tertiary-bg)",
    padding: "2px 8px",
    borderRadius: 999,
  },
  driverTag: {
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    background: "var(--pill-bg)",
    padding: "2px 8px",
    borderRadius: 999,
  },
  headerEnd: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 },
  detailsBtn: {
    height: "auto",
    padding: "2px 4px",
    color: "var(--color-button-primary-bg)",
    fontSize: 12,
    fontWeight: 700,
  },
  signalRow: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 },
  signalChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-medium)",
  },
  cohortChip: {
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-info-text)",
    background: "var(--color-info-bg)",
    padding: "2px 8px",
    borderRadius: 999,
  },
  overdueChip: {
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-warning-text)",
    background: "var(--color-warning-bg)",
    padding: "2px 8px",
    borderRadius: 999,
  },
  evidence: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 400,
    color: "var(--text-secondary)",
    lineHeight: 1.45,
  },
  metricRow: { display: "flex", alignItems: "center", gap: 12 },
  sparkWrap: { flex: 1, minWidth: 0 },
  metricNow: {
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    flexShrink: 0,
  },
  intervBlock: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "var(--color-card-emoji-bg)",
    borderRadius: 10,
    padding: "10px 12px",
  },
  intervText: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 1 },
  intervVerb: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  intervAsset: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 400,
    color: "var(--text-secondary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  durationChip: {
    flexShrink: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    padding: "3px 8px",
    borderRadius: 6,
  },
  footer: { display: "flex", alignItems: "center", gap: 8, marginTop: 2 },
  launchBtn: { flex: 1, height: 38, minWidth: 0 },
  kebabBtn: {
    borderRadius: 999,
    background: "var(--surface-white)",
    color: "var(--color-text-tertiary)",
  },
  menu: {
    position: "absolute",
    bottom: "calc(100% + 4px)",
    right: 0,
    minWidth: 180,
    background: "var(--surface-white)",
    border: "1px solid var(--color-border-tab)",
    borderRadius: 8,
    boxShadow: "var(--shadow-4)",
    padding: "4px 0",
    zIndex: 30,
  },
  menuItem: {
    display: "block",
    width: "100%",
    padding: "8px 16px",
    border: "none",
    background: "transparent",
    textAlign: "left",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--color-text-medium)",
    cursor: "pointer",
  },
};
