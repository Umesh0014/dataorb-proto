"use client";

import React from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, AlertCircle } from "lucide-react";
import Button from "./Button";
import { RingInput } from "./CreditsUsageParts";

// BucketsManagerDialog — the "Scrollable" iteration's single editing surface.
// Every tier is one editable line item (name + weekly cap + member count), with
// one marked as the default new agents drop into. "Add tier" appends a blank
// row; Save hands the whole list back so the page rebuilds the buckets and
// reassigns agents off any removed tier to the default. Validates inline: a
// blank name, a duplicate name, a duplicate cap, or an out-of-range cap blocks
// Save. Replaces the per-card pencil flow for this layout.
const ROW_GRID = "minmax(150px, 1fr) 132px 70px 58px 36px";
const WEEK_MIN = 10080;
const norm = (s) => (s || "").trim().toLowerCase();

export default function BucketsManagerDialog({ open, buckets, maxBuckets = 10, seedCap = null, onClose, onSave }) {
  const [rows, setRows] = React.useState([]);
  const [defaultKey, setDefaultKey] = React.useState(0);

  // Seed one row per tier each time it opens (the existing default is the tier
  // carrying the note badge). A `seedCap` appends a blank row pre-filled to that
  // cap — the recommendation's "Create bucket" entry point. Row keys are the
  // index here; new rows take max(key)+1 so removed keys never recur.
  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      const seeded = buckets.map((b, i) => ({ key: i, id: b.id, name: b.name, capMin: b.capMin, agentCount: b.agentCount }));
      if (seedCap && seeded.length < maxBuckets) seeded.push({ key: seeded.length, name: "", capMin: seedCap, agentCount: 0 });
      setRows(seeded);
      const def = buckets.findIndex((b) => b.note);
      setDefaultKey(def >= 0 ? def : 0);
    }
  }

  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose?.(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const setField = (key, patch) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const addRow = () =>
    setRows((rs) => {
      if (rs.length >= maxBuckets) return rs;
      const key = rs.reduce((m, r) => Math.max(m, r.key), -1) + 1;
      return [...rs, { key, name: "", capMin: 30, agentCount: 0 }];
    });
  const removeRow = (key) => {
    if (rows.length <= 1) return;
    if (defaultKey === key) setDefaultKey(rows.find((r) => r.key !== key).key);
    setRows((rs) => rs.filter((r) => r.key !== key));
  };

  // Inline validation: blank / duplicate name, duplicate cap, out-of-range cap.
  const errors = {};
  rows.forEach((r) => {
    const name = norm(r.name);
    if (!name) errors[r.key] = "Enter a tier name.";
    else if (rows.some((o) => o.key !== r.key && norm(o.name) === name)) errors[r.key] = "A tier with this name already exists.";
    else if (!r.capMin || r.capMin < 1) errors[r.key] = "Weekly cap must be at least 1 minute.";
    else if (r.capMin > WEEK_MIN) errors[r.key] = "Weekly cap can't exceed a week (10,080 min).";
    else if (rows.some((o) => o.key !== r.key && o.capMin === r.capMin)) errors[r.key] = "A tier with this weekly cap already exists.";
  });
  const hasErrors = Object.keys(errors).length > 0;

  const save = () => {
    if (hasErrors) return;
    const defaultIndex = Math.max(0, rows.findIndex((r) => r.key === defaultKey));
    onSave(rows.map((r) => ({ id: r.id, name: r.name, capMin: r.capMin })), defaultIndex);
    onClose();
  };

  return createPortal(
    <div style={styles.scrim} onClick={onClose} role="presentation">
      <div role="dialog" aria-modal="true" aria-label="Manage tiers" onClick={(e) => e.stopPropagation()} style={styles.panel}>
        <header style={styles.head}>
          <div style={styles.headText}>
            <h2 style={styles.title}>Manage tiers</h2>
            <p style={styles.sub}>Edit each tier&apos;s name and weekly cap, mark the default new agents drop into, or add a tier.</p>
          </div>
          <Button variant="icon" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </Button>
        </header>

        <div style={styles.body}>
          <div style={{ ...styles.row, ...styles.headRow }}>
            <span style={styles.th}>Tier name</span>
            <span style={styles.th}>Weekly cap</span>
            <span style={styles.th}>Agents</span>
            <span style={styles.th}>Default</span>
            <span aria-hidden="true" />
          </div>
          {rows.map((r) => {
            const err = errors[r.key];
            return (
              <div key={r.key} style={styles.rowWrap}>
                <div style={styles.row}>
                  <input
                    type="text"
                    value={r.name}
                    onChange={(e) => setField(r.key, { name: e.target.value })}
                    placeholder="e.g. Momentum"
                    aria-label="Tier name"
                    style={{ ...styles.nameInput, borderColor: err ? "var(--color-error)" : "var(--color-border-card-soft)" }}
                  />
                  <RingInput value={r.capMin} onChange={(v) => setField(r.key, { capMin: v })} suffix="min / wk" ariaLabel="Weekly cap in minutes" width={48} />
                  <span style={styles.agentCount}>{(r.agentCount || 0).toLocaleString()}</span>
                  <label style={styles.radioWrap}>
                    <input
                      type="radio"
                      name="bm-default-tier"
                      checked={defaultKey === r.key}
                      onChange={() => setDefaultKey(r.key)}
                      aria-label={`Make ${r.name || "this tier"} the default`}
                      style={styles.radio}
                    />
                  </label>
                  <Button variant="icon" aria-label={`Remove ${r.name || "tier"}`} disabled={rows.length <= 1} onClick={() => removeRow(r.key)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
                {err && (
                  <span style={styles.rowError}>
                    <AlertCircle size={13} /> {err}
                  </span>
                )}
              </div>
            );
          })}
          <Button
            variant="text"
            uppercase={false}
            leadingIcon={<Plus size={16} />}
            onClick={addRow}
            disabled={rows.length >= maxBuckets}
            style={styles.addBtn}
          >
            Add tier
          </Button>
          <span style={styles.hint}>Removing a tier moves its agents to the default tier. New agents always start in the default.</span>
        </div>

        <footer style={styles.foot}>
          <span style={styles.footLead}>
            <strong style={styles.footCount}>{rows.length}</strong> {rows.length === 1 ? "tier" : "tiers"}
            {rows.length >= maxBuckets && <span style={styles.footMax}> · max reached</span>}
          </span>
          <div style={styles.footRight}>
            <Button variant="text" uppercase={false} onClick={onClose}>Cancel</Button>
            <Button variant="primary" disabled={hasErrors} onClick={save} style={{ height: 40, paddingInline: 22 }}>Save tiers</Button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

const styles = {
  scrim: {
    position: "fixed",
    inset: 0,
    background: "rgba(17, 17, 26, 0.42)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 80,
  },
  panel: {
    width: "min(660px, 100%)",
    maxHeight: "86vh",
    display: "flex",
    flexDirection: "column",
    background: "#FFFFFF",
    borderRadius: 16,
    border: "1px solid var(--color-border-card-soft)",
    boxShadow: "0 24px 64px -20px rgba(17,17,26,0.45)",
    overflow: "hidden",
  },
  head: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    padding: "20px 24px 14px",
  },
  headText: { display: "flex", flexDirection: "column", gap: 4 },
  title: { margin: 0, fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)" },
  sub: { margin: 0, fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: "6px 24px 16px",
    overflowY: "auto",
  },
  row: { display: "grid", gridTemplateColumns: ROW_GRID, alignItems: "center", gap: 12 },
  rowWrap: { display: "flex", flexDirection: "column", gap: 4 },
  headRow: { paddingBottom: 2, borderBottom: "1px solid var(--color-border-card-soft)" },
  th: { fontSize: 11, fontWeight: 700, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em" },
  nameInput: {
    width: "100%",
    height: 38,
    padding: "0 12px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    outline: "none",
    boxSizing: "border-box",
  },
  agentCount: { fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", fontVariantNumeric: "tabular-nums" },
  radioWrap: { display: "inline-flex", alignItems: "center", justifyContent: "center" },
  radio: { width: 16, height: 16, accentColor: "var(--do-brand-blue)", cursor: "pointer" },
  rowError: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-error)",
  },
  addBtn: {
    alignSelf: "flex-start",
    height: 38,
    paddingInline: 14,
    marginTop: 2,
    border: "1.5px dashed var(--color-divider-card)",
    borderRadius: 10,
    color: "var(--color-text-tertiary)",
  },
  hint: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  foot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "14px 24px",
    borderTop: "1px solid var(--color-border-card-soft)",
  },
  footLead: { fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)" },
  footCount: { fontWeight: 700, color: "var(--color-text-deep)" },
  footMax: { color: "var(--color-text-tertiary)" },
  footRight: { display: "flex", alignItems: "center", gap: 8 },
};
