"use client";

import React from "react";
import {
  ArrowRight,
  MoreHorizontal,
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
import { lhP, lhNba, lhDurationMin } from "./learningHubLocale";

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
export default function NextBestActions({ onAssign, hideHeader = false, sheetOpen, onSheetOpenChange, locale = "en" }) {
  const [dismissed, setDismissed] = React.useState([]);
  const [fadingId, setFadingId] = React.useState(null);
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
      {!hideHeader && (
      <div style={nbaStyles.zoneHeader}>
        <span style={nbaStyles.zoneLabel}>{lhP(locale, "nba")}</span>
        <span ref={viewAllRef} style={{ flexShrink: 0 }}>
          <Button
            variant="text"
            uppercase={false}
            trailingIcon={<ArrowRight size={16} />}
            onClick={() => onSheetOpenChange(true)}
          >
            {lhP(locale, "viewAll")}
          </Button>
        </span>
      </div>
      )}

      {visible.length === 0 ? (
        <EmptyState locale={locale} />
      ) : (
        <div style={nbaStyles.rail} className="scrollbar-none">
          {visible.map((card) => (
            <NbaCard
              key={card.id}
              card={card}
              fading={fadingId === card.id}
              onAssign={onAssign}
              onDismiss={() => dismissCard(card.id)}
              locale={locale}
            />
          ))}
        </div>
      )}

      {sheetOpen && (
        <NbaSideSheet
          items={[...NBA_CARDS, ...NBA_MORE]}
          onAssign={onAssign}
          locale={locale}
          onClose={() => {
            onSheetOpenChange(false);
            viewAllRef.current?.querySelector("button")?.focus();
          }}
        />
      )}
    </div>
  );
}

// NbaCard — one rail card in three layers: a top group (priority pill,
// title, description), an inset lavender block for the drill being
// assigned (title + duration + projected outcome), and a bottom CTA row
// (Assign button + kebab menu). The lavender block flexes so CTA rows
// stay aligned across cards of differing content height.
function NbaCard({ card, fading, onAssign, onDismiss, locale = "en" }) {
  const ActionIcon = ACTION_ICON[card.action.type] || Target;
  const c = lhNba(locale, card.id);
  const assetName = c?.asset ?? card.action.asset;
  return (
    <Card padX={20} padY={20} shadow style={{ ...nbaStyles.card, opacity: fading ? 0 : 1 }}>
      <div style={nbaStyles.topGroup}>
        <div style={nbaStyles.cardTitle} dir="auto">{c?.title ?? card.title}</div>
        <div style={nbaStyles.evidence} dir="auto">{c?.evidence ?? card.evidence}</div>
      </div>

      <div style={nbaStyles.drillBlock}>
        <div style={nbaStyles.drillRow}>
          <span style={nbaStyles.drillTitle}>
            <ActionIcon size={14} style={{ flexShrink: 0, color: "var(--text-secondary)" }} />
            <span style={nbaStyles.assetName} dir="auto">{assetName}</span>
          </span>
          <span style={nbaStyles.durationChip}>{lhDurationMin(locale, card.action.duration)}</span>
        </div>
        <span style={nbaStyles.drillDesc} dir="auto">
          <TrendingUp size={12} style={{ flexShrink: 0, marginTop: 2, color: "var(--chart-blue)" }} />
          {c?.outcome ?? card.outcome}
        </span>
      </div>

      <div style={nbaStyles.ctaRow}>
        <button
          type="button"
          onClick={() => onAssign({ name: assetName, duration: lhDurationMin(locale, card.action.duration) })}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = "brightness(0.95)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "none";
          }}
          style={nbaStyles.assignBtn}
        >
          {lhP(locale, "assign")}
        </button>
        <KebabMenu onDismiss={onDismiss} locale={locale} />
      </div>
    </Card>
  );
}

