"use client";

import React from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  X,
  Sparkles,
  CheckCircle2,
  Check,
  AlertTriangle,
  Circle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Banner from "./Banner";
import VersionBar from "./VersionBar";
import {
  GUIDED_DRILL_META,
  GUIDED_DRILL_STEPS,
  GUIDED_DRILL_EVAL,
  GUIDED_DRILL_PHASES,
  formatDrillTimer,
} from "./mocks/guidedDrill";

// DrillGuidedSessionPage — the assisted "safety wheel" Drill experience.
// Three design directions (Rev 2, Jun 16 lock) ride behind one switcher:
//   "Stack" — vertical card stack: previous/current/next (D1)
//   "Coach" — phase ribbon + single coach card (D4)
//   "Rail"  — accordion rail with full checklist (D5)
//
// Locked constraints (Jun 16):
//   - Progressive disclosure: prev/current/next three-position view
//   - No transcript in guided view
//   - Step / Script / Knowledge-card triplet per step
//   - Five universal stages: Open → Verify → Discover → Act → Close

const DIRECTIONS = [
  { id: "stack", label: "Stack" },
  { id: "coach", label: "Coach" },
  { id: "rail", label: "Rail" },
];
const DIRECTION_VERSIONS = DIRECTIONS.map((d) => ({ ...d, iterations: [] }));

function stepStateMeta(state) {
  switch (state) {
    case "done":
      return {
        Icon: CheckCircle2,
        iconColor: "var(--color-success)",
        labelColor: "var(--color-success-text)",
        label: "Done",
      };
    case "active":
      return {
        Icon: null,
        iconColor: "var(--color-button-primary-bg)",
        labelColor: "var(--color-button-primary-bg)",
        label: "Now",
      };
    case "skipped":
      return {
        Icon: AlertTriangle,
        iconColor: "var(--color-warning-dark)",
        labelColor: "var(--color-warning-text)",
        label: "Skipped — no evidence",
      };
    default:
      return {
        Icon: Circle,
        iconColor: "var(--color-text-tertiary)",
        labelColor: "var(--color-text-tertiary)",
        label: "Pending",
      };
  }
}

export default function DrillGuidedSessionPage({ onEnd }) {
  const meta = GUIDED_DRILL_META;

  const [variant, setVariant] = React.useState("stack");
  const [steps, setSteps] = React.useState(GUIDED_DRILL_STEPS);
  const [muted, setMuted] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(meta.totalSeconds);
  const [ended, setEnded] = React.useState(false);

  const activeStep = steps.find((s) => s.state === "active") || null;
  const skippedSteps = steps.filter((s) => s.state === "skipped" && s.mandatory);
  const doneCount = steps.filter((s) => s.state === "done").length;
  const activeIdx = activeStep ? steps.findIndex((s) => s.id === activeStep.id) : -1;
  const prevStep = activeIdx > 0 ? steps[activeIdx - 1] : null;
  const nextStep = activeIdx >= 0 && activeIdx < steps.length - 1 ? steps[activeIdx + 1] : null;

  React.useEffect(() => {
    if (ended) return undefined;
    if (secondsLeft <= 0) {
      setEnded(true);
      return undefined;
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft, ended]);

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) => {
          if (s.id === "diagnose") return { ...s, state: "done", at: "0:58" };
          if (s.id === "explain-ipc") return { ...s, state: "active" };
          return s;
        }),
      );
    }, 7000);
    return () => window.clearTimeout(id);
  }, []);

  const endCall = () => setEnded(true);

  const phases = GUIDED_DRILL_PHASES.map((p) => {
    const phaseSteps = steps.filter((s) => s.phase === p.id);
    const allDone = phaseSteps.length > 0 && phaseSteps.every((s) => s.state === "done");
    const hasCurrent = phaseSteps.some((s) => s.state === "active");
    return {
      ...p,
      state: allDone ? "done" : hasCurrent ? "current" : p.state,
    };
  });

  return (
    <div style={styles.outer}>
      <div style={styles.card}>
        <SessionHeader meta={meta} doneCount={doneCount} total={steps.length} onClose={onEnd} />

        <div role="status" aria-live="polite" style={styles.srOnly}>
          {!ended && activeStep && `Current step: ${activeStep.label}. ${doneCount} of ${steps.length} steps done.`}
          {!ended && skippedSteps.length > 0 &&
            ` ${skippedSteps.length} mandatory step skipped: ${skippedSteps.map((s) => s.label).join(", ")}.`}
        </div>

        {ended ? (
          <EvalResult onBackToDrill={onEnd} onUnassisted={onEnd} />
        ) : (
          <div style={styles.body}>
            <PersonaColumn
              meta={meta}
              muted={muted}
              secondsLeft={secondsLeft}
              onToggleMute={() => setMuted((m) => !m)}
              onEnd={endCall}
              skippedSteps={skippedSteps}
            />
            {variant === "stack" && (
              <VariantStack
                steps={steps}
                activeStep={activeStep}
                prevStep={prevStep}
                nextStep={nextStep}
                doneCount={doneCount}
                skippedSteps={skippedSteps}
                phases={phases}
              />
            )}
            {variant === "coach" && (
              <VariantCoach
                steps={steps}
                activeStep={activeStep}
                prevStep={prevStep}
                nextStep={nextStep}
                doneCount={doneCount}
                skippedSteps={skippedSteps}
                phases={phases}
              />
            )}
            {variant === "rail" && (
              <VariantRail
                steps={steps}
                activeStep={activeStep}
                doneCount={doneCount}
                skippedSteps={skippedSteps}
                phases={phases}
              />
            )}
          </div>
        )}
      </div>

      {!ended && (
        <VersionBar
          tabsMode
          versions={DIRECTION_VERSIONS}
          baselineOptions={[]}
          value={{ versionId: variant, iterationId: null }}
          onChange={({ versionId }) => setVariant(versionId)}
        />
      )}
    </div>
  );
}

