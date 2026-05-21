"use client";

import React from "react";
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Check,
  Search,
  Send,
  Pencil,
  RefreshCw,
  Target,
  Gauge,
  BadgeCheck,
  Headset,
  Tag,
  AlertTriangle,
  X,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import FocusAreaStep, { isFocusAreaValid } from "./FocusAreaStep";
import { FOCUS_AREAS } from "./mocks/missionFocusAreas";
import { LEARNING_AGENTS } from "./mocks/learningAgents";
import { COVERAGE_DRIVERS } from "./mocks/missionCoverage";

// CreateTaskWizardPage — Create Task flow for the Ask Mira Pro module.
// Four steps + a transient Data Processing modal between steps 2 and 3.
// Shell, stepper, and footer mirror MissionWizardPage so the two wizards
// feel like siblings. Step bodies are local; FocusAreaStep is reused
// from Missions with parameterised title/subtitle and max-rows. Preview
// is task-specific. Controlled component — the wizard owner
// (app/page.jsx) keeps the draft + active step.

export const CREATE_TASK_STEPS = [
  { id: "skill", label: "Pick a Skill" },
  { id: "parameters", label: "Define Parameters" },
  { id: "focus", label: "Focus Area" },
  { id: "preview", label: "Preview & Publish" },
];

export const EMPTY_TASK_DRAFT = {
  skillId: null,
  parameters: {},
  focusArea: { rows: [], userClearedAll: false },
};

const PROCESSING_DELAY_MS = 4000;
const MAX_FOCUS_ROWS = 5;

// Skill catalogue — six skills per 06-askmirapro.md / 07-coaching-brief.md.
// Exported so the publish action in app/page.jsx can resolve the chosen
// skill into the task row added to the Tasks list.
export const SKILL_CATALOGUE = [
  {
    id: "coaching-brief",
    name: "Coaching Brief",
    iconName: "Target",
    tint: "purple",
    version: "v3.3",
    runs: 247,
    description: "Weekly per-agent brief from AutoQA — what's working, what to coach.",
  },
  {
    id: "csat-analysis",
    name: "CSAT Analysis",
    iconName: "Gauge",
    tint: "green",
    version: "v2.1",
    runs: 311,
    description: "Breaks customer satisfaction down by driver, channel, and segment.",
  },
  {
    id: "executive-briefing",
    name: "Executive Briefing",
    iconName: "BadgeCheck",
    tint: "teal",
    version: "v1.4",
    runs: 96,
    description: "Leadership-grade summary of the week's contact-centre performance.",
  },
  {
    id: "playbook-generation",
    name: "Playbook Generation",
    iconName: "Tag",
    tint: "orange",
    version: "v1.8",
    runs: 154,
    description: "Generates a targeted action plan to lift a specific outcome metric.",
  },
  {
    id: "fcr-analysis",
    name: "FCR Analysis",
    iconName: "Headset",
    tint: "pink",
    version: "v2.0",
    runs: 119,
    description: "Surfaces the workflow gaps blocking first-contact resolution.",
  },
  {
    id: "contact-driver-deep-dive",
    name: "Contact Driver Deep Dive",
    iconName: "AlertTriangle",
    tint: "red",
    version: "v1.2",
    runs: 73,
    description: "Drills into a single contact reason — volume, sentiment, resolution.",
  },
];

const SKILL_ICONS = { Target, Gauge, BadgeCheck, Headset, Tag, AlertTriangle };

const TINT = {
  purple: { bg: "var(--color-icon-tertiary-bg)", glyph: "var(--color-icon-tertiary-fg)" },
  green: { bg: "var(--color-success-bg)", glyph: "var(--color-success)" },
  teal: { bg: "var(--color-info-bg)", glyph: "var(--color-info)" },
  pink: { bg: "var(--color-error-bg)", glyph: "var(--color-secondary-500)" },
  orange: { bg: "var(--color-warning-bg)", glyph: "var(--color-warning)" },
  red: { bg: "var(--color-error-bg)", glyph: "var(--color-error)" },
};

