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
  step = "setup", draft, onChange, onStepChange, onCancel, onPublish,
}) {
  const data = draft || EMPTY_REPLAY_DRAFT;
  const idx = REPLAY_WIZARD_STEPS.findIndex((x) => x.id === step);
  const safeIdx = idx === -1 ? 0 : idx;
  const isLast = safeIdx === REPLAY_WIZARD_STEPS.length - 1;
  const setField = (key) => (next) => onChange?.({ ...data, [key]: next });

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
      if (!window.confirm("Discard changes? Your draft collection will be lost.")) return;
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
        <Stepper steps={REPLAY_WIZARD_STEPS} activeIndex={safeIdx} onBack={goBack} />
      </Card>

      <div style={st.bodyRow}>
        {step === "preview" ? (
          <PreviewStep
            draft={data}
            onEditSetup={() => onStepChange?.("setup")}
            onEditConfig={() => onStepChange?.("configure")}
          />
        ) : (
          <Card padX={24} padY={24} style={st.body}>
            {step === "setup"
              ? <SetupStep draft={data} setField={setField} />
              : <ConfigureStep draft={data} setField={setField} />}
          </Card>
        )}
      </div>

      <Card padX={24} padY={16}>
        <div style={st.footerRow}>
          <Button variant="text" uppercase={false} onClick={requestCancel}>Cancel</Button>
          <Button
            variant="primary"
            uppercase={false}
            disabled={!stepValid}
            onClick={goNext}
            trailingIcon={isLast ? <Send size={14} /> : <ChevronRight size={16} />}
            style={{ height: 40, minWidth: 0, paddingInline: 20 }}
          >
            {isLast ? "Publish" : "Next"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// ---- Stepper -----------------------------------------------------------

function Stepper({ steps, activeIndex, onBack }) {
  return (
    <div style={st.stepperRow}>
      <button type="button" onClick={onBack} aria-label="Back" style={st.backBtn}>
        <ArrowLeft size={20} />
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
              {i < steps.length - 1 && <ChevronRight size={14} color="var(--color-text-tertiary)" />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ---- Step 1 · Setup ----------------------------------------------------

function SetupStep({ draft, setField }) {
  const unified = draft.outputLanguageMode === "unified";
  return (
    <>
      <Header title="Set up the collection" subtitle="What this collection teaches and which calls it draws from" />
      <div style={st.formGrid}>
        <Field label="Collection name" required>
          <TextInput value={draft.name} onChange={setField("name")} max={REPLAY_FIELD_MAX.name} placeholder="E.g. Save the Switch" />
        </Field>
        <Field label="Driver" required help="The behaviour the collection sits under. Outcome is the lane within it.">
          <Dropdown value={draft.driver} onChange={setField("driver")} options={DRIVER_OPTIONS} placeholder="E.g. Churn risk" />
        </Field>

        <Field label="Description" required fullWidth>
          <MultiLineInput value={draft.description} onChange={setField("description")} max={REPLAY_FIELD_MAX.description} rows={3} placeholder="E.g. How top retention agents turn a switch threat into a save." />
        </Field>

        <Field label="Learning objective" fullWidth help="What an agent should take away from this collection.">
          <MultiLineInput value={draft.objective} onChange={setField("objective")} max={REPLAY_FIELD_MAX.objective} rows={2} placeholder="E.g. New hires hear a real save before their first retention shift." />
        </Field>

        <Field label="Replay language" required help="The language replays play back in — not a filter on the source calls." fullWidth>
          <div style={st.langModeRow}>
            {OUTPUT_LANGUAGE_MODES.map((m) => (
              <RadioCard
                key={m.id}
                selected={draft.outputLanguageMode === m.id}
                title={m.label}
                help={m.help}
                onClick={() => setField("outputLanguageMode")(m.id)}
              />
            ))}
          </div>
          {unified && (
            <div style={{ marginTop: 12, maxWidth: 320 }}>
              <Dropdown value={draft.language} onChange={setField("language")} options={LANGUAGE_OPTIONS} placeholder="Choose output language" />
            </div>
          )}
        </Field>

        <Field label="Business outcome" help="The lane within the driver — what a good call achieves.">
          <Dropdown value={draft.businessOutcome} onChange={setField("businessOutcome")} options={BUSINESS_OUTCOME_OPTIONS} placeholder="E.g. Retention" />
        </Field>
        <Field label="Call outcome">
          <Dropdown value={draft.callOutcome} onChange={setField("callOutcome")} options={CALL_OUTCOME_OPTIONS} placeholder="E.g. Saved" />
        </Field>
        <Field label="Domain / line of business">
          <Dropdown value={draft.domain} onChange={setField("domain")} options={DOMAIN_OPTIONS} placeholder="E.g. Consumer" />
        </Field>
        <Field label="Target audience">
          <Dropdown value={draft.targetAudience} onChange={setField("targetAudience")} options={TARGET_AUDIENCE_OPTIONS} placeholder="E.g. New hires" />
        </Field>
      </div>
    </>
  );
}

// ---- Step 2 · Configure ------------------------------------------------

function ConfigureStep({ draft, setField }) {
  return (
    <>
      <Header title="Configure sampling & publishing" subtitle="How far back the AI looks, how many replays it builds, and who publishes them" />
      <div style={st.formGrid}>
        <Field label="Call eligibility window" help="How far back the AI samples calls from.">
          <Dropdown value={draft.eligibilityWindow} onChange={setField("eligibilityWindow")} options={ELIGIBILITY_WINDOW_OPTIONS} placeholder="Last 30 days" />
        </Field>
        <Field label="Max replays in collection">
          <Dropdown value={String(draft.maxReplays)} onChange={(v) => setField("maxReplays")(parseInt(v, 10))} options={MAX_REPLAY_OPTIONS.map(String)} placeholder="10" />
        </Field>
        <Field label="Refresh frequency" help="Refresh runs automatically — there's no manual refresh." fullWidth>
          <div style={{ maxWidth: 320 }}>
            <Dropdown value={draft.refreshFrequency} onChange={setField("refreshFrequency")} options={REFRESH_FREQUENCY_OPTIONS} placeholder="Weekly" />
          </div>
        </Field>

        <Field label="Publishing workflow" required fullWidth>
          <div style={st.langModeRow}>
            {PUBLISH_MODES.map((m) => (
              <RadioCard
                key={m.id}
                selected={draft.publishMode === m.id}
                title={m.label}
                help={m.help}
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

function PreviewStep({ draft, onEditSetup, onEditConfig }) {
  const mode = PUBLISH_MODES.find((m) => m.id === draft.publishMode);
  const langMode = OUTPUT_LANGUAGE_MODES.find((m) => m.id === draft.outputLanguageMode);
  return (
    <>
      <Card padX={0} padY={0} style={st.previewMain}>
        <PanelHeader title="Collection" onEdit={onEditSetup} />
        <div style={st.reviewBody}>
          <ReviewRow label="NAME" value={draft.name} />
          <ReviewRow label="DRIVER · OUTCOME" value={[draft.driver, draft.businessOutcome].filter(Boolean).join(" · ")} />
          <ReviewRow label="DESCRIPTION" value={draft.description} />
          <ReviewRow label="LEARNING OBJECTIVE" value={draft.objective} />
          <ReviewRow label="REPLAY LANGUAGE" value={draft.outputLanguageMode === "unified" ? draft.language || "One language" : langMode?.label} />
          <ReviewRow label="TARGET AUDIENCE" value={draft.targetAudience} last />
        </div>
        <div style={st.activationNote}>
          <Info size={16} color="var(--color-info)" style={{ flexShrink: 0, marginTop: 1 }} />
          <span>On activation the AI starts sampling calls immediately. The first replays appear in the collection record view as they're built.</span>
        </div>
      </Card>

      <Card padX={0} padY={0} style={st.previewSide}>
        <PanelHeader title="Configuration" onEdit={onEditConfig} />
        <div style={st.reviewBody}>
          <ReviewRow label="ELIGIBILITY WINDOW" value={draft.eligibilityWindow} />
          <ReviewRow label="MAX REPLAYS" value={String(draft.maxReplays)} />
          <ReviewRow label="REFRESH" value={`${draft.refreshFrequency} · auto`} />
          <ReviewRow label="PUBLISHING" last>
            {mode ? (
              <span style={st.publishChip}>
                {draft.publishMode === "auto" && <Sparkles size={12} color="var(--color-icon-tertiary-fg)" />}
                {mode.label}
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

function Dropdown({ value, onChange, options, placeholder }) {
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
        <span style={{ ...st.ddValue, color: value ? "var(--color-text-deep)" : "var(--color-text-placeholder)" }}>
          {value || placeholder || "Select"}
        </span>
        <ChevronDown size={18} color="var(--color-text-tertiary)" />
      </button>
      {open && (
        <div style={st.ddMenu}>
          {options.map((opt) => (
            <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }} style={{ ...st.ddOption, fontWeight: opt === value ? 600 : 400 }}>
              {opt}
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

function PanelHeader({ title, onEdit }) {
  return (
    <div style={st.panelHeader}>
      <span style={st.panelTitle}>{title}</span>
      <button type="button" onClick={onEdit} aria-label={`Edit ${title}`} style={st.iconBtn}>
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
  counter: { flexShrink: 0, marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-text-tertiary)" },

  ddWrap: { position: "relative", width: "100%" },
  ddTrigger: { width: "100%", height: 40, display: "flex", alignItems: "center", justifyContent: "space-between", paddingInline: 12, border: "1px solid var(--color-border-card-soft)", borderRadius: 8, background: "#FFFFFF", cursor: "pointer", fontFamily: "var(--font-sans)" },
  ddValue: { fontSize: 14, fontWeight: 400, textAlign: "left", flex: 1, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" },
  ddMenu: { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20, background: "#FFFFFF", border: "1px solid var(--color-border-card-soft)", borderRadius: 8, boxShadow: "var(--shadow-card)", padding: 4, maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 },
  ddOption: { border: "none", background: "transparent", textAlign: "left", padding: "8px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--color-text-deep)" },

  langModeRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  radioCard: { flex: "1 1 0", minWidth: 240, display: "flex", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 10, border: "1px solid", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-sans)", transition: "border-color 120ms ease, background 120ms ease" },
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