// ---- Header ---------------------------------------------------------------

function SessionHeader({ meta, doneCount, total, onClose }) {
  return (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        <span style={styles.workflowTitle}>{meta.workflowTitle}</span>
        <span style={styles.headerDot} aria-hidden="true" />
        <span style={styles.scenarioTitle}>{meta.scenarioTitle}</span>
        <span style={styles.headerDot} aria-hidden="true" />
        <span style={styles.interactionId}>ID – {meta.interactionId}</span>
      </div>
      <div style={styles.headerRight}>
        <span style={styles.safetyPill}>
          <ShieldCheck size={14} color="var(--color-info-text)" aria-hidden="true" />
          <span style={styles.safetyPillLabel}>Safety wheel on</span>
        </span>
        <span style={styles.sessionsCount}>
          Session {meta.sessionsUsed} of {meta.sessionsAllowed}
        </span>
        <span style={styles.headerDot} aria-hidden="true" />
        <span style={styles.progressCount}>{doneCount}/{total} steps</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Exit guided drill"
          className="drill-focusable"
          style={styles.iconBtn}
        >
          <X size={18} color="var(--color-text-tertiary)" />
        </button>
      </div>
    </header>
  );
}

// ---- Persona column (left side — shared) ----------------------------------

function PersonaColumn({ meta, muted, secondsLeft, onToggleMute, onEnd, skippedSteps }) {
  return (
    <aside style={styles.personaCol}>
      <div style={styles.personaStack}>
        <Orb initials={meta.initials} muted={muted} />
        <div style={styles.personaInfo}>
          <span style={styles.personaName}>{meta.customerName}</span>
          <span style={styles.personaSub}>
            {muted ? "Mic muted — tap to resume" : "Simulated customer · live"}
          </span>
        </div>
        <div style={styles.scenarioBlock}>
          <span style={styles.scenarioHeading}>{meta.workflowTitle}</span>
          <p style={styles.scenarioBody}>{meta.scenarioBody}</p>
        </div>
        <TimerPill secondsLeft={secondsLeft} />
      </div>

      {skippedSteps.length > 0 && (
        <div style={styles.skipAlert}>
          <Banner
            tone="warning"
            heading={`${skippedSteps.length} mandatory step skipped`}
            body={`No evidence: ${skippedSteps.map((s) => s.label).join(", ")}.`}
          />
        </div>
      )}

      <div style={styles.controlsRow}>
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Unmute microphone" : "Mute microphone"}
          aria-pressed={muted}
          className="drill-focusable"
          style={styles.mutePill}
        >
          {muted ? <MicOff size={20} color="var(--color-text-deep)" /> : <Mic size={20} color="var(--color-text-deep)" />}
        </button>
        <button
          type="button"
          onClick={onEnd}
          aria-label="End call and see result"
          className="drill-focusable"
          style={styles.endPill}
        >
          <PhoneOff size={20} color="var(--surface-white)" />
        </button>
      </div>

      <p style={styles.disclaimer}>
        Practice mode — the safety wheel is on, so this attempt won't count toward your readiness profile.
      </p>
    </aside>
  );
}

function Orb({ initials, muted }) {
  return (
    <div style={styles.orbWrap}>
      <span
        className="orbPulseAnimated"
        style={{ ...styles.orbRingOuter, opacity: muted ? 0.4 : 1 }}
        aria-hidden="true"
      />
      <span
        className="orbPulseAnimated"
        style={{ ...styles.orbRingMid, opacity: muted ? 0.5 : 1 }}
        aria-hidden="true"
      />
      <span style={styles.orb} aria-hidden="true">
        <span style={styles.orbInitials}>{initials}</span>
      </span>
    </div>
  );
}

function TimerPill({ secondsLeft }) {
  return (
    <span style={styles.timerPill}>
      <span style={styles.timerDot} aria-hidden="true" />
      <span style={styles.timerLabel}>{formatDrillTimer(secondsLeft)} min left</span>
    </span>
  );
}

// ---- Shared step widgets --------------------------------------------------

function StepStatus({ state }) {
  const meta = stepStateMeta(state);
  if (state === "active") {
    return (
      <span style={styles.statusInline}>
        <span style={styles.activeDot} aria-hidden="true" />
        <span style={{ ...styles.statusLabel, color: meta.labelColor }}>{meta.label}</span>
      </span>
    );
  }
  const Icon = meta.Icon;
  return (
    <span style={styles.statusInline}>
      <Icon size={15} color={meta.iconColor} aria-hidden="true" />
      <span style={{ ...styles.statusLabel, color: meta.labelColor }}>{meta.label}</span>
    </span>
  );
}

