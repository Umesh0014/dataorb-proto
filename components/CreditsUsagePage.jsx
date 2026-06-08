"use client";

import React from "react";
import { Gauge, Search, Download, Info, ChevronsLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import Toggle from "./Toggle";
import PageHeader from "./PageHeader";
import DarkPillSwitcher from "./DarkPillSwitcher";
import { CREDITS_USAGE_SAMPLE } from "./SettingsPage";

// CreditsUsagePage — Credits & Usage admin surface.
//
// Page order (Patch 8 roadmap):
//   0. Contract-terms info banner
//   1. Tenant usage — observability only (P0.3). NOT a governance pool;
//      no thresholds, no block-at-100%, no forecast.
//   2. Agent weekly quota — configurable default (P0.1)
//   3. Quota-exceeded request routing
//   4. Agent limits — per-agent override table (P0.2)
//   5. Billing behavior — P1 scaffold (hard-stop vs continue-overage)
//   6. Usage report — P1 scaffold (CSV export concept)
//
// Enforcement model: consumption is *shown* at tenant level, *enforced*
// at agent level via the weekly quota + per-agent overrides. Billing is
// contractual. Partner-level pooling is a separate master-admin surface
// (not built here).

const DEFAULT_WEEKLY_QUOTA = 30;
const PAGE_SIZE = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---- Sample / stub data ---------------------------------------------------

const TENANT_USAGE_SAMPLE = {
  contractedMinutes: CREDITS_USAGE_SAMPLE.poolMinutes,
  usedThisPeriod: 9100,
  activeAgents: 18,
  totalAgents: 22,
  periodLabel: "This week",
};

const TREND_DATA = [
  { label: "W1", value: 1200 },
  { label: "W2", value: 1800 },
  { label: "W3", value: 2100 },
  { label: "W4", value: 1950 },
  { label: "W5", value: 2400 },
];

const AGENTS_SAMPLE = [
  { id: 1, name: "Priya Sharma", email: "priya.sharma@eci.com", hasCustom: false, limit: 30 },
  { id: 2, name: "Rahul Verma", email: "rahul.verma@eci.com", hasCustom: true, limit: 45 },
  { id: 3, name: "Anita Desai", email: "anita.desai@eci.com", hasCustom: false, limit: 30 },
  { id: 4, name: "Vikram Patel", email: "vikram.patel@eci.com", hasCustom: true, limit: 60 },
  { id: 5, name: "Meera Joshi", email: "meera.joshi@eci.com", hasCustom: false, limit: 30 },
  { id: 6, name: "Arjun Nair", email: "arjun.nair@eci.com", hasCustom: false, limit: 30 },
  { id: 7, name: "Kavita Singh", email: "kavita.singh@eci.com", hasCustom: true, limit: 20 },
  { id: 8, name: "Deepak Gupta", email: "deepak.gupta@eci.com", hasCustom: false, limit: 30 },
  { id: 9, name: "Sneha Reddy", email: "sneha.reddy@eci.com", hasCustom: false, limit: 30 },
  { id: 10, name: "Karan Mehta", email: "karan.mehta@eci.com", hasCustom: true, limit: 50 },
  { id: 11, name: "Pooja Iyer", email: "pooja.iyer@eci.com", hasCustom: false, limit: 30 },
  { id: 12, name: "Sanjay Rao", email: "sanjay.rao@eci.com", hasCustom: false, limit: 30 },
  { id: 13, name: "Neha Kulkarni", email: "neha.kulkarni@eci.com", hasCustom: true, limit: 40 },
  { id: 14, name: "Amit Choudhary", email: "amit.choudhary@eci.com", hasCustom: false, limit: 30 },
  { id: 15, name: "Divya Menon", email: "divya.menon@eci.com", hasCustom: false, limit: 30 },
  { id: 16, name: "Rohit Saxena", email: "rohit.saxena@eci.com", hasCustom: true, limit: 25 },
  { id: 17, name: "Ananya Bose", email: "ananya.bose@eci.com", hasCustom: false, limit: 30 },
  { id: 18, name: "Manish Agarwal", email: "manish.agarwal@eci.com", hasCustom: false, limit: 30 },
  { id: 19, name: "Shreya Pillai", email: "shreya.pillai@eci.com", hasCustom: true, limit: 55 },
  { id: 20, name: "Gaurav Bhat", email: "gaurav.bhat@eci.com", hasCustom: false, limit: 30 },
  { id: 21, name: "Ritu Malhotra", email: "ritu.malhotra@eci.com", hasCustom: false, limit: 30 },
  { id: 22, name: "Varun Khanna", email: "varun.khanna@eci.com", hasCustom: true, limit: 35 },
];

// ---- Main component -------------------------------------------------------

const MODES = ["M1", "M2"];

export default function CreditsUsagePage({ onBack }) {
  // Demo-only variant: M1 is a strict subset of M2 (the current full page).
  // Defaults to M1; M2-only blocks render conditionally below.
  const [mode, setMode] = React.useState("M1");
  const [weeklyQuota, setWeeklyQuota] = React.useState(DEFAULT_WEEKLY_QUOTA);
  const [routingEmail, setRoutingEmail] = React.useState("");
  const [agents, setAgents] = React.useState(AGENTS_SAMPLE);
  const [agentSearch, setAgentSearch] = React.useState("");
  const [billingMode, setBillingMode] = React.useState("continue");

  const emailError =
    routingEmail.trim() && !EMAIL_RE.test(routingEmail.trim())
      ? "Enter a valid email address."
      : null;

  const handleSave = () => {
    if (emailError) return;
    console.log("save credits & usage settings");
  };

  const toggleAgentCustom = (id) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, hasCustom: !a.hasCustom, limit: a.hasCustom ? weeklyQuota : a.limit }
          : a,
      ),
    );
  };

  const setAgentLimit = (id, limit) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, limit: Number(limit) || 0 } : a)),
    );
  };

  const filteredAgents = agents.filter(
    (a) =>
      !agentSearch ||
      a.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(agentSearch.toLowerCase()),
  );

  return (
    <div style={styles.column}>
      <PageHeader
        back={onBack}
        identifier={{
          icon: <Gauge size={16} color="var(--color-icon-tertiary-fg)" />,
          label: "Credits & Usage",
          iconBg: "var(--color-icon-tertiary-bg)",
          iconColor: "var(--color-icon-tertiary-fg)",
        }}
        subtitle="Manage practice capacity, agent quotas, and usage visibility for your tenant."
      />

      <InfoBanner />
      <TenantUsageSection mode={mode} />

      {mode === "M2" ? (
        <div style={styles.pairRow}>
          <AgentWeeklyQuotaSection value={weeklyQuota} onChange={setWeeklyQuota} />
          <RequestRoutingSection
            value={routingEmail}
            onChange={setRoutingEmail}
            error={emailError}
          />
        </div>
      ) : (
        <AgentWeeklyQuotaSection value={weeklyQuota} onChange={setWeeklyQuota} standalone />
      )}

      <AgentLimitsSection
        agents={filteredAgents}
        totalCount={agents.length}
        search={agentSearch}
        onSearchChange={setAgentSearch}
        defaultQuota={weeklyQuota}
        onToggleCustom={toggleAgentCustom}
        onSetLimit={setAgentLimit}
      />

      {mode === "M2" && (
        <div style={styles.pairRow}>
          <BillingBehaviorSection mode={billingMode} onChange={setBillingMode} />
          <UsageReportSection />
        </div>
      )}

      <div style={styles.actionRow}>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={Boolean(emailError)}
          style={{ height: 36, paddingInline: 20 }}
        >
          Save changes
        </Button>
      </div>

      <div style={styles.switcherWrap}>
        <DarkPillSwitcher
          ariaLabel="Credits & Usage variant switcher"
          value={mode}
          options={MODES}
          onChange={setMode}
        />
      </div>
    </div>
  );
}

