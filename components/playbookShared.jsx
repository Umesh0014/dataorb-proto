"use client";

import React from "react";
import {
  Crosshair,
  UserSearch,
  Flame,
  TrendingDown,
  CheckCircle2,
  GitMerge,
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
  SENTIMENT_TONE,
  CHALLENGE_TONE,
  adherenceTone,
} from "./mocks/taskPlaybook";

// playbookShared — section primitives shared across PlaybookV1/V2/V3 (Playbook
// redesign · Notion ticket Playbook redesign).
//
// Each variant composes its own hero + overview block + source-evidence layout
// but reuses the seven body sections (Approach, Customer Questions, Challenges,
// Pitfalls, Why It Works, Competitor Context, Source Evidence table) verbatim so
// the redesigns differ in framing, not in content chrome.
//
// Verification Checklist, Key Terminologies, and Learning are intentionally
// absent — the ticket scopes them out.

// ---- Generic section frame ------------------------------------------------

export function Section({ id, title, Icon, children }) {
  return (
    <div id={`section-${id}`} style={{ scrollMarginTop: 16 }}>
      <Card padX={0} padY={0} style={sharedStyles.sectionCard}>
        {title && (
          <header style={sharedStyles.sectionHead}>
            <span style={sharedStyles.sectionHeadLeft}>
              {Icon && <Icon size={16} color="var(--color-text-tertiary)" />}
              <h2 style={sharedStyles.sectionTitle}>{title}</h2>
            </span>
          </header>
        )}
        <div style={sharedStyles.sectionBody}>{children}</div>
      </Card>
    </div>
  );
}

export function AccordionRow({ open, onToggle, head, children }) {
  return (
    <div style={{ ...sharedStyles.accRow, background: open ? "#FAFAFA" : "#FFFFFF" }}>
      <button type="button" onClick={onToggle} style={sharedStyles.accHead}>
        <span style={sharedStyles.accHeadLeft}>{head}</span>
        {open
          ? <ChevronUp size={20} color="var(--color-text-tertiary)" />
          : <ChevronDown size={20} color="var(--color-text-tertiary)" />
        }
      </button>
      {open && <div style={sharedStyles.accBody}>{children}</div>}
    </div>
  );
}

export function Dot() {
  return <span style={sharedStyles.headerDot} aria-hidden="true" />;
}

// ---- 2. Approach ----------------------------------------------------------

export function ApproachSection({ data }) {
  const [openId, setOpenId] = React.useState(data.steps[0]?.id || null);
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <Section id="approach" title="The Approach" Icon={Crosshair}>
      <p style={sharedStyles.sectionIntro}>{data.intro}</p>
      <div style={sharedStyles.accordionList}>
        {data.steps.map((step) => (
          <AccordionRow
            key={step.id}
            open={openId === step.id}
            onToggle={() => toggle(step.id)}
            head={<span style={sharedStyles.accordionTitle}>{step.title}</span>}
          >
            <p style={sharedStyles.accordionBody}>{step.body}</p>
            {(step.label || step.example) && (
              <div style={sharedStyles.exampleBlock}>
                {step.label && <span style={sharedStyles.exampleLabel}>{step.label}</span>}
                {step.example && <p style={sharedStyles.exampleQuote}>{step.example}</p>}
              </div>
            )}
          </AccordionRow>
        ))}
      </div>
    </Section>
  );
}

// ---- 3. Common Customer Questions -----------------------------------------

export function CustomerQuestionsSection({ items }) {
  const [openId, setOpenId] = React.useState(items[0]?.id || null);
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <Section id="questions" title="Common Customer Questions" Icon={UserSearch}>
      <div style={sharedStyles.accordionList}>
        {items.map((q) => (
          <AccordionRow
            key={q.id}
            open={openId === q.id}
            onToggle={() => toggle(q.id)}
            head={(
              <>
                <span style={sharedStyles.accordionTitle}>{q.question}</span>
                <span style={sharedStyles.stepChip}>Step {q.step}</span>
              </>
            )}
          >
            <p style={sharedStyles.accordionBody}>{q.answer}</p>
          </AccordionRow>
        ))}
      </div>
    </Section>
  );
}

