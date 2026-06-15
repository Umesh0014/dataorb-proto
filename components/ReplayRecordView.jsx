"use client";

import React from "react";
import {
  Play, Pencil, Check, Sparkles, FlipHorizontal2, AudioLines, Loader2,
  ShieldCheck, UserPlus, CheckCircle2, Scale, TrendingUp, Heart, Coins, Rocket,
  User,
} from "lucide-react";
import PageHeader from "./PageHeader";
import TabsRow from "./TabsRow";
import Card from "./Card";
import Button from "./Button";
import StatusBadge from "./StatusBadge";
import KebabMenu from "./KebabMenu";
import ReplayEditPanel from "./ReplayEditPanel";
import { OUTCOME_TINTS, OUTCOME_LABELS } from "./mocks/replays";
import {
  lhR, lhTerm, lhReplayContent, lhReplayTitle, lhEditedBy, lhCreatedBy,
} from "./learningHubLocale";

// ReplayRecordView — one collection: its overview plus published and
// to-review replays (default sorted most-recently-published). The review
// action set is Edit / Approve only — never reject; the three-dot menu
// archives instead. Audio is cost-deferred: suggested replays carry an
// "audio generates on approval" note, and approving runs a short
// generating state before the replay goes live. Unedited AI replays show
// a disclaimer; a human edit replaces it with the editor's credit.

const OUTCOME_ICONS = {
  retention: ShieldCheck, acquisition: UserPlus, resolution: CheckCircle2,
  compliance: Scale, upsell: TrendingUp, csat: Heart, collections: Coins, onboarding: Rocket,
};

const STATUS_TONE = {
  published: "success",
  suggested: "warning",
  generating: "info",
  archived: "danger",
};

