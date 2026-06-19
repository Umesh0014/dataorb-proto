"use client";

import React from "react";
import { Globe, Lock, Eye, Share2, Copy, Plus, ChevronLeft, Pencil, BookOpen } from "lucide-react";
import { fullBleed } from "./MiraWorkspaceBits";
import { Avatar, StoryMeta, StoryBody, CommentThread, PinnedInsight, VisibilityBadge } from "./MiraStoriesBits";
import { SPACE, STORIES, COLLABORATORS } from "./mocks/miraSpace";

// Stories — Artifact A · Published Story. A story is a *published object*
// (Perplexity Pages / Hex data-app model): analysis is the source, the story is
// the build. Clear builder-vs-viewer split = our default-public-view /
// opt-in-private-edit. Every section carries lineage; pins are live pointers
// with an "as of"; EN→Arabic re-render on one tap. Research angles 3 + 4.
export default function MiraStoryPublished({ storyId, onBack, conversation, pendingTurnId, onSubmit, onReset }) {
  const [lang, setLang] = React.useState("en");
  const [mode, setMode] = React.useState("view");
  const story = STORIES.find((s) => s.id === storyId) || STORIES[0];
  const ar = lang === "ar";
  const collaborators = COLLABORATORS.slice(0, 4);
  const handleAsk = (t) => { if (t && t.trim() && !pendingTurnId) onSubmit?.(t); };

  return (
    <div style={fullBleed}>
      <div style={s.banner}>
        <button type="button" onClick={onBack} disabled={!onBack} style={{ ...s.crumb, ...(onBack ? s.crumbBtn : null) }}>
          <ChevronLeft size={16} /> {onBack ? "Back to stories" : `${SPACE.name} space · Stories`}
        </button>
        <div style={{ flex: 1 }} />
        <div style={s.seg}>
          <button type="button" onClick={() => setLang("en")} style={{ ...s.segBtn, ...(lang === "en" ? s.segOn : null) }}>EN</button>
          <button type="button" onClick={() => setLang("ar")} style={{ ...s.segBtn, ...(lang === "ar" ? s.segOn : null) }}>عربى</button>
        </div>
        <div style={s.seg}>
          <button type="button" onClick={() => setMode("view")} style={{ ...s.segBtn, ...(mode === "view" ? s.segOn : null) }}><BookOpen size={14} /> View</button>
          <button type="button" onClick={() => setMode("build")} style={{ ...s.segBtn, ...(mode === "build" ? s.segOn : null) }}><Pencil size={14} /> Build</button>
        </div>
      </div>

      <div style={s.grid}>
        <article style={{ ...s.doc, direction: ar ? "rtl" : "ltr", textAlign: ar ? "right" : "start" }}>
          <div style={s.pubRow}>
            <VisibilityBadge visibility={story.visibility} />
            <span style={s.pubNote}>Authored once · viewable by everyone in {SPACE.name}</span>
          </div>
          <h1 style={s.title}>{ar ? story.titleAr : story.title}</h1>
          <StoryMeta story={story} />
          <div style={s.tldr}><span style={s.tldrTag}>TL;DR</span><p style={s.tldrText}>{ar ? story.tldrAr : story.tldr}</p></div>

          {mode === "build" && (
            <div style={s.buildBar}>
              <Pencil size={14} /> Builder mode — reorder sections, hide the analysis, re-tone, then re-publish. Viewers see the published build only.
            </div>
          )}

          <StoryBody story={story} onAsk={handleAsk} />

          <div style={s.sep} />
          <CommentThread comments={story.comments} />
        </article>

        <aside style={s.rail}>
          <div style={s.card}>
            <p style={s.cardHead}>Published</p>
            <div style={s.kv}><span style={s.k}>Visibility</span><VisibilityBadge visibility={story.visibility} /></div>
            <div style={s.kv}><span style={s.k}>Viewers</span><span style={s.v}><Eye size={14} /> {story.viewCount}</span></div>
            <div style={s.kv}><span style={s.k}>Updated</span><span style={s.v}>{story.date}</span></div>
            <div style={s.actions}>
              <button type="button" style={s.primary}><Share2 size={15} /> Send to deck</button>
              <button type="button" style={s.ghost}><Copy size={15} /> Duplicate as private</button>
            </div>
          </div>

          <div style={s.card}>
            <p style={s.cardHead}>Collaborators</p>
            <div style={s.collabRow}>
              {collaborators.map((c) => <Avatar key={c.id} person={c} size={30} />)}
              <button type="button" style={s.addBtn} aria-label="Add collaborator"><Plus size={16} /></button>
            </div>
          </div>

          {story.pinnedInsights.length > 0 && (
            <div style={s.card}>
              <p style={s.cardHead}>Pinned insights</p>
              {story.pinnedInsights.map((p) => (
                <div key={p.id} style={s.pinJump}>
                  <span style={s.pinDot} aria-hidden="true" />
                  <span style={s.pinJumpText}>{p.text}</span>
                </div>
              ))}
            </div>
          )}

          {story.relatedStoryIds.length > 0 && (
            <div style={s.card}>
              <p style={s.cardHead}>Related stories</p>
              {story.relatedStoryIds.map((rid) => {
                const r = STORIES.find((x) => x.id === rid);
                if (!r) return null;
                return <a key={rid} style={s.related}><span style={s.relatedTitle}>{r.title}</span><span style={s.relatedMeta}>{r.author.name} · {r.readTimeLabel}</span></a>;
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

const s = {
  banner: { display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, flexWrap: "wrap" },
  crumb: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", border: "none", background: "transparent", fontFamily: "var(--font-sans)", padding: 0 },
  crumbBtn: { cursor: "pointer" },
  seg: { display: "inline-flex", gap: 2, padding: 3, borderRadius: 10, background: "var(--grey-100)" },
  segBtn: { display: "inline-flex", alignItems: "center", gap: 5, height: 30, paddingInline: 12, borderRadius: 8, border: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", cursor: "pointer" },
  segOn: { background: "var(--surface-white)", color: "var(--color-text-deep)", boxShadow: "var(--shadow-1)" },

  grid: { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 32, alignItems: "start", paddingBottom: 48 },
  doc: { minWidth: 0, maxWidth: 760 },
  pubRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12 },
  pubNote: { fontSize: 12.5, color: "var(--color-text-tertiary)" },
  title: { margin: "0 0 14px", fontSize: 32, lineHeight: 1.18, letterSpacing: "-0.02em", fontWeight: 800, color: "var(--color-text-deep)" },
  tldr: { display: "flex", gap: 12, margin: "18px 0", padding: 16, borderRadius: 12, background: "var(--grey-50)", border: "1px solid var(--color-divider-card)" },
  tldrTag: { fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", color: "var(--color-text-tertiary)", paddingTop: 2 },
  tldrText: { margin: 0, fontSize: 16, lineHeight: 1.55, fontWeight: 600, color: "var(--color-text-deep)" },
  buildBar: { display: "flex", alignItems: "center", gap: 8, margin: "0 0 18px", padding: "10px 14px", borderRadius: 10, border: "1px dashed var(--color-button-primary-bg)", background: "var(--surface-white)", fontSize: 13, fontWeight: 600, color: "var(--color-button-primary-bg)" },
  sep: { height: 1, background: "var(--color-divider-card)", margin: "24px 0" },

  rail: { position: "sticky", top: 0, display: "flex", flexDirection: "column", gap: 14 },
  card: { borderRadius: 14, border: "1px solid var(--color-border-card-soft)", background: "var(--surface-white)", boxShadow: "var(--shadow-1)", padding: 16 },
  cardHead: { margin: "0 0 12px", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  kv: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "6px 0", fontSize: 13 },
  k: { color: "var(--color-text-tertiary)" },
  v: { display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, color: "var(--color-text-deep)" },
  actions: { display: "flex", flexDirection: "column", gap: 8, marginTop: 12 },
  primary: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, height: 40, borderRadius: 10, border: "none", background: "var(--color-button-primary-bg)", color: "var(--color-button-primary-text, #fff)", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  ghost: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, height: 40, borderRadius: 10, border: "1px solid var(--color-border-tab)", background: "var(--surface-white)", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--color-text-medium)", cursor: "pointer" },
  collabRow: { display: "flex", alignItems: "center", gap: 6 },
  addBtn: { width: 30, height: 30, borderRadius: 999, border: "1px dashed var(--color-border-tab)", background: "var(--surface-white)", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--color-text-medium)" },
  pinJump: { display: "flex", gap: 8, padding: "7px 0", alignItems: "flex-start" },
  pinDot: { width: 7, height: 7, borderRadius: 999, background: "var(--color-button-primary-bg)", marginTop: 6, flexShrink: 0 },
  pinJumpText: { fontSize: 13, lineHeight: 1.45, color: "var(--color-text-medium)" },
  related: { display: "flex", flexDirection: "column", gap: 2, padding: "8px 0", cursor: "pointer", borderTop: "1px solid var(--color-divider-card)" },
  relatedTitle: { fontSize: 13.5, fontWeight: 600, color: "var(--color-text-deep)" },
  relatedMeta: { fontSize: 12, color: "var(--color-text-tertiary)" },
};
