"use client";

import React from "react";

/**
 * ComingSoon — shared placeholder for routes whose real page hasn't shipped.
 * Boring on purpose: no illustrations, no CTAs, no animations, no marketing
 * copy. Replacing the mount with the real page is the only future change.
 *
 * Sits inside PageLayout's content region. The region grows to fill leftover
 * vertical space; ComingSoon centers within it via flex.
 *
 * @param {{ pageName: string }} props
 */
export default function ComingSoon({ pageName }) {
  React.useEffect(() => {
    if (typeof document !== "undefined" && pageName) {
      const previous = document.title;
      document.title = pageName;
      return () => {
        document.title = previous;
      };
    }
  }, [pageName]);

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 8,
        fontFamily: "var(--font-sans)",
      }}
    >
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "var(--do-ink)",
          lineHeight: 1.2,
          margin: 0,
        }}
      >
        {pageName}
      </h1>
      <p
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "var(--text-secondary)",
          margin: 0,
        }}
      >
        Coming soon
      </p>
    </div>
  );
}
