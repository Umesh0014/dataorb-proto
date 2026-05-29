"use client";

import React from "react";
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  X,
  ArrowUpRight,
  FileCheck2,
  HelpCircle,
  Pencil,
  ExternalLink,
  Send,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import MultiLineInput from "./MultiLineInput";
import PublishGuideModal from "./PublishGuideModal";
import {
  AVAILABLE_PLAYBOOKS,
  AVAILABLE_BRAND_DOCUMENTS,
  EMPTY_GUIDE_DRAFT,
  GUIDE_LANGUAGE_OPTIONS,
  GUIDE_DOMAIN_OPTIONS,
  GUIDE_SESSION_LENGTH_OPTIONS,
  GUIDE_FIELD_MAX,
  authorTone,
} from "./mocks/guideArtefacts";

// CreateGuideWizardPage — Create Guide flow shell. Stage 1 ("Knowledge
// Base") is the only stage with real content; Stages 2 ("Define Guide")
// and 3 ("Preview & Publish") mount the same shell with a placeholder
// body so Back/Next remain wired end-to-end (same pattern Mission and
// Task wizards use).
//
// The Knowledge Base stage carries two artefact source types toggled by
// pills — Playbooks + Brand Documents. Both share one layout: top
// stepper, title + pills, main artefact region (empty or populated),
// optional right drawer (Available {type}), sticky footer. The drawer
// is a 400px column rendered inline next to the main card; opening it
// re-flows the main card from full-width to flex:1.

export const GUIDE_WIZARD_STEPS = [
  { id: "knowledge-base",   label: "Knowledge Base" },
  { id: "define",           label: "Define Guide" },
  { id: "preview",          label: "Preview & Publish" },
];

export { EMPTY_GUIDE_DRAFT };

const SOURCE_TYPES = [
  { id: "playbooks",        label: "Playbooks" },
  { id: "brand-documents",  label: "Brand Documents" },
];

