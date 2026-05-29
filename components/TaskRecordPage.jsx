"use client";

import React from "react";
import {
  ArrowLeft,
  FileText,
  Crosshair,
  UserSearch,
  Flame,
  TrendingDown,
  CheckCircle2,
  GitMerge,
  ListChecks,
  List,
  Database,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Phone,
  MessageSquare,
  Mail,
  Send,
  ChevronLeft,
  ChevronRight,
  Quote,
} from "lucide-react";
import Card from "./Card";
import {
  TASK_PLAYBOOK,
  SENTIMENT_TONE,
  CHALLENGE_TONE,
  adherenceTone,
} from "./mocks/taskPlaybook";

// TaskRecordPage — long-form playbook artifact behind a task. Sticky
// left TOC drives smooth-scroll anchors into the right column of
// content cards. Borrowed chrome: PageHeader-style bar, tag chips,
// avatar, accordion rows, standard table — no new visual language.
//
// Layout (spec §A3):
//   Top page bar          — back · ID · title · separator dot · author · timestamp · status tag
//   2-col body            — sticky TOC (~243px) + content stack
//
// Sections render in TOC order. Three (Verification Checklist · Key
// Terminologies · Learning) are empty placeholders per spec §A8 #4
// default — render the card frame with a "No items yet" muted line.

const TOC_ITEMS = [
  { id: "overview",      label: "Overview",               Icon: FileText },
  { id: "approach",      label: "The Approach",           Icon: Crosshair },
  { id: "questions",     label: "Customer Questions",     Icon: UserSearch },
  { id: "challenges",    label: "Challenges",             Icon: Flame },
  { id: "pitfalls",      label: "Pitfalls",               Icon: TrendingDown },
  { id: "why-works",     label: "Why It Works",           Icon: CheckCircle2 },
  { id: "competitor",    label: "Competitor Context",     Icon: GitMerge },
  { id: "verification",  label: "Verification Checklist", Icon: ListChecks },
  { id: "terminology",   label: "Key Terminologies",      Icon: List },
  { id: "sources",       label: "Sources",                Icon: Database },
  { id: "learning",      label: "Learning",               Icon: MoreHorizontal },
];

export default function TaskRecordPage({ taskId, onBack }) {
  const playbook = TASK_PLAYBOOK;

  // Smooth-scroll TOC handler. Section anchors come straight from the
  // TOC item id so URL hash + scroll target stay in sync. No scrollspy
  // (spec §A8 #1 default) — TOC items only carry hover state.
  const handleTocClick = (id) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(`section-${id}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    try { history.replaceState(null, "", `#${id}`); } catch { /* read-only */ }
  };

  return (
    <div style={styles.column}>
      <Header playbook={playbook} onBack={onBack} taskId={taskId} />

      <div style={styles.body}>
        <TocColumn onItemClick={handleTocClick} />

        <main style={styles.content}>
          <OverviewSection data={playbook.overview} />
          <ApproachSection data={playbook.approach} />
          <CustomerQuestionsSection items={playbook.customerQuestions} />
          <ChallengesSection items={playbook.challenges} />
          <PitfallsSection items={playbook.pitfalls} />
          <WhyItWorksSection body={playbook.whyItWorks} />
          <CompetitorContextSection data={playbook.competitorContext} />
          <EmptySection id="verification" title="Verification Checklist" Icon={ListChecks} />
          <EmptySection id="terminology"  title="Key Terminologies"      Icon={List} />
          <SourcesSection items={playbook.sources} total={playbook.totalSources} pages={playbook.pagesTotal} />
          <EmptySection id="learning"     title="Learning"               Icon={MoreHorizontal} />
        </main>
      </div>
    </div>
  );
}

// ---- Header ------------------------------------------------------------

