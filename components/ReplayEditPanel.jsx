"use client";

import React from "react";
import { ArrowLeft, RotateCcw, Loader2, Send } from "lucide-react";
import Card from "./Card";
import Button from "./Button";

// ReplayEditPanel — split-screen replay editor (Jun-11 review semantics).
// Left: the AI record as-built (read-only reference). Right: the same
// moments as editable dialogue. Editing converts each line into an input;
// "Restore AI version" reverts a touched moment. Because changing text
// means the audio must be re-cut, there is no silent save — the author
// hits "Save & regenerate audio", everything locks while audio is
// produced, and the replay then publishes. There is no "reject" here.

export default function ReplayEditPanel({ replay, onCancel, onSaved }) {
  const [moments, setMoments] = React.useState(() =>
    replay.moments.map((m) => ({ id: m.id, label: m.label, customerLine: m.customerLine, agentLine: m.agentLine, coachWhy: m.coach.why })));
  const [regenerating, setRegenerating] = React.useState(false);

  const dirty = React.useMemo(() => {
    return moments.some((m) => {
      const orig = replay.moments.find((o) => o.id === m.id);
      return m.customerLine !== orig.customerLine || m.agentLine !== orig.agentLine || m.coachWhy !== orig.coach.why;
    });
  }, [moments, replay.moments]);

  const setLine = (id, key, value) =>
    setMoments((prev) => prev.map((m) => (m.id === id ? { ...m, [key]: value } : m)));

  const restoreMoment = (id) => {
    const orig = replay.moments.find((o) => o.id === id);
    setMoments((prev) => prev.map((m) => (m.id === id
      ? { ...m, customerLine: orig.customerLine, agentLine: orig.agentLine, coachWhy: orig.coach.why }
      : m)));
  };

  const save = () => {
    setRegenerating(true);
    // Audio re-cut is a background task; the replay is locked meanwhile,
    // then lands edited + published with the human editor's credit.
    window.setTimeout(() => { setRegenerating(false); onSaved?.(); }, 2600);
  };

  return (
    <div style={st.column}>
      <Card padX={20} padY={14}>
        <div style={st.bar}>
          <div style={st.barLeft}>
            <button type="button" onClick={onCancel} aria-label="Back to collection" style={st.backBtn} disabled={regenerating}>
              <ArrowLeft size={18} color="var(--color-text-tertiary)" />
            </button>
            <div style={st.titleBlock}>
              <span style={st.eyebrow}>Editing replay</span>
              <span style={st.title}>{replay.title}</span>
            </div>
          </div>
          <Button
            variant="primary"
            uppercase={false}
            disabled={!dirty || regenerating}
            onClick={save}
            leadingIcon={regenerating ? <Spinner /> : undefined}
            trailingIcon={!regenerating ? <Send size={14} /> : undefined}
            style={{ height: 40, minWidth: 0, paddingInline: 18 }}
          >
            {regenerating ? "Regenerating audio…" : "Save & regenerate audio"}
          </Button>
        </div>
      </Card>

      <div style={st.split}>
        <Card padX={0} padY={0} style={st.pane}>
          <PaneHeader label="AI record" sub="As built — reference" />
          <div style={st.paneBody}>
            {replay.moments.map((m) => (
              <div key={m.id} style={st.refMoment}>
                <span style={st.momentLabel}>{m.label}</span>
                <RefLine speaker="Customer" body={m.customerLine} />
                <RefLine speaker="Agent" body={m.agentLine} />
                <div style={st.coachRef}>{m.coach.why}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card padX={0} padY={0} style={st.pane}>
          <PaneHeader label="Your edit" sub="Changes re-cut the audio" />
          <div style={{ ...st.paneBody, opacity: regenerating ? 0.5 : 1, pointerEvents: regenerating ? "none" : "auto" }}>
            {moments.map((m) => {
              const orig = replay.moments.find((o) => o.id === m.id);
              const touched = m.customerLine !== orig.customerLine || m.agentLine !== orig.agentLine || m.coachWhy !== orig.coach.why;
              return (
                <div key={m.id} style={st.editMoment}>
                  <div style={st.editMomentHead}>
                    <span style={st.momentLabel}>{m.label}</span>
                    {touched && (
                      <button type="button" onClick={() => restoreMoment(m.id)} style={st.restoreBtn}>
                        <RotateCcw size={12} /> Restore AI version
                      </button>
                    )}
                  </div>
                  <EditLine label="Customer" value={m.customerLine} onChange={(v) => setLine(m.id, "customerLine", v)} />
                  <EditLine label="Agent" value={m.agentLine} onChange={(v) => setLine(m.id, "agentLine", v)} />
                  <EditLine label="Coach commentary" value={m.coachWhy} onChange={(v) => setLine(m.id, "coachWhy", v)} muted />
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function PaneHeader({ label, sub }) {
  return (
    <div style={st.paneHeader}>
      <span style={st.paneLabel}>{label}</span>
      <span style={st.paneSub}>{sub}</span>
    </div>
  );
}

function RefLine({ speaker, body }) {
  return (
    <div style={st.refLine}>
      <span style={st.refSpeaker}>{speaker}</span>
      <p style={st.refBody}>{body}</p>
    </div>
  );
}

function EditLine({ label, value, onChange, muted }) {
  return (
    <label style={st.editLine}>
      <span style={{ ...st.editLineLabel, color: muted ? "var(--color-icon-tertiary-fg)" : "var(--color-text-tertiary)" }}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={muted ? 2 : 3}
        style={{ ...st.textarea, background: muted ? "var(--color-surface-header-tinted)" : "#FFFFFF" }}
      />
    </label>
  );
}

function Spinner() {
  return <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />;
}

const st = {
  column: { display: "flex", flexDirection: "column", gap: 16, width: "100%", flex: 1, minHeight: 0 },
  bar: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  barLeft: { display: "flex", alignItems: "center", gap: 12, minWidth: 0 },
  backBtn: { width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--color-card-emoji-bg)", display: "inline-grid", placeItems: "center", cursor: "pointer", padding: 0, flexShrink: 0 },
  titleBlock: { display: "flex", flexDirection: "column", gap: 2, minWidth: 0 },
  eyebrow: { fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--color-icon-tertiary-fg)" },
  title: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },

  split: { display: "flex", gap: 16, flex: 1, minHeight: 0 },
  pane: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 },
  paneHeader: { display: "flex", alignItems: "baseline", gap: 10, padding: "14px 20px", borderBottom: "1px solid var(--color-border-card-soft)" },
  paneLabel: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  paneSub: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)" },
  paneBody: { flex: 1, minHeight: 0, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 20 },

  refMoment: { display: "flex", flexDirection: "column", gap: 8, paddingBottom: 16, borderBottom: "1px solid var(--color-divider-card)" },
  momentLabel: { fontSize: 12, fontWeight: 700, letterSpacing: "0.3px", color: "var(--color-text-medium)", textTransform: "uppercase" },
  refLine: { display: "flex", flexDirection: "column", gap: 2 },
  refSpeaker: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)" },
  refBody: { margin: 0, fontSize: 13, lineHeight: 1.5, color: "var(--color-text-medium)" },
  coachRef: { fontSize: 12, lineHeight: 1.5, color: "var(--color-icon-tertiary-fg)", background: "var(--color-surface-header-tinted)", borderRadius: 6, padding: "8px 10px" },

  editMoment: { display: "flex", flexDirection: "column", gap: 10, paddingBottom: 16, borderBottom: "1px solid var(--color-divider-card)" },
  editMomentHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  restoreBtn: { display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--do-brand-blue)" },
  editLine: { display: "flex", flexDirection: "column", gap: 4 },
  editLineLabel: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500 },
  textarea: { width: "100%", resize: "vertical", border: "1px solid var(--color-border-card-soft)", borderRadius: 8, padding: "8px 10px", fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.5, color: "var(--color-text-deep)", outline: "none" },
};
