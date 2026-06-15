"use client";

import React from "react";
import { Plus, SlidersHorizontal, ChevronRight, BookOpen } from "lucide-react";
import PageHeader from "./PageHeader";
import TabsRow from "./TabsRow";
import Card from "./Card";
import { GUIDES, GUIDE_TAB_COUNTS } from "./mocks/guides";
import { localizedMonths } from "./formatDate";
import {
  lhG, lhText, lhGuideEmptyLane, lhGuideEmptySearchBody, lhGuideContent, lhTerm, buildLocaleFilter,
} from "./learningHubLocale";

// GuidePage — Learning Hub Guide landing.
//
// Reuses the shared PageHeader (lavender identifier tile + "+ Guide"
// primary CTA + search + filter toolbar — same shape Drill and Missions
// adopt). TabsRow renders the four lifecycle tabs with per-tab counts.
// The body is a two-column responsive grid of GuideCard.
//
// All wiring is presentational: search + filter + CTA fire local-state
// updates / no-op stubs until the Guide creation flow ships. Active
// sessions or downstream consumers are untouched.

// Lane labels localize via lhG(`tab_${id}`); counts come from the mock.
const TABS = [
  { id: "active",      labelKey: "tab_active",      count: GUIDE_TAB_COUNTS.active },
  { id: "calibration", labelKey: "tab_calibration", count: GUIDE_TAB_COUNTS.calibration },
  { id: "draft",       labelKey: "tab_draft",       count: GUIDE_TAB_COUNTS.draft },
  { id: "archived",    labelKey: "tab_archived",    count: GUIDE_TAB_COUNTS.archived },
];

