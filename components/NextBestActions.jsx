"use client";

import React from "react";
import {
  ArrowRight,
  MoreVertical,
  Target,
  Repeat,
  GraduationCap,
  TrendingUp,
  PartyPopper,
  X,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import { NBA_CARDS, NBA_MORE } from "./mocks/nextBestActions";

// Lucide icon per NBA action type — a closed set defined in the mock data.
const ACTION_ICON = {
  "Assign drill": Target,
  "Reassign roleplay": Repeat,
  "Assign course": GraduationCap,
};

// Priority chip tints — reuse the product's status tint families
// (error / warning / info).
// TODO: confirm the priority taxonomy maps to error / warning / info tints —
// the Opportunity chip uses the info-blue tint, not the primary blue.
const PRIORITY = {
  critical: { label: "Critical", bg: "var(--color-error-bg)", fg: "var(--color-error)" },
  recommended: { label: "Recommended", bg: "var(--color-warning-bg)", fg: "var(--color-warning)" },
  opportunity: { label: "Opportunity", bg: "var(--color-info-bg)", fg: "var(--color-info)" },
};

const CARD_WIDTH = 300;
const FADE_MS = 200;

// NextBestActions — the Next Best Actions zone embedded in the Performance
// score hero card: a small header + a horizontally-scrolling rail of
// prioritized NBA cards plus a "View all" side sheet. `onAssign({ name,
// duration })` opens the page-level Confirm assignment modal.
export default function NextBestActions({ onAssign }) {
  const [dismissed, setDismissed] = React.useState([]);
  const [fadingId, setFadingId] = React.useState(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const viewAllRef = React.useRef(null);

  // Dismiss / snooze both drop the card from the rail after a fade. State
  // resets on reload — no persistence by design.
  const dismissCard = (id) => {
    setFadingId(id);
    window.setTimeout(() => {
      setDismissed((prev) => [...prev, id]);
      setFadingId(null);
    }, FADE_MS);
  };

  const visible = NBA_CARDS.filter((c) => !dismissed.includes(c.id));

  return (
    <div>
      <div style={nbaStyles.zoneHeader}>
        <span style={nbaStyles.zoneLabel}>Next best actions</span>
        <span ref={viewAllRef} style={{ flexShrink: 0 }}>
          <Button
            variant="text"
            uppercase={false}
            trailingIcon={<ArrowRight size={16} />}
            onClick={() => setSheetOpen(true)}
          >
            View all
          </Button>
        </span>
      </div>

      {visible.length === 0 ? (
        <EmptyState />
      ) : (
        <div style={nbaStyles.rail} className="scrollbar-none">
          {visible.map((card) => (
            <NbaCard
              key={card.id}
              card={card}
              fading={fadingId === card.id}
              onAssign={onAssign}
              onDismiss={() => dismissCard(card.id)}
            />
          ))}
        </div>
      )}

      {sheetOpen && (
        <NbaSideSheet
          items={[...NBA_CARDS, ...NBA_MORE]}
          onAssign={onAssign}
          onClose={() => {
            setSheetOpen(false);
            viewAllRef.current?.querySelector("button")?.focus();
          }}
        />
      )}
    </div>
  );
}

// NbaCard — one rail card: priority chip, behavior title, evidence,
// suggested-action block, expected outcome, and an action row.
function NbaCard({ card, fading, onAssign, onDismiss }) {
  const pr = PRIORITY[card.priority] || PRIORITY.recommended;
  const ActionIcon = ACTION_ICON[card.action.type] || Target;
  return (
    <Card tone="outline" padX={20} padY={20} style={{ ...nbaStyles.card, opacity: fading ? 0 : 1 }}>
      <span style={{ ...nbaStyles.chip, background: pr.bg, color: pr.fg }}>{pr.label}</span>
      <div style={nbaStyles.cardTitle}>{card.title}</div>
      <div style={nbaStyles.evidence}>{card.evidence}</div>

      <div style={nbaStyles.divider} />

      <div style={nbaStyles.actionBlock}>
        <span style={nbaStyles.actionType}>
          <ActionIcon size={14} style={{ flexShrink: 0 }} />
          {card.action.type}
        </span>
        <div style={nbaStyles.assetRow}>
          <span style={nbaStyles.assetName}>{card.action.asset}</span>
          <span style={nbaStyles.durationChip}>{card.action.duration}</span>
        </div>
      </div>

      <span style={nbaStyles.outcome}>
        <TrendingUp size={13} style={{ flexShrink: 0 }} />
        {card.outcome}
      </span>

      <div style={nbaStyles.actionRow}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Button
            variant="primary"
            fullWidth
            onClick={() => onAssign({ name: card.action.asset, duration: card.action.duration })}
          >
            Assign
          </Button>
        </div>
        <KebabMenu onDismiss={onDismiss} />
      </div>
    </Card>
  );
}

// KebabMenu — "More actions" dropdown. View details is a stub; Snooze and
// Dismiss both drop the card from the rail.
function KebabMenu({ onDismiss }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const items = [
    {
      label: "View details",
      onClick: () => {
        // TODO: open the full NBA detail view
      },
    },
    { label: "Snooze 7 days", onClick: onDismiss },
    { label: "Dismiss", onClick: onDismiss },
  ];

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <Button variant="icon" aria-label="More actions" onClick={() => setOpen((o) => !o)}>
        <MoreVertical size={18} />
      </Button>
      {open && (
        <div role="menu" style={nbaStyles.menu}>
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              onClick={() => {
                it.onClick();
                setOpen(false);
              }}
              style={nbaStyles.menuItem}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// NbaSideSheet — right drawer listing every NBA, mirroring the
// RecruitFiltersDrawer surface (fixed panel, --shadow-drawer, no backdrop).
function NbaSideSheet({ items, onAssign, onClose }) {
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside role="complementary" aria-label="All next best actions" style={nbaStyles.sheet}>
      <div style={nbaStyles.sheetHeader}>
        <span style={nbaStyles.sheetTitle}>All next best actions</span>
        <Button variant="icon" aria-label="Close" onClick={onClose}>
          <X size={18} />
        </Button>
      </div>
      <div style={nbaStyles.sheetBody}>
        {items.map((item) => (
          <SideSheetRow key={item.id} item={item} onAssign={onAssign} />
        ))}
      </div>
    </aside>
  );
}

function SideSheetRow({ item, onAssign }) {
  const pr = PRIORITY[item.priority] || PRIORITY.recommended;
  return (
    <div style={nbaStyles.sheetRow}>
      <div style={nbaStyles.sheetRowMain}>
        <span style={{ ...nbaStyles.chip, background: pr.bg, color: pr.fg }}>{pr.label}</span>
        <div style={nbaStyles.sheetRowTitle}>{item.title}</div>
        <div style={nbaStyles.sheetRowEvidence}>{item.evidence}</div>
      </div>
      <Button
        variant="primary"
        onClick={() => onAssign({ name: item.action.asset, duration: item.action.duration })}
      >
        Assign
      </Button>
    </div>
  );
}

// EmptyState — shown when no NBAs remain (e.g. all dismissed).
// TODO: confirm congratulatory empty-state tone with product.
function EmptyState() {
  return (
    <div style={nbaStyles.empty}>
      <PartyPopper size={20} style={{ color: "var(--color-success)", flexShrink: 0 }} />
      <span style={nbaStyles.emptyText}>
        No critical actions needed. Aaliyah is meeting all quality targets this week.
      </span>
    </div>
  );
}

const nbaStyles = {
  zoneHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  zoneLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  rail: {
    display: "flex",
    gap: 16,
    marginTop: 16,
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    scrollbarWidth: "none",
    paddingBottom: 4,
  },
  card: {
    width: CARD_WIDTH,
    flexShrink: 0,
    scrollSnapAlign: "start",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    transition: "opacity 200ms ease",
  },
  chip: {
    alignSelf: "flex-start",
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "var(--do-ink)",
    lineHeight: 1.35,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflow: "hidden",
  },
  evidence: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--text-secondary)",
    lineHeight: 1.4,
  },
  divider: {
    height: 1,
    background: "var(--color-divider-card)",
    margin: "2px 0",
  },
  actionBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  actionType: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  assetRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  assetName: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--do-ink)",
  },
  durationChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: 4,
    background: "var(--color-chip-bg)",
    color: "var(--color-text-tertiary)",
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },
  outcome: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.4,
  },
  actionRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  menu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    right: 0,
    minWidth: 160,
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
  empty: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 16,
    padding: 20,
    background: "var(--surface-alt)",
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  sheet: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: 400,
    background: "var(--surface-white)",
    borderLeft: "1px solid var(--color-divider-card)",
    boxShadow: "var(--shadow-drawer)",
    display: "flex",
    flexDirection: "column",
    zIndex: 40,
  },
  sheetHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: 20,
    height: 56,
    borderBottom: "1px solid var(--color-divider-card)",
    flexShrink: 0,
  },
  sheetTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  sheetBody: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 0",
  },
  sheetRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "16px 20px",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  sheetRowMain: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  sheetRowTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--do-ink)",
  },
  sheetRowEvidence: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--text-secondary)",
    lineHeight: 1.4,
  },
};
