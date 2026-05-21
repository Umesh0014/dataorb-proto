"use client";

import React from "react";

// SandboxSwitcher — shared floating switcher for layout A/B sandboxes.
// Visual language inherited from MilestoneSideRail (dark pill, yellow
// active fill, neutral inactive buttons with hover lift). Functionally
// distinct: this is a demo aid that toggles between alternative page
// layouts, not a milestone navigator.
//
// Props:
//   options       Array<{ id, label }> — buttons to render in order.
//   activeId      Currently selected option id (controlled).
//   onChange      Fired with the clicked id.
//   storageKey    Optional localStorage key. If provided, the component
//                 reads on mount (firing onChange when the stored value
//                 differs from activeId) and writes on each change.
//   orientation   "horizontal" (default) or "vertical".
//
// Token policy: every color / radius / dimension below mirrors the
// MilestoneSideRail surface so the two read as siblings without sharing
// code. If MilestoneSideRail's tokens change, update both files.

const TOKENS = {
  pillBg:       "#171717",
  pillBorder:   "#404040",
  pillRadius:   10,
  pillPadding:  8,
  pillShadow:   "0 12px 32px rgba(0, 0, 0, 0.4)",
  btnGap:       4,
  btnHeight:    36,
  btnPaddingX:  12,
  btnRadius:    6,
  btnFont:      "var(--font-mono)",
  btnFontSize:  12,
  btnFontWeight: 700,
  btnActiveBg:    "#FDE047",
  btnActiveFg:    "#171717",
  btnInactiveBg:  "#262626",
  btnInactiveFg:  "#D4D4D4",
  btnInactiveBorder: "1px solid #404040",
  btnHoverBg:     "#404040",
  btnHoverFg:     "#F5F5F5",
  btnHoverBorder: "1px solid #525252",
  btnTransition:  "background 120ms ease, color 120ms ease, border-color 120ms ease",
};

export default function SandboxSwitcher({
  options,
  activeId,
  onChange,
  storageKey,
  orientation = "horizontal",
}) {
  const [hoveredId, setHoveredId] = React.useState(null);

  // Storage sync — read once on mount when a key is provided. If the
  // stored value diverges from the controlled `activeId`, surface it via
  // onChange so the parent updates. Writes happen in handleClick below.
  React.useEffect(() => {
    if (!storageKey || typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (
        stored
        && stored !== activeId
        && options.some((o) => o.id === stored)
      ) {
        onChange(stored);
      }
    } catch {
      // ignore — fall back to parent-provided activeId
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const handleClick = (id) => {
    onChange(id);
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, id);
      } catch {
        // ignore write errors
      }
    }
  };

  const isVertical = orientation === "vertical";

  return (
    <div
      role="region"
      aria-label="Layout sandbox"
      style={{
        ...switcherStyles.pill,
        flexDirection: isVertical ? "column" : "row",
      }}
    >
      {options.map((opt) => {
        const active = opt.id === activeId;
        const hovered = hoveredId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleClick(opt.id)}
            onMouseEnter={() => setHoveredId(opt.id)}
            onMouseLeave={() => setHoveredId(null)}
            aria-pressed={active}
            style={buttonStyle(active, hovered)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function buttonStyle(active, hovered) {
  const base = {
    height: TOKENS.btnHeight,
    padding: `0 ${TOKENS.btnPaddingX}px`,
    borderRadius: TOKENS.btnRadius,
    fontFamily: TOKENS.btnFont,
    fontSize: TOKENS.btnFontSize,
    fontWeight: TOKENS.btnFontWeight,
    cursor: "pointer",
    transition: TOKENS.btnTransition,
    whiteSpace: "nowrap",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };
  if (active) {
    return {
      ...base,
      background: TOKENS.btnActiveBg,
      color: TOKENS.btnActiveFg,
      border: "none",
    };
  }
  if (hovered) {
    return {
      ...base,
      background: TOKENS.btnHoverBg,
      color: TOKENS.btnHoverFg,
      border: TOKENS.btnHoverBorder,
    };
  }
  return {
    ...base,
    background: TOKENS.btnInactiveBg,
    color: TOKENS.btnInactiveFg,
    border: TOKENS.btnInactiveBorder,
  };
}

const switcherStyles = {
  pill: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 50,
    display: "inline-flex",
    alignItems: "center",
    gap: TOKENS.btnGap,
    padding: TOKENS.pillPadding,
    background: TOKENS.pillBg,
    border: `1px solid ${TOKENS.pillBorder}`,
    borderRadius: TOKENS.pillRadius,
    boxShadow: TOKENS.pillShadow,
  },
};
