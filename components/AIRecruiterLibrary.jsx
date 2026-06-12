"use client";

import React from "react";
import { Plus, SlidersHorizontal, ChevronRight } from "lucide-react";
import PageHeader from "./PageHeader";
import TabsRow from "./TabsRow";
import Card from "./Card";
import Banner from "./Banner";
import { FaceScanIcon } from "./SideNav/icons";
import {
  INTERVIEW_PLANS, FAMILY_LABELS, planCounts,
} from "./mocks/recruiter";
import {
  FamilyAvatar, StatusChip, CoverageMeter, ModeTag, MaintainedTag,
  RecordedTag, COMPLIANCE_COPY,
} from "./AIRecruiterParts";

// AIRecruiterLibrary (Variant A · direction D1) — the interview-plan
// library as an editorial 3-up card grid, reusing the Replay/Skills card
// pattern. Optimised for scanning "which plans do I have and how are they
// doing"; the coverage meter answers "how far has each one got" without
// implying a score. Avatar colour is tied to the job family.

// Deterministic creator monogram colour — pulls from the :root categorical
// chart palette (the system's sanctioned set for "one colour per item"),
// never a forked hex list, so the avatar stays inside the token system (G1).
const MONOGRAM_TOKENS = [
  "var(--chart-blue)", "var(--chart-teal)", "var(--chart-orange)", "var(--chart-coral)",
  "var(--chart-lavender)", "var(--chart-sky)", "var(--chart-pink)", "var(--chart-green)",
];
function monogramColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = name.charCodeAt(i) + ((h << 5) - h);
  return MONOGRAM_TOKENS[Math.abs(h) % MONOGRAM_TOKENS.length];
}

