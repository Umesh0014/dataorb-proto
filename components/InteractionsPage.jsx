"use client";

import React from "react";
import { useRouter } from "next/navigation";
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
  Layers,
  BarChart3,
  Tag,
  Crosshair,
  TrendingDown,
  Smile,
  Flag,
  Award,
  Info,
} from "lucide-react";
// 🚩 FLAG — Phosphor introduced solely for the WhatsApp brand mark
// (lucide lacks a real WhatsApp logo). Other channel icons stay on
// lucide. Two follow-ups for Akash: (A — built) only WhatsApp moves to
// Phosphor, sized to sit next to the lucide icons; (B — not done)
// standardise all channel icons on one library if mixing reads
// inconsistent. Weight="fill" picked to match the solid brand mark in
// the reference — confirm against Figma if outline is preferred.
import { WhatsappLogo } from "@phosphor-icons/react";
import Card from "./Card";
import EmailConversationView from "./EmailConversationView";
import Button from "./Button";
import { formatDateTime } from "./formatDate";

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

// Search-by attributes. Each entry knows how to pluck its field off a row
// — keeps the filter logic generic and lets new attributes land as a
// single config row, not a switch-statement edit.
//
// 🚩 FLAG — Topic / Caller ID / External Conversation ID source. These
// live under row.details in production; in the prototype mock, details
// only lives on the selected row via DETAILS_SAMPLE fallback. The filter
// here uses DETAILS_SAMPLE as a fallback so all five options are testable.
const SEARCH_ATTRS = [
  { id: "customer",    label: "Customer ID",              field: (row) => row.customerId },
  { id: "topic",       label: "Topic",                    field: (row) => detailsOf(row).interactionOutcome?.topic },
  { id: "caller",      label: "Caller ID",                field: (row) => detailsOf(row).interactionMetadata?.callerId },
  { id: "interaction", label: "Interaction ID",           field: (row) => row.interactionId },
  { id: "external",    label: "External Conversation ID", field: (row) => detailsOf(row).interactionMetadata?.externalId },
];

function detailsOf(row) {
  return row.details || DETAILS_SAMPLE;
}