// ---- Contract-terms info banner -------------------------------------------

function InfoBanner() {
  return (
    <div style={styles.infoBanner}>
      <Info size={14} color="var(--color-icon-tertiary-fg)" style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={styles.infoBannerText}>
        Practice minutes for this tenant are assigned and any over-usage is
        governed as per your contract terms.
      </span>
    </div>
  );
}

// ---- Section — Tenant usage (P0.3, observability only) --------------------

function TenantUsageSection({ mode }) {
  const { contractedMinutes, usedThisPeriod, activeAgents, totalAgents, periodLabel } =
    TENANT_USAGE_SAMPLE;
  const hrs = Math.round(contractedMinutes / 60);

  return (
    <Section
      title="Tenant usage"
      description="Practice minutes used across all agents this period."
    >
      <div style={styles.metricRow}>
        <MetricTile
          label="Contracted capacity"
          value={`${contractedMinutes.toLocaleString()} min`}
          sub={`${hrs.toLocaleString()} hrs · set by Ops`}
          chipLabel="Contracted"
        />
        {mode === "M2" && (
          <MetricTile
            label={`Used · ${periodLabel}`}
            value={`${usedThisPeriod.toLocaleString()} min`}
            sub="Across Roleplay, Guide, and Probe"
          />
        )}
        <MetricTile
          label="Active agents"
          value={`${activeAgents} of ${totalAgents}`}
          sub={`Practiced ${periodLabel.toLowerCase()}`}
        />
      </div>
      {mode === "M2" && <UsageTrendChart data={TREND_DATA} />}
    </Section>
  );
}

