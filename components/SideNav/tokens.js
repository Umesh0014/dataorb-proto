"use client";

// Canonical SideNav design tokens.
// Source of truth: Learning Hub rail. Do not duplicate per module.

export const SIDENAV_TOKENS = {
  rail: {
    width: 64,
    bg: "#EFEEF6",
    border: "#E4E2EE",
    paddingY: 16,
    zIndex: 30,
  },
  brand: {
    slotHeight: 64,
    logoSize: 28,
    marginBottom: 4,
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
