"use client";

import React from "react";
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Info,
  Send,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import MultiLineInput from "./MultiLineInput";
import ComingSoon from "./ComingSoon";
import CoverageStep, { isCoverageValid } from "./CoverageStep";
import FocusAreaStep, { isFocusAreaValid } from "./FocusAreaStep";
import RecruitStep, { isRecruitValid } from "./RecruitStep";
import PreviewStep, { isPreviewValid } from "./PreviewStep";
import { formatDate } from "./formatDate";
import { lhMW, lhText, lhDir, lhDurationWeeks } from "./learningHubLocale";

// MissionWizardPage — Create Mission flow shell. Five steps; only
// "define" has real content. Other steps mount the same shell with a
// <ComingSoon/> body, so Back/Next remain wired end-to-end.
//
// Controlled component. The wizard owner (app/page.jsx) keeps the draft
// + active step. Navigating between steps preserves the draft.
//
// Layout matches the New Roleplay wizard idiom (Card-wrapped form, no
// position:fixed footer) but splits the shell into three stacked Cards:
// stepper / form body / footer. The body Card gets flex:1 so the
// footer pins to the bottom of the content column on short screens.

export const MISSION_WIZARD_STEPS = [
  { id: "define",   label: "Define Mission" },
  { id: "coverage", label: "Coverage" },
  { id: "focus",    label: "Focus Area" },
  { id: "recruit",  label: "Recruit" },
  { id: "preview",  label: "Preview & Publish" },
];

export const EMPTY_MISSION_DRAFT = {
  name: "",
  description: "",
  startDate: "",
  duration: "3 Weeks",
  sessions: 3,
  coverage: { drivers: [] },
  focusArea: { rows: [], userClearedAll: false },
  recruit: { agentIds: [], filters: { lastActive: "all", teams: [], activeMissions: [], qaScore: [] }, sort: { field: "qaScore", direction: "asc" }, search: "" },
};

// Reference seed for preview / Storybook. Not used at render time.
export const DEMO_DRAFT = {
  name: "Post-Purchase Resolution — Returns & Exchanges",
  description:
    "Prepare agents to resolve return and exchange requests efficiently, with clear policy communication and empathetic de-escalation when outcomes don't meet customer expectations.",
  startDate: "2026-03-23",
  duration: "4 Weeks",
  sessions: 3,
};

const NAME_MAX = 80;
const DESCRIPTION_MAX = 300;
const SESSIONS_MIN = 2;
const SESSIONS_MAX = 10;
const DURATION_OPTIONS = [
  "1 Week",
  "2 Weeks",
  "3 Weeks",
  "4 Weeks",
  "6 Weeks",
  "8 Weeks",
  "12 Weeks",
];

const STEP_CONTENT = {
  define: DefineMissionStep,
  coverage: CoverageStep,
  focus: FocusAreaStep,
  recruit: RecruitStep,
  preview: PreviewStep,
};

