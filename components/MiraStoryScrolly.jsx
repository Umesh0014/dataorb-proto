"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";
import { fullBleed } from "./MiraWorkspaceBits";
import { StoryMeta, KeyMomentsChart, PinnedInsight, VisibilityBadge } from "./MiraStoriesBits";
import { SPACE, STORIES, KPIS } from "./mocks/miraSpace";

const HEADINGS = { narrative: "Context", insight: "Key insight", chart: "The trend", recommendation: "What to do" };

// Stories — Artifact B · Scrolly Story. The proven format for the no-SQL exec:
// one insight per step, a sticky chart on the left, prose driving on the right.
// Scrolling advances the step and moves the "key moment" on the trend; ends on
// a recommended action. TL;DR up top keeps it usable muted. Research angle 6
// (paired with the angle-1 annotated timeline as the sticky element).
export default function MiraStoryScrolly({ storyId, conversation, pendingTurnId, onSubmit, onReset }) {
  const story = STORIES.find((s) => s.id === storyId) || STORIES[0];
  const chartBlock = story.blocks.find((b) => b.type === "chart");
  const kpi = chartBlock ? KPIS.find((k) => k.id === chartBlock.kpiId) : null;
  const moments = chartBlock?.keyMoments || [];
  const stepRefs = React.useRef([]);
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number(e.target.dataset.idx)); }),
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    stepRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const momentForStep = moments.length ? Math.min(Math.max(active - 1, 0), moments.length - 1) : undefined;

  return (
    <div style={fullBleed}>
      <div style={s.banner}>
        <span style={s.crumb}><ChevronLeft size={16} /> {SPACE.name} space · Stories</span>
        <span style={{ flex: 1 }} />
        <VisibilityBadge visibility={story.visibility} />
      </div>

      <div style={s.hero}>
        <h1 style={s.title}>{story.title}</h1>
        <StoryMeta story={story} />
        <div style={s.tldr}><span style={s.tldrTag}>TL;DR</span><p style={s.tldrText}>{story.tldr}</p></div>
      </div>

      <div style={s.grid}>
        <div style={s.stickyCol}>
          <div style={s.stickyInner}>
            <div style={s.stepBadge}>Step {active + 1} of {story.blocks.length} · {HEADINGS[story.blocks[active]?.type] || ""}</div>
            {kpi && <KeyMomentsChart kpi={kpi} keyMoments={moments} height={200} activeIndex={momentForStep} />}
            <p style={s.stickyCap}>{chartBlock?.caption}</p>
          </div>
        </div>

        <div style={s.steps}>
          {story.blocks.map((b, i) => (
            <section key={b.id} data-idx={i} ref={(el) => (stepRefs.current[i] = el)}
              style={{ ...s.step, opacity: i === active ? 1 : 0.45 }}>
              <span style={s.stepKicker}>{HEADINGS[b.type] || "Step"}</span>
              {b.type === "narrative" && <p style={s.stepPara}>{b.text}</p>}
              {b.type === "chart" && <p style={s.stepPara}>{b.caption} — see the trend on the left; markers call out what moved and when.</p>}
              {b.type === "insight" && <PinnedInsight insight={b} />}
              {b.type === "recommendation" && (
                <div style={s.rec}><span style={s.recTag}>Recommended</span><p style={s.recText}>{b.text}</p></div>
              )}
            </section>
          ))}
          <section style={s.endCap}>
            <p style={s.endText}>Have a follow-up?</p>
            <button type="button" style={s.askBtn} onClick={() => onSubmit?.(story.question)}>Ask Mira about this story</button>
          </section>
        </div>
      </div>
    </div>
  );
}

const s = {
  banner: { display: "flex", alignItems: "center", gap: 12, paddingBottom: 16 },
  crumb: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },
  hero: { maxWidth: 720, marginBottom: 8 },
  title: { margin: "0 0 12px", fontSize: 34, lineHeight: 1.15, letterSpacing: "-0.02em", fontWeight: 800, color: "var(--color-text-deep)" },
  tldr: { display: "flex", gap: 12, marginTop: 18, padding: 16, borderRadius: 12, background: "var(--grey-50)", border: "1px solid var(--color-divider-card)" },
  tldrTag: { fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", color: "var(--color-text-tertiary)", paddingTop: 2 },
  tldrText: { margin: 0, fontSize: 16, lineHeight: 1.55, fontWeight: 600, color: "var(--color-text-deep)" },

  grid: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 40, alignItems: "start" },
  stickyCol: { minWidth: 0 },
  stickyInner: { position: "sticky", top: 24, padding: 20, borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)" },
  stepBadge: { display: "inline-block", marginBottom: 14, padding: "5px 10px", borderRadius: 999, background: "var(--grey-100)", fontSize: 12, fontWeight: 700, color: "var(--color-text-medium)" },
  stickyCap: { margin: "12px 0 0", fontSize: 13, color: "var(--color-text-tertiary)" },

  steps: { minWidth: 0, display: "flex", flexDirection: "column" },
  step: { minHeight: "62vh", display: "flex", flexDirection: "column", gap: 12, justifyContent: "center", transition: "opacity 220ms ease" },
  stepKicker: { fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--color-button-primary-bg)" },
  stepPara: { margin: 0, fontSize: 19, lineHeight: 1.55, color: "var(--color-text-deep)", fontWeight: 500 },
  rec: { borderRadius: 12, background: "var(--color-success-bg)", padding: 16 },
  recTag: { fontSize: 11.5, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: "var(--color-success-text)" },
  recText: { margin: "4px 0 0", fontSize: 17, lineHeight: 1.5, fontWeight: 600, color: "var(--color-text-deep)" },
  endCap: { minHeight: "40vh", display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" },
  endText: { margin: 0, fontSize: 15, color: "var(--color-text-tertiary)" },
  askBtn: { alignSelf: "flex-start", height: 44, paddingInline: 18, borderRadius: 999, border: "none", background: "var(--color-button-primary-bg)", color: "var(--color-button-primary-text, #fff)", fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600, cursor: "pointer" },
};
