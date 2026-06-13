"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import MultiLineInput from "./MultiLineInput";
import RoleplayBreadcrumb from "./RoleplayBreadcrumb";
import { lhWizard, lhCategory, lhDifficulty, lhLanguageName, lhDir } from "./learningHubLocale";

const ROLEPLAY_CATEGORIES = ["Sales", "Retention", "Service", "Technical Support"];
const PERSONA_LANGUAGES = ["English (UK)", "English (US)", "Spanish", "German", "French"];
const COMPLEXITY_OPTIONS = ["Complex", "Moderate", "Simple"];
const DURATION_MIN = 2;
const DURATION_MAX = 15;
const REASON_MAX = 100;
const OBJECTIVE_MAX = 500;

// NewRoleplayPage — Step 1 of the New Roleplay wizard ("Enter Persona
// Details"). Controlled component: form values come from `value` and
// flow back via `onChange`. The wizard owner (app/page.jsx) keeps the
// state so navigating between Step 1 and Step 2 preserves data both
// directions.
//
// Footer Cancel / Next sits inside the form Card (not viewport-sticky).
// Next is disabled until every required field has a value.
export default function NewRoleplayPage({ value, onChange, onCancel, onNext, onViewSample, locale = "en" }) {
  const setField = (key) => (next) => onChange({ ...value, [key]: next });
  const { category, language, reason, objective, complexity, duration } = value;
  const t = (key) => lhWizard(locale, key);
  const isRtl = lhDir(locale) === "rtl";

  const isValid =
    category &&
    language &&
    reason.trim().length > 0 &&
    objective.trim().length > 0 &&
    complexity &&
    duration >= DURATION_MIN &&
    duration <= DURATION_MAX;

  const submit = () => {
    if (!isValid) return;
    onNext?.();
  };

  return (
    <div style={nrStyles.page}>
      <Card padX={32} padY={32} style={nrStyles.formCard}>
        <RoleplayBreadcrumb active="persona" onViewSample={onViewSample} locale={locale} />

        <div style={nrStyles.titleBlock}>
          <div style={nrStyles.title}>{t("bcPersona")}</div>
          <div style={nrStyles.subtitle}>{t("step1Subtitle")}</div>
        </div>

        <div style={nrStyles.fieldGrid}>
          <div style={nrStyles.row2}>
            <Field label={t("fldCategory")} required>
              <Dropdown
                value={category}
                onChange={setField("category")}
                placeholder={t("phCategory")}
                options={ROLEPLAY_CATEGORIES}
                renderLabel={(o) => lhCategory(locale, o)}
              />
            </Field>
            <Field label={t("fldLanguage")} required>
              <Dropdown
                value={language}
                onChange={setField("language")}
                placeholder={t("phLanguage")}
                options={PERSONA_LANGUAGES}
                renderLabel={(o) => lhLanguageName(locale, o)}
              />
            </Field>
          </div>

          <Field label={t("fldReason")} required>
            <SingleLineInput
              value={reason}
              onChange={setField("reason")}
              max={REASON_MAX}
              placeholder={t("phReason")}
            />
          </Field>

          <Field label={t("fldObjective")} required>
            <MultiLineInput
              value={objective}
              onChange={setField("objective")}
              max={OBJECTIVE_MAX}
              placeholder={t("phObjective")}
            />
          </Field>

          <Field label={t("fldComplexity")} required>
            <PillGroup
              value={complexity}
              onChange={setField("complexity")}
              options={COMPLEXITY_OPTIONS}
              renderLabel={(o) => lhDifficulty(locale, o)}
            />
          </Field>

          <Field label={t("fldDuration")} required>
            <DurationControl value={duration} onChange={setField("duration")} t={t} isRtl={isRtl} />
          </Field>
        </div>

        <div style={nrStyles.footer}>
          <Button variant="text" onClick={onCancel}>{t("cancel")}</Button>
          <Button variant="primary" disabled={!isValid} onClick={submit}>
            {t("next")}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ---------- Field shell ----------

function Field({ label, required, children }) {
  return (
    <div style={nrStyles.field}>
      <label style={nrStyles.label}>
        {label}
        {required && <span style={nrStyles.required}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ---------- Dropdown ----------

function Dropdown({ value, onChange, placeholder, options, renderLabel = (o) => o }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={nrStyles.ddWrap}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={nrStyles.ddTrigger}
      >
        <span
          style={{
            ...nrStyles.ddValue,
            color: value ? "var(--color-text-deep)" : "var(--color-text-placeholder)",
          }}
        >
          {value ? renderLabel(value) : placeholder}
        </span>
        <ChevronDown size={18} color="var(--color-text-tertiary)" />
      </button>
      {open && (
        <div style={nrStyles.ddMenu}>
          {options.map((opt) => (
            <div
              key={opt}
              style={{
                ...nrStyles.ddOption,
                fontWeight: opt === value ? 600 : 400,
              }}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {renderLabel(opt)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Inputs ----------

function SingleLineInput({ value, onChange, max, placeholder }) {
  const handle = (e) => {
    const next = e.target.value;
    if (next.length <= max) onChange(next);
  };
  return (
    <div style={nrStyles.inputWrap}>
      <input
        type="text"
        value={value}
        onChange={handle}
        placeholder={placeholder}
        maxLength={max}
        style={nrStyles.singleInput}
      />
      <span style={nrStyles.counter}>{value.length}/{max}</span>
    </div>
  );
}

// ---------- Pill group ----------

function PillGroup({ value, onChange, options, renderLabel = (o) => o }) {
  return (
    <div style={nrStyles.pillRow}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            style={{
              ...nrStyles.pill,
              ...(active ? nrStyles.pillActive : null),
            }}
          >
            {renderLabel(opt)}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Duration: number input + slider ----------

function DurationControl({ value, onChange, t, isRtl }) {
  const clamp = (n) => Math.min(DURATION_MAX, Math.max(DURATION_MIN, n));

  const handleNumber = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange(DURATION_MIN);
      return;
    }
    const n = parseInt(raw, 10);
    if (Number.isFinite(n)) onChange(clamp(n));
  };

  const handleSlider = (e) => onChange(clamp(parseInt(e.target.value, 10)));

  const pct =
    ((value - DURATION_MIN) / (DURATION_MAX - DURATION_MIN)) * 100;

  return (
    <div style={nrStyles.durationRow}>
      <div style={nrStyles.numberWrap}>
        <input
          type="number"
          min={DURATION_MIN}
          max={DURATION_MAX}
          value={value}
          onChange={handleNumber}
          style={nrStyles.numberInput}
        />
        <span style={nrStyles.numberSuffix}>{t("minutes")}</span>
      </div>
      <div style={nrStyles.sliderColumn}>
        <input
          type="range"
          min={DURATION_MIN}
          max={DURATION_MAX}
          value={value}
          onChange={handleSlider}
          style={{
            ...nrStyles.slider,
            background: `linear-gradient(to ${isRtl ? "left" : "right"}, var(--color-icon-tertiary-fg) 0%, var(--color-icon-tertiary-fg) ${pct}%, var(--color-divider-card) ${pct}%, var(--color-divider-card) 100%)`,
          }}
        />
        <div style={nrStyles.sliderEnds}>
          <span>{DURATION_MIN} {t("minShort")}</span>
          <span>{DURATION_MAX} {t("minShort")}</span>
        </div>
      </div>
    </div>
  );
}

// ---------- Styles ----------

const nrStyles = {
  page: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    flex: 1,
    minHeight: 0,
  },
  formCard: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  // Breadcrumb row
  breadcrumbRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottom: "1px solid var(--color-divider-card)",
  },
  breadcrumb: { display: "flex", alignItems: "center", gap: 8 },
  bcActive: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-button-primary-bg)",
  },
  bcInactive: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },
  viewSample: {
    border: "none",
    background: "transparent",
    color: "var(--color-text-medium)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.06em",
    cursor: "pointer",
    padding: 0,
  },

  // Title block
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

  // Field grid
  fieldGrid: { display: "flex", flexDirection: "column", gap: 24 },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
  },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  required: { color: "var(--color-error)", marginInlineStart: 2 },

  // Dropdown
  ddWrap: { position: "relative" },
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
    boxShadow:
      "0px 5px 5px -3px rgba(0,0,0,0.20), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)",
    zIndex: 50,
    overflow: "hidden",
  },
  ddOption: {
    padding: "12px 16px",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    color: "var(--color-text-deep)",
    cursor: "pointer",
    transition: "background 120ms",
  },

  // Inputs
  inputWrap: { position: "relative" },
  singleInput: {
    width: "100%",
    height: 56,
    paddingBlock: 0,
    paddingInlineStart: 16,
    paddingInlineEnd: 80,
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    color: "var(--color-text-deep)",
    outline: "none",
    boxSizing: "border-box",
  },
  textareaWrap: { position: "relative" },
  textarea: {
    width: "100%",
    minHeight: 96,
    padding: "12px 80px 12px 16px",
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    color: "var(--color-text-deep)",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical",
    lineHeight: 1.5,
  },
  counter: {
    position: "absolute",
    top: "50%",
    insetInlineEnd: 16,
    transform: "translateY(-50%)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    color: "var(--color-text-tertiary)",
  },

  // Pill group
  pillRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  pill: {
    height: 32,
    padding: "0 16px",
    borderRadius: 999,
    border: "1px solid var(--color-divider-card)",
    background: "transparent",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    cursor: "pointer",
  },
  pillActive: {
    background: "var(--color-icon-tertiary-bg)",
    borderColor: "var(--color-icon-tertiary-fg)",
    color: "var(--color-icon-tertiary-fg)",
    fontWeight: 700,
  },

  // Duration
  durationRow: { display: "flex", alignItems: "center", gap: 24 },
  numberWrap: {
    display: "flex",
    alignItems: "center",
    width: 160,
    height: 44,
    border: "1px solid var(--color-divider-card)",
    borderRadius: 8,
    background: "var(--surface-white)",
    paddingInline: 12,
    boxSizing: "border-box",
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
    marginInlineStart: 8,
  },
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

  // Footer
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 24,
    marginTop: 8,
    borderTop: "1px solid var(--color-divider-card)",
  },
};
