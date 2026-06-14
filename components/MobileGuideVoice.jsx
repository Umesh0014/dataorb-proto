"use client";

import React from "react";
import Card from "./Card";
import MobileTabBar from "./MobileTabBar";
import MobileActivityRow from "./MobileActivityRow";
import MobileActivitiesTab from "./MobileActivitiesTab";
import MobileGrowthTab from "./MobileGrowthTab";
import MobileGuideSession from "./MobileGuideSession";
import { MOBILE_AGENT, MOBILE_ASSIGNMENTS, MOBILE_GROWTH, MOBILE_GUIDE_SESSION } from "./mocks/mobileLearning";

// Variant B — Voice-first Launchpad. The home centres a single tap-to-
// practice voice orb, leaning into the brief's V1 conviction that Guide
// is mobile-native because it's a conversation. Replay and Drill stay
// visible as labelled rows beneath the orb, so the voice-first emphasis
// never hides the other activities.

export default function MobileGuideVoice() {
  const [tab, setTab] = React.useState("home");
  const [session, setSession] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const hero = MOBILE_ASSIGNMENTS.find((a) => a.type === "guide" && a.state !== "done");
  const others = MOBILE_ASSIGNMENTS.filter((a) => a.type !== "guide" && a.state !== "done");
  const nothingDue = !hero && others.length === 0;

  return (
    <div style={styles.shell}>
      <main style={styles.main}>
        {tab === "home" && (
          <div style={styles.home}>
            <header style={styles.top}>
              <span style={styles.hi}>Hi {MOBILE_AGENT.name.split(" ")[0]}</span>
              <button type="button" className="cc-focusable" onClick={() => setTab("growth")} style={styles.streakChip} aria-label={`${MOBILE_GROWTH.streakDays} day streak — open My Growth`}>
                <span className="material-symbols-outlined" style={styles.streakGlyph} aria-hidden="true">local_fire_department</span>
                {MOBILE_GROWTH.streakDays}
              </button>
            </header>

            {nothingDue ? (
              <Card shadow padX={24} padY={40} style={styles.empty}>
                <span className="material-symbols-outlined" style={styles.emptyGlyph} aria-hidden="true">task_alt</span>
                <span style={styles.emptyTitle}>You&apos;re all caught up</span>
                <span style={styles.emptyBody}>No practice due right now. New voice Guides land here for you to start.</span>
              </Card>
            ) : (
              <>
                {hero && (
                  <section style={styles.orbSection}>
                    <button
                      type="button"
                      className="cc-focusable"
                      onClick={() => setSession(true)}
                      style={styles.orbBtn}
                      aria-label={`Start your Guide: ${hero.title}`}
                    >
                      <span style={{ ...styles.ring, ...styles.ringOuter, animation: reduceMotion ? "none" : "orbPulseOuter 3.4s ease-in-out infinite" }} aria-hidden="true" />
                      <span style={{ ...styles.ring, ...styles.ringMid, animation: reduceMotion ? "none" : "orbPulseMid 2.6s ease-in-out infinite" }} aria-hidden="true" />
                      <span style={styles.orbCore} aria-hidden="true">
                        <span className="material-symbols-outlined" style={styles.orbGlyph}>mic</span>
                      </span>
                    </button>
                    <button type="button" className="cc-focusable" onClick={() => setSession(true)} style={styles.startCta}>
                      <span className="material-symbols-outlined" aria-hidden="true" style={styles.startCtaGlyph}>play_arrow</span>
                      Start your Guide
                    </button>
                    <div style={styles.heroMetaWrap}>
                      <span style={styles.heroTitle} dir="auto">{hero.title}</span>
                      <span style={styles.heroSub}>{hero.minutes} min · voice practice · from {hero.from}</span>
                    </div>
                  </section>
                )}

                {others.length > 0 && (
                  <section style={styles.block}>
                    <span style={styles.blockLabel}>Also assigned</span>
                    <div style={styles.list}>
                      {others.map((a) => <MobileActivityRow key={a.id} activity={a} onStart={() => setSession(true)} />)}
                    </div>
                  </section>
                )}
              </>
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
  home: { display: "flex", flexDirection: "column", gap: 20, padding: "16px 16px 24px" },

  top: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  hi: { fontSize: 22, fontWeight: 800, color: "var(--color-text-deep)" },
  streakChip: { appearance: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4, minHeight: 36, paddingInline: 12, borderRadius: 999, background: "var(--color-warning-bg)", color: "var(--color-warning-text)", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 800 },
  streakGlyph: { fontSize: 18, color: "var(--color-warning)" },

  orbSection: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14, paddingTop: 18 },
  orbBtn: { position: "relative", appearance: "none", border: "none", background: "transparent", width: 188, height: 188, display: "grid", placeItems: "center", cursor: "pointer", borderRadius: 999 },
  ring: { position: "absolute", borderRadius: 999, display: "block" },
  ringOuter: { width: 188, height: 188, background: "radial-gradient(circle, rgba(102,80,165,0.26), rgba(102,80,165,0) 70%)" },
  ringMid: { width: 140, height: 140, background: "radial-gradient(circle, rgba(0,75,239,0.30), rgba(0,75,239,0) 72%)" },
  orbCore: { position: "relative", width: 104, height: 104, borderRadius: 999, background: "var(--color-button-primary-bg)", display: "grid", placeItems: "center", boxShadow: "var(--shadow-16)" },
  orbGlyph: { fontSize: 48, color: "#FFFFFF" },
  startCta: { appearance: "none", border: "1.5px solid var(--color-button-primary-bg)", background: "var(--surface-white)", color: "var(--color-button-primary-bg)", fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 800, minHeight: 48, paddingInline: 28, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer", boxShadow: "var(--shadow-card)" },
  startCtaGlyph: { fontSize: 22 },
  heroMetaWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, textAlign: "center" },
  heroTitle: { fontSize: 17, fontWeight: 800, color: "var(--color-text-deep)", maxWidth: 300, lineHeight: 1.3 },
  heroSub: { fontSize: 12, color: "var(--color-text-tertiary)" },

  block: { display: "flex", flexDirection: "column", gap: 10 },
  blockLabel: { fontSize: 12, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  list: { display: "flex", flexDirection: "column", gap: 10 },

  empty: { display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 8, borderRadius: 16 },
  emptyGlyph: { fontSize: 40, color: "var(--color-success)" },
  emptyTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  emptyBody: { fontSize: 13, color: "var(--color-text-tertiary)", lineHeight: 1.5, maxWidth: 260 },
};