function MandatoryTag({ mandatory }) {
  return (
    <span
      style={{
        ...styles.metaTag,
        color: mandatory ? "var(--color-text-medium)" : "var(--color-text-placeholder)",
        background: mandatory ? "var(--color-chip-bg)" : "transparent",
      }}
    >
      {mandatory ? "Mandatory" : "Optional"}
    </span>
  );
}

function PhaseStrip({ phases }) {
  const labelColor = (state) =>
    state === "pending" ? "var(--color-text-tertiary)" : "var(--color-icon-tertiary-fg)";
  const underline = (state) =>
    state === "current"
      ? "var(--color-icon-tertiary-fg)"
      : state === "done"
      ? "var(--color-border-tab)"
      : "var(--color-divider-card)";
  return (
    <ol style={styles.phaseStrip} role="list">
      {phases.map((p) => (
        <li key={p.id} role="listitem" style={styles.phaseItem} aria-current={p.state === "current" ? "step" : undefined}>
          <span style={{ ...styles.phaseLabel, color: labelColor(p.state) }}>{p.label}</span>
          <span style={{ ...styles.phaseUnderline, background: underline(p.state) }} aria-hidden="true" />
        </li>
      ))}
    </ol>
  );
}

function ScriptBlock({ script }) {
  const [open, setOpen] = React.useState(false);
  if (!script) return null;
  return (
    <div style={styles.assetBlock}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="drill-focusable"
        style={styles.assetToggle}
      >
        <Sparkles size={13} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
        <span style={styles.assetToggleLabel}>{open ? "Hide script" : "Show script"}</span>
        <ChevronDown
          size={14}
          color="var(--color-icon-tertiary-fg)"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }}
        />
      </button>
      {open && <p style={styles.assetBody}>{script}</p>}
    </div>
  );
}

function KnowledgeCardBlock({ knowledgeCard }) {
  const [open, setOpen] = React.useState(false);
  if (!knowledgeCard) return null;
  return (
    <div style={styles.assetBlock}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="drill-focusable"
        style={styles.assetToggle}
      >
        <BookOpen size={13} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
        <span style={styles.assetToggleLabel}>{open ? "Hide knowledge" : knowledgeCard.title}</span>
        <ChevronDown
          size={14}
          color="var(--color-icon-tertiary-fg)"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }}
        />
      </button>
      {open && <p style={styles.assetBody}>{knowledgeCard.body}</p>}
    </div>
  );
}

function EqBars({ tone = "var(--color-icon-tertiary-fg)" }) {
  const heights = [6, 13, 9, 12];
  return (
    <span style={styles.eqBars} aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          style={{
            ...styles.eqBar,
            height: h,
            background: tone,
            animation: "drillEq 0.25s ease-in-out infinite alternate",
            animationDelay: `${i * 0.06}s`,
          }}
        />
      ))}
    </span>
  );
}

// ===========================================================================
// VARIANT A — Vertical Card Stack (D1)
// Three vertically stacked cards: prev (collapsed), current (expanded with
// script + knowledge card), next (teased). Phase breadcrumb at top.
// ===========================================================================