function Header({ playbook, onBack, taskId }) {
  return (
    <Card padX={0} padY={0} style={styles.headerCard}>
      <div style={styles.headerInner}>
        <button type="button" onClick={onBack} aria-label="Back to Tasks" style={styles.backBtn}>
          <ArrowLeft size={20} color="var(--color-text-medium)" />
        </button>

        <div style={styles.headerMeta}>
          <span style={styles.taskId}>{taskId || playbook.id}</span>
          <Dot />
          <span style={styles.taskTitle}>{playbook.title}</span>
          <Dot />
          <span style={styles.createdByLabel}>Created By:</span>
          <span style={styles.authorAvatar} aria-hidden="true">{playbook.author.initial}</span>
          <span style={styles.authorName}>{playbook.author.name}</span>
          <Dot />
          <span style={styles.timestamp}>{playbook.timestamp}</span>
        </div>

        <span style={styles.statusTag}>{playbook.tag}</span>
      </div>
    </Card>
  );
}

function Dot() {
  return <span style={styles.headerDot} aria-hidden="true" />;
}

// ---- TOC ---------------------------------------------------------------

function TocColumn({ onItemClick }) {
  return (
    <aside style={styles.tocWrap}>
      <nav style={styles.tocInner} aria-label="Sections">
        {TOC_ITEMS.map((item) => (
          <TocItem key={item.id} item={item} onClick={() => onItemClick(item.id)} />
        ))}
      </nav>
    </aside>
  );
}

function TocItem({ item, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...styles.tocBtn,
        background: hover ? "var(--color-card-emoji-bg)" : "transparent",
      }}
    >
      <item.Icon size={16} color="var(--color-text-tertiary)" />
      <span style={styles.tocLabel}>{item.label}</span>
    </button>
  );
}

// ---- Section frame ----------------------------------------------------

function Section({ id, title, Icon, children }) {
  // Card primitive doesn't forward `id` (it's a layout primitive, not
  // pass-through). Wrap in an anchor div so smooth-scroll lands here.
  return (
    <div id={`section-${id}`} style={{ scrollMarginTop: 16 }}>
      <Card padX={0} padY={0} style={styles.sectionCard}>
        {title && (
          <header style={styles.sectionHead}>
            <span style={styles.sectionHeadLeft}>
              {Icon && <Icon size={16} color="var(--color-text-tertiary)" />}
              <h2 style={styles.sectionTitle}>{title}</h2>
            </span>
          </header>
        )}
        <div style={styles.sectionBody}>{children}</div>
      </Card>
    </div>
  );
}

// ---- 1. Overview -------------------------------------------------------

function OverviewSection({ data }) {
  return (
    <div id="section-overview" style={{ scrollMarginTop: 16 }}>
      <Card padX={0} padY={0} style={styles.sectionCard}>
        <div style={styles.overviewBody}>
        <h1 style={styles.overviewHeadline}>{data.headline}</h1>
        <p style={styles.overviewSummary}>{data.body}</p>

        <div style={styles.chipRow}>
          {data.chips.map((c) => (
            <span key={c} style={styles.chipNeutral}>{c}</span>
          ))}
        </div>

        <div style={styles.overviewSplit}>
          <div style={styles.overviewHalf}>
            <span style={styles.subLabel}>When to use this Playbook</span>
            <p style={styles.overviewPara}>{data.whenToUse}</p>
          </div>
          <div style={{ ...styles.overviewHalf, ...styles.overviewHalfRight }}>
            <span style={styles.subLabel}>Customer Profile</span>
            <p style={styles.overviewPara}>{data.customerProfile}</p>
            <p style={styles.keyPattern}><strong>Key Pattern:</strong> {data.keyPattern}</p>
          </div>
        </div>

        <div style={styles.emotionalBlock}>
          <span style={styles.subLabelLavender}>EMOTIONAL CONTEXT</span>
          <p style={styles.overviewPara}>{data.emotionalContext}</p>
        </div>
      </div>
      </Card>
    </div>
  );
}

// ---- 2. The Approach --------------------------------------------------

