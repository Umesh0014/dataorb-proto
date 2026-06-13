"use client";

import React from "react";
import {
  ChevronRight,
  MoreHorizontal,
  Repeat,
  GraduationCap,
  Target,
  Plus,
  MessageSquare,
  Search,
  Flag,
  User,
  Clock,
  Check,
  X,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import InlineStatusAffordance from "./InlineStatusAffordance";
import { SEVERITY_META, INTERVENTION_META, LOOP_META, toneInk } from "./mocks/commandCenter";

// AttentionItemCard — one task in the Command Center Tasks grid: the agent who
// needs help, the recommended action, and a 1-click launch. Kept deliberately
// scannable (UI-9): colour is reserved for the severity band only (UI-6); the
// signal trend, metadata, and editable note live in the sidecar drawer behind
// "Details". Cards stretch to equal height with the Launch CTA pinned bottom.

const INTERVENTION_ICON = {
  Repeat, GraduationCap, Target, Plus, MessageSquare, Search, Flag,
};

export default function AttentionItemCard({
  item,
  status = "open",
  onLaunch,
  onOpenDetail,
  onOpenAgent,
  onSnooze,
  onDismiss,
  onMarkHandled,
}) {
  const sev = SEVERITY_META[item.severity];
  const interv = INTERVENTION_META[item.intervention.kind];
  const IntervIcon = INTERVENTION_ICON[interv.icon] || Target;
  const isOpen = status === "open";

  return (
    <Card padX={20} padY={18} tone="outline" style={cardStyles.shell}>
      <div style={cardStyles.top}>
        <span style={cardStyles.typeChip}>
          <IntervIcon size={12} aria-hidden="true" style={{ flexShrink: 0 }} />
          {interv.type}
        </span>
        <InlineStatusAffordance tone={sev.tone} icon={<SeverityDot tone={sev.tone} />} style={{ color: toneInk(sev.tone) }}>
          {sev.label}
        </InlineStatusAffordance>
      </div>

      <div style={cardStyles.identityRow}>
        <button
          type="button"
          className="cc-focusable"
          onClick={() => onOpenAgent?.(item.agent.id)}
          style={cardStyles.avatar}
          aria-label={`Open ${item.agent.name}'s detail page`}
        >
          {item.agent.initials}
        </button>
        <div style={cardStyles.identity}>
          <span style={cardStyles.name}>{item.agent.name}</span>
          <span style={cardStyles.competency}>{item.competency}</span>
        </div>
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

      <p style={cardStyles.evidence}>{item.evidence}</p>

      <div style={cardStyles.actionLine}>
        <IntervIcon size={14} aria-hidden="true" style={{ flexShrink: 0, color: "var(--color-text-tertiary)" }} />
        <span style={cardStyles.actionAsset}>{item.intervention.asset}</span>
        <span style={cardStyles.duration}>{item.intervention.duration}</span>
      </div>

      <div style={cardStyles.footer}>
        {isOpen ? (
          <>
            <Button
              variant="primary"
              onClick={onLaunch}
              leadingIcon={<IntervIcon size={15} aria-hidden="true" />}
              style={cardStyles.launchBtn}
            >
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
          <InlineStatusAffordance tone={LOOP_META[status].tone} icon={<SeverityDot tone={LOOP_META[status].tone} />} style={{ color: toneInk(LOOP_META[status].tone) }}>
            {LOOP_META[status].label}
          </InlineStatusAffordance>
        )}
      </div>
    </Card>
  );
}

// SeverityDot — tiny filled dot paired with the tone label so severity is
// never read by colour alone (WCAG-2).
function SeverityDot({ tone }) {
  const color = {
    danger: "var(--color-error)",
    warning: "var(--color-warning)",
    info: "var(--color-info)",
    success: "var(--color-success)",
    tertiary: "var(--color-text-tertiary)",
  }[tone] || "var(--color-text-tertiary)";
  return <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />;
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
    { label: "Open agent profile", Icon: User, onClick: onOpenAgent },
    { label: "Snooze 7 days", Icon: Clock, onClick: onSnooze },
    { label: "Mark handled", Icon: Check, onClick: onMarkHandled },
    { label: "Dismiss…", Icon: X, onClick: onDismiss },
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
              <it.Icon size={15} aria-hidden="true" style={{ flexShrink: 0, color: "var(--color-text-tertiary)" }} />
              <span>{it.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const cardStyles = {
  shell: { display: "flex", flexDirection: "column", gap: 12, height: "100%" },
  top: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  typeChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "3px 10px",
    borderRadius: 999,
    background: "var(--pill-bg)",
    color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)",
    fontSize: 11,
    fontWeight: 700,
  },
  identityRow: { display: "flex", alignItems: "center", gap: 12 },
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
  identity: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 },
  name: { fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.3 },
  competency: { fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  detailsBtn: { height: "auto", padding: "2px 4px", color: "var(--color-button-primary-bg)", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  evidence: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 400,
    color: "var(--text-secondary)",
    lineHeight: 1.45,
  },
  actionLine: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "var(--color-card-emoji-bg)",
    borderRadius: 8,
    padding: "8px 12px",
  },
  actionAsset: {
    flex: 1,
    minWidth: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  duration: {
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
  footer: { display: "flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 2 },
  launchBtn: { flex: 1, height: 38, minWidth: 0 },
  kebabBtn: { borderRadius: 999, background: "var(--surface-white)", color: "var(--color-text-tertiary)" },
  menu: {
    position: "absolute",
    bottom: "calc(100% + 4px)",
    right: 0,
    minWidth: 190,
    background: "var(--surface-white)",
    border: "1px solid var(--color-border-tab)",
    borderRadius: 8,
    boxShadow: "var(--shadow-4)",
    padding: "4px 0",
    zIndex: 30,
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "8px 14px",
    border: "none",
    background: "transparent",
    textAlign: "left",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--color-text-medium)",
    cursor: "pointer",
  },
};
