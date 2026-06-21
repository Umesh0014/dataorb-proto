"use client";

import React from "react";
import {
  Plus, Mic, AudioLines, MoreHorizontal, ArrowRight, TrendingUp, TrendingDown,
  Minus, ShieldAlert, Gauge, Globe, Lock, Eye,
} from "lucide-react";
import { MiraStarIcon } from "./SideNav/icons";
import { TONE, MetricFace, Spark } from "./MiraWorkspaceBits";
import {
  OWNER, SPACE, KPIS, METRIC_GROUPS, METRIC_THREADS, STORIES, SUGGESTED,
} from "./mocks/miraSpace";

// MiraHome — the Ask Mira Pro landing, borrowing the ChatGPT-5 home layout:
// a greeting, one big "ask anything" input, then the top metrics per category
// in cards, then your chat interactions in tabs. Two variants differ only in
// the metric band: `cat3` shows one card per metric category; `kpi6` shows the
// six headline KPIs. Tokens-only; state in-memory.
const kpiById = (id) => KPIS.find((k) => k.id === id);
const CAT_ICON = { growth: TrendingUp, risk: ShieldAlert, efficiency: Gauge };
const CAT_TINT = {
  growth: { bg: "var(--color-success-bg)", fg: "var(--color-success-text)" },
  risk: { bg: "var(--color-error-bg)", fg: "var(--color-error-text)" },
  efficiency: { bg: "var(--color-chip-bg)", fg: "var(--color-text-medium)" },
};

// Bento band — a few hero metrics in an asymmetric grid with visual flair
// (tinted gradient, big numerals, sparkline). Tone → an existing soft *-bg
// token so the gradient stays on-palette (no new colours).
const TONE_BG = { up: "--color-success-bg", down: "--color-error-bg", warn: "--color-warning-bg", flat: "--color-chip-bg" };
const bentoBg = (tone) => `linear-gradient(150deg, var(${TONE_BG[tone] || TONE_BG.flat}), var(--surface-white) 72%)`;
const BENTO = [
  { id: "win-rate", area: { gridColumn: "1 / 3", gridRow: "1 / 3" }, hero: true },
  { id: "segment-winrate", area: { gridColumn: "3 / 5", gridRow: "1 / 2" } },
  { id: "leading-products", area: { gridColumn: "3 / 5", gridRow: "2 / 3" } },
  { id: "cycle-time", area: { gridColumn: "1 / 3", gridRow: "3 / 4" } },
  { id: "top-competitor", area: { gridColumn: "3 / 5", gridRow: "3 / 4" } },
];

const MSG_COUNTS = [27, 18, 33, 45, 21, 14, 9];

const TABS = [
  { id: "chats", label: "Ongoing Chats" },
  { id: "stories", label: "Stories" },
  { id: "pinned", label: "Pinned Notes" },
  { id: "prompts", label: "Saved Prompts" },
];