const DOC_TYPE_TONE = {
  SOP:     { bg: "#FFEDD5", fg: "#9A3412" },
  FAQ:     { bg: "#FFEDD5", fg: "#9A3412" },
  Article: { bg: "#FFEDD5", fg: "#9A3412" },
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${String(d.getUTCDate()).padStart(2, "0")} ${months[d.getUTCMonth()]}, ${d.getUTCFullYear()}`;
}

export default function CreateGuideWizardPage({
  step = "knowledge-base",
  draft,
  onChange,
  onStepChange,
  onCancel,
  onSave,
  onPublish,
}) {
  const data = draft || EMPTY_GUIDE_DRAFT;
  const idx = GUIDE_WIZARD_STEPS.findIndex((s) => s.id === step);
  const safeIdx = idx === -1 ? 0 : idx;
  const isLast = safeIdx === GUIDE_WIZARD_STEPS.length - 1;
  const onKnowledgeBase = step === "knowledge-base";

  // Local Stage-1 state — source-type toggle + drawer visibility. The
  // added arrays live on the parent draft so they persist across step
  // changes (Mission wizard precedent).
  const [sourceType, setSourceType] = React.useState("playbooks");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  // Stage 3 publish-confirmation modal visibility. Modal is the actual
  // release confirmation; onPublish fires only after the author picks a
  // mode and clicks the modal's primary CTA.
  const [publishModalOpen, setPublishModalOpen] = React.useState(false);

  React.useEffect(() => { setSearch(""); }, [sourceType, drawerOpen]);

  const playbookIds  = data.playbookIds  || [];
  const documentIds  = data.documentIds  || [];

  // Per-step gate. Knowledge Base = ≥1 artefact (any type). Define Guide
  // = name + language + description filled. Preview & Publish = always
  // ready (Publish CTA triggers the publish handler).
  const stageValid = (() => {
    if (step === "knowledge-base") return playbookIds.length + documentIds.length >= 1;
    if (step === "define") {
      return Boolean(
        (data.name || "").trim() &&
        (data.language || "").trim() &&
        (data.description || "").trim(),
      );
    }
    return true;
  })();

  const addedPlaybooks = React.useMemo(
    () => playbookIds.map((id) => AVAILABLE_PLAYBOOKS.find((p) => p.id === id)).filter(Boolean),
    [playbookIds],
  );
  const addedDocuments = React.useMemo(
    () => documentIds.map((id) => AVAILABLE_BRAND_DOCUMENTS.find((d) => d.id === id)).filter(Boolean),
    [documentIds],
  );

  const availablePlaybooks = React.useMemo(
    () => AVAILABLE_PLAYBOOKS.filter((p) => !playbookIds.includes(p.id)),
    [playbookIds],
  );
  const availableDocuments = React.useMemo(
    () => AVAILABLE_BRAND_DOCUMENTS.filter((d) => !documentIds.includes(d.id)),
    [documentIds],
  );

  const handleAddPlaybook = (id) => onChange?.({ ...data, playbookIds: [...playbookIds, id] });
  const handleRemovePlaybook = (id) => onChange?.({ ...data, playbookIds: playbookIds.filter((x) => x !== id) });
  const handleAddAllPlaybooks = () => onChange?.({ ...data, playbookIds: AVAILABLE_PLAYBOOKS.map((p) => p.id) });

  const handleAddDocument = (id) => onChange?.({ ...data, documentIds: [...documentIds, id] });
  const handleRemoveDocument = (id) => onChange?.({ ...data, documentIds: documentIds.filter((x) => x !== id) });
  const handleAddAllDocuments = () => onChange?.({ ...data, documentIds: AVAILABLE_BRAND_DOCUMENTS.map((d) => d.id) });

  const requestCancel = () => {
    const dirty = playbookIds.length > 0 || documentIds.length > 0;
    if (dirty && typeof window !== "undefined") {
      const ok = window.confirm("Discard changes? Your draft guide will be lost.");
      if (!ok) return;
    }
    onCancel?.();
  };

  const goNext = () => {
    if (isLast) { setPublishModalOpen(true); return; }
    onStepChange?.(GUIDE_WIZARD_STEPS[safeIdx + 1].id);
  };
  const handleConfirmPublish = (mode) => {
    setPublishModalOpen(false);
    onPublish?.(mode);
  };
  const goBack = () => {
    if (safeIdx === 0) { requestCancel(); return; }
    onStepChange?.(GUIDE_WIZARD_STEPS[safeIdx - 1].id);
  };

  return (
    <div style={styles.column}>
      <Card padX={20} padY={16}>
        <Stepper steps={GUIDE_WIZARD_STEPS} activeIndex={safeIdx} onBack={goBack} />
      </Card>

      <div style={styles.bodyRow}>
        {step === "preview" ? (
          <PreviewPublishStage
            draft={data}
            addedPlaybooks={addedPlaybooks}
            addedDocuments={addedDocuments}
            onEditOverview={() => onStepChange?.("define")}
            onEditKnowledgeBase={() => onStepChange?.("knowledge-base")}
          />
        ) : (
          <>
            <Card padX={24} padY={24} style={styles.body}>
              {onKnowledgeBase ? (
                <KnowledgeBaseStage
                  sourceType={sourceType}
                  onSourceTypeChange={setSourceType}
                  drawerOpen={drawerOpen}
                  onOpenDrawer={() => setDrawerOpen(true)}
                  addedPlaybooks={addedPlaybooks}
                  addedDocuments={addedDocuments}
                  onRemovePlaybook={handleRemovePlaybook}
                  onRemoveDocument={handleRemoveDocument}
                />
              ) : step === "define" ? (
                <DefineGuideStage draft={data} onChange={onChange} />
              ) : (
                <PlaceholderStage label={GUIDE_WIZARD_STEPS[safeIdx].label} />
              )}
            </Card>

            {onKnowledgeBase && drawerOpen && (
              <Drawer
                sourceType={sourceType}
                search={search}
                onSearchChange={setSearch}
                onClose={() => setDrawerOpen(false)}
                playbooks={availablePlaybooks}
                documents={availableDocuments}
                onAddPlaybook={handleAddPlaybook}
                onAddDocument={handleAddDocument}
                onAddAllPlaybooks={handleAddAllPlaybooks}
                onAddAllDocuments={handleAddAllDocuments}
              />
            )}
          </>
        )}
      </div>

      <Card padX={24} padY={16}>
        <div style={styles.footerRow}>
          <Button variant="text" uppercase={false} onClick={requestCancel}>Cancel</Button>
          <div style={styles.footerRight}>
            <Button variant="text" uppercase={false} onClick={() => onSave?.(data)}>Save</Button>
            <Button
              variant="primary"
              uppercase={false}
              disabled={!stageValid}
              onClick={goNext}
              trailingIcon={isLast ? <Send size={14} /> : <ChevronRight size={16} />}
              style={{ height: 40, minWidth: 0, paddingInline: 20 }}
            >
              {isLast ? "Publish" : "Next"}
            </Button>
          </div>
        </div>
      </Card>

      <PublishGuideModal
        open={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onConfirm={handleConfirmPublish}
      />
    </div>
  );
}

// ---- Stepper -----------------------------------------------------------

function Stepper({ steps, activeIndex, onBack }) {
  return (
    <div style={styles.stepperRow}>
      <button type="button" onClick={onBack} aria-label="Back" style={styles.backBtn}>
        <ArrowLeft size={20} />
      </button>
      <div style={styles.stepperCrumbs}>
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
              <span style={{ ...styles.crumbLabel, color, fontWeight: weight }}>{s.label}</span>
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

// ---- Knowledge Base stage ---------------------------------------------

function KnowledgeBaseStage({
  sourceType, onSourceTypeChange,
  drawerOpen, onOpenDrawer,
  addedPlaybooks, addedDocuments,
  onRemovePlaybook, onRemoveDocument,
}) {
  const isPlaybooks = sourceType === "playbooks";
  const added = isPlaybooks ? addedPlaybooks : addedDocuments;
  const hasAny = added.length > 0;

  const playbookCount = addedPlaybooks.length;
  const documentCount = addedDocuments.length;

  return (
    <>
      <div style={styles.header}>
        <div style={styles.headerText}>
          <h2 style={styles.title}>Add Knowledge Base</h2>
          <p style={styles.subtitle}>Add artefacts to the guide to be used as a knowledge base</p>
        </div>
        <div style={styles.pillRow}>
          <SourcePill
            label="Playbooks"
            count={playbookCount}
            active={isPlaybooks}
            onClick={() => onSourceTypeChange("playbooks")}
          />
          <SourcePill
            label="Brand Documents"
            count={documentCount}
            active={!isPlaybooks}
            onClick={() => onSourceTypeChange("brand-documents")}
          />
        </div>
      </div>

      {hasAny ? (
        <PopulatedRegion
          sourceType={sourceType}
          drawerOpen={drawerOpen}
          onAddMore={onOpenDrawer}
          items={added}
          onRemove={isPlaybooks ? onRemovePlaybook : onRemoveDocument}
        />
      ) : (
        <EmptyRegion
          sourceType={sourceType}
          drawerOpen={drawerOpen}
          onAdd={onOpenDrawer}
        />
      )}
    </>
  );
}

function SourcePill({ label, count, active, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      ...styles.pill,
      background: active ? "var(--color-icon-tertiary-fg)" : "#FFFFFF",
      color: active ? "#FFFFFF" : "var(--color-text-medium)",
      borderColor: active ? "var(--color-icon-tertiary-fg)" : "var(--color-border-card-soft)",
    }}>
      <span style={styles.pillLabel}>{label}</span>
      <span style={{
        ...styles.pillCount,
        background: active ? "#FFFFFF" : "var(--color-chip-bg)",
        color: active ? "var(--color-icon-tertiary-fg)" : "var(--color-text-medium)",
      }}>
        {count}
      </span>
    </button>
  );
}

// ---- Empty region ------------------------------------------------------

function EmptyRegion({ sourceType, drawerOpen, onAdd }) {
  const isPlaybooks = sourceType === "playbooks";
  const heading = isPlaybooks ? "No playbooks added yet" : "No brand documents added yet";
  const body    = isPlaybooks ? "Add playbooks to start the guide." : "Add files to start the guide.";
  const cta     = isPlaybooks ? "Add Playbook" : "Add Brand Documents";

  return (
    <div style={styles.emptyContainer}>
      <span style={styles.emptyHeading}>{heading}</span>
      <span style={styles.emptyBody}>{body}</span>
      <Button
        variant={drawerOpen ? "primary" : "text"}
        uppercase={false}
        leadingIcon={<Plus size={16} />}
        onClick={onAdd}
        style={
          drawerOpen
            ? { height: 36, minWidth: 0, paddingInline: 16, background: "var(--color-icon-tertiary-bg)", color: "var(--color-icon-tertiary-fg)" }
            : { height: 36, minWidth: 0, paddingInline: 16, color: "var(--do-brand-blue)" }
        }
      >
        {cta}
      </Button>
    </div>
  );
}

// ---- Populated region --------------------------------------------------

function PopulatedRegion({ sourceType, drawerOpen, onAddMore, items, onRemove }) {
  const isPlaybooks = sourceType === "playbooks";
  const headerLabel = isPlaybooks ? "Playbooks" : "Brand Documents";
  const ctaLabel    = isPlaybooks ? "Playbook"  : "Brand Documents";

  return (
    <div style={styles.populatedContainer}>
      <div style={styles.populatedHeader}>
        <div style={styles.populatedHeaderLeft}>
          <span style={styles.populatedLabel}>{headerLabel}</span>
          <span style={styles.populatedCount}>{items.length}</span>
        </div>
        <Button
          variant="text"
          uppercase={false}
          leadingIcon={<Plus size={16} />}
          onClick={onAddMore}
          style={{ height: 34, minWidth: 0, paddingInline: 14, background: "var(--color-icon-tertiary-bg)", color: "var(--do-brand-blue)", borderRadius: 8 }}
        >
          {ctaLabel}
        </Button>
      </div>
      <div style={styles.rowList}>
        {items.map((item) => (
          <ArtefactRow
            key={item.id}
            item={item}
            kind={isPlaybooks ? "playbook" : "document"}
            trailing={(
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                aria-label={`Remove ${item.title}`}
                style={styles.iconBtn}
              >
                <X size={14} color="var(--color-text-tertiary)" />
              </button>
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ---- Drawer ------------------------------------------------------------

function Drawer({
  sourceType, search, onSearchChange, onClose,
  playbooks, documents,
  onAddPlaybook, onAddDocument,
  onAddAllPlaybooks, onAddAllDocuments,
}) {
  const isPlaybooks = sourceType === "playbooks";
  const list = isPlaybooks ? playbooks : documents;

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((it) => it.title.toLowerCase().includes(q));
  }, [list, search]);

  const headerLabel = isPlaybooks ? "Available Playbooks" : "Available Documents";
  const helperText  = isPlaybooks
    ? "To incorporate Playbooks, drag, drop, or tap to add"
    : "To incorporate Documents, drag, drop, or tap to add";

  const allAssigned = list.length === 0;

  return (
    <Card padX={0} padY={0} style={styles.drawer}>
      <div style={styles.drawerHeader}>
        <span style={styles.drawerTitle}>
          {headerLabel} ({list.length})
        </span>
        <button type="button" onClick={onClose} aria-label="Close drawer" style={styles.iconBtn}>
          <X size={16} color="var(--color-text-tertiary)" />
        </button>
      </div>

      {!allAssigned && (
        <>
          <div style={styles.drawerSearchWrap}>
            <Search size={16} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search"
              aria-label="Search available items"
              style={styles.drawerSearchInput}
            />
          </div>
          <p style={styles.drawerHelper}>{helperText}</p>
        </>
      )}

      <div style={styles.drawerBody}>
        {allAssigned ? (
          <AllAssignedEmpty sourceType={sourceType} />
        ) : (
          filtered.map((item) => (
            <DrawerRow
              key={item.id}
              item={item}
              kind={isPlaybooks ? "playbook" : "document"}
              onAdd={() => (isPlaybooks ? onAddPlaybook(item.id) : onAddDocument(item.id))}
            />
          ))
        )}
      </div>

      <div style={styles.drawerFooter}>
        <Button
          variant="text"
          uppercase={false}
          onClick={isPlaybooks ? onAddAllPlaybooks : onAddAllDocuments}
          disabled={allAssigned}
          style={{ height: 32, paddingInline: 12, color: allAssigned ? "var(--color-text-placeholder)" : "var(--color-text-deep)" }}
        >
          Add All
        </Button>
      </div>
    </Card>
  );
}

function AllAssignedEmpty({ sourceType }) {
  const isPlaybooks = sourceType === "playbooks";
  const heading = isPlaybooks ? "All playbooks assigned" : "All documents assigned";
  const body    = isPlaybooks ? "Create new playbooks to add." : "Create new documents to add.";
  const cta     = isPlaybooks ? "Create Playbook" : "Create Document";
  return (
    <div style={styles.drawerEmpty}>
      <span style={styles.drawerEmptyIcon} aria-hidden="true">
        <FileCheck2 size={32} color="var(--color-text-tertiary)" />
      </span>
      <span style={styles.drawerEmptyHeading}>{heading}</span>
      <span style={styles.drawerEmptyBody}>{body}</span>
      <button
        type="button"
        onClick={() => {
          // TODO: Create-Playbook / Create-Document flows out of scope.
          // eslint-disable-next-line no-console
          console.log(`create new ${sourceType}`);
        }}
        style={styles.drawerEmptyLink}
      >
        {cta}
      </button>
    </div>
  );
}

// ---- Artefact row (shared shape) --------------------------------------

function ArtefactRow({ item, kind, trailing }) {
  const tone = authorTone(item.author);
  return (
    <div style={styles.row}>
      <span style={styles.rowTitle} title={item.title}>{item.title}</span>
      <div style={styles.rowMeta}>
        <Avatar tone={tone} initial={item.author} />
        <span style={styles.rowMetaText}>{formatDate(item.updatedAt)}</span>
        {kind === "playbook" ? (
          <LanguagePills languages={item.languages} />
        ) : (
          <DocTypePill kind={item.docType} />
        )}
      </div>
      {trailing}
    </div>
  );
}

function DrawerRow({ item, kind, onAdd }) {
  const tone = authorTone(item.author);
  return (
    <div style={styles.drawerRow}>
      <div style={styles.drawerRowMain}>
        <span style={styles.drawerRowTitle} title={item.title}>
          {item.title}
          <ArrowUpRight size={12} color="var(--color-text-tertiary)" style={{ marginLeft: 6, verticalAlign: "middle" }} aria-hidden="true" />
        </span>
        <div style={styles.drawerRowMeta}>
          <Avatar tone={tone} initial={item.author} small />
          <span style={styles.rowMetaText}>{formatDate(item.updatedAt)}</span>
          <span style={styles.drawerDot} aria-hidden="true" />
          {kind === "playbook" ? (
            <LanguagePills languages={item.languages} />
          ) : (
            <DocTypePill kind={item.docType} />
          )}
        </div>
      </div>
      <button type="button" onClick={onAdd} aria-label={`Add ${item.title}`} style={styles.iconBtn}>
        <Plus size={16} color="var(--color-text-tertiary)" />
      </button>
    </div>
  );
}

// ---- Atoms -------------------------------------------------------------

function Avatar({ tone, initial, small }) {
  const size = small ? 16 : 20;
  const fontSize = small ? 9 : 10;
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        background: tone.bg,
        color: tone.fg,
        display: "inline-grid",
        placeItems: "center",
        fontSize,
        fontWeight: 700,
        letterSpacing: "0.15px",
        flexShrink: 0,
      }}
    >
      {initial}
    </span>
  );
}

function LanguagePills({ languages = [] }) {
  const first = languages[0];
  const extra = Math.max(0, languages.length - 1);
  if (!first) return null;
  return (
    <span style={styles.langWrap}>
      <span style={styles.langChip}>{first}</span>
      {extra > 0 && <span style={styles.langOverflow}>+{extra}</span>}
    </span>
  );
}

function DocTypePill({ kind }) {
  const tone = DOC_TYPE_TONE[kind] || DOC_TYPE_TONE.SOP;
  return (
    <span style={{ ...styles.docTypePill, background: tone.bg, color: tone.fg }}>{kind}</span>
  );
}

// ---- Stage 2: Define Guide --------------------------------------------

const DEFINE_HELP = {
  description: "What the agent will accomplish by the end of the session.",
  learnersOutcome: "Concrete behaviour change you want to see after practice.",
  subjectAnchors: "Domain anchors (product, policy, region) that scope this guide.",
  targetLearnerProfile: "Who this guide is for — role, tenure, team.",
  maxSessionLength: "Hard ceiling on a single practice session.",
};

const SESSION_LENGTH_MIN = 5;
const SESSION_LENGTH_MAX = 20;
const SESSION_LENGTH_STEP = 5;

function DefineGuideStage({ draft, onChange }) {
  const setField = (key) => (next) => onChange?.({ ...draft, [key]: next });

  return (
    <>
      <div style={styles.header}>
        <div style={styles.headerText}>
          <h2 style={styles.title}>Enter Guide Details</h2>
          <p style={styles.subtitle}>Define the guide details and what agents will practice</p>
        </div>
      </div>

      <div style={styles.formGrid}>
        <div style={styles.formRow}>
          <Field label="Guide name" required>
            <SingleLineInput
              value={draft.name}
              onChange={setField("name")}
              max={GUIDE_FIELD_MAX.name}
              placeholder="E.g. Objection Handling"
            />
          </Field>
          <Field label="Guide language" required>
            <Dropdown
              value={draft.language}
              onChange={setField("language")}
              options={GUIDE_LANGUAGE_OPTIONS}
              placeholder="E.g. English (UK)"
            />
          </Field>
        </div>

        <Field label="Guide description" required help={DEFINE_HELP.description} fullWidth>
          <MultiLineInput
            value={draft.description}
            onChange={setField("description")}
            max={GUIDE_FIELD_MAX.description}
            rows={3}
            placeholder="E.g. Get the billing error reversed and confirmation it won't happen again next month"
          />
        </Field>

        <Field label="Learners outcome" help={DEFINE_HELP.learnersOutcome} fullWidth>
          <MultiLineInput
            value={draft.learnersOutcome}
            onChange={setField("learnersOutcome")}
            max={GUIDE_FIELD_MAX.learnersOutcome}
            rows={3}
            placeholder="E.g. Successfully de-escalate billing disputes and apply approved waiver credits."
          />
        </Field>

        <Field label="Subject anchors" help={DEFINE_HELP.subjectAnchors} fullWidth>
          <MultiLineInput
            value={draft.subjectAnchors}
            onChange={setField("subjectAnchors")}
            max={GUIDE_FIELD_MAX.subjectAnchors}
            rows={3}
            placeholder="E.g. 5G fiber residential provisioning protocol"
          />
        </Field>

        <Field label="Target learner profile" help={DEFINE_HELP.targetLearnerProfile} fullWidth>
          <MultiLineInput
            value={draft.targetLearnerProfile}
            onChange={setField("targetLearnerProfile")}
            max={GUIDE_FIELD_MAX.targetLearnerProfile}
            rows={3}
            placeholder="E.g. Premium enterprise business retention specialists"
          />
        </Field>

        <div style={styles.formRow}>
          <Field label="Guide domain">
            <Dropdown
              value={draft.domain}
              onChange={setField("domain")}
              options={GUIDE_DOMAIN_OPTIONS}
              placeholder="E.g. Process"
            />
          </Field>
          <div /> {/* spacer for col 2 */}
        </div>

        <Field label="Max session length" help={DEFINE_HELP.maxSessionLength} fullWidth>
          <div style={styles.sessionRow}>
            <div style={styles.sessionDropdown}>
              <Dropdown
                value={`${draft.maxSessionLength} Mins`}
                onChange={(opt) => {
                  const m = parseInt(opt, 10);
                  if (!Number.isNaN(m)) setField("maxSessionLength")(m);
                }}
                options={GUIDE_SESSION_LENGTH_OPTIONS}
                placeholder="E.g. 5 Mins"
              />
            </div>
            <SessionSlider
              value={draft.maxSessionLength}
              onChange={setField("maxSessionLength")}
              min={SESSION_LENGTH_MIN}
              max={SESSION_LENGTH_MAX}
              step={SESSION_LENGTH_STEP}
            />
          </div>
        </Field>
      </div>
    </>
  );
}

// ---- Field wrapper -----------------------------------------------------

function Field({ label, required, help, fullWidth, children }) {
  return (
    <div style={{ ...styles.field, gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <div style={styles.fieldLabelRow}>
        <span style={styles.fieldLabel}>{label}</span>
        {required && <span style={styles.fieldRequired}>*</span>}
        {help && (
          <span title={help} aria-label={help} style={styles.fieldHelp}>
            <HelpCircle size={14} color="var(--color-text-tertiary)" />
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ---- SingleLineInput (mirrors MissionWizardPage primitive) ------------

function SingleLineInput({ value, onChange, max, placeholder }) {
  const handle = (e) => {
    const next = e.target.value;
    if (!max || next.length <= max) onChange(next);
  };
  return (
    <div style={styles.inputWrap}>
      <input
        type="text"
        value={value || ""}
        onChange={handle}
        placeholder={placeholder}
        maxLength={max}
        style={styles.singleInput}
      />
      {max && <span style={styles.counter}>{(value || "").length}/{max}</span>}
    </div>
  );
}

// ---- Dropdown (custom-popover variant matching wizard precedent) -----

function Dropdown({ value, onChange, options, placeholder }) {
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
    <div ref={ref} style={styles.ddWrap}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={styles.ddTrigger}>
        <span
          style={{
            ...styles.ddValue,
            color: value ? "var(--color-text-deep)" : "var(--color-text-placeholder)",
          }}
        >
          {value || placeholder || "Select"}
        </span>
        <ChevronDown size={18} color="var(--color-text-tertiary)" />
      </button>
      {open && (
        <div style={styles.ddMenu}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{ ...styles.ddOption, fontWeight: opt === value ? 600 : 400 }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Session-length slider --------------------------------------------
// Native range input styled to match the Figma slider (lavender thumb +
// track, neutral rail) with tick labels rendered below. No shared
// Slider primitive in the library yet — flagged for promotion.

function SessionSlider({ value, onChange, min, max, step }) {
  const handleChange = (e) => onChange(Number(e.target.value));
  const ticks = [];
  for (let v = min; v <= max; v += step) ticks.push(v);
  return (
    <div style={styles.sliderWrap}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        aria-label="Max session length"
        style={styles.sliderInput}
      />
      <div style={styles.sliderTicks}>
        {ticks.map((t) => (
          <span key={t} style={styles.sliderTickLabel}>{t} Mins</span>
        ))}
      </div>
    </div>
  );
}

// ---- Stage 3: Preview & Publish ---------------------------------------
// Read-only review of everything assembled in Stages 1 + 2 plus a
// terminal Publish action. Renders directly into bodyRow as two sibling
// Cards so the layout matches the Figma 320 + flex split without
// nesting an extra Card wrapper.

function PreviewPublishStage({
  draft, addedPlaybooks, addedDocuments,
  onEditOverview, onEditKnowledgeBase,
}) {
  const [previewSource, setPreviewSource] = React.useState("playbooks");
  const isPlaybooks = previewSource === "playbooks";
  const items = isPlaybooks ? addedPlaybooks : addedDocuments;

  return (
    <>
      <Card padX={0} padY={0} style={styles.previewLeft}>
        <PanelHeader title="Guide Overview" onEdit={onEditOverview} />
        <div style={styles.reviewBody}>
          <ReviewRow label="NAME" value={draft.name} />
          <ReviewRow label="DESCRIPTION" value={draft.description} />
          <ReviewRow label="LEARNERS OUTCOME" value={draft.learnersOutcome} />
          <ReviewRow label="SUBJECT ANCHORS" value={draft.subjectAnchors} />
          <ReviewRow label="TARGET LEARNERS PROFILE" value={draft.targetLearnerProfile} />
          <ReviewRow
            label="SESSION LENGTH"
            value={draft.maxSessionLength ? `~ ${draft.maxSessionLength} mins` : ""}
          />
          <ReviewRow label="LANGUAGES" last>
            {draft.language ? (
              <span style={styles.langWrap}>
                <span style={styles.langChip}>{draft.language}</span>
              </span>
            ) : (
              <span style={styles.reviewEmpty}>—</span>
            )}
          </ReviewRow>
        </div>
      </Card>

      <Card padX={0} padY={0} style={styles.previewRight}>
        <PanelHeader title="Knowledge Base" onEdit={onEditKnowledgeBase} />
        <div style={styles.previewBody}>
          <div style={styles.pillRow}>
            <SourcePill
              label="Playbooks"
              count={addedPlaybooks.length}
              active={isPlaybooks}
              onClick={() => setPreviewSource("playbooks")}
            />
            <SourcePill
              label="Brand Documents"
              count={addedDocuments.length}
              active={!isPlaybooks}
              onClick={() => setPreviewSource("brand-documents")}
            />
          </div>

          {items.length === 0 ? (
            <div style={styles.previewEmpty}>
              No {isPlaybooks ? "playbooks" : "brand documents"} added in this guide.
            </div>
          ) : (
            <div style={styles.previewGrid}>
              {items.map((it) => (
                <PreviewCard
                  key={it.id}
                  item={it}
                  kind={isPlaybooks ? "playbook" : "document"}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </>
  );
}

function PanelHeader({ title, onEdit }) {
  return (
    <div style={styles.panelHeader}>
      <span style={styles.panelTitle}>{title}</span>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${title}`}
        style={styles.iconBtn}
      >
        <Pencil size={16} color="var(--color-text-tertiary)" />
      </button>
    </div>
  );
}

