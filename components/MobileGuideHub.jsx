"use client";

import React from "react";
import Card from "./Card";
import TabsRow from "./TabsRow";
import MobileTabBar from "./MobileTabBar";
import MobileActivityRow from "./MobileActivityRow";
import MobileActivitiesTab from "./MobileActivitiesTab";
import MobileGrowthTab from "./MobileGrowthTab";
import MobileGuideSession from "./MobileGuideSession";
import { MOBILE_AGENT, MOBILE_ASSIGNMENTS, MOBILE_GROWTH, MOBILE_GUIDE_SESSION } from "./mocks/mobileLearning";

// Variant C — Segmented Activity Hub. The home reuses the app's shared
// TabsRow to segment assignments across the three activity types
// (Guide / Replay / Drill), the structured, coverage-complete answer.
// Safest on affordance + parity; closest to "one primitive per pattern."

const SEGMENTS = [
  { id: "guide", label: "Guide" },
  { id: "replay", label: "Replay" },
  { id: "drill", label: "Drill" },
];

export default function MobileGuideHub() {
  const [tab, setTab] = React.useState("home");
  const [segment, setSegment] = React.useState("guide");
  const [session, setSession] = React.useState(false);

  const segTabs = SEGMENTS.map((s) => ({
    ...s,
    count: MOBILE_ASSIGNMENTS.filter((a) => a.type === s.id).length,
  }));
  const inSegment = MOBILE_ASSIGNMENTS.filter((a) => a.type === segment);

  return (
    <div style={styles.shell}>
      <main style={styles.main}>
        {tab === "home" && (
          <div style={styles.home}>
            <header style={styles.top}>
              <div style={styles.titleWrap}>
                <span style={styles.title}>Learning</span>
                <span style={styles.sub}>{MOBILE_GROWTH.streakDays}-day streak · {MOBILE_GROWTH.weeklyDone}/{MOBILE_GROWTH.weeklyGoal} this week</span>
              </div>
              <span style={styles.avatar} aria-hidden="true">{MOBILE_AGENT.initial}</span>
            </header>

            <TabsRow tabs={segTabs} activeTab={segment} onTabClick={setSegment} />

            {inSegment.length === 0 ? (
              <Card shadow padX={24} padY={40} style={styles.empty}>
                <span className="material-symbols-outlined" style={styles.emptyGlyph} aria-hidden="true">inbox</span>
                <span style={styles.emptyTitle}>Nothing here yet</span>
                <span style={styles.emptyBody}>New {segment} practice from your team lead will appear here.</span>
              </Card>
            ) : (
              <div style={styles.list}>
                {inSegment.map((a) => <MobileActivityRow key={a.id} activity={a} onStart={() => setSession(true)} />)}
              </div>
            )}
          </div>
        )}

        {tab === "activities" && <MobileActivitiesTab onStart={() => setSession(true)} />}
        {tab === "growth" && <MobileGrowthTab />}
      </main>

      <MobileTabBar active={tab} onSelect={setTab} />

      {session && <MobileGuideSession session={MOBILE_GUIDE_SESSION} onClose={() => setSession(false)} />}
    </div>
  );
}

const styles = {
  shell: { position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", fontFamily: "var(--font-sans)" },
  main: { flex: 1, minHeight: 0, overflowY: "auto" },
  home: { display: "flex", flexDirection: "column", gap: 16, padding: "16px 16px 24px" },

  top: { display: "flex", alignItems: "center", gap: 12 },
  titleWrap: { display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 },
  title: { fontSize: 22, fontWeight: 800, color: "var(--color-text-deep)" },
  sub: { fontSize: 13, color: "var(--color-text-tertiary)" },
  avatar: { width: 40, height: 40, borderRadius: 999, background: "var(--color-icon-tertiary-bg)", color: "var(--color-icon-tertiary-fg)", display: "inline-grid", placeItems: "center", fontSize: 15, fontWeight: 800, flexShrink: 0 },

  list: { display: "flex", flexDirection: "column", gap: 10 },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8, borderRadius: 16 },
  emptyGlyph: { fontSize: 40, color: "var(--color-text-placeholder)" },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  emptyBody: { fontSize: 13, color: "var(--color-text-tertiary)", lineHeight: 1.5, maxWidth: 240 },
};
