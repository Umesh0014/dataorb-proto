"use client";

import React from "react";
import { ChevronDown, Trash2, Plus } from "lucide-react";
import { FOCUS_AREAS } from "./mocks/missionFocusAreas";

// FocusAreaStep — step 3 body of the Create Mission wizard.
//
// Table-like list of editable rows. Each row maps to one quality metric
// (focus area) and its target threshold (50-100, default 80). Reads
// `draft.focusArea.rows` and writes back via `onChange`. Catalogue is
// fixture-driven; duplicate focus areas across rows are prevented by
// muting already-selected options in each row's dropdown.

const TARGET_MIN = 50;
const TARGET_MAX = 100;
const TARGET_DEFAULT = 80;

function emptyRow() {
  return {
    id: `fa-row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    focusAreaId: null,
    target: TARGET_DEFAULT,
  };
}

export default function FocusAreaStep({
  draft,
  onChange,
  title = "Focus Area",
  subtitle = "Set the quality metrics agents should hit",
  maxRows = Infinity,
}) {
  const focusArea = draft.focusArea || { rows: [] };
  const rows = focusArea.rows;
  const atMax = rows.length >= maxRows;

  // First mount: seed exactly one empty row if none exist (initial
  // state per spec). Subsequent removals leave the user with zero rows
  // and only the "+ Add Focus Area" affordance.
  React.useEffect(() => {
    if (!focusArea.rows) {
      onChange({ ...draft, focusArea: { rows: [emptyRow()] } });
    } else if (focusArea.rows.length === 0 && !focusArea.userClearedAll) {
      onChange({
        ...draft,
        focusArea: { rows: [emptyRow()], userClearedAll: false },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setRows = (next, opts = {}) => {
    onChange({
      ...draft,
      focusArea: {
        ...focusArea,
        rows: next,
        userClearedAll: opts.userClearedAll ?? focusArea.userClearedAll ?? false,
      },
    });
  };

  // Any edit drops the AI-suggested flag — the user has touched the row.
  const updateRow = (id, patch) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch, suggested: false } : r)));

  const removeRow = (id) => {
    const next = rows.filter((r) => r.id !== id);
    setRows(next, { userClearedAll: next.length === 0 });
  };

  const addRow = () => setRows([...rows, emptyRow()], { userClearedAll: false });

  const selectedIds = new Set(rows.map((r) => r.focusAreaId).filter(Boolean));

  return (
    <>
      <div style={faStyles.titleBlock}>
        <div style={faStyles.title}>{title}</div>
        <div style={faStyles.subtitle}>{subtitle}</div>
      </div>

      <div style={faStyles.table}>
        <div style={faStyles.thead}>
          <div style={faStyles.thFocus}>Focus Area</div>
          <div style={faStyles.thTarget}>Target</div>
        </div>

        {rows.map((row) => (
          <FocusAreaRow
            key={row.id}
            row={row}
            selectedIds={selectedIds}
            showSuggested={Boolean(row.suggested)}
            onChangeFocus={(focusAreaId) => updateRow(row.id, { focusAreaId })}
            onChangeTarget={(target) => updateRow(row.id, { target })}
            onRemove={() => removeRow(row.id)}
          />
        ))}

        <div style={faStyles.addRow}>
          <button
            type="button"
            onClick={addRow}
            disabled={atMax}
            style={{
              ...faStyles.addBtn,
              cursor: atMax ? "default" : "pointer",
              opacity: atMax ? 0.5 : 1,
            }}
          >
            <Plus size={16} />
            <span>Add Focus Area</span>
          </button>
          {atMax && Number.isFinite(maxRows) && (
            <span style={faStyles.maxCaption}>
              Maximum {maxRows} focus areas per task.
            </span>
          )}
        </div>
      </div>
    </>
  );
}

function FocusAreaRow({
  row,
  selectedIds,
  showSuggested,
  onChangeFocus,
  onChangeTarget,
  onRemove,
}) {
  return (
    <div style={faStyles.row}>
      <div style={faStyles.cellFocus}>
        <FocusAreaDropdown
          value={row.focusAreaId}
          onChange={onChangeFocus}
          excluded={selectedIds}
        />
        {showSuggested && <span style={faStyles.suggestedChip}>Suggested</span>}
      </div>
      <div style={faStyles.cellTarget}>
        <TargetControl value={row.target} onChange={onChangeTarget} />
      </div>
      <div style={faStyles.cellAction}>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove focus area"
          style={faStyles.trashBtn}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

function FocusAreaDropdown({ value, onChange, excluded }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const selected = value ? FOCUS_AREAS.find((f) => f.id === value) : null;

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={faStyles.ddWrap}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={faStyles.ddTrigger}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          style={{
            ...faStyles.ddValue,
            color: selected
              ? "var(--color-text-deep)"
              : "var(--color-text-placeholder)",
          }}
        >
          {selected ? selected.label : "Select focus area"}
        </span>
        <ChevronDown size={18} color="var(--color-text-tertiary)" />
      </button>
      {open && (
        <div role="listbox" style={faStyles.ddMenu}>
          {FOCUS_AREAS.map((opt) => {
            const isSelf = opt.id === value;
            const isExcluded = !isSelf && excluded.has(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                disabled={isExcluded}
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                style={{
                  ...faStyles.ddOption,
                  fontWeight: isSelf ? 600 : 400,
                  color: isExcluded
                    ? "var(--color-text-placeholder)"
                    : "var(--color-text-deep)",
                  cursor: isExcluded ? "default" : "pointer",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TargetControl({ value, onChange }) {
  const [draftText, setDraftText] = React.useState(String(value));

  React.useEffect(() => {
    setDraftText(String(value));
  }, [value]);

  const clamp = (n) => Math.min(TARGET_MAX, Math.max(TARGET_MIN, n));
  const pct = ((value - TARGET_MIN) / (TARGET_MAX - TARGET_MIN)) * 100;

  const commitText = () => {
    const n = parseInt(draftText, 10);
    if (Number.isFinite(n)) {
      onChange(clamp(n));
    } else {
      setDraftText(String(value));
    }
  };

  const handleText = (e) => {
    const next = e.target.value.replace(/[^\d]/g, "");
    setDraftText(next);
    if (next === "") return;
    const n = parseInt(next, 10);
    if (Number.isFinite(n) && n >= TARGET_MIN && n <= TARGET_MAX) {
      onChange(n);
    }
  };

  return (
    <div style={faStyles.targetRow}>
      <div style={faStyles.sliderColumn}>
        <input
          type="range"
          min={TARGET_MIN}
          max={TARGET_MAX}
          step={1}
          value={value}
          onChange={(e) => onChange(clamp(parseInt(e.target.value, 10)))}
          style={{
            ...faStyles.slider,
            background: `linear-gradient(to right, var(--color-icon-tertiary-fg) 0%, var(--color-icon-tertiary-fg) ${pct}%, var(--color-divider-card) ${pct}%, var(--color-divider-card) 100%)`,
          }}
          aria-label="Target"
        />
        <div style={faStyles.sliderEnds}>
          <span>{TARGET_MIN}</span>
          <span>{TARGET_MAX}</span>
        </div>
      </div>
      <div style={faStyles.numberWrap}>
        <input
          type="text"
          inputMode="numeric"
          value={draftText}
          onChange={handleText}
          onBlur={commitText}
          aria-label="Target percentage"
          style={faStyles.numberInput}
        />
        <span style={faStyles.numberSuffix}>%</span>
      </div>
    </div>
  );
}

export function isFocusAreaValid(draft) {
  const rows = draft.focusArea?.rows ?? [];
  const ids = rows.map((r) => r.focusAreaId).filter(Boolean);
  if (ids.length < 1) return false;
  if (new Set(ids).size !== ids.length) return false;
  return true;
}

// Demo seed — single row with the screenshot-reference selection.
export const DEMO_DRAFT_FOCUS_AREA = {
  rows: [
    {
      id: "fa-row-demo-1",
      focusAreaId: "fa-refund-extension",
      target: 80,
    },
  ],
};

const faStyles = {
  titleBlock: { display: "flex", flexDirection: "column", gap: 4 },
  title: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 20,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
  },
  subtitle: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.5,
  },

  table: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  thead: {
    display: "grid",
    gridTemplateColumns: "320px 1fr 56px",
    columnGap: 24,
    alignItems: "center",
    height: 48,
    paddingInline: 20,
    background: "var(--color-card-emoji-bg)",
    borderRadius: 6,
    marginBottom: 8,
  },
  thFocus: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  thTarget: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },

  row: {
    display: "grid",
    gridTemplateColumns: "320px 1fr 56px",
    columnGap: 24,
    alignItems: "center",
    paddingBlock: 12,
    paddingInline: 20,
    borderBottom: "1px solid var(--color-divider-card)",
  },
  cellFocus: { minWidth: 0, display: "flex", flexDirection: "column", gap: 6 },
  suggestedChip: {
    alignSelf: "flex-start",
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: 999,
    background: "var(--color-primary-alpha-12)",
    color: "var(--color-button-primary-bg)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.02em",
  },
  maxCaption: {
    marginLeft: 12,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    color: "var(--color-text-tertiary)",
  },
  cellTarget: { minWidth: 0 },
  cellAction: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  // Dropdown
  ddWrap: { position: "relative", width: "100%" },
  ddTrigger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 44,
    padding: "0 16px",
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    cursor: "pointer",
  },
  ddValue: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.4,
  },
  ddMenu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 8,
    boxShadow: "var(--shadow-8)",
    zIndex: 60,
    overflow: "hidden",
    maxHeight: 280,
    overflowY: "auto",
  },
  ddOption: {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "12px 16px",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    border: "none",
    background: "transparent",
  },

  // Target control
  targetRow: { display: "flex", alignItems: "center", gap: 24 },
  sliderColumn: { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  slider: {
    width: "100%",
    height: 6,
    borderRadius: 999,
    appearance: "none",
    WebkitAppearance: "none",
    outline: "none",
    cursor: "pointer",
  },
  sliderEnds: {
    display: "flex",
    justifyContent: "space-between",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    color: "var(--color-text-tertiary)",
  },
  numberWrap: {
    display: "flex",
    alignItems: "center",
    width: 96,
    height: 44,
    border: "1px solid var(--color-divider-card)",
    borderRadius: 8,
    background: "var(--surface-white)",
    paddingInline: 12,
    boxSizing: "border-box",
    flexShrink: 0,
  },
  numberInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    background: "transparent",
    width: "100%",
    minWidth: 0,
  },
  numberSuffix: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    marginLeft: 4,
  },

  // Trash button
  trashBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    color: "var(--color-text-tertiary)",
  },

  // Add row affordance
  addRow: { paddingBlock: 16, paddingInline: 20 },
  addBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    border: "none",
    color: "var(--color-text-medium)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },
};
