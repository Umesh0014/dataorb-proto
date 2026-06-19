"use client";

import React from "react";
import { GitCompare, ArrowRight } from "lucide-react";
import { fullBleed, TONE } from "./MiraWorkspaceBits";
import { KeyMomentsChart, Avatar, AskBar } from "./MiraStoriesBits";
import MiraStoryPublished from "./MiraStoryPublished";
import { SPACE, STORIES, KPIS } from "./mocks/miraSpace";

const WINDOWS = ["7 days", "30 days", "Quarter"];
function momentsForKpi(kpiId) {
  for (const st of STORIES) {
    const b = (st.blocks || []).find((x) => x.type === "chart" && x.kpiId === kpiId);
    if (b && b.keyMoments && b.keyMoments.length) return b.keyMoments;
  }
  return [];
}

// Stories — Landing C · Living Trend. The outcome rendered as a living,
// annotated trend (the market-research / stock-tracker pattern Neil flagged):
// one metric over time with "key moments" you tap for "what happened here?",
// compare-across-windows, and the stories that explain each move "crawled in"
// alongside. Research angle 1 (annotated timeline).
export default function MiraStoriesTrend(props) {
  const { onSubmit } = props;
  const [kpiId, setKpiId] = React.useState(KPIS[0].id);
  const [win, setWin] = React.useState(WINDOWS[0]);
  const [compare, setCompare] = React.useState(false);
  const [openId, setOpenId] = React.useState(null);
  const kpi = KPIS.find((k) => k.id === kpiId) || KPIS[0];
  const moments = momentsForKpi(kpiId);
  const related = STORIES.filter((st) => st.status === "authored" && st.kpiIds.includes(kpiId));

  if (openId) return <MiraStoryPublished storyId={openId} onBack={() => setOpenId(null)} {...props} />;

  return (
    <div style={fullBleed}>
      <header style={s.head}>
        <span style={s.kicker}>{SPACE.name} space</span>
        <h1 style={s.outcome}>{SPACE.outcome}</h1>
      </header>

      <div style={s.strip}>
        {KPIS.map((k) => {
          const meta = TONE[k.tone] || TONE.flat;
          const on = k.id === kpiId;
          return (
            <button key={k.id} type="button" onClick={() => setKpiId(k.id)} style={{ ...s.kpi, ...(on ? s.kpiOn : null) }}>
              <span style={s.kpiLabel}>{k.label}</span>
              <span style={s.kpiValue}>{k.value}</span>
              <span style={{ ...s.kpiDelta, color: meta.color }}>{k.delta}</span>
            </button>
          );
        })}
      </div>

      <div style={s.grid}>
        <section style={s.chartCard}>
          <div style={s.chartHead}>
            <div>
              <h2 style={s.chartTitle}>{kpi.label}</h2>
              <span style={s.chartSrc}>{kpi.source}</span>
            </div>
            <div style={s.controls}>
              <div style={s.winSeg}>
                {WINDOWS.map((w) => (
                  <button key={w} type="button" onClick={() => setWin(w)} style={{ ...s.winBtn, ...(w === win ? s.winOn : null) }}>{w}</button>
                ))}
              </div>
              <button type="button" onClick={() => setCompare((c) => !c)} style={{ ...s.compare, ...(compare ? s.compareOn : null) }}>
                <GitCompare size={15} /> Compare
              </button>
            </div>
          </div>
          <KeyMomentsChart kpi={kpi} keyMoments={moments} height={240} compare={compare} />
          <div style={s.askRow}>
            <AskBar placeholder={`Ask about ${kpi.label.toLowerCase()}…`} onSubmit={(t) => onSubmit?.(t)} />
          </div>
        </section>

        <aside style={s.rail}>
          <p style={s.railHead}>Stories that explain this</p>
          {related.length === 0 && <p style={s.empty}>No story yet for this metric. Ask Mira to start one.</p>}
          {related.map((st) => (
            <button key={st.id} type="button" style={s.story} onClick={() => setOpenId(st.id)}>
              <div style={s.storyTop}>
                <Avatar person={st.author} size={22} />
                <span style={s.storyAuthor}>{st.author.name}</span>
                <span style={{ flex: 1 }} />
                <ArrowRight size={15} color="var(--color-text-tertiary)" />
              </div>
              <span style={s.storyTitle}>{st.title}</span>
              <span style={s.storyMeta}>{st.date} · viewed {st.viewCount}×</span>
            </button>
          ))}
        </aside>
      </div>
    </div>
  );
}

const s = {
  head: { display: "flex", flexDirection: "column", gap: 4, paddingBottom: 16 },
  kicker: { fontSize: 13, fontWeight: 700, letterSpacing: "0.03em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  outcome: { margin: 0, fontSize: 26, lineHeight: 1.2, letterSpacing: "-0.02em", fontWeight: 800, color: "var(--color-text-deep)", maxWidth: 640 },

  strip: { display: "flex", gap: 10, overflowX: "auto", paddingBottom: 18 },
  kpi: { flexShrink: 0, display: "flex", flexDirection: "column", gap: 3, minWidth: 130, padding: "12px 14px", borderRadius: 12, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", cursor: "pointer", textAlign: "start", fontFamily: "var(--font-sans)" },
  kpiOn: { borderColor: "var(--color-button-primary-bg)", boxShadow: "0 0 0 1px var(--color-button-primary-bg)" },
  kpiLabel: { fontSize: 12.5, fontWeight: 600, color: "var(--color-text-tertiary)" },
  kpiValue: { fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--color-text-deep)" },
  kpiDelta: { fontSize: 12, fontWeight: 600 },

  grid: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 20, alignItems: "start", paddingBottom: 32 },
  chartCard: { minWidth: 0, padding: 22, borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)" },
  chartHead: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18, flexWrap: "wrap" },
  chartTitle: { margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em", color: "var(--color-text-deep)" },
  chartSrc: { fontSize: 12.5, color: "var(--color-text-tertiary)" },
  controls: { display: "flex", alignItems: "center", gap: 8 },
  winSeg: { display: "inline-flex", gap: 2, padding: 3, borderRadius: 10, background: "var(--grey-100)" },
  winBtn: { height: 30, paddingInline: 11, borderRadius: 8, border: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 12.5, fontWeight: 600, color: "var(--color-text-medium)", cursor: "pointer" },
  winOn: { background: "var(--surface-white)", color: "var(--color-text-deep)", boxShadow: "var(--shadow-1)" },
  compare: { display: "inline-flex", alignItems: "center", gap: 6, height: 36, paddingInline: 12, borderRadius: 10, border: "1px solid var(--color-border-tab)", background: "var(--surface-white)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", cursor: "pointer" },
  compareOn: { borderColor: "var(--color-button-primary-bg)", color: "var(--color-button-primary-bg)" },
  askRow: { marginTop: 20 },

  rail: { display: "flex", flexDirection: "column", gap: 10 },
  railHead: { margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  empty: { margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "var(--color-text-tertiary)" },
  story: { display: "flex", flexDirection: "column", gap: 6, padding: 14, borderRadius: 14, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)", cursor: "pointer", textAlign: "start", fontFamily: "var(--font-sans)" },
  storyTop: { display: "flex", alignItems: "center", gap: 7 },
  storyAuthor: { fontSize: 12.5, fontWeight: 600, color: "var(--color-text-medium)" },
  storyTitle: { fontSize: 14.5, fontWeight: 700, lineHeight: 1.35, color: "var(--color-text-deep)" },
  storyMeta: { fontSize: 12, color: "var(--color-text-tertiary)" },
};