export default function ReplayRecordView({ collection, onBack, onPlay, onApprove, onArchive, onSaveEdit, locale = "en" }) {
  const [editingId, setEditingId] = React.useState(null);
  const live = collection.replays.filter((r) => r.status !== "archived");
  const toReview = live.filter((r) => r.status === "suggested" || r.status === "generating");
  const published = live
    .filter((r) => r.status === "published")
    .sort((a, b) => String(b.publishedAt).localeCompare(String(a.publishedAt)));

  const [tab, setTab] = React.useState(toReview.length > 0 ? "review" : "published");
  const editing = collection.replays.find((r) => r.id === editingId) || null;

  if (editing) {
    return (
      <ReplayEditPanel
        replay={editing}
        onCancel={() => setEditingId(null)}
        onSaved={() => {
          onSaveEdit(editing.id, {
            status: "published",
            edited: true,
            audioReady: true,
            editor: { name: "You", initial: "Y", bg: "#EDE9FE", fg: "#6650A5" },
            publishedAt: new Date().toISOString().slice(0, 10),
          });
          setEditingId(null);
        }}
      />
    );
  }

  const tint = OUTCOME_TINTS[collection.outcome] || OUTCOME_TINTS.retention;
  const Icon = OUTCOME_ICONS[collection.outcome] || ShieldCheck;
  const isAi = collection.maintainedBy === "ai";
  const content = lhReplayContent(locale, collection.id);

  const TABS = [
    { id: "review", label: lhR(locale, "rec_toReview"), count: toReview.length },
    { id: "published", label: lhR(locale, "rec_published"), count: published.length },
  ];
  const list = tab === "review" ? toReview : published;

  return (
    <div style={s.column}>
      <PageHeader
        back={onBack}
        identifier={{ icon: <Icon size={16} color={tint.fg} />, label: content?.name ?? collection.name, iconBg: tint.bg, iconColor: tint.fg }}
        meta={
          <span style={s.metaRow}>
            <MaintainTag isAi={isAi} locale={locale} />
            <span style={s.metaDot} aria-hidden="true">·</span>
            <span>{lhTerm(locale, OUTCOME_LABELS[collection.outcome])} · {lhTerm(locale, collection.driver)}</span>
          </span>
        }
      />

      <OverviewCard collection={collection} locale={locale} />

      <TabsRow tabs={TABS} activeTab={tab} onTabClick={setTab} />

      {list.length === 0 ? (
        <EmptyState tab={tab} sampling={collection.replays.length === 0} locale={locale} />
      ) : (
        <div style={s.grid}>
          {list.map((r) => (
            <ReplayCard
              key={r.id}
              replay={r}
              collection={collection}
              onPlay={() => onPlay(r.id)}
              onEdit={() => setEditingId(r.id)}
              onApprove={() => onApprove(r.id)}
              onArchive={() => onArchive(r.id)}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Collection overview ----------------------------------------------

function OverviewCard({ collection, locale = "en" }) {
  const cfg = collection.config || {};
  const content = lhReplayContent(locale, collection.id);
  const chips = [
    cfg.eligibilityWindow ? lhTerm(locale, cfg.eligibilityWindow) : null,
    cfg.maxReplays ? `${lhR(locale, "rec_max")} ${cfg.maxReplays}` : null,
    cfg.refreshFrequency ? `${lhTerm(locale, cfg.refreshFrequency)} · ${lhR(locale, "rec_auto")}` : null,
    collection.publishMode === "auto" ? lhR(locale, "rec_aiPublishes") : lhR(locale, "rec_manualReview"),
  ].filter(Boolean);
  return (
    <Card padX={24} padY={20} style={s.overview}>
      <p style={s.overviewDesc} dir="auto">{content?.description ?? collection.description}</p>
      {collection.objective && (
        <p style={s.overviewObjective}><span style={s.objectiveLabel}>{lhR(locale, "rec_objective")}</span><span dir="auto">{collection.objective}</span></p>
      )}
      <div style={s.chipRow}>
        {chips.map((c) => <span key={c} style={s.cfgChip}>{c}</span>)}
      </div>
    </Card>
  );
}

// ---- Replay card (short, skill-card style) ----------------------------

function ReplayCard({ replay, collection, onPlay, onEdit, onApprove, onArchive, locale = "en" }) {
  const [hover, setHover] = React.useState(false);
  const tone = STATUS_TONE[replay.status] || STATUS_TONE.suggested;
  const statusLabel = lhR(locale, `rec_${replay.status}`);
  const title = lhReplayTitle(locale, replay.id, replay.title);
  const isSuggested = replay.status === "suggested";
  const isGenerating = replay.status === "generating";
  const canReview = collection.publishMode === "manual" && isSuggested;

  const kebabItems = [
    { label: lhR(locale, "rec_editReplay"), onClick: onEdit },
    { label: lhR(locale, "rec_moveColl"), onClick: () => {} },
    { label: lhR(locale, "rec_archiveAction"), onClick: onArchive },
  ];

  return (
    <Card
      padX={20}
      padY={18}
      style={{ ...s.replayCard, boxShadow: hover ? "var(--shadow-4)" : "var(--shadow-card)" }}
      // Card is a div; hover handlers via wrapper
    >
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={s.replayInner}>
        <div style={s.replayTop}>
          <StatusBadge tone={tone}>{statusLabel}</StatusBadge>
          <PublishSource replay={replay} hover={hover} locale={locale} />
          <span style={s.duration}>{formatDuration(replay.durationSec)}</span>
        </div>

        <span style={s.replayTitle} dir="auto">{title}</span>

        <Provenance replay={replay} locale={locale} />

        <div style={s.replayFooter}>
          <AudioState replay={replay} locale={locale} />
          <div style={s.actions}>
            {canReview ? (
              <>
                <Button variant="text" uppercase={false} leadingIcon={<Pencil size={14} />} onClick={onEdit} style={s.editBtn}>{lhR(locale, "rec_edit")}</Button>
                <Button variant="primary" uppercase={false} leadingIcon={<Check size={14} />} onClick={onApprove} style={s.approveBtn}>{lhR(locale, "rec_approve")}</Button>
              </>
            ) : isGenerating ? (
              <span style={s.generatingNote}><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> {lhR(locale, "rec_genAudio")}</span>
            ) : (
              <Button variant="primary" uppercase={false} leadingIcon={<Play size={14} />} onClick={onPlay} style={s.approveBtn}>{lhR(locale, "rec_play")}</Button>
            )}
            <KebabMenu items={kebabItems} ariaLabel={title} />
          </div>
        </div>
      </div>
    </Card>
  );
}

// AI-published shows a mirror icon; human-published shows the outcome icon.
function PublishSource({ replay, hover, locale = "en" }) {
  const isAi = replay.publishedBy === "ai";
  const Outcome = OUTCOME_ICONS[replay.outcome] || ShieldCheck;
  return (
    <span style={{ ...s.sourceIcon, opacity: hover ? 1 : 0.55, transition: "opacity 120ms ease" }} title={isAi ? lhR(locale, "aiMaintained") : lhCreatedBy(locale, replay.publishedBy)}>
      {isAi ? <FlipHorizontal2 size={15} color="var(--color-icon-tertiary-fg)" /> : <Outcome size={15} color="var(--color-text-tertiary)" />}
    </span>
  );
}

// Unedited AI replay → disclaimer; once a human edits → editor credit.
function Provenance({ replay, locale = "en" }) {
  if (replay.edited && replay.editor) {
    return (
      <span style={s.provenance}>
        <span style={{ ...s.editorAvatar, background: replay.editor.bg, color: replay.editor.fg }} aria-hidden="true">{replay.editor.initial}</span>
        <span style={s.provenanceText}>{lhEditedBy(locale, replay.editor.name)}</span>
      </span>
    );
  }
  return (
    <span style={s.provenance}>
      <Sparkles size={13} color="var(--color-icon-tertiary-fg)" />
      <span style={{ ...s.provenanceText, color: "var(--color-icon-tertiary-fg)" }}>{lhR(locale, "rec_aiGenerated")}</span>
    </span>
  );
}

function AudioState({ replay, locale = "en" }) {
  if (replay.audioReady) {
    return <span style={s.audioReady}><AudioLines size={14} color="var(--color-success)" /> {lhR(locale, "rec_audioReady")}</span>;
  }
  if (replay.status === "generating") {
    return <span style={s.audioPending}>{lhR(locale, "rec_audioGen")}</span>;
  }
  return <span style={s.audioPending}>{lhR(locale, "rec_audioOnApproval")}</span>;
}

function EmptyState({ tab, sampling, locale = "en" }) {
  const heading = sampling
    ? lhR(locale, "rec_emptySamplingH")
    : tab === "review" ? lhR(locale, "rec_emptyReviewH") : lhR(locale, "rec_emptyPublishedH");
  const body = sampling
    ? lhR(locale, "rec_emptySamplingB")
    : tab === "review" ? lhR(locale, "rec_emptyReviewB") : lhR(locale, "rec_emptyPublishedB");
  return (
    <Card padX={32} padY={40} style={s.empty}>
      <span style={s.emptyHeading}>{heading}</span>
      <span style={s.emptyBody}>{body}</span>
    </Card>
  );
}

function MaintainTag({ isAi, locale = "en" }) {
  return (
    <span style={s.maintainTag}>
      {isAi ? <Sparkles size={12} color="var(--color-icon-tertiary-fg)" /> : <User size={12} color="var(--color-text-tertiary)" />}
      <span style={{ color: isAi ? "var(--color-icon-tertiary-fg)" : "var(--color-text-tertiary)", fontWeight: 700 }}>
        {isAi ? lhR(locale, "aiMaintained") : lhR(locale, "selfMaintained")}
      </span>
    </span>
  );
}

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s2 = String(sec % 60).padStart(2, "0");
  return `${m}:${s2}`;
}

const s = {
  column: { display: "flex", flexDirection: "column", gap: 20, width: "100%", fontFamily: "var(--font-sans)" },
  metaRow: { display: "inline-flex", alignItems: "center", gap: 8, color: "var(--color-text-tertiary)" },
  metaDot: { color: "var(--color-text-tertiary)" },
  maintainTag: { display: "inline-flex", alignItems: "center", gap: 4 },

  overview: { display: "flex", flexDirection: "column", gap: 12, border: "1px solid var(--color-border-card-soft)" },
  overviewDesc: { margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--color-text-medium)" },
  overviewObjective: { margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--color-text-tertiary)", display: "flex", flexDirection: "column", gap: 2 },
  objectiveLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", color: "var(--color-text-tertiary)" },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  cfgChip: { display: "inline-flex", alignItems: "center", height: 26, padding: "0 10px", borderRadius: 999, background: "var(--color-chip-bg)", color: "var(--color-text-medium)", fontSize: 12, fontWeight: 600 },

  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16 },

  replayCard: { padding: 0 },
  replayInner: { display: "flex", flexDirection: "column", gap: 10, padding: "18px 20px" },
  replayTop: { display: "flex", alignItems: "center", gap: 10 },
  sourceIcon: { display: "inline-grid", placeItems: "center" },
  duration: { marginInlineStart: "auto", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-tertiary)" },
  replayTitle: { fontSize: 15, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.4 },

  provenance: { display: "inline-flex", alignItems: "center", gap: 6 },
  editorAvatar: { width: 18, height: 18, borderRadius: 999, display: "inline-grid", placeItems: "center", fontSize: 9, fontWeight: 700, flexShrink: 0 },
  provenanceText: { fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)" },

  replayFooter: { marginTop: 4, paddingTop: 12, borderTop: "1px solid var(--color-divider-card)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  audioReady: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--color-success)" },
  audioPending: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", fontStyle: "italic" },
  actions: { display: "inline-flex", alignItems: "center", gap: 6 },
  editBtn: { height: 32, minWidth: 0, paddingInline: 10, color: "var(--do-brand-blue)" },
  approveBtn: { height: 32, minWidth: 0, paddingInline: 14, fontSize: 12 },
  generatingNote: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--color-info)" },

  empty: { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" },
  emptyHeading: { fontSize: 16, fontWeight: 600, color: "var(--color-text-deep)" },
  emptyBody: { fontSize: 13, color: "var(--color-text-tertiary)", maxWidth: 380, lineHeight: 1.5 },
};
