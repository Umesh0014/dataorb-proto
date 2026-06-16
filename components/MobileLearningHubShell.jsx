"use client";

import React from "react";
import MobileDeviceFrame from "./MobileDeviceFrame";
import MobileGuideAgenda from "./MobileGuideAgenda";
import MobileGuideVoice from "./MobileGuideVoice";
import MobileGuideHub from "./MobileGuideHub";
import DarkPillSwitcher from "./DarkPillSwitcher";

// MobileLearningHubShell — entry point for the agent-facing mobile
// Learning Hub. The desktop app is fixed-width by design, so this stands
// up a *separate* mobile surface (its own component + navigation layer)
// previewed inside a phone device frame on the desktop canvas — not a
// responsive reflow of the desktop pages.
//
// Hosts the A/B/C variant state (in-memory only) and the floating
// DarkPillSwitcher, mirroring the Missions landing pattern. Each variant
// is a distinct design direction for the same surface; all three share the
// device frame and the in-frame Guide voice session.

const VARIANTS = {
  A: { Component: MobileGuideAgenda, caption: "Direction A — Today-first Agenda" },
  B: { Component: MobileGuideVoice,  caption: "Direction B — Voice-first Launchpad" },
  C: { Component: MobileGuideHub,    caption: "Direction C — Segmented Activity Hub" },
};

export default function MobileLearningHubShell({ pageName }) {
  const [variant, setVariant] = React.useState("A");

  React.useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const previous = document.title;
    document.title = pageName || "Mobile";
    return () => { document.title = previous; };
  }, [pageName]);

  const active = VARIANTS[variant];
  const ActiveVariant = active.Component;

  return (
    <div style={styles.column}>
      <header style={styles.intro}>
        <span style={styles.kicker}>Learning Hub · agent · mobile preview</span>
        <h1 style={styles.title}>Guide &amp; Replay on the go</h1>
        <p style={styles.lede}>
          A separate mobile surface for frontline agents — voice Guide first, with
          Replay and Drill, assignments, and a lightweight streak. Flip the
          switcher to compare three directions.
        </p>
      </header>

      <MobileDeviceFrame caption={active.caption}>
        <ActiveVariant />
      </MobileDeviceFrame>

      <div style={styles.switcher}>
        <span style={styles.switcherLabel}>Direction</span>
        <DarkPillSwitcher
          ariaLabel="Mobile Learning Hub design direction"
          value={variant}
          options={["A", "B", "C"]}
          onChange={setVariant}
        />
      </div>
    </div>
  );
}

const styles = {
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
    width: "100%",
    fontFamily: "var(--font-sans)",
  },
  intro: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    alignItems: "center",
    textAlign: "center",
    maxWidth: 560,
  },
  kicker: { fontSize: 12, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--color-icon-tertiary-fg)" },
  title: { margin: 0, fontSize: 26, fontWeight: 800, color: "var(--color-text-deep)" },
  lede: { margin: 0, fontSize: 14, color: "var(--color-text-tertiary)", lineHeight: 1.55 },
  switcher: {
    position: "fixed",
    bottom: 28,
    right: 28,
    zIndex: 60,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
  },
  switcherLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
    background: "rgba(255,255,255,0.8)",
    padding: "2px 8px",
    borderRadius: 999,
  },
};
