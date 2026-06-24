"use client";

import React from "react";
import { ExternalLink } from "lucide-react";

const POPPINS = "var(--font-sans)";
// Sentiment face tints (Figma 2349-28544 interaction cards).
const FACE = {
  positive: { bg: "#E7F8EE", emoji: "🙂" },
  neutral: { bg: "#EEF1FF", emoji: "😐" },
  negative: { bg: "#FFECEC", emoji: "🙁" },
};
const RESOLUTION = {
  Resolved: { dot: "#00A23A", fg: "#2C2F42" },
  Unresolved: { dot: "#C4C9D6", fg: "#5B5E6F" },
};

// Dated groups of interaction cards. Used by L2 (week detail) and the
// Adherence L1. Each card: sentiment face → title → resolution + emoji
// reactions → ✦ AI insight (2-line clamp) + a CTA link.
export default function KpiInteractionsList({ groups }) {
  return (
    <div style={s.wrap}>
      {groups.map((g) => (
        <div key={g.date} style={s.group}>
          <span style={s.date}>{g.date}</span>
          {g.items.map((it) => {
            const face = FACE[it.sentiment] || FACE.neutral;
            const res = RESOLUTION[it.resolution] || RESOLUTION.Unresolved;
            return (
              <div key={it.id} style={s.card}>
                <div style={s.cardTop}>
                  <span style={{ ...s.face, background: face.bg }} aria-hidden="true">{face.emoji}</span>
                  <div style={s.cardMain}>
                    <span style={s.title}>{it.title}</span>
                    <span style={s.metaRow}>
                      <span style={{ ...s.resDot, background: res.dot }} />
                      <span style={{ ...s.resLabel, color: res.fg }}>{it.resolution}</span>
                      {it.reactions?.map((r, i) => (
                        <React.Fragment key={i}><span style={s.sep}>·</span><span style={s.react}>{r}</span></React.Fragment>
                      ))}
                    </span>
                  </div>
                  {it.link && <ExternalLink size={16} color="#8C90A6" style={{ flexShrink: 0 }} />}
                </div>
                <p style={s.insight}>
                  <span style={s.mark} aria-hidden="true">✦</span>
                  {it.insight}
                </p>
                {it.cta && <button type="button" style={s.cta}>{it.cta}</button>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 18 },
  group: { display: "flex", flexDirection: "column", gap: 12 },
  date: { fontSize: 12, fontWeight: 500, color: "#8C90A6", letterSpacing: "0.25px" },
  card: { background: "#FCFBFF", border: "1px solid #EEF1F8", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10 },
  cardTop: { display: "flex", alignItems: "flex-start", gap: 12 },
  face: { width: 32, height: 32, borderRadius: 999, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
  cardMain: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 },
  title: { fontSize: 14, fontWeight: 500, color: "#171B2C", letterSpacing: "0.1px" },
  metaRow: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  resDot: { width: 8, height: 8, borderRadius: 999, flexShrink: 0 },
  resLabel: { fontSize: 12, color: "#5B5E6F" },
  sep: { color: "#C4C9D6" },
  react: { fontSize: 13 },
  insight: { margin: 0, fontSize: 13, color: "#5B5E6F", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  mark: { color: "#6650A5", fontWeight: 700, marginRight: 6 },
  cta: { alignSelf: "flex-start", border: "none", background: "none", padding: 0, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#5B5E6F", fontFamily: POPPINS, textDecoration: "underline", textUnderlineOffset: 2 },
};