function VariantStack({ steps, activeStep, prevStep, nextStep, doneCount, phases }) {
  const [showAll, setShowAll] = React.useState(false);
  return (
    <aside style={styles.guidancePanel} aria-label="Guided workflow — Stack">
      <GuidanceHeader doneCount={doneCount} total={steps.length} />
      <PhaseStrip phases={phases} />
      <div style={styles.stackScroll}>
        {prevStep && (
          <div style={styles.stackPrev}>
            <StepStatus state={prevStep.state} />
            <span style={styles.stackPrevLabel}>{prevStep.label}</span>
            {prevStep.at && <span style={styles.stackPrevTime}>{prevStep.at}</span>}
          </div>
        )}

        {activeStep && (
          <div style={styles.stackCurrent} aria-current="step">
            <div style={styles.stackCurrentHead}>
              <span style={styles.activeDot} aria-hidden="true" />
              <div style={styles.stackCurrentMeta}>
                <span style={styles.stackCurrentTag}>Current step</span>
                <span style={styles.stackCurrentLabel}>{activeStep.label}</span>
              </div>
              <MandatoryTag mandatory={activeStep.mandatory} />
            </div>
            <p style={styles.stackCurrentDetail}>{activeStep.detail}</p>
            <ScriptBlock script={activeStep.script} />
            <KnowledgeCardBlock knowledgeCard={activeStep.knowledgeCard} />
          </div>
        )}

        {nextStep && (
          <div style={styles.stackNext}>
            <span style={styles.stackNextTag}>Up next</span>
            <span style={styles.stackNextLabel}>{nextStep.label}</span>
            <span style={styles.stackNextDetail}>{nextStep.detail}</span>
          </div>
        )}

        {!activeStep && doneCount === steps.length && (
          <div style={styles.completionBanner}>
            <CheckCircle2 size={24} color="var(--color-success)" />
            <span style={styles.completionLabel}>All steps completed</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowAll((o) => !o)}
          aria-expanded={showAll}
          className="drill-focusable"
          style={styles.showAllBtn}
        >
          {showAll ? "Hide all steps" : "Show all steps"}
          <ChevronDown
            size={16}
            color="var(--color-button-primary-bg)"
            style={{ transform: showAll ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }}
          />
        </button>

        {showAll && (
          <ol style={styles.allStepsList} role="list">
            {steps.map((step, i) => (
              <li key={step.id} role="listitem" style={styles.allStepRow}>
                <span style={styles.allStepIndex}>{i + 1}</span>
                <StepStatus state={step.state} />
                <span style={styles.allStepLabel}>{step.label}</span>
                <MandatoryTag mandatory={step.mandatory} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}

// ===========================================================================
// VARIANT B — Coach Card + Phase Ribbon (D4)
// Phase ribbon below header. Single large coach card showing only the
// current step in full detail. Previous summary above, next teaser below.
// ===========================================================================

function VariantCoach({ steps, activeStep, prevStep, nextStep, doneCount, phases }) {
  const [showAll, setShowAll] = React.useState(false);
  return (
    <aside style={styles.guidancePanel} aria-label="Guided workflow — Coach">
      <GuidanceHeader doneCount={doneCount} total={steps.length} />
      <PhaseStrip phases={phases} />
      <div style={styles.coachScroll}>
        {prevStep && (
          <div style={styles.coachPrev}>
            <Check size={14} color="var(--color-success)" aria-hidden="true" />
            <span style={styles.coachPrevLabel}>
              {prevStep.label}
              {prevStep.at && <span style={styles.coachPrevTime}> · {prevStep.at}</span>}
            </span>
          </div>
        )}

        {activeStep && (
          <Card tone="outline" padX={20} padY={20} style={styles.coachCard}>
            <div style={styles.coachCardHead}>
              <span style={styles.activeDot} aria-hidden="true" />
              <span style={styles.coachCardTag}>Current step</span>
              <MandatoryTag mandatory={activeStep.mandatory} />
            </div>
            <span style={styles.coachCardLabel}>{activeStep.label}</span>
            <p style={styles.coachCardDetail}>{activeStep.detail}</p>

            {activeStep.script && (
              <div style={styles.coachScript}>
                <span style={styles.coachScriptHead}>
                  <Sparkles size={12} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
                  Script
                </span>
                <p style={styles.coachScriptBody}>{activeStep.script}</p>
              </div>
            )}

            <KnowledgeCardBlock knowledgeCard={activeStep.knowledgeCard} />
          </Card>
        )}

        {nextStep && (
          <div style={styles.coachNext}>
            <span style={styles.coachNextTag}>Up next</span>
            <span style={styles.coachNextLabel}>{nextStep.label}</span>
            {nextStep.mandatory && <MandatoryTag mandatory />}
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowAll((o) => !o)}
          aria-expanded={showAll}
          className="drill-focusable"
          style={styles.showAllBtn}
        >
          {showAll ? "Hide all steps" : "Show all steps"}
          <ChevronDown
            size={16}
            color="var(--color-button-primary-bg)"
            style={{ transform: showAll ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }}
          />
        </button>

        {showAll && (
          <ol style={styles.allStepsList} role="list">
            {steps.map((step, i) => (
              <li key={step.id} role="listitem" style={styles.allStepRow}>
                <span style={styles.allStepIndex}>{i + 1}</span>
                <StepStatus state={step.state} />
                <span style={styles.allStepLabel}>{step.label}</span>
                <MandatoryTag mandatory={step.mandatory} />
              </li>
            ))}
          </ol>
        )}

        {!activeStep && doneCount === steps.length && (
          <div style={styles.coachDone}>
            <CheckCircle2 size={28} color="var(--color-success)" />
            <span style={styles.coachDoneLabel}>All steps completed</span>
          </div>
        )}
      </div>
    </aside>
  );
}

// ===========================================================================
// VARIANT C — Accordion Rail (D5)
// Full checklist as collapsed accordion rows. Current step auto-expanded.
// Phase section headers divide the list.
// ===========================================================================

function VariantRail({ steps, activeStep, doneCount, phases }) {
  const [expandedId, setExpandedId] = React.useState(null);
  const activeRef = React.useRef(null);

  React.useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeStep?.id]);

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  return (
    <aside style={styles.guidancePanel} aria-label="Guided workflow — Rail">
      <GuidanceHeader doneCount={doneCount} total={steps.length} />
      <PhaseStrip phases={phases} />
      <div style={styles.railScroll}>
        {phases.map((phase) => {
          const phaseSteps = steps.filter((s) => s.phase === phase.id);
          if (phaseSteps.length === 0) return null;
          return (
            <div key={phase.id} style={styles.railPhaseGroup}>
              <span style={styles.railPhaseLabel}>{phase.label}</span>
              {phaseSteps.map((step) => {
                const isActive = step.state === "active";
                const isExpanded = isActive || expandedId === step.id;
                return (
                  <div
                    key={step.id}
                    ref={isActive ? activeRef : undefined}
                    style={{
                      ...styles.railRow,
                      ...(isActive ? styles.railRowActive : {}),
                      ...(step.state === "skipped" ? styles.railRowSkipped : {}),
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(step.id)}
                      aria-expanded={isExpanded}
                      className="drill-focusable"
                      style={styles.railRowHead}
                    >
                      <StepStatusDot state={step.state} />
                      <span style={styles.railRowLabel}>{step.label}</span>
                      <MandatoryTag mandatory={step.mandatory} />
                      <ChevronDown
                        size={14}
                        color="var(--color-text-tertiary)"
                        style={{ marginLeft: "auto", flexShrink: 0, transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }}
                      />
                    </button>
                    {isExpanded && (
                      <div style={styles.railExpanded}>
                        <p style={styles.railDetail}>{step.detail}</p>
                        <ScriptBlock script={step.script} />
                        <KnowledgeCardBlock knowledgeCard={step.knowledgeCard} />
                        {step.at && (
                          <span style={styles.railAt}>
                            Auto-detected at {step.at}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
        {!activeStep && doneCount === steps.length && (
          <div style={styles.completionBanner}>
            <CheckCircle2 size={24} color="var(--color-success)" />
            <span style={styles.completionLabel}>All steps completed</span>
          </div>
        )}
      </div>
    </aside>
  );
}

function StepStatusDot({ state }) {
  const meta = stepStateMeta(state);
  if (state === "active") {
    return <span style={styles.activeDot} aria-hidden="true" />;
  }
  if (state === "done") {
    return (
      <span style={styles.railDotDone} aria-hidden="true">
        <Check size={12} color="var(--surface-white)" />
      </span>
    );
  }
  if (state === "skipped") {
    return <AlertTriangle size={16} color={meta.iconColor} aria-hidden="true" />;
  }
  return <Circle size={14} color={meta.iconColor} aria-hidden="true" />;
}

// ---- Shared guidance header -----------------------------------------------

function GuidanceHeader({ doneCount, total }) {
  return (
    <div style={styles.guideHead}>
      <span style={styles.guideTitle}>Guided workflow</span>
      <span style={styles.listenPill}>
        <EqBars tone="var(--color-icon-tertiary-fg)" />
        Listening
      </span>
      <div style={{ flex: 1 }} />
      <span style={styles.gprog}>
        <b style={styles.gprogNum}>{doneCount}</b> of {total} steps
      </span>
    </div>
  );
}

// ---- Post-session eval (shared) -------------------------------------------

function EvalResult({ onBackToDrill, onUnassisted }) {
  const e = GUIDED_DRILL_EVAL;
  const tiles = [
    { label: "Overall score (excluded)", value: `${e.overallScore}%` },
    { label: "Steps completed", value: `${e.stepsDone} of ${e.stepsTotal}` },
    { label: "Mandatory steps skipped", value: String(e.mandatorySkipped) },
    { label: "Phrasing hints reviewed", value: String(e.hintsReviewed) },
  ];
  return (
    <div style={styles.evalScroll}>
      <div style={styles.evalInner}>
        <Banner
          tone="info"
          heading="This attempt isn't counted toward your readiness profile"
          body="The safety wheel was on, so the score below is for your visibility only — it's an assisted-mode attempt, the same exclusion used for calibration mode. Your readiness comes from unassisted practice."
        />

        <Card tone="outline" padX={28} padY={24} style={styles.evalCard}>
          <span style={styles.evalCardTitle}>How the guided attempt went</span>
          <div style={styles.evalTiles}>
            {tiles.map((t) => (
              <div key={t.label} style={styles.evalTile}>
                <span style={styles.evalTileValue}>{t.value}</span>
                <span style={styles.evalTileLabel}>{t.label}</span>
              </div>
            ))}
          </div>
          <div style={styles.evalBranchRow}>
            <span style={styles.evalTileLabel}>Branch executed</span>
            <span style={styles.evalBranchValue}>{e.branchExecuted}</span>
          </div>
        </Card>

        <Card tone="muted" padX={28} padY={24} style={styles.evalReadyCard}>
          <span style={styles.evalReadyTitle}>Ready to drill without the training wheel?</span>
          <span style={styles.evalReadyBody}>
            Run the same scenario unassisted to get a score that counts toward your readiness profile.
          </span>
          <div style={styles.evalActions}>
            <Button variant="primary" onClick={onUnassisted} className="drill-focusable">
              Practice without the wheel
            </Button>
            <Button variant="text" uppercase={false} onClick={onBackToDrill} className="drill-focusable">
              Back to Drill library
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ---- Styles ---------------------------------------------------------------

const styles = {
  outer: {
    position: "fixed",
    top: 0, right: 0, bottom: 0,
    left: 64,
    padding: 32,
    display: "flex",
    background: "transparent",
    fontFamily: "var(--font-sans)",
  },
  card: {
    flex: 1,
    background: "var(--surface-white)",
    borderRadius: 12,
    boxShadow: "var(--shadow-card)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },

  // Header
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "14px 20px 14px 24px",
    borderBottom: "2px solid var(--color-border-card-soft)",
    flexShrink: 0,
  },
  headerLeft: {
    display: "inline-flex", alignItems: "center", gap: 12, minWidth: 0, flexWrap: "wrap",
  },
  workflowTitle: {
    fontSize: 16, fontWeight: 700, lineHeight: 1.3,
    color: "var(--color-text-deep)",
  },
  scenarioTitle: {
    fontSize: 14, fontWeight: 500, lineHeight: 1.3,
    color: "var(--color-text-medium)",
  },
  headerDot: {
    width: 3, height: 3, borderRadius: 999,
    background: "var(--color-text-tertiary)", flexShrink: 0,
  },
  interactionId: {
    fontSize: 13, fontWeight: 400, letterSpacing: "0.25px",
    color: "var(--color-text-tertiary)",
    fontFamily: "var(--font-mono)",
  },
  headerRight: {
    display: "inline-flex", alignItems: "center", gap: 12, flexShrink: 0,
  },
  safetyPill: {
    display: "inline-flex", alignItems: "center", gap: 6,
    height: 26, padding: "0 10px",
    background: "var(--color-info-bg)", borderRadius: 999,
  },
  safetyPillLabel: {
    fontSize: 12, fontWeight: 700, letterSpacing: "0.2px",
    color: "var(--color-info-text)",
  },
  sessionsCount: {
    fontSize: 12, fontWeight: 500,
    color: "var(--color-text-tertiary)",
    fontFamily: "var(--font-mono)",
  },
  progressCount: {
    fontSize: 13, fontWeight: 700,
    color: "var(--color-text-deep)",
    fontFamily: "var(--font-mono)",
  },

  // Body
  body: {
    flex: 1, display: "flex", alignItems: "stretch", minHeight: 0,
  },

  // Persona column (left)
  personaCol: {
    width: "50%",
    display: "flex", flexDirection: "column",
    background: "var(--surface-white)",
    borderRight: "2px solid var(--color-border-card-soft)",
    padding: "24px 24px 0",
    flexShrink: 0,
  },
  personaStack: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 16,
    textAlign: "center",
  },
  orbWrap: {
    position: "relative", width: 148, height: 148,
    display: "inline-grid", placeItems: "center",
  },
  orbRingOuter: {
    position: "absolute", inset: 0, borderRadius: "50%",
    background: "radial-gradient(circle at 30% 30%, rgba(102, 80, 165, 0.15), rgba(102, 80, 165, 0.1) 60%, transparent 80%)",
    filter: "blur(8px)",
    animation: "orbPulseOuter 2s ease-in-out infinite",
  },
  orbRingMid: {
    position: "absolute", inset: 22, borderRadius: "50%",
    background: "radial-gradient(circle at 35% 35%, rgba(102, 80, 165, 0.18), rgba(102, 80, 165, 0.14) 65%)",
    filter: "blur(4px)",
    animation: "orbPulseMid 2s ease-in-out infinite",
  },
  orb: {
    position: "relative", width: 100, height: 100, borderRadius: "50%",
    background: "radial-gradient(circle at 32% 32%, var(--surface-white) 0%, var(--color-icon-tertiary-bg) 55%, rgba(102, 80, 165, 0.22) 90%)",
    boxShadow: "inset 0 -10px 20px rgba(102, 80, 165, 0.18), 0 8px 24px rgba(102, 80, 165, 0.15)",
    display: "inline-grid", placeItems: "center",
  },
  orbInitials: {
    fontFamily: "var(--font-sans)", fontSize: 24, fontWeight: 700, letterSpacing: "0.5px",
    color: "var(--color-icon-tertiary-fg)",
  },
  personaInfo: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
  },
  personaName: {
    fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)",
  },
  personaSub: {
    fontSize: 12, fontWeight: 400, letterSpacing: "0.2px",
    color: "var(--color-text-placeholder)",
  },
  scenarioBlock: {
    marginTop: 8, maxWidth: 400, display: "flex", flexDirection: "column", gap: 6,
  },
  scenarioHeading: {
    fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.35,
  },
  scenarioBody: {
    margin: 0, fontSize: 13, fontWeight: 400, lineHeight: 1.6, color: "var(--color-text-tertiary)",
  },
  timerPill: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "5px 12px", background: "var(--color-chip-bg)", borderRadius: 4,
  },
  timerDot: {
    width: 6, height: 6, borderRadius: 999, background: "var(--color-success)",
  },
  timerLabel: {
    fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, letterSpacing: "0.1px",
    color: "var(--color-text-medium)",
  },
  skipAlert: {
    padding: "0 4px", marginTop: 8,
  },
  controlsRow: {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
    padding: "20px 0", flexShrink: 0,
  },
  mutePill: {
    width: 72, height: 44, background: "var(--surface-white)",
    border: "1px solid var(--color-divider-card)", borderRadius: 8,
    cursor: "pointer", display: "inline-grid", placeItems: "center", padding: 0,
    transition: "background 150ms ease",
  },
  endPill: {
    width: 66, height: 44, background: "var(--color-error-dark)", border: "none",
    borderRadius: 8, cursor: "pointer", display: "inline-grid", placeItems: "center", padding: 0,
    transition: "background 150ms ease",
  },
  disclaimer: {
    margin: 0, padding: "14px 8px",
    borderTop: "1px solid var(--color-border-card-soft)",
    fontSize: 12, fontWeight: 400, lineHeight: 1.5,
    color: "var(--color-text-placeholder)", textAlign: "center",
  },

  // Guidance panel (right — shared container)
  guidancePanel: {
    flex: 1, minWidth: 0, display: "flex", flexDirection: "column",
    background: "var(--surface-white)", overflow: "hidden",
  },

  // Guide header
  guideHead: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "18px 22px 14px", borderBottom: "1px solid var(--color-border-card-soft)", flexShrink: 0,
  },
  guideTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  listenPill: {
    display: "inline-flex", alignItems: "center", gap: 8,
    fontSize: 12, fontWeight: 600, color: "var(--color-icon-tertiary-fg)",
    background: "var(--color-icon-tertiary-bg)", borderRadius: 999, padding: "4px 11px",
  },
  gprog: { fontSize: 12, color: "var(--color-text-tertiary)" },
  gprogNum: { color: "var(--color-text-deep)", fontWeight: 700 },

  // Phase strip
  phaseStrip: { listStyle: "none", margin: 0, padding: "12px 22px 4px", display: "flex", gap: 4, flexShrink: 0 },
  phaseItem: {
    flex: 1, textAlign: "center", display: "flex", flexDirection: "column", gap: 8, paddingBottom: 8,
  },
  phaseLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" },
  phaseUnderline: { height: 3, borderRadius: 2 },

  // Shared step meta
  metaTag: {
    display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px",
    borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.3px",
  },
  statusInline: { display: "inline-flex", alignItems: "center", gap: 6 },
  statusLabel: { fontSize: 12, fontWeight: 700, letterSpacing: "0.2px" },
  activeDot: {
    width: 9, height: 9, borderRadius: 999,
    background: "var(--color-button-primary-bg)",
    boxShadow: "0 0 0 3px var(--color-primary-alpha-12)",
    flexShrink: 0,
  },

  // Asset blocks (script + knowledge card)
  assetBlock: {
    display: "flex", flexDirection: "column", gap: 4, marginTop: 4,
  },
  assetToggle: {
    display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start",
    background: "transparent", border: "none", cursor: "pointer", padding: "10px 4px",
    minHeight: 44,
    fontFamily: "inherit", fontSize: 12, fontWeight: 700, color: "var(--color-icon-tertiary-fg)",
  },
  assetToggleLabel: { fontSize: 12, fontWeight: 700 },
  assetBody: {
    margin: 0, padding: "10px 12px", borderRadius: 8,
    background: "var(--color-icon-tertiary-bg)", color: "var(--color-text-medium)",
    fontSize: 13, fontWeight: 500, lineHeight: 1.55, animation: "drillStepIn 150ms ease",
  },

  // EQ bars
  eqBars: { display: "inline-flex", alignItems: "flex-end", gap: 3, height: 14 },
  eqBar: { width: 3, borderRadius: 2, transformOrigin: "bottom", display: "block" },

  // ---- Variant A: Stack ---
  stackScroll: {
    flex: 1, overflowY: "auto", padding: "16px 22px 20px",
    display: "flex", flexDirection: "column", gap: 12, minHeight: 0,
  },
  stackPrev: {
    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
    borderRadius: 10, background: "var(--surface-dim)", opacity: 0.7,
  },
  stackPrevLabel: {
    fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)", flex: 1,
  },
  stackPrevTime: {
    fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)", flexShrink: 0,
  },
  stackCurrent: {
    border: "1.5px solid var(--color-icon-tertiary-fg)", borderRadius: 14, padding: "16px 18px",
    background: "var(--surface-white)", boxShadow: "var(--shadow-card)",
    display: "flex", flexDirection: "column", gap: 8,
  },
  stackCurrentHead: {
    display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
  },
  stackCurrentMeta: {
    display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0,
  },
  stackCurrentTag: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
    color: "var(--color-icon-tertiary-fg)",
  },
  stackCurrentLabel: {
    fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.4,
  },
  stackCurrentDetail: {
    margin: 0, fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.55,
  },
  stackNext: {
    display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px",
    borderRadius: 10, border: "1px dashed var(--color-divider-card)",
    background: "var(--surface-white)",
  },
  stackNextTag: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
  },
  stackNextLabel: {
    fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)", lineHeight: 1.4,
  },
  stackNextDetail: {
    fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.5,
  },
  showAllBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start",
    background: "transparent", border: "none", cursor: "pointer", padding: "8px 0", marginTop: 4,
    fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "var(--color-button-primary-bg)",
  },
  allStepsList: {
    listStyle: "none", margin: 0, padding: "12px 0 0",
    borderTop: "1px solid var(--color-border-tab)",
    display: "flex", flexDirection: "column", gap: 8,
  },
  allStepRow: {
    display: "flex", alignItems: "center", gap: 8,
  },
  allStepIndex: {
    fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700,
    color: "var(--color-text-tertiary)", width: 16, flexShrink: 0,
  },
  allStepLabel: {
    fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)", flex: 1,
  },

  // ---- Variant B: Coach ---
  coachScroll: {
    flex: 1, overflowY: "auto", padding: "16px 22px 20px",
    display: "flex", flexDirection: "column", gap: 12, minHeight: 0,
    justifyContent: "center",
  },
  coachPrev: {
    display: "flex", alignItems: "center", gap: 8, padding: "6px 0",
  },
  coachPrevLabel: {
    fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)",
  },
  coachPrevTime: {
    fontSize: 11, color: "var(--color-text-placeholder)", fontFamily: "var(--font-mono)",
  },
  coachCard: {
    display: "flex", flexDirection: "column", gap: 10,
    borderColor: "var(--color-icon-tertiary-fg)",
  },
  coachCardHead: {
    display: "flex", alignItems: "center", gap: 8,
  },
  coachCardTag: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
    color: "var(--color-icon-tertiary-fg)", flex: 1,
  },
  coachCardLabel: {
    fontSize: 17, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.35,
  },
  coachCardDetail: {
    margin: 0, fontSize: 13.5, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.6,
  },
  coachScript: {
    display: "flex", flexDirection: "column", gap: 4,
    padding: "12px 14px", borderRadius: 8,
    background: "var(--color-icon-tertiary-bg)",
  },
  coachScriptHead: {
    display: "inline-flex", alignItems: "center", gap: 6,
    fontSize: 11, fontWeight: 700, letterSpacing: "0.2px",
    color: "var(--color-icon-tertiary-fg)",
  },
  coachScriptBody: {
    margin: 0, fontSize: 13, fontWeight: 500, lineHeight: 1.55,
    color: "var(--color-text-medium)",
  },
  coachNext: {
    display: "flex", alignItems: "center", gap: 8, padding: "8px 0", flexWrap: "wrap",
  },
  coachNextTag: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
  },
  coachNextLabel: {
    fontSize: 13, fontWeight: 600, color: "var(--color-text-medium)",
  },
  coachDone: {
    display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 24,
  },
  coachDoneLabel: {
    fontSize: 15, fontWeight: 700, color: "var(--color-success-text)",
  },

  // ---- Variant C: Rail ---
  railScroll: {
    flex: 1, overflowY: "auto", padding: "8px 22px 20px",
    display: "flex", flexDirection: "column", gap: 4, minHeight: 0,
  },
  railPhaseGroup: {
    display: "flex", flexDirection: "column", gap: 4, marginTop: 8,
  },
  railPhaseLabel: {
    fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
    color: "var(--color-text-tertiary)", padding: "4px 2px",
  },
  railRow: {
    borderRadius: 10, border: "1px solid var(--color-border-card-soft)",
    background: "var(--surface-dim)",
    display: "flex", flexDirection: "column",
    transition: "background 150ms ease",
  },
  railRowActive: {
    border: "1.5px solid var(--color-icon-tertiary-fg)",
    background: "var(--surface-white)",
    boxShadow: "var(--shadow-card)",
  },
  railRowSkipped: {
    borderLeft: "3px solid var(--color-warning-dark)",
  },
  railRowHead: {
    display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
    background: "transparent", border: "none", cursor: "pointer",
    fontFamily: "inherit", fontSize: 13, fontWeight: 600,
    color: "var(--color-text-deep)", textAlign: "left", width: "100%",
  },
  railRowLabel: {
    flex: 1, minWidth: 0, lineHeight: 1.4,
  },
  railExpanded: {
    padding: "0 14px 14px 38px",
    display: "flex", flexDirection: "column", gap: 6,
    animation: "drillStepIn 150ms ease",
  },
  railDetail: {
    margin: 0, fontSize: 12.5, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.55,
  },
  railAt: {
    fontSize: 11, color: "var(--color-text-placeholder)", fontFamily: "var(--font-mono)",
  },
  railDotDone: {
    width: 18, height: 18, borderRadius: 999, flexShrink: 0,
    background: "var(--color-success)", display: "grid", placeItems: "center",
  },

  // Eval
  evalScroll: { flex: 1, minHeight: 0, overflowY: "auto", background: "var(--surface-dim)" },
  evalInner: {
    maxWidth: 720, margin: "0 auto", padding: "32px 24px 40px",
    display: "flex", flexDirection: "column", gap: 20,
  },
  evalCard: { display: "flex", flexDirection: "column", gap: 16 },
  evalCardTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  evalTiles: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  evalTile: {
    display: "flex", flexDirection: "column", gap: 4,
    padding: "14px 16px", borderRadius: 8, background: "var(--surface-dim)",
  },
  evalTileValue: { fontSize: 22, fontWeight: 700, color: "var(--color-text-deep)" },
  evalTileLabel: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  evalBranchRow: {
    display: "flex", flexDirection: "column", gap: 4,
    paddingTop: 16, borderTop: "1px solid var(--color-divider-card)",
  },
  evalBranchValue: { fontSize: 14, fontWeight: 600, color: "var(--color-text-medium)" },
  evalReadyCard: { display: "flex", flexDirection: "column", gap: 8 },
  evalReadyTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  evalReadyBody: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.55 },
  evalActions: { display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" },

  iconBtn: {
    width: 44, height: 44, borderRadius: 8, border: "none", background: "transparent",
    cursor: "pointer", padding: 0, display: "inline-grid", placeItems: "center", flexShrink: 0,
  },
  srOnly: {
    position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
    overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
  },
  completionBanner: {
    display: "flex", alignItems: "center", gap: 10, justifyContent: "center",
    padding: "16px 0",
  },
  completionLabel: {
    fontSize: 15, fontWeight: 700, color: "var(--color-success-text)",
  },
};