// Skills payloads reused across rows — keeps mock concise and means the
// popover renders the reference layout for both variants.
// Mock cache-buster: v4 (forces a new bundle hash on Vercel).
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
  { interactionId: "7123456", customerId: "000028", channel: "email",    date: "2026-05-07T16:50:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 1, s: 51 }, sentiment: "negative", adherence: null, skills: null         },
  { interactionId: "6534512", customerId: "000023", channel: "whatsapp", date: "2026-05-07T04:40:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 1, s: 19 }, sentiment: "neutral",  adherence: 78,   skills: SKILLS_FULL  },
  { interactionId: "9871234", customerId: "000022", channel: "voice",    date: "2026-05-05T17:25:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 1, s: 44 }, sentiment: "positive", adherence: 91,   skills: SKILLS_FULL  },
  { interactionId: "4451289", customerId: "000010", channel: "whatsapp", date: "2026-04-30T06:35:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 2, s: 5 },  sentiment: "mixed",    adherence: 69,   skills: SKILLS_TOP   },
  { interactionId: "1023487", customerId: "000031", channel: "sms",      date: "2026-04-30T06:33:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 1, s: 1 },  sentiment: "mixed",    adherence: 58,   skills: null         },
  { interactionId: "8847651", customerId: "000015", channel: "voice",    date: "2026-04-29T18:44:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 2, s: 17 }, sentiment: "positive", adherence: 92,   skills: SKILLS_FULL  },
  { interactionId: "5512309", customerId: "000034", channel: "whatsapp", date: "2026-04-28T14:12:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 2, s: 56 }, sentiment: "negative", adherence: 28,   skills: null         },
  { interactionId: "2245876", customerId: "000018", channel: "sms",      date: "2026-04-22T21:18:00Z", agent: { initials: "AT", name: "Akash Trainee" },    duration: { h: 0, m: 2, s: 26 }, sentiment: "positive", adherence: 70,   skills: null         },
  { interactionId: "6634012", customerId: "000024", channel: "email",    date: "2026-04-22T17:30:00Z", agent: { initials: "AL", name: "Aliasgar Trainee" }, duration: { h: 0, m: 0, s: 28 }, sentiment: "positive", adherence: 81,   skills: null         },
  { interactionId: "7798456", customerId: "000020", channel: "voice",    date: "2026-04-17T17:22:00Z", agent: { initials: "KO", name: "Konecta Partner" },  duration: { h: 0, m: 2, s: 0 },  sentiment: "negative", adherence: 83,   skills: SKILLS_TOP   },
  { interactionId: "1234567", customerId: "000090", channel: "whatsapp", date: "2026-04-17T17:20:00Z", agent: { initials: "KO", name: "Konecta Partner" },  duration: { h: 0, m: 0, s: 15 }, sentiment: "negative", adherence: 40,   skills: null         },
  { interactionId: "9032187", customerId: "000045", channel: "voice",    date: "2026-04-17T13:57:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 0, s: 13 }, sentiment: "negative", adherence: null, skills: null         },
  { interactionId: "8765432", customerId: "000051", channel: "voice",    date: "2026-04-17T13:57:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 0, s: 13 }, sentiment: "negative", adherence: null, skills: null         },
  { interactionId: "3349812", customerId: "000062", channel: "whatsapp", date: "2026-04-15T10:11:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 1, s: 32 }, sentiment: "positive", adherence: 84,   skills: SKILLS_FULL  },
  { interactionId: "7765409", customerId: "000071", channel: "voice",    date: "2026-04-13T09:05:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 0, s: 47 }, sentiment: "neutral",  adherence: null, skills: null         },
  { interactionId: "5511289", customerId: "000084", channel: "whatsapp", date: "2026-04-12T11:48:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 3, s: 18 }, sentiment: "positive", adherence: 84,   skills: SKILLS_FULL  },
  { interactionId: "4423091", customerId: "000037", channel: "voice",    date: "2026-04-09T13:21:00Z", agent: { initials: "KO", name: "Konecta Partner" },  duration: { h: 0, m: 0, s: 54 }, sentiment: "negative", adherence: 33,   skills: SKILLS_TOP   },
  { interactionId: "6612354", customerId: "000056", channel: "sms",      date: "2026-04-08T15:00:00Z", agent: { initials: "AL", name: "Aliasgar Trainee" }, duration: { h: 0, m: 2, s: 1 },  sentiment: "neutral",  adherence: 68,   skills: null         },
  { interactionId: "9988123", customerId: "000099", channel: "whatsapp", date: "2026-04-05T19:33:00Z", agent: { initials: "AT", name: "Akash Trainee" },    duration: { h: 0, m: 1, s: 28 }, sentiment: "mixed",    adherence: 65,   skills: null         },
  { interactionId: "7702145", customerId: "000077", channel: "voice",    date: "2026-04-03T08:15:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 2, s: 12 }, sentiment: "positive", adherence: null, skills: null         },
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

// Row-detail drawer config.
// 🚩 FLAG for Akash — data source. DETAILS_SAMPLE is the mock payload from
// the reference (customer 000028). It's attached to every row so any row
// click demonstrates the drawer; in production confirm whether the row
// fetch returns details inline or a separate on-click fetch.
// 🚩 FLAG for Akash — section icons. Seeded from lucide as a starting
// point; confirm canonical icons against Figma before locking.
// 🚩 FLAG — collapsibility. Default is non-collapsible, single scroll
// (matches the reference). If sections grow long, revisit.
const DETAILS_SAMPLE = {
  contactReason: {
    hasSalesLead: false,
    customerIntent: "Issue resolution",
    issueType: "Account management issue",
    journeyStage: "Account changes",
    reasonForContact: "Retrieve account password",
    businessAspect: "Account management",
    hasActionItem: false,
  },
  interactionOutcome: { topic: "Retrieve account password", status: "Pending" },
  commercialOffer: { salesAttempt: false, offerCategory: "Not applicable", offerStatus: "Not applicable" },
  competitorMention: { competitor: "Jazztel" },
  churnRisk: { status: "Moderate", driver: "Inconvenient password reset process", mentionedToSwitch: false },
  customerSentiment: { initialSentiment: "Mixed", finalSentiment: "Negative", painPointDrivers: "Account access failure" },
  predictedCsat: { satisfactionRating: "Very dissatisfied" },
  flags: { agentFollowup: true },
  skillProficiency: { coachingRecommendation: false },
  interactionMetadata: {
    customerId: "000028", source: "Zendesk", externalId: "653518", channel: "Email", direction: "Outbound",
    lob: null, campaign: "FO_R_FIDE_RES", productType: "Convergente", service: "ATEN_RES_MASIVO_MOVIL",
    subService: "POSPAGO", serviceProviderLocation: "KON_SEVILLA", customerSeniority: "INFANCIA",
    lastAgentGroup: "Not available", group: "Generalista Guadalajara", callerId: "600000000",
    customerLineTariff: "4G de Orang en casa", hasCommitmentActive: true, commitmentPeriodDurationMonths: 3,
    agentSkill: "6440169", importedDate: "Dec 4, 2019 1:42 pm",
  },
};

const DETAIL_SECTIONS = [
  {
    id: "contactReason",
    title: "Contact reason insights",
    Icon: Layers,
    dataKey: "contactReason",
    fields: [
      { label: "Has sales lead",     key: "hasSalesLead",    format: "boolean" },
      { label: "Customer Intent",    key: "customerIntent" },
      { label: "Issue type",         key: "issueType" },
      { label: "Journey stage",      key: "journeyStage" },
      { label: "Reason for Contact", key: "reasonForContact" },
      { label: "Business aspect",    key: "businessAspect" },
      { label: "Has action item",    key: "hasActionItem",   format: "boolean" },
    ],
  },
  {
    id: "interactionOutcome",
    title: "Interaction outcome overview",
    Icon: BarChart3,
    dataKey: "interactionOutcome",
    fields: [
      { label: "Topic",  key: "topic" },
      { label: "Status", key: "status" },
    ],
  },
  {
    id: "commercialOffer",
    title: "Commercial offer insights",
    Icon: Tag,
    dataKey: "commercialOffer",
    fields: [
      { label: "Sales attempt",  key: "salesAttempt", format: "boolean" },
      { label: "Offer category", key: "offerCategory" },
      { label: "Offer status",   key: "offerStatus" },
    ],
  },
  {
    id: "competitorMention",
    title: "Competitor mention",
    Icon: Crosshair,
    dataKey: "competitorMention",
    fields: [
      { label: "Competitor", key: "competitor" },
    ],
  },
  {
    id: "churnRisk",
    title: "Churn-risk Insights",
    Icon: TrendingDown,
    dataKey: "churnRisk",
    fields: [
      { label: "Churn-risk status",    key: "status" },
      { label: "Churn risk driver",    key: "driver" },
      { label: "Mentioned to switch",  key: "mentionedToSwitch", format: "boolean" },
    ],
  },
  {
    id: "customerSentiment",
    title: "Customer sentiment",
    Icon: Heart,
    dataKey: "customerSentiment",
    fields: [
      { label: "Initial sentiment",   key: "initialSentiment" },
      { label: "Final sentiment",     key: "finalSentiment" },
      { label: "Pain point drivers",  key: "painPointDrivers" },
    ],
  },
  {
    id: "predictedCsat",
    title: "Predicted CSAT",
    Icon: Smile,
    dataKey: "predictedCsat",
    fields: [
      { label: "Satisfaction Rating", key: "satisfactionRating" },
    ],
  },
  {
    id: "flags",
    title: "Flags",
    Icon: Flag,
    dataKey: "flags",
    fields: [
      { label: "Agent Followup", key: "agentFollowup", format: "boolean" },
    ],
  },
  {
    id: "skillProficiency",
    title: "Skill Proficiency",
    Icon: Award,
    dataKey: "skillProficiency",
    fields: [
      { label: "Coaching recommendation", key: "coachingRecommendation", format: "boolean" },
    ],
  },
  {
    id: "interactionMetadata",
    title: "Interaction metadata",
    Icon: Info,
    dataKey: "interactionMetadata",
    fields: [
      { label: "Customer ID",                            key: "customerId" },
      { label: "Source",                                 key: "source" },
      { label: "External ID",                            key: "externalId" },
      { label: "Channel",                                key: "channel" },
      { label: "Direction",                              key: "direction" },
      { label: "LOB",                                    key: "lob" },
      { label: "Campaign",                               key: "campaign" },
      { label: "Product type",                           key: "productType" },
      { label: "Service",                                key: "service" },
      { label: "Sub-service",                            key: "subService" },
      { label: "Service provider location",              key: "serviceProviderLocation" },
      { label: "Customer seniority",                     key: "customerSeniority" },
      { label: "Last agent group",                       key: "lastAgentGroup" },
      { label: "Group",                                  key: "group" },
      { label: "Caller ID",                              key: "callerId" },
      { label: "Customer line tariff",                   key: "customerLineTariff" },
      { label: "Has commitment active",                  key: "hasCommitmentActive", format: "boolean" },
      { label: "Commitment period duration in months",   key: "commitmentPeriodDurationMonths" },
      { label: "Agent skill",                            key: "agentSkill" },
      { label: "Imported date",                          key: "importedDate" },
    ],
  },
];

function onApplyFilters(_draft) {
  // TODO: apply filters to the interactions query. Do NOT wire fetch here —
  // stub only; confirm the query/handler contract with Akash.
}

export default function InteractionsPage() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const totalPages = Math.ceil(TOTAL / PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [appliedFilters, setAppliedFilters] = React.useState(INITIAL_FILTERS);
  const filterBtnRef = React.useRef(null);

  // Lifted from InteractionsHeader so the empty-state branch and the
  // header's X-clear button share one source of truth + handler. `query`
  // tracks keystrokes; `debouncedQuery` lags by ~300ms and is what the
  // filter actually runs against — matches the spec's "fire the query"
  // debounce for when this is wired to a server-side fetch.
  const [query, setQuery] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const [attr, setAttr] = React.useState("customer");

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  // 🚩 FLAG — clearSearch scope. Clears query only by default; confirm
  // whether it should also reset the search attribute and applied filters.
  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  // Changing the search-by attribute clears whatever was typed for the
  // previous field — the old query no longer makes sense against the
  // new field. Debounced value is reset synchronously so the table
  // doesn't briefly show stale matches.
  const handleAttrChange = (id) => {
    setAttr(id);
    setQuery("");
    setDebouncedQuery("");
  };

  // Client-side filter against the chosen attribute. The selected attr's
  // `field` accessor pulls the value off the row; missing values are
  // coerced to "" so they never match a non-empty query.
  const filteredRows = React.useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return ROWS;
    const fieldOf = SEARCH_ATTRS.find((a) => a.id === attr)?.field || (() => "");
    return ROWS.filter((row) => String(fieldOf(row) || "").toLowerCase().includes(q));
  }, [debouncedQuery, attr]);

  const isSearchEmpty = debouncedQuery.trim() !== "" && filteredRows.length === 0;
  const isSearchActive = debouncedQuery.trim() !== "";

  // Count + pagination reflect the filtered set when a search is active.
  // (When inactive, fall back to TOTAL — the mock represents a server-side
  // count that ROWS only samples.) Clamp totalPages to at least 1 so the
  // "Page 1 of 1" footer renders correctly for the single-result case.
  const effectiveCount = isSearchActive ? filteredRows.length : TOTAL;
  const effectiveTotalPages = isSearchActive
    ? Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
    : totalPages;

  // Reset to page 1 when the query changes so a deep page (e.g. p.5) doesn't
  // strand the user on an out-of-range page after filtering down to <20 rows.
  React.useEffect(() => {
    setPage(1);
  }, [query]);

  const handleApply = (draft) => {
    setAppliedFilters(draft);
    onApplyFilters(draft);
    setFiltersOpen(false);
  };

  // Row click navigates to the interaction detail page (the full-canvas
  // Email Conversations + Insights / Quality / Feedback view). The
  // previous in-place row drawer is retired; navigation lives on
  // /insights/interaction/{interactionId}.
  const [selectedRowId, setSelectedRowId] = React.useState(null);
  const rowRefs = React.useRef({});

  const handleRowClick = (interactionId) => {
    if (!interactionId) return;
    router.push(`/insights/interaction/${interactionId}`);
  };

  const closeDetails = () => {
    const lastId = selectedRowId;
    setSelectedRowId(null);
    // Restore focus to the row the drawer was opened from.
    requestAnimationFrame(() => {
      const el = lastId && rowRefs.current[lastId];
      if (el && typeof el.focus === "function") el.focus();
    });
  };

  const selectedRow = selectedRowId
    ? filteredRows.find((r) => r.customerId === selectedRowId) ||
      ROWS.find((r) => r.customerId === selectedRowId)
    : null;

  // Email-channel drill-down. Clicking the Email icon on a row swaps the
  // listing for EmailConversationView; the Back button restores the listing.
  const [emailViewRow, setEmailViewRow] = React.useState(null);

  if (emailViewRow) {
    return (
      <EmailConversationView
        row={emailViewRow}
        onBack={() => setEmailViewRow(null)}
      />
    );
  }

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
        onAttrChange={handleAttrChange}
      />
      <Card padX={0} padY={0}>
        {isSearchEmpty ? (
          <SearchEmptyState onClear={clearSearch} />
        ) : (
          <>
            <Table
              rows={filteredRows}
              selectedRowId={selectedRowId}
              onRowClick={handleRowClick}
              rowRefs={rowRefs}
              onOpenEmail={setEmailViewRow}
            />
            <Pagination
              page={page}
              totalPages={effectiveTotalPages}
              totalCount={effectiveCount}
              onPageChange={setPage}
            />
          </>
        )}
      </Card>
      {filtersOpen && (
        <FiltersPanel
          appliedFilters={appliedFilters}
          onApply={handleApply}
          onClose={() => {
            setFiltersOpen(false);
            // Return focus to the trigger per drawer a11y conventions.
            if (filterBtnRef.current) filterBtnRef.current.focus();
          }}
        />
      )}
      {selectedRow && (
        <DetailsPanel row={selectedRow} onClose={closeDetails} />
      )}
    </div>
  );
}

function InteractionsHeader({
  filtersOpen, onToggleFilters, filterBtnRef,
  query, onQueryChange, onClearSearch, attr, onAttrChange,
}) {
  const [open, setOpen] = React.useState(false);
  const [menuRect, setMenuRect] = React.useState(null);
  const ddRef = React.useRef(null);
  const menuRef = React.useRef(null);
  const triggerRef = React.useRef(null);
  const selected = SEARCH_ATTRS.find((a) => a.id === attr) || SEARCH_ATTRS[0];

  // The header card wraps everything in overflow-hidden + rounded corners,
  // which clipped an absolutely-positioned menu's hit area. Use position:
  // fixed and compute coords from the trigger's bounding rect so the menu
  // escapes the wrapper entirely — same pattern as ChartTooltip /
  // SkillsPopover.
  React.useEffect(() => {
    if (!open) return undefined;
    const sync = () => {
      if (triggerRef.current) setMenuRect(triggerRef.current.getBoundingClientRect());
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      const insideTrigger = ddRef.current && ddRef.current.contains(e.target);
      const insideMenu = menuRef.current && menuRef.current.contains(e.target);
      if (!insideTrigger && !insideMenu) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Don't auto-focus the active item on open — that triggers a focus
  // background that reads as "selected" and clutters the plain list.
  // Arrow-down on the menu container moves focus to the first item; see
  // handleMenuKeyDown.

  // Arrow-key navigation + Esc within the menu. Enter on a focused item
  // fires the item's native onClick.
  const handleMenuKeyDown = (e) => {
    if (!open) return;
    const items = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]') || []);
    if (items.length === 0) return;
    const currentIdx = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      items[(currentIdx + 1 + items.length) % items.length].focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      items[(currentIdx - 1 + items.length) % items.length].focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      items[0].focus();
    } else if (e.key === "End") {
      e.preventDefault();
      items[items.length - 1].focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleTriggerKeyDown = (e) => {
    // Down arrow on a closed trigger opens the menu (standard combobox).
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
    }
  };

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
          Interactions
        </span>
      </div>

      {/* Search row */}
      <div className="h-12 flex items-center bg-white" style={{ padding: "0 12px 0 0" }}>
        <div className="flex-1 flex items-center gap-2" style={{ padding: "8px 0 8px 12px" }}>
          {/* Attribute dropdown.
              🚩 FLAG — no shared <Dropdown> primitive in this repo today.
              The same inline pattern lives in FiltersPanel's
              SingleSelectDropdown. Promote to a shared primitive once a
              3rd consumer appears so all three sites stay in lock-step. */}
          <div ref={ddRef} onKeyDown={handleMenuKeyDown}>
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen((o) => !o)}
              onKeyDown={handleTriggerKeyDown}
              aria-haspopup="menu"
              aria-expanded={open}
              className="flex items-center gap-2 h-8 px-3 rounded-md cursor-pointer"
              style={{
                background: "var(--pill-bg)",
                border: "1px solid var(--color-border-tab)",
                fontFamily: "var(--font-sans)",
              }}
            >
              <span className="text-[13px] font-semibold text-text-medium">
                {selected.label}
              </span>
              <ChevronDown size={14} className="text-text-tertiary" />
            </button>
          </div>
          {open && menuRect && (
            <div
              ref={menuRef}
              role="menu"
              aria-label="Search by"
              onKeyDown={handleMenuKeyDown}
              className="bg-white rounded-md overflow-hidden"
              style={{
                position: "fixed",
                top: menuRect.bottom + 4,
                left: menuRect.left,
                minWidth: 200,
                zIndex: 1000,
                boxShadow: "0 4px 12px rgba(15,20,60,0.10)",
                border: "1px solid var(--color-border-tab)",
              }}
            >
              {/* Plain list — every option styled identically. Selection
                  state lives only in aria-checked and the trigger label. */}
              {SEARCH_ATTRS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  role="menuitem"
                  aria-checked={a.id === attr}
                  onClick={() => {
                    onAttrChange(a.id);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className="block w-full text-left px-3 py-2 text-[13px] cursor-pointer hover:bg-pill-bg focus:bg-pill-bg"
                  style={{
                    fontFamily: "var(--font-sans)",
                    color: "var(--color-text-medium)",
                    fontWeight: 500,
                    background: "transparent",
                    outline: "none",
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}

          {/* Search input */}
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={`Search by ${selected.label}`}
            className="flex-1 bg-transparent border-none outline-none font-sans text-[14px] leading-[22px] text-text-medium placeholder:text-text-placeholder"
          />
          {/* Clear (X) — visible only when the query is non-empty. */}
          {query !== "" && (
            <button
              type="button"
              onClick={onClearSearch}
              aria-label="Clear search"
              className="w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer text-text-medium"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="flex items-center pl-2 border-l border-border-tab self-stretch">
          <button
            ref={filterBtnRef}
            type="button"
            onClick={onToggleFilters}
            aria-label="Filters"
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

function Table({ rows, selectedRowId, onRowClick, rowRefs, onOpenEmail }) {
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
                  textAlign: col.align,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(0,0,0,0.87)",
                  letterSpacing: "0.2px",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {col.label}
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
            <Row
              key={row.customerId + i}
              row={row}
              isLast={i === rows.length - 1}
              isSelected={selectedRowId === row.customerId}
              onClick={() => onRowClick && onRowClick(row.interactionId)}
              onOpenEmail={onOpenEmail ? () => onOpenEmail(row) : undefined}
              rowRef={(el) => {
                if (!rowRefs) return;
                if (el) rowRefs.current[row.customerId] = el;
                else delete rowRefs.current[row.customerId];
              }}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ row, isLast, isSelected, onClick, onOpenEmail, rowRef }) {
  const [hover, setHover] = React.useState(false);
  // Selected wins over hover for the tint. Use --pill-bg per spec for the
  // selected state; keep the existing translucent hover token for hover.
  const background = isSelected
    ? "var(--pill-bg)"
    : hover ? "rgba(0,0,0,0.02)" : "transparent";
  return (
    <tr
      ref={rowRef}
      tabIndex={0}
      aria-selected={isSelected ? true : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      onKeyDown={(e) => {
        // Enter / Space activate the row, mirroring native button keys.
        // Ignore events bubbling up from focused child controls (Skills
        // button, etc.) so a Skills-button activation doesn't double-fire
        // and also toggle the drawer.
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick && onClick();
        }
      }}
      style={{
        height: 56,
        borderBottom: isLast ? "none" : "1px solid #F0F2FA",
        background,
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
        <ChannelIcon channel={row.channel} onOpenEmail={onOpenEmail} />
      </Cell>
      <Cell>
        <span style={{ fontSize: 13, color: "var(--do-ink)", fontWeight: 500 }}>
          {formatDateTime(row.date)}
        </span>
      </Cell>
      <Cell>
        <AgentCell agent={row.agent} />
      </Cell>
      <Cell>
        <span style={{ fontSize: 13, color: "var(--do-ink)", fontWeight: 500 }}>
          {formatDuration(row.duration)}
        </span>
      </Cell>
      <Cell>
        <SentimentTag value={row.sentiment} />
      </Cell>
      <Cell>
        <QualityCell value={row.adherence} channel={row.channel} />
      </Cell>
      <Cell>
        <SkillsCell skills={row.skills} onOpenDetail={() => onSkillsClick(row)} />
      </Cell>
    </tr>
  );
}

function onSkillsClick(row) {
  // TODO: open skills detail. Target TBD (side curtain vs modal vs route) — confirm with Akash.
}

function Cell({ children, align = "left" }) {
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

function ChannelIcon({ channel, onOpenEmail }) {
  if (channel === "whatsapp") {
    return (
      <span
        title="WhatsApp"
        aria-label="WhatsApp"
        style={{ display: "inline-flex", alignItems: "center", color: "#25D366" }}
      >
        <WhatsappLogo size={18} weight="fill" />
      </span>
    );
  }
  if (channel === "sms" || channel === "chat") {
    return (
      <span
        title="SMS"
        aria-label="SMS"
        style={{ display: "inline-flex", alignItems: "center", color: "var(--color-text-medium)" }}
      >
        <MessageSquare size={18} />
      </span>
    );
  }
  if (channel === "email") {
    // Email is the only channel with a drill-down view today, so the icon
    // doubles as a button. stopPropagation keeps the row click (drawer)
    // from also firing.
    return (
      <button
        type="button"
        title={onOpenEmail ? "Open email conversation" : "Email"}
        aria-label={onOpenEmail ? "Open email conversation" : "Email"}
        onClick={onOpenEmail ? (e) => { e.stopPropagation(); onOpenEmail(); } : undefined}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          padding: 0,
          color: "var(--color-text-medium)",
          cursor: onOpenEmail ? "pointer" : "default",
        }}
      >
        <Mail size={18} />
      </button>
    );
  }
  return (
    <span
      title="Voice call"
      aria-label="Voice call"
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

function SentimentTag({ value }) {
  const map = {
    positive: { bg: "#EDF7ED", fg: "#1E4620", label: "Positive" },
    neutral:  { bg: "#F1F3F9", fg: "#5A5D72", label: "Neutral"  },
    negative: { bg: "#FDEDED", fg: "#5F2120", label: "Negative" },
    mixed:    { bg: "#FFF4E5", fg: "#663C00", label: "Mixed"    },
  };
  const s = map[value] || map.neutral;
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
      {s.label}
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
function SkillsCell({ skills, onOpenDetail }) {
  if (!skills || (skills.variant !== "tracked" && skills.variant !== "top")) {
    return <span style={{ color: "var(--color-text-placeholder)", fontSize: 13 }}>--</span>;
  }
  return <SkillsTrigger skills={skills} onOpenDetail={onOpenDetail} />;
}

function SkillsTrigger({ skills, onOpenDetail }) {
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
  const label = skills.variant === "top" ? "Top skill" : "Skills tracked";

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
function SkillsPopover({ rect, skills, onOpenDetail, onPointerEnter, onPointerLeave }) {
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
      aria-label="Skills detail"
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
            title="Strengths"
            items={skills.strengths}
            tone="brand"
          />
        )}
        {hasStrengths && hasNeeds && <div style={popStyles.divider} />}
        {hasNeeds && (
          <SkillsSection
            icon={<Quote size={14} color="var(--color-text-tertiary)" />}
            title="Needs Improvement"
            items={skills.needsImprovement}
            tone="muted"
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
          <span style={popStyles.ctaLabel}>Coaching recommendation</span>
        </button>
      </Card>
    </div>
  );
}

function SkillsSection({ icon, title, items, tone }) {
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
              {SKILL_REGISTRY[item.id]?.label ?? item.id}
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
    textAlign: "left",
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
function FiltersPanel({ appliedFilters, onApply, onClose }) {
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
    (s) => !query || s.label.toLowerCase().includes(query.trim().toLowerCase()),
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
      aria-label="Filters"
      tabIndex={-1}
      style={fpStyles.panel}
    >
      {/* Header */}
      <div style={fpStyles.header}>
        <span style={fpStyles.title}>Filters</span>
        <Button variant="icon" onClick={onClose} aria-label="Close filters">
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
          placeholder="Search by filter name"
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
          Deselect all
        </Button>
        <div style={{ display: "inline-flex", gap: 8 }}>
          <Button variant="text" uppercase={false} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            uppercase={false}
            disabled={!draftDirty}
            onClick={() => onApply(draft)}
            style={{ minWidth: 0, height: 32, paddingInline: 16, fontSize: 13 }}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ section, value, expanded, onToggleExpanded, onSetValue, onToggleMulti }) {
  // Date renders inline (row-level dropdown showing current preset, per
  // reference). Other types use the accordion-expand treatment.
  if (section.type === "single-select" && section.id === "date") {
    return (
      <div style={fpStyles.sectionRow}>
        <span style={fpStyles.sectionLabel}>{section.label}</span>
        <SingleSelectDropdown
          options={section.options}
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
          <span style={fpStyles.sectionLabel}>{section.label}</span>
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
                  {opt.label}
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
      title="Options pending"
    >
      <span style={fpStyles.sectionLabel}>{section.label}</span>
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
          className="absolute right-0 mt-1 bg-white rounded-md overflow-hidden z-50"
          style={{
            top: "calc(100% + 4px)",
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
              className="block w-full text-left px-3 py-2 text-[13px] hover:bg-pill-bg cursor-pointer"
              style={{
                fontFamily: "var(--font-sans)",
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
    right: 0,
    bottom: 0,
    width: FILTERS_DRAWER_WIDTH,
    background: "var(--surface-white)",
    borderLeft: "1px solid var(--color-divider-card)",
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
    textAlign: "left",
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
    textAlign: "left",
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
function SearchEmptyState({ onClear }) {
  return (
    <div style={emptyStyles.wrap}>
      <EmptyStateIllustration />
      <p style={emptyStyles.message}>No Interactions matched your search criteria.</p>
      <Button variant="primary" uppercase={false} onClick={onClear}>
        Clear search
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

// DetailsPanel — right drawer mirroring the FiltersPanel / PreviewStep
// precedent (fixed, --shadow-drawer, divider border, --surface-white).
// Non-modal, no scrim — the table behind stays interactive. Sticky
// header; only the body scrolls. Sections render from DETAIL_SECTIONS;
// missing values fall back to the DETAILS_SAMPLE mock so any row can
// demo the drawer.
//
// 🚩 FLAG — width. 440px sits between the FiltersPanel (320) and the
// Figma's 408, leaving comfortable room for the two-line field rows.
// Confirm exact width against the latest Figma.
// 🚩 FLAG — scrim. None today (matches FiltersPanel). Confirm whether the
// page should dim when the drawer opens.
// 🚩 FLAG — collapsibility. All sections render expanded in one scroll
// (matches the reference). If panels get long in practice, sections
// could become collapsible.
function DetailsPanel({ row, onClose }) {
  const panelRef = React.useRef(null);
  const details = row?.details || DETAILS_SAMPLE;

  // Focus into the panel on mount only — don't refocus on every render or
  // the user's clicks inside the panel will get stolen back to the root.
  React.useEffect(() => {
    if (panelRef.current) panelRef.current.focus();
  }, []);

  // Escape closes (matches FiltersPanel).
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Interaction details"
      tabIndex={-1}
      style={dpStyles.panel}
    >
      <div style={dpStyles.header}>
        <span style={dpStyles.title}>View details</span>
        <Button variant="icon" onClick={onClose} aria-label="Close details">
          <X size={18} />
        </Button>
      </div>
      <div style={dpStyles.body}>
        {DETAIL_SECTIONS.map((section, idx) => (
          <DetailSection
            key={section.id}
            section={section}
            data={details?.[section.dataKey]}
            isLast={idx === DETAIL_SECTIONS.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function DetailSection({ section, data, isLast }) {
  const Icon = section.Icon;
  return (
    <div style={dpStyles.section}>
      <div style={dpStyles.sectionHead}>
        {Icon ? <Icon size={16} color="var(--color-text-medium)" strokeWidth={2} /> : null}
        <span style={dpStyles.sectionTitle}>{section.title}</span>
      </div>
      <div style={dpStyles.fields}>
        {section.fields.map((field) => (
          <FieldRow
            key={field.key}
            label={field.label}
            value={formatDetailValue(data?.[field.key], field.format)}
          />
        ))}
      </div>
      {!isLast && <div style={dpStyles.divider} />}
    </div>
  );
}

function FieldRow({ label, value }) {
  const isPlaceholder = value === null;
  return (
    <div style={dpStyles.fieldRow}>
      <span style={dpStyles.fieldLabel}>{label}</span>
      <span
        style={{
          ...dpStyles.fieldValue,
          color: isPlaceholder ? "var(--color-text-placeholder)" : "var(--color-text-deep)",
        }}
      >
        {isPlaceholder ? "--" : value}
      </span>
    </div>
  );
}

// Format helper: booleans → Yes/No, null/empty → placeholder marker
// (caller renders "--"), everything else → String(value).
function formatDetailValue(raw, format) {
  if (raw === null || raw === undefined || raw === "") return null;
  if (format === "boolean") return raw ? "Yes" : "No";
  return String(raw);
}

const DETAILS_DRAWER_WIDTH = 440;

const dpStyles = {
  panel: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: DETAILS_DRAWER_WIDTH,
    background: "var(--surface-white)",
    borderLeft: "1px solid var(--color-divider-card)",
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
  body: {
    flex: 1,
    overflowY: "auto",
    paddingBlock: 8,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingInline: 20,
    paddingBlock: 16,
  },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  fields: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    paddingLeft: 24,
  },
  fieldRow: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  fieldLabel: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 12,
    color: "var(--color-text-tertiary)",
  },
  fieldValue: {
    fontFamily: '"Poppins", sans-serif',
    fontSize: 12,
  },
  divider: {
    height: 1,
    background: "var(--color-divider-card)",
    marginTop: 8,
  },
};

function Pagination({ page, totalPages, totalCount, onPageChange }) {
  const canPrev = page > 1;
  const canNext = page < totalPages;
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
      <div
        aria-live="polite"
        style={{ color: "var(--color-text-tertiary)", fontSize: 13, fontWeight: 500 }}
      >
        Total {totalCount.toLocaleString()} interactions
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <PageBtn ariaLabel="First page" disabled={!canPrev} onClick={() => onPageChange(1)}>
          <ChevronsLeft size={16} />
        </PageBtn>
        <span
          aria-live="polite"
          style={{ color: "var(--do-ink)", fontSize: 13, fontWeight: 500, padding: "0 4px" }}
        >
          Page {page} of {totalPages}
        </span>
        <PageBtn ariaLabel="Previous page" disabled={!canPrev} onClick={() => canPrev && onPageChange(page - 1)}>
          <ChevronLeft size={16} />
        </PageBtn>
        <PageBtn ariaLabel="Next page" disabled={!canNext} onClick={() => canNext && onPageChange(page + 1)}>
          <ChevronRight size={16} />
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

function formatDuration({ h = 0, m = 0, s = 0 }) {
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0 && s === 0) return `${m}m 0s`;
  return `${m}m ${s}s`;
}

