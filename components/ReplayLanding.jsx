"use client";

import React from "react";
import {
  Plus, SlidersHorizontal, ChevronRight, Sparkles, User,
  ShieldCheck, UserPlus, CheckCircle2, Scale, TrendingUp, Heart, Coins, Rocket,
  Inbox,
} from "lucide-react";
import PageHeader from "./PageHeader";
import TabsRow from "./TabsRow";
import Card from "./Card";
import { formatDate } from "./formatDate";
import {
  OUTCOME_TINTS, OUTCOME_LABELS, tabCounts, actionBoxItems,
} from "./mocks/replays";

// ReplayLanding — Replay collections list. Cards follow the skills-card
// pattern; the avatar colour + icon are tied to the collection's business
// outcome (not its driver — driver returns as a second axis later). There
// are no top-level replay actions: replays are AI-built inside a
// collection, so the only landing action is creating a collection. The
// review sidecar (action box) surfaces how many replays are waiting on a
// human across the manual-review collections.

const OUTCOME_ICONS = {
  retention: ShieldCheck,
  acquisition: UserPlus,
  resolution: CheckCircle2,
  compliance: Scale,
  upsell: TrendingUp,
  csat: Heart,
  collections: Coins,
  onboarding: Rocket,
};

export default function ReplayLanding({ collections, onOpenCollection, onCreate }) {
  const [activeTab, setActiveTab] = React.useState("active");
  const [search, setSearch] = React.useState("");

  const counts = tabCounts(collections);
  const TABS = [
    { id: "active", label: "Active", count: counts.active },
    { id: "draft", label: "Draft", count: counts.draft },
    { id: "archived", label: "Archived", count: counts.archived },
  ];

  const inTab = collections.filter((c) => c.state === activeTab);
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inTab;
    return inTab.filter((c) =>
      c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
  }, [inTab, search]);

  const action = actionBoxItems(collections);
  const showActionBox = activeTab === "active" && (action.toReview > 0 || action.drafts > 0);

  return (
    <div style={s.column}>
      <PageHeader
        identifier={{
          icon: <ReplayGlyph />,
          label: "Replay",
          iconBg: "var(--color-icon-tertiary-bg)",
          iconColor: "var(--color-icon-tertiary-fg)",
        }}
        primaryAction={{ label: "Collection", icon: <Plus size={16} />, onClick: onCreate }}
        search={{ value: search, onChange: setSearch, placeholder: "Search collections" }}
        toolbar={[{ id: "filters", icon: <SlidersHorizontal size={18} />, label: "Filters", onClick: () => {} }]}
      />

      {showActionBox && <ActionBox toReview={action.toReview} drafts={action.drafts} />}

      <TabsRow tabs={TABS} activeTab={activeTab} onTabClick={setActiveTab} />

      {filtered.length === 0 ? (
        <EmptyState query={search} tab={TABS.find((t) => t.id === activeTab)?.label} />
      ) : (
        <div style={s.grid}>
          {filtered.map((c) => (
            <CollectionCard key={c.id} collection={c} onClick={() => onOpenCollection(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReplayGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 -960 960 960" fill="var(--color-icon-tertiary-fg)" aria-hidden="true">
      <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-820q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
    </svg>
  );
}

// ---- Action box (review sidecar, rendered inline) ----------------------

function ActionBox({ toReview, drafts }) {
  return (
    <Card padX={20} padY={16} style={s.actionBox}>
      <span style={s.actionIcon} aria-hidden="true">
        <Inbox size={18} color="var(--color-icon-tertiary-fg)" />
      </span>
      <div style={s.actionText}>
        <span style={s.actionTitle}>Action box</span>
        <span style={s.actionBody}>
          {toReview > 0 && (
            <><strong style={s.actionStrong}>{toReview} replays</strong> ready to review</>
          )}
          {toReview > 0 && drafts > 0 && <span style={s.actionDot} aria-hidden="true">·</span>}
          {drafts > 0 && (
            <><strong style={s.actionStrong}>{drafts} draft {drafts === 1 ? "collection" : "collections"}</strong> pending publish</>
          )}
        </span>
      </div>
    </Card>
  );
}

// ---- Collection card ---------------------------------------------------

function CollectionCard({ collection, onClick }) {
  const [hover, setHover] = React.useState(false);
  const tint = OUTCOME_TINTS[collection.outcome] || OUTCOME_TINTS.retention;
  const Icon = OUTCOME_ICONS[collection.outcome] || ShieldCheck;
  const isAi = collection.maintainedBy === "ai";

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={collection.name}
      style={{ ...s.card, boxShadow: hover ? "var(--shadow-4)" : "var(--shadow-card)", transform: hover ? "translateY(-1px)" : "none" }}
    >
      <div style={s.cardTop}>
        <span style={{ ...s.avatar, background: tint.bg, color: tint.fg }} aria-hidden="true">
          <Icon size={20} />
        </span>
        <MaintainedTag isAi={isAi} />
        <ChevronRight size={20} color="var(--color-text-tertiary)" style={{ opacity: hover ? 1 : 0, transition: "opacity 120ms ease" }} aria-hidden="true" />
      </div>

      <div style={s.cardBody}>
        <span style={s.cardTitle}>{collection.name}</span>
        <span style={s.outcomeLine}>{OUTCOME_LABELS[collection.outcome]} · {collection.driver}</span>
        <p style={s.cardDesc}>{collection.description}</p>
      </div>

      <div style={s.cardFooter}>
        <div style={s.metaLeft}>
          <span style={s.metaCount}>{collection.replayCount}</span>
          <span style={s.metaLabel}>replays</span>
          <span style={s.metaDot} aria-hidden="true">·</span>
          <span style={s.metaDate}>{formatDate(collection.lastUpdated)}</span>
        </div>
        {collection.reviewCount > 0 ? (
          <span style={s.reviewPill}>{collection.reviewCount} to review</span>
        ) : (
          <span style={{ ...s.monogram, background: collection.createdBy.bg, color: collection.createdBy.fg }} title={`Created by ${collection.createdBy.name}`} aria-hidden="true">
            {collection.createdBy.initial}
          </span>
        )}
      </div>
    </button>
  );
}

function MaintainedTag({ isAi }) {
  return (
    <span style={{ ...s.maintainTag, marginLeft: "auto" }}>
      {isAi
        ? <Sparkles size={12} color="var(--color-icon-tertiary-fg)" />
        : <User size={12} color="var(--color-text-tertiary)" />}
      <span style={{ ...s.maintainLabel, color: isAi ? "var(--color-icon-tertiary-fg)" : "var(--color-text-tertiary)" }}>
        {isAi ? "AI-maintained" : "Self-maintained"}
      </span>
    </span>
  );
}

function EmptyState({ query, tab }) {
  const heading = query ? "No collections match your search" : `No ${tab?.toLowerCase()} collections`;
  const body = query
    ? "Try a different keyword or clear the search."
    : "Collections you create appear here once the AI starts sampling calls.";
  return (
    <Card padX={32} padY={32} style={s.empty}>
      <span style={s.emptyIcon} aria-hidden="true">
        <ReplayGlyph />
      </span>
      <span style={s.emptyHeading}>{heading}</span>
      <span style={s.emptyBody}>{body}</span>
    </Card>
  );
}

const s = {
  column: { display: "flex", flexDirection: "column", gap: 20, width: "100%", fontFamily: "var(--font-sans)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },

  // Action box
  actionBox: { display: "flex", alignItems: "center", gap: 14, border: "1px solid var(--color-border-card-soft)" },
  actionIcon: {
    width: 36, height: 36, borderRadius: 999, flexShrink: 0,
    background: "var(--color-icon-tertiary-bg)", display: "inline-grid", placeItems: "center",
  },
  actionText: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  actionTitle: { fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  actionBody: { fontSize: 14, fontWeight: 400, color: "var(--color-text-medium)", display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  actionStrong: { fontWeight: 700, color: "var(--color-text-deep)" },
  actionDot: { color: "var(--color-text-tertiary)" },

  // Card
  card: {
    position: "relative", display: "flex", flexDirection: "column", gap: 14,
    width: "100%", minHeight: 220, padding: 24, textAlign: "left",
    background: "var(--surface-white)", border: "none", borderRadius: 12,
    cursor: "pointer", fontFamily: "var(--font-sans)", boxSizing: "border-box",
    transition: "transform 120ms ease, box-shadow 120ms ease",
  },
  cardTop: { display: "flex", alignItems: "center", gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 999, display: "inline-grid", placeItems: "center", flexShrink: 0 },
  maintainTag: { display: "inline-flex", alignItems: "center", gap: 4 },
  maintainLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.3px" },

  cardBody: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 },
  cardTitle: {
    fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.4,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  outcomeLine: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", letterSpacing: "0.3px" },
  cardDesc: {
    margin: 0, fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.5,
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 39,
  },

  cardFooter: {
    marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--color-divider-card)",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
  },
  metaLeft: { display: "inline-flex", alignItems: "baseline", gap: 6, minWidth: 0 },
  metaCount: { fontSize: 13, fontWeight: 700, color: "var(--color-text-medium)", fontVariantNumeric: "tabular-nums" },
  metaLabel: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)" },
  metaDot: { fontSize: 12, color: "var(--color-text-tertiary)" },
  metaDate: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)" },
  reviewPill: {
    display: "inline-flex", alignItems: "center", height: 22, padding: "0 8px", borderRadius: 999,
    background: "var(--color-warning-bg)", color: "var(--color-warning)",
    fontSize: 11, fontWeight: 700, letterSpacing: "0.2px", flexShrink: 0,
  },
  monogram: {
    width: 26, height: 26, borderRadius: 999, display: "inline-grid", placeItems: "center",
    fontSize: 11, fontWeight: 700, flexShrink: 0,
  },

  // Empty
  empty: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" },
  emptyIcon: { width: 48, height: 48, borderRadius: 999, background: "var(--color-icon-tertiary-bg)", display: "inline-grid", placeItems: "center" },
  emptyHeading: { fontSize: 16, fontWeight: 600, color: "var(--color-text-deep)" },
  emptyBody: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", maxWidth: 360, lineHeight: 1.5 },
};
