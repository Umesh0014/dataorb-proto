"use client";

import React from "react";
import {
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
import { SEVERITY_META, INTERVENTION_META, LOOP_META, toneInk, taskTitle } from "./mocks/commandCenter";

// AttentionItemCard — one task in the Command Center Tasks grid. Action-first:
// the heading is what to do ("Assign guided drill to Willis Jast"), with a
// one-line justification and the Launch CTA beside it. The severity band sits
// just above the heading; a small avatar + name (a link to the agent's detail
// page) sits below. Colour is reserved for the severity band (UI-6). Cards
// stretch to equal height with the agent row pinned to the bottom.

const INTERVENTION_ICON = {
  Repeat, GraduationCap, Target, Plus, MessageSquare, Search, Flag,
};

export default function AttentionItemCard({
  item,
  status = "open",
  onLaunch,
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
        <InlineStatusAffordance tone={sev.tone} icon={<SeverityDot tone={sev.tone} />} style={{ color: toneInk(sev.tone) }}>
          {sev.label}
        </InlineStatusAffordance>
        {!isOpen && (
          <InlineStatusAffordance tone={LOOP_META[status].tone} icon={<SeverityDot tone={LOOP_META[status].tone} />} style={{ color: toneInk(LOOP_META[status].tone) }}>
            {LOOP_META[status].label}
          </InlineStatusAffordance>
        )}
      </div>

      <h3 style={cardStyles.title}>{taskTitle(item)}</h3>
      <p style={cardStyles.justification}>{item.evidence}</p>

      <button
        type="button"
        className="cc-focusable"
        onClick={() => onOpenAgent?.(item.agent.id)}
        style={cardStyles.agentRow}
        aria-label={`Open ${item.agent.name}'s detail page`}
      >
        <span style={cardStyles.avatar}>{item.agent.initials}</span>
        <span style={cardStyles.agentName}>{item.agent.name}</span>
        <span style={cardStyles.competency}>· {item.competency}</span>
      </button>

      {isOpen && (
        <div style={cardStyles.footer}>
          <Button
            variant="text"
            uppercase={false}
            onClick={onLaunch}
            leadingIcon={<IntervIcon size={14} aria-hidden="true" />}
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
        </div>
      )}
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
        size="sm"
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
  shell: { display: "flex", flexDirection: "column", gap: 10, height: "100%" },
  top: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  title: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
  },
  justification: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 400,
    color: "var(--text-secondary)",
    lineHeight: 1.45,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflow: "hidden",
  },
  footer: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingTop: 2 },
  launchBtn: { height: 32, color: "var(--color-button-primary-bg)", fontWeight: 700 },
  agentRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    width: "100%",
    marginTop: "auto",
    paddingTop: 4,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  avatar: {
    flexShrink: 0,
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "var(--grey-100)",
    color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)",
    fontSize: 10,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  agentName: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)", flexShrink: 0 },
  competency: {
    fontFamily: "var(--font-sans)",
    fontSize: 12,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  kebabBtn: { borderRadius: 999, background: "transparent", color: "var(--color-text-tertiary)" },
  menu: {
    position: "absolute",
    top: "calc(100% + 4px)",
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
