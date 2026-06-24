/* eslint-disable no-restricted-syntax --
   The "Your outcome / Archived" segmented toggle is a two-segment switcher,
   not a Button.jsx pill/icon/text shape — same precedent as the composer's
   Private/Public VisibilitySwitch in AskMiraProPage. Raw <button> keeps each
   segment a single accessible target.

   NOTE (flag → Neil): the ticket asked to wire this toggle with the canonical
   VersionBar, but VersionBar is a fixed floating bottom-right dock (one already
   renders on this route for the direction switcher) — it can't sit inline
   between the search field and the grid, and a second instance would collide.
   So the toggle is an inline segmented switcher here, drawn blue-on-light to
   match the mock. Toggle colour treatment + the VersionBar reuse decision are
   Neil's calls. */
"use client";

import React from "react";
import { Search, Pin } from "lucide-react";
import OutcomeCard from "./OutcomeCard";
import OutcomeDetail from "./OutcomeDetail";
import { OUTCOMES, ARCHIVED_OUTCOMES } from "./mocks/outcomes";
import { MiraStarIcon } from "./SideNav/icons";

/**
 * OutcomesLanding — the outcomes-first home state for Ask Mira Pro. Replaces
 * the old blank-composer empty state: the user lands on the outcomes they
 * care about (a 2×2 bento of OutcomeCards) rather than a free-text box.
 *
 * A time-aware greeting tops a centered column; a Search Outcomes field
 * filters the active set by title; a segmented toggle switches between the
 * live ("Your outcome") and archived sets, and search applies to whichever
 * set is showing. Clicking a card opens its OutcomeDetail drill-in (with the
 * Ask Mira Pro composer docked sticky at the bottom).
 *
 * @param {{ userName?: string, composer?: React.ReactNode }} props
 */
export default function OutcomesLanding({ userName = "there", composer }) {
  const [tab, setTab] = React.useState("active");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState(null);
  const [pinnedIds, setPinnedIds] = React.useState([]);
  const togglePin = (id) =>
    setPinnedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  // Period is computed client-side only: server and client time zones differ,
  // so deriving it during render would risk a hydration mismatch. Setting it
  // once on mount is the intended pattern here despite the lint rule.
  const [period, setPeriod] = React.useState("");
  React.useEffect(() => {
    // Deferred to the client to keep the greeting hydration-safe (the value
    // is local-time dependent, so server and client would otherwise disagree).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPeriod(greetingPeriod(new Date().getHours()));
  }, []);

  const set = tab === "active" ? OUTCOMES : ARCHIVED_OUTCOMES;
  const q = query.trim().toLowerCase();
  const filtered = q
    ? set.filter((o) => o.title.toLowerCase().includes(q))
    : set;
  const pinned = filtered.filter((o) => pinnedIds.includes(o.id));
  const rest = filtered.filter((o) => !pinnedIds.includes(o.id));

  if (selected) {
    return (
      <OutcomeDetail
        outcome={selected}
        composer={composer}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div style={olStyles.page}>
      <div style={olStyles.column}>
        <div style={olStyles.hero}>
          <MiraStarIcon size={44} />
          <h1 style={olStyles.greeting}>
            Hello {userName}{period ? `, Good ${period}` : ""}
          </h1>
        </div>

        <div style={olStyles.search}>
          <Search size={18} color="var(--color-text-placeholder)" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Outcomes"
            aria-label="Search Outcomes"
            style={olStyles.searchInput}
          />
        </div>

        <SegmentedToggle value={tab} onChange={setTab} />

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {pinned.length > 0 && (
              <div style={olStyles.section}>
                <div style={olStyles.sectionHead}>
                  <Pin size={15} color="var(--color-text-tertiary)" />
                  <span>Pinned</span>
                  <span style={olStyles.sectionCount}>{pinned.length}</span>
                </div>
                <div style={olStyles.grid}>
                  {pinned.map((outcome) => (
                    <OutcomeCard
                      key={outcome.id}
                      outcome={outcome}
                      pinned
                      onPin={() => togglePin(outcome.id)}
                      onClick={() => setSelected(outcome)}
                    />
                  ))}
                </div>
              </div>
            )}
            {rest.length > 0 && (
              <div style={olStyles.grid}>
                {rest.map((outcome) => (
                  <OutcomeCard
                    key={outcome.id}
                    outcome={outcome}
                    pinned={false}
                    onPin={() => togglePin(outcome.id)}
                    onClick={() => setSelected(outcome)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function greetingPeriod(hour) {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

// Inline blue-on-light segmented switcher (see file-top flag re: VersionBar).
const SEGMENTS = [
  { id: "active", label: "Your outcome" },
  { id: "archived", label: "Archived" },
];

function SegmentedToggle({ value, onChange }) {
  return (
    <div style={olStyles.toggle} role="group" aria-label="Outcome set">
      {SEGMENTS.map(({ id, label }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={active}
            style={{ ...olStyles.segment, ...(active ? olStyles.segmentActive : null) }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// EmptyState — shown in the grid region when search clears the active set.
// Mirrors the SkillsPage empty-state pattern (no shared EmptyStateIllustration
// primitive exists to reuse).
function EmptyState() {
  return (
    <div style={olStyles.empty}>
      <span style={olStyles.emptyIcon}>
        <Search size={28} color="var(--color-text-placeholder)" />
      </span>
      <span style={olStyles.emptyHeading}>No outcomes found</span>
      <span style={olStyles.emptyBody}>
        No outcomes match your search. Try a different name.
      </span>
    </div>
  );
}

const olStyles = {
  page: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    fontFamily: "var(--font-sans)",
    paddingTop: 80,
  },
  // Widened so each bento card has room to breathe; the search field and
  // toggle stay centered at a narrower cap so they don't stretch full-width.
  column: {
    width: "100%",
    maxWidth: 1040,
    marginInline: "auto",
    display: "flex",
    flexDirection: "column",
  },

  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
    textAlign: "center",
  },

  search: {
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 10,
    height: 48,
    paddingInline: 16,
    borderRadius: 12,
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
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

  toggle: {
    display: "inline-flex",
    alignSelf: "center",
    alignItems: "center",
    gap: 2,
    padding: 4,
    marginBottom: 64,
    borderRadius: 999,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
  },
  segment: {
    height: 34,
    paddingInline: 20,
    borderRadius: 999,
    border: "none",
    background: "transparent",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    cursor: "pointer",
  },
  segmentActive: {
    background: "var(--color-primary-alpha-12)",
    color: "var(--color-button-primary-bg)",
    fontWeight: 700,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
  },
  // Pinned outcomes sit in their own labelled section above the rest.
  section: {
    marginBottom: 28,
  },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  sectionCount: {
    minWidth: 20,
    height: 20,
    paddingInline: 6,
    borderRadius: 10,
    background: "var(--color-primary-alpha-12)",
    color: "var(--color-button-primary-bg)",
    fontSize: 11,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 8,
    paddingBlock: 48,
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
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.5,
  },
};