function ReviewRow({ label, value, children, last }) {
  const hasValue = (value ?? "").toString().trim().length > 0;
  return (
    <div style={{ ...styles.reviewRow, borderBottom: last ? "none" : "1px solid var(--color-border-card-soft)" }}>
      <span style={styles.reviewLabel}>{label}</span>
      {children ?? (
        hasValue
          ? <span style={styles.reviewValue}>{value}</span>
          : <span style={styles.reviewEmpty}>—</span>
      )}
    </div>
  );
}

function PreviewCard({ item, kind }) {
  const tone = authorTone(item.author);
  return (
    <div style={styles.previewCard}>
      <div style={styles.previewCardTop}>
        <span style={styles.previewCardTitle} title={item.title}>{item.title}</span>
        <button
          type="button"
          aria-label={`Open ${item.title}`}
          onClick={() => {
            // TODO: open-artefact destination out of scope for this stage.
            // eslint-disable-next-line no-console
            console.log("open artefact", item.id);
          }}
          style={styles.iconBtn}
        >
          <ExternalLink size={16} color="var(--color-text-tertiary)" />
        </button>
      </div>
      <div style={styles.previewCardMeta}>
        <span style={styles.previewMetaPersonGroup}>
          <Avatar tone={tone} initial={item.author} small />
          <span style={styles.rowMetaText}>{formatDate(item.updatedAt)}</span>
        </span>
        <span style={styles.previewMetaDot} aria-hidden="true" />
        {kind === "playbook" ? (
          <LanguagePills languages={item.languages} />
        ) : (
          <DocTypePill kind={item.docType} />
        )}
      </div>
    </div>
  );
}

