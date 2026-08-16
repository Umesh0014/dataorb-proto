"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, MinusCircle, ExternalLink } from "lucide-react";
import { TYPE, COLORS, RADIUS } from "../designTokens";
import Chip from "./Chip";

// DS · InteractionCard — a List row for one interaction: outcome icon, mono ID,
// context Chips, resolution label, open-in-new action, and a ✦ AI snippet.
const TONE = {
  green: { Icon: CheckCircle2, bg: COLORS.successBg, fg: COLORS.successText },
  amber: { Icon: MinusCircle, bg: "#F9F9FF", fg: COLORS.textFaint },
  red: { Icon: AlertTriangle, bg: COLORS.errorBg, fg: COLORS.error },
};

export default function InteractionCard({ item }) {
  const t = TONE[item.outcomeTone] || TONE.amber;
  const Icon = t.Icon;
  return (
    <article style={s.card}>
      <div style={s.top}>
        <span style={{ ...s.iconWrap, background: t.bg }}><Icon size={15} color={t.fg} /></span>
        <div style={s.body}>
          <span style={s.id}>{item.id}</span>
          <div style={s.tags}>
            {item.tags?.map((tag) => <Chip key={tag}>{tag}</Chip>)}
            {item.extraTags > 0 && <Chip>+{item.extraTags}</Chip>}
            <span style={s.dot} />
            <span style={{ ...s.res, color: t.fg }}>{item.outcome}</span>
          </div>
        </div>
        <a href="#interaction" target="_blank" rel="noreferrer" style={s.open} aria-label="Open interaction">
          <ExternalLink size={15} color={COLORS.textFaint} />
        </a>
      </div>
      <div style={s.suggest}>
        <span style={s.mira} aria-hidden="true">✦</span>
        <p style={s.snippet}>{item.snippet || <span style={s.empty}>No analysis available.</span>}</p>
      </div>
    </article>
  );
}

const s = {
  card: { border: `1px solid ${COLORS.divider}`, borderRadius: RADIUS.lg, overflow: "hidden", background: "#FFFFFF" },
  top: { display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px" },
  iconWrap: { width: 32, height: 32, borderRadius: RADIUS.pill, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center" },
  body: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 },
  id: { ...TYPE.bodyMedium, color: COLORS.textBody, fontFamily: "var(--font-mono)" },
  tags: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  dot: { width: 3, height: 3, borderRadius: RADIUS.pill, background: COLORS.textFaint },
  res: { ...TYPE.bodySmall, fontWeight: 500 },
  open: { flexShrink: 0, display: "inline-flex", marginTop: 2 },
  suggest: { borderTop: `1px solid ${COLORS.surface}`, display: "flex", gap: 6, alignItems: "flex-start", padding: "10px 16px 12px" },
  mira: { color: COLORS.tertiary, fontWeight: 700, fontSize: 13, flexShrink: 0, lineHeight: "18px" },
  snippet: { ...TYPE.bodySmall, margin: 0, color: COLORS.textBody, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  empty: { fontStyle: "italic", color: COLORS.textFaint },
};
