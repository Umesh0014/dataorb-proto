"use client";

import React from "react";
import { Sparkles, Check, X, FileText, Rocket } from "lucide-react";
import Button from "./Button";
import { GW_SOURCE_INTERACTIONS, GW_PERSONAS } from "./mocks/guidedWorkflows";

// GuidedWorkflowDialogs — the two modal flows the authoring page raises:
// the variant-aware CREATE entry (generate from ≤10 interactions or paste a
// transcript — edit-mode is create-mode, never a blank page) and the ATTACH
// dialog (which drill personas carry this workflow; unlimited attempts in
// V1). Extracted from GuidedWorkflowsPage to keep that orchestrator lean.

export function CreateOverlay({ variant, onClose, onConfirm }) {
  const [mode, setMode] = React.useState("interactions");
  const [picked, setPicked] = React.useState(GW_SOURCE_INTERACTIONS.filter((i) => i.selected).map((i) => i.id));
  const generateFirst = variant === "balanced";
  const studio = variant === "ambitious";

  const toggle = (id) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < 10 ? [...p, id] : p));

  const cta = studio ? "Open the studio" : generateFirst ? "Generate workflow" : mode === "paste" ? "Convert to workflow" : "Generate workflow";

  return (
    <Overlay onClose={onClose} title="Create a guided workflow" labelledBy="gw-create-title">
      <p style={styles.ovLead}>
        {studio
          ? "Pick the interactions to mine, or paste a transcript — both open in the studio with a first draft already in place."
          : "Nothing starts from a blank page. Generate a first draft from production interactions, or paste a transcript to convert — then edit."}
      </p>

      <div style={styles.modeRow}>
        <ModeChip active={mode === "interactions"} onClick={() => setMode("interactions")} primary={generateFirst}>
          <Sparkles size={14} /> Pick interactions {generateFirst && "· recommended"}
        </ModeChip>
        <ModeChip active={mode === "paste"} onClick={() => setMode("paste")}>
          <FileText size={14} /> Paste a transcript
        </ModeChip>
      </div>

      {mode === "interactions" ? (
        <div style={styles.intList}>
          <span style={styles.intHint}>Choose up to 10 — {picked.length} selected</span>
          {GW_SOURCE_INTERACTIONS.map((i) => {
            const on = picked.includes(i.id);
            return (
              <button key={i.id} type="button" onClick={() => toggle(i.id)} style={{ ...styles.intRow, ...(on ? styles.intRowOn : null) }} aria-pressed={on}>
                <span style={{ ...styles.check, ...(on ? styles.checkOn : null) }}>{on && <Check size={12} color="var(--surface-white)" />}</span>
                <span style={styles.intMain}>
                  <span style={styles.intCustomer}>{i.customer}</span>
                  <span style={styles.intReason}>{i.reason}</span>
                </span>
                <span style={styles.intMeta}>{i.duration} · {i.outcome}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <textarea
          style={styles.paste}
          rows={7}
          placeholder="Paste a call transcript or a few bullet points describing the conversation…"
          aria-label="Transcript to convert"
        />
      )}

      <div style={styles.ovFoot}>
        <Button variant="text" uppercase={false} onClick={onClose}>Cancel</Button>
        <Button variant="primary" leadingIcon={<Sparkles size={16} />} onClick={onConfirm}>{cta}</Button>
      </div>
    </Overlay>
  );
}

export function AttachOverlay({ attached, onToggle, onClose }) {
  return (
    <Overlay onClose={onClose} title="Attach to drill personas" labelledBy="gw-attach-title">
      <p style={styles.ovLead}>
        Agents practise this workflow on the personas you attach it to. In V1 they get unlimited
        guided attempts per persona.
      </p>
      <div style={styles.intList}>
        {GW_PERSONAS.map((p) => {
          const on = attached.includes(p.id);
          return (
            <button key={p.id} type="button" onClick={() => onToggle(p.id)} style={{ ...styles.intRow, ...(on ? styles.intRowOn : null) }} aria-pressed={on}>
              <span style={{ ...styles.check, ...(on ? styles.checkOn : null) }}>{on && <Check size={12} color="var(--surface-white)" />}</span>
              <span style={styles.intMain}>
                <span style={styles.intCustomer}>{p.customer}</span>
                <span style={styles.intReason}>{p.category} · {p.difficulty}</span>
              </span>
              {on && <span style={styles.attachedTag}>Attached</span>}
            </button>
          );
        })}
      </div>
      <div style={styles.ovFoot}>
        <Button variant="primary" onClick={onClose}>Done</Button>
      </div>
    </Overlay>
  );
}

// Publish is the workflow's headline, outward-facing action — confirm it
// before it goes live (G14 journey + INT-8 confirm-irreversible).
export function PublishOverlay({ attachedCount, onClose, onConfirm }) {
  return (
    <Overlay onClose={onClose} title="Publish this guided workflow?" labelledBy="gw-publish-title">
      <p style={styles.ovLead}>
        Publishing makes this the live version. {attachedCount > 0
          ? `Agents on the ${attachedCount} attached persona${attachedCount === 1 ? "" : "s"} will practise against it`
          : "It isn't attached to a persona yet, so no agent will see it until you attach one"} — with
        the safety wheel on, so guided scores stay out of the readiness profile.
      </p>
      <div style={styles.publishNote}>
        <Rocket size={15} color="var(--color-button-primary-bg)" aria-hidden="true" />
        Your edits are versioned — you can update and republish any time.
      </div>
      <div style={styles.ovFoot}>
        <Button variant="text" uppercase={false} onClick={onClose}>Cancel</Button>
        <Button variant="primary" leadingIcon={<Rocket size={16} />} onClick={onConfirm}>Publish workflow</Button>
      </div>
    </Overlay>
  );
}

// Shared modal shell — scrim + dialog, Esc to close, click-outside to close.
function Overlay({ title, labelledBy, onClose, children }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div style={styles.scrim} role="dialog" aria-modal="true" aria-labelledby={labelledBy} onMouseDown={onClose}>
      <div style={styles.dialog} onMouseDown={(e) => e.stopPropagation()}>
        <div style={styles.dialogHead}>
          <span id={labelledBy} style={styles.dialogTitle}>{title}</span>
          <button type="button" onClick={onClose} style={styles.closeBtn} aria-label="Close">
            <X size={18} color="var(--color-text-tertiary)" />
          </button>
        </div>
        <div style={styles.dialogBody}>{children}</div>
      </div>
    </div>
  );
}

function ModeChip({ active, primary, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.modeChip,
        borderColor: active ? "var(--color-button-primary-bg)" : "var(--color-divider-card)",
        background: active ? "var(--color-primary-alpha-12)" : "var(--surface-white)",
        color: active ? "var(--color-button-primary-bg)" : "var(--color-text-medium)",
        fontWeight: primary || active ? 700 : 500,
      }}
    >
      {children}
    </button>
  );
}

