"use client";

import React from "react";
import Card from "./Card";
import Button from "./Button";
import DateRangeCalendar from "./DateRangeCalendar";

const DATE_OPTIONS = [
  { label: "Today", type: "radio" },
  { label: "Last 7 days", type: "radio" },
  { label: "Last 30 days", type: "radio" },
  { label: "Last 90 days", type: "radio" },
  { label: "Last 12 months", type: "radio" },
  { label: "Custom Date Range", type: "submenu" },
  { label: "Compare Periods", type: "special", icon: "compare_arrows" },
];

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatCustomLabel({ start, end }) {
  if (!start || !end) return "";
  const startSeg = start.getFullYear() === end.getFullYear()
    ? `${start.getDate()} ${MONTHS_SHORT[start.getMonth()]}`
    : `${start.getDate()} ${MONTHS_SHORT[start.getMonth()]} ${start.getFullYear()}`;
  return `${startSeg} – ${end.getDate()} ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`;
}

function formatCompareLabel(primary, compare) {
  const seg = (r) => `${MONTHS_SHORT[r.start.getMonth()]} ${r.start.getDate()}–${r.end.getDate()}`;
  return `${seg(primary)} vs ${seg(compare)}`;
}

export default function HeaderCard({ onFilterToggle }) {
  const [dateValue, setDateValue] = React.useState("Last 12 months");
  const [dateOpen, setDateOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    if (!dateOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDateOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dateOpen]);

  const handleSelect = (label) => { setDateValue(label); setDateOpen(false); };
  const handleApplyCustom = (range) => {
    setDateValue(formatCustomLabel(range));
    setDateOpen(false);
  };
  const handleApplyCompare = (primary, compare) => {
    setDateValue(formatCompareLabel(primary, compare));
    setDateOpen(false);
  };

  return (
    <Card>
      <div style={hcStyles.titleRow}>
        <div style={hcStyles.titleLeft}>
          <div style={hcStyles.avatar}>
            <span className="material-symbols-outlined" style={hcStyles.avatarIcon}>shield_person</span>
          </div>
          <span style={hcStyles.titleText}>Contact Center</span>
          <span className="material-symbols-outlined" style={hcStyles.chevronTitle}>expand_more</span>
        </div>
      </div>

      <div style={hcStyles.filterRow}>
        <div style={hcStyles.filterGroups}>
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <div style={hcStyles.filterGroup} onClick={() => setDateOpen(!dateOpen)}>
              <span style={hcStyles.filterLabel}>Date</span>
              <span style={hcStyles.filterValue}>{dateValue}</span>
              <span className="material-symbols-outlined" style={hcStyles.chevronFilter}>expand_more</span>
            </div>

            {dateOpen && (
              <DateDropdown
                options={DATE_OPTIONS}
                selected={dateValue}
                onSelect={handleSelect}
                onApplyCustom={handleApplyCustom}
                onApplyCompare={handleApplyCompare}
              />
            )}
          </div>

          <FilterGroup label="Workspaces" value="All" />
          <FilterGroup label="Teams" value="All" />
        </div>

        <div style={hcStyles.filterRight}>
          <div style={hcStyles.divider}></div>
          <Button
            variant="icon"
            size="lg"
            bordered
            aria-label="Toggle filters"
            onClick={onFilterToggle}
          >
            <span className="material-symbols-outlined" style={hcStyles.filterIcon}>tune</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function DateDropdown({ options, selected, onSelect, onApplyCustom, onApplyCompare }) {
  const [hoveredIdx, setHoveredIdx] = React.useState(-1);
  const [activeFlyout, setActiveFlyout] = React.useState("none"); // "none" | "custom" | "compare"

  const handleRowClick = (opt) => {
    if (opt.type === "radio") {
      onSelect(opt.label);
      return;
    }
    if (opt.type === "submenu") {
      setActiveFlyout(activeFlyout === "custom" ? "none" : "custom");
    } else if (opt.type === "special") {
      setActiveFlyout(activeFlyout === "compare" ? "none" : "compare");
    }
  };

  return (
    <>
      <div style={ddStyles.container}>
        <div style={ddStyles.list}>
          {options.map((opt, i) => {
            const isSelected = selected === opt.label;
            const isHovered = hoveredIdx === i;
            const isOpenFlyout =
              (opt.type === "submenu" && activeFlyout === "custom") ||
              (opt.type === "special" && activeFlyout === "compare");
            const bg = isOpenFlyout
              ? "var(--pill-bg)"
              : isHovered
              ? "#F6F5FA"
              : "transparent";
            return (
              <div
                key={opt.label}
                style={{ ...ddStyles.row, background: bg }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(-1)}
                onClick={() => handleRowClick(opt)}
              >
                {opt.type === "special" ? (
                  <span className="material-symbols-outlined" style={ddStyles.specialIcon}>{opt.icon}</span>
                ) : (
                  <div style={{
                    ...ddStyles.radio,
                    borderColor: isSelected ? "#245BFF" : "#8C90A6",
                    background: isSelected ? "#245BFF" : "transparent",
                  }}>
                    {isSelected && <div style={ddStyles.radioDot}></div>}
                  </div>
                )}

                <span style={{
                  ...ddStyles.label,
                  fontWeight: isSelected || isOpenFlyout ? 600 : 400,
                }}>
                  {opt.label}
                </span>

                {(opt.type === "submenu" || opt.type === "special") && (
                  <span className="material-symbols-outlined" style={ddStyles.chevronRight}>chevron_right</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {activeFlyout === "custom" && (
        <CustomRangeFlyout
          onCancel={() => setActiveFlyout("none")}
          onApply={(range) => { onApplyCustom(range); setActiveFlyout("none"); }}
        />
      )}

      {activeFlyout === "compare" && (
        <ComparePeriodsFlyout
          onCancel={() => setActiveFlyout("none")}
          onApply={(primary, compare) => { onApplyCompare(primary, compare); setActiveFlyout("none"); }}
        />
      )}
    </>
  );
}

function CustomRangeFlyout({ onCancel, onApply }) {
  const today = new Date();
  const [range, setRange] = React.useState({ start: null, end: null });
  const [month, setMonth] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const hasSelection = !!range.start;
  const isValid = !!(range.start && range.end);

  const handleReset = () => setRange({ start: null, end: null });

  return (
    <div style={ddStyles.flyout}>
      <DateRangeCalendar
        value={range}
        onChange={setRange}
        month={month}
        onMonthChange={setMonth}
      />
      <FlyoutFooter
        primaryLabel="Apply"
        onPrimary={isValid ? () => onApply(range) : undefined}
        primaryDisabled={!isValid}
        onCancel={onCancel}
        onReset={hasSelection ? handleReset : undefined}
        resetDisabled={!hasSelection}
      />
    </div>
  );
}

function ComparePeriodsFlyout({ onCancel, onApply }) {
  const today = new Date();
  const [step, setStep] = React.useState("primary"); // "primary" | "compare"
  const [primary, setPrimary] = React.useState({ start: null, end: null });
  const [compare, setCompare] = React.useState({ start: null, end: null });
  const [month, setMonth] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const activeValue = step === "primary" ? primary : compare;
  const setActiveValue = step === "primary" ? setPrimary : setCompare;

  const primaryValid = !!(primary.start && primary.end);
  const compareValid = !!(compare.start && compare.end);
  const stepValid = step === "primary" ? primaryValid : compareValid;
  const hasAny = !!(primary.start || compare.start);

  const handleReset = () => {
    setPrimary({ start: null, end: null });
    setCompare({ start: null, end: null });
    setStep("primary");
  };

  const handlePrimary = () => {
    if (step === "primary") setStep("compare");
    else onApply(primary, compare);
  };

  const hintText = step === "primary"
    ? "Select your primary date range below."
    : "Select your comparison date range below.";

  return (
    <div style={ddStyles.flyout}>
      <div style={ddStyles.compareTop}>
        <div style={ddStyles.compareTitle}>Compare Periods</div>
        <div style={ddStyles.periodRow}>
          <PeriodCard
            label="Primary Period"
            range={primary}
            active={step === "primary"}
            disabled={false}
          />
          <PeriodCard
            label="Compare Against"
            range={compare}
            active={step === "compare"}
            disabled={step === "primary" && !primaryValid}
          />
        </div>
        <div style={ddStyles.hintBanner}>
          <span style={ddStyles.hintText}>{hintText}</span>
        </div>
      </div>

      <DateRangeCalendar
        value={activeValue}
        onChange={setActiveValue}
        month={month}
        onMonthChange={setMonth}
      />

      <FlyoutFooter
        primaryLabel={step === "primary" ? "Next" : "Apply"}
        onPrimary={stepValid ? handlePrimary : undefined}
        primaryDisabled={!stepValid}
        onCancel={onCancel}
        onReset={hasAny ? handleReset : undefined}
        resetDisabled={!hasAny}
      />
    </div>
  );
}

function PeriodCard({ label, range, active, disabled }) {
  const valueText = range.start && range.end
    ? formatCustomLabel(range)
    : "Select dates";
  return (
    <div style={{
      ...ddStyles.periodCard,
      borderColor: active ? "var(--color-button-primary-bg)" : "var(--color-border-tab)",
      opacity: disabled ? 0.5 : 1,
    }}>
      <div style={ddStyles.periodLabel}>{label}</div>
      <div style={{
        ...ddStyles.periodValue,
        color: range.start && range.end
          ? "var(--color-text-deep)"
          : "var(--color-text-tertiary)",
      }}>
        {valueText}
      </div>
    </div>
  );
}

function FlyoutFooter({ primaryLabel, onPrimary, primaryDisabled, onCancel, onReset, resetDisabled }) {
  return (
    <div style={ddStyles.footer}>
      <Button
        variant="text"
        uppercase={false}
        disabled={resetDisabled}
        onClick={onReset}
      >
        Reset
      </Button>
      <div style={ddStyles.footerRight}>
        <Button variant="text" uppercase={false} onClick={onCancel}>Cancel</Button>
        <Button
          variant="text"
          uppercase={false}
          disabled={primaryDisabled}
          onClick={onPrimary}
          style={{ color: primaryDisabled ? undefined : "var(--color-button-primary-bg)", fontWeight: 700 }}
        >
          {primaryLabel}
        </Button>
      </div>
    </div>
  );
}

function FilterGroup({ label, value }) {
  return (
    <div style={hcStyles.filterGroup}>
      <span style={hcStyles.filterLabel}>{label}</span>
      <span style={hcStyles.filterValue}>{value}</span>
      <span className="material-symbols-outlined" style={hcStyles.chevronFilter}>expand_more</span>
    </div>
  );
}

const ddStyles = {
  container: {
    position: "absolute", top: "calc(100% + 8px)", left: 0, width: 320,
    background: "#FFFFFF", borderRadius: 12,
    boxShadow: "0px 5px 5px -3px rgba(0,0,0,0.20), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)",
    zIndex: 50, overflow: "hidden",
  },
  list: { padding: "4px 0" },
  row: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "14px 20px", cursor: "pointer", transition: "background 150ms",
  },
  radio: {
    width: 20, height: 20, borderRadius: 10, border: "2px solid #8C90A6",
    display: "grid", placeItems: "center", flexShrink: 0, boxSizing: "border-box",
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, background: "#FFFFFF" },
  specialIcon: {
    fontSize: 20, color: "var(--do-ink)",
    fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24",
  },
  label: {
    fontFamily: '"Mulish", sans-serif', fontSize: 15, color: "var(--do-ink)",
    flex: 1, lineHeight: 1.4,
  },
  chevronRight: {
    fontSize: 20, color: "var(--color-text-tertiary)",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  },

  flyout: {
    position: "absolute", top: "calc(100% + 8px)", left: 336, width: 391,
    background: "#FFFFFF", borderRadius: 12,
    border: "1px solid var(--color-border-tab)",
    boxShadow: "0px 2px 4px rgba(69,70,79,0.15)",
    zIndex: 50, overflow: "hidden",
    display: "flex", flexDirection: "column",
  },
  compareTop: {
    display: "flex", flexDirection: "column", gap: 12,
    padding: "16px 16px 8px",
  },
  compareTitle: {
    fontFamily: '"Mulish", sans-serif', fontSize: 12, fontWeight: 700,
    color: "var(--color-text-medium)", letterSpacing: "0.04em",
  },
  periodRow: { display: "flex", gap: 12 },
  periodCard: {
    flex: 1,
    display: "flex", flexDirection: "column", gap: 2,
    padding: 8, borderRadius: 4,
    border: "1px solid var(--color-border-tab)",
    background: "#FFFFFF",
    transition: "border-color 150ms, opacity 150ms",
  },
  periodLabel: {
    fontFamily: '"Mulish", sans-serif', fontSize: 11, fontWeight: 500,
    color: "var(--color-text-medium)",
  },
  periodValue: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 600,
  },
  hintBanner: {
    padding: "8px 12px", borderRadius: 4,
    background: "var(--color-card-emoji-bg)",
  },
  hintText: {
    fontFamily: '"Mulish", sans-serif', fontSize: 12, fontWeight: 400,
    color: "var(--color-text-medium)",
  },

  footer: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: 12,
    borderTop: "1px solid var(--color-border-tab)",
  },
  footerRight: { display: "flex", alignItems: "center", gap: 8 },
};

const hcStyles = {
  titleRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  titleLeft: { display: "flex", alignItems: "center", gap: 0 },
  avatar: {
    width: 32, height: 32, borderRadius: 16, background: "#E8ECFF",
    display: "grid", placeItems: "center", flexShrink: 0, marginRight: 12,
  },
  avatarIcon: {
    fontSize: 18, color: "#245BFF",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  },
  titleText: {
    fontFamily: '"Mulish", sans-serif', fontSize: 16, fontWeight: 600,
    color: "#1F232A", lineHeight: 1.4, marginRight: 6,
  },
  chevronTitle: {
    fontSize: 18, color: "#8C90A6",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  },
  filterRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  filterGroups: { display: "flex", alignItems: "center", gap: 32 },
  filterGroup: { display: "flex", alignItems: "center", gap: 6, cursor: "pointer" },
  filterLabel: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 400,
    color: "#8C90A6", lineHeight: 1.4,
  },
  filterValue: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 600,
    color: "#1F232A", lineHeight: 1.4,
  },
  chevronFilter: {
    fontSize: 14, color: "#AAB2C5",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  },
  filterRight: { display: "flex", alignItems: "center", gap: 16 },
  divider: { width: 1, height: 24, background: "#E8ECFF" },
  filterIcon: {
    fontSize: 20, color: "#5A5D72",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
  },
};