export default function MiraHome({ variant = "cat3", conversation, pendingTurnId, onSubmit, onReset }) {
  const [v, setV] = React.useState("");
  const [tab, setTab] = React.useState("chats");
  const firstName = OWNER.name.split(" ")[0];
  const submit = (t) => { const text = (t ?? v).trim(); if (!text || pendingTurnId) return; onSubmit?.(text); setV(""); };

  return (
    <div style={s.page}>
      <h1 style={s.greeting}>Hey, {firstName}. Ready to dive in?</h1>

      <div style={s.ask}>
        <button type="button" style={s.askIcon} aria-label="Add context"><Plus size={20} /></button>
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder={`Ask about ${SPACE.name.toLowerCase()}…`}
          aria-label="Ask Mira Pro"
          style={s.askInput}
        />
        <button type="button" style={s.askIcon} aria-label="Dictate"><Mic size={19} /></button>
        <button type="button" style={s.askVoice} aria-label="Voice" onClick={() => submit()}>
          <AudioLines size={19} />
        </button>
      </div>

      {variant === "bento" ? (
        <div style={s.bento}>
          {BENTO.map(({ id, area, hero }) => {
            const k = kpiById(id);
            if (!k) return null;
            const meta = TONE[k.tone] || TONE.flat;
            const Arrow = meta.Icon;
            return (
              <div key={id} style={{ ...s.bentoCard, ...area, background: bentoBg(k.tone) }}>
                <div style={s.bentoTop}>
                  <span style={s.bentoLabel}>{k.label}</span>
                  <span style={{ ...s.bentoArrow, background: meta.bg, color: meta.text }}><Arrow size={14} aria-hidden="true" /></span>
                </div>
                <span style={hero ? s.bentoValueHero : s.bentoValue}>{k.value}</span>
                <span style={{ ...s.bentoDelta, color: meta.color }}>{k.delta}</span>
                {hero && <p style={s.bentoRead}>{k.explain}</p>}
                {k.spark && (
                  <div style={s.bentoSpark}>
                    <Spark points={k.spark} color={meta.color} w={hero ? 280 : 150} h={hero ? 46 : 28} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : variant === "kpi6" ? (
        <div style={s.kpiGrid}>
          {KPIS.slice(0, 6).map((k) => (
            <div key={k.id} style={s.kpiCard}><MetricFace kpi={k} /></div>
          ))}
        </div>
      ) : (
        <div style={s.catRow}>
          {METRIC_GROUPS.map((g) => {
            const Icon = CAT_ICON[g.id] || TrendingUp;
            const tint = CAT_TINT[g.id] || CAT_TINT.efficiency;
            return (
              <div key={g.id} style={s.catCard}>
                <div style={s.catHead}>
                  <span style={{ ...s.catIcon, background: tint.bg, color: tint.fg }}><Icon size={16} /></span>
                  <span style={s.catLabel}>{g.label}</span>
                </div>
                <div style={s.catList}>
                  {g.metricIds.map((id) => {
                    const k = kpiById(id);
                    if (!k) return null;
                    const meta = TONE[k.tone] || TONE.flat;
                    const Arrow = meta.Icon;
                    return (
                      <button key={id} type="button" style={s.metricRow} onClick={() => submit(`Tell me about ${k.label.toLowerCase()}`)}>
                        <span style={s.metricName}>{k.label}</span>
                        <span style={s.metricRight}>
                          <span style={s.metricValue}>{k.value}</span>
                          <span style={{ ...s.metricDelta, color: meta.color }}><Arrow size={13} aria-hidden="true" /></span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={s.tabsRow}>
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} style={{ ...s.tab, ...(tab === t.id ? s.tabOn : null) }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={s.list}>
        {tab === "chats" && METRIC_THREADS.map((th, i) => (
          <Row key={th.id} title={th.title} sub={`Last updated ${th.updated} · ${MSG_COUNTS[i % MSG_COUNTS.length]} messages`}
            badge={th.visibility} />
        ))}
        {tab === "stories" && STORIES.filter((st) => st.status === "authored").map((st) => (
          <Row key={st.id} title={st.title} sub={`${st.author.name} · ${st.date} · viewed ${st.viewCount}×`} badge={st.visibility} />
        ))}
        {tab === "pinned" && STORIES.flatMap((st) => st.pinnedInsights.map((p) => ({ ...p, story: st.title }))).map((p) => (
          <Row key={p.id} title={p.text} sub={`Pinned by ${p.by?.name || "—"} · in "${p.story}"`} />
        ))}
        {tab === "prompts" && SUGGESTED.map((qn) => (
          <Row key={qn} title={qn} sub="Saved prompt · tap to ask" onClick={() => submit(qn)} />
        ))}
        <div style={s.seeMoreRow}><button type="button" style={s.seeMore}>See more</button></div>
      </div>
    </div>
  );
}

function Row({ title, sub, badge, onClick }) {
  return (
    <div style={s.row} onClick={onClick} role={onClick ? "button" : undefined}>
      <div style={s.rowBody}>
        <span style={s.rowTitle}>{title}</span>
        <span style={s.rowSub}>{sub}</span>
      </div>
      {badge && (
        <span style={s.rowBadge}>
          {badge === "private" ? <Lock size={13} /> : <Globe size={13} />}
        </span>
      )}
      <button type="button" style={s.rowKebab} aria-label="More"><MoreHorizontal size={18} /></button>
    </div>
  );
}

const s = {
  page: { maxWidth: 760, marginInline: "auto", paddingTop: 56, fontFamily: "var(--font-sans)" },
  greeting: { margin: "0 0 28px", textAlign: "center", fontSize: 30, lineHeight: 1.2, letterSpacing: "-0.02em", fontWeight: 600, color: "var(--color-text-deep)" },

  ask: { display: "flex", alignItems: "center", gap: 8, height: 60, paddingInline: 12, borderRadius: 999, border: "1px solid var(--color-border-tab)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)" },
  askIcon: { width: 40, height: 40, borderRadius: 999, border: "none", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--color-text-tertiary)", flexShrink: 0 },
  askInput: { flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 16, color: "var(--color-text-deep)" },
  askVoice: { width: 40, height: 40, borderRadius: 999, border: "none", background: "var(--grey-100)", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--color-text-deep)", flexShrink: 0 },

  catRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 22 },
  catCard: { padding: 16, borderRadius: 14, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)" },
  catHead: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 },
  catIcon: { display: "grid", placeItems: "center", width: 28, height: 28, borderRadius: 8, flexShrink: 0 },
  catLabel: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  catList: { display: "flex", flexDirection: "column" },
  metricRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "9px 0", border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", textAlign: "start", borderTop: "1px solid var(--color-divider-card)" },
  metricName: { fontSize: 13.5, color: "var(--color-text-medium)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  metricRight: { display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 },
  metricValue: { fontSize: 14, fontWeight: 700, color: "var(--color-text-deep)" },
  metricDelta: { display: "inline-flex", alignItems: "center" },

  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 22 },
  kpiCard: { display: "flex", flexDirection: "column", gap: 6, padding: 16, borderRadius: 14, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)" },

  bento: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridAutoRows: "104px", gap: 14, marginTop: 22 },
  bentoCard: { position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", padding: 16, borderRadius: 18, border: "1px solid var(--color-border-card-soft)", boxShadow: "var(--shadow-1)" },
  bentoTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  bentoLabel: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)" },
  bentoArrow: { display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: 8, flexShrink: 0 },
  bentoValue: { marginTop: 6, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--color-text-deep)" },
  bentoValueHero: { marginTop: 10, fontSize: 46, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, color: "var(--color-text-deep)" },
  bentoDelta: { marginTop: 4, fontSize: 12.5, fontWeight: 600 },
  bentoRead: { margin: "10px 0 0", fontSize: 12.5, lineHeight: 1.45, color: "var(--color-text-medium)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" },
  bentoSpark: { marginTop: "auto", paddingTop: 10, alignSelf: "flex-start" },

  tabsRow: { display: "flex", gap: 22, marginTop: 36, borderBottom: "1px solid var(--color-divider-card)" },
  tab: { position: "relative", padding: "0 0 10px", border: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 500, color: "var(--color-text-tertiary)", cursor: "pointer", borderBottom: "2px solid transparent", marginBottom: -1 },
  tabOn: { color: "var(--color-text-deep)", fontWeight: 700, borderBottom: "2px solid var(--color-text-deep)" },

  list: { display: "flex", flexDirection: "column", paddingBottom: 40 },
  row: { display: "flex", alignItems: "center", gap: 10, padding: "14px 0", borderBottom: "1px solid var(--color-divider-card)" },
  rowBody: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 },
  rowTitle: { fontSize: 14.5, fontWeight: 600, color: "var(--color-text-deep)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  rowSub: { fontSize: 12.5, color: "var(--color-text-tertiary)" },
  rowBadge: { display: "inline-grid", placeItems: "center", color: "var(--color-text-tertiary)", flexShrink: 0 },
  rowKebab: { width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--color-text-tertiary)", flexShrink: 0 },
  seeMoreRow: { display: "flex", justifyContent: "flex-end", paddingTop: 14 },
  seeMore: { border: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", cursor: "pointer" },
};
