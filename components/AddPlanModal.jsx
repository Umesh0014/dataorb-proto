"use client";

import React from "react";
import Modal from "./Modal";
import { FAMILY_LABELS } from "./mocks/recruiter";

// AddPlanModal — the "New plan" create flow. Wraps the shared Modal with a
// labelled form; on submit it builds a draft Interview Plan (the AI Interviewer
// template) and hands it to the page, which prepends it in-memory. Name + job
// profile are required; topics are entered one per line. New plans start as
// drafts with no screenings yet. No pass-bar framing — a plan defines what
// knowledge is screened (G4).

const MODES = ["Adaptive interview", "Generated set"];
const EMPTY = { name: "", jobProfile: "", family: "support", mode: "Adaptive interview", topics: "" };

export default function AddPlanModal({ open, onClose, onAdd }) {
  const [form, setForm] = React.useState(EMPTY);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (open) { setForm(EMPTY); setError(""); }
  }, [open]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = () => {
    const name = form.name.trim();
    const jobProfile = form.jobProfile.trim();
    if (!name || !jobProfile) {
      setError("Plan name and job profile are both required.");
      return;
    }
    const topics = form.topics.split("\n").map((t) => t.trim()).filter(Boolean);
    onAdd?.({
      id: `ip-${Date.now().toString(36)}`,
      name,
      jobProfile,
      family: form.family,
      mode: form.mode,
      assisted: form.mode === "Generated set",
      status: "draft",
      topics,
      topicsTotal: topics.length,
      screened: 0,
      lastRun: null,
    });
  };

  return (
    <Modal
      open={open}
      onDismiss={onClose}
      title="New interview plan"
      confirmLabel="Create plan"
      cancelLabel="Cancel"
      onConfirm={submit}
      body={
        <div style={s.form}>
          <p style={s.intro}>
            Define the AI Interviewer template for a role. It starts as a <strong>Draft</strong>;
            publish it when the knowledge topics are ready.
          </p>

          <Field label="Plan name" htmlFor="add-plan-name">
            <input id="add-plan-name" type="text" className="recruiter-focusable" value={form.name} onChange={set("name")} placeholder="e.g. Tier 1 Support — bridge knowledge"
              aria-invalid={error && !form.name.trim() ? true : undefined} aria-describedby={error ? "add-plan-error" : undefined} style={s.input} />
          </Field>

          <Field label="Job profile" htmlFor="add-plan-profile">
            <input id="add-plan-profile" type="text" className="recruiter-focusable" value={form.jobProfile} onChange={set("jobProfile")} placeholder="e.g. Tier 1 Support Advisor"
              aria-invalid={error && !form.jobProfile.trim() ? true : undefined} aria-describedby={error ? "add-plan-error" : undefined} style={s.input} />
          </Field>

          <div style={s.twoCol}>
            <Field label="Job family" htmlFor="add-plan-family">
              <select id="add-plan-family" className="recruiter-focusable" value={form.family} onChange={set("family")} style={s.input}>
                {Object.entries(FAMILY_LABELS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
              </select>
            </Field>
            <Field label="Interview mode" htmlFor="add-plan-mode">
              <select id="add-plan-mode" className="recruiter-focusable" value={form.mode} onChange={set("mode")} style={s.input}>
                {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Knowledge topics (one per line)" htmlFor="add-plan-topics">
            <textarea id="add-plan-topics" className="recruiter-focusable" value={form.topics} onChange={set("topics")} rows={4}
              placeholder={"Identity verification\nBilling dispute path\nEscalation thresholds"} style={{ ...s.input, height: "auto", padding: "10px 12px", resize: "vertical" }} />
          </Field>

          {error && <p id="add-plan-error" style={s.error} role="alert">{error}</p>}
        </div>
      }
    />
  );
}

function Field({ label, htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} style={s.field}>
      <span style={s.label}>{label}</span>
      {children}
    </label>
  );
}

const s = {
  form: { display: "flex", flexDirection: "column", gap: 16 },
  intro: { margin: 0, fontSize: 13, fontWeight: 400, color: "var(--color-text-medium)", lineHeight: 1.5 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 700, letterSpacing: "0.2px", color: "var(--color-text-medium)" },
  input: {
    width: "100%", boxSizing: "border-box", height: 40, padding: "0 12px",
    border: "1px solid var(--color-divider-card)", borderRadius: 8, background: "var(--surface-white)",
    fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--color-text-deep)",
  },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  error: { margin: 0, fontSize: 12, fontWeight: 600, color: "var(--color-error)" },
};
