"use client";

import React from "react";
import {
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  ListFilter,
  Target,
  BadgeCheck,
  Gauge,
  RefreshCw,
  Headset,
  Tag,
  AlertTriangle,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import { SkillsIcon } from "./SideNav/icons";
import { SKILLS } from "./mocks/skills";

// SkillsPage — Ask Mira Pro module's Skills library landing page. Lists
// every runnable AI skill as a card grid; picking a skill is the first
// step into the task-based AskMiraPro experience. Renders inside the
// PageLayout supplied by app/page.jsx (no layout primitives here).

const SEARCH_DEBOUNCE_MS = 150;

// lucide-react icon name (skill.icon) → component. Skills carry the name
// as a plain string so the mock data stays serialisable.
const ICON_MAP = { Target, BadgeCheck, Gauge, RefreshCw, Headset, Tag, AlertTriangle };

// Category tint → { bg, glyph } token pair. The six observed tints map
// onto existing severity / secondary tokens; pink and teal reuse their
// closest neighbours pending real tint tokens from design (spec Q4).
const TINT = {
  purple: { bg: "var(--color-icon-tertiary-bg)", glyph: "var(--color-icon-tertiary-fg)" },
  green: { bg: "var(--color-success-bg)", glyph: "var(--color-success)" },
  teal: { bg: "var(--color-info-bg)", glyph: "var(--color-info)" },
  pink: { bg: "var(--color-error-bg)", glyph: "var(--color-secondary-500)" },
  orange: { bg: "var(--color-warning-bg)", glyph: "var(--color-warning)" },
  red: { bg: "var(--color-error-bg)", glyph: "var(--color-error)" },
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// formatDate — ISO date → "DD MMM YYYY" (e.g. "23 Mar 2026").
function formatDate(iso) {
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${day} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export default function SkillsPage({ pageName, onOpenSkill }) {
  const [search, setSearch] = React.useState("");
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const previous = document.title;
    document.title = pageName || "Skills";
    return () => {
      document.title = previous;
    };
  }, [pageName]);

  // Debounce the name filter so a burst of keystrokes filters once.
  React.useEffect(() => {
    const t = window.setTimeout(() => setQuery(search), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [search]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SKILLS;
    return SKILLS.filter((skill) => skill.name.toLowerCase().includes(q));
  }, [query]);

  const openSkill = (id) => {
    if (onOpenSkill) onOpenSkill(id);
  };

  return (
    <div style={s.page}>
      <Card padX={28} padY={20} tone="default" style={s.headerCard}>
        <div style={s.headerInner}>
          <div style={s.row1}>
            {/* Page-type selector — inert in v1 (spec Q3). */}
            <button type="button" aria-disabled="true" style={s.selector}>
              <span style={s.selectorIcon}>
                <SkillsIcon size={16} />
              </span>
              <span style={s.selectorLabel}>Skills</span>
              <span style={s.selectorChevron}>
                <ChevronDown size={16} color="var(--color-text-medium)" />
              </span>
            </button>
            <Button variant="primary" leadingIcon={<Plus size={16} />}>
              Skills
            </Button>
          </div>

          <div style={s.row2}>
            <Search size={18} color="var(--color-text-placeholder)" />
            <input
              type="text"
              className="skills-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by skill name"
              aria-label="Search skills"
              style={s.searchInput}
            />
            <div style={s.iconGroup}>
              <Button variant="icon" size="sm" title="Sort" aria-label="Sort skills">
                <ArrowUpDown size={18} />
              </Button>
              <Button variant="icon" size="sm" title="Filter" aria-label="Filter skills">
                <ListFilter size={18} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {filtered.length > 0 ? (
        <div style={s.grid}>
          {filtered.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onClick={() => openSkill(skill.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

// SkillCard — one runnable skill. The whole card is a button: clicking it
// opens the skill's record view. Hover lifts the card and fades in the
// top-right chevron; the focus ring is handled by the .skill-card rule in
// globals.css.
function SkillCard({ skill, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  const Icon = ICON_MAP[skill.icon] || Target;
  const tint = TINT[skill.tint] || TINT.purple;
  const chevronShown = hovered || focused;

  return (
    <button
      type="button"
      className="skill-card"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...sc.card,
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        boxShadow: hovered ? "var(--shadow-4)" : "var(--shadow-card)",
      }}
    >
      <span style={{ ...sc.iconBox, background: tint.bg, color: tint.glyph }}>
        <Icon size={20} />
      </span>

      <span style={{ ...sc.chevron, opacity: chevronShown ? 1 : 0 }}>
        <ChevronRight size={20} color="var(--color-text-medium)" />
      </span>

      <div style={sc.titleGroup}>
        <span style={sc.title}>{skill.name}</span>
        <span style={sc.author}>By {skill.publisher}</span>
      </div>

      <p style={sc.description}>{skill.description}</p>

      <div style={sc.footer}>
        <div style={sc.divider} />
        <div style={sc.metaRow}>
          <span style={sc.runs}>{skill.runs} Runs</span>
          <span style={sc.updated}>
            Last Updated: {formatDate(skill.lastUpdated)}
          </span>
        </div>
      </div>
    </button>
  );
}

// EmptyState — shown in the grid region when search clears all results.
// The header card stays mounted above it.
function EmptyState() {
  return (
    <div style={s.empty}>
      <span style={s.emptyIcon}>
        <Search size={28} color="var(--color-text-placeholder)" />
      </span>
      <span style={s.emptyHeading}>No skills found</span>
      <span style={s.emptyBody}>
        No skills match your search. Try a different name.
      </span>
    </div>
  );
}

const s = {
  page: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    fontFamily: "var(--font-sans)",
  },
  headerCard: { flexShrink: 0 },
  headerInner: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  row1: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  selector: {
    display: "inline-flex",
    alignItems: "center",
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "default",
    fontFamily: "var(--font-sans)",
  },
  selectorIcon: {
    width: 32,
    height: 32,
    borderRadius: 999,
    background: "var(--color-card-emoji-bg)",
    color: "var(--color-secondary-500)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  selectorLabel: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  selectorChevron: {
    marginLeft: 4,
    display: "inline-flex",
    alignItems: "center",
  },
  row2: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-deep)",
  },
  iconGroup: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
  },
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 8,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 999,
    background: "var(--color-card-emoji-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyHeading: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  emptyBody: {
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.5,
  },
};

const sc = {
  card: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    width: "100%",
    minHeight: 240,
    padding: 24,
    background: "var(--surface-white)",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "var(--font-sans)",
    boxSizing: "border-box",
    transition: "transform 120ms ease, box-shadow 120ms ease",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chevron: {
    position: "absolute",
    top: 24,
    right: 24,
    display: "inline-flex",
    transition: "opacity 120ms ease",
    pointerEvents: "none",
  },
  titleGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  author: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-medium)",
    lineHeight: 1.4,
  },
  description: {
    margin: 0,
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    minHeight: 39,
  },
  footer: {
    marginTop: "auto",
    display: "flex",
    flexDirection: "column",
  },
  divider: {
    height: 1,
    background: "var(--color-divider-card)",
    marginTop: 4,
    marginBottom: 16,
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  runs: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  updated: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },
};
