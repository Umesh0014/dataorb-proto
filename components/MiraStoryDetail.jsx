"use client";

import React from "react";
import { ArrowLeft, Globe, Lock, Pin } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import KpiTrendChart from "./KpiTrendChart";
import { MiraStarIcon } from "./SideNav/icons";
import {
  OUTCOME_KPIS,
  STORY_SECTIONS,
  STORY_PINNED,
  STORY_COMMENTS,
  STORY_COLLABORATORS,
} from "./mocks/miraKpiSpace";

/**
 * MiraStoryDetail — the authored-story document opened from a Story card in
 * KPI Space. Renders the "author once, viewable by everyone" story: a TL;DR,
 * the related KPI trend, the analytical narrative, pinned insights others can
 * jump to, and a collaborative comment thread.
 *
 * @param {{ story: object, onBack: () => void }} props
 */
export default function MiraStoryDetail({ story, onBack }) {
  const kpi = OUTCOME_KPIS.find((k) => k.id === story.kpiId) || OUTCOME_KPIS[0];
  const isPublic = story.visibility === "public";
  const VisIcon = isPublic ? Globe : Lock;
  const pinned = STORY_PINNED.slice(0, Math.max(1, Math.min(story.pins, STORY_PINNED.length)));

  return (
    <div style={s.scroll}>
      <div style={s.doc}>
        <div style={s.topRow}>
          <Button variant="text" leadingIcon={<ArrowLeft size={16} />} onClick={onBack}>
            Back
          </Button>
        </div>

        <h1 style={s.title}>{story.title}</h1>

        <div style={s.metaRow}>
          <span style={s.author}>
            <span style={s.authorIcon} aria-hidden="true">
              <MiraStarIcon size={14} color="var(--color-button-primary-bg)" />
            </span>
            Mira
          </span>
          <span style={s.metaDot} aria-hidden="true" />
          <span>{story.date}</span>
          <span style={s.metaDot} aria-hidden="true" />
          <span style={s.visTag}>
            <VisIcon size={13} color="var(--color-text-tertiary)" />
            {isPublic ? "Public" : "Private"}
          </span>
          <div style={{ flex: 1 }} />
          <div style={s.collabRow} aria-label="Collaborators">
            {STORY_COLLABORATORS.map((c) => (
              <span key={c.initials} style={s.collabAvatar} title={c.name}>
                {c.initials}
              </span>
            ))}
          </div>
        </div>

        <div style={s.tldr}>
          <span style={s.tldrLabel}>TL;DR</span>
          <p style={s.tldrText}>{story.tldr}</p>
        </div>

        <Card padX={20} padY={20}>
          <div style={s.chartHead}>{kpi.label} · last 8 months</div>
          <KpiTrendChart kpi={kpi} height={180} />
        </Card>

        {STORY_SECTIONS.map((sec) => (
          <section key={sec.heading} style={s.section}>
            <h2 style={s.sectionHeading}>{sec.heading}</h2>
            <p style={s.sectionBody}>{sec.body}</p>
          </section>
        ))}

        <section style={s.section}>
          <h2 style={s.sectionHeading}>Pinned insights</h2>
          <div style={s.pinnedList}>
            {pinned.map((p) => (
              <div key={p.text} style={s.pinned}>
                <Pin size={14} color="var(--color-button-primary-bg)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={s.pinnedText}>{p.text}</p>
                  <span style={s.pinnedBy}>Pinned by {p.by}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={s.section}>
          <h2 style={s.sectionHeading}>Comments</h2>
          <div style={s.commentList}>
            {STORY_COMMENTS.map((c) => (
              <div key={c.user + c.time} style={s.comment}>
                <span style={s.commentAvatar} aria-hidden="true">{c.initials}</span>
                <div style={s.commentBody}>
                  <div style={s.commentHead}>
                    <span style={s.commentUser}>{c.user}</span>
                    <span style={s.commentTime}>{c.time}</span>
                  </div>
                  <p style={s.commentText}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={s.commentBox}>
            <input
              type="text"
              placeholder="Add a comment or pin an insight…"
              aria-label="Add a comment"
              style={s.commentInput}
            />
            <Button variant="primary">Comment</Button>
          </div>
        </section>
      </div>
    </div>
  );
}

const s = {
  scroll: { flex: 1, minHeight: 0, overflowY: "auto" },
  doc: {
    width: "100%",
    maxWidth: 760,
    marginInline: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    paddingBottom: 12,
    fontFamily: "var(--font-sans)",
  },
  topRow: { display: "flex", alignItems: "center" },

  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800,
    color: "var(--color-text-deep)",
    lineHeight: 1.25,
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  author: { display: "inline-flex", alignItems: "center", gap: 6, color: "var(--color-text-medium)", fontWeight: 600 },
  authorIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    background: "var(--color-primary-alpha-12)",
    display: "grid",
    placeItems: "center",
  },
  visTag: { display: "inline-flex", alignItems: "center", gap: 4 },
  metaDot: { width: 3, height: 3, borderRadius: 999, background: "var(--color-text-tertiary)", flexShrink: 0 },
  collabRow: { display: "flex" },
  collabAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginLeft: -6,
    background: "var(--color-card-emoji-bg)",
    border: "1px solid var(--surface-white)",
    boxShadow: "0 0 0 1px var(--color-divider-card)",
    color: "var(--color-text-medium)",
    fontSize: 10,
    fontWeight: 700,
    display: "grid",
    placeItems: "center",
  },

  tldr: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: 16,
    borderRadius: 12,
    background: "var(--color-primary-alpha-04)",
    border: "1px solid var(--color-divider-card)",
  },
  tldrLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--color-button-primary-bg)",
  },
  tldrText: { margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--color-text-deep)" },

  chartHead: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", marginBottom: 12 },

  section: { display: "flex", flexDirection: "column", gap: 8 },
  sectionHeading: { margin: 0, fontSize: 17, fontWeight: 700, color: "var(--color-text-deep)" },
  sectionBody: { margin: 0, fontSize: 15, lineHeight: 1.65, color: "var(--color-text-medium)" },

  pinnedList: { display: "flex", flexDirection: "column", gap: 10 },
  pinned: {
    display: "flex",
    gap: 10,
    padding: 14,
    borderRadius: 10,
    background: "var(--color-card-emoji-bg)",
    borderLeft: "3px solid var(--color-button-primary-bg)",
  },
  pinnedText: { margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--color-text-deep)", fontWeight: 600 },
  pinnedBy: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },

  commentList: { display: "flex", flexDirection: "column", gap: 16 },
  comment: { display: "flex", gap: 12 },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    background: "var(--color-card-emoji-bg)",
    border: "1px solid var(--color-divider-card)",
    color: "var(--color-text-medium)",
    fontSize: 11,
    fontWeight: 700,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  commentBody: { display: "flex", flexDirection: "column", gap: 3, minWidth: 0 },
  commentHead: { display: "flex", alignItems: "baseline", gap: 8 },
  commentUser: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  commentTime: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  commentText: { margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--color-text-medium)" },

  commentBox: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    marginTop: 4,
    paddingTop: 16,
    borderTop: "1px solid var(--color-divider-card)",
  },
  commentInput: {
    flex: 1,
    height: 40,
    paddingInline: 14,
    borderRadius: 10,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    outline: "none",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-deep)",
  },
};