const styles = {
  scrim: {
    position: "fixed", inset: 0, zIndex: 80, background: "color-mix(in srgb, var(--color-text-deep) 28%, transparent)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
  },
  dialog: {
    width: "min(560px, 100%)", maxHeight: "86vh", display: "flex", flexDirection: "column",
    background: "var(--surface-white)", borderRadius: 14, boxShadow: "var(--shadow-drawer)", overflow: "hidden",
  },
  dialogHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--color-divider-card)" },
  dialogTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  closeBtn: { background: "transparent", border: "none", cursor: "pointer", padding: 6, display: "inline-flex", borderRadius: 8 },
  dialogBody: { padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 },
  ovLead: { margin: 0, fontSize: 13, color: "var(--color-text-tertiary)", lineHeight: 1.55 },

  modeRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  modeChip: {
    display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 10,
    border: "1px solid var(--color-divider-card)", cursor: "pointer", fontFamily: "inherit", fontSize: 13,
  },
  intList: { display: "flex", flexDirection: "column", gap: 8 },
  intHint: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },
  intRow: {
    display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, textAlign: "left",
    background: "var(--surface-white)", border: "1px solid var(--color-divider-card)", cursor: "pointer", fontFamily: "inherit",
  },
  intRowOn: { borderColor: "var(--color-button-primary-bg)", background: "var(--color-primary-alpha-12)" },
  check: {
    width: 18, height: 18, borderRadius: 5, border: "1.5px solid var(--color-divider-card)", flexShrink: 0,
    display: "inline-grid", placeItems: "center", background: "var(--surface-white)",
  },
  checkOn: { background: "var(--color-button-primary-bg)", borderColor: "var(--color-button-primary-bg)" },
  intMain: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 },
  intCustomer: { fontSize: 13.5, fontWeight: 600, color: "var(--color-text-deep)" },
  intReason: { fontSize: 12, color: "var(--color-text-tertiary)" },
  intMeta: { fontSize: 11.5, fontWeight: 500, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)", flexShrink: 0 },
  attachedTag: { fontSize: 11, fontWeight: 700, color: "var(--color-success-text)", flexShrink: 0 },
  paste: {
    width: "100%", boxSizing: "border-box", resize: "vertical", padding: "12px 14px", borderRadius: 10,
    border: "1px solid var(--color-divider-card)", background: "var(--surface-dim)", fontFamily: "var(--font-sans)",
    fontSize: 13, color: "var(--color-text-medium)", lineHeight: 1.55,
  },
  ovFoot: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 },
  publishNote: {
    display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", borderRadius: 10,
    background: "var(--color-primary-alpha-12)", fontSize: 12.5, color: "var(--color-text-medium)", lineHeight: 1.5,
  },
};
