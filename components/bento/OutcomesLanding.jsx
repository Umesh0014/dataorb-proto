/* eslint-disable no-restricted-syntax --
   The filter pill segments are segmented-control buttons (a two-up toggle),
   not the pill/icon/text shapes Button.jsx models — same precedent as
   VersionBar's segments and the VisibilitySwitch in AskMiraProPage. Raw
   <button> keeps each segment a single accessible tab target. */
"use client";

import React from "react";
import { Search } from "lucide-react";
import Modal from "../Modal";
import BentoGrid from "./BentoGrid";
import { MiraStarIcon } from "../SideNav/icons";
import { OUTCOMES } from "../mocks/outcomes";

// Time-of-day greeting from the local hour — morning < 12, afternoon < 17,
// evening after.
function greetingFor(hour) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// useGreeting — reads the greeting from the client clock without a hydration
// mismatch: useSyncExternalStore serves the server snapshot ("Good morning")
// during SSR + hydration, then swaps to the local-hour snapshot on the client.
const noopSubscribe = () => () => {};
function useGreeting() {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => greetingFor(new Date().getHours()),
    () => "Good morning",
  );
}

/**
 * OutcomesLanding — the "Outcomes" landing direction for Ask Mira Pro.
 *
 * Metrics-first home: centered Mira mark + time-of-day greeting, a wide
 * "Search Outcomes" input, a Your outcome / Archived filter pill, then a
 * bento grid of outcome tiles. Search, filter, and pin/archive/delete are
 * local in-memory state (no persistence). Delete confirms via a Modal before
 * removing the tile from view.
 *
 * @param {{ userName?: string }} props
 */
export default function OutcomesLanding({ userName = "Neil" }) {
  const [outcomes, setOutcomes] = React.useState(OUTCOMES);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("active"); // "active" | "archived"
  const [pendingDeleteId, setPendingDeleteId] = React.useState(null);

  const greeting = useGreeting();

  const togglePin = (id) =>
    setOutcomes((prev) => prev.map((o) => (o.id === id ? { ...o, pinned: !o.pinned } : o)));
  const archive = (id) =>
    setOutcomes((prev) => prev.map((o) => (o.id === id ? { ...o, archived: !o.archived } : o)));
  const confirmDelete = () => {
    setOutcomes((prev) => prev.filter((o) => o.id !== pendingDeleteId));
    setPendingDeleteId(null);
  };

  const pendingName = outcomes.find((o) => o.id === pendingDeleteId)?.name;

  return (
    <div style={s.scroll}>
      <div style={s.deck}>
        <div style={s.greeting}>
          <div style={s.markWrap} aria-hidden="true">
            <MiraStarIcon size={48} />
          </div>
          <div style={s.greetingHeading}>
            Hello {userName}, {greeting}
          </div>
        </div>

        <div style={s.searchBar}>
          <Search size={20} color="var(--color-text-placeholder)" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Outcomes"
            aria-label="Search outcomes"
            style={s.searchInput}
          />
        </div>

        <div style={s.filterPill} role="tablist" aria-label="Outcome filter">
          <FilterSeg label="Your outcome" active={filter === "active"} onClick={() => setFilter("active")} />
          <FilterSeg label="Archived" active={filter === "archived"} onClick={() => setFilter("archived")} />
        </div>

        <BentoGrid
          outcomes={outcomes}
          filter={filter}
          query={query}
          onTogglePin={togglePin}
          onArchive={archive}
          onRequestDelete={setPendingDeleteId}
        />
      </div>

      <Modal
        open={pendingDeleteId != null}
        onDismiss={() => setPendingDeleteId(null)}
        title="Delete outcome?"
        body={
          pendingName
            ? `“${pendingName}” will be removed from your outcomes. This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        confirmTone="danger"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

// Minimal token-driven segmented pill — active segment is the brand blue per
// the wireframe (the canonical VersionBar uses a dark/yellow treatment, so
// this is a local pill rather than a fork; flagged for component review).
function FilterSeg({ label, active, onClick }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{ ...s.seg, ...(active ? s.segActive : null) }}
    >
      {label}
    </button>
  );
}

const s = {
  scroll: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
  },
  deck: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
    width: "100%",
    maxWidth: 980,
    marginInline: "auto",
    paddingBottom: 8,
  },

  greeting: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    textAlign: "center",
    paddingTop: 8,
  },
  markWrap: {
    width: 56,
    height: 56,
    display: "grid",
    placeItems: "center",
  },
  greetingHeading: {
    fontSize: 24,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
  },

  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    maxWidth: 600,
    height: 56,
    paddingInline: 24,
    borderRadius: 28,
    background: "var(--color-primary-alpha-12)",
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    color: "var(--color-text-deep)",
  },

  filterPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: 6,
    borderRadius: 48,
    background: "var(--color-card-emoji-bg)",
  },
  seg: {
    appearance: "none",
    border: "none",
    background: "transparent",
    height: 36,
    paddingInline: 16,
    borderRadius: 24,
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    cursor: "pointer",
    transition: "background 120ms ease, color 120ms ease",
  },
  segActive: {
    background: "var(--color-button-primary-bg)",
    color: "var(--surface-white)",
  },
};