// ---- Placeholder stage (no stages remain — reserved fallback) ---------

function PlaceholderStage({ label }) {
  return (
    <div style={styles.placeholder}>
      <span style={styles.placeholderTitle}>{label}</span>
      <span style={styles.placeholderBody}>
        This stage will land in a follow-up. Use Back / Next to flow through the wizard shell.
      </span>
    </div>
  );
}

// ---- Styles ------------------------------------------------------------

const styles = {
  column: { display: "flex", flexDirection: "column", gap: 16, width: "100%", flex: 1, minHeight: 0 },
  bodyRow: { display: "flex", alignItems: "stretch", gap: 16, flex: 1, minHeight: 0, minWidth: 0 },
  body: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 24 },

  // Stepper
  stepperRow: { display: "flex", alignItems: "center", gap: 12 },
  backBtn: {
    width: 28, height: 28, borderRadius: 6, border: "none",
    background: "var(--color-card-emoji-bg)",
    display: "inline-grid", placeItems: "center", cursor: "pointer", padding: 0, flexShrink: 0,
    color: "var(--color-text-tertiary)",
  },
  stepperCrumbs: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  crumbLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 14, lineHeight: "20px", letterSpacing: "0.17px",
  },

  // Header
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24, width: "100%" },
  headerText: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  title: { margin: 0, fontSize: 20, fontWeight: 500, lineHeight: "32px", letterSpacing: "0.15px", color: "var(--color-text-medium)" },
  subtitle: { margin: 0, fontSize: 12, fontWeight: 400, lineHeight: "20px", letterSpacing: "0.4px", color: "var(--color-text-tertiary)" },

  // Pills
  pillRow: { display: "flex", gap: 8, flexShrink: 0 },
  pill: {
    display: "inline-flex", alignItems: "center", gap: 8,
    height: 32, padding: "4px 8px", borderRadius: 999,
    border: "1px solid var(--color-border-card-soft)",
    cursor: "pointer", fontFamily: "var(--font-sans)",
    transition: "background 120ms ease, color 120ms ease, border-color 120ms ease",
  },
  pillLabel: { fontSize: 13, fontWeight: 500 },
  pillCount: {
    display: "inline-grid", placeItems: "center",
    minWidth: 22, height: 18, padding: "0 6px", borderRadius: 999,
    fontSize: 10, fontWeight: 600,
  },

  // Empty
  emptyContainer: {
    flex: 1, minHeight: 320, border: "1px dashed #B7C4FF", borderRadius: 8,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 12,
  },
  emptyHeading: { fontSize: 14, fontWeight: 500, color: "var(--color-text-tertiary)" },
  emptyBody: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)" },

  // Populated
  populatedContainer: {
    flex: 1, minHeight: 320, border: "1px solid #B7C4FF", borderRadius: 8, padding: 16,
    display: "flex", flexDirection: "column", gap: 16,
  },
  populatedHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    paddingBottom: 16, borderBottom: "1px solid var(--color-border-card-soft)",
  },
  populatedHeaderLeft: { display: "inline-flex", alignItems: "center", gap: 8 },
  populatedLabel: { fontSize: 14, fontWeight: 500, color: "var(--color-text-tertiary)" },
  populatedCount: {
    display: "inline-grid", placeItems: "center",
    minWidth: 22, height: 18, padding: "0 6px", borderRadius: 999,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--do-brand-blue)",
    fontSize: 10, fontWeight: 600,
  },
  rowList: { display: "flex", flexDirection: "column", gap: 12 },

  // Artefact row
  row: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "12px 16px",
    background: "#FCFBFF", borderRadius: 8,
  },
  rowTitle: {
    flex: 1, minWidth: 0,
    fontSize: 13, fontWeight: 400, color: "var(--color-text-medium)",
    overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
  },
  rowMeta: { display: "inline-flex", alignItems: "center", gap: 8, flexShrink: 0 },
  rowMetaText: {
    fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)",
    fontFamily: '"JetBrains Mono", monospace',
    whiteSpace: "nowrap",
  },

  // Lang pills
  langWrap: { display: "inline-flex", alignItems: "center", gap: 8 },
  langChip: {
    display: "inline-flex", alignItems: "center", height: 24, padding: "0 6px",
    borderRadius: 4, background: "var(--color-chip-bg)", color: "var(--color-text-medium)",
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 400,
  },
  langOverflow: {
    display: "inline-flex", alignItems: "center", height: 24, padding: "0 6px",
    borderRadius: 4, background: "var(--color-chip-bg)", color: "var(--color-text-tertiary)",
    fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 500,
  },

  // Doc type pill
  docTypePill: {
    display: "inline-flex", alignItems: "center", height: 24, padding: "0 6px",
    borderRadius: 4, fontSize: 12, fontWeight: 500, fontFamily: '"JetBrains Mono", monospace',
  },

  // Icon button
  iconBtn: {
    width: 24, height: 24, borderRadius: 4, border: "none",
    background: "transparent", cursor: "pointer", padding: 0,
    display: "inline-grid", placeItems: "center", flexShrink: 0,
  },

  // Drawer
  drawer: {
    width: 400, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: 0,
    borderRadius: 16, border: "1px solid var(--color-border-card-soft)", background: "#FFFFFF",
  },
  drawerHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 16px 16px 20px",
    borderBottom: "1px solid var(--color-border-card-soft)",
  },
  drawerTitle: {
    fontFamily: "var(--font-sans)", fontSize: 16, fontWeight: 400,
    lineHeight: "28px", letterSpacing: "0.15px", color: "var(--color-text-medium)",
  },
  drawerSearchWrap: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "8px 16px 8px 20px",
    borderBottom: "1px solid var(--color-border-card-soft)",
  },
  drawerSearchInput: {
    flex: 1, height: 24, border: "none", outline: "none",
    background: "transparent", fontFamily: "var(--font-sans)", fontSize: 14,
    color: "var(--color-text-deep)",
  },
  drawerHelper: {
    margin: 0, padding: "0 20px 0 20px",
    fontSize: 12, color: "var(--color-text-tertiary)", lineHeight: "20px", letterSpacing: "0.4px",
  },
  drawerBody: {
    flex: 1, minHeight: 0, overflowY: "auto",
    padding: "0 18px 0 20px",
    display: "flex", flexDirection: "column",
  },
  drawerRow: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16,
    padding: "16px 0", borderBottom: "1px solid var(--color-border-card-soft)",
  },
  drawerRowMain: { display: "flex", flexDirection: "column", gap: 8, minWidth: 0, flex: 1 },
  drawerRowTitle: {
    fontSize: 14, fontWeight: 400, lineHeight: "22px", color: "var(--color-text-medium)",
    letterSpacing: "0.1px", display: "block",
  },
  drawerRowMeta: { display: "inline-flex", alignItems: "center", gap: 8 },
  drawerDot: { width: 3, height: 3, borderRadius: 999, background: "#A7AAC1" },
  drawerFooter: {
    display: "flex", justifyContent: "flex-end",
    padding: "16px 10px", borderTop: "1px solid var(--color-border-card-soft)",
  },

  // Drawer empty
  drawerEmpty: {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 8, padding: "0 20px", textAlign: "center",
  },
  drawerEmptyIcon: {
    width: 64, height: 64, borderRadius: 999,
    background: "var(--color-card-emoji-bg)",
    display: "inline-grid", placeItems: "center",
    marginBottom: 8,
  },
  drawerEmptyHeading: { fontSize: 16, fontWeight: 500, color: "var(--color-text-medium)" },
  drawerEmptyBody: { fontSize: 13, color: "var(--color-text-tertiary)" },
  drawerEmptyLink: {
    marginTop: 12,
    background: "transparent", border: "none", padding: "8px 12px", cursor: "pointer",
    fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 500,
    color: "var(--do-brand-blue)",
  },

  // Footer
  footerRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  footerRight: { display: "flex", alignItems: "center", gap: 16 },

  // Placeholder stage
  placeholder: {
    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 8, textAlign: "center",
  },
  placeholderTitle: { fontSize: 18, fontWeight: 600, color: "var(--color-text-deep)" },
  placeholderBody: { fontSize: 13, color: "var(--color-text-tertiary)", maxWidth: 420, lineHeight: 1.5 },

  // Stage 2 — Define Guide form
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    columnGap: 24,
    rowGap: 20,
    width: "100%",
  },
  formRow: { display: "contents" },
  field: { display: "flex", flexDirection: "column", gap: 8, minWidth: 0 },
  fieldLabelRow: { display: "inline-flex", alignItems: "center", gap: 6 },
  fieldLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 13, fontWeight: 500, lineHeight: "20px",
    color: "var(--color-text-medium)",
  },
  fieldRequired: { fontSize: 13, fontWeight: 600, color: "#E11D48", lineHeight: "20px" },
  fieldHelp: {
    display: "inline-grid", placeItems: "center",
    width: 16, height: 16, cursor: "help",
  },

  // SingleLineInput
  inputWrap: {
    position: "relative",
    display: "flex", alignItems: "center",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
    paddingInline: 12,
    height: 40,
  },
  singleInput: {
    flex: 1, minWidth: 0, height: "100%",
    border: "none", outline: "none", background: "transparent",
    fontFamily: "var(--font-sans)", fontSize: 14,
    color: "var(--color-text-deep)",
  },
  counter: {
    flexShrink: 0, marginLeft: 8,
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, color: "var(--color-text-tertiary)",
  },

  // Dropdown
  ddWrap: { position: "relative", width: "100%" },
  ddTrigger: {
    width: "100%", height: 40,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    paddingInline: 12,
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
    cursor: "pointer",
    fontFamily: "var(--font-sans)",
  },
  ddValue: { fontSize: 14, fontWeight: 400, textAlign: "left", flex: 1, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" },
  ddMenu: {
    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 20,
    background: "#FFFFFF",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    boxShadow: "var(--shadow-card)",
    padding: 4,
    maxHeight: 260, overflowY: "auto",
    display: "flex", flexDirection: "column", gap: 2,
  },
  ddOption: {
    border: "none", background: "transparent", textAlign: "left",
    padding: "8px 10px", borderRadius: 6, cursor: "pointer",
    fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--color-text-deep)",
  },

  // Max session length
  sessionRow: {
    display: "flex", alignItems: "center", gap: 16,
    width: "100%",
  },
  sessionDropdown: { width: 160, flexShrink: 0 },
  sliderWrap: { flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 },
  sliderInput: {
    width: "100%",
    accentColor: "var(--color-icon-tertiary-fg)",
    cursor: "pointer",
  },
  sliderTicks: {
    display: "flex", justifyContent: "space-between",
    paddingInline: 2,
  },
  sliderTickLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, color: "var(--color-text-tertiary)",
  },

  // Stage 3 — Preview & Publish
  previewLeft: {
    width: 320, flexShrink: 0,
    display: "flex", flexDirection: "column", minHeight: 0,
  },
  previewRight: {
    flex: 1, minWidth: 0,
    display: "flex", flexDirection: "column", minHeight: 0,
  },
  panelHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 24px",
    borderBottom: "1px solid var(--color-border-card-soft)",
  },
  panelTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 500, lineHeight: "22px", letterSpacing: "0.1px",
    color: "var(--color-text-medium)",
  },

  // Review rows
  reviewBody: {
    display: "flex", flexDirection: "column",
    padding: "0 24px 24px",
  },
  reviewRow: {
    display: "flex", flexDirection: "column", gap: 4,
    padding: "16px 0",
  },
  reviewLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, fontWeight: 500, lineHeight: "17px",
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
  },
  reviewValue: {
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, lineHeight: "20px",
    letterSpacing: "0.17px",
    color: "var(--color-text-medium)",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  reviewEmpty: {
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, lineHeight: "20px",
    color: "var(--color-text-placeholder)",
  },

  // Right-panel body
  previewBody: {
    display: "flex", flexDirection: "column", gap: 24,
    padding: 24,
    flex: 1, minHeight: 0,
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  previewEmpty: {
    padding: 32, textAlign: "center",
    color: "var(--color-text-tertiary)",
    fontSize: 13, lineHeight: "20px",
    border: "1px dashed var(--color-border-card-soft)",
    borderRadius: 8,
  },

  // Preview card
  previewCard: {
    display: "flex", flexDirection: "column", gap: 16,
    padding: 16,
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
  },
  previewCardTop: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    gap: 8,
  },
  previewCardTitle: {
    flex: 1, minWidth: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, lineHeight: "22px", letterSpacing: "0.1px",
    color: "var(--color-text-medium)",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  previewCardMeta: {
    display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
  },
  previewMetaPersonGroup: {
    display: "inline-flex", alignItems: "center", gap: 8,
  },
  previewMetaDot: {
    width: 4, height: 4, borderRadius: 999, background: "#C2C5DD",
    flexShrink: 0,
  },
};
