"use client";

import React from "react";
import {
  Mic,
  MicOff,
  PhoneOff,
  X,
  CheckCircle2,
  AlertTriangle,
  Circle,
  ChevronDown,
  ShieldCheck,
  BookOpen,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Banner from "./Banner";
import VersionBar from "./VersionBar";
import {
  GUIDED_DRILL_META,
  GUIDED_DRILL_STEPS,
  GUIDED_DRILL_STAGES,
  GUIDED_DRILL_EVAL,
  stepTypeMeta,
  formatDrillTimer,
} from "./mocks/guidedDrill";

// DrillGuidedSessionPage — the assisted "safety wheel" Drill experience.
// The agent practises a role play against a simulated customer while a
// second AI checks off the steps of the attached Guided Workflow in real
// time and flags skipped mandatory steps. After the call the eval is shown
// but a banner makes explicit the score is NOT counted toward the
// readiness profile (safety-on = new "assisted mode" exclusion).
//
// Jun 16 deep-dive direction (LOCKED): progressive disclosure. The role
// play stays on the LEFT; the guided card on the RIGHT (never the
// transcript). The guided card is a moving previous / current / next
// window — "where was I / where am I / where am I going" — that advances as
// the listener checks steps off, order-agnostic, over five universal
// stages (Open → Verify → Discover → Act → Close). Three ambition bands
// ride one VersionBar switcher (ticket audit:
// docs/tickets/drill-guided-workflow/directions.md); they differ only in
// how that window + the stages are spatially structured:
//   "A · Safe"      — Focus stack: dimmed prev / current / dimmed next
//   "B · Balanced"  — Stage rail + focus stack with type/sub-steps/knowledge
//   "C · Ambitious" — Filmstrip: prev∣now∣next lanes that slide on check-off
//
// Layout note (mirrors GuideSessionPage spec §3): full-bleed session
// surface rendered outside PageLayout — 32px gutter between the 64px nav
// rail and the white card; the 1068 content max-width does not apply.

const DIRECTIONS = [
  { id: "safe", label: "A · Safe" },
  { id: "balanced", label: "B · Balanced" },
  { id: "ambitious", label: "C · Ambitious" },
];
const DIRECTION_VERSIONS = DIRECTIONS.map((d) => ({ ...d, iterations: [] }));

// Per-state visual meta. Color is always paired with an icon + a text label
// so meaning never rides on color alone (G9). iconColor and labelColor are
// split: the icon (a non-text UI component, ≥3:1) keeps the semantic tint,
// while the text label uses a ≥4.5:1 token so meaningful status text clears
// the contrast floor (G8).
function stepStateMeta(state) {
  switch (state) {
    case "done":
      return { Icon: CheckCircle2, iconColor: "var(--color-success)", labelColor: "var(--color-success-text)", label: "Done" };
    case "active":
      return { Icon: null, iconColor: "var(--color-button-primary-bg)", labelColor: "var(--color-button-primary-bg)", label: "Now" };
    case "skipped":
      return { Icon: AlertTriangle, iconColor: "var(--color-warning-dark)", labelColor: "var(--color-warning-text)", label: "Skipped — no evidence" };
    default:
      return { Icon: Circle, iconColor: "var(--color-text-tertiary)", labelColor: "var(--color-text-tertiary)", label: "Pending" };
  }
}

// The five stages with derived state. A stage is "done" once the active
// step has moved past it, "current" while it holds the active step, and
// "pending" ahead — so the spine never drifts from the step list.
function deriveStages(steps, activeStep) {
  const order = GUIDED_DRILL_STAGES.map((s) => s.id);
  const activeIdx = activeStep ? order.indexOf(activeStep.stage) : order.length;
  return GUIDED_DRILL_STAGES.map((stage, i) => {
    const state = i < activeIdx ? "done" : i === activeIdx ? "current" : "pending";
    const hasSkip = steps.some((s) => s.stage === stage.id && s.state === "skipped" && s.mandatory);
    return { ...stage, state, hasSkip };
  });
}

export default function DrillGuidedSessionPage({ onEnd }) {
  const meta = GUIDED_DRILL_META;

  const [variant, setVariant] = React.useState("safe");
  const [steps, setSteps] = React.useState(GUIDED_DRILL_STEPS);
  const [muted, setMuted] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(meta.totalSeconds);
  // Progressive disclosure: per-step Script + Knowledge open by id (only the
  // current step exposes them); "show all" is a deliberate, separate reveal.
  const [scriptOpenId, setScriptOpenId] = React.useState(null);
  const [knowledgeOpenId, setKnowledgeOpenId] = React.useState(null);
  const [showAll, setShowAll] = React.useState(false);
  const [ended, setEnded] = React.useState(false);

  const activeIdx = steps.findIndex((s) => s.state === "active");
  const activeStep = activeIdx >= 0 ? steps[activeIdx] : null;
  const prevStep = activeIdx > 0 ? steps[activeIdx - 1] : null;
  const nextStep = activeIdx >= 0 && activeIdx < steps.length - 1 ? steps[activeIdx + 1] : null;
  const skippedSteps = steps.filter((s) => s.state === "skipped" && s.mandatory);
  const doneCount = steps.filter((s) => s.state === "done").length;
  const stages = deriveStages(steps, activeStep);
  const currentStage = stages.find((s) => s.state === "current") || stages[stages.length - 1];

  // Call timer. At 0:00 the call hard-ends into the eval (no real audio).
  React.useEffect(() => {
    if (ended) return undefined;
    if (secondsLeft <= 0) {
      setEnded(true);
      return undefined;
    }
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft, ended]);

  // One safe live-detection demo: the active "diagnose" step checks off and
  // "explain-ipc" becomes active, exercising real-time check-off + window
  // advance without the agent ever correcting the listener.
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setSteps((prev) =>
        prev.map((s) => {
          if (s.id === "diagnose") return { ...s, state: "done", at: "0:58" };
          if (s.id === "explain-ipc") return { ...s, state: "active" };
          // Order-agnostic: the listener catches the churn signal out of the
          // displayed order and checks it off in the background (R5).
          if (s.id === "churn-signal") return { ...s, state: "done", at: "1:02" };
          return s;
        }),
      );
      setScriptOpenId(null);
      setKnowledgeOpenId(null);
    }, 7000);
    return () => window.clearTimeout(id);
  }, []);

  const toggleScript = (id) => setScriptOpenId((cur) => (cur === id ? null : id));
  const toggleKnowledge = (id) => setKnowledgeOpenId((cur) => (cur === id ? null : id));

  const guideProps = {
    steps,
    stages,
    currentStage,
    doneCount,
    prevStep,
    activeStep,
    nextStep,
    skippedSteps,
    scriptOpenId,
    knowledgeOpenId,
    onToggleScript: toggleScript,
    onToggleKnowledge: toggleKnowledge,
    showAll,
    onToggleShowAll: () => setShowAll((o) => !o),
  };

  return (
    <div style={styles.outer}>
      <div style={styles.card}>
        <SessionHeader meta={meta} currentStage={currentStage} doneCount={doneCount} total={steps.length} onClose={onEnd} />

        {/* Live region — announces real-time check-off + skipped-mandatory
            flags so a screen-reader user gets the same signal the visual
            check-marks carry (WCAG-10). */}
        <div role="status" aria-live="polite" style={styles.srOnly}>
          {!ended && activeStep && `Current step: ${activeStep.label}. ${doneCount} of ${steps.length} steps done.`}
          {!ended && skippedSteps.length > 0 &&
            ` ${skippedSteps.length} mandatory step skipped: ${skippedSteps.map((s) => s.label).join(", ")}.`}
        </div>

        {ended ? (
          <EvalResult onBackToDrill={onEnd} onUnassisted={onEnd} />
        ) : (
          <div style={styles.body}>
            <CallColumn
              meta={meta}
              muted={muted}
              secondsLeft={secondsLeft}
              onToggleMute={() => setMuted((m) => !m)}
              onEnd={() => setEnded(true)}
            />
            <section style={styles.guide} aria-label="Guided workflow">
              <GuideHead doneCount={doneCount} total={steps.length} />
              {variant === "balanced" ? (
                <StageGuide {...guideProps} />
              ) : variant === "ambitious" ? (
                <FilmstripGuide {...guideProps} />
              ) : (
                <FocusGuide {...guideProps} />
              )}
            </section>
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

// ---- Header ------------------------------------------------------------

function SessionHeader({ meta, currentStage, doneCount, total, onClose }) {
  return (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        <span style={styles.workflowTitle}>{meta.workflowTitle}</span>
        <span style={styles.headerDot} aria-hidden="true" />
        <span style={styles.scenarioTitle}>{meta.scenarioTitle}</span>
        <span style={styles.headerDot} aria-hidden="true" />
        <span style={styles.interactionId}>Interaction ID – {meta.interactionId}</span>
      </div>
      <div style={styles.headerRight}>
        {/* Live-parameter snapshot — kept visually distinct from the identity
            zone on the left (UI-7: who/what vs. the run's current inputs). */}
        <div style={styles.headerSnapshot}>
          <span style={styles.safetyPill}>
            <ShieldCheck size={14} color="var(--color-info-text)" aria-hidden="true" />
            <span style={styles.safetyPillLabel}>Safety wheel on</span>
          </span>
          <span style={styles.sessionsCount}>
            Session {meta.sessionsUsed} of {meta.sessionsAllowed}
          </span>
          <span style={styles.headerDot} aria-hidden="true" />
          <span style={styles.progressCount}>
            {currentStage.label} · {doneCount}/{total} steps
          </span>
        </div>
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

// ---- Left: the role play (persona call) --------------------------------
// Per the lock, the role play stays on the left; the transcript is never
// shown. The orb + call controls reuse GuideSessionPage's session visual.

function CallColumn({ meta, muted, secondsLeft, onToggleMute, onEnd }) {
  return (
    <aside style={styles.callCol}>
      <div style={styles.callStack}>
        <Orb initials={meta.initials} muted={muted} />
        <div style={styles.speakingRow}>
          <span style={styles.speakingLabel}>
            {muted ? "Mic muted — tap to resume" : `${meta.customerName} is speaking`}
          </span>
          {!muted && <EqBars />}
        </div>
        <TimerPill secondsLeft={secondsLeft} />
        <div style={styles.scenarioBlock}>
          <span style={styles.scenarioHeading}>{meta.scenarioTitle.split(" — ")[0]}</span>
          <p style={styles.scenarioBody}>{meta.scenarioBody}</p>
        </div>
      </div>

      <div style={styles.callBar}>
        <div style={styles.callBarSide}>
          <span style={styles.connPill}>
            <span style={styles.connDot} aria-hidden="true" />
            Connected
          </span>
        </div>
        <div style={styles.callCtl}>
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
        <div style={styles.callBarSide} />
      </div>

      <p style={styles.disclaimer}>
        Practice mode — the safety wheel is on, so this attempt won't count toward your
        readiness profile.
      </p>
    </aside>
  );
}

function Orb({ initials, muted }) {
  return (
    <div style={styles.orbWrap}>
      <span className="orbPulseAnimated" style={{ ...styles.orbRingOuter, opacity: muted ? 0.4 : 1 }} aria-hidden="true" />
      <span className="orbPulseAnimated" style={{ ...styles.orbRingMid, opacity: muted ? 0.5 : 1 }} aria-hidden="true" />
      <span style={styles.orb} aria-hidden="true">
        <span style={styles.orbInitials}>{initials}</span>
      </span>
    </div>
  );
}

function EqBars() {
  const heights = [6, 13, 9, 12];
  return (
    <span style={styles.eqBars} aria-hidden="true">
      {heights.map((h, i) => (
        <span key={i} style={{ ...styles.eqBar, height: h, animation: "drillEq 1s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
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

// ---- Guide head (shared across the three variants) ---------------------

function GuideHead({ doneCount, total }) {
  return (
    <div style={styles.guideHead}>
      <span style={styles.guideTitle}>Guided workflow</span>
      <span style={styles.listenPill}>
        <EqBars />
        Listening
      </span>
      <div style={{ flex: 1 }} />
      <span style={styles.gprog}>
        <b style={styles.gprogNum}>{doneCount}</b> of {total} steps
      </span>
    </div>
  );
}

// ---- Shared step pieces ------------------------------------------------

function StepTags({ step }) {
  const t = stepTypeMeta(step.type);
  return (
    <span style={styles.tagRow}>
      <span style={{ ...styles.typeTag, color: t.color, background: t.bg }}>{t.label}</span>
      <span
        style={{
          ...styles.metaTag,
          color: step.mandatory ? "var(--color-text-medium)" : "var(--color-text-placeholder)",
          background: step.mandatory ? "var(--color-chip-bg)" : "transparent",
        }}
      >
        {step.mandatory ? "Mandatory" : "Optional"}
      </span>
    </span>
  );
}

function StepStatus({ state }) {
  const m = stepStateMeta(state);
  if (state === "active") {
    return (
      <span style={styles.statusInline}>
        <span style={styles.activeDot} aria-hidden="true" />
        <span style={{ ...styles.statusLabel, color: m.labelColor }}>{m.label}</span>
      </span>
    );
  }
  const Icon = m.Icon;
  return (
    <span style={styles.statusInline}>
      <Icon size={15} color={m.iconColor} aria-hidden="true" />
      <span style={{ ...styles.statusLabel, color: m.labelColor }}>{m.label}</span>
    </span>
  );
}

// The current step in full: the step itself is primary and always visible;
// the Script and Knowledge card are deliberate, progressive reveals.
function CurrentStepCard({ step, scriptOpen, knowledgeOpen, onToggleScript, onToggleKnowledge, sliding }) {
  return (
    <div
      style={{ ...styles.currentCard, animation: sliding ? "drillSlideLeft 240ms ease" : "drillStepIn 180ms ease" }}
      aria-current="step"
    >
      <div style={styles.currentHead}>
        <span style={styles.nowPip} aria-hidden="true"><span style={styles.activeDot} /></span>
        <span style={styles.nowLabel}>Now · where the AI is listening</span>
      </div>
      <span style={styles.currentStepLabel}>{step.label}</span>
      <StepTags step={step} />
      <span style={styles.currentDetail}>{step.detail}</span>

      {step.subSteps && (
        <ul style={styles.subList} role="list">
          {step.subSteps.map((sub) => (
            <li key={sub.id} style={styles.subItem} role="listitem">
              <span style={sub.hit ? styles.subBoxHit : styles.subBox} aria-hidden="true">
                {sub.hit && <CheckCircle2 size={12} color="var(--surface-white)" />}
              </span>
              <span style={{ ...styles.subLabel, color: sub.hit ? "var(--color-text-deep)" : "var(--color-text-tertiary)" }}>
                {sub.label}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div style={styles.assetRow}>
        {step.script && (
          <Button variant="ai" uppercase={false} onClick={() => onToggleScript(step.id)} className="drill-focusable" aria-expanded={scriptOpen}>
            {scriptOpen ? "Hide script" : "Suggest phrasing"}
          </Button>
        )}
        {step.knowledge && (
          <button
            type="button"
            onClick={() => onToggleKnowledge(step.id)}
            aria-expanded={knowledgeOpen}
            className="drill-focusable"
            style={styles.knowledgeBtn}
          >
            <BookOpen size={14} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
            {knowledgeOpen ? "Hide knowledge card" : "Learn more about this step"}
          </button>
        )}
      </div>

      {scriptOpen && step.script && <p style={styles.scriptBody}>{step.script}</p>}
      {scriptOpen && step.script && <span style={styles.assetNote}>Viewed scripts are logged</span>}
      {knowledgeOpen && step.knowledge && (
        <div style={styles.knowledgeCard}>
          <span style={styles.knowledgeTitle}>{step.knowledge.title}</span>
          <p style={styles.knowledgeBody}>{step.knowledge.body}</p>
        </div>
      )}
    </div>
  );
}

// A dimmed previous / next step in the moving window. At the workflow's
// edges the position carries explicit copy rather than collapsing to nothing
// (INT-5 — the empty edge is a deliberate state).
function PeekRow({ position, step }) {
  return (
    <div style={styles.peekRow}>
      <span style={styles.peekPos}>{position}</span>
      {step ? (
        <>
          <StepStatus state={step.state} />
          <span style={styles.peekLabel}>{step.label}</span>
        </>
      ) : (
        <span style={styles.peekEmpty}>{position === "Previous" ? "Start of workflow" : "End of workflow"}</span>
      )}
    </div>
  );
}

function SkipAlert({ steps }) {
  if (steps.length === 0) return null;
  const labels = steps.map((s) => s.label).join(", ");
  return (
    <Banner
      tone="warning"
      heading={`${steps.length} mandatory step skipped`}
      body={`No evidence found for: ${labels}. You can still cover it before the call ends.`}
    />
  );
}

// The deliberate "show all" reveal — the full ordered checklist. Viewing it
// is never forced (R9): a button toggles it open.
function ShowAllToggle({ open, onToggle }) {
  return (
    <button type="button" onClick={onToggle} aria-expanded={open} className="drill-focusable" style={styles.showAllBtn}>
      {open ? "Hide all steps" : "Show all steps"}
      <ChevronDown size={16} color="var(--color-button-primary-bg)" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms ease" }} />
    </button>
  );
}

function AllStepsList({ steps }) {
  return (
    <ol style={styles.allList} role="list">
      {steps.map((step, i) => (
        <li key={step.id} role="listitem" style={styles.allRow}>
          <span style={styles.allIndex}>{i + 1}</span>
          <div style={styles.allMain}>
            <div style={styles.allTop}>
              <StepStatus state={step.state} />
              <StepTags step={step} />
            </div>
            <span style={styles.allLabel}>{step.label}</span>
            <span style={styles.allDetail}>{step.detail}</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ---- A · Safe — Focus stack --------------------------------------------
// The highest-reuse reading of the lock: dimmed previous / prominent
// current / dimmed next, a stage label for orientation, and a deliberate
// show-all reveal.

function FocusGuide({
  steps, currentStage, prevStep, activeStep, nextStep, skippedSteps,
  scriptOpenId, knowledgeOpenId, onToggleScript, onToggleKnowledge, showAll, onToggleShowAll,
}) {
  return (
    <div style={styles.guideScroll}>
      <span style={styles.stageLabel}>
        Stage {GUIDED_DRILL_STAGES.findIndex((s) => s.id === currentStage.id) + 1} of {GUIDED_DRILL_STAGES.length} · {currentStage.label}
      </span>
      {skippedSteps.length > 0 && <SkipAlert steps={skippedSteps} />}

      <PeekRow position="Previous" step={prevStep} />
      {activeStep && (
        <CurrentStepCard
          step={activeStep}
          scriptOpen={scriptOpenId === activeStep.id}
          knowledgeOpen={knowledgeOpenId === activeStep.id}
          onToggleScript={onToggleScript}
          onToggleKnowledge={onToggleKnowledge}
        />
      )}
      <PeekRow position="Next" step={nextStep} />

      <ShowAllToggle open={showAll} onToggle={onToggleShowAll} />
      {showAll && <AllStepsList steps={steps} />}
    </div>
  );
}

// ---- B · Balanced — Stage rail + focus ---------------------------------
// Adds the five-stage spine for the at-a-glance "how far through the
// outcome am I," with the focus stack nested under the active stage.

function StageSpine({ stages }) {
  const labelColor = (state) => (state === "pending" ? "var(--color-text-tertiary)" : "var(--color-icon-tertiary-fg)");
  const underline = (state) =>
    state === "current" ? "var(--color-icon-tertiary-fg)" : state === "done" ? "var(--color-border-tab)" : "var(--color-divider-card)";
  return (
    <ol style={styles.spine} role="list">
      {stages.map((s) => (
        <li key={s.id} style={styles.spineItem} role="listitem" aria-current={s.state === "current" ? "step" : undefined}>
          <span style={styles.spineLabelRow}>
            <span style={{ ...styles.spineLabel, color: labelColor(s.state) }}>{s.label}</span>
            {s.hasSkip && <AlertTriangle size={11} color="var(--color-warning-dark)" aria-label="mandatory step skipped" />}
          </span>
          <span style={{ ...styles.spineUnderline, background: underline(s.state) }} aria-hidden="true" />
        </li>
      ))}
    </ol>
  );
}

function StageGuide({
  steps, stages, prevStep, activeStep, nextStep, skippedSteps,
  scriptOpenId, knowledgeOpenId, onToggleScript, onToggleKnowledge, showAll, onToggleShowAll,
}) {
  return (
    <div style={styles.guideScroll}>
      <StageSpine stages={stages} />
      {skippedSteps.length > 0 && <SkipAlert steps={skippedSteps} />}

      <PeekRow position="Previous" step={prevStep} />
      {activeStep && (
        <CurrentStepCard
          step={activeStep}
          scriptOpen={scriptOpenId === activeStep.id}
          knowledgeOpen={knowledgeOpenId === activeStep.id}
          onToggleScript={onToggleScript}
          onToggleKnowledge={onToggleKnowledge}
        />
      )}
      <PeekRow position="Next" step={nextStep} />

      <ShowAllToggle open={showAll} onToggle={onToggleShowAll} />
      {showAll && <AllStepsList steps={steps} />}
    </div>
  );
}

// ---- C · Ambitious — Filmstrip / now-lane ------------------------------
// The window made spatial: three lanes (previous ∣ now ∣ next) where the now
// card slides in from the right one lane at a time as the listener advances
// (a single restrained continuity transition, disabled under reduced-
// motion). "Show all" opens a deliberate overlay sheet.

function StageDots({ stages }) {
  const current = stages.find((s) => s.state === "current") || stages[stages.length - 1];
  return (
    <div style={styles.dotsRow}>
      <div style={styles.dots} role="list" aria-label="Conversation stages">
        {stages.map((s) => (
          <span
            key={s.id}
            role="listitem"
            aria-label={`${s.label}: ${s.state}`}
            style={{
              ...styles.dotSeg,
              background:
                s.state === "done" ? "var(--color-icon-tertiary-fg)"
                : s.state === "current" ? "var(--color-button-primary-bg)"
                : "var(--color-divider-card)",
            }}
          />
        ))}
      </div>
      <span style={styles.dotsLabel}>{current.label}</span>
    </div>
  );
}

function LanePeek({ position, step, Icon }) {
  return (
    <div style={styles.lanePeek}>
      <span style={styles.lanePos}>
        <Icon size={12} color="var(--color-text-tertiary)" aria-hidden="true" />
        {position}
      </span>
      {step ? (
        <>
          <StepStatus state={step.state} />
          <span style={styles.laneLabel}>{step.label}</span>
        </>
      ) : (
        <span style={styles.laneEmpty}>{position === "Previous" ? "Start of workflow" : "End of workflow"}</span>
      )}
    </div>
  );
}

function FilmstripGuide({
  steps, stages, prevStep, activeStep, nextStep, skippedSteps,
  scriptOpenId, knowledgeOpenId, onToggleScript, onToggleKnowledge, showAll, onToggleShowAll,
}) {
  // Esc closes the deliberate "show all" overlay sheet (INT-3 dismissal parity).
  React.useEffect(() => {
    if (!showAll) return undefined;
    const onKey = (e) => { if (e.key === "Escape") onToggleShowAll(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAll, onToggleShowAll]);

  return (
    <div style={styles.filmScroll}>
      <StageDots stages={stages} />
      {skippedSteps.length > 0 && <SkipAlert steps={skippedSteps} />}

      <div style={styles.filmstrip}>
        <LanePeek position="Previous" step={prevStep} Icon={ArrowLeft} />
        {activeStep && (
          <CurrentStepCard
            key={activeStep.id}
            step={activeStep}
            scriptOpen={scriptOpenId === activeStep.id}
            knowledgeOpen={knowledgeOpenId === activeStep.id}
            onToggleScript={onToggleScript}
            onToggleKnowledge={onToggleKnowledge}
            sliding
          />
        )}
        <LanePeek position="Next" step={nextStep} Icon={ArrowRight} />
      </div>

      <ShowAllToggle open={showAll} onToggle={onToggleShowAll} />
      {showAll && (
        <div style={styles.sheetOverlay} role="dialog" aria-label="All steps" aria-modal="true">
          <div style={styles.sheet}>
            <div style={styles.sheetHead}>
              <span style={styles.sheetTitle}>All steps</span>
              <button type="button" onClick={onToggleShowAll} aria-label="Close all steps" className="drill-focusable" style={styles.iconBtn}>
                <X size={18} color="var(--color-text-tertiary)" />
              </button>
            </div>
            <div style={styles.sheetBody}>
              <AllStepsList steps={steps} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Post-session eval (shared) ---------------------------------------

function EvalResult({ onBackToDrill, onUnassisted }) {
  const e = GUIDED_DRILL_EVAL;
  const tiles = [
    { label: "Overall score (excluded)", value: `${e.overallScore}%` },
    { label: "Steps completed", value: `${e.stepsDone} of ${e.stepsTotal}` },
    { label: "Mandatory steps skipped", value: String(e.mandatorySkipped) },
    { label: "Scripts reviewed", value: String(e.scriptsReviewed) },
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
            Run the same scenario unassisted to get a score that counts toward your readiness
            profile.
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

// ---- Styles ------------------------------------------------------------

const styles = {
  outer: {
    position: "fixed",
    top: 0, right: 0, bottom: 0, left: 64,
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
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
    padding: "14px 20px 14px 24px",
    borderBottom: "2px solid var(--color-border-card-soft)", flexShrink: 0,
  },
  headerLeft: { display: "inline-flex", alignItems: "center", gap: 12, minWidth: 0, flexWrap: "wrap" },
  workflowTitle: { fontSize: 16, fontWeight: 700, lineHeight: 1.3, color: "var(--color-text-deep)" },
  scenarioTitle: { fontSize: 14, fontWeight: 500, lineHeight: 1.3, color: "var(--color-text-medium)" },
  headerDot: { width: 3, height: 3, borderRadius: 999, background: "var(--color-text-tertiary)", flexShrink: 0 },
  interactionId: { fontSize: 13, fontWeight: 400, letterSpacing: "0.25px", color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },
  headerRight: { display: "inline-flex", alignItems: "center", gap: 10, flexShrink: 0 },
  headerSnapshot: {
    display: "inline-flex", alignItems: "center", gap: 12,
    paddingLeft: 14, borderLeft: "1px solid var(--color-border-card-soft)",
  },
  safetyPill: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 26, padding: "0 10px",
    background: "var(--color-info-bg)", borderRadius: 999,
  },
  safetyPillLabel: { fontSize: 12, fontWeight: 700, letterSpacing: "0.2px", color: "var(--color-info-text)" },
  sessionsCount: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", fontFamily: "var(--font-mono)" },
  progressCount: { fontSize: 13, fontWeight: 700, color: "var(--color-text-deep)", fontFamily: "var(--font-mono)" },

  // Body grid — role play left, guided card right (guided gets more room).
  body: {
    flex: 1, minHeight: 0, display: "grid",
    gridTemplateColumns: "minmax(0, 0.85fr) minmax(0, 1.15fr)",
  },

  // Left call column
  callCol: {
    display: "flex", flexDirection: "column", minHeight: 0,
    background: "var(--surface-white)",
    borderRight: "2px solid var(--color-border-card-soft)",
    padding: "28px 28px 0",
  },
  callStack: {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", gap: 16, textAlign: "center", minHeight: 0,
  },
  orbWrap: { position: "relative", width: 168, height: 168, display: "inline-grid", placeItems: "center" },
  orbRingOuter: {
    position: "absolute", inset: 0, borderRadius: "50%",
    background: "radial-gradient(circle at 30% 30%, rgba(247, 217, 235, 0.7), rgba(195, 199, 242, 0.5) 60%, transparent 80%)",
    filter: "blur(8px)", animation: "orbPulseOuter 4s ease-in-out infinite",
  },
  orbRingMid: {
    position: "absolute", inset: 22, borderRadius: "50%",
    background: "radial-gradient(circle at 35% 35%, rgba(247, 217, 235, 0.9), rgba(220, 195, 240, 0.7) 65%)",
    filter: "blur(4px)", animation: "orbPulseMid 3s ease-in-out infinite",
  },
  orb: {
    position: "relative", width: 120, height: 120, borderRadius: "50%",
    background: "radial-gradient(circle at 32% 32%, #FFFFFF 0%, #F7D9EB 35%, #C3C7F2 90%)",
    boxShadow: "inset 0 -10px 20px rgba(102, 80, 165, 0.18), 0 8px 24px rgba(102, 80, 165, 0.15)",
    display: "inline-grid", placeItems: "center",
  },
  orbInitials: { fontFamily: "var(--font-sans)", fontSize: 28, fontWeight: 700, letterSpacing: "0.5px", color: "#6650A5" },
  speakingRow: { display: "inline-flex", alignItems: "center", gap: 10 },
  speakingLabel: { fontSize: 15, fontWeight: 500, color: "var(--color-text-tertiary)" },
  eqBars: { display: "inline-flex", alignItems: "flex-end", gap: 3, height: 14 },
  eqBar: { width: 3, borderRadius: 2, transformOrigin: "bottom", display: "block", background: "var(--color-icon-tertiary-fg)" },
  timerPill: {
    display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px",
    background: "var(--color-chip-bg)", borderRadius: 4,
  },
  timerDot: { width: 6, height: 6, borderRadius: 999, background: "var(--color-success)" },
  timerLabel: { fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500, letterSpacing: "0.1px", color: "var(--color-text-medium)" },
  scenarioBlock: { marginTop: 12, maxWidth: 420, display: "flex", flexDirection: "column", gap: 8 },
  scenarioHeading: { fontSize: 18, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.35 },
  scenarioBody: { margin: 0, fontSize: 13.5, fontWeight: 400, lineHeight: 1.65, color: "var(--color-text-tertiary)" },
  callBar: {
    display: "flex", alignItems: "center", marginTop: 24, paddingTop: 16,
    borderTop: "1px solid var(--color-border-card-soft)",
  },
  callBarSide: { flex: 1, minWidth: 0, display: "flex", alignItems: "center" },
  callCtl: { display: "flex", gap: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  connPill: {
    display: "inline-flex", alignItems: "center", gap: 7,
    background: "var(--color-success-bg)", color: "var(--color-success-text)",
    fontSize: 13, fontWeight: 600, borderRadius: 999, padding: "6px 14px",
  },
  connDot: { width: 8, height: 8, borderRadius: 999, background: "var(--color-success)" },
  mutePill: {
    width: 72, height: 44, background: "var(--surface-white)", border: "1px solid var(--color-divider-card)",
    borderRadius: 8, cursor: "pointer", display: "inline-grid", placeItems: "center", padding: 0, transition: "background 150ms ease",
  },
  endPill: {
    width: 66, height: 44, background: "var(--color-error-dark)", border: "none",
    borderRadius: 8, cursor: "pointer", display: "inline-grid", placeItems: "center", padding: 0, transition: "background 150ms ease",
  },
  disclaimer: {
    margin: 0, padding: "16px 8px", borderTop: "1px solid var(--color-border-card-soft)",
    fontSize: 12, fontWeight: 400, lineHeight: 1.5, color: "var(--color-text-placeholder)", textAlign: "center",
  },

  // Right guide panel
  guide: { display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", background: "var(--surface-white)" },
  guideHead: {
    display: "flex", alignItems: "center", gap: 12, padding: "18px 22px 14px",
    borderBottom: "1px solid var(--color-border-card-soft)", flexShrink: 0,
  },
  guideTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  listenPill: {
    display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600,
    color: "var(--color-icon-tertiary-fg)", background: "var(--color-icon-tertiary-bg)", borderRadius: 999, padding: "4px 11px",
  },
  gprog: { fontSize: 12, color: "var(--color-text-tertiary)" },
  gprogNum: { color: "var(--color-text-deep)", fontWeight: 700 },

  guideScroll: { flex: 1, overflowY: "auto", padding: "16px 22px 22px", display: "flex", flexDirection: "column", gap: 12, minHeight: 0 },
  stageLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },

  // Stage spine (Balanced)
  spine: { listStyle: "none", margin: "0 0 4px", padding: 0, display: "flex", gap: 6 },
  spineItem: { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  spineLabelRow: { display: "inline-flex", alignItems: "center", gap: 4, justifyContent: "center" },
  spineLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" },
  spineUnderline: { height: 3, borderRadius: 2 },

  // Moving window — peek rows
  peekRow: {
    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
    background: "var(--surface-dim)", border: "1px solid var(--color-border-card-soft)",
  },
  peekPos: { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-tertiary)", width: 58, flexShrink: 0 },
  peekLabel: { fontSize: 13, fontWeight: 500, color: "var(--color-text-tertiary)", lineHeight: 1.4, minWidth: 0 },
  peekEmpty: { fontSize: 12, fontWeight: 400, color: "var(--color-text-placeholder)", fontStyle: "italic" },

  // Current step card
  currentCard: {
    display: "flex", flexDirection: "column", gap: 8, padding: "16px 18px", borderRadius: 14,
    background: "var(--surface-white)", border: "1.5px solid var(--color-icon-tertiary-fg)", boxShadow: "var(--shadow-card)",
  },
  currentHead: { display: "inline-flex", alignItems: "center", gap: 8 },
  nowPip: { width: 22, height: 22, borderRadius: 999, border: "2px solid var(--color-icon-tertiary-fg)", display: "grid", placeItems: "center", flexShrink: 0 },
  nowLabel: { fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-icon-tertiary-fg)" },
  currentStepLabel: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.35 },
  currentDetail: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.55 },
  tagRow: { display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  typeTag: { display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.3px" },
  metaTag: { display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, letterSpacing: "0.3px" },

  subList: { listStyle: "none", margin: "4px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 8 },
  subItem: { display: "flex", gap: 10, alignItems: "flex-start" },
  subBox: { width: 16, height: 16, borderRadius: 5, border: "1.5px solid var(--color-divider-card)", flexShrink: 0, marginTop: 1, display: "grid", placeItems: "center" },
  subBoxHit: { width: 16, height: 16, borderRadius: 5, background: "var(--color-success)", border: "1.5px solid var(--color-success)", flexShrink: 0, marginTop: 1, display: "grid", placeItems: "center" },
  subLabel: { fontSize: 12.5, lineHeight: 1.45 },

  assetRow: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginTop: 2 },
  knowledgeBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: "none",
    cursor: "pointer", padding: "6px 0", fontFamily: "inherit", fontSize: 13, fontWeight: 700, color: "var(--color-icon-tertiary-fg)",
  },
  scriptBody: {
    margin: 0, padding: "10px 12px", borderRadius: 8, background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-text-medium)", fontSize: 13, fontWeight: 500, lineHeight: 1.5, animation: "drillStepIn 150ms ease",
  },
  assetNote: { fontSize: 10.5, color: "var(--color-text-tertiary)" },
  knowledgeCard: {
    display: "flex", flexDirection: "column", gap: 4, padding: "12px 14px", borderRadius: 10,
    background: "var(--surface-dim)", border: "1px solid var(--color-border-tab)", animation: "drillStepIn 150ms ease",
  },
  knowledgeTitle: { fontSize: 12.5, fontWeight: 700, color: "var(--color-icon-tertiary-fg)" },
  knowledgeBody: { margin: 0, fontSize: 13, fontWeight: 400, color: "var(--color-text-medium)", lineHeight: 1.55 },

  // Shared status pieces
  statusInline: { display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 },
  statusLabel: { fontSize: 12, fontWeight: 700, letterSpacing: "0.2px" },
  activeDot: { width: 9, height: 9, borderRadius: 999, background: "var(--color-button-primary-bg)", boxShadow: "0 0 0 3px var(--color-primary-alpha-12)" },

  // Show-all reveal
  showAllBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start", background: "transparent",
    border: "none", cursor: "pointer", padding: "6px 0", marginTop: 2, fontFamily: "inherit",
    fontSize: 13, fontWeight: 700, color: "var(--color-button-primary-bg)",
  },
  allList: {
    listStyle: "none", margin: "4px 0 0", padding: "12px 0 0", borderTop: "1px solid var(--color-border-tab)",
    display: "flex", flexDirection: "column", gap: 12,
  },
  allRow: { display: "flex", gap: 12 },
  allIndex: { fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-text-tertiary)", paddingTop: 2, width: 16, flexShrink: 0 },
  allMain: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  allTop: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  allLabel: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)", lineHeight: 1.4 },
  allDetail: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.5 },

  // Filmstrip (Ambitious)
  filmScroll: { flex: 1, overflowY: "auto", padding: "16px 22px 22px", display: "flex", flexDirection: "column", gap: 14, minHeight: 0, position: "relative" },
  dotsRow: { display: "flex", alignItems: "center", gap: 12 },
  dots: { display: "flex", gap: 5, flex: 1 },
  dotSeg: { flex: 1, height: 5, borderRadius: 999 },
  dotsLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--color-icon-tertiary-fg)", flexShrink: 0 },
  filmstrip: { display: "grid", gridTemplateColumns: "minmax(0, 0.5fr) minmax(0, 1fr) minmax(0, 0.5fr)", gap: 10, alignItems: "center" },
  lanePeek: {
    display: "flex", flexDirection: "column", gap: 6, padding: "12px 12px", borderRadius: 12,
    background: "var(--surface-dim)", border: "1px solid var(--color-border-card-soft)", opacity: 0.55, minHeight: 96, justifyContent: "center",
  },
  lanePos: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  laneLabel: { fontSize: 12.5, fontWeight: 500, color: "var(--color-text-tertiary)", lineHeight: 1.4 },
  laneEmpty: { fontSize: 12, fontWeight: 400, color: "var(--color-text-placeholder)", fontStyle: "italic" },

  // Show-all overlay sheet (Filmstrip)
  sheetOverlay: { position: "absolute", inset: 0, background: "color-mix(in srgb, var(--color-text-deep) 18%, transparent)", display: "flex", flexDirection: "column", justifyContent: "flex-end" },
  sheet: { background: "var(--surface-white)", borderTopLeftRadius: 16, borderTopRightRadius: 16, boxShadow: "var(--shadow-drawer)", maxHeight: "82%", display: "flex", flexDirection: "column", animation: "drillStepIn 180ms ease" },
  sheetHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 12px", borderBottom: "1px solid var(--color-border-card-soft)", flexShrink: 0 },
  sheetTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)" },
  sheetBody: { overflowY: "auto", padding: "8px 18px 20px", minHeight: 0 },

  // Generic icon button — 40px clears the 44px effective target with padding (WCAG-6).
  iconBtn: { width: 40, height: 40, borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", padding: 0, display: "inline-grid", placeItems: "center", flexShrink: 0 },

  // Visually-hidden live region (announced, not shown).
  srOnly: { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 },

  // Eval
  evalScroll: { flex: 1, minHeight: 0, overflowY: "auto", background: "var(--surface-dim)" },
  evalInner: { maxWidth: 720, margin: "0 auto", padding: "32px 24px 40px", display: "flex", flexDirection: "column", gap: 20 },
  evalCard: { display: "flex", flexDirection: "column", gap: 16 },
  evalCardTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  evalTiles: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  evalTile: { display: "flex", flexDirection: "column", gap: 4, padding: "14px 16px", borderRadius: 8, background: "var(--surface-dim)" },
  evalTileValue: { fontSize: 22, fontWeight: 700, color: "var(--color-text-deep)" },
  evalTileLabel: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)" },
  evalBranchRow: { display: "flex", flexDirection: "column", gap: 4, paddingTop: 16, borderTop: "1px solid var(--color-divider-card)" },
  evalBranchValue: { fontSize: 14, fontWeight: 600, color: "var(--color-text-medium)" },
  evalReadyCard: { display: "flex", flexDirection: "column", gap: 8 },
  evalReadyTitle: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  evalReadyBody: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", lineHeight: 1.55 },
  evalActions: { display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" },
};