function ApproachSection({ data }) {
  const [openId, setOpenId] = React.useState(data.steps[0]?.id || null);
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <Section id="approach" title="The Approach" Icon={Crosshair}>
      <p style={styles.sectionIntro}>{data.intro}</p>
      <div style={styles.accordionList}>
        {data.steps.map((step) => (
          <AccordionRow
            key={step.id}
            open={openId === step.id}
            onToggle={() => toggle(step.id)}
            head={<span style={styles.accordionTitle}>{step.title}</span>}
          >
            <p style={styles.accordionBody}>{step.body}</p>
            {(step.label || step.example) && (
              <div style={styles.exampleBlock}>
                {step.label && <span style={styles.exampleLabel}>{step.label}</span>}
                {step.example && <p style={styles.exampleQuote}>{step.example}</p>}
              </div>
            )}
          </AccordionRow>
        ))}
      </div>
    </Section>
  );
}

// ---- 3. Common Customer Questions -------------------------------------

function CustomerQuestionsSection({ items }) {
  const [openId, setOpenId] = React.useState(items[0]?.id || null);
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <Section id="questions" title="Common Customer Questions" Icon={UserSearch}>
      <div style={styles.accordionList}>
        {items.map((q) => (
          <AccordionRow
            key={q.id}
            open={openId === q.id}
            onToggle={() => toggle(q.id)}
            head={(
              <>
                <span style={styles.accordionTitle}>{q.question}</span>
                <span style={styles.stepChip}>Step {q.step}</span>
              </>
            )}
          >
            <p style={styles.accordionBody}>{q.answer}</p>
          </AccordionRow>
        ))}
      </div>
    </Section>
  );
}

// ---- 4. Common Challenges ---------------------------------------------

function ChallengesSection({ items }) {
  const [openId, setOpenId] = React.useState(items[0]?.id || null);
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <Section id="challenges" title="Common Challenges" Icon={Flame}>
      <div style={styles.accordionList}>
        {items.map((c) => {
          const tone = CHALLENGE_TONE[c.tag.tone] || CHALLENGE_TONE.info;
          return (
            <AccordionRow
              key={c.id}
              open={openId === c.id}
              onToggle={() => toggle(c.id)}
              head={(
                <>
                  <span style={styles.accordionTitle}>{c.title}</span>
                  <span style={{ ...styles.tagChip, background: tone.bg, color: tone.fg }}>
                    {c.tag.label}
                  </span>
                </>
              )}
            >
              <p style={styles.accordionBody}>{c.answer}</p>
            </AccordionRow>
          );
        })}
      </div>
    </Section>
  );
}

// ---- 5. Common Pitfalls -----------------------------------------------

