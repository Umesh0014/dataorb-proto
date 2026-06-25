"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Search, Check, ChevronDown } from "lucide-react";
import Button from "../Button";
import Select from "../Select";
import Toast from "../Toast";
import { CategoryChip } from "./GuidedWorkflowParts";
import {
  GW_AGENTS,
  GW_INTERACTIONS,
  GW_LANGUAGES,
  gwInteractionsByAgent,
  gwAgent,
} from "../mocks/guidedWorkflowDrivers";

// CreateWorkflowModal — review-before-publish create entry (Image 3).
// Two sources via a segmented control: a DataOrb interaction (default) or a
// pasted transcript. The interaction source pairs a searchable picker
// (positive-outcome calls only) with an AGENT filter that narrows the list,
// plus the workflow language. Generate is disabled until the source +
// language are valid; it has no backend — it closes with a toast and all
// state is in-memory.
//
// The form lives in a child mounted only while open, so its fields reset
// naturally on each open (no reset effect). The toast outlives the dialog,
// so it sits in the parent.

/* CreateWorkflowModal (tabs, interaction picker, agent filter, language) — paste Figma CSS */

const LANGUAGE_OPTIONS = GW_LANGUAGES.map((l) => ({ value: l.code, label: `${l.native} · ${l.label}` }));

const SOURCES = [
  { id: "interaction", label: "From a DataOrb interaction" },
  { id: "transcript", label: "From a transcript" },
];

