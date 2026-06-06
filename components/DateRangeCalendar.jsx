"use client";

import React from "react";

// DateRangeCalendar — single-month range picker.
//
// Click a day to set the start; a second click sets the end (auto-swapped
// if earlier than start). Re-clicking when both endpoints are set resets
// to a new start.
//
// Props:
//   value     { start: Date|null, end: Date|null }
//   onChange  (next) => void
//   month     Date — controlled anchor day of the visible month.
//   onMonthChange (next: Date) => void
//   disableAfter Date|null — last selectable day. Defaults to today; pass
//                            null to allow future dates.

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function sameDay(a, b) {
  return a && b
    && a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}
function strictlyBetween(day, a, b) {
  if (!a || !b) return false;
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  return day > lo && day < hi;
}

export default function DateRangeCalendar({
  value,
  onChange,
  month,
  onMonthChange,
  disableAfter,
}) {
  const today = startOfDay(new Date());
  const max = disableAfter === null ? null : (disableAfter ? startOfDay(disableAfter) : today);
  const anchor = month || value.start || today;

  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const offset = monthStart.getDay();
  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const dayNum = i - offset + 1;
    if (dayNum < 1 || dayNum > monthEnd.getDate()) cells.push(null);
    else cells.push(new Date(anchor.getFullYear(), anchor.getMonth(), dayNum));
  }

  const goMonth = (delta) => {
    const next = new Date(anchor.getFullYear(), anchor.getMonth() + delta, 1);
    onMonthChange?.(next);
  };

  const handleDay = (day) => {
    if (!day) return;
    if (max && day > max) return;
    const { start, end } = value;
    if (!start || (start && end)) {
      onChange({ start: day, end: null });
      return;
    }
    if (day < start) onChange({ start: day, end: start });
    else onChange({ start, end: day });
  };

  return (
    <div style={cStyles.root}>
      <div style={cStyles.header}>
        <div style={cStyles.monthLabelWrap}>
          <span style={cStyles.monthLabel}>
            {MONTHS_LONG[anchor.getMonth()]} {anchor.getFullYear()}
          </span>
          <span className="material-symbols-outlined" style={cStyles.monthChevron}>expand_more</span>
        </div>
        <div style={cStyles.nav}>
          <button
            type="button"
            onClick={() => goMonth(-1)}
            aria-label="Previous month"
            style={cStyles.navBtn}
          >
            <span className="material-symbols-outlined" style={cStyles.navIcon}>chevron_left</span>
          </button>
          <button
            type="button"
            onClick={() => goMonth(1)}
            aria-label="Next month"
            style={cStyles.navBtn}
          >
            <span className="material-symbols-outlined" style={cStyles.navIcon}>chevron_right</span>
          </button>
        </div>
      </div>

      <div style={cStyles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <div key={i} style={cStyles.weekCell}>{w}</div>
        ))}
      </div>

      <div style={cStyles.grid}>
        {cells.map((day, i) => (
          <DayCell
            key={i}
            day={day}
            isStart={day && sameDay(day, value.start)}
            isEnd={day && sameDay(day, value.end)}
            isInRange={day && strictlyBetween(day, value.start, value.end)}
            disabled={day && max && day > max}
            onClick={() => handleDay(day)}
          />
        ))}
      </div>
    </div>
  );
}

function DayCell({ day, isStart, isEnd, isInRange, disabled, onClick }) {
  const [hover, setHover] = React.useState(false);
  if (!day) return <div style={cStyles.cell} />;
  const isEndpoint = isStart || isEnd;
  const isSingleDay = isStart && isEnd;
  const showLeftBand = isInRange || (isEnd && !isSingleDay);
  const showRightBand = isInRange || (isStart && !isSingleDay);
  return (
    <div
      style={cStyles.cell}
      onMouseEnter={() => !disabled && setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {showLeftBand && <div style={cStyles.bandLeft} />}
      {showRightBand && <div style={cStyles.bandRight} />}
      <button
        type="button"
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
        style={{
          ...cStyles.dayBtn,
          background: isEndpoint
            ? "var(--color-button-primary-bg)"
            : hover && !disabled
            ? "var(--pill-bg)"
            : "transparent",
          color: isEndpoint
            ? "var(--color-button-primary-fg)"
            : disabled
            ? "var(--color-text-tertiary)"
            : "var(--do-ink)",
          opacity: disabled ? 0.38 : 1,
        }}
      >
        {day.getDate()}
      </button>
    </div>
  );
}

const cStyles = {
  root: { display: "flex", flexDirection: "column", width: "100%" },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 12px",
  },
  monthLabelWrap: { display: "flex", alignItems: "center", gap: 4 },
  monthLabel: {
    fontFamily: '"Mulish", sans-serif', fontSize: 13, fontWeight: 700,
    color: "var(--do-ink)", letterSpacing: "0.04em",
  },
  monthChevron: {
    fontSize: 16, color: "var(--color-text-medium)",
    fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20",
  },
  nav: { display: "flex", alignItems: "center", gap: 4 },
  navBtn: {
    width: 28, height: 28, borderRadius: 14, border: "none",
    background: "transparent", display: "grid", placeItems: "center",
    cursor: "pointer", padding: 0, color: "var(--color-text-medium)",
  },
  navIcon: {
    fontSize: 18, color: "currentColor",
    fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20",
  },
  weekRow: {
    display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
    padding: "0 12px",
  },
  weekCell: {
    textAlign: "center", fontFamily: '"Mulish", sans-serif',
    fontSize: 11, fontWeight: 700, color: "var(--color-text-tertiary)",
    padding: "6px 0",
  },
  grid: {
    display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
    padding: "0 12px 12px",
  },
  cell: { height: 36, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
  bandLeft: {
    position: "absolute", left: 0, right: "50%", top: "50%",
    height: 28, transform: "translateY(-50%)",
    background: "var(--pill-bg)",
  },
  bandRight: {
    position: "absolute", left: "50%", right: 0, top: "50%",
    height: 28, transform: "translateY(-50%)",
    background: "var(--pill-bg)",
  },
  dayBtn: {
    position: "relative", zIndex: 1,
    width: 28, height: 28, borderRadius: 14, border: "none",
    padding: 0, cursor: "pointer",
    fontFamily: '"Mulish", sans-serif', fontSize: 12, fontWeight: 600,
    display: "grid", placeItems: "center",
    transition: "background 120ms",
  },
};
