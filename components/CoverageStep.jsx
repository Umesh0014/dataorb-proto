"use client";

import React from "react";
import { ChevronDown, X, Plus } from "lucide-react";
import { COVERAGE_DRIVERS, CONTACT_REASONS } from "./mocks/missionCoverage";
import ContactReasonsPanel from "./ContactReasonsPanel";

// CoverageStep — step 2 body of the Create Mission wizard.
//
// Owns the local UI state that is *not* part of the persisted draft:
//   - which driver pill is currently active (tab-strip behavior)
//   - whether the Contact Reasons side panel is open
//   - the "too many drivers" toast flash
//   - the multi-select dropdown open/close
//
// Reads `coverage` off the wizard draft, writes changes back via
// `onChange(nextCoverage)`. The wizard owner persists / passes through
// to its `missionDraft.coverage` slot.

const MAX_DRIVERS = 3;
const REASON_CAP_PER_DRIVER = 50;

export default function CoverageStep({ draft, onChange }) {
  const coverage = draft.coverage || { drivers: [] };
  const setCoverage = (next) => onChange({ ...draft, coverage: next });

  const [activeDriverId, setActiveDriverId] = React.useState(
    coverage.drivers[0]?.id ?? null,
  );
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [maxReachedFlash, setMaxReachedFlash] = React.useState(false);
  const pickerRef = React.useRef(null);

  // Keep activeDriverId in sync if the active driver gets removed.
  React.useEffect(() => {
    if (coverage.drivers.length === 0) {
      if (activeDriverId !== null) setActiveDriverId(null);
      return;
    }
    if (!coverage.drivers.some((d) => d.id === activeDriverId)) {
      setActiveDriverId(coverage.drivers[0].id);
    }
  }, [coverage.drivers, activeDriverId]);

  React.useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

  React.useEffect(() => {
    if (!maxReachedFlash) return;
    const t = setTimeout(() => setMaxReachedFlash(false), 2200);
    return () => clearTimeout(t);
  }, [maxReachedFlash]);

  const selectedIds = new Set(coverage.drivers.map((d) => d.id));
  const activeDriver = coverage.drivers.find((d) => d.id === activeDriverId) || null;

  const toggleDriver = (driver) => {
    if (selectedIds.has(driver.id)) {
      // unchecking removes the driver
      removeDriver(driver.id, true);
      return;
    }
    if (coverage.drivers.length >= MAX_DRIVERS) {
      setMaxReachedFlash(true);
      return;
    }
    const next = {
      ...coverage,
      drivers: [...coverage.drivers, { id: driver.id, label: driver.label, reasons: [] }],
    };
    setCoverage(next);
    if (!activeDriverId) setActiveDriverId(driver.id);
  };

  const removeDriver = (driverId, skipConfirm = false) => {
    const target = coverage.drivers.find((d) => d.id === driverId);
    if (!target) return;
    if (!skipConfirm && target.reasons.length > 0) {
      // TODO: destructive-confirm dialog primitive — fallback to
      // native confirm until a shared dialog exists in the prototype.
      const ok =
        typeof window !== "undefined"
          ? window.confirm(
              `Remove "${target.label}"? Its ${target.reasons.length} contact reason${
                target.reasons.length === 1 ? "" : "s"
              } will be cleared.`,
            )
          : true;
      if (!ok) return;
    }
    setCoverage({
      ...coverage,
      drivers: coverage.drivers.filter((d) => d.id !== driverId),
    });
  };

  const addReasonToActive = (reason) => {
    if (!activeDriver) return;
    if (activeDriver.reasons.some((r) => r.id === reason.id)) return;
    if (activeDriver.reasons.length >= REASON_CAP_PER_DRIVER) return;
    setCoverage({
      ...coverage,
      drivers: coverage.drivers.map((d) =>
        d.id === activeDriver.id
          ? { ...d, reasons: [...d.reasons, { id: reason.id, label: reason.label }] }
          : d,
      ),
    });
  };

  const addManyReasonsToActive = (reasons) => {
    if (!activeDriver || reasons.length === 0) return;
    const existing = new Set(activeDriver.reasons.map((r) => r.id));
    const toAdd = reasons
      .filter((r) => !existing.has(r.id))
      .slice(0, REASON_CAP_PER_DRIVER - activeDriver.reasons.length);
    if (toAdd.length === 0) return;
    setCoverage({
      ...coverage,
      drivers: coverage.drivers.map((d) =>
        d.id === activeDriver.id
          ? {
              ...d,
              reasons: [
                ...d.reasons,
                ...toAdd.map((r) => ({ id: r.id, label: r.label })),
              ],
            }
          : d,
      ),
    });
  };

  const removeReasonFromActive = (reasonId) => {
    if (!activeDriver) return;
    setCoverage({
      ...coverage,
      drivers: coverage.drivers.map((d) =>
        d.id === activeDriver.id
          ? { ...d, reasons: d.reasons.filter((r) => r.id !== reasonId) }
          : d,
      ),
    });
  };

  const numSelected = coverage.drivers.length;
  const helperText =
    numSelected === 0
      ? `0 of ${MAX_DRIVERS} drivers selected`
      : numSelected < MAX_DRIVERS
        ? `${numSelected} of ${MAX_DRIVERS} drivers selected`
        : `${MAX_DRIVERS} drivers selected. Remove one to replace`;

  return (
    <>
      <div style={csStyles.titleBlock}>
        <div style={csStyles.title}>Mission Coverage</div>
        <div style={csStyles.subtitle}>
          Define the real world scenarios that agents should practice
        </div>
      </div>

      <div style={csStyles.body}>
        <div ref={pickerRef} style={csStyles.pickerWrap}>
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            style={csStyles.pickerTrigger}
            aria-haspopup="listbox"
            aria-expanded={pickerOpen}
          >
            <span style={csStyles.pickerPlaceholder}>Select up to 3 drivers</span>
            <ChevronDown size={18} color="var(--color-text-tertiary)" />
          </button>
          {pickerOpen && (
            <div role="listbox" style={csStyles.pickerMenu}>
              {COVERAGE_DRIVERS.map((d) => {
                const checked = selectedIds.has(d.id);
                const blocked = !checked && numSelected >= MAX_DRIVERS;
                return (
                  <label
                    key={d.id}
                    style={{
                      ...csStyles.pickerOption,
                      color: blocked
                        ? "var(--color-text-placeholder)"
                        : "var(--color-text-deep)",
                      cursor: blocked ? "default" : "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={blocked}
                      onChange={() => toggleDriver(d)}
                      style={csStyles.checkbox}
                    />
                    {d.label}
                  </label>
                );
              })}
            </div>
          )}
          {maxReachedFlash && (
            <div role="status" style={csStyles.maxReachedToast}>
              A maximum of 3 drivers can be added to a mission.
            </div>
          )}
        </div>

        <div style={csStyles.helperText}>{helperText}</div>

        {coverage.drivers.length > 0 && (
          <div style={csStyles.pillRow}>
            {coverage.drivers.map((d) => {
              const isActive = d.id === activeDriverId;
              return (
                <span
                  key={d.id}
                  style={{
                    ...csStyles.pill,
                    ...(isActive ? csStyles.pillActive : null),
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveDriverId(d.id)}
                    style={{
                      ...csStyles.pillLabelBtn,
                      color: isActive
                        ? "var(--color-button-primary-fg)"
                        : "var(--color-text-deep)",
                    }}
                  >
                    {d.label}
                  </button>
                  <span
                    style={{
                      ...csStyles.pillCount,
                      ...(isActive ? csStyles.pillCountActive : null),
                    }}
                  >
                    {d.reasons.length === 0 ? "--" : d.reasons.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDriver(d.id)}
                    aria-label={`Remove ${d.label}`}
                    style={{
                      ...csStyles.pillRemoveBtn,
                      color: isActive
                        ? "var(--color-button-primary-fg)"
                        : "var(--color-text-tertiary)",
                    }}
                  >
                    <X size={14} />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {activeDriver ? (
          activeDriver.reasons.length === 0 ? (
            <DriverEmptyState
              driver={activeDriver}
              onAddReason={() => setPanelOpen(true)}
            />
          ) : (
            <DriverFilledState
              driver={activeDriver}
              onAddReason={() => setPanelOpen(true)}
              onRemoveReason={removeReasonFromActive}
            />
          )
        ) : null}
      </div>

      <ContactReasonsPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        catalogue={CONTACT_REASONS}
        activeDriverReasonIds={activeDriver?.reasons.map((r) => r.id) ?? []}
        onAddReason={addReasonToActive}
        onAddManyReasons={addManyReasonsToActive}
      />
    </>
  );
}

function DriverEmptyState({ driver, onAddReason }) {
  return (
    <div style={csStyles.driverEmpty}>
      <div style={csStyles.driverEmptyInner}>
        <div style={csStyles.driverEmptyHeading}>{driver.label} driver</div>
        <div style={csStyles.driverEmptyBody}>
          Add at least one contact reason to continue.
        </div>
        <button
          type="button"
          onClick={onAddReason}
          style={csStyles.driverEmptyCta}
        >
          <Plus size={16} />
          <span>Contact Reason</span>
        </button>
      </div>
    </div>
  );
}

function DriverFilledState({ driver, onAddReason, onRemoveReason }) {
  return (
    <div style={csStyles.driverCard}>
      <div style={csStyles.driverCardHeader}>
        <div style={csStyles.driverCardTitle}>
          <span>{driver.label} driver</span>
          <span style={csStyles.driverCardCount}>
            {driver.reasons.length}/{REASON_CAP_PER_DRIVER}
          </span>
        </div>
        <button
          type="button"
          onClick={onAddReason}
          style={csStyles.driverCardCta}
        >
          <Plus size={16} />
          <span>Contact Reason</span>
        </button>
      </div>
      <div style={csStyles.driverCardDivider} aria-hidden="true" />
      <div style={csStyles.driverCardBody}>
        {driver.reasons.map((r) => (
          <span key={r.id} style={csStyles.reasonChip}>
            <span style={csStyles.reasonChipLabel}>{r.label}</span>
            <button
              type="button"
              onClick={() => onRemoveReason(r.id)}
              aria-label={`Remove ${r.label}`}
              style={csStyles.reasonChipRemove}
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// Validation helper for the wizard owner's isStepValid.
export function isCoverageValid(draft) {
  const drivers = draft.coverage?.drivers ?? [];
  if (drivers.length < 1 || drivers.length > MAX_DRIVERS) return false;
  return drivers.every((d) => d.reasons.length >= 1);
}

// Demo seed — three drivers, the first with one reason. Step 2 Next
// stays disabled (validation) because two drivers still have 0 reasons.
export const DEMO_DRAFT_COVERAGE = {
  drivers: [
    {
      id: "billing",
      label: "Billing and payment",
      reasons: [{ id: "cr-001", label: "Request Payment Extension" }],
    },
    { id: "retention", label: "Retention and Churn", reasons: [] },
    { id: "digital",   label: "Digital Support",     reasons: [] },
  ],
};

const csStyles = {
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

  body: { display: "flex", flexDirection: "column", gap: 16 },

  // Multi-select picker
  pickerWrap: { position: "relative", maxWidth: 360 },
  pickerTrigger: {
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
  pickerPlaceholder: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    color: "var(--color-text-placeholder)",
  },
  pickerMenu: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 8,
    boxShadow:
      "0px 5px 5px -3px rgba(0,0,0,0.20), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)",
    zIndex: 60,
    overflow: "hidden",
    maxHeight: 280,
    overflowY: "auto",
  },
  pickerOption: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    lineHeight: 1.4,
  },
  checkbox: { width: 16, height: 16, accentColor: "var(--color-button-primary-bg)" },
  maxReachedToast: {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    background: "var(--color-text-deep)",
    color: "var(--surface-white)",
    padding: "8px 12px",
    borderRadius: 6,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    zIndex: 70,
    whiteSpace: "nowrap",
  },

  helperText: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.4,
  },

  // Driver pills
  pillRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 32,
    paddingInline: 16,
    borderRadius: 999,
    background: "var(--pill-bg)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 600,
  },
  pillActive: { background: "var(--color-icon-tertiary-fg)" },
  pillLabelBtn: {
    border: "none",
    background: "transparent",
    fontFamily: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
    cursor: "pointer",
    padding: 0,
  },
  pillCount: {
    display: "inline-grid",
    placeItems: "center",
    minWidth: 24,
    height: 20,
    paddingInline: 6,
    borderRadius: 999,
    background: "var(--surface-white)",
    color: "var(--color-text-tertiary)",
    fontSize: 11,
    fontWeight: 700,
  },
  pillCountActive: {
    background: "rgba(255, 255, 255, 0.2)",
    color: "var(--color-button-primary-fg)",
  },
  pillRemoveBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    display: "inline-grid",
    placeItems: "center",
  },

  // Driver empty state (dashed)
  driverEmpty: {
    flex: 1,
    display: "flex",
    minHeight: 220,
    border: "1px dashed var(--color-button-primary-bg)",
    borderRadius: 12,
    background: "var(--color-card-emoji-bg)",
    padding: 24,
    boxSizing: "border-box",
  },
  driverEmptyInner: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    textAlign: "center",
  },
  driverEmptyHeading: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 15,
    fontWeight: 700,
    color: "var(--color-text-medium)",
  },
  driverEmptyBody: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    color: "var(--color-text-tertiary)",
    marginBottom: 8,
  },
  driverEmptyCta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    border: "none",
    color: "var(--color-button-primary-bg)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },

  // Driver filled state
  driverCard: {
    border: "1px solid var(--color-divider-card)",
    borderRadius: 12,
    background: "var(--surface-white)",
    overflow: "hidden",
  },
  driverCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 20px",
  },
  driverCardTitle: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  driverCardCount: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 700,
    padding: "2px 10px",
    borderRadius: 999,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-button-primary-bg)",
  },
  driverCardCta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "transparent",
    border: "none",
    color: "var(--color-button-primary-bg)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    padding: 0,
  },
  driverCardDivider: { height: 1, background: "var(--color-divider-card)" },
  driverCardBody: {
    padding: 20,
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    minHeight: 96,
  },
  reasonChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    paddingInline: 12,
    height: 30,
    borderRadius: 6,
    background: "var(--color-card-emoji-bg)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    color: "var(--color-text-deep)",
    fontWeight: 500,
  },
  reasonChipLabel: { lineHeight: 1 },
  reasonChipRemove: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    display: "inline-grid",
    placeItems: "center",
    color: "var(--color-text-tertiary)",
  },
};