// KebabMenu — "More actions" dropdown. View details is a stub; Snooze and
// Dismiss both drop the card from the rail.
function KebabMenu({ onDismiss, locale = "en" }) {
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
      label: lhP(locale, "viewDetails"),
      onClick: () => {
        // TODO: open the full NBA detail view
      },
    },
    { label: lhP(locale, "snooze7"), onClick: onDismiss },
    { label: lhP(locale, "dismiss"), onClick: onDismiss },
  ];

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        aria-label={lhP(locale, "moreActions")}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--grey-50)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--surface-white)";
        }}
        style={nbaStyles.kebabBtn}
      >
        <MoreHorizontal size={16} />
      </button>
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
function NbaSideSheet({ items, onAssign, onClose, locale = "en" }) {
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside role="complementary" aria-label={lhP(locale, "allNba")} style={nbaStyles.sheet}>
      <div style={nbaStyles.sheetHeader}>
        <span style={nbaStyles.sheetTitle}>{lhP(locale, "allNba")}</span>
        <Button variant="icon" aria-label={lhP(locale, "close")} onClick={onClose}>
          <X size={18} />
        </Button>
      </div>
      <div style={nbaStyles.sheetBody}>
        {items.map((item) => (
          <SideSheetRow key={item.id} item={item} onAssign={onAssign} locale={locale} />
        ))}
      </div>
    </aside>
  );
}

function SideSheetRow({ item, onAssign, locale = "en" }) {
  const pr = PRIORITY[item.priority] || PRIORITY.recommended;
  const c = lhNba(locale, item.id);
  const assetName = c?.asset ?? item.action.asset;
  return (
    <div style={nbaStyles.sheetRow}>
      <div style={nbaStyles.sheetRowMain}>
        <span style={{ ...nbaStyles.chip, background: pr.bg, color: pr.fg }}>{lhP(locale, `pr_${item.priority}`)}</span>
        <div style={nbaStyles.sheetRowTitle} dir="auto">{c?.title ?? item.title}</div>
        <div style={nbaStyles.sheetRowEvidence} dir="auto">{c?.evidence ?? item.evidence}</div>
      </div>
      <Button
        variant="primary"
        onClick={() => onAssign({ name: assetName, duration: lhDurationMin(locale, item.action.duration) })}
      >
        {lhP(locale, "assign")}
      </Button>
    </div>
  );
}

// EmptyState — shown when no NBAs remain (e.g. all dismissed).
// TODO: confirm congratulatory empty-state tone with product.
function EmptyState({ locale = "en" }) {
  return (
    <div style={nbaStyles.empty}>
      <PartyPopper size={20} style={{ color: "var(--color-success)", flexShrink: 0 }} />
      <span style={nbaStyles.emptyText}>
        {lhP(locale, "emptyNba")}
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
    borderRadius: 16,
    border: "1px solid var(--grey-200)",
    display: "flex",
    flexDirection: "column",
    gap: 24,
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
  topGroup: {
    display: "flex",
    flexDirection: "column",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "var(--text-primary)",
    lineHeight: 1.3,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflow: "hidden",
  },
  evidence: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: 400,
    color: "var(--text-secondary)",
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    overflow: "hidden",
  },
  drillBlock: {
    flex: 1,
    background: "var(--color-card-emoji-bg)",
    borderRadius: 12,
    padding: 12,
    display: "flex",
    flexDirection: "column",
  },
  drillRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  drillTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  assetName: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary)",
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  durationChip: {
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 6px",
    borderRadius: 4,
    background: "var(--surface-white)",
    border: "1px solid var(--grey-200)",
    color: "var(--text-secondary)",
    fontSize: 11,
    fontWeight: 500,
  },
  drillDesc: {
    marginTop: 8,
    display: "flex",
    alignItems: "flex-start",
    gap: 6,
    fontSize: 12,
    fontWeight: 400,
    color: "var(--text-secondary)",
    lineHeight: 1.4,
  },
  ctaRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  assignBtn: {
    flex: 1,
    height: 40,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    borderRadius: 999,
    background: "var(--chart-blue)",
    color: "#FFFFFF",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    cursor: "pointer",
    transition: "filter 120ms ease",
  },
  kebabBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    padding: 0,
    borderRadius: 999,
    border: "1px solid var(--grey-200)",
    background: "var(--surface-white)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "background 120ms ease",
  },
  menu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    insetInlineEnd: 0,
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
    textAlign: "start",
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
    insetInlineEnd: 0,
    bottom: 0,
    width: 400,
    background: "var(--surface-white)",
    borderInlineStart: "1px solid var(--color-divider-card)",
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