export default function CreateWorkflowModal({ open, onClose, reason }) {
  const [toast, setToast] = React.useState(false);

  // Esc closes the dialog while it is open.
  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") { e.stopPropagation(); onClose?.(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Auto-dismiss the success toast.
  React.useEffect(() => {
    if (!toast) return undefined;
    const t = window.setTimeout(() => setToast(false), 3600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const handleGenerate = () => {
    onClose?.();
    setToast(true);
  };

  if (typeof document === "undefined") return null;

  return (
    <>
      {open &&
        createPortal(
          <div style={styles.scrim} onClick={onClose} role="presentation">
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Create a guided workflow"
              onClick={(e) => e.stopPropagation()}
              style={styles.panel}
            >
              <CreateWorkflowForm reason={reason} onCancel={onClose} onGenerate={handleGenerate} />
            </div>
          </div>,
          document.body,
        )}

      {toast &&
        createPortal(
          <Toast
            tone="success"
            message="Workflow draft generated — review it before it goes anywhere."
            onDismiss={() => setToast(false)}
          />,
          document.body,
        )}
    </>
  );
}

function CreateWorkflowForm({ reason, onCancel, onGenerate }) {
  const [tab, setTab] = React.useState("interaction");
  const [agentFilter, setAgentFilter] = React.useState(null); // null = all agents
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [interactionQuery, setInteractionQuery] = React.useState("");
  const [interactionId, setInteractionId] = React.useState(null);
  const [language, setLanguage] = React.useState("");
  const [transcript, setTranscript] = React.useState("");

  const selectedInteraction = interactionId
    ? GW_INTERACTIONS.find((i) => i.id === interactionId)
    : null;

  const filteredInteractions = React.useMemo(() => {
    const base = gwInteractionsByAgent(agentFilter);
    const q = interactionQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (i) =>
        i.contactReason.toLowerCase().includes(q) ||
        i.customer.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q),
    );
  }, [agentFilter, interactionQuery]);

  const canGenerate =
    Boolean(language) &&
    (tab === "interaction" ? Boolean(interactionId) : transcript.trim().length > 0);

  const pickAgent = (id) => {
    setAgentFilter(id);
    // Clear a selection that no longer belongs to the filtered agent.
    if (interactionId && id) {
      const sel = GW_INTERACTIONS.find((i) => i.id === interactionId);
      if (sel && sel.agentId !== id) setInteractionId(null);
    }
  };

  return (
    <>
      <div style={styles.head}>
        <h2 style={styles.title}>Create a guided workflow</h2>
        <p style={styles.subtitle}>
          Generate a path from a real conversation. You&apos;ll review it before it goes anywhere.
        </p>
        {reason && (
          <p style={styles.contextLine}>
            For contact reason: <strong style={styles.contextStrong}>{reason}</strong>
          </p>
        )}
      </div>

      {/* Segmented source switch */}
      <div style={styles.segment} role="tablist" aria-label="Workflow source">
        {SOURCES.map((s) => {
          const isActive = tab === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setTab(s.id)}
              style={{ ...styles.segmentBtn, ...(isActive ? styles.segmentBtnActive : null) }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {tab === "interaction" ? (
        <div style={styles.fields}>
          {/* Agent filter — the new requirement: narrow interactions by agent. */}
          <div style={styles.field}>
            <span style={styles.label}>Filter by agent</span>
            <div style={styles.agentChips}>
              <AgentChip label="All agents" active={agentFilter === null} onClick={() => pickAgent(null)} />
              {GW_AGENTS.map((a) => (
                <AgentChip
                  key={a.id}
                  label={a.short}
                  active={agentFilter === a.id}
                  onClick={() => pickAgent(a.id)}
                />
              ))}
            </div>
          </div>

          {/* Interaction picker — searchable, positive-outcome only. */}
          <div style={styles.field}>
            <span style={styles.label}>Interaction</span>
            <div style={styles.picker}>
              <button
                type="button"
                onClick={() => setPickerOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={pickerOpen}
                style={styles.pickerTrigger}
              >
                <span style={selectedInteraction ? styles.pickerValue : styles.pickerPlaceholder}>
                  {selectedInteraction
                    ? `${selectedInteraction.contactReason} — ${selectedInteraction.customer}`
                    : "Search interactions…"}
                </span>
                <ChevronDown
                  size={15}
                  color="var(--color-text-tertiary)"
                  style={{ flexShrink: 0, transform: pickerOpen ? "rotate(180deg)" : "none" }}
                  aria-hidden="true"
                />
              </button>

              {pickerOpen && (
                <div style={styles.pickerMenu} role="listbox" aria-label="Interactions">
                  <label style={styles.pickerSearch}>
                    <Search size={15} color="var(--color-text-placeholder)" aria-hidden="true" />
                    <input
                      type="text"
                      autoFocus
                      value={interactionQuery}
                      onChange={(e) => setInteractionQuery(e.target.value)}
                      placeholder="Search interactions…"
                      aria-label="Search interactions"
                      style={styles.pickerSearchInput}
                      className="gw-search-input"
                    />
                  </label>
                  <div style={styles.pickerList}>
                    {filteredInteractions.length > 0 ? (
                      filteredInteractions.map((i) => {
                        const agent = gwAgent(i.agentId);
                        const isSel = i.id === interactionId;
                        return (
                          <button
                            key={i.id}
                            type="button"
                            role="option"
                            aria-selected={isSel}
                            onClick={() => {
                              setInteractionId(i.id);
                              setPickerOpen(false);
                            }}
                            style={{ ...styles.pickerItem, background: isSel ? "var(--color-icon-tertiary-bg)" : "transparent" }}
                          >
                            <span style={styles.pickerItemTop}>
                              <span style={styles.pickerItemReason}>{i.contactReason}</span>
                              <CategoryChip category={i.lane} />
                              {isSel && <Check size={14} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />}
                            </span>
                            <span style={styles.pickerItemMeta}>
                              <span style={styles.id}>{i.id}</span>
                              <span style={styles.sep}>·</span>
                              {i.customer}
                              <span style={styles.sep}>·</span>
                              {agent?.short}
                              <span style={styles.sep}>·</span>
                              {i.language.toUpperCase()}
                            </span>
                            <span style={styles.pickerItemSnippet}>{i.snippet}</span>
                          </button>
                        );
                      })
                    ) : (
                      <p style={styles.pickerEmpty}>No positive-outcome calls match.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <span style={styles.helper}>
              Pick a call that already landed the outcome you want to standardise.
            </span>
          </div>

          <LanguageField value={language} onChange={setLanguage} />
        </div>
      ) : (
        <div style={styles.fields}>
          <div style={styles.field}>
            <span style={styles.label}>Transcript</span>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste a call transcript here…"
              aria-label="Transcript"
              style={styles.textarea}
              className="gw-search-input"
            />
            <span style={styles.helper}>
              Transcript ingestion is coming soon — paste any text to preview the flow.
            </span>
          </div>
          <LanguageField value={language} onChange={setLanguage} />
        </div>
      )}

      <div style={styles.footer}>
        <Button variant="text" uppercase={false} onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" uppercase={false} disabled={!canGenerate} onClick={onGenerate}>
          Generate workflow
        </Button>
      </div>
    </>
  );
}

function AgentChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{ ...styles.agentChip, ...(active ? styles.agentChipActive : null) }}
    >
      {label}
    </button>
  );
}

function LanguageField({ value, onChange }) {
  return (
    <div style={styles.field}>
      <span style={styles.label}>Language</span>
      <Select
        value={value}
        onChange={onChange}
        options={LANGUAGE_OPTIONS}
        placeholder="Choose the workflow language"
        ariaLabel="Workflow language"
        fullWidth
      />
      <span style={styles.helper}>
        The workflow will be generated in this language. 80+ supported (BCP-47).
      </span>
    </div>
  );
}

const styles = {
  scrim: {
    position: "fixed",
    inset: 0,
    zIndex: 60,
    background: "rgba(15, 18, 36, 0.48)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  panel: {
    width: "min(520px, 100%)",
    maxHeight: "calc(100vh - 48px)",
    overflowY: "auto",
    background: "#FFFFFF",
    borderRadius: 16,
    padding: 28,
    boxShadow: "var(--shadow-16)",
    fontFamily: "var(--font-sans)",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  head: { display: "flex", flexDirection: "column", gap: 6 },
  title: { margin: 0, fontSize: 20, fontWeight: 800, color: "var(--color-text-deep)", lineHeight: 1.3 },
  subtitle: { margin: 0, fontSize: 13.5, color: "var(--color-text-tertiary)", lineHeight: 1.5 },
  contextLine: { margin: 0, fontSize: 12.5, color: "var(--color-text-tertiary)" },
  contextStrong: { color: "var(--color-text-deep)", fontWeight: 700 },
  segment: {
    display: "flex",
    gap: 4,
    padding: 4,
    background: "var(--pill-bg)",
    borderRadius: 10,
  },
  segmentBtn: {
    flex: 1,
    height: 38,
    border: "none",
    background: "transparent",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
  },
  segmentBtnActive: {
    background: "var(--surface-white)",
    color: "var(--color-text-deep)",
    boxShadow: "var(--shadow-card)",
  },
  fields: { display: "flex", flexDirection: "column", gap: 18 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)" },
  helper: { fontSize: 12, color: "var(--color-text-tertiary)", lineHeight: 1.45 },
  agentChips: { display: "flex", flexWrap: "wrap", gap: 8 },
  agentChip: {
    height: 30,
    paddingInline: 12,
    borderRadius: 999,
    border: "1px solid var(--color-border-card-soft)",
    background: "var(--surface-white)",
    color: "var(--color-text-medium)",
    fontFamily: "inherit",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
  },
  agentChipActive: {
    background: "var(--color-icon-tertiary-bg)",
    border: "1px solid var(--color-icon-tertiary-fg)",
    color: "var(--color-icon-tertiary-fg)",
  },
  picker: { position: "relative" },
  pickerTrigger: {
    width: "100%",
    height: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: "0 14px",
    background: "var(--surface-white)",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 10,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  pickerValue: { fontSize: 13.5, fontWeight: 600, color: "var(--color-text-deep)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  pickerPlaceholder: { fontSize: 13.5, color: "var(--color-text-placeholder)" },
  pickerMenu: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    zIndex: 5,
    background: "var(--surface-white)",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 12,
    boxShadow: "var(--shadow-16)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  pickerSearch: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  pickerSearchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: "var(--font-sans)",
    fontSize: 13,
    color: "var(--color-text-deep)",
  },
  pickerList: { maxHeight: 244, overflowY: "auto", padding: 6, display: "flex", flexDirection: "column", gap: 2 },
  pickerItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "10px 12px",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
  },
  pickerItemTop: { display: "flex", alignItems: "center", gap: 8 },
  pickerItemReason: { fontSize: 13.5, fontWeight: 700, color: "var(--color-text-deep)", flex: 1, minWidth: 0 },
  pickerItemMeta: { display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--color-text-tertiary)", flexWrap: "wrap" },
  pickerItemSnippet: { fontSize: 12, color: "var(--color-text-tertiary)", lineHeight: 1.45 },
  id: { fontFamily: "var(--font-mono)" },
  sep: { color: "var(--color-text-placeholder)" },
  pickerEmpty: { fontSize: 13, color: "var(--color-text-tertiary)", padding: "12px 10px" },
  textarea: {
    width: "100%",
    minHeight: 120,
    resize: "vertical",
    padding: "12px 14px",
    background: "var(--surface-white)",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 10,
    fontFamily: "var(--font-sans)",
    fontSize: 13.5,
    color: "var(--color-text-deep)",
    outline: "none",
    boxSizing: "border-box",
  },
  footer: { display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 4 },
};
