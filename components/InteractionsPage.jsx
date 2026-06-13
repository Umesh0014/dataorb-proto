"use client";

import React from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronUp,
  Phone,
  MessageCircle,
  MessageSquare,
  Mail,
  Settings,
  ClipboardList,
  Radar,
  Trophy,
  SlidersHorizontal,
  Heart,
  Key,
  Lightbulb,
  Unlock,
  Volume2,
  Quote,
  Search,
  X,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import LanguageSelect from "./LanguageSelect";
import { formatDateTime } from "./formatDate";
import { lhI, lhText, lhTotalInteractions, lhPageOf, lhDir } from "./learningHubLocale";

// col.key → INTERACTIONS string key (adherence column reads "Quality").
const COL_LABEL_KEY = {
  customerId: "col_customerId",
  channel:    "col_channel",
  date:       "col_date",
  agent:      "col_agent",
  duration:   "col_duration",
  sentiment:  "col_sentiment",
  adherence:  "col_quality",
  skills:     "col_skills",
};

// ⚠️ You said "don't rename" but the reference header reads "Quality".
// Default below follows the image. If you meant keep the proto label,
// change this single string to "Adherence".
const QUALITY_HEADER = "Quality";

// 🚩 FLAG for Akash — skill icon + color source. Seeded from the Figma
// reference; needs a real shared skill taxonomy so id → { icon, color }
// lives in one place (not duplicated per page). Strengths render the
// brand gradient; Needs Improvement uses --pill-bg + --color-text-tertiary
// (muted treatment) — the gradient field is ignored in that case.
// TODO token: skill-brand gradients have no design token yet. Isolated
// here so a future token migration is a one-file change.
const SKILL_REGISTRY = {
  building_rapport:        { label: "Building rapport",              Icon: MessageCircle, gradient: "linear-gradient(133deg, #EC4899, #F43F5E)" },
  uncovering_needs:        { label: "Uncovering needs",              Icon: Unlock,        gradient: "linear-gradient(133deg, #3B82F6, #6366F1)" },
  demonstrating_ownership: { label: "Demonstrating ownership needs", Icon: Key,           gradient: "linear-gradient(133deg, #06B6D4, #3B82F6)" },
  expressing_empathy:      { label: "Expressing empathy",            Icon: Heart,         gradient: "linear-gradient(133deg, #F43F5E, #EC4899)" },
  communicating_clearly:   { label: "Communicating clearly",         Icon: Volume2,       gradient: "linear-gradient(133deg, #6366F1, #3B82F6)" },
  problem_solving:         { label: "Problem solving",               Icon: Lightbulb,     gradient: "linear-gradient(133deg, #F59E0B, #F43F5E)" },
};

// Filters drawer config. Render is driven from this list — no bespoke
// markup per section. Two control types are implemented: single-select
// (Date) and multi-select (Coaching recommendation).
//
// 🚩 FLAG for Akash — section content. Only Date (single-select presets)
// and Coaching recommendation (Yes/No checkboxes) are visible in the
// reference. Every other section is collapsed, so its control type and
// option set is unknown. The TODO entries below are config stubs only —
// do NOT invent options without confirmation.
//
// 🚩 FLAG for Akash — "Filter name" section. There's already a "Search by
// filter name" field at the top, so a separate "Filter name" accordion
// row is ambiguous: is it a saved-filter feature (name + save the
// current filter set) or a real interaction attribute? Confirm before
// wiring; left as a stub.
//
// 🚩 FLAG — Date control placement. Reference shows Date with its value
// inline on the row ("Last 12 months ⌄"), unlike the accordion-expand
// checkbox sections. Built as a row-level inline dropdown rather than an
// expand-to-list accordion. Confirm against Figma.
const FILTER_SECTIONS = [
  {
    id: "date",
    label: "Date",
    type: "single-select",
    options: [
      { value: "today",        label: "Today" },
      { value: "last_7_days",  label: "Last 7 days" },
      { value: "last_30_days", label: "Last 30 days" },
      { value: "last_90_days", label: "Last 90 days" },
      { value: "last_12_months", label: "Last 12 months" },
    ],
    defaultValue: "last_12_months",
  },
  {
    id: "coaching_recommendation",
    label: "Coaching recommendation",
    type: "multi-select",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no",  label: "No"  },
    ],
  },
  // TODO: confirm options + control type with Akash before building.
  { id: "business_category", label: "Business category", type: "todo" },
  { id: "strengths",         label: "Strengths",         type: "todo" },
  { id: "filter_name",       label: "Filter name",       type: "todo" }, // see FLAG above
  { id: "channel",           label: "Channel",           type: "todo" },
  { id: "direction",         label: "Direction",         type: "todo" },
  { id: "workspaces",        label: "Workspaces",        type: "todo" },
  { id: "human_eval",        label: "Human Eval",        type: "todo" },
];

const TOTAL = 6811;
const PAGE_SIZE = 20;

const SEARCH_ATTRS = [
  { id: "customer", label: "Customer ID" },
  { id: "agent",    label: "Agent Name"  },
  { id: "reason",   label: "Contact Reason" },
];

// Skills payloads reused across rows — keeps mock concise and means the
// popover renders the reference layout for both variants.
const SKILLS_FULL = {
  variant: "tracked",
  strengths: [
    { id: "building_rapport" },
    { id: "uncovering_needs" },
    { id: "demonstrating_ownership" },
  ],
  needsImprovement: [
    { id: "expressing_empathy" },
    { id: "communicating_clearly" },
    { id: "problem_solving" },
  ],
};
const SKILLS_TOP = {
  variant: "top",
  strengths: [
    { id: "building_rapport" },
    { id: "uncovering_needs" },
    { id: "demonstrating_ownership" },
  ],
  needsImprovement: [],
};