const CHANNEL_OPTIONS = ["Voice", "Chat", "Email", "WhatsApp"];
const LANGUAGE_OPTIONS = ["English", "Spanish", "French", "German"];

// AI-suggested focus areas seeded into step 3 when the Data Processing
// modal completes (Coaching Brief demo).
const SUGGESTED_FOCUS = [
  { focusAreaId: "fa-refund-extension", target: 80 },
  { focusAreaId: "fa-empathy-deescalation", target: 80 },
  { focusAreaId: "fa-policy-accuracy", target: 80 },
];

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDateIso(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, "0")} ${MONTHS_SHORT[m - 1]} ${y}`;
}

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysAgoIso(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function defaultParameters() {
  return {
    agentId: null,
    startDate: daysAgoIso(7),
    endDate: todayIso(),
    channels: [],
    contactDrivers: [],
    language: "English",
  };
}

// suggestedFocusRows — fresh row ids per call so React keys stay stable.
function suggestedFocusRows() {
  return SUGGESTED_FOCUS.map((row, i) => ({
    id: `task-fa-suggested-${i}-${Date.now()}`,
    focusAreaId: row.focusAreaId,
    target: row.target,
    suggested: true,
  }));
}

// ---- Wizard shell -------------------------------------------------------

export default function CreateTaskWizardPage({
  step = "skill",
  draft,
  onChange,
  onStepChange,
  onCancel,
  onSave,
  onPublish,
}) {
  const data = draft || EMPTY_TASK_DRAFT;
  const idx = CREATE_TASK_STEPS.findIndex((s) => s.id === step);
  const safeIdx = idx === -1 ? 0 : idx;
  const isLast = safeIdx === CREATE_TASK_STEPS.length - 1;

  const [processing, setProcessing] = React.useState(false);
  const processingTimer = React.useRef(null);

  // Clean up timer if the wizard unmounts mid-processing.
  React.useEffect(() => {
    return () => {
      if (processingTimer.current) window.clearTimeout(processingTimer.current);
    };
  }, []);

  const dirty = isDirty(data);
  const stepValid = isStepValid(step, data);

  const requestCancel = () => {
    if (dirty) {
      const ok = typeof window !== "undefined"
        ? window.confirm("Discard changes? Your draft task will be lost.")
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
    // Between parameters → focus, run the simulated processing step.
    if (step === "parameters") {
      setProcessing(true);
      processingTimer.current = window.setTimeout(() => {
        // Seed AI-suggested focus rows when the user arrives at step 3.
        const nextDraft = {
          ...data,
          focusArea: { rows: suggestedFocusRows(), userClearedAll: false },
        };
        onChange?.(nextDraft);
        setProcessing(false);
        onStepChange?.("focus");
      }, PROCESSING_DELAY_MS);
      return;
    }
    onStepChange?.(CREATE_TASK_STEPS[safeIdx + 1].id);
  };

  const goBack = () => {
    if (safeIdx === 0) {
      requestCancel();
      return;
    }
    onStepChange?.(CREATE_TASK_STEPS[safeIdx - 1].id);
  };

  const jumpToStep = (id) => onStepChange?.(id);

  const skill = SKILL_CATALOGUE.find((s) => s.id === data.skillId) || null;

  return (
    <div style={cwStyles.column}>
      <Card padX={20} padY={16}>
        <Stepper
          steps={CREATE_TASK_STEPS}
          activeIndex={safeIdx}
          onBack={goBack}
        />
      </Card>

      <Card padX={32} padY={32} style={cwStyles.body}>
        {step === "skill" && (
          <PickSkillStep
            skillId={data.skillId}
            onSelect={(skillId) => onChange?.({ ...data, skillId })}
          />
        )}
        {step === "parameters" && (
          <DefineParametersStep
            skill={skill}
            parameters={data.parameters}
            onChange={(parameters) => onChange?.({ ...data, parameters })}
          />
        )}
        {step === "focus" && (
          <FocusAreaStep
            draft={data}
            onChange={onChange}
            subtitle="Set the quality metrics this brief should benchmark."
            maxRows={MAX_FOCUS_ROWS}
          />
        )}
        {step === "preview" && (
          <TaskPreviewStep
            skill={skill}
            parameters={data.parameters}
            focusRows={data.focusArea?.rows || []}
            onEditParameters={() => jumpToStep("parameters")}
            onEditFocus={() => jumpToStep("focus")}
          />
        )}
      </Card>

      <Card padX={24} padY={16}>
        <div style={cwStyles.footerRow}>
          <Button variant="text" uppercase={false} onClick={requestCancel}>
            Cancel
          </Button>
          <div style={cwStyles.footerRight}>
            <Button variant="text" uppercase={false} onClick={() => onSave?.(data)}>
              Save Draft
            </Button>
            <Button
              variant="primary"
              uppercase={false}
              disabled={!stepValid || processing}
              onClick={goNext}
              trailingIcon={isLast ? <Send size={14} /> : <ChevronRight size={16} />}
              style={{ height: 40, minWidth: 0, paddingInline: 20 }}
            >
              {isLast ? "Publish" : "Next"}
            </Button>
          </div>
        </div>
      </Card>

      {processing && <DataProcessingModal />}
    </div>
  );
}

// ---- Stepper ------------------------------------------------------------

function Stepper({ steps, activeIndex, onBack }) {
  return (
    <div style={cwStyles.stepperRow}>
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        style={cwStyles.backBtn}
      >
        <ArrowLeft size={20} />
      </button>
      <div style={cwStyles.stepperCrumbs}>
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
              <span style={{ ...cwStyles.crumbLabel, color, fontWeight: weight }}>
                {s.label}
              </span>
              {i < steps.length - 1 && (
                <ChevronRight size={14} color="var(--color-text-tertiary)" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ---- Step 1 — Pick a Skill ----------------------------------------------

function PickSkillStep({ skillId, onSelect }) {
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SKILL_CATALOGUE;
    return SKILL_CATALOGUE.filter((s) => s.name.toLowerCase().includes(q));
  }, [search]);

  const selected = SKILL_CATALOGUE.find((s) => s.id === skillId);

  return (
    <>
      <div style={cwStyles.titleBlock}>
        <div style={cwStyles.title}>Pick a Skill</div>
        <div style={cwStyles.subtitle}>
          Choose the AI skill you want to run as a task.
        </div>
      </div>

      <div style={cwStyles.searchWrap}>
        <Search size={18} color="var(--color-text-placeholder)" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search skills…"
          aria-label="Search skills"
          style={cwStyles.searchInput}
        />
      </div>

      <div style={cwStyles.skillGrid}>
        {filtered.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            selected={skill.id === skillId}
            onSelect={() => onSelect(skill.id)}
          />
        ))}
      </div>

      {selected && (
        <Card padX={20} padY={16} tone="muted" style={cwStyles.selectedBanner}>
          <SkillIconTile skill={selected} size={32} />
          <div style={cwStyles.selectedBannerText}>
            <span style={cwStyles.selectedBannerName}>{selected.name}</span>
            <span style={cwStyles.selectedBannerDesc}>{selected.description}</span>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            style={cwStyles.clearLink}
          >
            Change selection
          </button>
        </Card>
      )}
    </>
  );
}

function SkillCard({ skill, selected, onSelect }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...cwStyles.skillCard,
        background: selected
          ? "var(--color-primary-alpha-04)"
          : hover
            ? "var(--color-card-emoji-bg)"
            : "var(--surface-white)",
        border: selected
          ? "2px solid var(--color-button-primary-bg)"
          : "1px solid var(--color-divider-card)",
        padding: selected ? 19 : 20,
      }}
    >
      {selected && (
        <span style={cwStyles.skillCardBadge} aria-hidden="true">
          <Check size={12} color="var(--surface-white)" strokeWidth={3} />
        </span>
      )}
      <SkillIconTile skill={skill} size={40} />
      <span style={cwStyles.skillCardName}>{skill.name}</span>
      <span style={cwStyles.skillCardDesc}>{skill.description}</span>
      <div style={cwStyles.skillCardFooter}>
        <span style={cwStyles.versionChip}>{skill.version}</span>
        <span style={cwStyles.runsStat}>Runs: {skill.runs}</span>
      </div>
    </button>
  );
}

function SkillIconTile({ skill, size }) {
  const Icon = SKILL_ICONS[skill.iconName] || Target;
  const tint = TINT[skill.tint] || TINT.purple;
  const inner = Math.round(size * 0.5);
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        background: tint.bg,
        color: tint.glyph,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={inner} />
    </span>
  );
}

// ---- Step 2 — Define Parameters -----------------------------------------

function DefineParametersStep({ skill, parameters, onChange }) {
  // Seed sensible defaults on first mount when parameters is empty.
  React.useEffect(() => {
    if (!parameters || Object.keys(parameters).length === 0) {
      onChange(defaultParameters());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const p = (parameters && Object.keys(parameters).length > 0) ? parameters : defaultParameters();
  const setField = (key) => (next) => onChange({ ...p, [key]: next });

  return (
    <>
      <div style={cwStyles.titleBlock}>
        <div style={cwStyles.title}>Define Parameters</div>
        <div style={cwStyles.subtitle}>
          Set the inputs for your {skill ? skill.name : "task"} task.
        </div>
      </div>

      <div style={cwStyles.paramBanner}>
        Showing default parameter set — skill-specific schemas land in a follow-up.
      </div>

      <div style={cwStyles.fieldGrid}>
        <Field label="Agent" required>
          <SearchableDropdown
            value={p.agentId}
            onChange={setField("agentId")}
            options={LEARNING_AGENTS.map((a) => ({ value: a.id, label: a.name }))}
            placeholder="Select an agent"
          />
        </Field>

        <div style={cwStyles.row2}>
          <Field label="Start date" required>
            <DateField value={p.startDate} onChange={setField("startDate")} />
          </Field>
          <Field label="End date" required>
            <DateField value={p.endDate} onChange={setField("endDate")} />
          </Field>
        </div>

        <Field label="Channel">
          <MultiSelectDropdown
            values={p.channels || []}
            onChange={setField("channels")}
            options={CHANNEL_OPTIONS.map((c) => ({ value: c, label: c }))}
            placeholder="Any channel"
          />
        </Field>

        <Field label="Contact drivers (optional scope)">
          <MultiSelectDropdown
            values={p.contactDrivers || []}
            onChange={setField("contactDrivers")}
            options={COVERAGE_DRIVERS.map((d) => ({ value: d.id, label: d.label }))}
            placeholder="Any driver"
          />
        </Field>

        <Field label="Language">
          <Dropdown
            value={p.language}
            onChange={setField("language")}
            options={LANGUAGE_OPTIONS}
          />
        </Field>
      </div>
    </>
  );
}

// ---- Step 4 — Preview & Publish -----------------------------------------

function TaskPreviewStep({ skill, parameters, focusRows, onEditParameters, onEditFocus }) {
  const agent = LEARNING_AGENTS.find((a) => a.id === parameters?.agentId);
  const driverLabels = (parameters?.contactDrivers || [])
    .map((id) => {
      const d = COVERAGE_DRIVERS.find((x) => x.id === id);
      return d ? d.label : id;
    });

  return (
    <>
      <div style={cwStyles.titleBlock}>
        <div style={cwStyles.title}>Preview & Publish</div>
        <div style={cwStyles.subtitle}>
          Review the task before publishing. Mira begins generating as soon as you publish.
        </div>
      </div>

      <div style={cwStyles.previewGrid}>
        <Card padX={24} padY={20} tone="default" style={cwStyles.previewCard}>
          <div style={cwStyles.previewHead}>
            <div style={cwStyles.previewHeadLeft}>
              {skill && <SkillIconTile skill={skill} size={32} />}
              <span style={cwStyles.previewHeadName}>
                {skill ? skill.name : "Task"}
              </span>
            </div>
            <button
              type="button"
              onClick={onEditParameters}
              aria-label="Edit parameters"
              style={cwStyles.editIcon}
            >
              <Pencil size={14} />
            </button>
          </div>
          <RoField label="AGENT" value={agent ? agent.name : "—"} />
          <RoField
            label="DATE RANGE"
            value={
              parameters?.startDate && parameters?.endDate
                ? `${formatDateIso(parameters.startDate)} → ${formatDateIso(parameters.endDate)}`
                : "—"
            }
          />
          <RoField
            label="CHANNELS"
            value={(parameters?.channels || []).join(", ") || "Any"}
          />
          <RoField
            label="CONTACT DRIVERS"
            value={driverLabels.join(", ") || "Any"}
          />
          <RoField label="LANGUAGE" value={parameters?.language || "English"} />
        </Card>

        <Card padX={24} padY={20} tone="default" style={cwStyles.previewCard}>
          <div style={cwStyles.previewHead}>
            <span style={cwStyles.previewSectionTitle}>
              Focus Areas ({focusRows.length})
            </span>
            <button
              type="button"
              onClick={onEditFocus}
              aria-label="Edit focus areas"
              style={cwStyles.editIcon}
            >
              <Pencil size={14} />
            </button>
          </div>
          <div style={cwStyles.focusList}>
            {focusRows.map((row) => {
              const fa = FOCUS_AREAS.find((f) => f.id === row.focusAreaId);
              if (!fa) return null;
              return (
                <div key={row.id} style={cwStyles.focusChip}>
                  <span style={cwStyles.focusChipLabel}>{fa.label}</span>
                  <span style={cwStyles.focusChipTarget}>Target {row.target}%</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}

function RoField({ label, value }) {
  return (
    <div style={cwStyles.roField}>
      <span style={cwStyles.roLabel}>{label}</span>
      <span style={cwStyles.roValue}>{value}</span>
    </div>
  );
}

// ---- Data Processing modal ----------------------------------------------

function DataProcessingModal() {
  return (
    <div style={cwStyles.modalScrim} aria-hidden="true">
      <div onClick={(e) => e.stopPropagation()}>
        <Card shadow padX={32} padY={28} style={cwStyles.modalDialog}>
          <RefreshCw
            size={48}
            color="var(--color-button-primary-bg)"
            style={{ animation: "spin 1s linear infinite" }}
            aria-label="Processing"
          />
          <div style={cwStyles.modalHeading}>Processing your inputs</div>
          <div style={cwStyles.modalBody}>
            Mira is analyzing the parameters you set to suggest focus areas.
            This usually takes a few seconds.
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---- Field primitives ---------------------------------------------------

function Field({ label, required, children }) {
  return (
    <div style={cwStyles.field}>
      <label style={cwStyles.label}>
        <span>{label}</span>
        {required && <span style={cwStyles.requiredMark}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Dropdown({ value, onChange, options, placeholder }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={cwStyles.ddWrap}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={cwStyles.ddTrigger}>
        <span
          style={{
            ...cwStyles.ddValue,
            color: value ? "var(--color-text-deep)" : "var(--color-text-placeholder)",
          }}
        >
          {value || placeholder || "Select"}
        </span>
        <ChevronDown size={18} color="var(--color-text-tertiary)" />
      </button>
      {open && (
        <div style={cwStyles.ddMenu}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              style={{
                ...cwStyles.ddOption,
                fontWeight: opt === value ? 600 : 400,
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchableDropdown({ value, onChange, options, placeholder }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <div ref={ref} style={cwStyles.ddWrap}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={cwStyles.ddTrigger}>
        <span
          style={{
            ...cwStyles.ddValue,
            color: selected ? "var(--color-text-deep)" : "var(--color-text-placeholder)",
          }}
        >
          {selected ? selected.label : placeholder || "Select"}
        </span>
        <ChevronDown size={18} color="var(--color-text-tertiary)" />
      </button>
      {open && (
        <div style={cwStyles.ddMenu}>
          <div style={cwStyles.searchInDd}>
            <Search size={16} color="var(--color-text-placeholder)" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              style={cwStyles.searchInDdInput}
            />
          </div>
          <div style={cwStyles.ddScroll}>
            {filtered.map((opt) => {
              const isSel = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  style={{
                    ...cwStyles.ddOption,
                    fontWeight: isSel ? 600 : 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{opt.label}</span>
                  {isSel && <Check size={16} color="var(--color-button-primary-bg)" />}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div style={cwStyles.ddEmpty}>No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MultiSelectDropdown({ values, onChange, options, placeholder }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const toggle = (v) => {
    if (values.includes(v)) {
      onChange(values.filter((x) => x !== v));
    } else {
      onChange([...values, v]);
    }
  };

  const selectedLabels = values
    .map((v) => options.find((o) => o.value === v)?.label)
    .filter(Boolean)
    .join(", ");

  return (
    <div ref={ref} style={cwStyles.ddWrap}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={cwStyles.ddTrigger}>
        <span
          style={{
            ...cwStyles.ddValue,
            color: selectedLabels ? "var(--color-text-deep)" : "var(--color-text-placeholder)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          {selectedLabels || placeholder || "Select"}
        </span>
        <ChevronDown size={18} color="var(--color-text-tertiary)" />
      </button>
      {open && (
        <div style={cwStyles.ddMenu}>
          <div style={cwStyles.ddScroll}>
            {options.map((opt) => {
              const isSel = values.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  style={{
                    ...cwStyles.ddOption,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{
                    ...cwStyles.checkbox,
                    background: isSel ? "var(--color-button-primary-bg)" : "var(--surface-white)",
                    borderColor: isSel ? "var(--color-button-primary-bg)" : "var(--color-divider-card)",
                  }}>
                    {isSel && <Check size={12} color="var(--surface-white)" strokeWidth={3} />}
                  </span>
                  <span style={{ fontWeight: isSel ? 600 : 400 }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DateField({ value, onChange }) {
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
    <div style={cwStyles.dateWrap}>
      <button type="button" onClick={openPicker} style={cwStyles.dateTrigger}>
        <span
          style={{
            ...cwStyles.dateValue,
            color: isFilled ? "var(--color-text-deep)" : "var(--color-text-placeholder)",
          }}
        >
          {isFilled ? formatDateIso(value) : "Select a date"}
        </span>
        <Calendar size={18} color="var(--color-text-tertiary)" />
      </button>
      <input
        ref={inputRef}
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={cwStyles.dateInputHidden}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}

// ---- Validation ---------------------------------------------------------

function isStepValid(step, draft) {
  if (step === "skill") {
    return Boolean(draft.skillId);
  }
  if (step === "parameters") {
    const p = draft.parameters || {};
    return Boolean(p.agentId && p.startDate && p.endDate);
  }
  if (step === "focus") {
    return isFocusAreaValid(draft);
  }
  if (step === "preview") {
    return (
      Boolean(draft.skillId) &&
      Boolean(draft.parameters?.agentId) &&
      Boolean(draft.parameters?.startDate) &&
      Boolean(draft.parameters?.endDate) &&
      isFocusAreaValid(draft)
    );
  }
  return true;
}

function isDirty(draft) {
  if (draft.skillId) return true;
  const p = draft.parameters || {};
  if (Object.keys(p).length > 0) return true;
  const rows = draft.focusArea?.rows || [];
  return rows.length > 0;
}

// ---- Styles -------------------------------------------------------------

const cwStyles = {
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

  // Footer
  footerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerRight: { display: "flex", alignItems: "center", gap: 16 },

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

  // Search row
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    color: "var(--color-text-deep)",
  },

  // Skill grid
  skillGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
  },
  skillCard: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    minHeight: 140,
    borderRadius: 12,
    cursor: "pointer",
    textAlign: "left",
    fontFamily: '"Mulish", sans-serif',
    transition: "background 120ms ease, border-color 120ms ease",
  },
  skillCardBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 16,
    height: 16,
    borderRadius: 999,
    background: "var(--color-button-primary-bg)",
    display: "grid",
    placeItems: "center",
  },
  skillCardName: {
    fontSize: 14,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    lineHeight: 1.3,
  },
  skillCardDesc: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    lineHeight: 1.5,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  skillCardFooter: {
    marginTop: "auto",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  versionChip: {
    display: "inline-flex",
    padding: "2px 8px",
    borderRadius: 999,
    background: "var(--color-card-emoji-bg)",
    color: "var(--color-text-medium)",
    fontSize: 11,
    fontWeight: 600,
  },
  runsStat: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
  },

  // Selected banner
  selectedBanner: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  selectedBannerText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
    flex: 1,
  },
  selectedBannerName: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  selectedBannerDesc: {
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },
  clearLink: {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
    color: "var(--color-button-primary-bg)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 500,
  },

  // Define Parameters
  paramBanner: {
    padding: "10px 14px",
    borderRadius: 8,
    background: "var(--color-warning-bg)",
    color: "var(--color-warning-text)",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 500,
  },
  fieldGrid: { display: "flex", flexDirection: "column", gap: 24 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-medium)",
    lineHeight: 1.4,
  },
  requiredMark: {
    color: "var(--color-error-text)",
    fontSize: 13,
    fontWeight: 700,
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
    gap: 12,
  },
  ddValue: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 400,
    lineHeight: 1.4,
    flex: 1,
    textAlign: "left",
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
  ddScroll: {
    maxHeight: 280,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  ddOption: {
    padding: "12px 16px",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    color: "var(--color-text-deep)",
    cursor: "pointer",
    background: "transparent",
    border: "none",
    textAlign: "left",
    width: "100%",
  },
  ddEmpty: {
    padding: "12px 16px",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    color: "var(--color-text-tertiary)",
  },
  searchInDd: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  searchInDdInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    color: "var(--color-text-deep)",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    border: "1px solid var(--color-divider-card)",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
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

  // Data Processing modal
  modalScrim: {
    position: "fixed",
    inset: 0,
    background: "var(--overlay-selected)",
    display: "grid",
    placeItems: "center",
    zIndex: 60,
  },
  modalDialog: {
    width: 440,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  modalHeading: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 18,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    textAlign: "center",
    lineHeight: 1.3,
  },
  modalBody: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    textAlign: "center",
    lineHeight: 1.5,
    maxWidth: 360,
  },

  // Preview
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    gap: 24,
    alignItems: "start",
  },
  previewCard: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  previewHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  previewHeadLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  previewHeadName: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  previewSectionTitle: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 16,
    fontWeight: 700,
    color: "var(--color-text-deep)",
  },
  editIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
    color: "var(--color-text-tertiary)",
    flexShrink: 0,
  },
  roField: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  roLabel: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 11,
    fontWeight: 700,
    color: "var(--color-text-tertiary)",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  roValue: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  focusList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  focusChip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 14px",
    borderRadius: 8,
    background: "var(--color-card-emoji-bg)",
  },
  focusChipLabel: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  focusChipTarget: {
    fontFamily: '"Mulish", sans-serif',
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
};