function MetricTile({ label, value, sub, chipLabel }) {
  return (
    <div style={styles.metricTile}>
      <span style={styles.metricTileLabel}>{label}</span>
      <div style={styles.metricTileValueRow}>
        <span style={styles.metricTileValue}>{value}</span>
        {chipLabel && <span style={styles.chip}>{chipLabel}</span>}
      </div>
      {sub && <span style={styles.metricTileSub}>{sub}</span>}
    </div>
  );
}

function UsageTrendChart({ data }) {
  const W = 600;
  const H = 72;
  const PAD_L = 24;
  const PAD_R = 24;
  const PAD_T = 8;
  const PAD_B = 16;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const maxVal = Math.max(...data.map((d) => d.value));

  const points = data.map((d, i) => ({
    x: PAD_L + (i / (data.length - 1)) * chartW,
    y: PAD_T + chartH - (d.value / maxVal) * chartH * 0.9,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD_T + chartH} L ${PAD_L} ${PAD_T + chartH} Z`;

  return (
    <div style={styles.trendWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={styles.trendSvg} aria-label="Usage trend chart">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-icon-tertiary-fg)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-icon-tertiary-fg)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#trendFill)" />
        <path d={linePath} fill="none" stroke="var(--color-icon-tertiary-fg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="#fff" stroke="var(--color-icon-tertiary-fg)" strokeWidth="1.5" />
        ))}
        {data.map((d, i) => (
          <text key={i} x={points[i].x} y={H - 1} textAnchor="middle" style={{ fontSize: 7, fill: "var(--color-text-tertiary)", fontFamily: "var(--font-sans)" }}>
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ---- Section — Agent weekly quota (P0.1, existing) ------------------------

function AgentWeeklyQuotaSection({ value, onChange, standalone }) {
  return (
    <Section
      title="Agent weekly quota"
      description="Set how many practice minutes each agent can use per week across Roleplay, Guide, and Probe."
      style={standalone ? undefined : styles.pairCard}
    >
      <Field label="Default quota">
        <NumberInput
          value={value}
          onChange={onChange}
          suffix="min / week per agent"
          ariaLabel="Default weekly quota minutes"
        />
        <p style={styles.fieldNote}>
          This single quota covers all Learning Hub activities — Roleplay,
          Guide, and Probe — for each agent.
        </p>
      </Field>
    </Section>
  );
}

// ---- Section — Quota-exceeded request routing (existing) ------------------

function RequestRoutingSection({ value, onChange, error }) {
  return (
    <Section
      title="Quota-exceeded requests"
      description="When an agent exhausts their weekly quota, requests for additional minutes are routed here."
      style={styles.pairCard}
    >
      <Field label="Email address">
        <EmailInput
          value={value}
          onChange={onChange}
          placeholder="admin@yourcompany.example"
          ariaLabel="Request routing email address"
          hasError={Boolean(error)}
        />
        {error && <InlineError message={error} />}
        <p style={styles.fieldNote}>
          Teams-based routing is coming — once you organize agents into Teams,
          requests will route to the relevant team lead automatically.
        </p>
      </Field>
    </Section>
  );
}

// ---- Section — Agent limits / per-agent overrides (P0.2) ------------------

function AgentLimitsSection({
  agents,
  totalCount,
  search,
  onSearchChange,
  defaultQuota,
  onToggleCustom,
  onSetLimit,
}) {
  const [page, setPage] = React.useState(1);

  // Reset to the first page when the search term changes, so filtered
  // results aren't hidden behind a stale page index. Adjusting state during
  // render (rather than in an effect) avoids a cascading re-render.
  const [prevSearch, setPrevSearch] = React.useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(agents.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = agents.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const goToPage = (next) => setPage(Math.min(Math.max(1, next), totalPages));

  return (
    <Section
      title="Agent limits"
      description="Override the default weekly quota for individual agents."
      headerRight={
        <span style={styles.countBadge}>{totalCount} agents</span>
      }
    >
      <div style={styles.searchRow}>
        <label style={styles.searchWrap}>
          <Search size={14} color="var(--color-text-tertiary)" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or email…"
            aria-label="Search agents"
            style={styles.searchInput}
          />
        </label>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: "28%" }}>Name</th>
              <th style={{ ...styles.th, width: "32%" }}>Email</th>
              <th style={{ ...styles.th, width: "16%", textAlign: "center" }}>Custom limit</th>
              <th style={{ ...styles.th, width: "24%" }}>Limit (min/wk)</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((agent) => (
              <tr key={agent.id} style={styles.tr}>
                <td style={styles.td}>
                  <span style={styles.agentName}>{agent.name}</span>
                </td>
                <td style={styles.td}>
                  <span style={styles.agentEmail}>{agent.email}</span>
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  <Toggle
                    enabled={agent.hasCustom}
                    onChange={() => onToggleCustom(agent.id)}
                    ariaLabel={`Override default quota for ${agent.name}`}
                  />
                </td>
                <td style={styles.td}>
                  {agent.hasCustom ? (
                    <NumberInput
                      value={agent.limit}
                      onChange={(v) => onSetLimit(agent.id, v)}
                      ariaLabel={`Custom limit for ${agent.name}`}
                    />
                  ) : (
                    <span style={styles.defaultChip}>{defaultQuota} default</span>
                  )}
                </td>
              </tr>
            ))}
            {agents.length === 0 && (
              <tr>
                <td colSpan={4} style={{ ...styles.td, textAlign: "center", color: "var(--color-text-tertiary)" }}>
                  No agents match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {agents.length > PAGE_SIZE && (
          <div style={styles.pageFooter}>
            <div style={styles.pageCtrls}>
              <PageBtn ariaLabel="First page" disabled={safePage <= 1} onClick={() => goToPage(1)}>
                <ChevronsLeft size={16} />
              </PageBtn>
              <span style={styles.pageLabel} aria-live="polite">
                Page {safePage} of {totalPages}
              </span>
              <PageBtn ariaLabel="Previous page" disabled={safePage <= 1} onClick={() => goToPage(safePage - 1)}>
                <ChevronLeft size={16} />
              </PageBtn>
              <PageBtn ariaLabel="Next page" disabled={safePage >= totalPages} onClick={() => goToPage(safePage + 1)}>
                <ChevronRight size={16} />
              </PageBtn>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

// ---- Section — Billing behavior (P1.1 scaffold) --------------------------

function BillingBehaviorSection({ mode, onChange }) {
  return (
    <Section
      title="Billing behavior"
      description="Choose how the platform responds when the tenant's contracted capacity is reached."
      headerRight={<P1Badge />}
      style={styles.pairCard}
    >
      <div style={styles.segmentedWrap}>
        <SegmentedOption
          selected={mode === "hard_stop"}
          onClick={() => onChange("hard_stop")}
          label="Hard stop"
          description="New practice sessions are blocked until renewal or top-up."
        />
        <SegmentedOption
          selected={mode === "continue"}
          onClick={() => onChange("continue")}
          label="Continue & bill overage"
          description="Sessions continue; overage is billed per contract terms."
        />
      </div>
      <p style={styles.fieldNote}>
        Enforcement wiring is a future build — this setting captures the
        tenant's billing preference for dev handoff.
      </p>
    </Section>
  );
}

function SegmentedOption({ selected, onClick, label, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        ...styles.segOption,
        borderColor: selected ? "var(--color-icon-tertiary-fg)" : "var(--color-border-card-soft)",
        background: selected ? "var(--color-icon-tertiary-bg)" : "#FFFFFF",
      }}
    >
      <span style={styles.segDot}>
        {selected && <span style={styles.segDotInner} />}
      </span>
      <div style={styles.segText}>
        <span style={styles.segLabel}>{label}</span>
        <span style={styles.segDesc}>{description}</span>
      </div>
    </button>
  );
}

// ---- Section — Usage report (P1.3 scaffold) ------------------------------

function UsageReportSection() {
  return (
    <Section
      title="Usage report"
      description="Per-agent and per-activity consumption over a selectable period, exportable as CSV."
      headerRight={<P1Badge />}
      style={styles.pairCard}
    >
      <div style={styles.reportPreview}>
        <div style={styles.reportColumns}>
          {["Agent name", "Roleplay (min)", "Guide (min)", "Probe (min)", "Total (min)", "Period"].map(
            (col) => (
              <span key={col} style={styles.reportCol}>{col}</span>
            ),
          )}
        </div>
        <div style={styles.reportPlaceholder}>
          Report data will populate here once wiring is connected.
        </div>
      </div>
      <Button
        variant="secondary"
        disabled
        style={{ height: 32, paddingInline: 14, fontSize: 12, opacity: 0.5 }}
      >
        <Download size={13} style={{ marginRight: 6 }} />
        Export CSV
      </Button>
    </Section>
  );
}

// ---- Shared primitives ----------------------------------------------------

function P1Badge() {
  return <span style={styles.p1Badge}>Coming soon</span>;
}

function Section({ title, description, children, style, headerRight }) {
  return (
    <Card padX={0} padY={0} style={{ ...styles.sectionCard, ...style }}>
      <header style={styles.sectionHeader}>
        <div style={styles.sectionTitleBlock}>
          <h2 style={styles.sectionTitle}>{title}</h2>
          {description && <p style={styles.sectionDescription}>{description}</p>}
        </div>
        {headerRight}
      </header>
      <div style={styles.sectionBody}>{children}</div>
    </Card>
  );
}

function Field({ label, children }) {
  return (
    <div style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      <div style={styles.fieldBody}>{children}</div>
    </div>
  );
}

function NumberInput({ value, onChange, suffix, ariaLabel }) {
  return (
    <label style={styles.numberInput}>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        aria-label={ariaLabel}
        style={styles.numberInputField}
      />
      {suffix && <span style={styles.numberInputSuffix}>{suffix}</span>}
    </label>
  );
}

function EmailInput({ value, onChange, placeholder, ariaLabel, hasError }) {
  return (
    <input
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      aria-invalid={hasError || undefined}
      style={{
        ...styles.emailInput,
        borderColor: hasError ? "var(--color-error)" : "var(--color-border-card-soft)",
      }}
    />
  );
}

function InlineError({ message }) {
  return (
    <div style={styles.inlineError} role="alert">
      {message}
    </div>
  );
}

function PageBtn({ children, onClick, disabled, ariaLabel }) {
  return (
    <Button variant="icon" size="sm" aria-label={ariaLabel} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  );
}

// ---- Styles ---------------------------------------------------------------

const styles = {
  column: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    width: "100%",
    fontFamily: "var(--font-sans)",
  },

  // Side-by-side pair (agent quota + request routing)
  pairRow: {
    display: "flex",
    gap: 16,
    alignItems: "stretch",
  },
  pairCard: {
    flex: 1,
    minWidth: 0,
  },

  // Section / card
  sectionCard: {
    border: "1px solid var(--color-border-card-soft)",
    display: "flex",
    flexDirection: "column",
  },
  sectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    padding: "16px 20px",
    borderBottom: "1px solid #F9F9FF",
  },
  sectionTitleBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 14,
    fontWeight: 600,
    lineHeight: "22px",
    color: "var(--color-text-deep)",
  },
  sectionDescription: {
    margin: 0,
    fontSize: 12,
    fontWeight: 400,
    lineHeight: "18px",
    color: "var(--color-text-tertiary)",
  },
  sectionBody: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    padding: 20,
  },

  // Info banner
  infoBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 10,
    background: "var(--color-icon-tertiary-bg)",
    border: "1px solid rgba(102, 80, 165, 0.12)",
  },
  infoBannerText: {
    fontSize: 12,
    fontWeight: 500,
    lineHeight: "18px",
    color: "var(--color-text-medium)",
  },

  // Metric tiles row
  metricRow: {
    display: "flex",
    gap: 12,
  },
  metricTile: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "12px 16px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 12,
    background: "#FFFFFF",
  },
  metricTileLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--color-text-tertiary)",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  metricTileValueRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  metricTileValue: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: "28px",
    color: "var(--color-text-deep)",
    fontVariantNumeric: "tabular-nums",
  },
  metricTileSub: {
    fontSize: 11,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
  },
  chip: {
    padding: "2px 8px",
    borderRadius: 999,
    background: "var(--color-icon-tertiary-bg)",
    color: "var(--color-icon-tertiary-fg)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.2px",
  },

  // Trend chart
  trendWrap: {
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
  },
  trendSvg: {
    width: "100%",
    height: "auto",
    display: "block",
  },

  // Field row
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  fieldBody: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-start",
  },
  fieldNote: {
    margin: 0,
    fontSize: 12,
    fontWeight: 400,
    lineHeight: "18px",
    color: "var(--color-text-tertiary)",
  },

  // Number input
  numberInput: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
    cursor: "text",
  },
  numberInputField: {
    width: 80,
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 600,
    color: "var(--color-text-deep)",
    background: "transparent",
    appearance: "textfield",
  },
  numberInputSuffix: {
    fontSize: 12,
    color: "var(--color-text-tertiary)",
    whiteSpace: "nowrap",
  },

  // Email input
  emailInput: {
    width: "100%",
    maxWidth: 360,
    padding: "8px 12px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 120ms ease",
  },

  // Inline error
  inlineError: {
    padding: "8px 12px",
    borderRadius: 8,
    background: "var(--color-error-bg)",
    color: "var(--color-error)",
    fontSize: 12,
    fontWeight: 500,
    lineHeight: "18px",
  },

  // Agent limits — search
  searchRow: {
    display: "flex",
    gap: 12,
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flex: 1,
    maxWidth: 320,
    padding: "7px 12px",
    border: "1px solid var(--color-border-card-soft)",
    borderRadius: 8,
    background: "#FFFFFF",
    cursor: "text",
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 400,
    color: "var(--color-text-deep)",
    background: "transparent",
  },
  countBadge: {
    padding: "3px 10px",
    borderRadius: 999,
    background: "#F3F4F6",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    whiteSpace: "nowrap",
  },

  // Agent limits — table
  tableWrap: {
    borderRadius: 8,
    border: "1px solid var(--color-border-card-soft)",
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    padding: "10px 14px",
    fontWeight: 600,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.3px",
    color: "var(--color-text-tertiary)",
    background: "#FAFBFC",
    borderBottom: "1px solid var(--color-border-card-soft)",
    textAlign: "left",
  },
  tr: {
    borderBottom: "1px solid #F5F5F7",
  },
  td: {
    padding: "10px 14px",
    verticalAlign: "middle",
  },
  agentName: {
    fontWeight: 600,
    color: "var(--color-text-deep)",
    fontSize: 13,
  },
  agentEmail: {
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    fontSize: 12,
  },
  defaultChip: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 999,
    background: "#F3F4F6",
    color: "var(--color-text-tertiary)",
    fontSize: 12,
    fontWeight: 500,
  },

  // Agent limits — pagination footer
  pageFooter: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: "10px 14px",
    borderTop: "1px solid var(--color-border-card-soft)",
  },
  pageCtrls: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  pageLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-deep)",
    padding: "0 4px",
    fontVariantNumeric: "tabular-nums",
  },

  // Billing behavior — segmented options
  segmentedWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  segOption: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 10,
    border: "1.5px solid",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    transition: "border-color 120ms ease, background 120ms ease",
  },
  segDot: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    border: "2px solid var(--color-icon-tertiary-fg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  segDotInner: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "var(--color-icon-tertiary-fg)",
  },
  segText: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  segLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--color-text-deep)",
  },
  segDesc: {
    fontSize: 12,
    fontWeight: 400,
    color: "var(--color-text-tertiary)",
    lineHeight: "18px",
  },

  // Usage report scaffold
  reportPreview: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    padding: 14,
    borderRadius: 8,
    border: "1px solid var(--color-border-card-soft)",
    background: "#FAFBFC",
  },
  reportColumns: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  reportCol: {
    padding: "3px 10px",
    borderRadius: 6,
    background: "#EEEEF2",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--color-text-tertiary)",
    letterSpacing: "0.2px",
  },
  reportPlaceholder: {
    fontSize: 12,
    color: "var(--color-text-tertiary)",
    fontStyle: "italic",
    paddingTop: 4,
  },

  // P1 badge
  p1Badge: {
    padding: "3px 10px",
    borderRadius: 999,
    background: "#FFF3E0",
    color: "#EF6C00",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.2px",
    whiteSpace: "nowrap",
  },

  // Action row
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    paddingTop: 4,
  },

  // Floating M1/M2 variant switcher (matches InsightsHubPage placement)
  switcherWrap: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 1000,
  },
};
