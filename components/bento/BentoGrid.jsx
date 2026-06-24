"use client";

import React from "react";
import OutcomeCard from "./OutcomeCard";

/**
 * BentoGrid — masonry-rhythm grid of outcome tiles.
 *
 * A 4-column base (each tile declares a span: wide = 2, tall = 1) with dense
 * auto-flow so the wireframe rhythm (two wide tiles, then narrow → wide →
 * narrow) emerges from the data order rather than hand-placed cells. Renders
 * any N; the parent owns the scroll region so 10+ outcomes stay scannable.
 *
 * Derives the visible set from the raw outcomes: the "active" filter hides
 * archived tiles, "archived" shows only archived; a name query narrows
 * further; pinned tiles sort to the front (stable otherwise).
 *
 * @param {{
 *   outcomes: Array<object>,
 *   filter: "active" | "archived",
 *   query: string,
 *   onTogglePin: (id: string) => void,
 *   onArchive: (id: string) => void,
 *   onRequestDelete: (id: string) => void,
 * }} props
 */
export default function BentoGrid({ outcomes, filter, query, onTogglePin, onArchive, onRequestDelete }) {
  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return outcomes
      .filter((o) => (filter === "archived" ? o.archived : !o.archived))
      .filter((o) => (q ? o.name.toLowerCase().includes(q) : true))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [outcomes, filter, query]);

  if (visible.length === 0) {
    return (
      <div style={g.empty}>
        {query.trim()
          ? `No outcomes match “${query.trim()}”.`
          : filter === "archived"
            ? "No archived outcomes."
            : "No outcomes yet."}
      </div>
    );
  }

  return (
    <div style={g.grid}>
      {visible.map((o) => (
        <OutcomeCard
          key={o.id}
          outcome={o}
          onTogglePin={onTogglePin}
          onArchive={onArchive}
          onRequestDelete={onRequestDelete}
        />
      ))}
    </div>
  );
}

const g = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gridAutoRows: 200,
    gap: 16,
    gridAutoFlow: "row dense",
  },
  empty: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
};