export default function AIRecruiterLibrary({ onOpenPlan, onCreatePlan }) {
  const [tab, setTab] = React.useState("live");
  const [search, setSearch] = React.useState("");

  const counts = planCounts(INTERVIEW_PLANS);
  const TABS = [
    { id: "live", label: "Live", count: counts.live },
    { id: "draft", label: "Draft", count: counts.draft },
    { id: "archived", label: "Archived", count: counts.archived },
  ];

  const inTab = INTERVIEW_PLANS.filter((p) => p.status === tab);
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inTab;
    return inTab.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.jobProfile.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q),
    );
  }, [inTab, search]);

  return (
    <div style={s.column}>
      <PageHeader
        identifier={{
          icon: <FaceScanIcon size={18} color="var(--color-icon-tertiary-fg)" />,
          label: "AI Recruiter",
          iconBg: "var(--color-icon-tertiary-bg)",
          iconColor: "var(--color-icon-tertiary-fg)",
        }}
        primaryAction={{ label: "Interview plan", icon: <Plus size={16} />, onClick: onCreatePlan }}
        search={{ value: search, onChange: setSearch, placeholder: "Search interview plans" }}
        toolbar={[{ id: "filters", icon: <SlidersHorizontal size={18} />, label: "Filters", onClick: () => {} }]}
      />

      <Banner tone="info" heading={COMPLIANCE_COPY.heading} body={COMPLIANCE_COPY.body} />

      <TabsRow tabs={TABS} activeTab={tab} onTabClick={setTab} />

      {filtered.length === 0 ? (
        <EmptyState query={search} tab={TABS.find((t) => t.id === tab)?.label} onCreatePlan={onCreatePlan} />
      ) : (
        <div style={s.grid}>
          {filtered.map((p) => (
            <PlanCard key={p.id} plan={p} onClick={() => onOpenPlan?.(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      className="recruiter-focusable"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`${plan.name} — open interview plan`}
      style={{
        ...s.card,
        boxShadow: hover ? "var(--shadow-4)" : "var(--shadow-card)",
        transform: hover ? "translateY(-1px)" : "none",
      }}
    >
      <div style={s.cardTop}>
        <FamilyAvatar family={plan.family} size={40} />
        <span style={s.familyLabel}>{FAMILY_LABELS[plan.family]}</span>
        <ChevronRight
          size={20}
          color="var(--color-text-tertiary)"
          style={{ marginLeft: "auto", opacity: hover ? 1 : 0.75, transition: "opacity 150ms ease" }}
          aria-hidden="true"
        />
      </div>

      <div style={s.cardBody}>
        <span style={s.title}>{plan.name}</span>
        <span style={s.subline}>{plan.jobProfile} · {plan.domain}</span>
        <ModeTag mode={plan.mode} assisted={plan.assisted} />
      </div>

      <div style={s.cardMeter}>
        <CoverageMeter coverage={plan.coverage} compact />
      </div>

      <div style={s.cardFooter}>
        <div style={s.footerLeft}>
          <StatusChip status={plan.status} />
          <RecordedTag />
        </div>
        <div style={s.footerRight}>
          <MaintainedTag maintainedBy={plan.maintainedBy} />
          <span
            style={{ ...s.monogram, background: monogramColor(plan.createdBy.name) }}
            title={`Created by ${plan.createdBy.name}`}
            aria-hidden="true"
          >
            {plan.createdBy.initial}
          </span>
        </div>
      </div>
    </button>
  );
}

function EmptyState({ query, tab, onCreatePlan }) {
  const heading = query ? "No plans match your search" : `No ${tab?.toLowerCase()} interview plans`;
  const body = query
    ? "Try a different keyword or clear the search."
    : "Create an interview plan to start collecting candidate interviews here.";
  return (
    <Card padX={32} padY={40} style={s.empty}>
      <span style={s.emptyIcon} aria-hidden="true">
        <FaceScanIcon size={26} color="var(--color-icon-tertiary-fg)" />
      </span>
      <span style={s.emptyHeading}>{heading}</span>
      <span style={s.emptyBody}>{body}</span>
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
    position: "relative", display: "flex", flexDirection: "column", gap: 16,
    width: "100%", minHeight: 248, padding: 24, textAlign: "left",
    background: "var(--surface-white)", border: "none", borderRadius: 12,
    cursor: "pointer", fontFamily: "var(--font-sans)", boxSizing: "border-box",
    transition: "transform 150ms ease, box-shadow 150ms ease",
  },
  cardTop: { display: "flex", alignItems: "center", gap: 10 },
  familyLabel: {
    fontSize: 12, fontWeight: 700, letterSpacing: "0.3px",
    color: "var(--color-text-tertiary)", textTransform: "uppercase",
  },
  cardBody: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 },
  title: {
    fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)", lineHeight: 1.35,
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
  },
  subline: { fontSize: 12, fontWeight: 500, color: "var(--color-text-tertiary)", lineHeight: 1.5 },

  cardMeter: { marginTop: 2 },

  cardFooter: {
    marginTop: "auto", paddingTop: 16, borderTop: "1px solid var(--color-divider-card)",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap",
  },
  footerLeft: { display: "inline-flex", alignItems: "center", gap: 10 },
  footerRight: { display: "inline-flex", alignItems: "center", gap: 10 },
  monogram: {
    width: 26, height: 26, borderRadius: 999, display: "inline-grid", placeItems: "center",
    fontSize: 11, fontWeight: 700, color: "var(--surface-white)", flexShrink: 0,
  },

  empty: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" },
  emptyIcon: { width: 52, height: 52, borderRadius: 999, background: "var(--color-icon-tertiary-bg)", display: "inline-grid", placeItems: "center" },
  emptyHeading: { fontSize: 16, fontWeight: 700, color: "var(--color-text-deep)" },
  emptyBody: { fontSize: 13, fontWeight: 400, color: "var(--color-text-tertiary)", maxWidth: 360, lineHeight: 1.5 },
  emptyCta: {
    marginTop: 4, display: "inline-flex", alignItems: "center", gap: 8,
    height: 40, paddingInline: 20, borderRadius: 999, border: "none", cursor: "pointer",
    background: "var(--color-button-primary-bg)", color: "var(--color-button-primary-fg)",
    fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.06em",
  },
};
