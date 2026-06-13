"use client";

import React from "react";
import { X, Sparkles } from "lucide-react";
import Button from "./Button";
import InlineStatusAffordance from "./InlineStatusAffordance";
import MetricSparkline from "./MetricSparkline";
import { SEVERITY_META, SIGNAL_META, INTERVENTION_META, LOOP_META, toneInk } from "./mocks/commandCenter";

// AttentionItemDrawer — the sidecar reveal for one Attention Item, shared by
// the Queue and Board variants. Mirrors the NbaSideSheet drawer precedent
// (fixed right panel, --shadow-drawer, Esc + close-button dismissal, slide
// from the right edge) so dismissal/motion match the app's one drawer
// pattern (INT-3 / MOT-7).
//
// Layout follows UI-7: the header answers who/what (identity), the metadata
// snapshot below holds the inputs (signal source, detected, sample). The
// quantitative metric is read-only and also rendered as a labelled table
// (the accessible alternative to the sparkline — G2 / WCAG-9). The coaching
// note is the editable, user-owned layer seeded from an AI suggestion
// (INT-7) — narrative only; numbers stay read-only.

export default function AttentionItemDrawer({ item, status = "open", onClose, onLaunch, onOpenAgent, onSnooze, onDismiss }) {
  React.useEffect(() => {
    if (!item) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  const present = Boolean(item);
  const sev = item ? SEVERITY_META[item.severity] : null;
  const sig = item ? SIGNAL_META[item.signal] : null;
  const interv = item ? INTERVENTION_META[item.intervention.kind] : null;
  const isOpen = status === "open";

  return (
    <aside
      role="complementary"
      aria-label="Attention item details"
      aria-hidden={!present}
      style={{
        ...dStyles.drawer,
        transform: present ? "translateX(0)" : "translateX(100%)",
        boxShadow: present ? "var(--shadow-drawer)" : "none",
      }}
    >
      {item && (
        <>
          <div style={dStyles.header}>
            <div style={dStyles.headerTop}>
              <h2 style={dStyles.title}>{item.agent.name}</h2>
              <Button variant="icon" size="sm" aria-label="Close details" onClick={onClose}>
                <X size={18} />
              </Button>
            </div>
            <div style={dStyles.tagRow}>
              <span style={dStyles.competencyTag}>{item.competency}</span>
              {item.driver && <span style={dStyles.driverTag}>{item.driver}</span>}
              <InlineStatusAffordance tone={sev.tone} icon={<Dot tone={sev.tone} />} style={{ color: toneInk(sev.tone) }}>
                {sev.label}
              </InlineStatusAffordance>
            </div>
          </div>

          <div style={dStyles.body}>
            {status !== "open" && (
              <InlineStatusAffordance tone={LOOP_META[status].tone} icon={<Dot tone={LOOP_META[status].tone} />} style={{ color: toneInk(LOOP_META[status].tone) }}>
                {LOOP_META[status].label}
              </InlineStatusAffordance>
            )}

            <section style={dStyles.snapshot}>
              <SnapshotField label="Signal" value={sig.label} />
              <SnapshotField label="Detected" value={`${item.recencyDays}d ago`} />
              <SnapshotField label="Sample" value={item.sampleNote || "—"} />
            </section>

            <section>
              <p style={dStyles.evidence}>{item.evidence}</p>
              {item.metric && (
                <>
                  <div style={dStyles.metricRow}>
                    <span style={dStyles.sparkWrap} role="img" aria-label={`${item.competency} trend, now ${item.metric.current}${item.metric.unit}`}>
                      <MetricSparkline
                        points={item.metric.points}
                        labels={item.metric.labels}
                        color="var(--chart-blue)"
                        formatValue={(v) => `${Math.round(v)}${item.metric.unit}`}
                      />
                    </span>
                    <span style={dStyles.metricNow}>{item.metric.current}{item.metric.unit}</span>
                  </div>
                  <table style={dStyles.table}>
                    <caption style={dStyles.caption}>{item.competency} — last {item.metric.points.length} points ({item.metric.unit === "%" ? "percent" : item.metric.unit})</caption>
                    <thead>
                      <tr>
                        {item.metric.labels.map((l) => (
                          <th key={l} scope="col" style={dStyles.th}>{l}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {item.metric.points.map((p, i) => (
                          <td key={item.metric.labels[i]} style={dStyles.td}>{p}{item.metric.unit}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </>
              )}
            </section>

            <section style={dStyles.intervBlock}>
              <span style={dStyles.intervLabel}>Recommended intervention</span>
              <div style={dStyles.intervRow}>
                <div style={dStyles.intervText}>
                  <span style={dStyles.intervVerb}>{interv.label}</span>
                  <span style={dStyles.intervAsset}>{item.intervention.asset}</span>
                </div>
                <span style={dStyles.durationChip}>{item.intervention.duration}</span>
              </div>
            </section>

            <CoachingNote key={item.id} item={item} />
          </div>

          <div style={dStyles.footer}>
            {isOpen ? (
              <>
                <Button variant="primary" fullWidth onClick={onLaunch}>Launch intervention</Button>
                <div style={dStyles.footerSecondary}>
                  <Button variant="text" uppercase={false} onClick={() => onOpenAgent?.(item.agent.id)}>Open profile</Button>
                  <Button variant="text" uppercase={false} onClick={onSnooze}>Snooze</Button>
                  <Button variant="text" uppercase={false} onClick={onDismiss}>Dismiss</Button>
                </div>
              </>
            ) : (
              <Button variant="text" uppercase={false} onClick={() => onOpenAgent?.(item.agent.id)}>Open profile</Button>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

// CoachingNote — the editable, user-owned narrative layer (INT-7). Seeded
// from an AI suggestion; the quantitative data above stays read-only. Keyed
// on item.id by the caller so a new item remounts it with a fresh draft —
// no reseeding effect needed.
function CoachingNote({ item }) {
  const seed = `Suggested by Mira: open with what's going well, then focus the ${item.competency.toLowerCase()} gap shown below. Keep it to one practice rep this week.`;
  const [note, setNote] = React.useState(seed);
  const [edited, setEdited] = React.useState(false);
  return (
    <section>
      <label htmlFor="cc-note" style={dStyles.noteLabel}>
        <Sparkles size={13} aria-hidden="true" style={{ color: "var(--color-button-primary-bg)" }} />
        Coaching note
        <span role="status" style={dStyles.noteMeta}>{edited ? "Edited by you" : "AI draft · editable"}</span>
      </label>
      <textarea
        id="cc-note"
        value={note}
        onChange={(e) => { setNote(e.target.value); setEdited(true); }}
        rows={4}
        style={dStyles.textarea}
      />
    </section>
  );
}

function SnapshotField({ label, value }) {
  return (
    <div style={dStyles.snapField}>
      <span style={dStyles.snapLabel}>{label}</span>
      <span style={dStyles.snapValue}>{value}</span>
    </div>
  );
}

function Dot({ tone }) {
  const color = {
    danger: "var(--color-error)",
    warning: "var(--color-warning)",
    info: "var(--color-info)",
    success: "var(--color-success)",
    tertiary: "var(--color-text-tertiary)",
  }[tone] || "var(--color-text-tertiary)";
  return <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />;
}

const dStyles = {
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: 400,
    maxWidth: "92vw",
    background: "var(--surface-white)",
    borderLeft: "1px solid var(--color-divider-card)",
    display: "flex",
    flexDirection: "column",
    zIndex: 45,
    transition: "transform 220ms ease",
  },
  header: {
    flexShrink: 0,
    padding: "18px 20px",
    borderBottom: "1px solid var(--color-divider-card)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  headerTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  title: { margin: 0, fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)" },
  tagRow: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 },
  competencyTag: {
    fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600,
    color: "var(--color-icon-tertiary-fg)", background: "var(--color-icon-tertiary-bg)",
    padding: "2px 8px", borderRadius: 999,
  },
  driverTag: {
    fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600,
    color: "var(--color-text-tertiary)", background: "var(--pill-bg)",
    padding: "2px 8px", borderRadius: 999,
  },
  body: { flex: 1, minHeight: 0, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 20 },
  snapshot: {
    display: "flex", flexWrap: "wrap", gap: 16,
    padding: "12px 14px", background: "var(--color-card-emoji-bg)", borderRadius: 10,
  },
  snapField: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  snapLabel: {
    fontFamily: "var(--font-sans)", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
    textTransform: "uppercase", color: "var(--color-text-tertiary)",
  },
  snapValue: { fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)" },
  evidence: { margin: "0 0 14px", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 400, color: "var(--text-primary)", lineHeight: 1.5 },
  metricRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  sparkWrap: { flex: 1, minWidth: 0 },
  metricNow: { fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)", flexShrink: 0 },
  table: { width: "100%", borderCollapse: "collapse" },
  caption: { captionSide: "top", textAlign: "left", fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", marginBottom: 6 },
  th: { fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", textAlign: "right", padding: "4px 8px", borderBottom: "1px solid var(--color-divider-card)" },
  td: { fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--color-text-deep)", textAlign: "right", padding: "6px 8px" },
  intervBlock: { display: "flex", flexDirection: "column", gap: 8 },
  intervLabel: { fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  intervRow: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "12px 14px", background: "var(--color-card-emoji-bg)", borderRadius: 10,
  },
  intervText: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 },
  intervVerb: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  intervAsset: { fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 400, color: "var(--text-secondary)" },
  durationChip: {
    flexShrink: 0, fontFamily: "var(--font-sans)", fontSize: 11, fontWeight: 600,
    color: "var(--color-text-tertiary)", background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)", padding: "3px 8px", borderRadius: 6,
  },
  noteLabel: {
    display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 700, color: "var(--color-text-deep)",
  },
  noteMeta: { marginLeft: "auto", fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)" },
  textarea: {
    width: "100%", boxSizing: "border-box", resize: "vertical",
    fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.5, color: "var(--text-primary)",
    padding: "10px 12px", border: "1px solid var(--color-divider-card)", borderRadius: 8, background: "var(--surface-white)",
  },
  footer: {
    flexShrink: 0, padding: 16, borderTop: "1px solid var(--color-divider-card)",
    display: "flex", flexDirection: "column", gap: 8,
  },
  footerSecondary: { display: "flex", alignItems: "center", justifyContent: "center", gap: 12 },
};
