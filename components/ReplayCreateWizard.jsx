"use client";

import React from "react";
import {
  ArrowLeft, ChevronRight, ChevronDown, Send, Pencil, Sparkles, Info, Check,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import MultiLineInput from "./MultiLineInput";
import {
  EMPTY_REPLAY_DRAFT, REPLAY_FIELD_MAX,
  LANGUAGE_OPTIONS, OUTPUT_LANGUAGE_MODES, DRIVER_OPTIONS, CALL_OUTCOME_OPTIONS,
  BUSINESS_OUTCOME_OPTIONS, DOMAIN_OPTIONS, TARGET_AUDIENCE_OPTIONS,
  ELIGIBILITY_WINDOW_OPTIONS, REFRESH_FREQUENCY_OPTIONS, MAX_REPLAY_OPTIONS, PUBLISH_MODES,
} from "./mocks/replays";
import {
  lhR, lhText, lhDir, lhTerm, lhLanguageName, lhReplayOpt, lhReplayMode,
} from "./learningHubLocale";

// ReplayCreateWizard — create a Replay collection. Two input steps then a
// preview, matching the locked Jun-11 structure and the shared wizard
// shell (stepper card · body · sticky footer) used by the Mission/ Guide
// wizards.
//   1 Setup      — what the collection is and the calls it draws from
//   2 Configure  — sampling window, volume, refresh, and publish mode
//   3 Preview    — review + publish (config on the right; on activation
//                  the AI begins sampling calls immediately)

export const REPLAY_WIZARD_STEPS = [
  { id: "setup", label: "Setup" },
  { id: "configure", label: "Configuration" },
  { id: "preview", label: "Preview & Publish" },
];

export default function ReplayCreateWizard({
  step = "setup", draft, onChange, onStepChange, onCancel, onPublish, locale = "en",
}) {
  const data = draft || EMPTY_REPLAY_DRAFT;
  const idx = REPLAY_WIZARD_STEPS.findIndex((x) => x.id === step);
  const safeIdx = idx === -1 ? 0 : idx;
  const isLast = safeIdx === REPLAY_WIZARD_STEPS.length - 1;
  const setField = (key) => (next) => onChange?.({ ...data, [key]: next });
  const localizedSteps = REPLAY_WIZARD_STEPS.map((sp) => ({ ...sp, label: lhR(locale, `cw_step_${sp.id}`) }));

  const stepValid = (() => {
    if (step === "setup") {
      const langOk = data.outputLanguageMode === "original" || Boolean((data.language || "").trim());
      return Boolean((data.name || "").trim() && (data.description || "").trim() && data.driver && langOk);
    }
    if (step === "configure") return Boolean(data.publishMode);
    return true;
  })();

  const requestCancel = () => {
    const dirty = Boolean(data.name || data.description || data.driver);
    if (dirty && typeof window !== "undefined") {
      if (!window.confirm(lhR(locale, "cw_discard"))) return;
    }
    onCancel?.();
  };
  const goNext = () => {
    if (isLast) { onPublish?.(); return; }
    onStepChange?.(REPLAY_WIZARD_STEPS[safeIdx + 1].id);
  };
  const goBack = () => {
    if (safeIdx === 0) { requestCancel(); return; }
    onStepChange?.(REPLAY_WIZARD_STEPS[safeIdx - 1].id);
  };

  return (
    <div style={st.column}>
      <Card padX={20} padY={16}>
        <Stepper steps={localizedSteps} activeIndex={safeIdx} onBack={goBack} locale={locale} />
      </Card>

      <div style={st.bodyRow}>
        {step === "preview" ? (
          <PreviewStep
            draft={data}
            onEditSetup={() => onStepChange?.("setup")}
            onEditConfig={() => onStepChange?.("configure")}
            locale={locale}
          />
        ) : (
          <Card padX={24} padY={24} style={st.body}>
            {step === "setup"
              ? <SetupStep draft={data} setField={setField} locale={locale} />
              : <ConfigureStep draft={data} setField={setField} locale={locale} />}
          </Card>
        )}
      </div>

      <Card padX={24} padY={16}>
        <div style={st.footerRow}>
          <Button variant="text" uppercase={false} onClick={requestCancel}>{lhText(locale, "cancel")}</Button>
          <Button
            variant="primary"
            uppercase={false}
            disabled={!stepValid}
            onClick={goNext}
            trailingIcon={isLast ? <Send size={14} /> : <ChevronRight size={16} />}
            style={{ height: 40, minWidth: 0, paddingInline: 20 }}
          >
            {isLast ? lhR(locale, "cw_publish") : lhR(locale, "cw_next")}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ---- Stepper -----------------------------------------------------------

function Stepper({ steps, activeIndex, onBack, locale = "en" }) {
  const flip = lhDir(locale) === "rtl" ? { transform: "scaleX(-1)" } : undefined;
  return (
    <div style={st.stepperRow}>
      <button type="button" onClick={onBack} aria-label={lhR(locale, "cw_back")} style={st.backBtn}>
        <ArrowLeft size={20} style={flip} />
      </button>
      <div style={st.crumbs}>
        {steps.map((sp, i) => {
          const isActive = i === activeIndex;
          const isDone = i < activeIndex;
          return (
            <React.Fragment key={sp.id}>
              <span style={{
                ...st.crumb,
                color: isActive ? "var(--color-button-primary-bg)" : isDone ? "var(--color-text-deep)" : "var(--color-text-tertiary)",
                fontWeight: isActive ? 700 : isDone ? 600 : 500,
              }}>{sp.label}</span>
              {i < steps.length - 1 && <ChevronRight size={14} color="var(--color-text-tertiary)" style={flip} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ---- Step 1 · Setup ----------------------------------------------------

function SetupStep({ draft, setField, locale = "en" }) {
  const unified = draft.outputLanguageMode === "unified";
  const term = (o) => lhTerm(locale, o);
  const opt = (o) => lhReplayOpt(locale, o);
  return (
    <>
      <Header title={lhR(locale, "cw_setupTitle")} subtitle={lhR(locale, "cw_setupSubtitle")} />
      <div style={st.formGrid}>
        <Field label={lhR(locale, "cw_f_name")} required>
          <TextInput value={draft.name} onChange={setField("name")} max={REPLAY_FIELD_MAX.name} placeholder={lhR(locale, "cw_ph_name")} />
        </Field>
        <Field label={lhR(locale, "cw_f_driver")} required help={lhR(locale, "cw_help_driver")}>
          <Dropdown value={draft.driver} onChange={setField("driver")} options={DRIVER_OPTIONS} placeholder={lhR(locale, "cw_ph_driver")} renderOption={term} locale={locale} />
        </Field>

        <Field label={lhR(locale, "cw_f_description")} required fullWidth>
          <MultiLineInput value={draft.description} onChange={setField("description")} max={REPLAY_FIELD_MAX.description} rows={3} placeholder={lhR(locale, "cw_ph_description")} />
        </Field>

        <Field label={lhR(locale, "cw_f_objective")} fullWidth help={lhR(locale, "cw_help_objective")}>
          <MultiLineInput value={draft.objective} onChange={setField("objective")} max={REPLAY_FIELD_MAX.objective} rows={2} placeholder={lhR(locale, "cw_ph_objective")} />
        </Field>

        <Field label={lhR(locale, "cw_f_replayLang")} required help={lhR(locale, "cw_help_replayLang")} fullWidth>
          <div style={st.langModeRow}>
            {OUTPUT_LANGUAGE_MODES.map((m) => (
              <RadioCard
                key={m.id}
                selected={draft.outputLanguageMode === m.id}
                title={lhReplayMode(locale, m.id, "label", m.label)}
                help={lhReplayMode(locale, m.id, "help", m.help)}
                onClick={() => setField("outputLanguageMode")(m.id)}
              />
            ))}
          </div>
          {unified && (
            <div style={{ marginTop: 12, maxWidth: 320 }}>
              <Dropdown value={draft.language} onChange={setField("language")} options={LANGUAGE_OPTIONS} placeholder={lhR(locale, "cw_ph_chooseLang")} renderOption={(o) => lhLanguageName(locale, o)} locale={locale} />
            </div>
          )}
        </Field>

        <Field label={lhR(locale, "cw_f_businessOutcome")} help={lhR(locale, "cw_help_businessOutcome")}>
          <Dropdown value={draft.businessOutcome} onChange={setField("businessOutcome")} options={BUSINESS_OUTCOME_OPTIONS} placeholder={lhR(locale, "cw_ph_businessOutcome")} renderOption={term} locale={locale} />
        </Field>
        <Field label={lhR(locale, "cw_f_callOutcome")}>
          <Dropdown value={draft.callOutcome} onChange={setField("callOutcome")} options={CALL_OUTCOME_OPTIONS} placeholder={lhR(locale, "cw_ph_callOutcome")} renderOption={opt} locale={locale} />
        </Field>
        <Field label={lhR(locale, "cw_f_domain")}>
          <Dropdown value={draft.domain} onChange={setField("domain")} options={DOMAIN_OPTIONS} placeholder={lhR(locale, "cw_ph_domain")} renderOption={opt} locale={locale} />
        </Field>
        <Field label={lhR(locale, "cw_f_audience")}>
          <Dropdown value={draft.targetAudience} onChange={setField("targetAudience")} options={TARGET_AUDIENCE_OPTIONS} placeholder={lhR(locale, "cw_ph_audience")} renderOption={opt} locale={locale} />
        </Field>
      </div>
    </>
  );
}

// ---- Step 2 · Configure ------------------------------------------------

function ConfigureStep({ draft, setField, locale = "en" }) {
  const term = (o) => lhTerm(locale, o);
  return (
    <>
      <Header title={lhR(locale, "cw_configTitle")} subtitle={lhR(locale, "cw_configSubtitle")} />
      <div style={st.formGrid}>
        <Field label={lhR(locale, "cw_f_window")} help={lhR(locale, "cw_help_window")}>
          <Dropdown value={draft.eligibilityWindow} onChange={setField("eligibilityWindow")} options={ELIGIBILITY_WINDOW_OPTIONS} placeholder={term("Last 30 days")} renderOption={term} locale={locale} />
        </Field>
        <Field label={lhR(locale, "cw_f_maxReplays")}>
          <Dropdown value={String(draft.maxReplays)} onChange={(v) => setField("maxReplays")(parseInt(v, 10))} options={MAX_REPLAY_OPTIONS.map(String)} placeholder="10" locale={locale} />
        </Field>
        <Field label={lhR(locale, "cw_f_refresh")} help={lhR(locale, "cw_help_refresh")} fullWidth>
          <div style={{ maxWidth: 320 }}>
            <Dropdown value={draft.refreshFrequency} onChange={setField("refreshFrequency")} options={REFRESH_FREQUENCY_OPTIONS} placeholder={term("Weekly")} renderOption={term} locale={locale} />
          </div>
        </Field>

        <Field label={lhR(locale, "cw_f_publishing")} required fullWidth>
          <div style={st.langModeRow}>
            {PUBLISH_MODES.map((m) => (
              <RadioCard
                key={m.id}
                selected={draft.publishMode === m.id}
                title={lhReplayMode(locale, m.id, "label", m.label)}
                help={lhReplayMode(locale, m.id, "help", m.help)}
                icon={m.id === "auto" ? <Sparkles size={14} color="var(--color-icon-tertiary-fg)" /> : null}
                onClick={() => setField("publishMode")(m.id)}
              />
            ))}
          </div>
        </Field>
      </div>
    </>
  );
}

// ---- Step 3 · Preview & Publish ----------------------------------------

function PreviewStep({ draft, onEditSetup, onEditConfig, locale = "en" }) {
  const mode = PUBLISH_MODES.find((m) => m.id === draft.publishMode);
  const langModeLabel = draft.outputLanguageMode === "unified"
    ? (draft.language ? lhLanguageName(locale, draft.language) : lhR(locale, "cw_oneLanguage"))
    : lhReplayMode(locale, draft.outputLanguageMode, "label", OUTPUT_LANGUAGE_MODES.find((m) => m.id === draft.outputLanguageMode)?.label);
  const driverOutcome = [draft.driver && lhTerm(locale, draft.driver), draft.businessOutcome && lhTerm(locale, draft.businessOutcome)].filter(Boolean).join(" · ");
  return (
    <>
      <Card padX={0} padY={0} style={st.previewMain}>
        <PanelHeader title={lhR(locale, "cw_panel_collection")} onEdit={onEditSetup} locale={locale} />
        <div style={st.reviewBody}>
          <ReviewRow label={lhR(locale, "cw_rl_name")} value={draft.name} />
          <ReviewRow label={lhR(locale, "cw_rl_driverOutcome")} value={driverOutcome} />
          <ReviewRow label={lhR(locale, "cw_rl_description")} value={draft.description} />
          <ReviewRow label={lhR(locale, "cw_rl_objective")} value={draft.objective} />
          <ReviewRow label={lhR(locale, "cw_rl_replayLang")} value={langModeLabel} />
          <ReviewRow label={lhR(locale, "cw_rl_audience")} value={draft.targetAudience && lhReplayOpt(locale, draft.targetAudience)} last />
        </div>
        <div style={st.activationNote}>
          <Info size={16} color="var(--color-info)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{lhR(locale, "cw_activation")}</span>
        </div>
      </Card>

      <Card padX={0} padY={0} style={st.previewSide}>
        <PanelHeader title={lhR(locale, "cw_panel_config")} onEdit={onEditConfig} locale={locale} />
        <div style={st.reviewBody}>
          <ReviewRow label={lhR(locale, "cw_rl_window")} value={draft.eligibilityWindow && lhTerm(locale, draft.eligibilityWindow)} />
          <ReviewRow label={lhR(locale, "cw_rl_maxReplays")} value={String(draft.maxReplays)} />
          <ReviewRow label={lhR(locale, "cw_rl_refresh")} value={`${lhTerm(locale, draft.refreshFrequency)} · ${lhR(locale, "rec_auto")}`} />
          <ReviewRow label={lhR(locale, "cw_rl_publishing")} last>
            {mode ? (
              <span style={st.publishChip}>
                {draft.publishMode === "auto" && <Sparkles size={12} color="var(--color-icon-tertiary-fg)" />}
                {lhReplayMode(locale, mode.id, "label", mode.label)}
              </span>
            ) : <span style={st.reviewEmpty}>—</span>}
          </ReviewRow>
        </div>
      </Card>
    </>
  );
}

// ---- Shared atoms ------------------------------------------------------

function Header({ title, subtitle }) {
  return (
    <div style={st.header}>
      <h2 style={st.title}>{title}</h2>
      <p style={st.subtitle}>{subtitle}</p>
    </div>
  );
}

function Field({ label, required, help, fullWidth, children }) {
  return (
    <div style={{ ...st.field, gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <div style={st.fieldLabelRow}>
        <span style={st.fieldLabel}>{label}</span>
        {required && <span style={st.fieldRequired}>*</span>}
        {help && <span title={help} aria-label={help} style={st.fieldHelp}><Info size={13} color="var(--color-text-tertiary)" /></span>}
      </div>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, max, placeholder }) {
  const handle = (e) => { const n = e.target.value; if (!max || n.length <= max) onChange(n); };
  return (
    <div style={st.inputWrap}>
      <input type="text" value={value || ""} onChange={handle} placeholder={placeholder} maxLength={max} style={st.input} />
      {max && <span style={st.counter}>{(value || "").length}/{max}</span>}
    </div>
  );
}

function Dropdown({ value, onChange, options, placeholder, renderOption = (o) => o, locale = "en" }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
  return (
    <div ref={ref} style={st.ddWrap}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={st.ddTrigger}>
        <span style={{ ...st.ddValue, color: value ? "var(--color-text-deep)" : "var(--color-text-placeholder)" }} dir="auto">
          {value ? renderOption(value) : (placeholder || lhR(locale, "cw_select"))}
        </span>
        <ChevronDown size={18} color="var(--color-text-tertiary)" />
      </button>
      {open && (
        <div style={st.ddMenu}>
          {options.map((opt) => (
            <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }} style={{ ...st.ddOption, fontWeight: opt === value ? 600 : 400 }} dir="auto">
              {renderOption(opt)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RadioCard({ selected, title, help, icon, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} style={{
      ...st.radioCard,
      borderColor: selected ? "var(--color-icon-tertiary-fg)" : "var(--color-border-card-soft)",
      background: selected ? "var(--color-surface-header-tinted)" : "#FFFFFF",
    }}>
      <span style={{ ...st.radioDot, borderColor: selected ? "var(--color-icon-tertiary-fg)" : "var(--grey-400)" }}>
        {selected && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
      </span>
      <span style={st.radioText}>
        <span style={st.radioTitle}>{icon}{title}</span>
        <span style={st.radioHelp}>{help}</span>
      </span>
    </button>
  );
}

function PanelHeader({ title, onEdit, locale = "en" }) {
  return (
    <div style={st.panelHeader}>
      <span style={st.panelTitle}>{title}</span>
      <button type="button" onClick={onEdit} aria-label={`${lhR(locale, "cw_editPanel")} ${title}`} style={st.iconBtn}>
        <Pencil size={16} color="var(--color-text-tertiary)" />
      </button>
    </div>
  );
}

function ReviewRow({ label, value, children, last }) {
  const has = (value ?? "").toString().trim().length > 0;
  return (
    <div style={{ ...st.reviewRow, borderBottom: last ? "none" : "1px solid var(--color-border-card-soft)" }}>
      <span style={st.reviewLabel}>{label}</span>
      {children ?? (has ? <span style={st.reviewValue}>{value}</span> : <span style={st.reviewEmpty}>—</span>)}
    </div>
  );
}

const st = {
  column: { display: "flex", flexDirection: "column", gap: 16, width: "100%", flex: 1, minHeight: 0 },
  bodyRow: { display: "flex", alignItems: "stretch", gap: 16, flex: 1, minHeight: 0, minWidth: 0 },
  body: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 24 },

  stepperRow: { display: "flex", alignItems: "center", gap: 12 },
  backBtn: { width: 28, height: 28, borderRadius: 6, border: "none", background: "var(--color-card-emoji-bg)", display: "inline-grid", placeItems: "center", cursor: "pointer", padding: 0, flexShrink: 0, color: "var(--color-text-tertiary)" },
  crumbs: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  crumb: { fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: "20px", letterSpacing: "0.17px" },

  header: { display: "flex", flexDirection: "column", gap: 4 },
  title: { margin: 0, fontSize: 20, fontWeight: 500, lineHeight: "32px", letterSpacing: "0.15px", color: "var(--color-text-medium)" },
  subtitle: { margin: 0, fontSize: 12, fontWeight: 400, lineHeight: "20px", letterSpacing: "0.4px", color: "var(--color-text-tertiary)" },

  formGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", columnGap: 24, rowGap: 20, width: "100%" },
  field: { display: "flex", flexDirection: "column", gap: 8, minWidth: 0 },
  fieldLabelRow: { display: "inline-flex", alignItems: "center", gap: 6 },
  fieldLabel: { fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 500, lineHeight: "20px", color: "var(--color-text-medium)" },
  fieldRequired: { fontSize: 13, fontWeight: 600, color: "#E11D48", lineHeight: "20px" },
  fieldHelp: { display: "inline-grid", placeItems: "center", width: 16, height: 16, cursor: "help" },

  inputWrap: { position: "relative", display: "flex", alignItems: "center", border: "1px solid var(--color-border-card-soft)", borderRadius: 8, background: "#FFFFFF", paddingInline: 12, height: 40 },
  input: { flex: 1, minWidth: 0, height: "100%", border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--color-text-deep)" },
  counter: { flexShrink: 0, marginInlineStart: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-tertiary)" },

  ddWrap: { position: "relative", width: "100%" },
  ddTrigger: { width: "100%", height: 40, display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 12, border: "1px solid var(--color-border-card-soft)", borderRadius: 8, background: "#FFFFFF", cursor: "pointer", fontFamily: "var(--font-sans)" },
  ddValue: { fontSize: 14, fontWeight: 400, textAlign: "start", flex: 1, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" },
  ddMenu: { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20, background: "#FFFFFF", border: "1px solid var(--color-border-card-soft)", borderRadius: 8, boxShadow: "var(--shadow-card)", padding: 4, maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 },
  ddOption: { border: "none", background: "transparent", textAlign: "start", padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--color-text-deep)" },

  langModeRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  radioCard: { flex: "1 1 0", minWidth: 240, display: "flex", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 10, border: "1px solid", cursor: "pointer", textAlign: "start", fontFamily: "var(--font-sans)", transition: "border-color 120ms ease, background 120ms ease" },
  radioDot: { width: 18, height: 18, borderRadius: 999, border: "2px solid", display: "inline-grid", placeItems: "center", flexShrink: 0, marginTop: 1, background: "transparent" },
  radioText: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  radioTitle: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)" },
  radioHelp: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.45 },

  footerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },

  // Preview
  previewMain: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 },
  previewSide: { width: 320, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: 0 },
  panelHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid var(--color-border-card-soft)" },
  panelTitle: { fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 500, lineHeight: "22px", letterSpacing: "0.1px", color: "var(--color-text-medium)" },
  iconBtn: { width: 24, height: 24, borderRadius: 4, border: "none", background: "transparent", cursor: "pointer", padding: 0, display: "inline-grid", placeItems: "center", flexShrink: 0 },
  reviewBody: { display: "flex", flexDirection: "column", padding: "0 24px" },
  reviewRow: { display: "flex", flexDirection: "column", gap: 4, padding: "16px 0" },
  reviewLabel: { fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, lineHeight: "17px", color: "var(--color-text-tertiary)", textTransform: "uppercase" },
  reviewValue: { fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 400, lineHeight: "20px", letterSpacing: "0.17px", color: "var(--color-text-medium)", whiteSpace: "pre-wrap", wordBreak: "break-word" },
  reviewEmpty: { fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 400, lineHeight: "20px", color: "var(--color-text-placeholder)" },
  publishChip: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)" },
  activationNote: { margin: "8px 24px 24px", display: "flex", gap: 10, padding: "12px 14px", borderRadius: 8, background: "var(--color-info-bg)", color: "var(--color-info-text)", fontSize: 13, lineHeight: 1.5 },
};