const TAG_MAX = 15;
function truncate(s, n) {
  if (!s) return s;
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

// Day-first date with localized month (e.g. "07 May, 2026").
function formatDate(iso, locale = "en") {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  const months = localizedMonths(locale);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${months[d.getUTCMonth()]}, ${d.getUTCFullYear()}`;
}

export default function GuidePage({ onCreateGuide, onOpenGuide, locale = "en", onLocaleChange }) {
  const [activeTab, setActiveTab] = React.useState("active");
  const [search, setSearch] = React.useState("");
  const tabs = TABS.map((t) => ({ ...t, label: lhG(locale, t.labelKey) }));

  const guides = React.useMemo(
    () => GUIDES.filter((g) => g.state === activeTab),
    [activeTab],
  );
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guides;
    return guides.filter((g) =>
      g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q),
    );
  }, [guides, search]);

  return (
    <div style={styles.column}>
      <PageHeader
        identifier={{
          icon: <BookOpen size={16} color="var(--color-icon-tertiary-fg)" />,
          label: lhG(locale, "title"),
          withDropdown: false,
          iconBg: "var(--color-icon-tertiary-bg)",
          iconColor: "var(--color-icon-tertiary-fg)",
        }}
        primaryAction={{
          label: lhG(locale, "title"),
          icon: <Plus size={16} />,
          onClick: () => onCreateGuide?.(),
        }}
        search={{ value: search, onChange: setSearch, placeholder: lhText(locale, "search") }}
        filters={[buildLocaleFilter(locale, onLocaleChange)]}
        toolbar={[{
          id: "filters",
          icon: <SlidersHorizontal size={18} />,
          label: lhText(locale, "filters"),
          // TODO: wire filter drawer when Guide filter set is defined.
          onClick: () => {},
        }]}
      />

      <TabsRow tabs={tabs} activeTab={activeTab} onTabClick={setActiveTab} />

      {filtered.length === 0 ? (
        <EmptyState query={search} tabLabel={lhG(locale, `tab_${activeTab}`)} locale={locale} />
      ) : (
        <div style={styles.grid}>
          {filtered.map((g) => (
            <GuideCard key={g.id} guide={g} onClick={() => onOpenGuide?.(g.id)} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Guide card --------------------------------------------------------

function GuideCard({ guide, onClick, locale = "en" }) {
  const [hover, setHover] = React.useState(false);
  const langs = guide.languages || [];
  const extraLangs = Math.max(0, langs.length - 1);
  const content = lhGuideContent(locale, guide.id);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={guide.title}
      style={{
        ...styles.card,
        boxShadow: hover ? "0 6px 16px rgba(69, 70, 79, 0.16)" : "var(--shadow-card)",
      }}
    >
      <div style={styles.cardHeader}>
        <span
          style={{
            ...styles.monogram,
            background: guide.author.bg,
            color: guide.author.fg,
          }}
          aria-hidden="true"
        >
          {guide.author.initial}
        </span>
        <ChevronRight size={20} color="var(--color-text-tertiary)" aria-hidden="true" />
      </div>

      <div style={styles.body}>
        <span style={styles.title} dir="auto">{content?.title ?? guide.title}</span>
        <p style={styles.description} dir="auto">{content?.description ?? guide.description}</p>
        <div style={styles.langRow}>
          {langs.length > 0 && (
            <span style={styles.langChip} title={lhTerm(locale, langs[0])}>
              {truncate(lhTerm(locale, langs[0]), TAG_MAX)}
            </span>
          )}
          {extraLangs > 0 && (
            <span style={styles.langOverflow} title={langs.slice(1).join("\n")}>
              +{extraLangs}
            </span>
          )}
        </div>
      </div>

      <div style={styles.metaRow}>
        <span style={styles.metaArtefacts}>
          <span style={styles.artefactCount}>{guide.artefacts}</span>
          <span style={styles.metaLabel}>{lhG(locale, "artefacts")}</span>
        </span>
        <span style={styles.dot} aria-hidden="true">·</span>
        <span style={styles.metaDate}>{formatDate(guide.updatedAt, locale)}</span>
      </div>
    </button>
  );
}

// ---- Empty state -------------------------------------------------------

function EmptyState({ query, tabLabel, locale = "en" }) {
  const heading = query
    ? lhG(locale, "emptyNoMatch")
    : lhGuideEmptyLane(locale, tabLabel);
  const body = query
    ? lhGuideEmptySearchBody(locale, tabLabel)
    : lhG(locale, "emptyBodyLane");
  return (
    <Card padX={32} padY={32} style={styles.empty}>
      <span style={styles.emptyIconTile} aria-hidden="true">
        <BookOpen size={24} color="var(--color-icon-tertiary-fg)" />
      </span>
      <span style={styles.emptyHeading}>{heading}</span>
      <span style={styles.emptyBody}>{body}</span>
    </Card>
  );
}

// ---- Styles ------------------------------------------------------------

const styles = {
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    width: "100%",
    fontFamily: "var(--font-sans)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },

  // Card
  card: {
    appearance: "none",
    border: "none",
    background: "#FFFFFF",
    borderRadius: 8,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    cursor: "pointer",
    textAlign: "start",
    fontFamily: "inherit",
    width: "100%",
    transition: "box-shadow 120ms ease",
    boxShadow: "var(--shadow-card)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  monogram: {
    width: 32,
    height: 32,
    borderRadius: 999,
    display: "inline-grid",
    placeItems: "center",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.15px",
    flexShrink: 0,
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: 500,
    lineHeight: "22px",
    letterSpacing: "0.1px",
    color: "var(--color-text-medium)",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  description: {
    margin: 0,
    fontSize: 12,
    fontWeight: 400,
    lineHeight: "18px",
    letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    minHeight: 36,
  },
  langRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  langChip: {
    display: "inline-flex",
    alignItems: "center",
    height: 24,
    padding: "0 6px",
    borderRadius: 4,
    background: "var(--color-chip-bg)",
    color: "var(--color-text-medium)",
    fontSize: 12,
    fontWeight: 400,
    whiteSpace: "nowrap",
    fontFamily: '"JetBrains Mono", monospace',
  },
  langOverflow: {
    display: "inline-flex",
    alignItems: "center",
    height: 24,
    padding: "0 6px",
    borderRadius: 4,
    background: "var(--color-chip-bg)",
    color: "var(--color-text-tertiary)",
    fontSize: 12,
    fontWeight: 400,
    fontFamily: '"JetBrains Mono", monospace',
  },

  // Meta row (footer)
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    paddingTop: 16,
    borderTop: "1px solid var(--color-border-card-soft)",
  },
  metaArtefacts: {
    display: "inline-flex",
    alignItems: "baseline",
    gap: 4,
  },
  artefactCount: {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--color-text-medium)",
    fontVariantNumeric: "tabular-nums",
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },
  dot: {
    fontSize: 12,
    color: "var(--color-text-tertiary)",
  },
  metaDate: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },

  // Empty state
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    textAlign: "center",
  },
  emptyIconTile: {
    width: 48,
    height: 48,
    borderRadius: 999,
    background: "var(--color-icon-tertiary-bg)",
    display: "inline-grid",
    placeItems: "center",
  },
  emptyHeading: {
    fontSize: 16,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  emptyBody: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    maxWidth: 360,
    lineHeight: 1.5,
  },
};
