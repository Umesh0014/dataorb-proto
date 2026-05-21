"use client";

// Canonical SideNav design tokens.
// Source of truth: Learning Hub rail. Do not duplicate per module.

export const SIDENAV_TOKENS = {
  rail: {
    width: 64,
    expandedWidth: 260,
    bg: "#EFEEF6",
    border: "#E4E2EE",
    paddingY: 16,
    paddingXExpanded: 12,
    zIndex: 30,
    widthTransition: "width 200ms ease",
  },
  brand: {
    slotHeight: 64,
    logoSize: 28,
    marginBottom: 4,
    wordmark: {
      text: "dataOrb",
      fontSize: 16,
      fontWeight: 700,
      color: "#1F2440",
      marginLeft: 8,
    },
  },
  expandedLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: "#1F2440",
    marginLeft: 12,
    fadeIn: "opacity 150ms ease 50ms",
  },
  toggle: {
    // Floating handle straddling the rail's right edge — half inside,
    // half outside. Sits in the brand-slot vertical band so it reads
    // beside the logo without overlapping it.
    size: 28,
    radius: 999, // full circle reads cleanly on the edge
    iconSize: 16,
    iconColor: "#1F2440",
    anchorTop: 18,
    anchorRight: -14, // (size / 2) — center on the rail's right border
    bg: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    tooltipCopy: { collapsed: "Expand sidebar", expanded: "Collapse sidebar" },
  },
  divider: {
    width: 32,
    height: 1,
    color: "#E4E2EE",
    marginY: 12,
  },
  itemGroup: {
    gap: 8,
  },
  iconButton: {
    size: 40,
    radius: 20,
    appSwitcherRadius: 8,
    iconSize: 22,
    transition: "background 150ms ease, box-shadow 150ms ease",
  },
  state: {
    bgDefault: "transparent",
    bgHover: "#E4E2EE",
    bgActive: "#DDD9EC",
    iconColor: "#1F2440",
    appSwitcherColor: "#3A3F58",
    focusRing: "0 0 0 2px #FFFFFF, 0 0 0 4px #004BEF",
  },
  avatar: {
    size: 32,
    radius: 16,
    bg: "#1B92A6",
    fg: "#FFFFFF",
    fontSize: 13,
    fontWeight: 700,
  },
  tooltip: {
    bg: "#1F2937",
    fg: "#FFFFFF",
    fontSize: 12,
    fontWeight: 500,
    padding: "6px 10px",
    radius: 6,
    offset: 8,
    delayMs: 300,
    shadow: "0 2px 6px rgba(0,0,0,0.15)",
    zIndex: 100,
  },
  font: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  footer: {
    gap: 4,
    avatarMarginTop: 8,
    settingsMarginBottom: 0,
  },
};