export default function MissionWizardPage({
  step = "define",
  draft,
  onChange,
  onStepChange,
  onCancel,
  onSave,
  onPublish,
  locale = "en",
}) {
  const data = draft || EMPTY_MISSION_DRAFT;
  const idx = MISSION_WIZARD_STEPS.findIndex((s) => s.id === step);
  const safeIdx = idx === -1 ? 0 : idx;
  const isLast = safeIdx === MISSION_WIZARD_STEPS.length - 1;
  const localizedSteps = MISSION_WIZARD_STEPS.map((s) => ({ ...s, label: lhMW(locale, `step_${s.id}`) }));

  const dirty = isDirty(data);
  const stepValid = isStepValid(step, data);

  const requestCancel = () => {
    if (dirty) {
      // TODO: confirm-dialog primitive — fallback to native confirm
      // until a shared dialog exists in the prototype.
      const ok = typeof window !== "undefined"
        ? window.confirm(lhMW(locale, "discard"))
        : true;
      if (!ok) return;
    }
    onCancel?.();
  };

  const goNext = () => {
    if (isLast) {
      onPublish?.();
      return;
    }
    onStepChange?.(MISSION_WIZARD_STEPS[safeIdx + 1].id);
  };

  const goBack = () => {
    if (safeIdx === 0) {
      requestCancel();
      return;
    }
    onStepChange?.(MISSION_WIZARD_STEPS[safeIdx - 1].id);
  };

  const StepBody = STEP_CONTENT[step] || PlaceholderStep;

  return (
    <div style={mwStyles.column}>
      <Card padX={20} padY={16}>
        <Stepper
          steps={localizedSteps}
          activeIndex={safeIdx}
          onBack={goBack}
          locale={locale}
        />
      </Card>

      <Card padX={32} padY={32} style={mwStyles.body}>
        <StepBody
          draft={data}
          onChange={onChange}
          onStepChange={onStepChange}
          stepLabel={localizedSteps[safeIdx].label}
          locale={locale}
        />
      </Card>

      <Card padX={24} padY={16}>
        <div style={mwStyles.footerRow}>
          <Button variant="text" uppercase={false} onClick={requestCancel}>
            {lhText(locale, "cancel")}
          </Button>
          <div style={mwStyles.footerRight}>
            <Button variant="text" uppercase={false} onClick={() => onSave?.(data)}>
              {lhMW(locale, "save")}
            </Button>
            <Button
              variant="primary"
              uppercase={false}
              disabled={!stepValid}
              onClick={goNext}
              trailingIcon={isLast ? <Send size={14} /> : <ChevronRight size={16} />}
              style={{ height: 40, minWidth: 0, paddingInline: 20 }}
            >
              {isLast ? lhMW(locale, "publish") : lhMW(locale, "next")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ---------- Stepper ----------

function Stepper({ steps, activeIndex, onBack, locale = "en" }) {
  const flip = lhDir(locale) === "rtl" ? { transform: "scaleX(-1)" } : undefined;
  return (
    <div style={mwStyles.stepperRow}>
      <button
        type="button"
        onClick={onBack}
        aria-label={lhMW(locale, "back")}
        style={mwStyles.backBtn}
      >
        <ArrowLeft size={20} style={flip} />
      </button>
      <div style={mwStyles.stepperCrumbs}>
        {steps.map((s, i) => {
          const isActive = i === activeIndex;
          const isCompleted = i < activeIndex;
          const color = isActive
            ? "var(--color-button-primary-bg)"
            : isCompleted
              ? "var(--color-text-deep)"
              : "var(--color-text-tertiary)";
          const weight = isActive ? 700 : isCompleted ? 600 : 500;
          return (
            <React.Fragment key={s.id}>
              <span style={{ ...mwStyles.crumbLabel, color, fontWeight: weight }}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <ChevronRight size={14} color="var(--color-text-tertiary)" style={flip} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Step 1: Define Mission ----------

function DefineMissionStep({ draft, onChange, locale = "en" }) {
  const setField = (key) => (next) => onChange({ ...draft, [key]: next });

  return (
    <>
      <div style={mwStyles.titleBlock}>
        <div style={mwStyles.titleRow}>
          <span style={mwStyles.title}>{lhMW(locale, "step_define")}</span>
          <span style={mwStyles.required}>*</span>
        </div>
        <div style={mwStyles.subtitle}>{lhMW(locale, "subtitle")}</div>
      </div>

      <div style={mwStyles.fieldGrid}>
        <Field label={lhMW(locale, "name")}>
          <SingleLineInput
            value={draft.name}
            onChange={setField("name")}
            max={NAME_MAX}
            placeholder={lhMW(locale, "ph_name")}
          />
        </Field>

        <Field label={lhMW(locale, "description")}>
          <MultiLineInput
            value={draft.description}
            onChange={setField("description")}
            max={DESCRIPTION_MAX}
            rows={3}
            placeholder={lhMW(locale, "ph_description")}
          />
        </Field>

        <div style={mwStyles.row2}>
          <Field label={lhMW(locale, "startDate")}>
            <DateField
              value={draft.startDate}
              onChange={setField("startDate")}
              placeholder={lhMW(locale, "selectDate")}
              locale={locale}
            />
          </Field>
          <Field label={lhMW(locale, "duration")}>
            <Dropdown
              value={draft.duration}
              onChange={setField("duration")}
              options={DURATION_OPTIONS}
              renderOption={(o) => lhDurationWeeks(locale, o)}
              locale={locale}
            />
          </Field>
        </div>

        <Field
          label={lhMW(locale, "sessionsField")}
          info={lhMW(locale, "sessionsInfo")}
        >
          <SessionsControl
            value={draft.sessions}
            onChange={setField("sessions")}
            locale={locale}
          />
        </Field>
      </div>
    </>
  );
}

// ---------- Placeholder step (Coverage / Focus / Recruit / Preview) ----------

function PlaceholderStep({ stepLabel }) {
  return (
    <div style={mwStyles.placeholderWrap}>
      <ComingSoon pageName={stepLabel} />
    </div>
  );
}

// ---------- Field shell ----------

function Field({ label, info, children }) {
  return (
    <div style={mwStyles.field}>
      <label style={mwStyles.label}>
        <span>{label}</span>
        {info && (
          <span
            title={info}
            style={mwStyles.infoIcon}
            aria-label={info}
          >
            <Info size={14} />
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

// ---------- SingleLineInput (mirrors NewRoleplayPage local primitive) ----------

function SingleLineInput({ value, onChange, max, placeholder }) {
  const handle = (e) => {
    const next = e.target.value;
    if (next.length <= max) onChange(next);
  };
  return (
    <div style={mwStyles.inputWrap}>
      <input
        type="text"
        value={value}
        onChange={handle}
        placeholder={placeholder}
        maxLength={max}
        style={mwStyles.singleInput}
      />
      <span style={mwStyles.counter}>{value.length}/{max}</span>
    </div>
  );
}

// ---------- Dropdown (mirrors NewRoleplayPage local primitive) ----------

function Dropdown({ value, onChange, options, placeholder, renderOption = (o) => o, locale = "en" }) {
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
    <div ref={ref} style={mwStyles.ddWrap}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={mwStyles.ddTrigger}>
        <span
          style={{
            ...mwStyles.ddValue,
            color: value ? "var(--color-text-deep)" : "var(--color-text-placeholder)",
          }}
        >
          {value ? renderOption(value) : (placeholder || lhMW(locale, "select"))}
        </span>
        <ChevronDown size={18} color="var(--color-text-tertiary)" />
      </button>
      {open && (
        <div style={mwStyles.ddMenu}>
          {options.map((opt) => (
            <div
              key={opt}
              style={{
                ...mwStyles.ddOption,
                fontWeight: opt === value ? 600 : 400,
              }}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {renderOption(opt)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- DateField ----------
// Visible trigger styled like the other inputs. A hidden native
// <input type="date"> is layered on top so clicks open the browser's
// native picker. On change we keep ISO yyyy-mm-dd in state but display
// DD MMM YYYY. A real date-picker primitive is missing in the
// prototype — surfaced as a gap.

function DateField({ value, onChange, placeholder = "Select a date", locale = "en" }) {
  const inputRef = React.useRef(null);
  const isFilled = Boolean(value);

  const openPicker = () => {
    const el = inputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.focus();
      el.click();
    }
  };

  return (
    <div style={mwStyles.dateWrap}>
      <button type="button" onClick={openPicker} style={mwStyles.dateTrigger}>
        <span
          style={{
            ...mwStyles.dateValue,
            color: isFilled ? "var(--color-text-deep)" : "var(--color-text-placeholder)",
          }}
        >
          {isFilled ? formatDate(value, locale) : placeholder}
        </span>
        <Calendar size={18} color="var(--color-text-tertiary)" />
      </button>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={mwStyles.dateInputHidden}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}


// ---------- SessionsControl (number input + slider, two-way bound) ----------

function SessionsControl({ value, onChange, locale = "en" }) {
  const clamp = (n) => Math.min(SESSIONS_MAX, Math.max(SESSIONS_MIN, n));
  const isRtl = lhDir(locale) === "rtl";

  const handleNumber = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange(SESSIONS_MIN);
      return;
    }
    const n = parseInt(raw, 10);
    if (Number.isFinite(n)) onChange(clamp(n));
  };

  const handleSlider = (e) => onChange(clamp(parseInt(e.target.value, 10)));

  const pct = ((value - SESSIONS_MIN) / (SESSIONS_MAX - SESSIONS_MIN)) * 100;

  return (
    <div style={mwStyles.sessionsRow}>
      <div style={mwStyles.numberWrap}>
        <input
          type="number"
          min={SESSIONS_MIN}
          max={SESSIONS_MAX}
          value={value}
          onChange={handleNumber}
          style={mwStyles.numberInput}
        />
        <span style={mwStyles.numberSuffix}>{lhMW(locale, "sessions")}</span>
      </div>
      <div style={mwStyles.sliderColumn}>
        <input
          type="range"
          min={SESSIONS_MIN}
          max={SESSIONS_MAX}
          value={value}
          onChange={handleSlider}
          style={{
            ...mwStyles.slider,
            background: `linear-gradient(to ${isRtl ? "left" : "right"}, var(--color-icon-tertiary-fg) 0%, var(--color-icon-tertiary-fg) ${pct}%, var(--color-divider-card) ${pct}%, var(--color-divider-card) 100%)`,
          }}
        />
        <div style={mwStyles.sliderEnds}>
          <span>{SESSIONS_MIN}</span>
          <span>{SESSIONS_MAX}</span>
        </div>
      </div>
    </div>
  );
}

// ---------- Validation ----------

function isStepValid(step, draft) {
  if (step === "define") {
    return (
      draft.name.trim().length > 0 &&
      draft.name.length <= NAME_MAX &&
      draft.description.length <= DESCRIPTION_MAX &&
      draft.startDate &&
      isFutureOrToday(draft.startDate) &&
      draft.duration &&
      Number.isInteger(draft.sessions) &&
      draft.sessions >= SESSIONS_MIN &&
      draft.sessions <= SESSIONS_MAX
    );
  }
  if (step === "coverage") {
    return isCoverageValid(draft);
  }
  if (step === "focus") {
    return isFocusAreaValid(draft);
  }
  if (step === "recruit") {
    return isRecruitValid(draft);
  }
  if (step === "preview") {
    return isPreviewValid(draft);
  }
  return true;
}

function isFutureOrToday(iso) {
  if (!iso) return false;
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return false;
  const picked = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return picked.getTime() >= today.getTime();
}

function isDirty(draft) {
  const coverageDrivers = draft.coverage?.drivers ?? [];
  const focusRows = draft.focusArea?.rows ?? [];
  const focusHasSelection = focusRows.some(
    (r) => r.focusAreaId !== null || r.target !== 80,
  );
  const recruitIds = draft.recruit?.agentIds ?? [];
  return (
    draft.name !== EMPTY_MISSION_DRAFT.name ||
    draft.description !== EMPTY_MISSION_DRAFT.description ||
    draft.startDate !== EMPTY_MISSION_DRAFT.startDate ||
    draft.duration !== EMPTY_MISSION_DRAFT.duration ||
    draft.sessions !== EMPTY_MISSION_DRAFT.sessions ||
    coverageDrivers.length > 0 ||
    focusHasSelection ||
    recruitIds.length > 0
  );
}

// ---------- Styles ----------

const mwStyles = {
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    width: "100%",
    flex: 1,
    minHeight: 0,
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    flex: 1,
  },

  // Stepper
  stepperRow: { display: "flex", alignItems: "center", gap: 16 },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    border: "none",
    background: "transparent",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    color: "var(--color-text-medium)",
    padding: 0,
    flexShrink: 0,
  },
  stepperCrumbs: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  crumbLabel: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    lineHeight: 1.4,
  },

  // Title block
  titleBlock: { display: "flex", flexDirection: "column", gap: 4 },
  titleRow: { display: "flex", alignItems: "center" },
  title: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 20,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
  },
  required: { color: "var(--color-error)", marginInlineStart: 2, fontSize: 20, fontWeight: 700 },
  subtitle: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.5,
  },

  // Field grid
  fieldGrid: { display: "flex", flexDirection: "column", gap: 24 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  infoIcon: {
    display: "inline-flex",
    alignItems: "center",
    color: "var(--color-text-tertiary)",
    cursor: "help",
  },

  // SingleLineInput
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
  counter: {
    position: "absolute",
    top: "50%",
    insetInlineEnd: 16,
    transform: "translateY(-50%)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 12,
    color: "var(--color-text-tertiary)",
  },

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
    boxShadow: "var(--shadow-8)",
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

  // DateField
  dateWrap: { position: "relative" },
  dateTrigger: {
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
  dateValue: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.4,
  },
  dateInputHidden: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    pointerEvents: "none",
  },

  // SessionsControl
  sessionsRow: { display: "flex", alignItems: "center", gap: 24 },
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

  // Placeholder step
  placeholderWrap: { flex: 1, display: "flex", flexDirection: "column" },

  // Footer
  footerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerRight: { display: "flex", alignItems: "center", gap: 16 },
};
