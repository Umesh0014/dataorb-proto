"use client";

import React from "react";
import Card from "./Card";
import MobileTabBar from "./MobileTabBar";
import MobileActivityRow from "./MobileActivityRow";
import MobileActivitiesTab from "./MobileActivitiesTab";
import MobileGrowthTab from "./MobileGrowthTab";
import MobileGuideSession from "./MobileGuideSession";
import MobileStreakRing from "./MobileStreakRing";
import { MOBILE_AGENT, MOBILE_ASSIGNMENTS, MOBILE_GROWTH, MOBILE_GUIDE_SESSION } from "./mocks/mobileLearning";

// Variant A — Today-first Agenda. The home is a single "today" feed: a
// micro-moment hero sized to a break, then what's up next, then the
// streak. Leans into the ticket's thesis — practice as a habit that fits
// the gaps in a shift.

export default function MobileGuideAgenda() {
  const [tab, setTab] = React.useState("home");
  const [session, setSession] = React.useState(false);

  const hero = MOBILE_ASSIGNMENTS.find((a) => a.type === "guide" && a.state !== "done");
  const upNext = MOBILE_ASSIGNMENTS.filter((a) => a.state !== "done" && a.id !== hero?.id);
  const nothingDue = !hero && upNext.length === 0;

  return (
    <div style={styles.shell}>
      <main style={styles.main}>
        {tab === "home" && (
          <div style={styles.home}>
            <header style={styles.greet}>
              <div style={styles.greetText}>
                <span style={styles.hi}>Good morning, {MOBILE_AGENT.name.split(" ")[0]}</span>
                <span style={styles.sub}>You have a few minutes — make one count.</span>
              </div>
              <span style={styles.avatar} aria-hidden="true">{MOBILE_AGENT.initial}</span>
            </header>

            {nothingDue && (
              <Card shadow padX={24} padY={40} style={styles.empty}>
                <span className="material-symbols-outlined" style={styles.emptyGlyph} aria-hidden="true">task_alt</span>
                <span style={styles.emptyTitle}>You&apos;re all caught up</span>
                <span style={styles.emptyBody}>No practice due right now. Keep your streak alive — new Guides land here.</span>
              </Card>
            )}

            {hero && (
              <section style={styles.hero}>
                <span style={styles.heroKicker}>
                  <span className="material-symbols-outlined" style={styles.heroKickerGlyph} aria-hidden="true">bolt</span>
                  Fits a short break · {hero.minutes} min
                </span>
                <span style={styles.heroTitle} dir="auto">{hero.title}</span>
                <span style={styles.heroMeta}>Guide · voice practice · from {hero.from}</span>
                <button type="button" className="cc-focusable" onClick={() => setSession(true)} style={styles.heroBtn}>
                  <span className="material-symbols-outlined" aria-hidden="true" style={styles.heroBtnGlyph}>mic</span>
                  Start practice
                </button>
              </section>
            )}

            {upNext.length > 0 && (
              <section style={styles.block}>
                <span style={styles.blockLabel}>Up next</span>
                <div style={styles.list}>
                  {upNext.map((a) => <MobileActivityRow key={a.id} activity={a} onStart={() => setSession(true)} />)}
                </div>
              </section>
            )}

            <button
              type="button"
              className="cc-focusable"
              onClick={() => setTab("growth")}
              style={styles.streakCard}
              aria-label="Open My Growth"
            >
              <MobileStreakRing value={MOBILE_GROWTH.weeklyDone} max={MOBILE_GROWTH.weeklyGoal} centerTop={`${MOBILE_GROWTH.weeklyDone}/${MOBILE_GROWTH.weeklyGoal}`} centerSub="this week" size={72} stroke={8} />
              <div style={styles.streakText}>
                <span style={styles.streakTitle}>{MOBILE_GROWTH.streakDays}-day streak</span>
                <span style={styles.streakSub}>{MOBILE_GROWTH.weeklyGoal - MOBILE_GROWTH.weeklyDone} more to hit this week&apos;s goal</span>
              </div>
              <span className="material-symbols-outlined" style={styles.streakChev} aria-hidden="true">chevron_right</span>
            </button>
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
  home: { display: "flex", flexDirection: "column", gap: 18, padding: "16px 16px 24px" },

  greet: { display: "flex", alignItems: "center", gap: 12 },
  greetText: { display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 },
  hi: { fontSize: 22, fontWeight: 800, color: "var(--color-text-deep)" },
  sub: { fontSize: 13, color: "var(--color-text-tertiary)" },
  avatar: { width: 40, height: 40, borderRadius: 999, background: "var(--color-icon-tertiary-bg)", color: "var(--color-icon-tertiary-fg)", display: "inline-grid", placeItems: "center", fontSize: 15, fontWeight: 800, flexShrink: 0 },

  hero: { display: "flex", flexDirection: "column", gap: 8, padding: 20, borderRadius: 20, background: "linear-gradient(135deg, var(--do-brand-blue), var(--do-brand-blue-hover))", color: "#FFFFFF", boxShadow: "var(--shadow-8)" },
  heroKicker: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, letterSpacing: "0.3px", color: "rgba(255,255,255,0.9)" },
  heroKickerGlyph: { fontSize: 16 },
  heroTitle: { fontSize: 19, fontWeight: 800, lineHeight: 1.3 },
  heroMeta: { fontSize: 12, color: "rgba(255,255,255,0.82)" },
  heroBtn: { marginTop: 6, appearance: "none", border: "none", background: "#FFFFFF", color: "var(--do-brand-blue)", fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 800, minHeight: 48, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" },
  heroBtnGlyph: { fontSize: 20 },

  block: { display: "flex", flexDirection: "column", gap: 10 },
  blockLabel: { fontSize: 12, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  list: { display: "flex", flexDirection: "column", gap: 10 },

  streakCard: { appearance: "none", textAlign: "start", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, background: "var(--surface-white)", border: "none", boxShadow: "var(--shadow-card)" },
  streakText: { display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 },
  streakTitle: { fontSize: 16, fontWeight: 800, color: "var(--color-text-deep)" },
  streakSub: { fontSize: 12, color: "var(--color-text-tertiary)" },
  streakChev: { fontSize: 24, color: "var(--color-text-tertiary)", flexShrink: 0 },

  empty: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8, borderRadius: 16 },
  emptyGlyph: { fontSize: 40, color: "var(--color-success)" },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  emptyBody: { fontSize: 13, color: "var(--color-text-tertiary)", lineHeight: 1.5, maxWidth: 260 },
};
