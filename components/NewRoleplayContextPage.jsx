"use client";

import React from "react";
import { Info } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Toggle from "./Toggle";
import MultiLineInput from "./MultiLineInput";
import RoleplayBreadcrumb from "./RoleplayBreadcrumb";
import { lhWizard, lhCapError } from "./learningHubLocale";

const FIELD_MAX = 500;

// Per-roleplay MTD sample — minutes already consumed by this roleplay
// this calendar month. Drives the inline-error guardrail spec §5: cap
// below MTD is invalid (cap can't retroactively block past usage).
const ROLEPLAY_MTD_CONSUMED_MINUTES = 28;

// NewRoleplayContextPage — Step 2 of the New Roleplay wizard
// ("Add Conversation Context"). Controlled component: form values
// come from `value`, flow back via `onChange`. Shared wizard state
// lives in app/page.jsx so navigating Step 1 ↔ Step 2 preserves data
// in both directions.
//
// All three fields are optional. Generate stays disabled until any
// field has content. Skip-and-Generate-with-AI is always enabled and
// routes to the same destination as Generate.
export default function NewRoleplayContextPage({
  value,
  onChange,
  onCancel,
  onPrevious,
  onGenerate,
  onSkipAndGenerate,
  onViewSample,
  locale = "en",
}) {
  const setField = (key) => (next) => onChange({ ...value, [key]: next });
  const { objections, products, context } = value;
  const t = (key) => lhWizard(locale, key);

  // Per-roleplay minute cap (spec §5). Optional, off by default. Lives
  // here as local wizard state — added to the draft on Generate so it
  // doesn't disturb the shared wizard object's existing keys.
  const [capEnabled, setCapEnabled] = React.useState(Boolean(value.perRoleplayCap));
  const [capMinutes, setCapMinutes] = React.useState(
    typeof value.perRoleplayCap === "number" ? value.perRoleplayCap : 60,
  );

  const capError = capEnabled && capMinutes < ROLEPLAY_MTD_CONSUMED_MINUTES
    ? lhCapError(locale, capMinutes, ROLEPLAY_MTD_CONSUMED_MINUTES)
    : null;

  const hasAny =
    objections.trim().length > 0 ||
    products.trim().length > 0 ||
    context.trim().length > 0;

  // Generate stays disabled until at least one field has content AND
  // the cap field, if enabled, is valid (spec §5: block save).
  const generateDisabled = !hasAny || Boolean(capError);

  const handleGenerate = () => {
    if (generateDisabled) return;
    onChange({ ...value, perRoleplayCap: capEnabled ? capMinutes : null });
    onGenerate?.();
  };

  return (
    <div style={ctxStyles.page}>
      <Card padX={32} padY={32} style={ctxStyles.formCard}>
        <RoleplayBreadcrumb active="context" onViewSample={onViewSample} locale={locale} />

        <div style={ctxStyles.titleRow}>
          <div style={ctxStyles.titleBlock}>
            <div style={ctxStyles.title}>{t("step2Title")}</div>
            <div style={ctxStyles.subtitle}>{t("step1Subtitle")}</div>
          </div>
          <Button variant="ai" onClick={onSkipAndGenerate}>
            {t("skipGenerate")}
          </Button>
        </div>

        <div style={ctxStyles.fieldGrid}>
          <Field label={t("fldObjections")}>
            <MultiLineInput
              value={objections}
              onChange={setField("objections")}
              max={FIELD_MAX}
              placeholder={t("phObjections")}
            />
          </Field>

          <Field label={t("fldProducts")}>
            <MultiLineInput
              value={products}
              onChange={setField("products")}
              max={FIELD_MAX}
              placeholder={t("phProducts")}
            />
          </Field>

          <Field label={t("fldContext")}>
            <MultiLineInput
              value={context}
              onChange={setField("context")}
              max={FIELD_MAX}
              placeholder={t("phContext")}
            />
          </Field>

          <CapField
            enabled={capEnabled}
            onToggle={setCapEnabled}
            minutes={capMinutes}
            onMinutesChange={setCapMinutes}
            error={capError}
            t={t}
          />
        </div>

        <div style={ctxStyles.footer}>
          <Button variant="text" onClick={onCancel}>{t("cancel")}</Button>
          <div style={ctxStyles.footerRight}>
            <Button variant="text" onClick={onPrevious}>{t("previous")}</Button>
            <Button variant="primary" disabled={generateDisabled} onClick={handleGenerate}>
              {t("generate")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// CapField — optional per-roleplay monthly minute cap (spec §5). Off by
// default; reveals a minute stepper when on. Below-MTD value shows the
// verbatim inline error and blocks Generate.
function CapField({ enabled, onToggle, minutes, onMinutesChange, error, t }) {
  return (
    <div style={ctxStyles.field}>
      <div style={ctxStyles.capHead}>
        <div style={ctxStyles.capHeadText}>
          <span style={ctxStyles.label}>{t("capLabel")}</span>
          <span style={ctxStyles.capHelper}>{t("capHelper")}</span>
        </div>
        <Toggle enabled={enabled} onChange={onToggle} ariaLabel={t("capLabel")} />
      </div>
      {enabled && (
        <label style={{ ...ctxStyles.capInputWrap, borderColor: error ? "var(--color-error)" : "var(--color-divider-card)" }}>
          <input
            type="number"
            min={1}
            value={minutes}
            onChange={(e) => onMinutesChange(Number(e.target.value) || 0)}
            aria-label={t("capLabel")}
            aria-invalid={Boolean(error)}
            style={ctxStyles.capInput}
          />
          <span style={ctxStyles.capSuffix}>{t("capSuffix")}</span>
        </label>
      )}
      {error && (
        <div style={ctxStyles.capError} role="alert">
          <Info size={14} color="var(--color-error)" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={ctxStyles.field}>
      <label style={ctxStyles.label}>{label}</label>
      {children}
    </div>
  );
}

const ctxStyles = {
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

  titleRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
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

  fieldGrid: { display: "flex", flexDirection: "column", gap: 24 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 24,
    marginTop: 8,
    borderTop: "1px solid var(--color-divider-card)",
  },
  footerRight: { display: "flex", alignItems: "center", gap: 24 },

  // Per-roleplay cap field (spec §5)
  capHead: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  capHeadText: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  capHelper: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 400,
    lineHeight: 1.5,
    color: "var(--color-text-tertiary)",
  },
  capInputWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    border: "1px solid var(--color-divider-card)",
    borderRadius: 8,
    background: "#FFFFFF",
    transition: "border-color 120ms ease",
    marginTop: 4,
    alignSelf: "flex-start",
  },
  capInput: {
    width: 80,
    border: "none",
    outline: "none",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    background: "transparent",
  },
  capSuffix: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    color: "var(--color-text-tertiary)",
    whiteSpace: "nowrap",
  },
  capError: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 8,
    background: "var(--color-error-bg)",
    color: "var(--color-error)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.5,
    marginTop: 4,
  },
};
