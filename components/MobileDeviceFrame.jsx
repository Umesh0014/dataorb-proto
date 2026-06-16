"use client";

import React from "react";

// MobileDeviceFrame — the phone shell every mobile Learning Hub variant
// renders inside. The desktop app is fixed-width and desktop-only (min
// viewport 1260, fixed element sizes), so the mobile surface is previewed
// as a device frame on the desktop canvas rather than as a responsive
// reflow — exactly the separation the ticket asks for.
//
// Owns device chrome only: the bezel, the status bar, and the home
// indicator. App chrome (top bar, tab bar, content) is the variant's.
// A short caption above the frame names the direction being previewed.

const SCREEN_W = 390;
const SCREEN_H = 780;

export default function MobileDeviceFrame({ caption, children }) {
  return (
    <div style={styles.stage}>
      {caption && <span style={styles.caption}>{caption}</span>}
      <div style={styles.bezel}>
        <div style={styles.screen}>
          <StatusBar />
          <div style={styles.viewport}>
            {children}
          </div>
          <HomeIndicator />
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div style={styles.statusBar} aria-hidden="true">
      <span style={styles.statusTime}>9:41</span>
      <span style={styles.statusGlyphs}>
        <span className="material-symbols-outlined" style={styles.statusIcon}>signal_cellular_alt</span>
        <span className="material-symbols-outlined" style={styles.statusIcon}>wifi</span>
        <span className="material-symbols-outlined" style={styles.statusIcon}>battery_full</span>
      </span>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div style={styles.homeBar} aria-hidden="true">
      <span style={styles.homeGrip} />
    </div>
  );
}

const styles = {
  stage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    width: "100%",
    paddingBlock: 8,
    fontFamily: "var(--font-sans)",
  },
  caption: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    letterSpacing: "0.2px",
    textAlign: "center",
  },
  bezel: {
    width: SCREEN_W + 24,
    padding: 12,
    borderRadius: 56,
    background: "#171717",
    boxShadow: "var(--shadow-24)",
  },
  screen: {
    position: "relative",
    width: SCREEN_W,
    height: SCREEN_H,
    borderRadius: 44,
    overflow: "hidden",
    background: "var(--surface-canvas)",
    display: "flex",
    flexDirection: "column",
  },
  statusBar: {
    height: 44,
    flexShrink: 0,
    paddingInline: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "var(--color-text-deep)",
    background: "transparent",
  },
  statusTime: { fontSize: 14, fontWeight: 700, letterSpacing: "0.2px" },
  statusGlyphs: { display: "inline-flex", alignItems: "center", gap: 6 },
  statusIcon: { fontSize: 16, color: "var(--color-text-deep)" },
  viewport: {
    position: "relative",
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  homeBar: {
    height: 22,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  homeGrip: {
    width: 134,
    height: 5,
    borderRadius: 999,
    background: "var(--color-text-deep)",
    opacity: 0.55,
  },
};
