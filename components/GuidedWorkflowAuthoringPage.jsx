"use client";

import React from "react";
import {
  Plus,
  ChevronRight,
  ChevronDown,
  CheckSquare,
  BookOpen,
  FileText,
  Shield,
  Zap,
  GitBranch,
  Users,
  Clock,
  AlertCircle,
  SlidersHorizontal,
  Link2,
  X,
  BarChart2,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import PageHeader from "./PageHeader";
import TabsRow from "./TabsRow";
import VersionBar from "./VersionBar";
import {
  STAGES,
  STEP_TYPES,
  MANDATORY_OPTIONS,
  SAMPLE_WORKFLOW,
  AUDIT_LOG,
  WORKFLOWS,
  WORKFLOW_TAB_COUNTS,
  EMPTY_WORKFLOW,
  STEP_METRICS,
  SUGGESTED_STEPS,
} from "./mocks/guidedWorkflow";

const VARIANT_VERSIONS = [
  { id: "accordion", label: "A · Accordion", iterations: [] },
  { id: "board",     label: "B · Board",     iterations: [] },
  { id: "recipe",    label: "C · Recipe",    iterations: [] },
];

const TABS = [
  { id: "active",      label: "Active",      count: WORKFLOW_TAB_COUNTS.active },
  { id: "calibration", label: "Calibration", count: WORKFLOW_TAB_COUNTS.calibration },
  { id: "draft",       label: "Draft",       count: WORKFLOW_TAB_COUNTS.draft },
  { id: "archived",    label: "Archived",    count: WORKFLOW_TAB_COUNTS.archived },
];

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${String(d.getUTCDate()).padStart(2, "0")} ${months[d.getUTCMonth()]}, ${d.getUTCFullYear()}`;
}

function stageMeta(id) {
  return STAGES.find((s) => s.id === id) || STAGES[0];
}

function typeMeta(id) {
  return STEP_TYPES.find((t) => t.id === id) || STEP_TYPES[1];
}

function mandatoryMeta(id) {
  return MANDATORY_OPTIONS.find((m) => m.id === id) || MANDATORY_OPTIONS[2];
}

function getMetrics(stepId) {
  return STEP_METRICS[stepId] || { successRate: 0, bestPractices: [] };
}

function rateColor(rate) {
  if (rate >= 90) return "var(--color-success)";
  if (rate >= 75) return "var(--color-warning-dark)";
  return "var(--color-error, #DC2626)";
}

export default function GuidedWorkflowAuthoringPage({ onBack, workflowId }) {
  const [workflow] = React.useState(workflowId === "new" ? EMPTY_WORKFLOW : SAMPLE_WORKFLOW);
  const [variant, setVariant] = React.useState("accordion");

  const goBack = onBack || (() => {});

  return (
    <div style={s.root}>
      {variant === "accordion" && (
        <AccordionVariant workflow={workflow} onBack={goBack} />
      )}
      {variant === "board" && (
        <BoardVariant workflow={workflow} onBack={goBack} />
      )}
      {variant === "recipe" && (
        <RecipeVariant workflow={workflow} onBack={goBack} />
      )}

      <VersionBar
        versions={VARIANT_VERSIONS}
        value={{ versionId: variant }}
        onChange={({ versionId }) => setVariant(versionId)}
        tabsMode
      />
    </div>
  );
}

// ============================================================
// LISTING VIEW
// ============================================================

function ListingView({ onCreateNew, onOpenWorkflow }) {
  const [activeTab, setActiveTab] = React.useState("active");
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    const byTab = WORKFLOWS.filter((w) => w.state === activeTab);
    const q = search.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter(
      (w) => w.title.toLowerCase().includes(q) || w.description.toLowerCase().includes(q),
    );
  }, [activeTab, search]);

  return (
    <div style={s.column}>
      <PageHeader
        identifier={{
          icon: <CheckSquare size={16} color="var(--color-icon-tertiary-fg)" />,
          label: "Guided Workflow",
          withDropdown: false,
          iconBg: "var(--color-icon-tertiary-bg)",
          iconColor: "var(--color-icon-tertiary-fg)",
        }}
        primaryAction={{
          label: "Guided Workflow",
          icon: <Plus size={16} />,
          onClick: onCreateNew,
        }}
        search={{ value: search, onChange: setSearch, placeholder: "Search workflows…" }}
        toolbar={[{
          id: "filters",
          icon: <SlidersHorizontal size={18} />,
          label: "Filters",
          onClick: () => {},
        }]}
      />
      <TabsRow tabs={TABS} activeTab={activeTab} onTabClick={setActiveTab} />

      {filtered.length === 0 ? (
        <Card padX={32} padY={32} style={s.emptyCard}>
          <span style={s.emptyIcon} aria-hidden="true">
            <CheckSquare size={24} color="var(--color-icon-tertiary-fg)" />
          </span>
          <span style={s.emptyH}>No workflows in this tab</span>
          <span style={s.emptyP}>Create a new guided workflow to get started.</span>
        </Card>
      ) : (
        <div style={s.grid}>
          {filtered.map((w) => (
            <WorkflowCard key={w.id} workflow={w} onClick={() => onOpenWorkflow(w.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkflowCard({ workflow, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      className="drill-focusable"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={workflow.title}
      style={{
        ...s.wCard,
        boxShadow: hover ? "var(--shadow-8)" : "var(--shadow-card)",
      }}
    >
      <div style={s.wCardHead}>
        <span style={{ ...s.monogram, background: workflow.author.bg, color: workflow.author.fg }}>
          {workflow.author.initial}
        </span>
        <ChevronRight size={20} color="var(--color-text-tertiary)" aria-hidden="true" />
      </div>
      <div style={s.wCardBody}>
        <span style={s.wTitle}>{workflow.title}</span>
        <p style={s.wDesc}>{workflow.description}</p>
        <div style={s.wChipRow}>
          <span style={s.wChip}>{workflow.stepsCount} steps</span>
          <span style={s.wChip}>{workflow.attachedCount} personas</span>
        </div>
      </div>
      <div style={s.wMeta}>
        <span style={s.wMetaText}>{formatDate(workflow.updatedAt)}</span>
      </div>
    </button>
  );
}

// ============================================================
// SHARED: Step Metrics (success rate + best practices)
// ============================================================

function StepMetricsBlock({ stepId }) {
  const metrics = getMetrics(stepId);
  const [showPractices, setShowPractices] = React.useState(false);

  return (
    <div style={s.metricsBlock}>
      <div style={s.metricsHeader}>
        <BarChart2 size={14} color={rateColor(metrics.successRate)} aria-hidden="true" />
        <span style={s.metricsLabel}>Success rate</span>
        <span style={{ ...s.metricsValue, color: rateColor(metrics.successRate) }}>{metrics.successRate}%</span>
      </div>
      <div style={s.metricsBar}>
        <div style={{ ...s.metricsBarFill, width: `${metrics.successRate}%`, background: rateColor(metrics.successRate) }} />
      </div>

      {metrics.bestPractices.length > 0 && (
        <div style={s.practicesWrap}>
          <button
            type="button"
            className="drill-focusable"
            onClick={() => setShowPractices(!showPractices)}
            style={s.practicesToggle}
          >
            <MessageSquare size={12} color="var(--color-text-tertiary)" aria-hidden="true" />
            <span>Best practices ({metrics.bestPractices.length} agents)</span>
            <ChevronDown
              size={12}
              color="var(--color-text-tertiary)"
              aria-hidden="true"
              style={{ transform: showPractices ? "rotate(0)" : "rotate(-90deg)", transition: "transform 150ms ease" }}
            />
          </button>
          {showPractices && (
            <div style={s.practicesList}>
              {metrics.bestPractices.map((bp, i) => (
                <div key={i} style={s.practiceItem}>
                  <span style={s.practiceAgent}>{bp.agent}</span>
                  <span style={s.practiceQuote}>"{bp.verbatim}"</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SHARED: Expandable Knowledge Cards
// ============================================================

function KnowledgeCards({ knowledgeCard }) {
  const cards = knowledgeCard ? [knowledgeCard] : [];
  const [expanded, setExpanded] = React.useState(null);

  if (cards.length === 0) return null;

  return (
    <div style={s.kcSection}>
      <span style={s.kcSectionLabel}>
        <BookOpen size={12} color="var(--color-text-tertiary)" aria-hidden="true" />
        Knowledge cards ({cards.length})
      </span>
      {cards.map((kc, i) => (
        <button
          key={kc.id}
          type="button"
          className="drill-focusable"
          onClick={() => setExpanded(expanded === i ? null : i)}
          style={s.kcExpandBtn}
        >
          <div style={s.kcExpandHead}>
            <Link2 size={12} color="var(--color-button-primary-bg)" aria-hidden="true" />
            <span style={s.kcTitle}>{kc.title}</span>
            <ChevronDown
              size={12}
              color="var(--color-text-tertiary)"
              aria-hidden="true"
              style={{ marginLeft: "auto", transform: expanded === i ? "rotate(0)" : "rotate(-90deg)", transition: "transform 150ms ease" }}
            />
          </div>
          {expanded === i && (
            <span style={s.kcSnippet}>{kc.snippet}</span>
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// SHARED: Suggested Steps
// ============================================================

function SuggestedSteps({ stageId }) {
  const suggestions = SUGGESTED_STEPS[stageId] || [];
  if (suggestions.length === 0) return null;

  return (
    <div style={s.suggestWrap}>
      <Lightbulb size={12} color="var(--color-text-tertiary)" aria-hidden="true" />
      {suggestions.map((sug) => (
        <button key={sug.id} type="button" className="drill-focusable" style={s.suggestChip} onClick={() => {}}>
          <Plus size={10} aria-hidden="true" />
          <span>{sug.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================
// VARIANT A — ACCORDION (Safe)
// True accordion: one open at a time, all closed by default.
// Inline text-field editing. Step metrics + expandable KC.
// ============================================================

function AccordionVariant({ workflow, onBack }) {
  const [openStage, setOpenStage] = React.useState(null);
  const [editingStep, setEditingStep] = React.useState(null);

  const toggle = (id) => setOpenStage((prev) => prev === id ? null : id);

  return (
    <div style={s.column}>
      <EditorHeader workflow={workflow} onBack={onBack} />
      <MetadataBar workflow={workflow} />

      {workflow.stages.map((stage) => {
        const meta = stageMeta(stage.id);
        const isOpen = openStage === stage.id;
        return (
          <Card key={stage.id} padX={0} padY={0}>
            <button
              type="button"
              className="drill-focusable"
              onClick={() => toggle(stage.id)}
              style={s.accStageHead}
              aria-expanded={isOpen}
            >
              <span style={{ ...s.stageDot, background: meta.color }} />
              <span style={s.accStageLabel}>{meta.label}</span>
              <span style={s.accStepCount}>{stage.steps.length} steps</span>
              <ChevronDown
                size={16}
                color="var(--color-text-tertiary)"
                aria-hidden="true"
                style={{ transform: isOpen ? "rotate(0)" : "rotate(-90deg)", transition: "transform 150ms ease" }}
              />
            </button>

            {isOpen && (
              <div style={s.accStepList}>
                {stage.steps.length === 0 && (
                  <div style={s.accEmpty}>
                    <span style={s.accEmptyText}>No steps yet — add the first step for this stage.</span>
                  </div>
                )}
                {stage.steps.map((step) => (
                  <AccordionStep
                    key={step.id}
                    step={step}
                    isEditing={editingStep === step.id}
                    onToggleEdit={() => setEditingStep(editingStep === step.id ? null : step.id)}
                  />
                ))}

                <div style={s.accAddRow}>
                  <Button variant="text" leadingIcon={<Plus size={14} />} onClick={() => {}}>
                    Add step
                  </Button>
                  <SuggestedSteps stageId={stage.id} />
                </div>
              </div>
            )}
          </Card>
        );
      })}

      <EditorFooter />
    </div>
  );
}

function AccordionStep({ step, isEditing, onToggleEdit }) {
  const tm = typeMeta(step.type);
  const mm = mandatoryMeta(step.mandatory);
  const metrics = getMetrics(step.id);

  return (
    <div style={s.accStep}>
      <button type="button" className="drill-focusable" style={s.accStepRow} onClick={onToggleEdit}>
        <span style={s.accStepLabel}>{step.label}</span>
        <span style={{ ...s.metricsInline, color: rateColor(metrics.successRate) }}>
          {metrics.successRate}%
        </span>
        <div style={s.accStepChips}>
          <span style={{ ...s.chip, background: tm.bg, color: tm.fg }}>{tm.label}</span>
          <span style={{ ...s.chip, background: mm.bg, color: mm.fg }}>{mm.label}</span>
        </div>
        <ChevronDown
          size={14}
          color="var(--color-text-tertiary)"
          aria-hidden="true"
          style={{ flexShrink: 0, transform: isEditing ? "rotate(0)" : "rotate(-90deg)", transition: "transform 150ms ease" }}
        />
      </button>

      {isEditing && (
        <div style={s.accStepExpand}>
          {/* PRIMARY — editable instruction + script */}
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Instruction</label>
            <textarea
              style={s.fieldTextarea}
              defaultValue={step.detail}
              rows={2}
            />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Script (suggested phrasing)</label>
            <textarea
              style={{ ...s.fieldTextarea, fontStyle: "italic" }}
              defaultValue={step.script || ""}
              placeholder="No script — add suggested phrasing…"
              rows={2}
            />
          </div>

          {/* METRICS — success rate + best practices */}
          <StepMetricsBlock stepId={step.id} />

          {/* SECONDARY — sub-steps */}
          {step.subSteps.length > 0 && (
            <div style={s.fieldGroup}>
              <label style={s.fieldLabel}>Sub-steps</label>
              {step.subSteps.map((ss) => (
                <div key={ss.id} style={s.subStep}>
                  <span style={s.subStepDot}>↳</span>
                  <span style={s.subStepText}>{ss.label}</span>
                  <span style={{ ...s.chipSm, background: mandatoryMeta(ss.mandatory).bg, color: mandatoryMeta(ss.mandatory).fg }}>
                    {mandatoryMeta(ss.mandatory).label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* EXPANDABLE — knowledge cards */}
          <KnowledgeCards knowledgeCard={step.knowledgeCard} />

          {/* GROUNDING */}
          <div style={s.groundingRow}>
            <FileText size={12} color="var(--color-text-tertiary)" aria-hidden="true" />
            <span style={s.groundingText}>{step.grounding}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// VARIANT B — BOARD (Balanced)
// 4.5 visible columns with horizontal scroll.
// Side curtain (fixed overlay) for step editing.
// ============================================================

function BoardVariant({ workflow, onBack }) {
  const [drawerStep, setDrawerStep] = React.useState(null);

  return (
    <div style={s.column}>
      <EditorHeader workflow={workflow} onBack={onBack} />
      <MetadataBar workflow={workflow} />

      <div style={s.boardScroll}>
        {workflow.stages.map((stage) => {
          const meta = stageMeta(stage.id);
          return (
            <div key={stage.id} style={s.boardLane}>
              <div style={s.laneHead}>
                <span style={{ ...s.stageDot, background: meta.color }} />
                <span style={s.laneLabel}>{meta.label}</span>
                <span style={s.laneCount}>{stage.steps.length}</span>
              </div>
              <div style={s.laneBody}>
                {stage.steps.length === 0 && (
                  <div style={s.laneEmpty}>
                    <span style={s.laneEmptyText}>No steps</span>
                  </div>
                )}
                {stage.steps.map((step) => (
                  <BoardStepCard
                    key={step.id}
                    step={step}
                    isActive={drawerStep?.id === step.id}
                    onClick={() => setDrawerStep(drawerStep?.id === step.id ? null : step)}
                  />
                ))}
              </div>
              <div style={s.laneFooter}>
                <Button variant="text" leadingIcon={<Plus size={14} />} onClick={() => {}}>
                  Add step
                </Button>
                <SuggestedSteps stageId={stage.id} />
              </div>
            </div>
          );
        })}
      </div>

      {drawerStep && (
        <BoardCurtain step={drawerStep} onClose={() => setDrawerStep(null)} />
      )}

      <EditorFooter />
    </div>
  );
}

function BoardStepCard({ step, isActive, onClick }) {
  const [hover, setHover] = React.useState(false);
  const tm = typeMeta(step.type);
  const mm = mandatoryMeta(step.mandatory);
  const metrics = getMetrics(step.id);
  return (
    <button
      type="button"
      className="drill-focusable"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...s.boardCard,
        boxShadow: hover || isActive ? "var(--shadow-4)" : "var(--shadow-card)",
        borderColor: isActive ? "var(--color-button-primary-bg)" : "transparent",
      }}
    >
      <span style={s.boardCardLabel}>{step.label}</span>
      <div style={s.boardCardChips}>
        <span style={{ ...s.chipSm, background: tm.bg, color: tm.fg }}>{tm.label}</span>
        <span style={{ ...s.chipSm, background: mm.bg, color: mm.fg }}>{mm.label}</span>
        <span style={{ ...s.metricsInlineSm, color: rateColor(metrics.successRate) }}>
          {metrics.successRate}%
        </span>
      </div>
      {step.subSteps.length > 0 && (
        <span style={s.boardSubCount}>{step.subSteps.length} sub-steps</span>
      )}
    </button>
  );
}

function BoardCurtain({ step, onClose }) {
  const tm = typeMeta(step.type);
  const mm = mandatoryMeta(step.mandatory);

  React.useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div style={s.curtainOverlay} onClick={onClose} aria-hidden="true" />
      <div style={s.curtain} role="complementary" aria-label="Step editor">
        <div style={s.curtainHead}>
          <span style={s.curtainTitle}>Edit Step</span>
          <Button variant="icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>
        <div style={s.curtainBody}>
          {/* PRIMARY — editable fields */}
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Step name</label>
            <input type="text" style={s.fieldInput} defaultValue={step.label} />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Instruction</label>
            <textarea style={s.fieldTextarea} defaultValue={step.detail} rows={3} />
          </div>
          <div style={s.fieldGroup}>
            <label style={s.fieldLabel}>Script (suggested phrasing)</label>
            <textarea
              style={{ ...s.fieldTextarea, fontStyle: "italic" }}
              defaultValue={step.script || ""}
              placeholder="No script — add suggested phrasing…"
              rows={3}
            />
          </div>

          {/* METRICS */}
          <StepMetricsBlock stepId={step.id} />

          {/* TYPE + MANDATORY */}
          <div style={s.fieldRow}>
            <div style={{ ...s.fieldGroup, flex: 1 }}>
              <label style={s.fieldLabel}>Type</label>
              <span style={{ ...s.chip, background: tm.bg, color: tm.fg }}>{tm.label}</span>
            </div>
            <div style={{ ...s.fieldGroup, flex: 1 }}>
              <label style={s.fieldLabel}>Priority</label>
              <span style={{ ...s.chip, background: mm.bg, color: mm.fg }}>{mm.label}</span>
            </div>
          </div>

          {/* SUB-STEPS */}
          {step.subSteps.length > 0 && (
            <div style={s.fieldGroup}>
              <label style={s.fieldLabel}>Sub-steps ({step.subSteps.length})</label>
              {step.subSteps.map((ss) => (
                <div key={ss.id} style={s.subStep}>
                  <span style={s.subStepDot}>↳</span>
                  <span style={s.subStepText}>{ss.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* EXPANDABLE KC */}
          <KnowledgeCards knowledgeCard={step.knowledgeCard} />

          {/* GROUNDING */}
          <div style={s.groundingRow}>
            <FileText size={12} color="var(--color-text-tertiary)" aria-hidden="true" />
            <span style={s.groundingText}>{step.grounding}</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// VARIANT C — RECIPE (Ambitious)
// Editorial recipe-card: hero + ingredients + method sections.
// All click-throughs wired to state.
// ============================================================

function RecipeVariant({ workflow, onBack }) {
  const [expandedStep, setExpandedStep] = React.useState(null);
  const [editingField, setEditingField] = React.useState(null);
  const allKnowledgeCards = workflow.stages
    .flatMap((st) => st.steps)
    .map((step) => step.knowledgeCard)
    .filter(Boolean);

  return (
    <div style={s.column}>
      <EditorHeader workflow={workflow} onBack={onBack} />

      {/* Hero */}
      <Card padX={32} padY={32}>
        <div style={s.recipeHero}>
          <div style={s.recipeHeroLeft}>
            <span style={s.recipeLabel}>Guided Workflow</span>
            <h2 style={s.recipeTitle}>{workflow.title}</h2>
            <p style={s.recipeDesc}>{workflow.description}</p>
          </div>
          <div style={s.recipeHeroRight}>
            <RecipeMeta icon={<Zap size={14} aria-hidden="true" />} label="Job to be done" value={workflow.jobToBeDone} />
            <RecipeMeta icon={<GitBranch size={14} aria-hidden="true" />} label="Contact reason" value={workflow.contactReason} />
            <RecipeMeta icon={<Users size={14} aria-hidden="true" />} label="Attached personas" value={workflow.attachedPersonas.join(", ") || "None"} />
            <RecipeMeta icon={<Clock size={14} aria-hidden="true" />} label="Attempts allowed" value={`${workflow.attemptsAllowed} per agent`} />
          </div>
        </div>
      </Card>

      {/* Ingredients — knowledge cards + triggers + success metrics */}
      <Card padX={24} padY={20}>
        <span style={s.recipeSectionHead}>Ingredients</span>
        <div style={s.recipeIngredients}>
          <div style={s.ingredientCol}>
            <span style={s.ingredientLabel}>Triggers</span>
            {workflow.triggers.map((t, i) => (
              <div key={i} style={s.ingredientItem}>
                <AlertCircle size={12} color="var(--color-warning-dark)" aria-hidden="true" />
                <span>{t}</span>
              </div>
            ))}
          </div>
          <div style={s.ingredientCol}>
            <span style={s.ingredientLabel}>Success metrics</span>
            {workflow.successMetrics.map((m, i) => (
              <div key={i} style={s.ingredientItem}>
                <CheckSquare size={12} color="var(--color-success)" aria-hidden="true" />
                <span>{m}</span>
              </div>
            ))}
          </div>
          <div style={s.ingredientCol}>
            <span style={s.ingredientLabel}>Knowledge cards ({allKnowledgeCards.length})</span>
            {allKnowledgeCards.map((kc) => (
              <div key={kc.id} style={s.ingredientItem}>
                <BookOpen size={12} color="var(--color-info)" aria-hidden="true" />
                <span>{kc.title}</span>
              </div>
            ))}
            {allKnowledgeCards.length === 0 && <span style={s.ingredientNone}>None linked</span>}
          </div>
        </div>
      </Card>

      {/* Method — the 5 stages with steps */}
      <Card padX={24} padY={20}>
        <span style={s.recipeSectionHead}>Method</span>
        {workflow.stages.map((stage, si) => {
          const meta = stageMeta(stage.id);
          return (
            <div key={stage.id} style={s.recipeStage}>
              <div style={s.recipeStageHead}>
                <span style={s.recipeStageNum}>{si + 1}</span>
                <span style={{ ...s.stageDot, background: meta.color }} />
                <span style={s.recipeStageName}>{meta.label}</span>
              </div>

              {stage.steps.length === 0 && (
                <div style={s.recipeStepEmpty}>No steps — add the first instruction.</div>
              )}

              {stage.steps.map((step, stepIdx) => (
                <RecipeStep
                  key={step.id}
                  step={step}
                  index={stepIdx}
                  isExpanded={expandedStep === step.id}
                  isEditing={editingField === step.id}
                  onToggle={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                  onEdit={() => setEditingField(editingField === step.id ? null : step.id)}
                />
              ))}

              <div style={s.recipeAddWrap}>
                <Button variant="text" leadingIcon={<Plus size={14} />} onClick={() => {}}>
                  Add instruction
                </Button>
                <SuggestedSteps stageId={stage.id} />
              </div>
            </div>
          );
        })}
      </Card>

      <EditorFooter />
    </div>
  );
}

function RecipeStep({ step, index, isExpanded, isEditing, onToggle, onEdit }) {
  const tm = typeMeta(step.type);
  const mm = mandatoryMeta(step.mandatory);
  const metrics = getMetrics(step.id);
  return (
    <div style={s.recipeStepWrap}>
      <button type="button" className="drill-focusable" onClick={onToggle} style={s.recipeStepRow}>
        <span style={s.recipeStepBullet}>{index + 1}.</span>
        <span style={s.recipeStepText}>{step.label}</span>
        <span style={{ ...s.metricsInline, color: rateColor(metrics.successRate) }}>
          {metrics.successRate}%
        </span>
        <div style={s.recipeStepChips}>
          <span style={{ ...s.chipSm, background: mm.bg, color: mm.fg }}>{mm.label}</span>
          <span style={{ ...s.chipSm, background: tm.bg, color: tm.fg }}>{tm.label}</span>
        </div>
        <ChevronDown
          size={14}
          color="var(--color-text-tertiary)"
          aria-hidden="true"
          style={{ flexShrink: 0, transform: isExpanded ? "rotate(0)" : "rotate(-90deg)", transition: "transform 150ms ease" }}
        />
      </button>

      {isExpanded && (
        <div style={s.recipeStepExpand}>
          {/* PRIMARY — instruction + script */}
          <div style={s.recipeFieldBlock}>
            <span style={s.recipeFieldLabel}>What to do</span>
            {isEditing ? (
              <textarea style={s.fieldTextarea} defaultValue={step.detail} rows={2} />
            ) : (
              <p style={s.recipeFieldBody} onClick={onEdit}>{step.detail}</p>
            )}
          </div>
          {(step.script || isEditing) && (
            <div style={s.recipeFieldBlock}>
              <span style={s.recipeFieldLabel}>Script</span>
              {isEditing ? (
                <textarea style={{ ...s.fieldTextarea, fontStyle: "italic" }} defaultValue={step.script || ""} placeholder="Add script…" rows={2} />
              ) : (
                <p style={{ ...s.recipeFieldBody, fontStyle: "italic" }} onClick={onEdit}>"{step.script}"</p>
              )}
            </div>
          )}

          {/* METRICS */}
          <StepMetricsBlock stepId={step.id} />

          {/* CONDITIONAL PATHS */}
          {step.subSteps.length > 0 && (
            <div style={s.recipeFieldBlock}>
              <span style={s.recipeFieldLabel}>Conditional paths</span>
              {step.subSteps.map((ss) => (
                <div key={ss.id} style={s.subStep}>
                  <span style={s.subStepDot}>↳</span>
                  <span style={s.subStepText}>{ss.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* EXPANDABLE KC */}
          <KnowledgeCards knowledgeCard={step.knowledgeCard} />

          {/* GROUNDING */}
          <div style={s.groundingRow}>
            <FileText size={12} color="var(--color-text-tertiary)" aria-hidden="true" />
            <span style={s.groundingText}>{step.grounding}</span>
          </div>

          {/* EDIT TOGGLE */}
          <div style={{ alignSelf: "flex-start" }}>
            <Button variant="text" onClick={onEdit}>
              {isEditing ? "Done editing" : "Edit fields"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function RecipeMeta({ icon, label, value }) {
  return (
    <div style={s.recipeMetaItem}>
      <div style={s.recipeMetaIcon}>{icon}</div>
      <div style={s.recipeMetaContent}>
        <span style={s.recipeMetaLabel}>{label}</span>
        <span style={s.recipeMetaValue}>{value}</span>
      </div>
    </div>
  );
}

// ============================================================
// SHARED PIECES
// ============================================================

function EditorHeader({ workflow, onBack }) {
  const badges = (
    <div style={s.editorMeta}>
      {workflow.safetyWheelOn && (
        <span style={s.safetyBadge}>
          <Shield size={12} aria-hidden="true" /> Safety wheel on
        </span>
      )}
      <span style={s.stateBadge}>{workflow.state}</span>
      <span style={s.auditText}>
        by {workflow.author.name || "—"} · Updated {formatDate(workflow.updatedAt)}
        {workflow.attachedPersonas.length > 0 && (
          <> · {workflow.attachedPersonas.length} persona{workflow.attachedPersonas.length > 1 ? "s" : ""} attached</>
        )}
      </span>
    </div>
  );

  return (
    <PageHeader
      back={onBack}
      identifier={{
        icon: <CheckSquare size={16} />,
        label: workflow.title || "New Guided Workflow",
      }}
      meta={badges}
    />
  );
}

function MetadataBar({ workflow }) {
  return (
    <Card padX={20} padY={16}>
      <div style={s.metaGrid}>
        <MetaField label="Contact reason" value={workflow.contactReason} />
        <MetaField label="Job to be done" value={workflow.jobToBeDone} />
        <MetaField label="Scenario" value={workflow.scenario} />
        <MetaField label="Domain" value={workflow.domain} />
        <MetaField label="Language" value={workflow.language} />
        <MetaField label="Attempts" value={`${workflow.attemptsAllowed} per agent`} />
      </div>
    </Card>
  );
}

function MetaField({ label, value }) {
  return (
    <div style={s.metaField}>
      <span style={s.metaFieldLabel}>{label}</span>
      <span style={s.metaFieldValue}>{value || "—"}</span>
    </div>
  );
}

function EditorFooter() {
  return (
    <div style={s.footer}>
      <Button variant="text" onClick={() => {}}>Cancel</Button>
      <div style={s.footerRight}>
        <Button variant="text" onClick={() => {}}>Save draft</Button>
        <Button onClick={() => {}}>Publish</Button>
      </div>
    </div>
  );
}

// ============================================================
// STYLES
// ============================================================

const s = {
  root: {
    position: "fixed", top: 0, right: 0, bottom: 0, left: 64,
    display: "flex", flexDirection: "column",
    background: "var(--surface-canvas)", fontFamily: "var(--font-sans)",
    overflow: "auto", padding: 32,
  },
  column: {
    display: "flex", flexDirection: "column", gap: 16,
    width: "100%", maxWidth: 1068, marginInline: "auto",
    fontFamily: "var(--font-sans)",
  },

  // Listing
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16 },
  emptyCard: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" },
  emptyIcon: { width: 48, height: 48, borderRadius: 999, background: "var(--color-icon-tertiary-bg)", display: "inline-grid", placeItems: "center" },
  emptyH: { fontSize: 16, fontWeight: 600, color: "var(--color-text-deep)" },
  emptyP: { fontSize: 13, color: "var(--color-text-tertiary)", maxWidth: 360, lineHeight: 1.5 },

  // Workflow card
  wCard: {
    appearance: "none", border: "none", background: "var(--surface-white)", borderRadius: 8, padding: 24,
    display: "flex", flexDirection: "column", gap: 14, cursor: "pointer", textAlign: "start",
    fontFamily: "inherit", width: "100%", transition: "box-shadow 150ms ease", boxShadow: "var(--shadow-card)",
  },
  wCardHead: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  monogram: { width: 32, height: 32, borderRadius: 999, display: "inline-grid", placeItems: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  wCardBody: { display: "flex", flexDirection: "column", gap: 8 },
  wTitle: { fontSize: 14, fontWeight: 500, lineHeight: "22px", color: "var(--color-text-medium)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" },
  wDesc: { margin: 0, fontSize: 12, lineHeight: "18px", color: "var(--color-text-tertiary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 36 },
  wChipRow: { display: "flex", gap: 8 },
  wChip: { fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", background: "var(--color-chip-bg)", padding: "2px 8px", borderRadius: 4 },
  wMeta: { paddingTop: 12, borderTop: "1px solid var(--color-border-card-soft)", display: "flex", gap: 8 },
  wMetaText: { fontSize: 12, color: "var(--color-text-tertiary)" },

  // Editor header meta row (rendered inside PageHeader via meta prop)
  editorMeta: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" },
  safetyBadge: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 500, color: "var(--color-success-text)", background: "var(--color-success-bg)", padding: "3px 8px", borderRadius: 4 },
  stateBadge: { fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", background: "var(--color-chip-bg)", padding: "3px 8px", borderRadius: 4, textTransform: "capitalize" },
  auditText: { fontSize: 12, color: "var(--color-text-tertiary)" },

  // Metadata bar
  metaGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px 24px" },
  metaField: { display: "flex", flexDirection: "column", gap: 2 },
  metaFieldLabel: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" },
  metaFieldValue: { fontSize: 13, color: "var(--color-text-medium)", lineHeight: "20px" },

  // Footer
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--color-border-card-soft)" },
  footerRight: { display: "flex", gap: 8 },

  // Shared chips
  chip: { display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 4, whiteSpace: "nowrap" },
  chipSm: { display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 500, padding: "2px 6px", borderRadius: 3, whiteSpace: "nowrap" },

  // Stage dot
  stageDot: { width: 8, height: 8, borderRadius: 999, flexShrink: 0 },

  // Field groups
  fieldGroup: { display: "flex", flexDirection: "column", gap: 4 },
  fieldLabel: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" },
  fieldValue: { fontSize: 13, color: "var(--color-text-medium)", lineHeight: "20px" },
  fieldInput: {
    fontSize: 13, color: "var(--color-text-medium)", padding: "6px 10px",
    border: "1px solid var(--color-border-card-soft)", borderRadius: 6,
    background: "var(--surface-dim)", fontFamily: "inherit", outline: "none",
  },
  fieldTextarea: {
    fontSize: 13, color: "var(--color-text-medium)", padding: "8px 10px",
    border: "1px solid var(--color-border-card-soft)", borderRadius: 6,
    background: "var(--surface-dim)", lineHeight: "20px", minHeight: 48,
    fontFamily: "inherit", resize: "vertical", outline: "none",
  },
  fieldRow: { display: "flex", gap: 16 },

  // Knowledge card (expandable)
  kcSection: { display: "flex", flexDirection: "column", gap: 4 },
  kcSectionLabel: { display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" },
  kcExpandBtn: {
    appearance: "none", border: "1px solid var(--color-border-card-soft)", background: "var(--surface-alt)",
    borderRadius: 6, padding: "8px 10px", cursor: "pointer", fontFamily: "inherit",
    display: "flex", flexDirection: "column", gap: 4, width: "100%", textAlign: "start",
  },
  kcExpandHead: { display: "flex", alignItems: "center", gap: 6 },
  kcTitle: { fontSize: 12, fontWeight: 600, color: "var(--color-text-medium)" },
  kcSnippet: { fontSize: 12, color: "var(--color-text-tertiary)", lineHeight: "18px", marginTop: 2 },

  // Sub-steps
  subStep: { display: "flex", alignItems: "center", gap: 6, paddingLeft: 8 },
  subStepDot: { fontSize: 12, color: "var(--color-text-tertiary)", flexShrink: 0 },
  subStepText: { fontSize: 12, color: "var(--color-text-medium)", lineHeight: "18px" },

  // Grounding
  groundingRow: { display: "flex", alignItems: "center", gap: 6, paddingTop: 8, borderTop: "1px solid var(--color-border-card-soft)", marginTop: 4 },
  groundingText: { fontSize: 11, color: "var(--color-text-tertiary)" },

  // Step metrics
  metricsBlock: { display: "flex", flexDirection: "column", gap: 6, padding: "10px 12px", background: "var(--surface-alt)", borderRadius: 6 },
  metricsHeader: { display: "flex", alignItems: "center", gap: 6 },
  metricsLabel: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.3px" },
  metricsValue: { fontSize: 13, fontWeight: 700, marginLeft: "auto" },
  metricsBar: { height: 4, borderRadius: 2, background: "var(--color-border-card-soft)", overflow: "hidden" },
  metricsBarFill: { height: "100%", borderRadius: 2, transition: "width 300ms ease" },
  metricsInline: { fontSize: 11, fontWeight: 700, flexShrink: 0 },
  metricsInlineSm: { fontSize: 10, fontWeight: 700, flexShrink: 0 },

  // Best practices
  practicesWrap: { display: "flex", flexDirection: "column", gap: 4 },
  practicesToggle: {
    appearance: "none", border: "none", background: "none", display: "flex",
    alignItems: "center", gap: 4, cursor: "pointer", fontFamily: "inherit",
    fontSize: 11, fontWeight: 500, color: "var(--color-text-tertiary)", padding: 0,
  },
  practicesList: { display: "flex", flexDirection: "column", gap: 8, paddingLeft: 16 },
  practiceItem: { display: "flex", flexDirection: "column", gap: 2 },
  practiceAgent: { fontSize: 11, fontWeight: 600, color: "var(--color-text-medium)" },
  practiceQuote: { fontSize: 12, color: "var(--color-text-tertiary)", lineHeight: "18px", fontStyle: "italic" },

  // Suggested steps
  suggestWrap: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", paddingTop: 4 },
  suggestChip: {
    appearance: "none", border: "1px dashed var(--color-border-card-soft)",
    background: "var(--surface-white)", borderRadius: 4, padding: "3px 8px",
    cursor: "pointer", fontFamily: "inherit", fontSize: 11, color: "var(--color-text-tertiary)",
    display: "inline-flex", alignItems: "center", gap: 3,
    transition: "border-color 150ms ease, color 150ms ease",
  },

  // ---- Accordion variant ----
  accStageHead: {
    appearance: "none", border: "none", background: "none", width: "100%",
    display: "flex", alignItems: "center", gap: 8, padding: "14px 20px",
    cursor: "pointer", fontFamily: "inherit",
  },
  accStageLabel: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)", flex: 1, textAlign: "start" },
  accStepCount: { fontSize: 12, color: "var(--color-text-tertiary)" },
  accStepList: { display: "flex", flexDirection: "column", borderTop: "1px solid var(--color-border-card-soft)" },
  accEmpty: { padding: "20px 20px", textAlign: "center" },
  accEmptyText: { fontSize: 13, color: "var(--color-text-tertiary)" },
  accStep: { borderBottom: "1px solid var(--color-border-card-soft)" },
  accStepRow: {
    appearance: "none", border: "none", background: "none",
    display: "flex", alignItems: "center", gap: 8, padding: "12px 20px",
    cursor: "pointer", width: "100%", fontFamily: "inherit", minHeight: 44, textAlign: "start",
  },
  accStepLabel: { fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)", flex: 1, textAlign: "start" },
  accStepChips: { display: "flex", gap: 6 },
  accStepExpand: { display: "flex", flexDirection: "column", gap: 12, padding: "12px 20px 16px 20px", background: "var(--surface-alt)" },
  accAddRow: { display: "flex", flexDirection: "column", gap: 4, padding: "8px 12px" },

  // ---- Board variant ----
  boardScroll: {
    display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8,
    WebkitOverflowScrolling: "touch",
  },
  boardLane: {
    display: "flex", flexDirection: "column", width: 220, minWidth: 220, flexShrink: 0,
    background: "var(--surface-alt)", borderRadius: 8, overflow: "hidden",
  },
  laneHead: { display: "flex", alignItems: "center", gap: 6, padding: "12px 12px 8px" },
  laneLabel: { fontSize: 12, fontWeight: 600, color: "var(--color-text-deep)", flex: 1 },
  laneCount: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", background: "var(--surface-white)", width: 20, height: 20, borderRadius: 999, display: "inline-grid", placeItems: "center" },
  laneBody: { display: "flex", flexDirection: "column", gap: 6, padding: "0 8px", minHeight: 40, flex: 1 },
  laneEmpty: { padding: "12px 4px", textAlign: "center" },
  laneEmptyText: { fontSize: 12, color: "var(--color-text-tertiary)" },
  laneFooter: { display: "flex", flexDirection: "column", gap: 2, padding: "4px 8px 8px" },

  boardCard: {
    appearance: "none", border: "2px solid transparent", background: "var(--surface-white)",
    borderRadius: 6, padding: "10px 12px", display: "flex", flexDirection: "column",
    gap: 6, cursor: "pointer", textAlign: "start", fontFamily: "inherit", width: "100%",
    transition: "box-shadow 150ms ease, border-color 150ms ease",
  },
  boardCardLabel: { fontSize: 12, fontWeight: 500, color: "var(--color-text-medium)", lineHeight: "18px" },
  boardCardChips: { display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" },
  boardSubCount: { fontSize: 11, color: "var(--color-text-tertiary)" },

  // Side curtain (fixed overlay)
  curtainOverlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 999,
  },
  curtain: {
    position: "fixed", top: 0, right: 0, bottom: 0, width: 420,
    background: "var(--surface-white)", boxShadow: "var(--shadow-drawer)",
    display: "flex", flexDirection: "column", zIndex: 1000,
    animation: "slideInRight 200ms ease",
  },
  curtainHead: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 20px", borderBottom: "1px solid var(--color-border-card-soft)",
  },
  curtainTitle: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)" },
  curtainBody: {
    display: "flex", flexDirection: "column", gap: 16, padding: 20,
    overflow: "auto", flex: 1,
  },

  // ---- Recipe variant ----
  recipeHero: { display: "flex", gap: 32, alignItems: "flex-start" },
  recipeHeroLeft: { flex: 1, display: "flex", flexDirection: "column", gap: 8 },
  recipeLabel: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "1px" },
  recipeTitle: { margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: "28px" },
  recipeDesc: { margin: 0, fontSize: 14, color: "var(--color-text-medium)", lineHeight: "22px", maxWidth: 560 },
  recipeHeroRight: { display: "flex", flexDirection: "column", gap: 12, minWidth: 280, flexShrink: 0 },
  recipeMetaItem: { display: "flex", gap: 8, alignItems: "flex-start" },
  recipeMetaIcon: { width: 28, height: 28, borderRadius: 6, background: "var(--surface-alt)", display: "inline-grid", placeItems: "center", flexShrink: 0, color: "var(--color-text-tertiary)" },
  recipeMetaContent: { display: "flex", flexDirection: "column", gap: 1 },
  recipeMetaLabel: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.3px" },
  recipeMetaValue: { fontSize: 13, color: "var(--color-text-medium)", lineHeight: "18px" },

  recipeSectionHead: { fontSize: 16, fontWeight: 600, color: "var(--color-text-deep)", display: "block", marginBottom: 12 },
  recipeIngredients: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },
  ingredientCol: { display: "flex", flexDirection: "column", gap: 6 },
  ingredientLabel: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" },
  ingredientItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--color-text-medium)" },
  ingredientNone: { fontSize: 12, color: "var(--color-text-tertiary)", fontStyle: "italic" },

  recipeStage: { marginTop: 16, borderTop: "1px solid var(--color-border-card-soft)", paddingTop: 16 },
  recipeStageHead: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  recipeStageNum: { width: 24, height: 24, borderRadius: 999, background: "var(--color-text-deep)", color: "var(--surface-white)", display: "inline-grid", placeItems: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  recipeStageName: { fontSize: 14, fontWeight: 600, color: "var(--color-text-deep)" },
  recipeStepEmpty: { fontSize: 13, color: "var(--color-text-tertiary)", padding: "8px 0", fontStyle: "italic" },

  recipeStepWrap: { borderBottom: "1px solid var(--color-border-card-soft)" },
  recipeStepRow: {
    appearance: "none", border: "none", background: "none", width: "100%",
    display: "flex", alignItems: "center", gap: 8, padding: "10px 0",
    cursor: "pointer", fontFamily: "inherit", textAlign: "start", minHeight: 44,
  },
  recipeStepBullet: { fontSize: 13, fontWeight: 600, color: "var(--color-text-tertiary)", width: 20, flexShrink: 0 },
  recipeStepText: { fontSize: 13, fontWeight: 500, color: "var(--color-text-medium)", flex: 1, lineHeight: "20px" },
  recipeStepChips: { display: "flex", gap: 4 },
  recipeStepExpand: { display: "flex", flexDirection: "column", gap: 12, padding: "0 0 12px 28px" },
  recipeFieldBlock: { display: "flex", flexDirection: "column", gap: 2 },
  recipeFieldLabel: { fontSize: 11, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.3px" },
  recipeFieldBody: { margin: 0, fontSize: 13, color: "var(--color-text-medium)", lineHeight: "20px", cursor: "pointer" },

  recipeAddWrap: { display: "flex", flexDirection: "column", gap: 4 },

};

// ============================================================
// NAMED EXPORTS — for embedding in Drill Team Leader view
// ============================================================

/**
 * GuidedWorkflowListing — workflow card grid for embedding in Drill TL tab.
 * No PageHeader (host page owns that). Accepts onOpenWorkflow callback.
 */
export function GuidedWorkflowListing({ onOpenWorkflow }) {
  const [search, setSearch] = React.useState("");
  const [statusTab, setStatusTab] = React.useState("active");

  const filtered = React.useMemo(() => {
    const byTab = WORKFLOWS.filter((w) => w.state === statusTab);
    const q = search.trim().toLowerCase();
    if (!q) return byTab;
    return byTab.filter(
      (w) => w.title.toLowerCase().includes(q) || w.description.toLowerCase().includes(q),
    );
  }, [statusTab, search]);

  const statusTabs = [
    { id: "active", label: "Active", count: WORKFLOW_TAB_COUNTS.active },
    { id: "calibration", label: "Calibration", count: WORKFLOW_TAB_COUNTS.calibration },
    { id: "draft", label: "Draft", count: WORKFLOW_TAB_COUNTS.draft },
  ];

  return (
    <div style={s.column}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search workflows…"
          style={{ ...s.fieldInput, flex: 1 }}
        />
        <Button variant="text" leadingIcon={<Plus size={14} />} onClick={() => onOpenWorkflow?.("new")}>
          New workflow
        </Button>
      </div>
      <TabsRow tabs={statusTabs} activeTab={statusTab} onTabClick={setStatusTab} />
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32 }}>
          <span style={s.emptyH}>No workflows</span>
        </div>
      ) : (
        <div style={s.grid}>
          {filtered.map((w) => (
            <WorkflowCard key={w.id} workflow={w} onClick={() => onOpenWorkflow?.(w.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