// ---- 4. Common Challenges -------------------------------------------------

export function ChallengesSection({ items }) {
  const [openId, setOpenId] = React.useState(items[0]?.id || null);
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <Section id="challenges" title="Common Challenges" Icon={Flame}>
      <div style={sharedStyles.accordionList}>
        {items.map((c) => {
          const tone = CHALLENGE_TONE[c.tag.tone] || CHALLENGE_TONE.info;
          return (
            <AccordionRow
              key={c.id}
              open={openId === c.id}
              onToggle={() => toggle(c.id)}
              head={(
                <>
                  <span style={sharedStyles.accordionTitle}>{c.title}</span>
                  <span style={{ ...sharedStyles.tagChip, background: tone.bg, color: tone.fg }}>
                    {c.tag.label}
                  </span>
                </>
              )}
            >
              <p style={sharedStyles.accordionBody}>{c.answer}</p>
            </AccordionRow>
          );
        })}
      </div>
    </Section>
  );
}

// ---- 5. Common Pitfalls ---------------------------------------------------

export function PitfallsSection({ items }) {
  return (
    <Section id="pitfalls" title="Common Pitfalls" Icon={TrendingDown}>
      <div style={sharedStyles.pitfallList}>
        {items.map((p) => (
          <div key={p.id} style={sharedStyles.pitfallRow}>
            <span style={sharedStyles.pitfallLabel}>{p.label}</span>
            <p style={sharedStyles.pitfallBody}>{p.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ---- 6. Why It Works ------------------------------------------------------

export function WhyItWorksSection({ body }) {
  return (
    <Section id="why-works" title="Why This Approach Works" Icon={CheckCircle2}>
      <div style={sharedStyles.whyWorksBlock}>
        <p style={sharedStyles.whyWorksBody}>{body}</p>
      </div>
    </Section>
  );
}

// ---- 7. Competitor Context ------------------------------------------------

export function CompetitorContextSection({ data }) {
  const [openId, setOpenId] = React.useState(data.competitors[0]?.id || null);
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <Section id="competitor" title="Competitor Context" Icon={GitMerge}>
      <p style={sharedStyles.sectionIntro}>{data.intro}</p>
      <div style={sharedStyles.accordionList}>
        {data.competitors.map((c) => (
          <AccordionRow
            key={c.id}
            open={openId === c.id}
            onToggle={() => toggle(c.id)}
            head={<span style={sharedStyles.accordionTitle}>{c.name}</span>}
          >
            <p style={sharedStyles.accordionBody}>
              <span style={sharedStyles.competitorMeta}>Mention context: {c.mention}</span>
            </p>
            <div style={sharedStyles.competitorGuidance}>
              <p style={sharedStyles.competitorGuidanceText}>{c.guidance}</p>
            </div>
          </AccordionRow>
        ))}
      </div>
    </Section>
  );
}

// ---- 8. Source Evidence (the existing tabular drill-down) -----------------

const CHANNEL_ICON = {
  voice:    Phone,
  chat:     MessageSquare,
  email:    Mail,
  whatsapp: Send,
};

/**
 * SourcesSection — interactions table. `header` renders inside the section
 * card above the table; V1 uses it for the per-agent grid, V2/V3 omit it
 * (they place agent surfacing elsewhere on the page).
 */
export function SourcesSection({ items, total, pages, header }) {
  const [page, setPage] = React.useState(1);

  return (
    <Section id="sources" title="Source Evidence" Icon={Quote}>
      {header}
      <div style={sharedStyles.tableScroll}>
        <table style={sharedStyles.table}>
          <thead>
            <tr>
              <th style={{ ...sharedStyles.th, ...sharedStyles.thTopic }}>Interaction ID</th>
              <th style={sharedStyles.th}>Channel</th>
              <th style={sharedStyles.th}>Date</th>
              <th style={sharedStyles.th}>Agent</th>
              <th style={sharedStyles.th}>Sentiment</th>
              <th style={sharedStyles.th}>Adherence ↑</th>
              <th style={{ ...sharedStyles.th, width: 40 }} aria-label="Open" />
            </tr>
          </thead>
          <tbody>
            {items.map((row, idx) => {
              const Channel = CHANNEL_ICON[row.channel] || Phone;
              const sentTone = SENTIMENT_TONE[row.sentiment] || SENTIMENT_TONE.neutral;
              return (
                <tr key={row.id} style={{ background: idx % 2 === 1 ? "#F9F9FF" : "#FFFFFF" }}>
                  <td style={{ ...sharedStyles.td, ...sharedStyles.tdTopic }}>{row.topic}</td>
                  <td style={sharedStyles.td}>
                    <Channel size={18} color="var(--color-text-tertiary)" />
                  </td>
                  <td style={sharedStyles.td}>{row.date}</td>
                  <td style={sharedStyles.td}>
                    <span style={sharedStyles.agentAvatar} aria-hidden="true">{row.agent}</span>
                  </td>
                  <td style={sharedStyles.td}>
                    <span style={{ ...sharedStyles.sentimentChip, background: sentTone.bg, color: sentTone.fg }}>
                      {row.sentiment.charAt(0).toUpperCase() + row.sentiment.slice(1)}
                    </span>
                  </td>
                  <td style={sharedStyles.td}>
                    <span style={sharedStyles.adherenceCell}>
                      <span style={{ ...sharedStyles.adherenceDot, background: adherenceTone(row.adherence) }} aria-hidden="true" />
                      <span style={sharedStyles.adherenceValue}>{row.adherence}%</span>
                    </span>
                  </td>
                  <td style={{ ...sharedStyles.td, width: 40, paddingInline: 8 }}>
                    <button
                      type="button"
                      aria-label={`Open ${row.topic}`}
                      onClick={() => {
                        // eslint-disable-next-line no-console
                        console.log("open interaction", row.id);
                      }}
                      style={sharedStyles.openBtn}
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

      <div style={sharedStyles.tableFooter}>
        <span style={sharedStyles.tableTotal}>Total {total} Citations</span>
        <div style={sharedStyles.pagination}>
          <span style={sharedStyles.pageLabel}>Page {page} of {pages}</span>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={sharedStyles.pageBtn}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} color={page <= 1 ? "var(--color-text-placeholder)" : "var(--color-text-medium)"} />
          </button>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            style={sharedStyles.pageBtn}
            aria-label="Next page"
          >
            <ChevronRight size={16} color={page >= pages ? "var(--color-text-placeholder)" : "var(--color-text-medium)"} />
          </button>
        </div>
      </div>
    </Section>
  );
}

// ---- Shared styles --------------------------------------------------------

export const sharedStyles = {
  headerDot: {
    width: 3, height: 3, borderRadius: 999,
    background: "#A7AAC1",
    flexShrink: 0,
  },

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

  exampleBlock: {
    paddingLeft: 16,
    borderLeft: "1px solid var(--color-icon-tertiary-fg)",
    display: "flex", flexDirection: "column", gap: 8,
  },
  exampleLabel: {
    fontFamily: "var(--font-mono)",
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

  pitfallList: { display: "flex", flexDirection: "column", gap: 16 },
  pitfallRow: {
    paddingLeft: 16,
    borderLeft: "1px solid var(--color-error)",
    display: "flex", flexDirection: "column", gap: 8,
  },
  pitfallLabel: {
    fontFamily: "var(--font-mono)",
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
    color: "var(--color-text-medium)",
  },
  openBtn: {
    width: 24, height: 24, borderRadius: 4,
    border: "none", background: "transparent", cursor: "pointer",
    display: "inline-grid", placeItems: "center",
    padding: 0,
  },

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
