"use client";

import React from "react";
import { Ear, MessageSquare, Plus, Sparkles, X } from "lucide-react";
import Button from "./Button";

// HintsPanel — "05a.1 · Workflow editor — hints expanded" /
// "05a.2 · … — add hint panel". Same panel, two states: viewing a step's
// existing hints (composer closed), or composing a new one (auto-opened
// when the step had none). Passed to <PageLayout rightPanel> by the host —
// same docked-column treatment as WorkflowFilterPanel/InteractionFilterPanel,
// not a floating overlay (Figma's "Dashboard Sidecar" sits beside the
// content, it doesn't cover it).
//
// Figma's mock repeats the identical hint text twice — kept as-is rather
// than inventing distinct copy. Hint content isn't per-step (no backend) —
// the panel always shows this same pair, matching the source frames.
const HINT_TYPES = [
  { id: "say", label: "Say", Icon: MessageSquare },
  { id: "listen", label: "Listen for", Icon: Ear },
  { id: "practice", label: "Best practice", Icon: Sparkles },
];

const EXISTING_HINTS = [
  { type: "Say", text: "Welcome to Orange, my name is [name] — how can I help you today? Welcome to Orange, my name is [name] — how can I help you " },
  { type: "Say", text: "Welcome to Orange, my name is [name] — how can I help you today? Welcome to Orange, my name is [name] — how can I help you " },
];

export default function HintsPanel({ hintCount, onClose }) {
  const [composerOpen, setComposerOpen] = React.useState(!hintCount);
  const [activeType, setActiveType] = React.useState(HINT_TYPES[0].id);
  const [draft, setDraft] = React.useState("");
  const activeLabel = (HINT_TYPES.find((t) => t.id === activeType) || HINT_TYPES[0]).label.toLowerCase();

  return (
    <div style={hStyles.panel}>
      <div style={hStyles.body}>
        <div style={hStyles.header}>
          <span style={hStyles.heading}>Hints</span>
          <Button variant="icon" size="sm" onClick={onClose} aria-label="Close hints panel"><X size={20} color="var(--color-text-medium)" /></Button>
        </div>
        <div style={hStyles.list}>
          {EXISTING_HINTS.map((hint, i) => (
            <div key={i} style={hStyles.hintCard}>
              <span style={hStyles.typeChip}>{hint.type}</span>
              <p style={hStyles.hintText}>{hint.text}<span style={hStyles.more}> ... more</span></p>
            </div>
          ))}
          {composerOpen && (
            <div style={hStyles.hintCard}>
              <div style={hStyles.typeTabs}>
                {HINT_TYPES.map(({ id, label, Icon }) => (
                  <Button
                    key={id}
                    variant="text"
                    uppercase={false}
                    leadingIcon={<Icon size={12} />}
                    onClick={() => setActiveType(id)}
                    aria-pressed={id === activeType}
                    style={{ ...hStyles.typeTab, ...(id === activeType ? hStyles.typeTabActive : {}) }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`Write the ${activeLabel} Hint...`}
                aria-label={`Write the ${activeLabel} hint`}
                style={hStyles.textarea}
              />
            </div>
          )}
        </div>
      </div>
      <div style={hStyles.footer}>
        <Button
          variant="text"
          uppercase={false}
          disabled={composerOpen}
          leadingIcon={<Plus size={16} />}
          onClick={() => setComposerOpen(true)}
          style={hStyles.addHint}
        >
          Add Hint
        </Button>
        <Button variant="text" uppercase={false} onClick={onClose} style={hStyles.done}>Done</Button>
      </div>
    </div>
  );
}

const hStyles = {
  panel: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
  },
  body: { flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflowY: "auto" },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    height: 56,
    paddingInline: 16,
    flexShrink: 0,
  },
  heading: {
    flex: 1,
    fontFamily: "var(--font-sans)",
    fontSize: 16,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  list: { display: "flex", flexDirection: "column", gap: 8, padding: "0 16px 16px" },
  hintCard: { padding: 16, borderRadius: 12, background: "var(--tile-blue-bg)", display: "flex", flexDirection: "column", gap: 12 },
  typeChip: { alignSelf: "flex-start", padding: "3px 8px", borderRadius: 4, background: "var(--color-card-emoji-bg)", fontSize: 11, color: "var(--grey-700)" },
  hintText: { margin: 0, fontSize: 16, letterSpacing: "0.5px", color: "var(--color-text-medium)", lineHeight: "24px" },
  more: { color: "#1E3A8A", fontWeight: 500 },
  typeTabs: { display: "flex", flexWrap: "wrap", gap: 8 },
  typeTab: { height: 24, paddingInline: 8, borderRadius: 4, background: "var(--color-card-emoji-bg)", color: "var(--grey-700)", fontSize: 12 },
  typeTabActive: { border: "0.8px solid var(--do-brand-blue)", color: "var(--do-brand-blue)" },
  textarea: {
    width: "100%", minHeight: 64, padding: 12, border: "0.8px solid var(--do-brand-blue)", borderRadius: 8,
    background: "white", fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--color-text-medium)",
    outline: "none", resize: "vertical", boxSizing: "border-box",
  },
  footer: { height: 56, padding: "8px 24px 16px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16, flexShrink: 0, boxSizing: "border-box" },
  addHint: { color: "var(--do-brand-blue)", fontSize: 14, fontWeight: 500 },
  done: { height: 32, paddingInline: 16, border: "1px solid rgba(25,118,210,.5)", borderRadius: 999, color: "var(--do-brand-blue)", fontSize: 14, fontWeight: 500 },
};