function PitfallsSection({ items }) {
  return (
    <Section id="pitfalls" title="Common Pitfalls" Icon={TrendingDown}>
      <div style={styles.pitfallList}>
        {items.map((p) => (
          <div key={p.id} style={styles.pitfallRow}>
            <span style={styles.pitfallLabel}>{p.label}</span>
            <p style={styles.pitfallBody}>{p.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ---- 6. Why It Works --------------------------------------------------

function WhyItWorksSection({ body }) {
  return (
    <Section id="why-works" title="Why This Approach Works" Icon={CheckCircle2}>
      <div style={styles.whyWorksBlock}>
        <p style={styles.whyWorksBody}>{body}</p>
      </div>
    </Section>
  );
}

// ---- 7. Competitor Context --------------------------------------------

function CompetitorContextSection({ data }) {
  const [openId, setOpenId] = React.useState(data.competitors[0]?.id || null);
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <Section id="competitor" title="Competitor Context" Icon={GitMerge}>
      <p style={styles.sectionIntro}>{data.intro}</p>
      <div style={styles.accordionList}>
        {data.competitors.map((c) => (
          <AccordionRow
            key={c.id}
            open={openId === c.id}
            onToggle={() => toggle(c.id)}
            head={<span style={styles.accordionTitle}>{c.name}</span>}
          >
            <p style={styles.accordionBody}>
              <span style={styles.competitorMeta}>Mention context: {c.mention}</span>
            </p>
            <div style={styles.competitorGuidance}>
              <p style={styles.competitorGuidanceText}>{c.guidance}</p>
            </div>
          </AccordionRow>
        ))}
      </div>
    </Section>
  );
}

// ---- 8/10. Source Evidence --------------------------------------------

const CHANNEL_ICON = {
  voice:    Phone,
  chat:     MessageSquare,
  email:    Mail,
  whatsapp: Send,
};

function SourcesSection({ items, total, pages }) {
  const [page, setPage] = React.useState(1);

  return (
    <Section id="sources" title="Source Evidence" Icon={Quote}>
      <div style={styles.tableScroll}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, ...styles.thTopic }}>Interaction ID</th>
              <th style={styles.th}>Channel</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Agent</th>
              <th style={styles.th}>Sentiment</th>
              <th style={styles.th}>Adherence ↑</th>
              <th style={{ ...styles.th, width: 40 }} aria-label="Open" />
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => {
              const Channel = CHANNEL_ICON[row.channel] || Phone;
              const sentTone = SENTIMENT_TONE[row.sentiment] || SENTIMENT_TONE.neutral;
              return (
                <tr key={row.id} style={{ background: idx % 2 === 1 ? "#F9F9FF" : "#FFFFFF" }}>
                  <td style={{ ...styles.td, ...styles.tdTopic }}>{row.topic}</td>
                  <td style={styles.td}>
                    <Channel size={18} color="var(--color-text-tertiary)" />
                  </td>
                  <td style={styles.td}>{row.date}</td>
                  <td style={styles.td}>
                    <span style={styles.agentAvatar} aria-hidden="true">{row.agent}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.sentimentChip, background: sentTone.bg, color: sentTone.fg }}>
                      {row.sentiment.charAt(0).toUpperCase() + row.sentiment.slice(1)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.adherenceCell}>
                      <span style={{ ...styles.adherenceDot, background: adherenceTone(row.adherence) }} aria-hidden="true" />
                      <span style={styles.adherenceValue}>{row.adherence}%</span>
                    </span>
                  </td>
                  <td style={{ ...styles.td, width: 40, paddingInline: 8 }}>
                    <button
                      type="button"
                      aria-label={`Open ${row.topic}`}
                      onClick={() => {
                        // TODO: open interaction detail in new tab.
                        // eslint-disable-next-line no-console
                        console.log("open interaction", row.id);
                      }}
                      style={styles.openBtn}
                    >
                      <ExternalLink size={16} color="var(--color-text-tertiary)" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={styles.tableFooter}>
        <span style={styles.tableTotal}>Total {total} Citations</span>
        <div style={styles.pagination}>
          <span style={styles.pageLabel}>Page {page} of {pages}</span>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={styles.pageBtn}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} color={page <= 1 ? "var(--color-text-placeholder)" : "var(--color-text-medium)"} />
          </button>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            style={styles.pageBtn}
            aria-label="Next page"
          >
            <ChevronRight size={16} color={page >= pages ? "var(--color-text-placeholder)" : "var(--color-text-medium)"} />
          </button>
        </div>
      </div>
    </Section>
  );
}

// ---- 9/11. Empty placeholder section ----------------------------------

function EmptySection({ id, title, Icon }) {
  return (
    <Section id={id} title={title} Icon={Icon}>
      <p style={styles.emptyLine}>No items yet</p>
    </Section>
  );
}

// ---- Accordion row ----------------------------------------------------

function AccordionRow({ open, onToggle, head, children }) {
  return (
    <div style={{ ...styles.accRow, background: open ? "#FAFAFA" : "#FFFFFF" }}>
      <button type="button" onClick={onToggle} style={styles.accHead}>
        <span style={styles.accHeadLeft}>{head}</span>
        {open
          ? <ChevronUp size={20} color="var(--color-text-tertiary)" />
          : <ChevronDown size={20} color="var(--color-text-tertiary)" />
        }
      </button>
      {open && <div style={styles.accBody}>{children}</div>}
    </div>
  );
}

// ---- Styles ------------------------------------------------------------

const styles = {
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    width: "100%",
    fontFamily: "var(--font-sans)",
  },

  // Header
  headerCard: {
    boxShadow: "0 2px 4px rgba(69, 70, 79, 0.15)",
  },
  headerInner: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 8, padding: "8px 24px",
    minHeight: 56,
  },
  backBtn: {
    width: 32, height: 32, borderRadius: 6,
    border: "none", background: "transparent", cursor: "pointer",
    display: "inline-grid", placeItems: "center",
    flexShrink: 0,
    padding: 0,
  },
  headerMeta: {
    flex: 1, minWidth: 0,
    display: "inline-flex", alignItems: "center", gap: 12, flexWrap: "wrap",
  },
  taskId: {
    fontSize: 16, fontWeight: 600, color: "var(--color-text-medium)",
    fontFamily: '"JetBrains Mono", monospace',
  },
  taskTitle: { fontSize: 14, fontWeight: 400, color: "var(--color-text-medium)", letterSpacing: "0.17px" },
  createdByLabel: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)" },
  authorAvatar: {
    width: 20, height: 20, borderRadius: 999,
    background: "#DDE1FF", color: "var(--color-icon-tertiary-fg)",
    display: "inline-grid", placeItems: "center",
    fontSize: 10, fontWeight: 700, letterSpacing: "0.15px",
  },
  authorName: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)" },
  timestamp: { fontSize: 12, fontWeight: 400, color: "var(--color-text-tertiary)" },
  headerDot: {
    width: 3, height: 3, borderRadius: 999,
    background: "#A7AAC1",
    flexShrink: 0,
  },
  statusTag: {
    display: "inline-flex", alignItems: "center",
    padding: "4px 10px",
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    borderRadius: 999,
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12, fontWeight: 700, letterSpacing: "0.1px",
    flexShrink: 0,
  },

  // Body
  body: {
    display: "flex", alignItems: "flex-start", gap: 24,
    width: "100%",
  },

  // TOC
  tocWrap: {
    width: 243,
    flexShrink: 0,
    position: "sticky",
    top: 16,
    alignSelf: "flex-start",
  },
  tocInner: {
    display: "flex", flexDirection: "column",
    padding: 16,
    background: "#FFFFFF",
    borderRadius: 12,
    boxShadow: "var(--shadow-card)",
  },
  tocBtn: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "16px",
    width: "100%",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "left",
    transition: "background 120ms ease",
  },
  tocLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, letterSpacing: "0.25px",
    color: "var(--color-text-medium)",
  },

  // Content
  content: {
    flex: 1, minWidth: 0,
    display: "flex", flexDirection: "column", gap: 16,
  },

  // Section card
  sectionCard: { boxShadow: "var(--shadow-card)" },
  sectionHead: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 8, padding: "16px 24px",
    borderBottom: "1px solid var(--color-border-card-soft)",
  },
  sectionHeadLeft: { display: "inline-flex", alignItems: "center", gap: 8 },
  sectionTitle: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 16, fontWeight: 600, letterSpacing: "0.25px", lineHeight: "22px",
    color: "var(--color-text-medium)",
  },
  sectionBody: { padding: 24, display: "flex", flexDirection: "column", gap: 24 },
  sectionIntro: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, letterSpacing: "0.17px", lineHeight: "22px",
    color: "var(--color-text-medium)",
  },
  emptyLine: {
    margin: 0,
    fontSize: 13, color: "var(--color-text-tertiary)", fontStyle: "italic",
  },

  // Overview
  overviewBody: {
    padding: 24,
    display: "flex", flexDirection: "column", gap: 16,
  },
  overviewHeadline: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 24, fontWeight: 600, lineHeight: "34px", letterSpacing: "0.17px",
    color: "var(--color-text-tertiary)",
  },
  overviewSummary: {
    margin: 0,
    fontSize: 14, fontWeight: 400, letterSpacing: "0.17px", lineHeight: "22px",
    color: "var(--color-text-medium)",
  },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 8 },
  chipNeutral: {
    display: "inline-flex", alignItems: "center",
    padding: "4px 12px",
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-text-medium)",
    borderRadius: 4,
    fontSize: 12, fontWeight: 400, letterSpacing: "0.4px",
  },
  overviewSplit: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    paddingTop: 24,
    borderTop: "1px solid var(--color-border-card-soft)",
  },
  overviewHalf: {
    paddingInline: "0 16px",
    display: "flex", flexDirection: "column", gap: 8,
  },
  overviewHalfRight: {
    paddingInline: "16px 0",
    borderLeft: "1px solid var(--color-border-card-soft)",
  },
  subLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 14, fontWeight: 500, lineHeight: "22px", letterSpacing: "0.1px",
    color: "var(--color-text-tertiary)",
  },
  subLabelLavender: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, fontWeight: 500, lineHeight: "17px", letterSpacing: "0.1px",
    color: "var(--color-icon-tertiary-fg)",
    textTransform: "uppercase",
  },
  overviewPara: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, letterSpacing: "0.17px", lineHeight: "22px",
    color: "var(--color-text-medium)",
  },
  keyPattern: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 12, fontWeight: 600, letterSpacing: "0.17px", lineHeight: "19px",
    color: "var(--color-text-tertiary)",
  },
  emotionalBlock: {
    background: "#FCFBFF",
    borderRadius: 12,
    padding: 24,
    display: "flex", flexDirection: "column", gap: 8,
  },

  // Accordion
  accordionList: { display: "flex", flexDirection: "column", gap: 16 },
  accRow: {
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    overflow: "hidden",
    transition: "background 120ms ease",
  },
  accHead: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", gap: 16,
    padding: "12px 24px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    textAlign: "left",
  },
  accHeadLeft: {
    flex: 1, minWidth: 0,
    display: "inline-flex", alignItems: "center", gap: 16, justifyContent: "space-between",
  },
  accordionTitle: {
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 500, letterSpacing: "0.1px", lineHeight: "22px",
    color: "var(--color-text-medium)",
  },
  stepChip: {
    fontFamily: "var(--font-sans)",
    fontSize: 12, fontWeight: 400, letterSpacing: "0.1px",
    color: "var(--color-text-tertiary)",
    flexShrink: 0,
  },
  tagChip: {
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px",
    borderRadius: 4,
    fontFamily: "var(--font-sans)",
    fontSize: 12, fontWeight: 400, letterSpacing: "0.4px",
    flexShrink: 0,
  },
  accBody: {
    padding: "0 24px 24px",
    display: "flex", flexDirection: "column", gap: 12,
  },
  accordionBody: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, letterSpacing: "0.17px", lineHeight: "22px",
    color: "var(--color-text-tertiary)",
  },

  // Example block under approach step
  exampleBlock: {
    paddingLeft: 16,
    borderLeft: "1px solid var(--color-icon-tertiary-fg)",
    display: "flex", flexDirection: "column", gap: 8,
  },
  exampleLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, fontWeight: 500, letterSpacing: "0.1px",
    color: "var(--color-icon-tertiary-fg)",
    textTransform: "uppercase",
  },
  exampleQuote: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, letterSpacing: "0.17px", lineHeight: "22px",
    color: "var(--color-text-tertiary)",
  },

  // Competitor body
  competitorMeta: {
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, letterSpacing: "0.17px",
    color: "var(--color-text-tertiary)",
  },
  competitorGuidance: {
    paddingLeft: 16,
    borderLeft: "1px solid var(--color-success)",
  },
  competitorGuidanceText: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontStyle: "italic", fontWeight: 500, letterSpacing: "0.17px", lineHeight: "22px",
    color: "var(--color-text-tertiary)",
  },

  // Pitfalls
  pitfallList: { display: "flex", flexDirection: "column", gap: 16 },
  pitfallRow: {
    paddingLeft: 16,
    borderLeft: "1px solid var(--color-error)",
    display: "flex", flexDirection: "column", gap: 8,
  },
  pitfallLabel: {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 11, fontWeight: 500, lineHeight: "17px",
    color: "var(--color-error)",
    textTransform: "uppercase",
  },
  pitfallBody: {
    margin: 0,
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 500, letterSpacing: "0.17px", lineHeight: "22px",
    color: "var(--color-text-tertiary)",
  },

  // Why it works
  whyWorksBlock: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(104deg, rgba(36, 91, 255, 0.08) 30%, rgba(198, 25, 92, 0.08) 100%)",
    borderRadius: 12,
    padding: 24,
  },
  whyWorksBody: {
    margin: 0,
    position: "relative",
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, letterSpacing: "0.17px", lineHeight: "22px",
    color: "var(--color-text-medium)",
  },

  // Source Evidence table
  tableScroll: { width: "100%", overflowX: "auto", margin: "-24px -24px 0", padding: "0 24px" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#FFFFFF",
  },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    background: "#FCFBFF",
    fontFamily: "var(--font-sans)",
    fontSize: 12, fontWeight: 600, lineHeight: "20px", letterSpacing: "0.4px",
    color: "var(--color-text-tertiary)",
  },
  thTopic: { paddingLeft: 24 },
  td: {
    padding: "16px 12px",
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, letterSpacing: "0.17px",
    color: "var(--color-text-medium)",
    verticalAlign: "middle",
  },
  tdTopic: {
    paddingLeft: 24,
    fontWeight: 500, letterSpacing: "0.1px",
  },
  agentAvatar: {
    display: "inline-grid", placeItems: "center",
    width: 24, height: 24, borderRadius: 999,
    background: "#DDE1FF",
    fontFamily: "var(--font-sans)",
    fontSize: 11, fontWeight: 700, letterSpacing: "0.5px",
    color: "var(--color-icon-tertiary-fg)",
  },
  sentimentChip: {
    display: "inline-flex", alignItems: "center",
    padding: "3px 12px",
    borderRadius: 4,
    fontFamily: "var(--font-sans)",
    fontSize: 12, fontWeight: 400, lineHeight: "18px", letterSpacing: "0.4px",
  },
  adherenceCell: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "2px 8px",
    background: "#F8FAFC",
    borderRadius: 4,
  },
  adherenceDot: {
    width: 8, height: 8, borderRadius: 999,
  },
  adherenceValue: {
    fontFamily: "var(--font-sans)",
    fontSize: 12, fontWeight: 600, letterSpacing: "0.5px",
    color: "#424659",
  },
  openBtn: {
    width: 24, height: 24, borderRadius: 4,
    border: "none", background: "transparent", cursor: "pointer",
    display: "inline-grid", placeItems: "center",
    padding: 0,
  },

  // Pagination
  tableFooter: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    borderTop: "1px solid var(--color-border-card-soft)",
    margin: "16px -24px -24px",
    padding: "16px 24px",
  },
  tableTotal: {
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, lineHeight: "22px", letterSpacing: "0.25px",
    color: "var(--color-text-tertiary)",
  },
  pagination: {
    display: "inline-flex", alignItems: "center", gap: 12,
  },
  pageLabel: {
    fontFamily: "var(--font-sans)",
    fontSize: 14, fontWeight: 400, letterSpacing: "0.25px",
    color: "var(--color-text-tertiary)",
  },
  pageBtn: {
    width: 24, height: 24, borderRadius: 4,
    border: "none", background: "transparent", cursor: "pointer",
    display: "inline-grid", placeItems: "center",
    padding: 0,
  },
};
