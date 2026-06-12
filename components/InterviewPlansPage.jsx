"use client";

import React from "react";
import { Plus, SlidersHorizontal, ChevronRight, Sparkles, User } from "lucide-react";
import PageHeader from "./PageHeader";
import TabsRow from "./TabsRow";
import Card from "./Card";
import Banner from "./Banner";
import { FaceScanIcon } from "./SideNav/icons";
import { formatDate } from "./formatDate";
import { FAMILY_TINTS, FAMILY_LABELS } from "./mocks/recruiter";
import { INTERVIEW_PLANS, PLAN_STATUS, planCounts } from "./mocks/interviewPlans";

// InterviewPlansPage — the AI Recruiter's plan-definition surface (route
// /recruiter/plans). An Interview Plan is the template the AI Interviewer runs
// for a role: a Job Profile + the assigned knowledge topics a candidate's
// coverage is measured against. Editorial card grid (reuses the Replay/Skills
// card pattern); each plan drills into its record (logged-not-wired — the plan
// editor is open scope for Akash). Compliance framing matches the pipeline:
// plans define what knowledge is screened, never a pass bar.

export default function InterviewPlansPage({ pageName }) {
  const [tab, setTab] = React.useState("live");
  const [search, setSearch] = React.useState("");

  const counts = planCounts(INTERVIEW_PLANS);
  const TABS = [
    { id: "live", label: "Live", count: counts.live },
    { id: "draft", label: "Draft", count: counts.draft },
    { id: "archived", label: "Archived", count: counts.archived },
  ];

  const inTab = INTERVIEW_PLANS.filter((p) => p.status === tab);
  const plans = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inTab;
    return inTab.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.jobProfile.toLowerCase().includes(q) ||
        FAMILY_LABELS[p.family].toLowerCase().includes(q),
    );
  }, [inTab, search]);

  // Plan create + open are net-new flows out of scope here — logged, not
  // wired, so the page stays interactive without inventing the plan editor.
  const onOpenPlan = (id) => console.log("AI Recruiter — open interview plan", id);
  const onCreatePlan = () => console.log("AI Recruiter — create interview plan");

  return (
    <div style={s.column}>
      <PageHeader
        identifier={{
          icon: <FaceScanIcon size={18} color="var(--color-icon-tertiary-fg)" />,
          label: pageName || "Interview Plans",
          iconBg: "var(--color-icon-tertiary-bg)",
          iconColor: "var(--color-icon-tertiary-fg)",
        }}
        primaryAction={{ label: "New plan", icon: <Plus size={16} />, onClick: onCreatePlan }}
        search={{ value: search, onChange: setSearch, placeholder: "Search interview plans" }}
        toolbar={[{ id: "filters", icon: <SlidersHorizontal size={18} />, label: "Filters", onClick: () => {} }]}
      />

      <Banner
        tone="info"
        heading="What an Interview Plan is"
        body="A plan is the Job Profile plus the knowledge topics the AI Interviewer screens a candidate's coverage against — the definition layer above the candidate pipeline. It measures coverage, never a pass bar."
      />

      <TabsRow tabs={TABS} activeTab={tab} onTabClick={setTab} />

      {plans.length === 0 ? (
        <EmptyState query={search} tab={TABS.find((t) => t.id === tab)?.label} onCreatePlan={onCreatePlan} />
      ) : (
        <div style={s.grid}>
          {plans.map((p) => (
            <PlanCard key={p.id} plan={p} onClick={() => onOpenPlan(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan, onClick }) {
  const [hover, setHover] = React.useState(false);
  const tint = FAMILY_TINTS[plan.family] || FAMILY_TINTS.support;
  const st = PLAN_STATUS[plan.status] || PLAN_STATUS.draft;
  return (
    <button
      type="button"
      className="recruiter-focusable"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`${plan.name} — open interview plan`}
      style={{ ...s.card, boxShadow: hover ? "var(--shadow-4)" : "var(--shadow-card)", transform: hover ? "translateY(-1px)" : "none" }}
    >
      <div style={s.cardTop}>
        <span style={{ ...s.familyChip, background: tint.bg, color: tint.fg }}>{FAMILY_LABELS[plan.family]}</span>
        <span style={{ ...s.statusPill, background: st.bg, color: st.fg }}>
          <span style={{ ...s.statusDot, background: st.dot }} aria-hidden="true" />
          {st.label}
        </span>
        <ChevronRight size={20} color="var(--color-text-tertiary)" style={{ marginLeft: "auto", opacity: hover ? 1 : 0.75, transition: "opacity 150ms ease" }} aria-hidden="true" />
      </div>

      <div style={s.cardBody}>
        <span style={s.title}>{plan.name}</span>
        <span style={s.subline}>{plan.jobProfile}</span>
      </div>

      <div style={s.topicRow}>
        {plan.topics.slice(0, 3).map((t) => (
          <span key={t} style={s.topicChip}>{t}</span>
        ))}
        {plan.topicsTotal > 3 && <span style={s.topicMore}>+{plan.topicsTotal - 3} more</span>}
      </div>

      <div style={s.cardFooter}>
        <span style={s.footMeta}>
          <span style={s.footNum}>{plan.topicsTotal}</span> topics
          <span style={s.footDim}> · {plan.screened} screened</span>
        </span>
        <span style={s.modeTag}>
          {plan.assisted
            ? <Sparkles size={13} color="var(--color-icon-tertiary-fg)" aria-hidden="true" />
            : <User size={13} color="var(--color-text-tertiary)" aria-hidden="true" />}
          {plan.mode}
        </span>
      </div>

      {plan.lastRun && <span style={s.lastRun}>Last screening {formatDate(plan.lastRun)}</span>}
    </button>
  );
}

function EmptyState({ query, tab, onCreatePlan }) {
  return (
    <Card padX={32} padY={40} style={s.empty}>
      <span style={s.emptyIcon} aria-hidden="true">
        <FaceScanIcon size={26} color="var(--color-icon-tertiary-fg)" />
      </span>
      <span style={s.emptyHeading}>{query ? "No plans match your search" : `No ${tab?.toLowerCase()} interview plans`}</span>
      <span style={s.emptyBody}>
        {query ? "Try a different keyword or clear the search." : "Create an interview plan to start screening candidates for a role."}
      </span>
      {!query && (
        <button type="button" className="recruiter-focusable" onClick={onCreatePlan} style={s.emptyCta}>
          <Plus size={16} /> New interview plan
        </button>
      )}
    </Card>
  );
}

const s = {
  column: { display: "flex", flexDirection: "column", gap: 20, width: "100%", fontFamily: "var(--font-sans)" },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 },

  card: {
    position: "relative", display: "flex", flexDirection: "column", gap: 14, width: "100%",
    minHeight: 220, padding: 24, textAlign: "left", background: "var(--surface-white)",
    border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "var(--font-sans)",
    boxSizing: "border-box", transition: "transform 150ms ease, box-shadow 150ms ease",
  },
  cardTop: { display: "flex", alignItems: "center", gap: 8 },
  familyChip: { display: "inline-flex", alignItems: "center", height: 22, padding: "0 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.2px", whiteSpace: "nowrap" },
  statusPill: { display: "inline-flex", alignItems: "center", gap: 6, height: 22, padding: "0 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" },
  statusDot: { width: 6, height: 6, borderRadius: 999, flexShrink: 0 },

  cardBody: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 },
  title: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" },
  subline: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", lineHeight: 1.5 },

  topicRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  topicChip: { display: "inline-flex", alignItems: "center", height: 20, padding: "0 8px", borderRadius: 4, background: "var(--pill-bg)", color: "var(--color-text-medium)", fontSize: 11, fontWeight: 500, whiteSpace: "nowrap" },
  topicMore: { display: "inline-flex", alignItems: "center", height: 20, padding: "0 6px", borderRadius: 4, background: "var(--pill-bg)", color: "var(--color-text-tertiary)", fontSize: 11, fontWeight: 600 },

  cardFooter: { marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--color-divider-card)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" },
  footMeta: { fontSize: 13, fontWeight: 400, color: "var(--color-text-medium)" },
  footNum: { fontWeight: 700, color: "var(--color-text-deep)", fontVariantNumeric: "tabular-nums" },
  footDim: { color: "var(--color-text-tertiary)" },
  modeTag: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", whiteSpace: "nowrap" },
  lastRun: { fontSize: 11, fontWeight: 400, color: "var(--color-text-placeholder)" },

  empty: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" },
  emptyIcon: { width: 52, height: 52, borderRadius: 999, background: "var(--color-icon-tertiary-bg)", display: "inline-grid", placeItems: "center" },
  emptyHeading: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  emptyBody: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", maxWidth: 360, lineHeight: 1.5 },
  emptyCta: {
    marginTop: 4, display: "inline-flex", alignItems: "center", gap: 8, height: 40, paddingInline: 20,
    borderRadius: 999, border: "none", cursor: "pointer", background: "var(--color-button-primary-bg)",
    color: "var(--color-button-primary-fg)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.06em",
  },
};
