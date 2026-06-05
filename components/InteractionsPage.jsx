"use client";

import React from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  Phone,
  MessageCircle,
  MessageSquare,
  Mail,
  Settings,
  ClipboardList,
  Radar,
  Trophy,
  SlidersHorizontal,
} from "lucide-react";
import Card from "./Card";
import { formatDateTime } from "./formatDate";

// ⚠️ You said "don't rename" but the reference header reads "Quality".
// Default below follows the image. If you meant keep the proto label,
// change this single string to "Adherence".
const QUALITY_HEADER = "Quality";

const TOTAL = 6811;
const PAGE_SIZE = 20;

const SEARCH_ATTRS = [
  { id: "customer", label: "Customer ID" },
  { id: "agent",    label: "Agent Name"  },
  { id: "reason",   label: "Contact Reason" },
];

const ROWS = [
  { customerId: "1CFEA2", channel: "voice",    date: "2026-05-07T16:50:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 1, s: 51 }, sentiment: "negative", adherence: null, skills: null      },
  { customerId: "EB236D", channel: "whatsapp", date: "2026-05-07T04:40:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 1, s: 19 }, sentiment: "neutral",  adherence: 78,   skills: "tracked" },
  { customerId: "CA1484", channel: "voice",    date: "2026-05-05T17:25:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 1, s: 44 }, sentiment: "positive", adherence: 91,   skills: "tracked" },
  { customerId: "53611D", channel: "whatsapp", date: "2026-04-30T06:35:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 2, s: 5 },  sentiment: "mixed",    adherence: 69,   skills: "top"     },
  { customerId: "CACA53", channel: "sms",      date: "2026-04-30T06:33:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 1, s: 1 },  sentiment: "mixed",    adherence: 58,   skills: null      },
  { customerId: "020A31", channel: "voice",    date: "2026-04-29T18:44:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 2, s: 17 }, sentiment: "positive", adherence: 92,   skills: "tracked" },
  { customerId: "9492B2", channel: "whatsapp", date: "2026-04-28T14:12:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 2, s: 56 }, sentiment: "negative", adherence: 28,   skills: null      },
  { customerId: "1EA06C", channel: "sms",      date: "2026-04-22T21:18:00Z", agent: { initials: "AT", name: "Akash Trainee" },    duration: { h: 0, m: 2, s: 26 }, sentiment: "positive", adherence: 70,   skills: null      },
  { customerId: "A85CF1", channel: "email",    date: "2026-04-22T17:30:00Z", agent: { initials: "AL", name: "Aliasgar Trainee" }, duration: { h: 0, m: 0, s: 28 }, sentiment: "positive", adherence: 81,   skills: null      },
  { customerId: "300C85", channel: "voice",    date: "2026-04-17T17:22:00Z", agent: { initials: "KO", name: "Konecta Partner" },  duration: { h: 0, m: 2, s: 0 },  sentiment: "negative", adherence: 83,   skills: "top"     },
  { customerId: "B61007", channel: "whatsapp", date: "2026-04-17T17:20:00Z", agent: { initials: "KO", name: "Konecta Partner" },  duration: { h: 0, m: 0, s: 15 }, sentiment: "negative", adherence: 40,   skills: null      },
  { customerId: "23F1F4", channel: "voice",    date: "2026-04-17T13:57:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 0, s: 13 }, sentiment: "negative", adherence: null, skills: null      },
  { customerId: "FC5A2C", channel: "voice",    date: "2026-04-17T13:57:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 0, s: 13 }, sentiment: "negative", adherence: null, skills: null      },
  { customerId: "A92F18", channel: "whatsapp", date: "2026-04-15T10:11:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 1, s: 32 }, sentiment: "positive", adherence: 84,   skills: "tracked" },
  { customerId: "DE3422", channel: "voice",    date: "2026-04-13T09:05:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 0, s: 47 }, sentiment: "neutral",  adherence: null, skills: null      },
  { customerId: "FF7A09", channel: "whatsapp", date: "2026-04-12T11:48:00Z", agent: { initials: "AK", name: "Akash S" },          duration: { h: 0, m: 3, s: 18 }, sentiment: "positive", adherence: 84,   skills: "tracked" },
  { customerId: "60AAB2", channel: "voice",    date: "2026-04-09T13:21:00Z", agent: { initials: "KO", name: "Konecta Partner" },  duration: { h: 0, m: 0, s: 54 }, sentiment: "negative", adherence: 33,   skills: "top"     },
  { customerId: "112233", channel: "sms",      date: "2026-04-08T15:00:00Z", agent: { initials: "AL", name: "Aliasgar Trainee" }, duration: { h: 0, m: 2, s: 1 },  sentiment: "neutral",  adherence: 68,   skills: null      },
  { customerId: "B7C9D0", channel: "whatsapp", date: "2026-04-05T19:33:00Z", agent: { initials: "AT", name: "Akash Trainee" },    duration: { h: 0, m: 1, s: 28 }, sentiment: "mixed",    adherence: 65,   skills: null      },
  { customerId: "5510EF", channel: "voice",    date: "2026-04-03T08:15:00Z", agent: { initials: "GA", name: "G Agent" },          duration: { h: 0, m: 2, s: 12 }, sentiment: "positive", adherence: null, skills: null      },
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

export default function InteractionsPage() {
  const [page, setPage] = React.useState(1);
  const totalPages = Math.ceil(TOTAL / PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6 w-full">
      <InteractionsHeader />
      <Card padX={0} padY={0}>
        <Table rows={ROWS} />
        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={TOTAL}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}

function InteractionsHeader() {
  const [attr, setAttr] = React.useState("customer");
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const ddRef = React.useRef(null);
  const selected = SEARCH_ATTRS.find((a) => a.id === attr) || SEARCH_ATTRS[0];

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
          Interactions
        </span>
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
                {selected.label}
              </span>
              <ChevronDown size={14} className="text-text-tertiary" />
            </button>
            {open && (
              <div
                className="absolute left-0 mt-1 bg-white rounded-md overflow-hidden z-50"
                style={{
                  top: "calc(100% + 4px)",
                  minWidth: 160,
                  boxShadow: "0 4px 12px rgba(15,20,60,0.10)",
                  border: "1px solid var(--color-border-tab)",
                }}
              >
                {SEARCH_ATTRS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => { setAttr(a.id); setOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-[13px] hover:bg-pill-bg cursor-pointer"
                    style={{
                      fontFamily: "var(--font-sans)",
                      color: a.id === attr ? "var(--color-text-tab-active)" : "var(--color-text-medium)",
                      fontWeight: a.id === attr ? 600 : 500,
                      background: a.id === attr ? "var(--pill-bg)" : "transparent",
                    }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search by ${selected.label}`}
            className="flex-1 bg-transparent border-none outline-none font-sans text-[14px] leading-[22px] text-text-medium placeholder:text-text-placeholder"
          />
        </div>
        <div className="flex items-center pl-2 border-l border-border-tab self-stretch">
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center bg-transparent border-none cursor-pointer text-text-medium"
            aria-label="Filter"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Table({ rows }) {
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
            <Row key={row.customerId + i} row={row} isLast={i === rows.length - 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ row, isLast }) {
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
        <ChannelIcon channel={row.channel} />
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
        <SkillsCell skills={row.skills} onClick={() => onSkillsClick(row)} />
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

function ChannelIcon({ channel }) {
  if (channel === "whatsapp") {
    return (
      <span
        title="WhatsApp"
        aria-label="WhatsApp"
        style={{ display: "inline-flex", alignItems: "center", color: "#25D366" }}
      >
        <MessageCircle size={18} fill="#25D366" stroke="#FFFFFF" strokeWidth={1.5} />
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
    return (
      <span
        title="Email"
        aria-label="Email"
        style={{ display: "inline-flex", alignItems: "center", color: "var(--color-text-medium)" }}
      >
        <Mail size={18} />
      </span>
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

function SkillsCell({ skills, onClick }) {
  // 🚩 FLAG for Akash: (a) The meaning of radar vs. trophy isn't derivable from
  // the reference — confirm semantics (e.g. radar = skills tracked on the call,
  // trophy = top-performer / appreciation moment). (b) Confirm the detail target
  // so the stub can be wired to the house pattern.
  if (skills !== "tracked" && skills !== "top") {
    return <span style={{ color: "var(--color-text-placeholder)", fontSize: 13 }}>--</span>;
  }
  const Icon = skills === "top" ? Trophy : Radar;
  const label = skills === "top" ? "Top skill" : "Skills tracked";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
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
  );
}

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
      <div style={{ color: "var(--color-text-tertiary)", fontSize: 13, fontWeight: 500 }}>
        Total {totalCount.toLocaleString()} Interactions
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

