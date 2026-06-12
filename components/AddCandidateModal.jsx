"use client";

import React from "react";
import Modal from "./Modal";
import { FAMILY_LABELS } from "./mocks/recruiter";

// AddCandidateModal — the "Add candidate" create flow. Wraps the shared Modal
// primitive with a small labelled form; on submit it builds a new candidate
// (landing at "Applied", AI screening not yet started) and hands it to the
// shell, which prepends it to the in-memory list. Name + role are required;
// the rest carry sensible defaults so a hiring manager can add an applicant in
// one step. No employment framing — this just registers an applicant (G4).

const SOURCES = ["Inbound", "Referral", "Sourced", "Community"];

// Assigned-topic counts per family (the screening's denominator) — mirrors the
// spread used across the mock so a new candidate's coverage reads consistently.
const FAMILY_TOPIC_TOTAL = {
  support: 18, sales: 14, retention: 12, onboarding: 14, compliance: 11, field: 16,
};

const EMPTY = { name: "", role: "", family: "support", source: "Inbound" };

// Today's date for the demo (matches the mock's reference "now").
const TODAY = "2026-06-12";

function initialsOf(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function AddCandidateModal({ open, onClose, onAdd }) {
  const [form, setForm] = React.useState(EMPTY);
  const [error, setError] = React.useState("");

  // Reset the form each time the modal opens so it never shows stale input.
  React.useEffect(() => {
    if (open) { setForm(EMPTY); setError(""); }
  }, [open]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = () => {
    const name = form.name.trim();
    const role = form.role.trim();
    if (!name || !role) {
      setError("Candidate name and role are both required.");
      return;
    }
    const total = FAMILY_TOPIC_TOTAL[form.family] || 14;
    onAdd?.({
      id: `c-${Date.now().toString(36)}`,
      name,
      initial: initialsOf(name),
      role,
      family: form.family,
      source: form.source,
      stage: "applied",
      screen: { status: "not_started", coverage: { covered: 0, total }, thin: null, completedAt: null },
      appliedAt: TODAY,
      lastActivity: "Application received",
    });
  };

  return (
    <Modal
      open={open}
      onDismiss={onClose}
      title="Add candidate"
      confirmLabel="Add candidate"
      cancelLabel="Cancel"
      onConfirm={submit}
      body={
        <div style={s.form}>
          <p style={s.intro}>
            Register an applicant into the pipeline. They start at <strong>Applied</strong>;
            run the AI screening when you're ready.
          </p>

          <Field label="Candidate name" htmlFor="add-cand-name">
            <input
              id="add-cand-name"
              type="text"
              className="recruiter-focusable"
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Priya Anand"
              aria-invalid={error && !form.name.trim() ? true : undefined}
              aria-describedby={error ? "add-cand-error" : undefined}
              style={s.input}
            />
          </Field>

          <Field label="Role applied for" htmlFor="add-cand-role">
            <input
              id="add-cand-role"
              type="text"
              className="recruiter-focusable"
              value={form.role}
              onChange={set("role")}
              placeholder="e.g. Tier 1 Support Advisor"
              aria-invalid={error && !form.role.trim() ? true : undefined}
              aria-describedby={error ? "add-cand-error" : undefined}
              style={s.input}
            />
          </Field>

          <div style={s.twoCol}>
            <Field label="Job family" htmlFor="add-cand-family">
              <select id="add-cand-family" className="recruiter-focusable" value={form.family} onChange={set("family")} style={s.input}>
                {Object.entries(FAMILY_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </Field>
            <Field label="Source" htmlFor="add-cand-source">
              <select id="add-cand-source" className="recruiter-focusable" value={form.source} onChange={set("source")} style={s.input}>
                {SOURCES.map((src) => <option key={src} value={src}>{src}</option>)}
              </select>
            </Field>
          </div>

          {error && <p id="add-cand-error" style={s.error} role="alert">{error}</p>}
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