const ROWS = [
  { customerId: "1CFEA2", channel: "voice",    date: "2026-05-07T16:50:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 1, s: 51 }, sentiment: "negative", adherence: null, skills: null         },
  { customerId: "EB236D", channel: "whatsapp", date: "2026-05-07T04:40:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 1, s: 19 }, sentiment: "neutral",  adherence: 78,   skills: SKILLS_FULL  },
  { customerId: "CA1484", channel: "voice",    date: "2026-05-05T17:25:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 1, s: 44 }, sentiment: "positive", adherence: 91,   skills: SKILLS_FULL  },
  { customerId: "53611D", channel: "whatsapp", date: "2026-04-30T06:35:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 2, s: 5 },  sentiment: "mixed",    adherence: 69,   skills: SKILLS_TOP   },
  { customerId: "CACA53", channel: "sms",      date: "2026-04-30T06:33:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 1, s: 1 },  sentiment: "mixed",    adherence: 58,   skills: null         },
  { customerId: "020A31", channel: "voice",    date: "2026-04-29T18:44:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 2, s: 17 }, sentiment: "positive", adherence: 92,   skills: SKILLS_FULL  },
  { customerId: "9492B2", channel: "whatsapp", date: "2026-04-28T14:12:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 2, s: 56 }, sentiment: "negative", adherence: 28,   skills: null         },
  { customerId: "1EA06C", channel: "sms",      date: "2026-04-22T21:18:00Z", agent: { initials: "AT", name: "Akash Trainee" },    duration: { h: 0, m: 2, s: 26 }, sentiment: "positive", adherence: 70,   skills: null         },
  { customerId: "A85CF1", channel: "email",    date: "2026-04-22T17:30:00Z", agent: { initials: "AL", name: "Aliasgar Trainee" }, duration: { h: 0, m: 0, s: 28 }, sentiment: "positive", adherence: 81,   skills: null         },
  { customerId: "300C85", channel: "voice",    date: "2026-04-17T17:22:00Z", agent: { initials: "KO", name: "Konecta Partner" },  duration: { h: 0, m: 2, s: 0 },  sentiment: "negative", adherence: 83,   skills: SKILLS_TOP   },
  { customerId: "B61007", channel: "whatsapp", date: "2026-04-17T17:20:00Z", agent: { initials: "KO", name: "Konecta Partner" },  duration: { h: 0, m: 0, s: 15 }, sentiment: "negative", adherence: 40,   skills: null         },
  { customerId: "23F1F4", channel: "voice",    date: "2026-04-17T13:57:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 0, s: 13 }, sentiment: "negative", adherence: null, skills: null         },
  { customerId: "FC5A2C", channel: "voice",    date: "2026-04-17T13:57:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 0, s: 13 }, sentiment: "negative", adherence: null, skills: null         },
  { customerId: "A92F18", channel: "whatsapp", date: "2026-04-15T10:11:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 1, s: 32 }, sentiment: "positive", adherence: 84,   skills: SKILLS_FULL  },
  { customerId: "DE3422", channel: "voice",    date: "2026-04-13T09:05:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 0, s: 47 }, sentiment: "neutral",  adherence: null, skills: null         },
  { customerId: "FF7A09", channel: "whatsapp", date: "2026-04-12T11:48:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 3, s: 18 }, sentiment: "positive", adherence: 84,   skills: SKILLS_FULL  },
  { customerId: "60AAB2", channel: "voice",    date: "2026-04-09T13:21:00Z", agent: { initials: "KO", name: "Konecta Partner" },  duration: { h: 0, m: 0, s: 54 }, sentiment: "negative", adherence: 33,   skills: SKILLS_TOP   },
  { customerId: "112233", channel: "sms",      date: "2026-04-08T15:00:00Z", agent: { initials: "AL", name: "Aliasgar Trainee" }, duration: { h: 0, m: 2, s: 1 },  sentiment: "neutral",  adherence: 68,   skills: null         },
  { customerId: "B7C9D0", channel: "whatsapp", date: "2026-04-05T19:33:00Z", agent: { initials: "AT", name: "Akash Trainee" },    duration: { h: 0, m: 1, s: 28 }, sentiment: "mixed",    adherence: 65,   skills: null         },
  { customerId: "5510EF", channel: "voice",    date: "2026-04-03T08:15:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 2, s: 12 }, sentiment: "positive", adherence: null, skills: null         },
];

const COLS = [
  { key: "customerId", label: "Customer ID",    width: "13%", align: "left" },
  { key: "channel",    label: "Channel",        width: "9%",  align: "left" },
  { key: "date",       label: "Date",           width: "18%", align: "left", sorted: true },
  { key: "agent",      label: "Agent",          width: "9%",  align: "left" },
  { key: "duration",   label: "Duration",       width: "11%", align: "left" },
  { key: "sentiment",  label: "Sentiment",      width: "13%", align: "left" },
  { key: "adherence",  label: QUALITY_HEADER,   width: "13%", align: "left" },
  { key: "skills",     label: "Skills",         width: "14%", align: "left" },
];

// Initial applied filter state — empty selections, plus the Date default
// preset so the row already shows its inline summary on first open.
const INITIAL_FILTERS = { date: "last_12_months" };

function onApplyFilters(_draft) {
  // TODO: apply filters to the interactions query. Do NOT wire fetch here —
  // stub only; confirm the query/handler contract with Akash.
}

export default function InteractionsPage({ locale = "en", onLocaleChange }) {
  const isRtl = lhDir(locale) === "rtl";
  const [page, setPage] = React.useState(1);
  const totalPages = Math.ceil(TOTAL / PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [appliedFilters, setAppliedFilters] = React.useState(INITIAL_FILTERS);
  const filterBtnRef = React.useRef(null);

  // Lifted from InteractionsHeader so the empty-state branch and the
  // header's X-clear button share one source of truth + handler.
  const [query, setQuery] = React.useState("");
  const [attr, setAttr] = React.useState("customer");

  // 🚩 FLAG — clearSearch scope. Clears query only by default; confirm
  // whether it should also reset the search attribute and applied filters.
  const clearSearch = () => setQuery("");

  // Client-side filter against the chosen attribute. The mock has no
  // reason field, so for "reason" the filter degrades to a no-op match
  // until a real field lands — keeps the empty state reachable for the
  // two attributes the mock supports.
  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ROWS;
    return ROWS.filter((row) => {
      if (attr === "agent") return row.agent.name.toLowerCase().includes(q);
      // default: customer id
      return row.customerId.toLowerCase().includes(q);
    });
  }, [query, attr]);

  const isSearchEmpty = query.trim() !== "" && filteredRows.length === 0;

  const handleApply = (draft) => {
    setAppliedFilters(draft);
    onApplyFilters(draft);
    setFiltersOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <InteractionsHeader
        filtersOpen={filtersOpen}
        onToggleFilters={() => setFiltersOpen((o) => !o)}
        filterBtnRef={filterBtnRef}
        query={query}
        onQueryChange={setQuery}
        onClearSearch={clearSearch}
        attr={attr}
        onAttrChange={setAttr}
        locale={locale}
        onLocaleChange={onLocaleChange}
      />
      <Card padX={0} padY={0}>
        {isSearchEmpty ? (
          <SearchEmptyState onClear={clearSearch} locale={locale} />
        ) : (
          <>
            <Table rows={filteredRows} locale={locale} />
            <Pagination
              page={page}
              totalPages={totalPages}
              totalCount={TOTAL}
              onPageChange={setPage}
              locale={locale}
              isRtl={isRtl}
            />
          </>
        )}
      </Card>
      {filtersOpen && (
        <FiltersPanel
          appliedFilters={appliedFilters}
          onApply={handleApply}
          locale={locale}
          onClose={() => {
            setFiltersOpen(false);
            // Return focus to the trigger per drawer a11y conventions.
            if (filterBtnRef.current) filterBtnRef.current.focus();
          }}
        />
      )}
    </div>
  );
}

function InteractionsHeader({
  filtersOpen, onToggleFilters, filterBtnRef,
  query, onQueryChange, onClearSearch, attr, onAttrChange, locale, onLocaleChange,
}) {
  const [open, setOpen] = React.useState(false);
  const ddRef = React.useRef(null);
  const selected = SEARCH_ATTRS.find((a) => a.id === attr) || SEARCH_ATTRS[0];
  const attrLabel = (id) => lhI(locale, `attr_${id}`);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div
      className="w-full bg-white rounded-xl overflow-hidden"
      style={{ border: "2px solid #FFFFFF" }}
    >
      {/* Title row */}
      <div
        className="h-14 flex items-center gap-3 bg-surface-header-tinted"
        style={{ padding: "8px 12px" }}
      >
        <div className="w-8 h-8 rounded-full bg-icon-tertiary-bg text-icon-tertiary-fg flex items-center justify-center">
          <ChatBubbleIcon size={16} />
        </div>
        <span className="font-sans text-[16px] leading-[28px] font-normal text-text-medium">
          {lhI(locale, "title")}
        </span>
        <div style={{ flex: 1 }} />
        <LanguageSelect locale={locale} onLocaleChange={onLocaleChange} />
      </div>

      {/* Search row */}
      <div className="h-12 flex items-center bg-white" style={{ padding: "0 12px 0 0" }}>
        <div className="flex-1 flex items-center gap-2" style={{ padding: "8px 0 8px 12px" }}>
          {/* Attribute dropdown */}
          <div ref={ddRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 h-8 px-3 rounded-md cursor-pointer"
              style={{
                background: "var(--pill-bg)",
                border: "1px solid var(--color-border-tab)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <span className="text-[13px] font-semibold text-text-medium">
                {attrLabel(selected.id)}
              </span>
              <ChevronDown size={14} className="text-text-tertiary" />
            </button>
            {open && (
              <div
                className="absolute mt-1 bg-white rounded-md overflow-hidden z-50"
                style={{
                  top: "calc(100% + 4px)",
                  insetInlineStart: 0,
                  minWidth: 160,
                  boxShadow: "0 4px 12px rgba(15,20,60,0.10)",
                  border: "1px solid var(--color-border-tab)",
                }}
              >
                {SEARCH_ATTRS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => { onAttrChange(a.id); setOpen(false); }}
                    className="block w-full px-3 py-2 text-[13px] hover:bg-pill-bg cursor-pointer"
                    style={{
                      fontFamily: "var(--font-sans)",
                      textAlign: "start",
                      color: a.id === attr ? "var(--color-text-tab-active)" : "var(--color-text-medium)",
                      fontWeight: a.id === attr ? 600 : 500,
                      background: a.id === attr ? "var(--pill-bg)" : "transparent",
                    }}
                  >
                    {attrLabel(a.id)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search input */}
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={`${lhI(locale, "searchBy")} ${attrLabel(selected.id)}`}
            className="flex-1 bg-transparent border-none outline-none font-sans text-[14px] leading-[22px] text-text-medium placeholder:text-text-placeholder"
          />
          {/* Clear (X) — visible only when the query is non-empty. */}
          {query !== "" && (
            <button
              type="button"
              onClick={onClearSearch}
              aria-label={lhI(locale, "clearSearch")}
              className="w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer text-text-medium"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div
          className="flex items-center self-stretch"
          style={{ paddingInlineStart: 8, borderInlineStart: "1px solid var(--color-border-tab)" }}
        >
          <button
            ref={filterBtnRef}
            type="button"
            onClick={onToggleFilters}
            aria-label={lhText(locale, "filters")}
            aria-expanded={filtersOpen}
            aria-haspopup="dialog"
            className="w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer text-text-medium"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Table({ rows, locale }) {
  return (
    <div className="overflow-x-auto">
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
          fontFamily: "var(--font-sans)",
        }}
      >
        <colgroup>
          {COLS.map((c) => (
            <col key={c.key} style={{ width: c.width }} />
          ))}
        </colgroup>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border-tab)" }}>
            {COLS.map((col) => (
              <th
                key={col.key}
                scope="col"
                aria-sort={col.sorted ? "descending" : undefined}
                style={{
                  padding: "14px 16px",
                  textAlign: col.align === "left" ? "start" : col.align,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(0,0,0,0.87)",
                  letterSpacing: "0.2px",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {lhI(locale, COL_LABEL_KEY[col.key] ?? col.key)}
                  {col.sorted && (
                    <span aria-hidden="true" style={{ color: "var(--do-ink)" }}>↓</span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <Row key={row.customerId + i} row={row} isLast={i === rows.length - 1} locale={locale} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ row, isLast, locale }) {
  const [hover, setHover] = React.useState(false);
  return (
    <tr
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: 56,
        borderBottom: isLast ? "none" : "1px solid #F0F2FA",
        background: hover ? "rgba(0,0,0,0.02)" : "transparent",
        cursor: "pointer",
        transition: "background 120ms ease",
      }}
    >
      <Cell>
        <span style={{ letterSpacing: "0.4px", textTransform: "uppercase", fontSize: 13, fontWeight: 500 }}>
          {row.customerId}
        </span>
      </Cell>
      <Cell>
        <ChannelIcon channel={row.channel} locale={locale} />
      </Cell>
      <Cell>
        <span style={{ fontSize: 13, color: "var(--do-ink)", fontWeight: 500 }}>
          {formatDateTime(row.date, locale)}
        </span>
      </Cell>
      <Cell>
        <AgentCell agent={row.agent} />
      </Cell>
      <Cell>
        <span style={{ fontSize: 13, color: "var(--do-ink)", fontWeight: 500 }}>
          {formatDuration(row.duration, locale)}
        </span>
      </Cell>
      <Cell>
        <SentimentTag value={row.sentiment} locale={locale} />
      </Cell>
      <Cell>
        <QualityCell value={row.adherence} channel={row.channel} />
      </Cell>
      <Cell>
        <SkillsCell skills={row.skills} onOpenDetail={() => onSkillsClick(row)} locale={locale} />
      </Cell>
    </tr>
  );
}

function onSkillsClick(row) {
  // TODO: open skills detail. Target TBD (side curtain vs modal vs route) — confirm with Akash.
}

function Cell({ children, align = "start" }) {
  return (
    <td
      style={{
        padding: "0 16px",
        verticalAlign: "middle",
        textAlign: align,
        color: "var(--do-ink)",
        fontSize: 13,
        overflow: "hidden",
      }}
    >
      {children}
    </td>
  );
}

function ChannelIcon({ channel, locale }) {
  if (channel === "whatsapp") {
    const t = lhI(locale, "ch_whatsapp");
    return (
      <span
        title={t}
        aria-label={t}
        style={{ display: "inline-flex", alignItems: "center", color: "#25D366" }}
      >
        <MessageCircle size={18} fill="#25D366" stroke="#FFFFFF" strokeWidth={1.5} />
      </span>
    );
  }
  if (channel === "sms" || channel === "chat") {
    const t = lhI(locale, "ch_sms");
    return (
      <span
        title={t}
        aria-label={t}
        style={{ display: "inline-flex", alignItems: "center", color: "var(--color-text-medium)" }}
      >
        <MessageSquare size={18} />
      </span>
    );
  }
  if (channel === "email") {
    const t = lhI(locale, "ch_email");
    return (
      <span
        title={t}
        aria-label={t}
        style={{ display: "inline-flex", alignItems: "center", color: "var(--color-text-medium)" }}
      >
        <Mail size={18} />
      </span>
    );
  }
  const t = lhI(locale, "ch_voice");
  return (
    <span
      title={t}
      aria-label={t}
      style={{ display: "inline-flex", alignItems: "center", color: "var(--color-text-medium)" }}
    >
      <Phone size={18} />
    </span>
  );
}

function AgentCell({ agent }) {
  return (
    <div
      title={agent.name}
      aria-label={agent.name}
      style={{
        width: 26,
        height: 26,
        borderRadius: 13,
        background: "#E0DEEC",
        color: "var(--color-icon-tertiary-fg)",
        display: "grid",
        placeItems: "center",
        fontSize: 11,
        fontWeight: 700,
        flexShrink: 0,
        textTransform: "uppercase",
      }}
    >
      {agent.initials.slice(0, 2)}
    </div>
  );
}

function SentimentTag({ value, locale }) {
  const map = {
    positive: { bg: "#EDF7ED", fg: "#1E4620" },
    neutral:  { bg: "#F1F3F9", fg: "#5A5D72" },
    negative: { bg: "#FDEDED", fg: "#5F2120" },
    mixed:    { bg: "#FFF4E5", fg: "#663C00" },
  };
  const s = map[value] || map.neutral;
  const label = lhI(locale, `sent_${value in map ? value : "neutral"}`);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: s.bg,
        color: s.fg,
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 4,
      }}
    >
      {label}
    </span>
  );
}

function QualityCell({ value, channel }) {
  if (value === null || value === undefined) {
    return <span style={{ color: "var(--color-text-placeholder)", fontSize: 13 }}>--</span>;
  }
  // 🚩 FLAG for Akash: gear/clipboard split is keyed to channel (text vs. non-text)
  // because that's what the reference shows. Confirm it isn't actually keyed to
  // evaluation method (auto/AI vs. manual QA). If it's eval-method, this mapping
  // moves off `channel` onto a new field.
  const isText = channel === "sms" || channel === "chat";
  const Icon = isText ? ClipboardList : Settings;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <Icon size={16} color="var(--color-icon-tertiary-fg)" strokeWidth={2} />
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--do-ink)" }}>{value}%</span>
    </span>
  );
}

// SkillsCell — icon button anchors a hover/focus popover (SkillsPopover).
// 🚩 FLAG for Akash: (a) The meaning of radar vs. trophy isn't derivable from
// the reference — confirm semantics (e.g. radar = skills tracked on the call,
// trophy = top-performer / appreciation moment). (b) Confirm the detail target
// so the stub can be wired to the house pattern.
// 🚩 FLAG for Akash — hover vs click reconciliation. Last prompt made the icon
// click-to-open-detail. This prompt makes the in-card "Coaching recommendation"
// row the detail link, so the icon is now hover/focus-only (no click action).
// Confirm: should clicking the icon *also* open the detail, or is the in-card
// CTA the only click-through?
function SkillsCell({ skills, onOpenDetail, locale }) {
  if (!skills || (skills.variant !== "tracked" && skills.variant !== "top")) {
    return <span style={{ color: "var(--color-text-placeholder)", fontSize: 13 }}>--</span>;
  }
  return <SkillsTrigger skills={skills} onOpenDetail={onOpenDetail} locale={locale} />;
}

function SkillsTrigger({ skills, onOpenDetail, locale }) {
  const [open, setOpen] = React.useState(false);
  const [rect, setRect] = React.useState(null);
  const triggerRef = React.useRef(null);
  const openTimer = React.useRef(null);
  const closeTimer = React.useRef(null);

  const showPopover = React.useCallback(() => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    if (open) return;
    openTimer.current = setTimeout(() => {
      if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
      setOpen(true);
    }, 120);
  }, [open]);

  const hidePopover = React.useCallback(() => {
    if (openTimer.current) { clearTimeout(openTimer.current); openTimer.current = null; }
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }, []);

  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  React.useEffect(() => () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const Icon = skills.variant === "top" ? Trophy : Radar;
  const label = lhI(locale, skills.variant === "top" ? "sk_top" : "sk_tracked");

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onMouseEnter={showPopover}
        onMouseLeave={hidePopover}
        onFocus={showPopover}
        onBlur={hidePopover}
        onClick={(e) => e.stopPropagation()}
        className="cursor-pointer"
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          border: "none",
          background: "transparent",
          display: "inline-grid",
          placeItems: "center",
          padding: 0,
          color: "var(--color-icon-tertiary-fg)",
        }}
      >
        <Icon size={16} strokeWidth={2} />
      </button>
      {open && rect && (
        <SkillsPopover
          rect={rect}
          skills={skills}
          onOpenDetail={onOpenDetail}
          onPointerEnter={showPopover}
          onPointerLeave={hidePopover}
          locale={locale}
        />
      )}
    </>
  );
}

// SkillsPopover — hover card mirroring the ChartTooltip positioning approach
// (fixed, anchored from the trigger's getBoundingClientRect, clamped to
// viewport). Interactive (pointerEvents auto) so the Coaching CTA is clickable.
//
// 🚩 FLAG for Akash — radar vs trophy content. Single data-driven card; empty
// sections render nothing, so a top-performer row (strengths-only payload)
// becomes a strengths-only card automatically. Confirm trophy isn't meant to
// be a distinct strengths-only layout.
function SkillsPopover({ rect, skills, onOpenDetail, onPointerEnter, onPointerLeave, locale }) {
  const POPOVER_W = 300;
  const GUTTER = 8;
  // Open below the trigger, right-aligned to it so the card grows leftward
  // (matches the Figma placement). Clamp to viewport.
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1440;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 900;
  const left = Math.max(GUTTER, Math.min(rect.right - POPOVER_W, viewportW - POPOVER_W - GUTTER));
  const top = Math.min(rect.bottom + GUTTER, viewportH - GUTTER - 320);

  const hasStrengths = Array.isArray(skills.strengths) && skills.strengths.length > 0;
  const hasNeeds = Array.isArray(skills.needsImprovement) && skills.needsImprovement.length > 0;

  const handleCta = (e) => {
    e.stopPropagation();
    onOpenDetail();
  };

  return (
    <div
      role="dialog"
      aria-label={lhI(locale, "skillsDetail")}
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
      style={{
        position: "fixed",
        left,
        top,
        width: POPOVER_W,
        zIndex: 1000,
        pointerEvents: "auto",
      }}
    >
      <Card shadow padX={12} padY={12}>
        {hasStrengths && (
          <SkillsSection
            icon={<Trophy size={14} color="var(--color-text-tertiary)" />}
            title={lhI(locale, "sk_strengths")}
            items={skills.strengths}
            tone="brand"
            locale={locale}
          />
        )}
        {hasStrengths && hasNeeds && <div style={popStyles.divider} />}
        {hasNeeds && (
          <SkillsSection
            icon={<Quote size={14} color="var(--color-text-tertiary)" />}
            title={lhI(locale, "sk_needs")}
            items={skills.needsImprovement}
            tone="muted"
            locale={locale}
          />
        )}
        {(hasStrengths || hasNeeds) && <div style={popStyles.divider} />}
        <button
          type="button"
          onClick={handleCta}
          className="cursor-pointer"
          style={popStyles.cta}
        >
          <Radar size={14} color="var(--color-icon-tertiary-fg)" />
          <span style={popStyles.ctaLabel}>{lhI(locale, "sk_coaching")}</span>
        </button>
      </Card>
    </div>
  );
}

function SkillsSection({ icon, title, items, tone, locale }) {
  return (
    <div style={popStyles.section}>
      <div style={popStyles.sectionHead}>
        {icon}
        <span style={popStyles.sectionTitle}>{title}</span>
      </div>
      <ul style={popStyles.list}>
        {items.map((item) => (
          <li key={item.id} style={popStyles.row}>
            <SkillBadge id={item.id} tone={tone} />
            <span style={popStyles.skillLabel}>
              {lhI(locale, `skill_${item.id}`)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SkillBadge({ id, tone }) {
  const entry = SKILL_REGISTRY[id];
  const Icon = entry?.Icon;
  const isMuted = tone === "muted";
  return (
    <span
      aria-hidden="true"
      style={{
        width: 24,
        height: 24,
        borderRadius: 6,
        display: "inline-grid",
        placeItems: "center",
        flexShrink: 0,
        background: isMuted ? "var(--pill-bg)" : (entry?.gradient ?? "var(--pill-bg)"),
        color: isMuted ? "var(--color-text-tertiary)" : "#FFFFFF",
      }}
    >
      {Icon && <Icon size={12} strokeWidth={2} />}
    </span>
  );
}

const popStyles = {
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    paddingBottom: 4,
  },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.5px",
    color: "var(--color-text-tertiary)",
  },
  list: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  skillLabel: {
    fontSize: 12,
    color: "var(--color-text-deep)",
    lineHeight: 1.4,
  },
  divider: {
    height: 1,
    background: "var(--color-divider-card)",
    margin: "8px 0",
  },
  cta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "none",
    background: "transparent",
    padding: "4px 0",
    width: "100%",
    textAlign: "start",
  },
  ctaLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--color-text-deep)",
    letterSpacing: "0.25px",
  },
};

// FiltersPanel — right drawer mirroring the PreviewStep precedent
// (fixed, --shadow-drawer, divider border, --surface-white). Non-modal,
// no scrim: the table stays visible behind it.
//
// 🚩 FLAG — width / scrim. Built at 400px (PreviewStep precedent). Figma
// shows 320px and no scrim; confirm the exact width and the no-scrim
// behavior against the latest spec.
//
// 🚩 FLAG — Apply / Deselect-all enable rules. Apply is enabled when the
// draft differs from applied; Deselect-all is enabled when the draft has
// any selection. Confirm exact rules + Apply emphasis styling against
// Figma.
//
// 🚩 FLAG — search scope. Search filters by section LABEL only. Confirm
// whether it should also match option labels inside sections.
function FiltersPanel({ appliedFilters, onApply, onClose, locale }) {
  const [draft, setDraft] = React.useState(appliedFilters);
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState(() => new Set());
  const panelRef = React.useRef(null);

  // Focus enters the panel on mount only — don't re-focus on every render
  // or it would steal focus back from the input/checkboxes the user clicks.
  React.useEffect(() => {
    if (panelRef.current) panelRef.current.focus();
  }, []);

  // Escape closes (discards draft).
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setValue = (sectionId, value) => {
    setDraft((d) => ({ ...d, [sectionId]: value }));
  };

  const toggleMulti = (sectionId, value) => {
    setDraft((d) => {
      const current = new Set(d[sectionId] || []);
      if (current.has(value)) current.delete(value);
      else current.add(value);
      return { ...d, [sectionId]: Array.from(current) };
    });
  };

  const toggleExpanded = (sectionId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const visibleSections = FILTER_SECTIONS.filter(
    (s) => !query || lhI(locale, `fs_${s.id}`).toLowerCase().includes(query.trim().toLowerCase()),
  );

  const draftHasSelection = Object.entries(draft).some(([, v]) => {
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== null && v !== "";
  });
  const draftDirty = JSON.stringify(draft) !== JSON.stringify(appliedFilters);

  const handleDeselectAll = () => setDraft({});

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={lhText(locale, "filters")}
      tabIndex={-1}
      style={fpStyles.panel}
    >
      {/* Header */}
      <div style={fpStyles.header}>
        <span style={fpStyles.title}>{lhText(locale, "filters")}</span>
        <Button variant="icon" onClick={onClose} aria-label={lhI(locale, "closeFilters")}>
          <X size={18} />
        </Button>
      </div>

      {/* Search by filter name — same treatment as the header search input. */}
      <div style={fpStyles.searchRow}>
        <Search size={16} color="var(--color-text-tertiary)" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lhI(locale, "filterName")}
          style={fpStyles.searchInput}
        />
      </div>

      {/* Section list — only this scrolls. */}
      <div style={fpStyles.list}>
        {visibleSections.map((section) => (
          <FilterSection
            key={section.id}
            section={section}
            value={draft[section.id]}
            expanded={expanded.has(section.id)}
            onToggleExpanded={() => toggleExpanded(section.id)}
            onSetValue={(v) => setValue(section.id, v)}
            onToggleMulti={(v) => toggleMulti(section.id, v)}
            locale={locale}
          />
        ))}
      </div>

      {/* Footer */}
      <div style={fpStyles.footer}>
        <Button
          variant="text"
          uppercase={false}
          disabled={!draftHasSelection}
          onClick={handleDeselectAll}
        >
          {lhI(locale, "deselectAll")}
        </Button>
        <div style={{ display: "inline-flex", gap: 8 }}>
          <Button variant="text" uppercase={false} onClick={onClose}>
            {lhText(locale, "cancel")}
          </Button>
          <Button
            variant="primary"
            uppercase={false}
            disabled={!draftDirty}
            onClick={() => onApply(draft)}
            style={{ minWidth: 0, height: 32, paddingInline: 16, fontSize: 13 }}
          >
            {lhText(locale, "apply")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ section, value, expanded, onToggleExpanded, onSetValue, onToggleMulti, locale }) {
  const sectionLabel = lhI(locale, `fs_${section.id}`);
  // Date renders inline (row-level dropdown showing current preset, per
  // reference). Other types use the accordion-expand treatment.
  if (section.type === "single-select" && section.id === "date") {
    const localizedOptions = section.options.map((o) => ({ ...o, label: lhI(locale, `opt_${o.value}`) }));
    return (
      <div style={fpStyles.sectionRow}>
        <span style={fpStyles.sectionLabel}>{sectionLabel}</span>
        <SingleSelectDropdown
          options={localizedOptions}
          value={value ?? section.defaultValue}
          onChange={onSetValue}
        />
      </div>
    );
  }

  if (section.type === "multi-select") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div style={fpStyles.accordion}>
        <button
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
          style={fpStyles.accordionHead}
        >
          <span style={fpStyles.sectionLabel}>{sectionLabel}</span>
          {expanded
            ? <ChevronUp size={16} color="var(--color-text-tertiary)" />
            : <ChevronDown size={16} color="var(--color-text-tertiary)" />}
        </button>
        {expanded && (
          <ul style={fpStyles.optionsList}>
            {section.options.map((opt) => (
              <li key={opt.value} style={fpStyles.optionRow}>
                <label style={fpStyles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.value)}
                    onChange={() => onToggleMulti(opt.value)}
                    style={fpStyles.checkbox}
                  />
                  {lhI(locale, `opt_${opt.value}`)}
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // type === "todo" — collapsed-only row, no control wired yet.
  // 🚩 FLAG for Akash — see FILTER_SECTIONS comment block.
  return (
    <button
      type="button"
      onClick={onToggleExpanded}
      style={{ ...fpStyles.sectionRow, cursor: "default" }}
      aria-disabled="true"
      title={lhI(locale, "optionsPending")}
    >
      <span style={fpStyles.sectionLabel}>{sectionLabel}</span>
      <ChevronDown size={16} color="var(--color-text-tertiary)" />
    </button>
  );
}

// SingleSelectDropdown — reuses the header attribute-dropdown treatment
// (pill background, bordered, ChevronDown trigger; absolute-positioned
// menu with hover-bg rows).
function SingleSelectDropdown({ options, value, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ddRef = React.useRef(null);
  const selected = options.find((o) => o.value === value) || options[0];

  React.useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ddRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 h-7 px-2 rounded-md cursor-pointer"
        style={{
          background: "var(--pill-bg)",
          border: "1px solid var(--color-border-tab)",
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          color: "var(--color-text-medium)",
          fontWeight: 500,
        }}
      >
        {selected?.label}
        <ChevronDown size={12} color="var(--color-text-tertiary)" />
      </button>
      {open && (
        <div
          className="absolute mt-1 bg-white rounded-md overflow-hidden z-50"
          style={{
            top: "calc(100% + 4px)",
            insetInlineEnd: 0,
            minWidth: 160,
            boxShadow: "0 4px 12px rgba(15,20,60,0.10)",
            border: "1px solid var(--color-border-tab)",
          }}
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className="block w-full px-3 py-2 text-[13px] hover:bg-pill-bg cursor-pointer"
              style={{
                fontFamily: "var(--font-sans)",
                textAlign: "start",
                color: o.value === value ? "var(--color-text-tab-active)" : "var(--color-text-medium)",
                fontWeight: o.value === value ? 600 : 500,
                background: o.value === value ? "var(--pill-bg)" : "transparent",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Figma reference shows 320px; PreviewStep precedent is 400px. Latest
// Figma is explicit — using 320 here. Flip back to 400 if Akash confirms.
const FILTERS_DRAWER_WIDTH = 320;

const fpStyles = {
  panel: {
    position: "fixed",
    top: 0,
    insetInlineEnd: 0,
    bottom: 0,
    width: FILTERS_DRAWER_WIDTH,
    background: "var(--surface-white)",
    borderInlineStart: "1px solid var(--color-divider-card)",
    boxShadow: "var(--shadow-drawer)",
    display: "flex",
    flexDirection: "column",
    zIndex: 40,
    outline: "none",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: 20,
    height: 56,
    borderBottom: "1px solid var(--color-divider-card)",
    flexShrink: 0,
  },
  title: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 16,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    paddingInline: 20,
    height: 48,
    borderBottom: "1px solid var(--color-divider-card)",
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "var(--color-text-medium)",
  },
  list: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  sectionRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: 20,
    height: 54,
    background: "transparent",
    border: "none",
    borderBottom: "1px solid var(--color-divider-card)",
    width: "100%",
    textAlign: "start",
    cursor: "pointer",
  },
  sectionLabel: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  accordion: {
    display: "flex",
    flexDirection: "column",
    borderBottom: "1px solid var(--color-divider-card)",
  },
  accordionHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: 20,
    height: 54,
    background: "transparent",
    border: "none",
    width: "100%",
    textAlign: "start",
    cursor: "pointer",
  },
  optionsList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
    background: "var(--pill-bg)",
  },
  optionRow: {
    display: "flex",
    alignItems: "center",
    paddingInline: 20,
    height: 44,
  },
  checkLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    fontFamily: '"Poppins", sans-serif',
    fontSize: 14,
    color: "var(--color-text-deep)",
    cursor: "pointer",
  },
  // 🚩 Reuses CoverageStep's native-checkbox treatment (16px,
  // accentColor = primary). No central Checkbox primitive exists yet;
  // promotion candidate once a 3rd callsite appears.
  checkbox: {
    width: 16,
    height: 16,
    accentColor: "var(--color-button-primary-bg)",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: 16,
    height: 56,
    borderTop: "1px solid var(--color-divider-card)",
    background: "var(--surface-white)",
    flexShrink: 0,
  },
};

// SearchEmptyState — shown in place of Table + footer when the user has a
// query and the filtered set is empty. Centered illustration + message +
// primary CTA. Layout mirrors the existing empty-state pattern in
// GuidePage (column-centered, text-center, gap 12).
//
// 🚩 FLAG — promote <EmptyState illustration heading body cta?>. This is
// the right shape for a shared primitive; do it once a 3rd page consumes
// the same layout. For now the illustration + container live here so the
// promotion is a copy-paste away.
//
// 🚩 FLAG — referenced precedent missing. The spec called for reusing
// `EmptyStateIllustration` from `components/MissionsPage.jsx`, but that
// file doesn't exist in this repo (closest matches: SkillsPage / TasksPage
// / GuidePage empty-state, none of which use this document+magnifier
// illustration). Drawing it inline here to match the Figma; promote when
// a 2nd consumer appears.
//
// 🚩 FLAG — other empty variants. This is the search-empty case only.
// Filter-empty ("Clear filters") and first-run no-data states need
// different copy + CTAs and aren't built here.
function SearchEmptyState({ onClear, locale }) {
  return (
    <div style={emptyStyles.wrap}>
      <EmptyStateIllustration />
      <p style={emptyStyles.message}>{lhI(locale, "emptyMessage")}</p>
      <Button variant="primary" uppercase={false} onClick={onClear}>
        {lhI(locale, "clearSearch")}
      </Button>
    </div>
  );
}

function EmptyStateIllustration() {
  // Document + magnifier in muted greys, matching the Figma reference.
  // Colors mirror the spec (slate document + lens). No design token for
  // illustration fills today — left as-is per spec instruction.
  return (
    <svg
      width={120}
      height={120}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* document */}
      <rect x={32} y={20} width={56} height={68} rx={4} fill="#F1F3F9" stroke="#D6DCE8" strokeWidth={2} />
      {/* text lines */}
      <rect x={40} y={30} width={32} height={4} rx={1} fill="#D6DCE8" />
      <rect x={40} y={40} width={40} height={4} rx={1} fill="#D6DCE8" />
      <rect x={40} y={50} width={24} height={4} rx={1} fill="#D6DCE8" />
      {/* magnifier circle */}
      <circle cx={74} cy={72} r={16} fill="#FFFFFF" stroke="#AAB2C5" strokeWidth={3} />
      {/* magnifier handle */}
      <line x1={86} y1={84} x2={96} y2={94} stroke="#AAB2C5" strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
}

const emptyStyles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 16,
    paddingBlock: 64,
    paddingInline: 24,
    minHeight: 320,
  },
  message: {
    margin: 0,
    fontFamily: '"Poppins", sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-medium)",
    maxWidth: 280,
    lineHeight: 1.5,
  },
};

function Pagination({ page, totalPages, totalCount, onPageChange, locale, isRtl }) {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const flip = isRtl ? { transform: "scaleX(-1)" } : undefined;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        borderTop: "1px solid var(--color-border-tab)",
      }}
    >
      <div style={{ color: "var(--color-text-tertiary)", fontSize: 13, fontWeight: 500 }}>
        {lhTotalInteractions(locale, totalCount)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <PageBtn ariaLabel={lhI(locale, "firstPage")} disabled={!canPrev} onClick={() => onPageChange(1)}>
          <ChevronsLeft size={16} style={flip} />
        </PageBtn>
        <span
          aria-live="polite"
          style={{ color: "var(--do-ink)", fontSize: 13, fontWeight: 500, padding: "0 4px" }}
        >
          {lhPageOf(locale, page, totalPages)}
        </span>
        <PageBtn ariaLabel={lhI(locale, "prevPage")} disabled={!canPrev} onClick={() => canPrev && onPageChange(page - 1)}>
          <ChevronLeft size={16} style={flip} />
        </PageBtn>
        <PageBtn ariaLabel={lhI(locale, "nextPage")} disabled={!canNext} onClick={() => canNext && onPageChange(page + 1)}>
          <ChevronRight size={16} style={flip} />
        </PageBtn>
      </div>
    </div>
  );
}

function PageBtn({ children, onClick, disabled, ariaLabel }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={ariaLabel}
      style={{
        width: 28,
        height: 28,
        borderRadius: 6,
        border: "none",
        background: !disabled && hover ? "var(--pill-bg)" : "transparent",
        color: disabled ? "var(--color-text-placeholder)" : "var(--do-ink)",
        cursor: disabled ? "default" : "pointer",
        display: "grid",
        placeItems: "center",
        padding: 0,
        transition: "background 120ms ease",
      }}
    >
      {children}
    </button>
  );
}

function ChatBubbleIcon({ size = 16 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 -960 960 960"
      fill="currentColor"
    >
      <path d="M280-240q-17 0-28.5-11.5T240-280v-80h520v-360h80q17 0 28.5 11.5T880-680v600L720-240H280ZM80-280v-560q0-17 11.5-28.5T120-880h520q17 0 28.5 11.5T680-840v360q0 17-11.5 28.5T640-440H240L80-280Z" />
    </svg>
  );
}

function formatDuration({ h = 0, m = 0, s = 0 }, locale = "en") {
  const uh = lhI(locale, "unit_h");
  const um = lhI(locale, "unit_m");
  const us = lhI(locale, "unit_s");
  if (h > 0) return `${h}${uh} ${m}${um}`;
  if (m > 0 && s === 0) return `${m}${um} 0${us}`;
  return `${m}${um} ${s}${us}`;
}

